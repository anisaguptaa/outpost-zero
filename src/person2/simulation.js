import { MARS_FIRST_LIGHT } from './scenario';

const clamp = (value) => Math.max(0, Math.min(100, value));

export function availableActions(snapshot) {
  if (snapshot.status !== 'active') return [];
  let options;
  if (snapshot.activeEvent) {
    const event = MARS_FIRST_LIGHT.events.find((item) => item.id === snapshot.activeEvent.id);
    options = (event?.choices || []).map((choice) => ({ ...choice, id: `event:${event.id}:${choice.id}`, isEventChoice: true, eventId: event.id, eventTitle: event.title }));
  } else options = snapshot.day === 1 ? MARS_FIRST_LIGHT.firstActions : MARS_FIRST_LIGHT.dailyActions;
  return options.filter((action) => {
    const required = action.requiresBuilding && snapshot.buildings.find((item) => item.id === action.requiresBuilding.id);
    if (action.requiresBuilding && (!required || required.status !== action.requiresBuilding.status)) return false;
    if (action.minResource && snapshot.resources[action.minResource.key] < action.minResource.value) return false;
    if (action.minResourceSecondary && snapshot.resources[action.minResourceSecondary.key] < action.minResourceSecondary.value) return false;
    if (action.maxResource && snapshot.resources[action.maxResource.key] >= action.maxResource.value) return false;
    if ((action.requiresResources || []).some((requirement) => snapshot.resources[requirement.key] < requirement.minimum)) return false;
    return true;
  }).map(({ requiresBuilding, minResource, minResourceSecondary, maxResource, requiresResources, ...action }) => action);
}

export function createInitialSnapshot(sessionId = `local-${Date.now()}`, seed = 2026) {
  const snapshot = {
    missionId: sessionId, scenarioId: MARS_FIRST_LIGHT.id, destination: MARS_FIRST_LIGHT.destination,
    day: 1, durationDays: MARS_FIRST_LIGHT.durationDays, seed,
    resources: { ...MARS_FIRST_LIGHT.initialResources },
    buildings: MARS_FIRST_LIGHT.buildings.map((item) => ({ ...item })),
    powerMode: 'balanced', events: [{ id: 'touchdown', day: 1, text: 'Touchdown confirmed. The crew is at the outpost.' }],
    status: 'active', lastOutcome: null, activeEvent: null, branches: [], delayedEffects: [], debrief: null,
  };
  snapshot.availableActions = availableActions(snapshot);
  return snapshot;
}

