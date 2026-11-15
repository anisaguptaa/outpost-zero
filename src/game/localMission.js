import SCENARIO from '../../data/scenarios/mars-first-light.json';

const SAVE_KEY = 'outpost-zero.local-flight.v1';
const clamp = (value) => Math.max(0, Math.min(100, value));
const copy = (value) => JSON.parse(JSON.stringify(value));

function availableActions(state) {
  if (state.status !== 'active') return [];
  let options;
  if (state.activeEvent) {
    const event = SCENARIO.events.find((item) => item.id === state.activeEvent.id);
    options = event.choices.map((choice) => ({ ...choice, id: `event:${event.id}:${choice.id}`, isEventChoice: true, eventId: event.id, eventTitle: event.title }));
  } else options = state.day === 1 ? SCENARIO.firstActions : SCENARIO.dailyActions;
  return options.filter((action) => {
    const building = action.requiresBuilding && state.buildings.find((item) => item.id === action.requiresBuilding.id);
    if (action.requiresBuilding && (!building || building.status !== action.requiresBuilding.status)) return false;
    if (action.minResource && state.resources[action.minResource.key] < action.minResource.value) return false;
    if (action.minResourceSecondary && state.resources[action.minResourceSecondary.key] < action.minResourceSecondary.value) return false;
    if (action.maxResource && state.resources[action.maxResource.key] >= action.maxResource.value) return false;
    if ((action.requiresResources || []).some((item) => state.resources[item.key] < item.minimum)) return false;
    const { requiresBuilding, minResource, minResourceSecondary, maxResource, requiresResources, ...visible } = action;
    return visible;
  });
}

function createSnapshot(sessionId, profile = {}, seed = 2026) {
  const kit = SCENARIO.starterKits.find((item) => item.id === profile.starterKit) || SCENARIO.starterKits[0];
  const inventory = copy(SCENARIO.startingInventory);
  Object.entries(kit.inventory).forEach(([key, amount]) => { inventory[key] = (inventory[key] || 0) + amount; });
  const state = {
    missionId: sessionId, sessionId, scenarioId: SCENARIO.id, destination: 'Mars', day: 1, durationDays: SCENARIO.durationDays, seed,
    resources: copy(SCENARIO.initialResources), buildings: copy(SCENARIO.buildings), inventory,
    starterKits: copy(SCENARIO.starterKits), profile: { callsign: String(profile.callsign || 'Cadet').slice(0, 16), avatarId: profile.avatarId || 'ember', starterKit: kit.id, destination: 'mars', playMode: profile.playMode === 'crew-coop' ? 'crew-coop' : 'solo', partnerCallsign: String(profile.partnerCallsign || 'Crewmate').slice(0, 16) },
    gatherNodes: copy(SCENARIO.gatherNodes), hazardsEntered: {}, buildCosts: copy(SCENARIO.buildCosts), hazardZones: copy(SCENARIO.hazardZones),
    powerMode: 'balanced', events: [{ id: 'touchdown', day: 1, text: 'Touchdown confirmed. The crew is at the outpost.' }], status: 'active',
    lastOutcome: null, activeEvent: null, branches: [], delayedEffects: [], debrief: null,
  };
  state.availableActions = availableActions(state);
  return state;
}

function save(state) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ sessionId: state.sessionId, snapshot: state }));
  return state;
}

function assertTurn(state, expectedDay) {
  if (!state || state.status !== 'active') throw new Error('This mission has ended. Start a new flight to play again.');
  if (state.day !== expectedDay) throw new Error('The sol advanced. Refresh the outpost before choosing again.');
}

function eligible(state, event) {
  return (event.prerequisites || []).every((item) => {
    if (item.type === 'building') return state.buildings.some((building) => building.id === item.id && building.status === item.status);
    if (item.type === 'resource') return state.resources[item.key] >= item.minimum;
    return true;
  });
}

function finish(state, beforeDay) {
  if (beforeDay >= state.durationDays) {
    state.status = 'completed';
    const safe = state.resources.oxygen > 0 && state.resources.crewWellbeing > 0;
    const habitatReady = state.resources.habitatIntegrity >= 50;
    const scienceComplete = state.resources.scienceProgress >= 40;
    let endingId, title, text;
    if (!safe) { endingId = 'emergency-return'; title = 'Emergency return recommended'; text = 'The crew’s modeled safety reserve ran low. Mission Control prioritizes a safe return and a systems review.'; }
    else if (habitatReady && scienceComplete) { endingId = 'full-success'; title = 'First Light: science mission complete'; text = 'The crew kept the habitat stable and completed a strong soil study. The outpost is ready for another mission.'; }
    else if (habitatReady) { endingId = 'safe-outpost'; title = 'First Light: safe outpost, study continues'; text = 'The crew maintained a stable outpost. The soil study needs another mission window.'; }
    else { endingId = 'partial-success'; title = 'First Light: lessons secured'; text = 'The crew recovered useful lessons and returned safely. Mission Control has a clear list of systems to improve.'; }
    state.debrief = { endingId, title, text, objectives: [{ id: 'crew-safe', title: 'Protect the crew', complete: safe }, { id: 'habitat-stable', title: 'Keep the habitat stable', complete: habitatReady }, { id: 'soil-study', title: 'Complete the soil study', complete: scienceComplete }], branches: copy(state.branches), finalResources: copy(state.resources) };
    state.lastOutcome = { ...state.lastOutcome, text: `${state.lastOutcome?.text || ''} ${title}. ${text}`.trim() };
  } else {
    state.day = beforeDay + 1;
    const eventIds = SCENARIO.eventSchedule[String(state.day)] || [];
    if (eventIds.length) {
      let pool = SCENARIO.events.filter((item) => eventIds.includes(item.id) && eligible(state, item));
      if (!pool.length) pool = [SCENARIO.events.find((item) => item.id === eventIds[eventIds.length - 1])];
      const event = pool[Math.abs(state.seed * 31 + state.day * 17) % pool.length];
      state.activeEvent = { id: event.id, title: event.title, trigger: event.trigger, day: state.day };
      state.events.push({ id: `event-${event.id}`, day: state.day, kind: 'event', text: `${event.title}: ${event.trigger}` });
    }
  }
  state.availableActions = availableActions(state);
  return save(state);
}

