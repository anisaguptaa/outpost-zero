"""Pure, deterministic mission transitions; scenario values are game values."""
from copy import deepcopy
from pathlib import Path
import json

SCENARIO_PATH = Path(__file__).resolve().parents[2] / "data" / "scenarios" / "mars-first-light.json"
with SCENARIO_PATH.open(encoding="utf-8") as source:
    SCENARIO = json.load(source)


def _clamp(value):
    return max(0, min(100, value))


def _actions_for(state):
    if state["status"] != "active":
        return []
    candidates = SCENARIO["firstActions"] if state["day"] == 1 else SCENARIO["dailyActions"]
    available = []
    for action in candidates:
        requirement = action.get("requiresBuilding")
        if requirement:
            building = next((item for item in state["buildings"] if item["id"] == requirement["id"]), None)
            if not building or building["status"] != requirement["status"]:
                continue
        minimum = action.get("minResource")
        if minimum and state["resources"].get(minimum["key"], 0) < minimum["value"]:
            continue
        secondary_minimum = action.get("minResourceSecondary")
        if secondary_minimum and state["resources"].get(secondary_minimum["key"], 0) < secondary_minimum["value"]:
            continue
        maximum = action.get("maxResource")
        if maximum and state["resources"].get(maximum["key"], 0) >= maximum["value"]:
            continue
        available.append({key: value for key, value in action.items() if key not in ("requiresBuilding", "minResource", "minResourceSecondary", "maxResource")})
    return available


def initial_snapshot(session_id, seed=2026):
    state = {
        "missionId": session_id,
        "scenarioId": SCENARIO["id"],
        "destination": SCENARIO["destination"],
        "day": 1,
        "durationDays": SCENARIO["durationDays"],
        "seed": seed,
        "resources": deepcopy(SCENARIO["initialResources"]),
        "buildings": deepcopy(SCENARIO["buildings"]),
        "powerMode": "balanced",
        "events": [{"id": "touchdown", "day": 1, "text": "Touchdown confirmed. The crew is at the outpost."}],
        "status": "active",
        "lastOutcome": None,
    }
    state["availableActions"] = _actions_for(state)
    return state


def resolve_action(snapshot, action_id, expected_day):
    if snapshot["status"] != "active":
        raise ValueError("This mission has already ended. Restart to play again.")
    if expected_day != snapshot["day"]:
        raise RuntimeError("This mission has advanced. Refresh the outpost before choosing again.")
    action = next((item for item in _actions_for(snapshot) if item["id"] == action_id), None)
    if action is None:
        raise ValueError("That action is not available with the current outpost systems and supplies.")

    state = deepcopy(snapshot)
    before_day = state["day"]
    resources = state["resources"]
    for key, delta in action.get("effects", {}).items():
        if key == "scienceProgress":
            resources[key] = _clamp(resources.get(key, 0) + delta)
        else:
            resources[key] = _clamp(resources[key] + delta)
    if action.get("buildingId") and action.get("buildingStatus"):
        for building in state["buildings"]:
            if building["id"] == action["buildingId"]:
                building["status"] = action["buildingStatus"]
                if action.get("activationDelayDays"):
                    building["onlineFromDay"] = before_day + action["activationDelayDays"]
    if action.get("setPowerMode"):
        state["powerMode"] = action["setPowerMode"]

    daily = SCENARIO["dailyResolution"]
    online = {building["id"] for building in state["buildings"]
              if building["status"] == "online" and building.get("onlineFromDay", 1) <= before_day}
    solar = daily["solarGeneration"] if "solar-array" in online else 0
    mode_delta = 0
    if state["powerMode"] == "life-support":
        mode_delta = daily["lifeSupportPriorityPower"]
    elif state["powerMode"] == "research":
        mode_delta = daily["researchPriorityPower"]
        resources["scienceProgress"] = _clamp(resources["scienceProgress"] + daily["researchScience"])
    structure_loads = (
        (daily["lifeSupportPowerUse"] if "life-support" in online else 0)
        + (daily["greenhousePowerUse"] if "greenhouse" in online else 0)
        + (daily["shelterPowerUse"] if "storm-shelter" in online else 0)
    )
    resources["power"] = _clamp(resources["power"] + daily["powerBase"] + solar + mode_delta + structure_loads)
    oxygen_delta = daily["oxygen"] if resources["power"] >= daily["minimumPowerForOxygen"] else daily["oxygenLowPower"]
    if "life-support" in online and resources["power"] >= daily["minimumPowerForOxygen"]:
        oxygen_delta += daily["lifeSupportOxygenRecovery"]
    if state["powerMode"] == "life-support" and resources["power"] >= daily["minimumPowerForOxygen"]:
        oxygen_delta += daily["lifeSupportPriorityOxygen"]
    resources["oxygen"] = _clamp(resources["oxygen"] + oxygen_delta)
    water_delta = daily["water"]
    if "life-support" in online:
        water_delta += daily["lifeSupportWaterRecovery"]
    greenhouse_online = "greenhouse" in online
    if greenhouse_online:
        water_delta += daily["greenhouseWaterUse"]
    resources["water"] = _clamp(resources["water"] + water_delta)
    resources["food"] = _clamp(resources["food"] + daily["food"] + (daily["greenhouseFood"] if greenhouse_online else 0))
    risk_delta = daily["radiationRiskDaily"] - (daily["shelterRiskReduction"] if "storm-shelter" in online else 0)
    resources["radiationRisk"] = _clamp(resources["radiationRisk"] + risk_delta)
    wellbeing_delta = daily["crewWellbeing"]
    if resources["radiationRisk"] >= daily["crewRiskPenaltyThreshold"]:
        wellbeing_delta += daily["crewRiskPenalty"]
    resources["crewWellbeing"] = _clamp(resources["crewWellbeing"] + wellbeing_delta)
    resources["habitatIntegrity"] = _clamp(resources["habitatIntegrity"] + daily["habitatIntegrity"])

    summary = (f"Sol {before_day} systems check (game units): power {resources['power']}, oxygen {resources['oxygen']}, "
               f"water {resources['water']}, food {resources['food']}, crew {resources['crewWellbeing']}, "
               f"habitat {resources['habitatIntegrity']}, exposure risk {resources['radiationRisk']}, "
               f"science {resources['scienceProgress']}.")
    state["events"].append({"id": action_id, "day": before_day, "text": action["log"]})
    state["events"].append({"id": f"systems-check-{before_day}", "day": before_day, "text": summary})
    state["lastOutcome"] = {"actionId": action_id, "title": action["title"], "text": f"{action['log']} {summary}"}
    if before_day >= state["durationDays"]:
        state["status"] = "completed"
        state["lastOutcome"]["text"] += " The seven-sol training mission is complete; Mission Control is ready to review the flight."
    else:
        state["day"] = before_day + 1
    state["availableActions"] = _actions_for(state)
    return state
