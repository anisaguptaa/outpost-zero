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

Recruitment → callsign and flight suit selection → crew transmissions and Mars briefing → mission-ready handoff → outpost decisions → event branches → mission debrief. The callsign and mission save persist in the browser. The seven-sol Mars mission has six selectable structures and connected power, oxygen, water, food, habitat, crew, abstract exposure-risk, and science tracks. Nine authored events can branch across Sols 2, 4, and 6. The debrief reports crew safety, habitat, science objectives, and the player's event branches. Values and outcomes are illustrative gameplay units, never NASA measurements or safety limits.

The NASA context card displays archived imagery and metadata from NASA's Image and Video Library when reachable. If it cannot be reached, the API returns an attributed NASA planetary fact. Neither source changes the fictional mission calculations. Configure `VITE_OUTPOST_API_URL` to use FastAPI; without it, the game runs the same deterministic rules locally and shows the offline fact. The Mars mission uses seed `2026` for a repeatable demo. Moon mode remains a later expansion. Crew/dialogue data is authored demo content; the sound toggle is still visual only.

## Game loop

Briefing → prepare the Mars outpost → resolve any event response → choose the crew's regular work → review immediate and delayed consequences → debrief. NASA source context is shown separately from game-model explanations.

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

For parallel work, use separate `frontend-experience` and `gameplay-simulation` branches and integrate through pull requests into `main`. Person 1 owns opening flow and later visual redesigns; Person 2 owns `src/person2/`, `backend/app/`, and scenario data. Coordinate edits to `src/shared/contracts.js` and app handoff with each other. Keep pull requests focused and merge the shared contract before dependent changes.

## Demo and deployment

- Static fallback: run `npm run dev` without `VITE_OUTPOST_API_URL`; the local deterministic mission and NASA fact fallback work without FastAPI.
- API demo: start FastAPI, set `VITE_OUTPOST_API_URL=http://127.0.0.1:8000` in `.env.local`, then start Vite. Check `/api/v1/health` and `/api/v1/science/context`.
- Build a static demo with `npm run build`, then serve the generated `dist/` folder from the team's chosen static host. No deployment is configured yet; choose and approve a public host before publishing.
- For a repeatable demo, start from a fresh browser save or choose **RESTART MISSION**. The scenario seed is `2026`; the event choice and debrief are reproducible.

## MVP direction

- Mars first: a seven-sol prototype suitable for a demo, expandable toward 30 sols after playtesting. Moon mode is an expansion after the Mars loop works.
- Power, oxygen, water, food, crew wellbeing, habitat condition, abstract exposure risk, and science progress.
- Five or six interactive structures and 8–10 authored events.
- Explain consequences clearly and distinguish NASA observations, derived calculations, and fictional training scenarios.

See [docs/PERSON_B_WORK_PLAN.md](docs/PERSON_B_WORK_PLAN.md) for the phased Person B scope and completion criteria.
