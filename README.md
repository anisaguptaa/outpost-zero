# OUTPOST ZERO

A story led space survival game for ages 7–12. This repo starts with Person 1's opening player journey and keeps the game world and simulation as a separate integration seam for Person 2.

## Run it in VS Code

The workspace has a ready-made VS Code launch profile. Open this folder in VS Code, then press **F5** and choose **OUTPOST ZERO — Run game** if asked. VS Code starts Vite in its terminal and opens the game in Chrome. Press **Shift+F5** to stop the debug session.

The launch profile opens the local Vite server in Chrome at `http://localhost:5173`. If port 5173 is already in use, stop the other server first.

## Run it from a terminal

1. Install Node.js 20 or newer.
2. From this folder, run `npm install` once.
3. Run `npm run dev` and open the local address Vite prints (usually `http://localhost:5173`).

To make a production build, run `npm run build`.

## Current playable slice

Recruitment screen → callsign and flight suit selection → crew transmissions and mission briefing → mission-ready handoff. The callsign and mission save persist in this browser. Mars mission facts and crew are mock data. Sound is a visual toggle only in this first slice.

## Ownership boundaries

- `src/person1/` — Person 1: player journey, story, progression, local save and mock API adapter.
- `src/person2/` — reserved for Person 2: Phaser world, buildings, characters, world interactions, simulation events and resource/decision rules. Keep new work inside this directory.
- `src/shared/contracts.js` — shared data shapes and starter mission data. Coordinate contract edits so either workstream can integrate independently.

Person 1 owns the outer React flow and will host Person 2's Phaser scene at the mission handoff. Person 2 can develop against the request/snapshot shapes documented in `src/shared/contracts.js` without editing Person 1's screens. The mock adapter in `src/person1/api.js` is the future API replacement point; the first run does not depend on FastAPI.

## Next work

1. Person 2 builds the isolated Phaser Mars base scene and emits a typed mission snapshot through the shared contract.
2. Person 1 integrates that scene at the mission-ready handoff and adds the mission HUD, story beats, autosave/resume and results report.
3. Together replace mock data with the FastAPI endpoints and validate the resource tradeoffs against NASA source data.

