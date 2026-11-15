"""Persistent profile and mission-record endpoints owned by Person 1."""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from threading import RLock
from typing import Any, Iterator

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1/player", tags=["player records"])
_DEFAULT_DATABASE = Path(__file__).resolve().parents[1] / "outpost_zero_players.sqlite3"
_DATABASE = Path(os.environ.get("OUTPOST_PLAYER_DB", _DEFAULT_DATABASE))
_LOCK = RLock()


def _connect() -> sqlite3.Connection:
    _DATABASE.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(_DATABASE, timeout=5)
    connection.row_factory = sqlite3.Row
    connection.execute(
        """CREATE TABLE IF NOT EXISTS player_records (
            kind TEXT NOT NULL,
            record_id TEXT NOT NULL,
            profile_id TEXT,
            updated_at TEXT NOT NULL,
            payload TEXT NOT NULL,
            PRIMARY KEY (kind, record_id)
        )"""
    )
    connection.execute(
        "CREATE INDEX IF NOT EXISTS player_records_profile_idx "
        "ON player_records(profile_id, kind, updated_at DESC)"
    )
    return connection


@contextmanager
def _database() -> Iterator[sqlite3.Connection]:
    connection = _connect()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _put(kind: str, record_id: str, profile_id: str | None, payload: dict[str, Any]) -> dict[str, Any]:
    updated_at = str(payload.get("updatedAt") or payload.get("createdAt") or "")
    encoded = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    with _LOCK, _database() as connection:
        connection.execute(
            """INSERT INTO player_records(kind, record_id, profile_id, updated_at, payload)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(kind, record_id) DO UPDATE SET
                 profile_id=excluded.profile_id,
                 updated_at=excluded.updated_at,
                 payload=excluded.payload""",
            (kind, record_id, profile_id, updated_at, encoded),
        )
    return payload


def _get(kind: str, record_id: str) -> dict[str, Any] | None:
    with _LOCK, _database() as connection:
        row = connection.execute(
            "SELECT payload FROM player_records WHERE kind = ? AND record_id = ?",
            (kind, record_id),
        ).fetchone()
    return json.loads(row["payload"]) if row else None


@router.put("/profiles/{profile_id}")
def save_profile(profile_id: str, profile: dict[str, Any]):
    if profile.get("id") != profile_id:
        raise HTTPException(status_code=422, detail="Profile ID does not match the request path.")
    _put("profile", profile_id, profile_id, profile)
    return {"profile": profile}


@router.get("/profiles/{profile_id}")
def read_profile(profile_id: str):
    profile = _get("profile", profile_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Player profile not found.")
    return {"profile": profile}


@router.put("/runs/{run_id}")
def save_run(run_id: str, run: dict[str, Any]):
    if run.get("id") != run_id:
        raise HTTPException(status_code=422, detail="Mission run ID does not match the request path.")
    profile_id = run.get("profileId")
    _put("run", run_id, str(profile_id) if profile_id else None, run)
    return {"run": run}


@router.get("/runs/{run_id}")
def read_run(run_id: str):
    run = _get("run", run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Mission record not found.")
    return {"run": run}


@router.get("/profiles/{profile_id}/latest-run")
def read_latest_run(profile_id: str):
    with _LOCK, _database() as connection:
        row = connection.execute(
            """SELECT payload FROM player_records
               WHERE kind = 'run' AND profile_id = ?
               ORDER BY updated_at DESC LIMIT 1""",
            (profile_id,),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="No mission record found for this player.")
    return {"run": json.loads(row["payload"])}
