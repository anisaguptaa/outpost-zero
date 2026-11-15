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
    if state.get("activeEvent"):
        event = next(item for item in SCENARIO["events"] if item["id"] == state["activeEvent"]["id"])
        candidates = [{**choice, "id": f"event:{event['id']}:{choice['id']}", "isEventChoice": True,
                       "eventId": event["id"], "eventTitle": event["title"]} for choice in event["choices"]]
    else:
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
        requirements = action.get("requiresResources", [])
        if any(state["resources"].get(req["key"], 0) < req["minimum"] for req in requirements):
            continue
        available.append({key: value for key, value in action.items() if key not in ("requiresBuilding", "minResource", "minResourceSecondary", "maxResource", "requiresResources")})
    return available


def initial_snapshot(session_id, seed=2026, profile=None):
    profile = profile or {}
    kit = next((item for item in SCENARIO.get("starterKits", []) if item["id"] == profile.get("starterKit")), SCENARIO.get("starterKits", [{}])[0])
    inventory = deepcopy(SCENARIO.get("startingInventory", {}))
    for material, amount in kit.get("inventory", {}).items():
        inventory[material] = inventory.get(material, 0) + amount
    state = {
        "missionId": session_id,
        "scenarioId": SCENARIO["id"],
        "destination": SCENARIO["destination"],
        "day": 1,
        "durationDays": SCENARIO["durationDays"],
        "seed": seed,
        "resources": deepcopy(SCENARIO["initialResources"]),
        "buildings": deepcopy(SCENARIO["buildings"]),
        "inventory": inventory,
        "starterKits": deepcopy(SCENARIO.get("starterKits", [])),
        "profile": {"callsign": str(profile.get("callsign", "Cadet"))[:16], "avatarId": profile.get("avatarId", "ember"), "starterKit": kit.get("id", "repair-kit"), "destination": "mars", "playMode": "crew-coop" if profile.get("playMode") == "crew-coop" else "solo", "partnerCallsign": str(profile.get("partnerCallsign", "Crewmate"))[:16]},
        "gatherNodes": deepcopy(SCENARIO.get("gatherNodes", [])),
        "hazardsEntered": {},
        "buildCosts": deepcopy(SCENARIO.get("buildCosts", {})),
        "hazardZones": deepcopy(SCENARIO.get("hazardZones", [])),
        "powerMode": "balanced",
        "events": [{"id": "touchdown", "day": 1, "text": "Touchdown confirmed. The crew is at the outpost."}],
        "status": "active",
        "lastOutcome": None,
        "activeEvent": None,
        "branches": [],
        "delayedEffects": [],
        "debrief": None,
    }
    state["availableActions"] = _actions_for(state)
    return state


def _event_is_eligible(state, event):
    for requirement in event.get("prerequisites", []):
        if requirement["type"] == "building":
            building = next((item for item in state["buildings"] if item["id"] == requirement["id"]), None)
            if not building or building["status"] != requirement["status"]:
                return False
        elif requirement["type"] == "resource" and state["resources"].get(requirement["key"], 0) < requirement["minimum"]:
            return False
    return True


