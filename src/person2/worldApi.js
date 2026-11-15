import { MARS_MISSION } from '../shared/contracts';
import { availableActions, createInitialSnapshot, resolveAction } from './simulation';

const WORLD_SAVE_KEY = 'outpost-zero.world.v1';
const API_ROOT = (import.meta.env.VITE_OUTPOST_API_URL || '').replace(/\/$/, '');
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));
const offlineContext = {
  kind: 'NASA reference fact', isLiveObservation: false, title: 'A Martian day is called a sol',
  summary: 'NASA gives the length of a Martian solar day as about 24.6 Earth hours.',
  source: 'https://science.nasa.gov/mars/facts/', sourceName: 'NASA Science — Mars Facts',
  dateOrPeriod: 'Planetary reference fact; NASA page', unit: 'Earth hours per Martian solar day', attribution: 'NASA',
  interpretation: 'This real planetary fact does not set or validate any resource rates in the game model.', offlineFallback: true,
};
class ApiError extends Error { constructor(message, status) { super(message); this.status = status; } }

async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.detail || 'Mission service could not complete that request.', response.status);
  return body;
}
const isNetworkError = (error) => !(error instanceof ApiError);
function readLocal() { try { return JSON.parse(localStorage.getItem(WORLD_SAVE_KEY)); } catch { return null; } }
function writeLocal(snapshot) { localStorage.setItem(WORLD_SAVE_KEY, JSON.stringify(snapshot)); return snapshot; }

export const worldApi = {
  async startMission(missionId = MARS_MISSION.id, profile = {}) {
    const seed = 2026;
    const local = createInitialSnapshot(`local-${Date.now()}`, seed);
    if (API_ROOT) {
      try {
        const result = await request('/api/v1/missions', { method: 'POST', body: JSON.stringify({ profile, missionId, contractVersion: '1.0.0', seed }) });
        return writeLocal({ ...result.snapshot, sessionId: result.sessionId, adapter: 'api' });
      } catch (error) { if (!isNetworkError(error)) throw error; }
    } else await delay(150);
    return writeLocal({ ...local, adapter: 'local' });
  },
  async getSnapshot() {
    const saved = readLocal();
    if (API_ROOT && saved?.sessionId && saved.adapter === 'api') {
      try {
        const result = await request(`/api/v1/missions/${saved.sessionId}`);
        return writeLocal({ ...result.snapshot, sessionId: saved.sessionId, adapter: 'api' });
      } catch (error) {
        if (!isNetworkError(error) && error.status !== 404) throw error;
        return writeLocal({ ...saved, adapter: 'local' });
      }
    } else await delay(50);
    return saved?.scenarioId === MARS_MISSION.id ? writeLocal({ ...saved, availableActions: availableActions(saved) }) : null;
  },
  async getScienceContext() {
    if (!API_ROOT) return offlineContext;
    try { return await request('/api/v1/science/context'); }
    catch { return offlineContext; }
  },
  async performAction(actionId, expectedDay) {
    const saved = readLocal();
    if (!saved) throw new Error('No active mission. Return to Mission Control and launch again.');
    if (API_ROOT && saved.sessionId && saved.adapter === 'api') {
      try {
        const result = await request(`/api/v1/missions/${saved.sessionId}/actions`, { method: 'POST', body: JSON.stringify({ actionId, expectedDay }) });
        return writeLocal({ ...result.snapshot, sessionId: saved.sessionId, adapter: 'api' });
      } catch (error) { if (!isNetworkError(error)) throw error; }
    } else await delay(140);
    return writeLocal({ ...resolveAction(saved, actionId, expectedDay), adapter: 'local' });
  },
  async reset() { localStorage.removeItem(WORLD_SAVE_KEY); },
};
