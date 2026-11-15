// FastAPI is used when configured; local browser storage keeps the mission playable offline.
import { GAME_CONTRACT_VERSION, MARS_MISSION } from '../shared/contracts';
const PROFILE_KEY = 'outpost-zero.profile.v1';
const PROFILE_ID_KEY = 'outpost-zero.profile-id.v1';
const SAVE_KEY = 'outpost-zero.save.v1';
const API_ROOT = (import.meta.env.VITE_OUTPOST_API_URL || '').replace(/\/$/, '');
const wait = (ms = 240) => new Promise(resolve => setTimeout(resolve, ms));
const read = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
async function requestPlayer(path, options = {}) {
  const response = await fetch(`${API_ROOT}/api/v1/player${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    signal: AbortSignal.timeout(2500),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || 'Player record service is unavailable.');
  return body;
}
async function syncPlayer(path, method, value) {
  if (!API_ROOT) return null;
  try { return await requestPlayer(path, { method, body: value ? JSON.stringify(value) : undefined }); }
  catch { return null; }
}
const normalizeRun = (run) => ({
  ...run,
  currentSol: Number.isFinite(run.currentSol) ? run.currentSol : 1,
  crewCheckIns: Array.isArray(run.crewCheckIns) ? run.crewCheckIns : [],
  learnedScienceIds: Array.isArray(run.learnedScienceIds) ? run.learnedScienceIds : [],
  arrivalComplete: run.arrivalComplete === true,
  firstSurfaceDecision: run.firstSurfaceDecision || null,
  habitatSealChecked: run.habitatSealChecked === true,
  logEntries: Array.isArray(run.logEntries) ? run.logEntries : [],
  preparation: run.preparation || {
    focusId: 'habitat', focusLabel: 'Make the habitat ready',
    landingSiteId: 'utopia-planitia', landingSiteLabel: 'Utopia Planitia',
    payloadIds: [], payloadLabels: [], cargoRule: 'fictional-training-limit',
  },
  contractVersion: run.contractVersion || GAME_CONTRACT_VERSION,
});

export const playerApi = {
  async getProfile() {
    await wait(80);
    const local = read(PROFILE_KEY);
    const profileId = local?.id || localStorage.getItem(PROFILE_ID_KEY);
    if (!profileId) return local;
    const remote = await syncPlayer(`/profiles/${encodeURIComponent(profileId)}`, 'GET');
    const profile = remote?.profile || local;
    if (profile) { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); localStorage.setItem(PROFILE_ID_KEY, profile.id); }
    return profile;
  },
  async saveProfile(profile) {
    await wait();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(PROFILE_ID_KEY, profile.id);
    await syncPlayer(`/profiles/${encodeURIComponent(profile.id)}`, 'PUT', profile);
    return profile;
  },
  async getMissionBrief() { await wait(100); return MARS_MISSION; },
  async startMission(profile, missionId, preparation = {}) {
    await wait(500);
    const now = new Date().toISOString();
    const run = {
      id: globalThis.crypto?.randomUUID?.() ?? `run-${Date.now().toString(36)}`,
      missionId,
      profileId: profile.id,
      status: 'active',
      currentSol: 1,
      preparation: {
        focusId: preparation.focusId || 'habitat',
        focusLabel: preparation.focusLabel || 'Make the habitat ready',
        landingSiteId: preparation.landingSiteId || 'utopia-planitia',
        landingSiteLabel: preparation.landingSiteLabel || 'Utopia Planitia',
        payloadIds: Array.isArray(preparation.payloadIds) ? preparation.payloadIds : [],
        payloadLabels: Array.isArray(preparation.payloadLabels) ? preparation.payloadLabels : [],
        cargoRule: preparation.cargoRule || 'fictional-training-limit',
      },
      latestSnapshot: null,
      finalReport: null,
      crewCheckIns: [],
      learnedScienceIds: [],
      arrivalComplete: false,
      firstSurfaceDecision: null,
      habitatSealChecked: false,
      logEntries: [
        { id: `launch-${Date.now()}`, type: 'mission-start', sol: 1, createdAt: now, text: 'First Light mission started. Surface uplink is standing by.' },
        { id: `focus-${Date.now()}`, type: 'mission-focus', sol: 1, createdAt: now, text: `Commander focus: ${preparation.focusLabel || 'Make the habitat ready'}.` },
        ...(Array.isArray(preparation.payloadLabels) ? preparation.payloadLabels.map((label, index) => ({ id: `cargo-${index}-${Date.now()}`, type: 'cargo-loaded', sol: 1, createdAt: now, text: `${label} loaded into the training cargo bay.` })) : []),
      ],
      startedAt: now,
      updatedAt: now,
      contractVersion: GAME_CONTRACT_VERSION,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(run));
    await syncPlayer(`/runs/${encodeURIComponent(run.id)}`, 'PUT', run);
    return run;
  },
  async getSave() {
    await wait(60);
    const local = read(SAVE_KEY);
    const profile = read(PROFILE_KEY);
    const profileId = local?.profileId || profile?.id || localStorage.getItem(PROFILE_ID_KEY);
    const remote = local?.id
      ? await syncPlayer(`/runs/${encodeURIComponent(local.id)}`, 'GET')
      : profileId ? await syncPlayer(`/profiles/${encodeURIComponent(profileId)}/latest-run`, 'GET') : null;
    const remoteRun = remote?.run;
    const localIsNewer = local && Date.parse(local.updatedAt || local.startedAt || 0) >= Date.parse(remoteRun?.updatedAt || 0);
    const saved = localIsNewer ? local : remoteRun || local;
    if (!saved || typeof saved !== 'object') return null;
    const migrated = normalizeRun(saved);
    if (JSON.stringify(saved) !== JSON.stringify(migrated)) localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
    return migrated;
  },
  async saveMissionRun(run) {
    await wait(80);
    localStorage.setItem(SAVE_KEY, JSON.stringify(run));
    await syncPlayer(`/runs/${encodeURIComponent(run.id)}`, 'PUT', run);
    return run;
  },
  async completeMissionRun(run, finalReport) {
    await wait(180);
    const completedAt = new Date().toISOString();
    const completed = { ...run, status: 'complete', finalReport: { ...finalReport, completedAt }, updatedAt: completedAt };
    localStorage.setItem(SAVE_KEY, JSON.stringify(completed));
    await syncPlayer(`/runs/${encodeURIComponent(completed.id)}`, 'PUT', completed);
    return completed;
  },
};
