# Person B Work Plan

Person B owns the interactive outpost world and the game systems that make player choices matter. Keep gameplay code in `src/person2/`; coordinate any change to `src/shared/contracts.js` or Person 1's app handoff before integration.

## Phase 1 — First playable sol

**Goal:** Continue from Person 1's mission-ready handoff into a visible Mars outpost, make one meaningful first-sol choice, and show the consequence in the world.

- [x] Add a Phaser 3 outpost scene with selectable habitat, solar array, and greenhouse.
- [x] Add a Mars First Light scenario with clearly labeled illustrative values.
- [x] Define a mission snapshot/action contract seam and a local adapter that can later be replaced by FastAPI.
- [x] Resolve the first action deterministically and persist the snapshot in the browser.
- [x] Add compact resource readouts, the mission objective, crew feedback, an ORBIT hint, and one sourced-context placeholder card.
- [x] Connect the launch handoff to the world without replacing Person 1's opening flow.
- [x] Set Mars MVP duration to 7 sols; retain a data-driven duration so the campaign can later expand toward 30.

**Complete when:** A player can go from launch clearance to the outpost, choose array startup or habitat diagnostics, see the structure and game values update, and restart the first-sol scenario.

## Phase 2 — Core turn loop and backend service

- [x] Expand the snapshot/action contract to cover build, repair, power priority, rover excursion, crew rest, and turn advancement.
- [x] Move authoritative rules into pure Python functions; keep game values and action definitions in shared versioned JSON.
- [x] Expose mission create/read/action/restart routes in FastAPI; validate action availability and stale turns.
- [x] Connect the browser adapter to FastAPI when configured and preserve deterministic local fallback behavior.
- [x] Resolve turns in a documented deterministic order and retain a player-readable event log.

**Resolution order:** validate active session and expected day → validate the selected action and prerequisites → apply immediate resource/build/power-mode changes → apply daily generation and upkeep from structures active this sol → update oxygen, water, food, science, exposure-risk, crew, and habitat tracks → append action and systems-check log entries → check the mission end → advance day and calculate available actions.

**Complete when:** A seven-sol mission can be played from start to finish through the API or local adapter. The same seed and choice sequence produce the same outcome. A stale action is rejected instead of being applied twice.

## Phase 3 — Buildings, resources, and consequence feedback

- [x] Implement connected tracks for power, oxygen, water, food, habitat integrity, crew wellbeing, abstract exposure risk, and science progress.
- [x] Add six selectable structures: habitat, solar array, greenhouse, rover, life-support module, and storm shelter.
- [x] Give actions costs, prerequisites, immediate effects, and later-sols effects; surface the changes in readouts, crew lines, ORBIT guidance, and event log.
- [x] Label scenario quantities as game units and exposure risk as an abstract meter, never a radiation dose or NASA operational value.

**Complete when:** Choices create understandable competing needs and delayed consequences. For example, the greenhouse costs power and water before later food gains; life support uses power to improve oxygen and water recovery; rover work advances science while using supplies and raising modeled exposure risk; the shelter draws power and reduces that risk over later sols.

## Phase 4 — Events and branching scenarios

- [x] Author nine events in three event windows (Sols 2, 4, and 6). Each has a trigger, eligible-response prerequisites, two player choices, clear copy, and immediate and/or delayed effects.
- [x] Select event variants deterministically from the mission seed and current outpost conditions; record events, choices, and delayed consequences in the mission log.
- [x] Keep an always-available recovery response in each event window; event responses resolve before the regular work action and do not consume the sol.
- [x] Record branch choices and calculate crew-safety, habitat, and science objectives for the debrief.

**Complete when:** A short mission contains a complication that changes the player's available options and leads to a visible branch in the debrief.

## Phase 5 — ORBIT, science context, and debrief

- [x] ORBIT explains active events, consequences, and the distinction between game model and real source material.
- [x] Add NASA Image and Video Library archive context through the backend. The UI labels archived imagery separately from the simulation and provides source, date, unit/media type, attribution, and interpretation metadata.
- [x] Cache the NASA source record for six hours in the API process and fall back to an attributed NASA Mars fact when the service is unavailable. The static/local game has the same offline reference fallback.
- [x] Add distinct debrief endings (full science success, safe outpost with study continuing, lessons/partial success, and emergency-return recommendation) with objective status and the player's recorded event branches.

**Complete when:** A player can explain at least one engineering trade-off and tell a sourced observation from a game-model value.

## Phase 6 — Integration, accessibility, and expansion readiness

- [x] Keep pointer selection and add keyboard-accessible structure buttons; add visible focus styles, accessible resource meters, readable event/debrief status, reduced-motion rules, and responsive source metadata. Manually checked keyboard activation and a 390px viewport with no horizontal overflow.
- [ ] Check physical touchscreen input, an OS-level reduced-motion setting, and a contrast audit on target devices before release; only the browser pointer and authored media rules were available in this pass.
- [x] Retain seven-sol deterministic mission, restart/replay, existing local save, and guaranteed event recovery actions. Keep API network failures on the local rules/factual fallback path.
- [x] Document production build, local demo, API-on/API-off behavior, NASA-source fallback, and a deterministic seed for a repeatable demo.
- [x] Keep Mars scenario data separate and data-driven; the API reports Moon as unavailable until a separate lunar scenario and mechanics are authored and reviewed.
- [ ] Playtest resource balance with children/educators before expanding the Mars campaign toward 30 sols or authoring Moon-specific rules.

**Complete when:** The mission can be completed and replayed from a fresh browser, the demo has a fallback, and expansion work does not destabilize Mars.

## Phase 4–6 implementation notes

- Event windows are authored at Sols 2, 4, and 6. One event is selected from each window with `seed` and eligible scenario prerequisites. The event choice is a narrative response that resolves before the regular action for that sol.
- Events use illustrative game values only. Event text describing dust, pressure, filters, and route obstructions is a fictional training scenario, not a current Mars forecast or NASA operational model.
- The NASA source connector uses the NASA Image and Video Library search endpoint for archived Mars imagery. If it is unavailable, the game presents a NASA Science Mars fact as an offline reference. Neither source feeds resource-generation equations.
- Science threshold, ending thresholds, event effects, and event timing are prototype balance assumptions. Tune them with play sessions; do not present them as real crew-safety limits.
- Deterministic demo seed: `2026`. Mission history and actions persist in the browser; FastAPI keeps sessions in memory for the local demo. Static mode works without the API or an API key.
- Live walkthrough completed through the API: mission start, event branch choices, delayed effects, seven-sol completion, and full debrief. API-free walkthrough confirmed the local save, event branch, NASA fact fallback, and restart. The NASA archive image and attribution metadata loaded from NASA's search endpoint.
- `py -3` is not installed in this Windows environment; FastAPI was already running and hot-reloaded for the walkthrough. A standalone backend install/run from a fresh environment still needs a machine with Python available.

## Phase 6 demo and release checklist

- [x] `npm run build` creates the static browser bundle.
- [x] Keep `VITE_OUTPOST_API_URL` optional; no API means the deterministic local game remains playable.
- [x] Use `/api/v1/health` to confirm the local backend and `/api/v1/science/context` to inspect the NASA record or fallback.
- [ ] Configure a public static host only after the team chooses its host and approves publishing. No NASA key is needed for the NASA Image and Video Library search.
- [ ] Before a judged demo, clear the browser save or choose **RESTART MISSION**, then play seed `2026` and capture the final branch/debrief.
