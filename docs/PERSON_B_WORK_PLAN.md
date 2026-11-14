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

- Author 8–10 scenario events with triggers, choices, prerequisites, immediate and delayed outcomes, and explanatory copy.
- Add seeded randomness/logging for reproducible runs; ensure each event has a reasonable recovery path.
- Add branch-aware objective progress and safe/partial-success outcomes.

**Complete when:** A short mission contains a complication that changes the player's available options and leads to a visible branch in the debrief.

## Phase 5 — ORBIT, science context, and debrief

- Add optional contextual hints and separate “Mission tip” from “Space fact.”
- Attach source, date/period, unit, attribution, and interpretation metadata to any real observation used.
- Keep NASA observations distinct from authored game rules and simulated outputs; cache data and provide an offline fallback.
- Build a debrief that explains consequences and recognizes safety, recovery, and reasoning rather than only a single score.

**Complete when:** A player can explain at least one engineering trade-off and tell a sourced observation from a game-model value.

## Phase 6 — Integration, accessibility, and expansion readiness

- Test keyboard, mouse, touch, reduced motion, contrast, labels, error/retry, reset, and narrow-screen behavior.
- Balance the 7-sol Mars mission with playtesting; extend toward 30 sols only after the short mission reads well.
- Stabilize demo deployment and deterministic demo scenarios; verify offline/static content behavior.
- Prepare destination configuration for a later Moon mode without making the Mars MVP depend on lunar content.

**Complete when:** The mission can be completed and replayed from a fresh browser, the demo has a fallback, and expansion work does not destabilize Mars.