function choose(snapshot, actionId, expectedDay, placement, crewRole) {
  assertTurn(snapshot, expectedDay);
  const action = availableActions(snapshot).find((item) => item.id === actionId);
  if (!action) throw new Error('That action is not available with the current outpost and supplies.');
  const state = copy(snapshot);
  const beforeDay = state.day;
  const resources = state.resources;
  const targetId = action.buildingStatus === 'online' ? action.buildingId : null;
  const cost = targetId && SCENARIO.buildCosts[targetId];
  if (cost) {
    if (!placement || !(placement.x >= 0.08 && placement.x <= 0.92 && placement.y >= 0.33 && placement.y <= 0.91)) throw new Error('Choose a clear build tile before confirming this structure.');
    if (Object.entries(cost).some(([item, amount]) => (state.inventory[item] || 0) < amount)) throw new Error('Gather the required materials before placing this structure.');
    if (state.buildings.some((building) => building.id !== targetId && building.status === 'online' && Math.abs(building.x - placement.x) < 0.09 && Math.abs(building.y - placement.y) < 0.12)) throw new Error('That tile is occupied. Pick another clear patch of ground.');
    if (state.gatherNodes.some((node) => node.amount > 0 && Math.abs(node.x - placement.x) < 0.06 && Math.abs(node.y - placement.y) < 0.08)) throw new Error('A resource deposit occupies that tile. Choose another tile.');
    Object.entries(cost).forEach(([item, amount]) => { state.inventory[item] -= amount; });
  }
  if (action.isEventChoice) {
    Object.entries(action.effects || {}).forEach(([key, delta]) => { resources[key] = clamp((resources[key] || 0) + delta); });
    (action.delayedEffects || []).forEach((item) => state.delayedEffects.push({ dueDay: beforeDay + item.days, effects: item.effects, text: item.text }));
    state.branches.push({ day: beforeDay, eventId: action.eventId, eventTitle: action.eventTitle, branch: action.branch, choice: action.title });
    state.events.push({ id: actionId, day: beforeDay, kind: 'branch', text: action.log });
    state.activeEvent = null;
    state.lastOutcome = { actionId, title: action.title, text: action.log, kind: 'branch' };
    state.availableActions = availableActions(state);
    return save(state);
  }
  const pending = [];
  state.delayedEffects.forEach((item) => {
    if (item.dueDay <= beforeDay) {
      Object.entries(item.effects).forEach(([key, delta]) => { resources[key] = clamp((resources[key] || 0) + delta); });
      state.events.push({ id: `delayed-${item.dueDay}-${state.events.length}`, day: beforeDay, kind: 'delayed', text: item.text });
    } else pending.push(item);
  });
  state.delayedEffects = pending;
  Object.entries(action.effects || {}).forEach(([key, delta]) => { resources[key] = clamp((resources[key] || 0) + delta); });
  if (crewRole === 'mika' && targetId) resources.habitatIntegrity = clamp(resources.habitatIntegrity + 3);
  if (crewRole === 'sol' && /rover|signal|sample/.test(actionId)) resources.scienceProgress = clamp(resources.scienceProgress + 6);
  state.crewAssignment = crewRole || null;
  if (action.buildingId && action.buildingStatus) {
    const building = state.buildings.find((item) => item.id === action.buildingId);
    building.status = action.buildingStatus;
    if (cost && placement) { building.x = placement.x; building.y = placement.y; }
    if (action.activationDelayDays) building.onlineFromDay = beforeDay + action.activationDelayDays;
  }
  if (crewRole) state.events.push({ id: `crew-${crewRole}-${beforeDay}`, day: beforeDay, kind: 'crew', text: `${crewRole === 'pip' ? 'PIP-3' : crewRole} joined the commander for ${action.title.toLowerCase()}.` });
  if (action.setPowerMode) state.powerMode = action.setPowerMode;
  const daily = SCENARIO.dailyResolution;
  const online = new Set(state.buildings.filter((item) => item.status === 'online' && (item.onlineFromDay || 1) <= beforeDay).map((item) => item.id));
  const solar = online.has('solar-array') ? daily.solarGeneration : 0;
  const priority = state.powerMode === 'life-support' ? daily.lifeSupportPriorityPower : state.powerMode === 'research' ? daily.researchPriorityPower : 0;
  if (state.powerMode === 'research') resources.scienceProgress = clamp(resources.scienceProgress + daily.researchScience);
  const loads = (online.has('life-support') ? daily.lifeSupportPowerUse : 0) + (online.has('greenhouse') ? daily.greenhousePowerUse : 0) + (online.has('storm-shelter') ? daily.shelterPowerUse : 0);
  resources.power = clamp(resources.power + daily.powerBase + solar + priority + loads);
  const powerOkay = resources.power >= daily.minimumPowerForOxygen;
  let oxygen = powerOkay ? daily.oxygen : daily.oxygenLowPower;
  if (online.has('life-support') && powerOkay) oxygen += daily.lifeSupportOxygenRecovery;
  if (state.powerMode === 'life-support' && powerOkay) oxygen += daily.lifeSupportPriorityOxygen;
  resources.oxygen = clamp(resources.oxygen + oxygen);
  resources.water = clamp(resources.water + daily.water + (online.has('life-support') ? daily.lifeSupportWaterRecovery : 0) + (online.has('greenhouse') ? daily.greenhouseWaterUse : 0));
  resources.food = clamp(resources.food + daily.food + (online.has('greenhouse') ? daily.greenhouseFood : 0));
  resources.radiationRisk = clamp(resources.radiationRisk + daily.radiationRiskDaily - (online.has('storm-shelter') ? daily.shelterRiskReduction : 0));
  resources.crewWellbeing = clamp(resources.crewWellbeing + daily.crewWellbeing + (resources.radiationRisk >= daily.crewRiskPenaltyThreshold ? daily.crewRiskPenalty : 0));
  resources.habitatIntegrity = clamp(resources.habitatIntegrity + daily.habitatIntegrity);
  const summary = `Sol ${beforeDay} systems check (game units): power ${resources.power}, oxygen ${resources.oxygen}, water ${resources.water}, food ${resources.food}, crew ${resources.crewWellbeing}, habitat ${resources.habitatIntegrity}, exposure risk ${resources.radiationRisk}, science ${resources.scienceProgress}.`;
  state.events.push({ id: actionId, day: beforeDay, text: action.log }, { id: `systems-check-${beforeDay}`, day: beforeDay, text: summary });
  state.lastOutcome = { actionId, title: action.title, text: `${action.log} ${summary}` };
  return finish(state, beforeDay);
}

