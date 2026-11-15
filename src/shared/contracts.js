// Shared seam between Person 1's player journey and Person 2's world/simulation.
// Keep these payloads stable; each owner can implement their own side independently.
export const GAME_CONTRACT_VERSION = '1.0.0';

/** PlayerProfile: { id, callsign, avatarId, createdAt } */
/** MissionBrief: { id, destination, durationDays, objectives[], crew[] } */
/** MissionStartRequest: { profile: PlayerProfile, missionId, contractVersion, preparation } */
/** MissionPreparation (Person 1 → Person 2): { focusId, focusLabel, landingSiteId, landingSiteLabel, payloadIds[], payloadLabels[], cargoRule } */
/**
 * MissionSnapshot (Person 2 → Person 1): {
 *   missionId, sol, elapsedEarthSeconds, resources[], buildings[], crew[],
 *   objectiveStates[], recentEvents[], decisions[], status, capturedAt
 * }
 * ResourceReading: { id, label, value, unit, trend?, sourceKind, sourceId? }
 * sourceKind is one of `measured`, `derived`, or `fictional-scenario`.
 * Person 1 displays these values and records them. Person 2 owns simulation rules.
 */
/** MissionComplete (Person 2 → Person 1): { status, completedAt, finalSnapshot, objectiveStates, decisions } */
/** MissionRun (Person 1 save): { id, profileId, missionId, currentSol, status, preparation, latestSnapshot?, logEntries[], learnedScienceIds[], finalReport? } */
/** MissionStartRequest: { profile: PlayerProfile, missionId, contractVersion } */
/** MissionActionRequest: { sessionId, expectedDay, actionId } */
/** MissionSnapshot also carries availableActions[], powerMode, seed, scenarioId, and lastOutcome. */
export const MISSION_ACTIONS = {
  ACTIVATE_SOLAR_ARRAY: 'activate-solar-array',
  RUN_HABITAT_DIAGNOSTICS: 'run-habitat-diagnostics',
  BUILD_GREENHOUSE: 'build-greenhouse',
  REPAIR_HABITAT: 'repair-habitat',
  ACTIVATE_LIFE_SUPPORT: 'activate-life-support',
  BUILD_STORM_SHELTER: 'build-storm-shelter',
  PRIORITIZE_LIFE_SUPPORT: 'prioritize-life-support',
  PRIORITIZE_RESEARCH: 'prioritize-research',
  SEND_ROVER: 'send-rover',
  CREW_REST: 'crew-rest',
  CONSERVE_AND_OBSERVE: 'conserve-and-observe',
};

export const MARS_MISSION = {
  id: 'mars-first-light', destination: 'Mars', durationDays: 7,
  objectives: ['Keep the crew safe for 7 sols', 'Bring the habitat online', 'Complete the first soil study'],
  crew: [
    { id: 'mika', name: 'Mika Chen', role: 'Flight engineer', avatar: '🧑🏽‍🚀', line: 'I can get the habitat humming. You call the shots, Commander.' },
    { id: 'sol', name: 'Sol Okafor', role: 'Field scientist', avatar: '👩🏾‍🚀', line: 'Those red dunes are full of clues. Let’s find out what Mars is made of.' },
    { id: 'pip', name: 'PIP-3', role: 'Rover & crew bot', avatar: '🤖', line: 'Beep! I packed my tiny shovel. Science mode: extremely ready.' },
  ],
};