def resolve_action(snapshot, action_id, expected_day, placement=None, crew_role=None):
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
    target_id = action.get("buildingId") if action.get("buildingStatus") == "online" else None
    cost = SCENARIO.get("buildCosts", {}).get(target_id)
    if cost:
        if not placement or not (0.08 <= placement.get("x", -1) <= 0.92 and 0.33 <= placement.get("y", -1) <= 0.91):
            raise ValueError("Choose a clear build tile before confirming this structure.")
        if any(state["inventory"].get(item, 0) < amount for item, amount in cost.items()):
            raise ValueError("Gather the required materials before placing this structure.")
        for building in state["buildings"]:
            if building["id"] != target_id and building.get("status") == "online" and abs(building["x"] - placement["x"]) < 0.09 and abs(building["y"] - placement["y"]) < 0.12:
                raise ValueError("That tile is occupied. Pick another clear patch of ground.")
        for node in state.get("gatherNodes", []):
            if node["amount"] > 0 and abs(node["x"] - placement["x"]) < 0.06 and abs(node["y"] - placement["y"]) < 0.08:
                raise ValueError("A resource deposit occupies that tile. Choose another tile.")
        for item, amount in cost.items():
            state["inventory"][item] -= amount
    if action.get("isEventChoice"):
        for key, delta in action.get("effects", {}).items():
            resources[key] = _clamp(resources.get(key, 0) + delta)
        for delayed in action.get("delayedEffects", []):
            state["delayedEffects"].append({"dueDay": before_day + delayed["days"], "effects": delayed["effects"], "text": delayed["text"]})
        state["branches"].append({"day": before_day, "eventId": action["eventId"], "eventTitle": action["eventTitle"], "branch": action.get("branch"), "choice": action["title"]})
        state["events"].append({"id": action_id, "day": before_day, "kind": "branch", "text": action["log"]})
        state["activeEvent"] = None
        state["lastOutcome"] = {"actionId": action_id, "title": action["title"], "text": action["log"], "kind": "branch"}
        state["availableActions"] = _actions_for(state)
        return state

    due, pending = [], []
    for effect in state["delayedEffects"]:
        (due if effect["dueDay"] <= before_day else pending).append(effect)
    state["delayedEffects"] = pending
    for effect in due:
        for key, delta in effect["effects"].items():
            resources[key] = _clamp(resources.get(key, 0) + delta)
        state["events"].append({"id": f"delayed-{effect['dueDay']}-{len(state['events'])}", "day": before_day, "kind": "delayed", "text": effect["text"]})
    for key, delta in action.get("effects", {}).items():
        if key == "scienceProgress":
            resources[key] = _clamp(resources.get(key, 0) + delta)
        else:
            resources[key] = _clamp(resources[key] + delta)
    if crew_role == "mika" and target_id:
        resources["habitatIntegrity"] = _clamp(resources["habitatIntegrity"] + 3)
    elif crew_role == "sol" and ("rover" in action_id or "signal" in action_id or "sample" in action_id):
        resources["scienceProgress"] = _clamp(resources["scienceProgress"] + 6)
    state["crewAssignment"] = crew_role
    if action.get("buildingId") and action.get("buildingStatus"):
        for building in state["buildings"]:
            if building["id"] == action["buildingId"]:
                building["status"] = action["buildingStatus"]
                if cost and placement:
                    building["x"] = placement["x"]
                    building["y"] = placement["y"]
                if action.get("activationDelayDays"):
                    building["onlineFromDay"] = before_day + action["activationDelayDays"]
    if crew_role:
        crew_names = {"mika": "Mika", "sol": "Sol", "pip": "PIP-3"}
        state["events"].append({"id": f"crew-{crew_role}-{before_day}", "day": before_day, "kind": "crew", "text": f"{crew_names.get(crew_role, 'Crew')} joined the commander for {action['title'].lower()}."})
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
        crew_safe = resources["oxygen"] > 0 and resources["crewWellbeing"] > 0
        habitat_ready = resources["habitatIntegrity"] >= 50
        science_complete = resources["scienceProgress"] >= 40
        if not crew_safe:
            ending_id, ending_title = "emergency-return", "Emergency return recommended"
            ending_text = "The crew's modeled safety reserve ran low. Mission Control prioritizes a safe return and a systems review."
        elif habitat_ready and science_complete:
            ending_id, ending_title = "full-success", "First Light: science mission complete"
            ending_text = "The crew kept the habitat stable and completed a strong soil study. The outpost is ready for another mission."
        elif habitat_ready:
            ending_id, ending_title = "safe-outpost", "First Light: safe outpost, study continues"
            ending_text = "The crew maintained a stable outpost. The soil study needs another mission window."
        else:
            ending_id, ending_title = "partial-success", "First Light: lessons secured"
            ending_text = "The crew recovered useful lessons and returned safely. Mission Control has a clear list of systems to improve."
        state["debrief"] = {"endingId": ending_id, "title": ending_title, "text": ending_text,
                            "objectives": [{"id": "crew-safe", "title": "Protect the crew", "complete": crew_safe},
                                           {"id": "habitat-stable", "title": "Keep the habitat stable", "complete": habitat_ready},
                                           {"id": "soil-study", "title": "Complete the soil study", "complete": science_complete}],
                            "branches": deepcopy(state["branches"]), "finalResources": deepcopy(resources)}
        state["lastOutcome"]["text"] += f" {ending_title}. {ending_text}"
    else:
        state["day"] = before_day + 1
        event_ids = SCENARIO.get("eventSchedule", {}).get(str(state["day"]), [])
        if event_ids:
            event_pool = [item for item in SCENARIO["events"] if item["id"] in event_ids and _event_is_eligible(state, item)]
            if not event_pool:
                event_pool = [next(item for item in SCENARIO["events"] if item["id"] == event_ids[-1])]
            event_index = abs(state["seed"] * 31 + state["day"] * 17) % len(event_pool)
            event = event_pool[event_index]
            state["activeEvent"] = {"id": event["id"], "title": event["title"], "trigger": event["trigger"], "day": state["day"]}
            state["events"].append({"id": f"event-{event['id']}", "day": state["day"], "kind": "event", "text": f"{event['title']}: {event['trigger']}"})
    state["availableActions"] = _actions_for(state)
    return state