export const localMission = {
  start(profile) { return save({ ...createSnapshot(`local-${crypto.randomUUID()}`, profile, 2026), serviceMode: 'local' }); },
  cache(snapshot) { return save(snapshot); },
  read(sessionId) {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (!saved || saved.sessionId !== sessionId) throw new Error('No local copy of this flight is available.');
    return saved.snapshot;
  },
  act(snapshot, actionId, placement, crewRole) { return choose(snapshot, actionId, snapshot.day, placement, crewRole); },
  gather(snapshot, nodeId, crewRole) {
    assertTurn(snapshot, snapshot.day);
    const state = copy(snapshot);
    const node = state.gatherNodes.find((item) => item.id === nodeId && item.amount > 0);
    if (!node) throw new Error('This deposit is depleted. Search another nearby tile.');
    const amount = Math.min(node.amount, crewRole === 'pip' ? 2 : 1);
    node.amount -= amount;
    state.inventory[node.kind] = (state.inventory[node.kind] || 0) + amount;
    const text = `Collected ${amount} ${node.kind} from ${node.label}.`;
    state.events.push({ id: `gather-${nodeId}-${state.events.length}`, day: state.day, kind: 'gather', text });
    state.lastOutcome = { actionId: `gather-${nodeId}`, title: `Collected ${node.kind}`, text };
    return save(state);
  },
  hazard(snapshot, zoneId, position) {
    assertTurn(snapshot, snapshot.day);
    const zone = SCENARIO.hazardZones.find((item) => item.id === zoneId && item.sols.includes(snapshot.day));
    if (!zone || Math.hypot(position.x - zone.x, position.y - zone.y) > zone.radius) throw new Error('Move into the marked hazard area before applying its effects.');
    const state = copy(snapshot);
    const entered = state.hazardsEntered[String(state.day)] ||= [];
    if (entered.includes(zoneId)) return state;
    entered.push(zoneId);
    Object.entries(zone.effects).forEach(([key, delta]) => { state.resources[key] = clamp((state.resources[key] || 0) + delta); });
    state.events.push({ id: `hazard-${zoneId}-sol-${state.day}`, day: state.day, kind: 'hazard', text: zone.log });
    state.lastOutcome = { actionId: `hazard-${zoneId}`, title: zone.name, text: zone.log };
    return save(state);
  },
};
