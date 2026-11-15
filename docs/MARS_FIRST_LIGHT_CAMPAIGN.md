# OUTPOST ZERO — First Light campaign flow

## Play modes

- **Solo flight:** One commander makes each choice.
- **Crew co-op (MVP):** Two people share one screen and pass control between decisions. The regular crew plan alternates between commander and specialist by sol; the event response goes to the other player that sol. No account or network sync is needed.
- **Online multiplayer:** Out of scope for this prototype. It needs shared sessions, reconnect handling, access control, and conflict resolution. Do not label pass-and-play as online multiplayer.

## Mission rhythm

Each playable sol follows the same clear loop:

1. **Arrive at the shift:** The next story beat or event appears, with ORBIT explaining the choice in plain language.
2. **Explore the world:** Walk, inspect structures, gather from deposits, and see the current weather/hazard visuals. Roaming is free.
3. **Make one crew plan:** Build, repair, prioritize, explore, study, rest, or conserve. The choice shows its immediate game-model effects and delayed effects.
4. **Resolve the sol:** Systems update, choices enter the mission log, and the map/crew react.
5. **Sol-end report:** Show the action, resource changes, carried materials, crew note, next act/event, and the continue button. The player controls when the next sol begins.

Event choices are separate narrative decisions and do not consume the main crew action. They are followed by exploration and the regular plan for that sol.

## Acts and story beats

| Act | Sols | Story | Player-facing purpose |
|---|---:|---|---|
| I · Landfall | 1–2 | Touchdown, salvage, first power, then dust or a systems warning | Learn movement, gathering, build placement, and the power trade-off |
| II · Make a Home | 3–4 | A regolith slide complicates construction; a habitat/recycler warning tests the plan | Choose between faster construction, safe repair, water recovery, and crew time |
| III · The Red Frontier | 5–6 | A buried signal draws the rover outward; a long shadow or fatigue window arrives | Decide how much power and crew capacity to spend on science |
| IV · First Light | 7 | Final sample window, last crew plan, flight debrief | Finish the soil study or protect reserves, then review the causes and branches |

### Sol-by-sol playable script

| Sol | Opening beat and visual cue | Player experience and decision | Shift close |
|---|---|---|---|
| 1 · Touchdown | Lander descends through dust; team steps out beside the habitat. Mika reports stable but unpowered systems. | Learn movement and inspect the world. Salvage alloy, then choose the first system priority: restore array power or spend power on habitat checks. | Show touchdown condition, the first system result, and the next day’s alert. |
| 2 · Dust front | Weather marker moves over the array; ORBIT flags one eligible complication. | Pick one of the event’s responses, then explore and choose the crew’s main plan. Introduce that immediate safety and later reserves can pull in different directions. | Show the array/base change, resources, and branch recorded in the log. |
| 3 · Make a home | Regolith ridge shifts; crew marks the slide with beacons on the map. | Clear the route using rover support or take a safer detour. Gather what is needed and choose what to build or maintain. | Preview the habitat/recycler check and carry materials forward. |
| 4 · Keep the airlock | Habitat light blinks amber; Mika or Sol calls out pressure, recycler, or soil-signal news. | Respond to one eligible event. Decide how to balance crew comfort, power, water recovery, and science; then pick the day’s work. | Show whether the crew protected the base or banked a science lead. |
| 5 · Signal window | A relay beacon pulses over the horizon; the buried soil pattern is now a mission lead. | Send a full packet for a stronger result or compress it to preserve power. The player can roam to deposits and choose one regular crew action. | Preview the long shadow/fatigue/sample check; in co-op, name the next decision owner. |
| 6 · Red frontier | The sun is partly obscured; crew idle animation and warmer alert lighting cue fatigue and reduced input. | Respond to one eligible event. Protect recovery or keep the instruments running, then choose the final full-sol plan. | Show accumulated branches and the final sample opportunity. |
| 7 · First Light | Dawn warms the horizon; final sample beacon appears and the crew gathers near the habitat. | Choose a surface sample or safe remote scan, then make one last plan. A cautious reserve-focused outcome is valid; science is not the only success measure. | Final sol report pauses into a debrief with the ending, crew and habitat state, science result, and story branches. |

The visual language should evolve with the story: touchdown landing glow and dust; amber hazard beacons for active events; map pips at the event location; idle crew gathered near the base; green/amber/quiet indicators on structures; and a dawn shift at Sol 7. Keep the tile world playable behind the HUD. Use brief dialogue cards and map changes to carry story information; avoid turning act transitions into full-screen menu pages.

## Authored event windows

Sols 2, 4, and 6 keep their deterministic scenario variants. New story windows on Sols 3, 5, and 7 ensure every day after touchdown has a narrative beat. A fixed demo seed keeps the same variant sequence reproducible. Every event has at least two readable options, including a cautious response; no event can end the mission with crew death.

1. **Sol 2 — Dust on the array / water filter warning / blocked rover route.** Clear the array and spend power/crew energy, or wait and accept a delayed reserve cost; service or defer the filter; reroute or hold the rover.
2. **Sol 3 — Regolith slide.** Use power and crew time to clear the habitat path, or mark a slower safe route and delay some work.
3. **Sol 4 — Habitat pressure fluctuation / recycler stall / soil signal.** Seal or isolate the habitat; reset or ration the recycler; scan the signal or log it for later.
4. **Sol 5 — Relay window.** Spend power on a focused transmission and gain a clearer remote survey, or keep the reserve and use the rover’s onboard record with a smaller science gain.
5. **Sol 6 — Solar shadow / crew fatigue / sample seal check.** Shift optional loads or keep research running; protect a recovery window or shorten it; verify or quarantine the sample.
6. **Sol 7 — Final sample window.** Send the crew for a final surface sample with stronger science and a modeled exposure/wellbeing cost, or run a remote scan with a smaller gain and more supplies retained.

Effects, material recipes, system units, and exposure risk are authored game values. They are not NASA measurements, dose estimates, or operational forecasts. NASA source context remains separate.

## Consequence and ending flow

- The event log records triggers, choices, day-end system changes, crew assignments, gathering, hazards, and delayed effects.
- Materials left in the pack carry into the next sol.
- After Sol 7, the same day-end report leads into the debrief: crew outcome, habitat status, science outcome, choices taken, and one reflection question.
- Existing endings remain: science mission complete, safe outpost/study continues, lessons secured, or emergency return recommended. The debrief explains why; it does not grade or shame the player.

## Multiplayer handoff

For pass-and-play, the decision banner names whose turn it is. On odd sols the commander owns the regular plan and the specialist owns any event response; on even sols the specialist owns the regular plan and the commander owns any event response. The sol-end report is the natural handoff point. Each player can still discuss choices together; no hidden information or competitive scoring is introduced.
