# OUTPOST ZERO · Mars Survival

OUTPOST ZERO is a short, story-led, top-down pixel survival game. The commander lands with a small crew, explores the terrain, gathers salvage and local materials, builds an outpost, and decides how the crew spends each sol. The current playable mission covers seven sols and can later expand toward 30. Mars is the MVP destination; Moon mode is a future expansion.

This version replaces the earlier dashboard-style frontend with a new game flow and pixel-art world.

## Run on Windows

1. Install Node.js 20 or newer and Python 3.10 or newer.
2. From this folder, install the frontend packages once: `npm.cmd install`.
3. (Optional) Start the API in a separate PowerShell window. If it is unavailable, the browser uses a local saved simulation and NASA fact fallback.

   ```powershell
   py -3 -m venv backend\.venv-local
   .\backend\.venv-local\Scripts\python.exe -m pip install -r backend\requirements.txt
   .\backend\.venv-local\Scripts\python.exe -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
   ```

4. Start Vite with `npm.cmd run dev` and open the address it prints (usually `http://localhost:5173`).

Build the static frontend with `npm.cmd run build`. `.env.local` can set `VITE_OUTPOST_API_URL=http://127.0.0.1:8000` to use the API. The optional player-record endpoints store profiles and flight records in a local SQLite file excluded from Git.

## Player journey

1. Choose a callsign, suit, play mode, and starter pack.
2. Watch or skip the landing scene, read the mission brief, then step onto Mars.
3. Explore the tile map with WASD or arrow keys; click open ground to walk.
4. Gather alloy, regolith, and ice by approaching a glowing deposit and pressing **E**, or clicking the deposit.
5. Respond to story events. Choices show immediate and delayed consequences and are recorded in the mission log.
6. Choose one crew action per sol. For construction, gather the listed materials, select the build task, click a clear tile, and confirm. Gathering and walking are free.
7. Review the sol-end report, carried supplies, and next story beat before starting the next sol.
8. Complete the seven-sol mission, view the debrief, and start another flight.

Choose Solo Flight or **Crew Co-op · Pass & Play** before landing. Co-op shares one screen: the daily plan alternates between players and the other player handles the event response. The handoff happens in the sol-end report. This MVP is local pass-and-play, not online multiplayer.

## Controls and HUD

- **WASD / arrow keys:** move
- **Click open terrain:** walk to that point
- **E:** gather a nearby deposit or inspect a nearby structure
- **Click a deposit:** walk over and gather
- **Build task → click an empty tile → confirm:** place a structure
- **Cancel Placement:** exit placement mode and return to exploring
- **Pause:** pause the mission, open the field guide, or start a fresh flight

The HUD includes collapsible resource meters, objectives, dialogue, action panel, and field pack. **Crew** assigns Mika, Sol, or PIP-3; **ORBIT** offers a hint; **Mission Log** records events; **Space Fact** opens NASA context. **Options** includes text size, reduced motion, and spoken dialogue.

## Mission and science model

The seven-sol Mars mission follows four acts: **Landfall (Sols 1–2), Make a Home (3–4), The Red Frontier (5–6), First Light (7).** Events include dust on the array, habitat or recycler warnings, a regolith slide, a communications window, crew fatigue, terrain shadow, and a final sample opportunity. Choices branch the mission log and can schedule delayed effects. The final debrief reports crew safety, habitat condition, and science progress.

NASA context is shown separately from the game simulation. When online, the API fetches an archived Mars image and metadata from NASA's Image and Video Library. If unavailable, it falls back to NASA's Mars facts page, including the length of a Martian sol. Resource counts, recipes, hazard penalties, and crew outcomes are fictional game-balancing values—not NASA measurements, engineering specifications, radiation doses, or mission forecasts.

## Project layout

- `src/game/Game.jsx` — opening, landing story, HUD, actions, crew and science panels
- `src/game/GameScene.jsx` — Phaser pixel world, commander, deposits, structures, hazards
- `src/game/missionApi.js` — frontend mission and science requests
- `src/game/localMission.js` — offline mission simulation
- `backend/app/engine.py` — mission transitions and resource model
- `backend/app/main.py` — FastAPI mission, science, and gameplay routes
- `backend/app/player_api.py` — optional persistent profile and flight-record routes
- `data/scenarios/mars-first-light.json` — seven-sol scenario and game-model values
- `docs/MARS_FIRST_LIGHT_CAMPAIGN.md` — act-by-act campaign flow
- `docs/PERSON_B_WORK_PLAN.md` — Person B work plan
