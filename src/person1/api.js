// Mock adapter: swap implementation for FastAPI calls later without changing screens.
import { MARS_MISSION } from '../shared/contracts';
const PROFILE_KEY = 'outpost-zero.profile.v1';
const SAVE_KEY = 'outpost-zero.save.v1';
const wait = (ms = 240) => new Promise(resolve => setTimeout(resolve, ms));

export const playerApi = {
  async getProfile() { await wait(80); try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch { return null; } },
  async saveProfile(profile) { await wait(); localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); return profile; },
  async getMissionBrief() { await wait(100); return MARS_MISSION; },
  async startMission(profile, missionId) {
    await wait(500);
    const save = { missionId, profile, status: 'ready-for-world', day: 1, createdAt: new Date().toISOString(), contractVersion: '1.0.0' };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    return save;
  },
  async getSave() { await wait(60); try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; } },
};
