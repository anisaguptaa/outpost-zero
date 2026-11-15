// Mock adapter: swap implementation for FastAPI calls later without changing screens.
import { GAME_CONTRACT_VERSION, MARS_MISSION } from '../shared/contracts';
const PROFILE_KEY = 'outpost-zero.profile.v1';
const SAVE_KEY = 'outpost-zero.save.v1';
const wait = (ms = 240) => new Promise(resolve => setTimeout(resolve, ms));
const read = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
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
  async getProfile() { await wait(80); return read(PROFILE_KEY); },
  async saveProfile(profile) { await wait(); localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); return profile; },
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
    return run;
  },
  async getSave() {
    await wait(60);
    const saved = read(SAVE_KEY);
    if (!saved || typeof saved !== 'object') return null;
    const migrated = normalizeRun(saved);
    if (JSON.stringify(saved) !== JSON.stringify(migrated)) localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
    return migrated;
  },
  async saveMissionRun(run) { await wait(80); localStorage.setItem(SAVE_KEY, JSON.stringify(run)); return run; },
  async completeMissionRun(run, finalReport) {
    await wait(180);
    const completedAt = new Date().toISOString();
    const completed = { ...run, status: 'complete', finalReport: { ...finalReport, completedAt }, updatedAt: completedAt };
    localStorage.setItem(SAVE_KEY, JSON.stringify(completed));
    return completed;
  },
};
