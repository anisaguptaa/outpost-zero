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

The API stores sessions in memory for the demo. Restarting the API clears server sessions; browser saves remain available as an offline fallback.

## Current playable slice

Recruitment → callsign and flight suit selection → crew transmissions and Mars briefing → mission planning and two-item training cargo → launch → animated Mars arrival → first surface-walk preparation → interactive outpost simulation. Players can check in with crew, collect field notes, and build a saved flight log. Mission profile, preparation, and progression persist in browser storage. Person 2's simulation currently keeps its own local world save; the next integration step is to bridge world snapshots and completion reports into Person 1's flight log and debrief. The cargo limit and simulation values are fictional training rules, not spacecraft specifications or NASA measurements. Sound control remains visual only.

## Planned game loop

Briefing → prepare the Mars outpost → play a mission sol → respond to an event → see consequences → debrief. The first-sol loop is the integration milestone; Moon mode and longer campaigns follow after it is stable.

## Stack

- React + Vite for menus, story, HUD, and mission flow.
- FastAPI and Python for an optional mission API and simulation service.
- JSON scenario data and shared contracts for Person 1 and Person 2.

## Work split and ownership

- **Person 1:** onboarding, briefing, mission preparation, HUD, player progression, saves, flight log, and debrief presentation.
- **Person 2:** outpost world, buildings, characters, interactions, resource simulation, events, and decisions.
- `src/person1/` is Person 1's area. `src/person2/` is Person 2's area. `src/shared/contracts.js` contains the shared data shapes.

Person 1 owns app routing and presents Person 2's world after the landing and airlock sequence. The preparation record includes the selected focus, landing-site identifier, and cargo IDs and labels. The current world module uses a separate local simulation save; connecting its snapshots and final report to Person 1's flight record is the next integration task. Snapshot values should include units and identify measured, derived, or fictional-scenario data.

See [docs/PERSON_B_WORK_PLAN.md](docs/PERSON_B_WORK_PLAN.md) for Person 2's scope and completion criteria.

## NASA and partner science resources

The source registry in `src/shared/scienceSources.js` links learning moments to agency resources and records their limits. It does not make live requests yet.

- [NASA Mars Trek](https://trek.nasa.gov/mars/) provides Mars terrain and elevation context. Utopia Planitia is where Viking 2 landed in 1976.
- [NASA Open APIs](https://api.nasa.gov/) can provide dated imagery and rover-photo references. Keep API keys on the backend when live requests are added.
- [NASA CCMC DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) provides space-weather event context; it is not a crew-specific radiation forecast.
- [OSDR RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/) provides spaceflight dosimetry readings. ISS readings help explain units but are not Mars-surface measurements.
- [NASA OSDR](https://osdr.nasa.gov/bio/repo/) and the [Canadian Space Agency food-production toolkit](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/) support learning about astronaut health and growing food.

When real data is added, show its source, date, units, and limits. Keep measured observations distinct from calculations and fictional mission values.
