# OUTPOST ZERO · Mars Survival

OUTPOST ZERO is a short, story-led, top-down pixel survival game. The commander lands with a small crew, walks the terrain, gathers salvage and local materials, builds the outpost tile by tile, and decides how the crew spends each sol. The current playable mission covers seven sols; its scenario can grow toward 30. Mars is the MVP destination. Moon mode is a later expansion.

This branch replaces the previous frontend. It does not include the prior landing page, dashboard, or mission-screen components.

## Start the game on Windows

1. Install Node.js 20 or newer and Python 3.10 or newer.
2. In PowerShell, open this repository folder and run `npm.cmd install` once.
3. (Optional) Create the Python environment and install the API packages if you want to run Mission Control alongside the game:

   ```powershell
   py -3 -m venv backend\.venv-local
   .\backend\.venv-local\Scripts\python.exe -m pip install -r backend\requirements.txt
   ```

4. (Optional) In one PowerShell window, start Mission Control:

   ```powershell
   .\backend\.venv-local\Scripts\python.exe -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```

5. Start the game in a PowerShell window. If Mission Control is not available, the game switches to its local saved simulation and NASA fact fallback:

   ```powershell
   npm.cmd run dev
   ```

6. Open the local Vite address (usually `http://localhost:5173`). `.env.local` connects to the optional API at `http://127.0.0.1:8000`.

Build the static frontend with `npm.cmd run build`. The API provides authoritative sessions when it is available; local rules and the local mission log keep the game playable if it is offline.

## The player journey

1. Enter a callsign, choose an astronaut suit, and pack one starter kit: alloy for construction, regolith for surface building, or ice for a greenhouse. These are game supplies, not real mission quantities. Mars is playable; the Moon is a clearly marked expansion preview.
2. Open **How to Play** or **Space Academy** if you want the field guide or short science cards. Watch or skip the landing introduction, review the mission brief, then step onto the terrain.
3. Explore the top-down tile world using WASD or arrow keys. Click a point to walk there.
4. Gather alloy, regolith, and ice deposits. Walk up to a deposit and press **E**, or click the deposit.
5. Hear the sol’s dialogue or event alert. Event choices show immediate and delayed consequences; they are story decisions alongside the main crew plan.
6. Explore the world, talk over the plan, gather resources, inspect the base, and choose one crew action. Build actions require materials and a clear map tile; click to place the building before confirming.
7. Confirming the plan resolves that sol. A sol-end report pauses the action, compares the resource meters before and after, shows inventory carried forward, and previews the next story beat. Continue when ready.
8. Finish the seven-sol flight, review the crew, habitat, and science outcomes, reflect on the biggest trade-off, and start another flight.

Choose Solo Flight or **Crew Co-op · Pass & Play** before landing. In co-op, two people share one screen: the regular daily plan alternates by sol, and the other player handles that sol’s event response. The end-of-sol report is the handoff moment. It needs no account or network connection; this MVP is local co-op, not online multiplayer.

The in-world HUD gives the commander an act and sol, mission objectives, collapsible resource meters, collapsible story and action panels, and a collapsible field pack. Options include larger text, reduced motion (also follows the operating system preference), and read-aloud dialogue with visible captions. The pause panel stops the Phaser world without advancing the current sol. ORBIT offers an optional authored hint; the mission log records actions, branches, hazards, and outcomes; NASA context has its own fact/archive panel.

### Controls

- **WASD / arrow keys:** walk
- **Click open terrain:** walk to that tile
- **E:** gather a nearby deposit or inspect a nearby structure
- **Click a deposit:** gather it
- **Build action → click a clear tile → confirm:** place a structure
- **HUD buttons:** view all meters, manage the crew, and open the science notes

Exploration and material gathering are free actions. The main crew action advances the sol. Event choices are separate story decisions. Crew specialties affect the simulation: Mika improves habitat integrity during build actions, Sol adds modeled science progress to research/rover work, and PIP-3 collects two units per gather action.

## What the game models

The seven-sol Mars scenario is a four-act story: **Landfall (Sols 1–2), Make a Home (3–4), The Red Frontier (5–6), First Light (7).** Each playable sol has dialogue, free exploration and gathering, one main crew plan, daily system resolution, and a report before the next shift. Story events appear on Sols 2–7, with multiple authored variants on Sols 2, 4, and 6. They include array dust, a habitat or recycler warning, a regolith slide, a short communications window, crew fatigue, a long shadow, and a final sample opportunity. Every event has at least two options; choices branch the log and may schedule delayed effects. No branch ends in crew death. The final debrief explains the crew, habitat, and science outcome from the accumulated choices.

The current gatherable inventory is alloy, regolith, and ice. The starter pack affects the opening inventory. Build recipes, resource counts, costs, daily changes, and hazard effects are simplified game-balancing values. They are not NASA measurements, engineering specifications, radiation doses, or mission forecasts. NASA context is shown separately from those fictional game values.

Mission sessions are held in API memory for the local demo. The browser remembers the session ID, but restarting the API clears its sessions; start a new flight after that.

## Project layout

- `src/game/Game.jsx` — newly authored opening, touchdown, story flow, corner HUD, actions, inventory, crew and science panels.
- `src/game/GameScene.jsx` — Phaser pixel-tile terrain, roaming commander, deposits, structures, and hazards.
- `src/game/game.css` — new game presentation and responsive layout.
- `src/game/missionApi.js` — frontend API calls.
- `backend/app/engine.py` — mission transitions, action consequences, gathering, building, hazards, and endings.
- `backend/app/main.py` — FastAPI session and gameplay endpoints.
- `data/scenarios/mars-first-light.json` — authored seven-sol Mars scenario and game-model values.
- `docs/MARS_FIRST_LIGHT_CAMPAIGN.md` — act-by-act campaign beats, event choices, turn flow, report, and pass-and-play rules.
- `docs/` — project and workflow references.

## Local branch and preserved work

The replacement game is on the local `minecraft-survival` branch. It was created from the backend baseline. The previous frontend work was preserved in a Git stash on its original `visuals/mars-outpost-art` branch and is not used by this game. This branch has not been pushed.
