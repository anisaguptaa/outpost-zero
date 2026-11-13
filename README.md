# OUTPOST ZERO

An adventure-style space survival game for ages 7–12. Players lead an outpost, make science-informed choices, and see those choices shape the mission.

## Run it in VS Code

Open this folder in VS Code, press **F5**, and choose **OUTPOST ZERO — Run game** if asked. VS Code starts Vite and opens the game in Chrome. Press **Shift+F5** to stop it.

## Run it from a terminal

1. Install Node.js 20 or newer.
2. Run `npm install` once from this folder.
3. Run `npm run dev` and open the local address Vite prints (usually `http://localhost:5173`).

To make a production build, run `npm run build`.

## Current playable slice

Recruitment → callsign and flight suit selection → crew transmissions and Mars briefing → mission-ready handoff. The callsign and mission save persist in the browser. This opening prototype is Mars-focused; Moon selection, the interactive outpost, simulation, and debrief are planned next. The current mock mission is 30 sols. Crew and mission data are mock data; the sound control is visual only.

## Planned game loop

Briefing → choose a world → prepare the outpost → play a mission day → respond to an event → see consequences → debrief.

## Stack

- React + Vite for menus, story, HUD, and mission flow.
- Phaser 3 for the interactive outpost world.
- FastAPI and Python for mission state and simulation rules.
- Shared JSON contracts for integration.

## Work split and ownership

- **Person 1:** onboarding, briefing, destination choice, HUD, progression, saves, and debrief.
- **Person 2:** world scene, buildings, characters, interactions, resource simulation, events, decisions, and NASA data adapters.
- `src/person1/` is Person 1’s area. `src/person2/` is reserved for Person 2. `src/shared/contracts.js` contains shared data shapes; coordinate changes before integrating.

Person 1 owns app routing and will host Person 2’s Phaser scene at the mission handoff. Person 2 can work against the shared snapshot/request contracts without editing Person 1’s screens. The mock adapter in `src/person1/api.js` is the future API replacement point; the opening slice does not depend on FastAPI.

For parallel work, use separate `frontend-experience` and `gameplay-simulation` branches and integrate through pull requests into `main`.

## MVP direction

- Moon and Mars destinations, with a short mission suitable for a demo.
- Power, oxygen, water, food, crew health, and radiation risk.
- Five or six interactive structures and 8–10 authored events.
- Explain consequences clearly and distinguish NASA observations, derived calculations, and fictional training scenarios.
