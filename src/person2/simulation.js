import { MARS_FIRST_LIGHT } from './scenario';

const clamp = (value) => Math.max(0, Math.min(100, value));

export function availableActions(snapshot) {
  if (snapshot.status !== 'active') return [];
  const options = snapshot.day === 1 ? MARS_FIRST_LIGHT.firstActions : MARS_FIRST_LIGHT.dailyActions;
  return options.filter((action) => {
    const required = action.requiresBuilding && snapshot.buildings.find((item) => item.id === action.requiresBuilding.id);
    if (action.requiresBuilding && (!required || required.status !== action.requiresBuilding.status)) return false;
    if (action.minResource && snapshot.resources[action.minResource.key] < action.minResource.value) return false;
    if (action.minResourceSecondary && snapshot.resources[action.minResourceSecondary.key] < action.minResourceSecondary.value) return false;
    if (action.maxResource && snapshot.resources[action.maxResource.key] >= action.maxResource.value) return false;
    return true;
  }).map(({ requiresBuilding, minResource, minResourceSecondary, maxResource, ...action }) => action);
}

export function createInitialSnapshot(sessionId = `local-${Date.now()}`, seed = 2026) {
  const snapshot = {
    missionId: sessionId, scenarioId: MARS_FIRST_LIGHT.id, destination: MARS_FIRST_LIGHT.destination,
    day: 1, durationDays: MARS_FIRST_LIGHT.durationDays, seed,
    resources: { ...MARS_FIRST_LIGHT.initialResources },
    buildings: MARS_FIRST_LIGHT.buildings.map((item) => ({ ...item })),
    powerMode: 'balanced', events: [{ id: 'touchdown', day: 1, text: 'Touchdown confirmed. The crew is at the outpost.' }],
    status: 'active', lastOutcome: null,
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
    state.lastOutcome.text += ' The seven-sol training mission is complete; Mission Control is ready to review the flight.';
  } else state.day = beforeDay + 1;
  state.availableActions = availableActions(state);
  return state;
}
