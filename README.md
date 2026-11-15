# OUTPOST ZERO

An adventure-style space survival game for ages 7–12. Players lead an outpost, make science-informed choices, and see those choices shape the mission.

## Run it in VS Code

Open this folder in VS Code, press **F5**, and choose **OUTPOST ZERO — Run game** if asked. VS Code starts Vite on port 5174 and opens the game in Chrome. Press **Shift+F5** to stop it.

## Run it from a terminal

1. Install Node.js 20 or newer.
2. Run `npm install` once from this folder.
3. Run `npm run dev -- --port 5174 --strictPort` and open `http://localhost:5174`.

To make a production build, run `npm run build`.

## Current playable slice

Recruitment → callsign and flight suit selection → crew transmissions and Mars briefing → interactive mission planning → launch → mission control. Players choose a mission focus, load two tools into the training cargo bay, check in with crew, collect science notes, and build a saved flight log. Mission profile and progress persist in browser storage. The world simulation and final mission report connect through Person 2's integration contract; this frontend does not invent live mission telemetry. The mission brief, crew, and cargo limit are prototype scenario data. Sound control is currently visual only.

## Planned game loop

Briefing → choose a world → prepare the outpost → play a mission day → respond to an event → see consequences → debrief.

## Stack

- React + Vite for menus, story, HUD, and mission flow.
- Phaser 3 for the interactive outpost world.
- FastAPI and Python for mission state and simulation rules.
- Shared JSON contracts for integration.

## Work split and ownership

- **Person 1:** onboarding, briefing, mission planning, HUD, player progression, saves, flight log, and debrief presentation.
- **Person 2:** world scene, buildings, characters, interactions, resource simulation, events, decisions, and NASA data adapters.
- `src/person1/` is Person 1’s area. `src/person2/` is reserved for Person 2. `src/shared/contracts.js` contains shared data shapes; coordinate changes before integrating.

Person 1 owns app routing and hosts Person 2’s Phaser scene in the Mars surface slot. Person 2 can work against the shared snapshot/request contracts without editing Person 1’s screens. A mission run includes `preparation` with the player’s selected focus, landing-site identifier, and cargo IDs/labels. The world module can use this launch plan, then report snapshots through `onSnapshot(snapshot)` and a final report through `onComplete(report)`. Snapshot readings must include units and identify measured, derived, or fictional-scenario values. The mock adapter in `src/person1/api.js` is the future API replacement point; the opening slice does not depend on FastAPI.

For parallel work, use separate `frontend-experience` and `gameplay-simulation` branches and integrate through pull requests into `main`.

## MVP direction

- Moon and Mars destinations, with a short mission suitable for a demo.
- Power, oxygen, water, food, crew health, and radiation risk.
- Five or six interactive structures and 8–10 authored events.
- Explain consequences clearly and distinguish NASA observations, derived calculations, and fictional training scenarios.

## Science sources for the next gameplay slice

The source registry in `src/shared/scienceSources.js` maps agency resources to gameplay and records important data limits. It does not make live requests yet.

- **Mars places and landing choices:** [NASA Mars Trek](https://trek.nasa.gov/mars/) for terrain and elevation context. The landing scene introduces Utopia Planitia, where NASA’s Viking 2 lander touched down in 1976; the label has a keyboard- and touch-accessible explanation.
- **Mission imagery:** [NASA Open APIs](https://api.nasa.gov/) for dated imagery and rover-photo references. Keep API keys on the backend when live requests are added.
- **Solar activity events:** [NASA CCMC DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/) for space-weather context in authored event scenarios. NASA marks DONKI material as prototyping-quality research information, so it must not be presented as a crew-specific radiation forecast.
- **Radiation learning:** [OSDR RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/) for measured spaceflight dosimetry and units. Explain that ISS/spaceflight measurements are comparisons, not Mars-surface measurements.
- **Crew health and growing food:** [NASA OSDR](https://osdr.nasa.gov/bio/repo/) for published space-biology studies, and the [Canadian Space Agency food-production toolkit](https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/) for age-appropriate greenhouse and nutrition learning.

When real data is added, show its source, date, units, and limits; keep measured observations distinct from derived values and fictional mission numbers.

## Mission control integration seam

The mission control slice includes crew check-ins, a source-linked field journal, an autosaved flight log, snapshot-driven telemetry, and a debrief view. The Mars surface window is intentionally an integration slot for Person 2's Phaser world. Replace `src/person1/MissionExperience.jsx`'s `WorldModuleSlot` with the world component and bridge `onSnapshot(snapshot)` and `onComplete(report)` back to the app. Launch choices are saved in `run.preparation` and are available to that component. Until the world module reports data, telemetry stays empty and the debrief does not invent results. Player saves currently use browser storage through the mock adapter in `src/person1/api.js`.
