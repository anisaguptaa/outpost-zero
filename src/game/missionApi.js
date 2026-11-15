import { localMission } from './localMission';

const configuredRoot = (import.meta.env.VITE_OUTPOST_API_URL || '').replace(/\/$/, '');
const apiRoot = configuredRoot ? `${configuredRoot}/api/v1` : '/api/v1';
const offlineFact = {
  kind: 'NASA reference fact', isLiveObservation: false,
  title: 'A Martian day is called a sol',
  summary: 'NASA gives the length of a Martian solar day as about 24.6 Earth hours.',
  source: 'https://science.nasa.gov/mars/facts/', sourceName: 'NASA Science — Mars Facts',
  dateOrPeriod: 'Planetary reference fact; source checked for this build', unit: 'Earth hours per Martian solar day', attribution: 'NASA',
  interpretation: 'This planetary fact provides context. It does not set or validate any resource rates in the fictional game model.', offlineFallback: true,
};

async function request(path, options = {}) {
  const response = await fetch(`${apiRoot}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.detail || 'Mission Control could not complete that request.');
    error.status = response.status;
    throw error;
  }
  return body;
}

function canUseLocalRules(error) { return !error.status || error.status >= 500 || error.status === 404; }
function remember(snapshot, sessionId) {
  const stored = { ...snapshot, sessionId, serviceMode: 'api' };
  localMission.cache(stored);
  return stored;
}

export const missionApi = {
  async start(profile) {
    const seed = 2026;
    try {
      const result = await request('/missions', { method: 'POST', body: JSON.stringify({ profile, missionId: 'mars-first-light', contractVersion: '1.0.0', seed }) });
      return remember(result.snapshot, result.sessionId);
    } catch (error) {
      if (!canUseLocalRules(error)) throw error;
      return localMission.start(profile);
    }
  },
  async read(sessionId) {
    try {
      const result = await request(`/missions/${sessionId}`);
      return remember(result.snapshot, sessionId);
    } catch (error) {
      if (!canUseLocalRules(error)) throw error;
      const local = localMission.read(sessionId);
      return { ...local, serviceMode: 'local' };
    }
  },
  async act(snapshot, actionId, placement, crewRole) {
    if (snapshot.serviceMode === 'local') return localMission.act(snapshot, actionId, placement, crewRole);
    try {
      const result = await request(`/missions/${snapshot.sessionId}/actions`, { method: 'POST', body: JSON.stringify({ actionId, expectedDay: snapshot.day, placement, crewRole }) });
      return remember(result.snapshot, snapshot.sessionId);
    } catch (error) {
      if (!canUseLocalRules(error)) throw error;
      return localMission.act({ ...snapshot, serviceMode: 'local' }, actionId, placement, crewRole);
    }
  },
  async gather(snapshot, nodeId, crewRole) {
    if (snapshot.serviceMode === 'local') return localMission.gather(snapshot, nodeId, crewRole);
    try {
      const result = await request(`/missions/${snapshot.sessionId}/gather`, { method: 'POST', body: JSON.stringify({ nodeId, expectedDay: snapshot.day, crewRole }) });
      return remember(result.snapshot, snapshot.sessionId);
    } catch (error) {
      if (!canUseLocalRules(error)) throw error;
      return localMission.gather({ ...snapshot, serviceMode: 'local' }, nodeId, crewRole);
    }
  },
  async enterHazard(snapshot, zoneId, position) {
    if (snapshot.serviceMode === 'local') return localMission.hazard(snapshot, zoneId, position);
    try {
      const result = await request(`/missions/${snapshot.sessionId}/hazards`, { method: 'POST', body: JSON.stringify({ zoneId, expectedDay: snapshot.day, position }) });
      return remember(result.snapshot, snapshot.sessionId);
    } catch (error) {
      if (!canUseLocalRules(error)) throw error;
      return localMission.hazard({ ...snapshot, serviceMode: 'local' }, zoneId, position);
    }
  },
  async science() {
    try { return await request('/science/context'); } catch { return offlineFact; }
  },
};
