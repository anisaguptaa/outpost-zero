# OUTPOST ZERO

An adventure-style space survival game for ages 7–12. Players lead an outpost, make science-informed choices, and see those choices shape the mission.

## Run it in VS Code

Open this folder in VS Code, press **F5**, and choose **OUTPOST ZERO — Run game** if asked. VS Code starts Vite and opens the game in Chrome. Press **Shift+F5** to stop it.

## Run it from a terminal

1. Install Node.js 20 or newer.
2. Run `npm install` once from this folder.
3. Run `npm run dev` and open the local address Vite prints (usually `http://localhost:5173`).

To make a production build, run `npm run build`.

## Run the mission API

1. From the repository root, create and activate a Python virtual environment.
2. Install `backend/requirements.txt`.
3. Run `uvicorn backend.app.main:app --reload` (API at `http://127.0.0.1:8000`).
4. Copy `.env.example` to `.env.local` to connect the Vite app to the local API. Without that setting, the game uses its deterministic local adapter.

The API stores sessions in memory for the local demo. Restarting the API clears server sessions; browser saves still provide an offline fallback.

## Current playable slice

Recruitment → callsign and flight suit selection → crew transmissions and Mars briefing → mission-ready handoff → first-sol outpost choice. The callsign and mission save persist in the browser. The seven-sol Mars mission has six selectable structures and connected power, oxygen, water, food, habitat, crew, exposure-risk, and science tracks. Phase 3 adds delayed greenhouse production, life-support recovery, and shelter protection, with all values clearly labeled as game values. Configure VITE_OUTPOST_API_URL to use FastAPI; without it the browser adapter runs the same simplified rules locally. Authored event branches, lunar mode, and final debrief remain future phases. Crew/dialogue data is mock content; sound control remains visual only.

## Planned game loop

Briefing → prepare the Mars outpost → play a mission sol → respond to an event → see consequences → debrief. The first-sol playable slice is the integration milestone; longer campaigns and Moon mode follow after the core loop is stable.

## Stack

- React + Vite for menus, story, HUD, and mission flow.
- Phaser 3 for the interactive outpost world.
- FastAPI and Python are the target for authoritative mission state and simulation rules; Phase 1 uses an interchangeable local browser adapter while the service is built.
- Shared JSON contracts and versioned scenario data for integration.

## Work split and ownership

- **Person 1:** onboarding, briefing, destination choice, HUD, progression, saves, and debrief.
- **Person 2:** world scene, buildings, characters, interactions, resource simulation, events, decisions, and NASA data adapters.
- `src/person1/` is Person 1’s area. `src/person2/` is reserved for Person 2. `src/shared/contracts.js` contains shared data shapes; coordinate changes before integrating.

Person 1 owns app routing and will host Person 2’s Phaser scene at the mission handoff. Person 2 can work against the shared snapshot/request contracts without editing Person 1’s screens. The mock adapter in `src/person1/api.js` is the future API replacement point; the opening slice does not depend on FastAPI.

For parallel work, use separate `frontend-experience` and `gameplay-simulation` branches and integrate through pull requests into `main`.

## MVP direction

- Mars first: a 7–10-sol mission suitable for a demo. Moon mode is an expansion after the Mars loop works.
- Power, oxygen, water, food, crew wellbeing, habitat condition, abstract exposure risk, and science progress.
- Five or six interactive structures and 8–10 authored events.
- Explain consequences clearly and distinguish NASA observations, derived calculations, and fictional training scenarios.

See [docs/PERSON_B_WORK_PLAN.md](docs/PERSON_B_WORK_PLAN.md) for the phased Person B scope and completion criteria.