export function resolveAction(snapshot, actionId, expectedDay = snapshot.day) {
  if (snapshot.status !== 'active') throw new Error('This mission has already ended. Restart to play again.');
  if (expectedDay !== snapshot.day) throw new Error('This mission has advanced. Refresh the outpost before choosing again.');
  const action = availableActions(snapshot).find((item) => item.id === actionId);
  if (!action) throw new Error('That action is not available with the current outpost systems and supplies.');
  const state = structuredClone(snapshot);
  const beforeDay = state.day;
  const resources = state.resources;
  if (action.isEventChoice) {
    for (const [key, delta] of Object.entries(action.effects || {})) resources[key] = clamp((resources[key] || 0) + delta);
    for (const delayed of action.delayedEffects || []) state.delayedEffects.push({ dueDay: beforeDay + delayed.days, effects: delayed.effects, text: delayed.text });
    state.branches.push({ day: beforeDay, eventId: action.eventId, eventTitle: action.eventTitle, branch: action.branch, choice: action.title });
    state.events.push({ id: action.id, day: beforeDay, kind: 'branch', text: action.log });
    state.activeEvent = null;
    state.lastOutcome = { actionId, title: action.title, text: action.log, kind: 'branch' };
    state.availableActions = availableActions(state);
    return state;
  }
  const pending = [];
  for (const effect of state.delayedEffects) {
    if (effect.dueDay <= beforeDay) {
      for (const [key, delta] of Object.entries(effect.effects)) resources[key] = clamp((resources[key] || 0) + delta);
      state.events.push({ id: `delayed-${effect.dueDay}-${state.events.length}`, day: beforeDay, kind: 'delayed', text: effect.text });
    } else pending.push(effect);
  }
  state.delayedEffects = pending;
  for (const [key, delta] of Object.entries(action.effects || {})) resources[key] = clamp((resources[key] || 0) + delta);
  if (action.buildingId && action.buildingStatus) {
    const building = state.buildings.find((item) => item.id === action.buildingId);
    if (building) {
      building.status = action.buildingStatus;
      if (action.activationDelayDays) building.onlineFromDay = beforeDay + action.activationDelayDays;
    }
  }
  if (action.setPowerMode) state.powerMode = action.setPowerMode;
  const daily = MARS_FIRST_LIGHT.dailyResolution;
  const online = new Set(state.buildings.filter((item) => item.status === 'online' && (item.onlineFromDay || 1) <= beforeDay).map((item) => item.id));
  const solarOnline = online.has('solar-array');
  const modeDelta = state.powerMode === 'life-support' ? daily.lifeSupportPriorityPower : state.powerMode === 'research' ? daily.researchPriorityPower : 0;
  if (state.powerMode === 'research') resources.scienceProgress = clamp(resources.scienceProgress + daily.researchScience);
  const structureLoads = (online.has('life-support') ? daily.lifeSupportPowerUse : 0)
    + (online.has('greenhouse') ? daily.greenhousePowerUse : 0)
    + (online.has('storm-shelter') ? daily.shelterPowerUse : 0);
  resources.power = clamp(resources.power + daily.powerBase + (solarOnline ? daily.solarGeneration : 0) + modeDelta + structureLoads);
  let oxygenDelta = resources.power >= daily.minimumPowerForOxygen ? daily.oxygen : daily.oxygenLowPower;
  if (online.has('life-support') && resources.power >= daily.minimumPowerForOxygen) oxygenDelta += daily.lifeSupportOxygenRecovery;
  if (state.powerMode === 'life-support' && resources.power >= daily.minimumPowerForOxygen) oxygenDelta += daily.lifeSupportPriorityOxygen;
  resources.oxygen = clamp(resources.oxygen + oxygenDelta);
  let waterDelta = daily.water;
  if (online.has('life-support')) waterDelta += daily.lifeSupportWaterRecovery;
  if (online.has('greenhouse')) waterDelta += daily.greenhouseWaterUse;
  resources.water = clamp(resources.water + waterDelta);
  const greenhouseOnline = online.has('greenhouse');
  resources.food = clamp(resources.food + daily.food + (greenhouseOnline ? daily.greenhouseFood : 0));
  const riskDelta = daily.radiationRiskDaily - (online.has('storm-shelter') ? daily.shelterRiskReduction : 0);
  resources.radiationRisk = clamp(resources.radiationRisk + riskDelta);
  const wellbeingDelta = daily.crewWellbeing + (resources.radiationRisk >= daily.crewRiskPenaltyThreshold ? daily.crewRiskPenalty : 0);
  resources.crewWellbeing = clamp(resources.crewWellbeing + wellbeingDelta);
  resources.habitatIntegrity = clamp(resources.habitatIntegrity + daily.habitatIntegrity);
  const summary = `Sol ${beforeDay} systems check (game units): power ${resources.power}, oxygen ${resources.oxygen}, water ${resources.water}, food ${resources.food}, crew ${resources.crewWellbeing}, habitat ${resources.habitatIntegrity}, exposure risk ${resources.radiationRisk}, science ${resources.scienceProgress}.`;
  state.events.push({ id: actionId, day: beforeDay, text: action.log }, { id: `systems-check-${beforeDay}`, day: beforeDay, text: summary });
  state.lastOutcome = { actionId, title: action.title, text: `${action.log} ${summary}` };
  if (beforeDay >= state.durationDays) {
    state.status = 'completed';
    const crewSafe = resources.oxygen > 0 && resources.crewWellbeing > 0;
    const habitatReady = resources.habitatIntegrity >= 50;
    const scienceComplete = resources.scienceProgress >= 40;
    const [endingId, title, text] = !crewSafe
      ? ['emergency-return', 'Emergency return recommended', 'The crew’s modeled safety reserve ran low. Mission Control prioritizes a safe return and a systems review.']
      : habitatReady && scienceComplete
        ? ['full-success', 'First Light: science mission complete', 'The crew kept the habitat stable and completed a strong soil study. The outpost is ready for another mission.']
        : habitatReady
          ? ['safe-outpost', 'First Light: safe outpost, study continues', 'The crew maintained a stable outpost. The soil study needs another mission window.']
          : ['partial-success', 'First Light: lessons secured', 'The crew recovered useful lessons and returned safely. Mission Control has a clear list of systems to improve.'];
    state.debrief = { endingId, title, text, objectives: [
      { id: 'crew-safe', title: 'Protect the crew', complete: crewSafe },
      { id: 'habitat-stable', title: 'Keep the habitat stable', complete: habitatReady },
      { id: 'soil-study', title: 'Complete the soil study', complete: scienceComplete },
    ], branches: structuredClone(state.branches), finalResources: structuredClone(resources) };
    state.lastOutcome.text += ` ${title}. ${text}`;
  } else {
    state.day = beforeDay + 1;
    const eventIds = MARS_FIRST_LIGHT.eventSchedule?.[String(state.day)] || [];
    if (eventIds.length) {
      const eventPool = MARS_FIRST_LIGHT.events.filter((item) => eventIds.includes(item.id) && (item.prerequisites || []).every((requirement) => requirement.type === 'building'
        ? state.buildings.some((building) => building.id === requirement.id && building.status === requirement.status)
        : state.resources[requirement.key] >= requirement.minimum));
      const fallback = MARS_FIRST_LIGHT.events.find((item) => item.id === eventIds[eventIds.length - 1]);
      const eligible = eventPool.length ? eventPool : [fallback];
      const eventIndex = Math.abs(state.seed * 31 + state.day * 17) % eligible.length;
      const event = eligible[eventIndex];
      state.activeEvent = { id: event.id, title: event.title, trigger: event.trigger, day: state.day };
      state.events.push({ id: `event-${event.id}`, day: state.day, kind: 'event', text: `${event.title}: ${event.trigger}` });
    }
  }
  state.availableActions = availableActions(state);
  return state;
}
