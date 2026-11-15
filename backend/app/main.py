from threading import RLock
from uuid import uuid4
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .engine import SCENARIO, enter_hazard, gather_resource, initial_snapshot, resolve_action
from .player_api import router as player_router
from .science_context import get_science_context

app = FastAPI(title="OUTPOST ZERO Mission API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type"],
)
app.include_router(player_router)
missions = {}
lock = RLock()


class StartMission(BaseModel):
    profile: dict = Field(default_factory=dict)
    missionId: str = "mars-first-light"
    contractVersion: str = "1.0.0"
    seed: int = 2026


class ActionRequest(BaseModel):
    expectedDay: int = Field(ge=1)
    actionId: str
    placement: dict | None = None
    crewRole: str | None = None


class GatherRequest(BaseModel):
    expectedDay: int = Field(ge=1)
    nodeId: str
    crewRole: str | None = None


class HazardRequest(BaseModel):
    expectedDay: int = Field(ge=1)
    zoneId: str
    position: dict


class RestartRequest(BaseModel):
    seed: int = 2026


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "version": app.version}


@app.get("/api/v1/science/context")
def science_context():
    return get_science_context()


@app.get("/api/v1/content/{destination}")
def get_content(destination: str):
    if destination.lower() != "mars":
        raise HTTPException(status_code=404, detail="That destination is not available in this mission.")
    return SCENARIO


@app.post("/api/v1/missions", status_code=201)
def start_mission(payload: StartMission):
    if payload.missionId != SCENARIO["id"]:
        raise HTTPException(status_code=404, detail="Mission scenario not found.")
    session_id = str(uuid4())
    state = initial_snapshot(session_id, payload.seed, payload.profile)
    with lock:
        missions[session_id] = state
    return {"sessionId": session_id, "snapshot": state}


@app.get("/api/v1/missions/{session_id}")
def read_mission(session_id: str):
    with lock:
        state = missions.get(session_id)
        if state is None:
            raise HTTPException(status_code=404, detail="Mission session not found.")
        return {"snapshot": state}


@app.post("/api/v1/missions/{session_id}/actions")
def perform_action(session_id: str, payload: ActionRequest):
    with lock:
        state = missions.get(session_id)
        if state is None:
            raise HTTPException(status_code=404, detail="Mission session not found.")
        try:
            updated = resolve_action(state, payload.actionId, payload.expectedDay, payload.placement, payload.crewRole)
        except RuntimeError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        except ValueError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error
        missions[session_id] = updated
        return {"snapshot": updated}


@app.post("/api/v1/missions/{session_id}/gather")
def gather(session_id: str, payload: GatherRequest):
    with lock:
        state = missions.get(session_id)
        if state is None:
            raise HTTPException(status_code=404, detail="Mission session not found.")
        try:
            updated = gather_resource(state, payload.nodeId, payload.expectedDay, payload.crewRole)
        except RuntimeError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        except ValueError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error
        missions[session_id] = updated
        return {"snapshot": updated}


@app.post("/api/v1/missions/{session_id}/hazards")
def hazards(session_id: str, payload: HazardRequest):
    with lock:
        state = missions.get(session_id)
        if state is None:
            raise HTTPException(status_code=404, detail="Mission session not found.")
        try:
            updated = enter_hazard(state, payload.zoneId, payload.expectedDay, payload.position)
        except RuntimeError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        except ValueError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error
        missions[session_id] = updated
        return {"snapshot": updated}


@app.post("/api/v1/missions/{session_id}/restart")
def restart_mission(session_id: str, payload: RestartRequest):
    with lock:
        if session_id not in missions:
            raise HTTPException(status_code=404, detail="Mission session not found.")
        state = initial_snapshot(session_id, payload.seed, missions[session_id].get("profile"))
        missions[session_id] = state
        return {"snapshot": state}