def gather_resource(snapshot, node_id, expected_day, crew_role=None):
    if snapshot["status"] != "active":
        raise ValueError("The mission is complete. Start a new flight to gather supplies.")
    if expected_day != snapshot["day"]:
        raise RuntimeError("The sol advanced. Refresh the outpost before gathering.")
    state = deepcopy(snapshot)
    node = next((item for item in state.get("gatherNodes", []) if item["id"] == node_id), None)
    if node is None or node["amount"] <= 0:
        raise ValueError("This deposit is depleted. Search another nearby tile.")
    amount = min(node["amount"], 2 if crew_role == "pip" else 1)
    node["amount"] -= amount
    state["inventory"][node["kind"]] = state["inventory"].get(node["kind"], 0) + amount
    text = f"Collected {amount} {node['kind']} from {node['label']}."
    state["events"].append({"id": f"gather-{node_id}-{len(state['events'])}", "day": state["day"], "kind": "gather", "text": text})
    state["lastOutcome"] = {"actionId": f"gather-{node_id}", "title": f"Collected {node['kind']}", "text": text}
    return state


def enter_hazard(snapshot, zone_id, expected_day, position=None):
    if snapshot["status"] != "active":
        raise ValueError("The mission is complete.")
    if expected_day != snapshot["day"]:
        raise RuntimeError("The sol advanced. Refresh the outpost before entering a hazard zone.")
    zone = next((item for item in SCENARIO.get("hazardZones", []) if item["id"] == zone_id and expected_day in item["sols"]), None)
    if zone is None:
        raise ValueError("That hazard is not active this sol.")
    if position is not None:
        distance = ((position.get("x", -1) - zone["x"]) ** 2 + (position.get("y", -1) - zone["y"]) ** 2) ** 0.5
        if distance > zone["radius"]:
            raise ValueError("Move into the marked hazard area before applying its effects.")
    state = deepcopy(snapshot)
    entered = state.setdefault("hazardsEntered", {}).setdefault(str(expected_day), [])
    if zone_id in entered:
        return state
    entered.append(zone_id)
    for key, delta in zone["effects"].items():
        state["resources"][key] = _clamp(state["resources"].get(key, 0) + delta)
    state["events"].append({"id": f"hazard-{zone_id}-sol-{expected_day}", "day": expected_day, "kind": "hazard", "text": zone["log"]})
    state["lastOutcome"] = {"actionId": f"hazard-{zone_id}", "title": zone["name"], "text": zone["log"]}
    return state
