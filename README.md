# OUTPOST ZERO

An adventure-style Mars mission game for ages 7–12. Players lead a crew through a story, prepare a flight, land at Utopia Planitia, and make choices that change a playable outpost simulation. Science is explained in the story and clearly separated from fictional training values.

## Run it in VS Code

Open this folder in VS Code, press **F5**, and choose **OUTPOST ZERO — Run game** if asked. The game opens in Chrome. Press **Shift+F5** to stop it.

## Run it from a terminal

1. Install Node.js 20 or newer.
2. Run `npm install` once from this folder.
3. Run `npm run dev -- --host 0.0.0.0 --port 5173 --strictPort` and open `http://localhost:5173`.
4. To make a production build, run `npm run build`.

If port 5173 is busy, choose another port, such as `5175`.

## Optional mission API

The game runs with its local browser simulation by default. To run the FastAPI service:

1. Create and activate a Python virtual environment from the repository root.
2. Install `backend/requirements.txt`.
3. Run `uvicorn backend.app.main:app --reload` (API at `http://127.0.0.1:8000`).
4. Copy `.env.example` to `.env.local` and set `VITE_OUTPOST_API_URL=http://127.0.0.1:8000`.

The mission simulator keeps active sessions in memory for the demo. Person 1's profiles and flight records are stored in a local SQLite file (`backend/outpost_zero_players.sqlite3`, excluded from Git). Browser storage remains the offline fallback if the API is unavailable.

## Current playable slice

Recruitment → callsign and flight suit selection → crew transmissions and Mars briefing → mission planning and two-item training cargo → launch → animated Mars arrival → first surface-walk preparation → interactive outpost simulation → event branches → mission debrief. Players can check in with crew, collect field notes, and build a saved flight log. Mission profile, preparation, decisions, and progression persist in browser storage. Outpost snapshots feed Person 1's flight log and final debrief through callbacks; the world simulator also keeps its own local save so it can resume its scenario. The seven-sol Mars mission includes six selectable structures and power, oxygen, water, food, habitat, crew, abstract exposure-risk, and science tracks. Nine authored events can branch across Sols 2, 4, and 6. The debrief reports crew safety, habitat, science objectives, and the player's event branches. The cargo limit and simulation values are fictional training rules, not spacecraft specifications or NASA measurements. The sound preference persists locally and enables short synthesized interface cues; ambient music is not included.

## Planned game loop

Briefing → prepare the Mars outpost → resolve any event response → choose the crew's regular work → review immediate and delayed consequences → debrief. The scenario uses seed `2026` for a repeatable demo. Moon mode and longer campaigns follow after the Mars loop is stable.

## Stack

- React + Vite for menus, story, HUD, and mission flow.
- FastAPI and Python for an optional mission API and simulation service.
- JSON scenario data and shared contracts for Person 1 and Person 2.

## Work split and ownership

- **Person 1:** onboarding, briefing, mission preparation, HUD, player progression, saves, flight log, and debrief presentation.
- **Person 2:** outpost world, buildings, characters, interactions, resource simulation, events, and decisions.
- `src/person1/` is Person 1's area. `src/person2/` is Person 2's area. `src/shared/contracts.js` contains the shared data shapes.

Person 1 owns app routing and presents Person 2's world after the landing and airlock sequence. The preparation record includes the selected focus, landing-site identifier, and cargo IDs and labels. The world module retains its own simulation save while sending snapshots and completion results to Person 1's flight record and report. Snapshot values should include units and identify measured, derived, or fictional-scenario data.

See [docs/PERSON_B_WORK_PLAN.md](docs/PERSON_B_WORK_PLAN.md) for Person 2's scope and completion criteria.

## NASA and partner science resources

The story's learning moments link to agency resources and explain their limits. The game also shows an attributed NASA reference card from the mission API, with an offline fact fallback. NASA context is separate from the fictional simulation and does not drive its resource calculations.

- [NASA Mars Trek](https://trek.nasa.gov/mars/) provides Mars terrain and elevation context. Utopia Planitia is where Viking 2 landed in 1976.
- [NASA Open APIs](https://api.nasa.gov/) can provide dated imagery and rover-photo references. Keep API keys on the backend when live requests are added.
- [NASA CCMC DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) provides space-weather event context; it is not a crew-specific radiation forecast.
- [OSDR RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/) provides spaceflight dosimetry readings. ISS readings help explain units but are not Mars-surface measurements.
- [NASA OSDR](https://osdr.nasa.gov/bio/repo/) and the [Canadian Space Agency food-production toolkit](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/) support learning about astronaut health and growing food.

When real data is added, show its source, date, units, and limits. Keep measured observations distinct from calculations and fictional mission values.

## Demo and deployment

- Static fallback: run `npm run dev` without `VITE_OUTPOST_API_URL`; the deterministic mission and offline NASA fact work without FastAPI.
- API demo: start FastAPI, set `VITE_OUTPOST_API_URL=http://127.0.0.1:8000` in `.env.local`, then start Vite. Check `/api/v1/health` and `/api/v1/science/context`.
- Build a static demo with `npm run build`, then serve the generated `dist/` folder from the team's chosen static host. No deployment is configured yet.
- For a repeatable demo, start from a fresh browser save or choose **RESTART MISSION**.
