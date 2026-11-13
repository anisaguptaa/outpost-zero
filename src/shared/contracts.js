// Shared seam between Person 1's player journey and Person 2's world/simulation.
// Keep these payloads stable; each owner can implement their own side independently.
export const GAME_CONTRACT_VERSION = '1.0.0';

/** PlayerProfile: { id, callsign, avatarId, createdAt } */
/** MissionBrief: { id, destination, durationDays, objectives[], crew[] } */
/** MissionStartRequest: { profile: PlayerProfile, missionId, contractVersion } */
/** MissionSnapshot (Person 2 response): { missionId, day, resources, buildings, events, status } */
export const MARS_MISSION = {
  id: 'mars-first-light', destination: 'Mars', durationDays: 30,
  objectives: ['Keep the crew safe for 30 sols', 'Bring the habitat online', 'Complete the first soil study'],
  crew: [
    { id: 'mika', name: 'Mika Chen', role: 'Flight engineer', avatar: '🧑🏽‍🚀', line: 'I can get the habitat humming. You call the shots, Commander.' },
    { id: 'sol', name: 'Sol Okafor', role: 'Field scientist', avatar: '👩🏾‍🚀', line: 'Those red dunes are full of clues. Let’s find out what Mars is made of.' },
    { id: 'pip', name: 'PIP-3', role: 'Rover & crew bot', avatar: '🤖', line: 'Beep! I packed my tiny shovel. Science mode: extremely ready.' },
  ],
};
