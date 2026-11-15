"""NASA archive context, explicitly separate from the authored game model."""
from datetime import datetime, timezone
from threading import Lock
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json

NASA_SEARCH = "https://images-api.nasa.gov/search"
NASA_FACTS = "https://science.nasa.gov/mars/facts/"
_cache = {"expires": 0, "value": None}
_lock = Lock()


def _fallback():
    return {
        "kind": "NASA reference fact", "isLiveObservation": False,
        "title": "A Martian day is called a sol",
        "summary": "NASA gives the length of a Martian solar day as about 24.6 Earth hours.",
        "source": NASA_FACTS, "sourceName": "NASA Science — Mars Facts",
        "dateOrPeriod": "Planetary reference fact; page accessed at request time",
        "unit": "Earth hours per Martian solar day", "attribution": "NASA",
        "interpretation": "This is a real planetary reference fact. It does not set or validate any resource rates in the game model.",
        "retrievedAt": datetime.now(timezone.utc).isoformat(), "offlineFallback": True,
    }


def get_science_context():
    now = datetime.now(timezone.utc).timestamp()
    with _lock:
        if _cache["value"] and _cache["expires"] > now:
            return _cache["value"]
    query = urlencode({"q": "Mars rover landscape surface", "media_type": "image", "page_size": 1})
    try:
        request = Request(f"{NASA_SEARCH}?{query}", headers={"User-Agent": "OUTPOST-ZERO/0.1 (educational demo)"})
        with urlopen(request, timeout=3) as response:
            payload = json.loads(response.read().decode("utf-8"))
        item = payload.get("collection", {}).get("items", [])[0]
        data = item.get("data", [{}])[0]
        image = next((link.get("href") for link in item.get("links", []) if link.get("rel") == "preview"), None)
        record = {
            "kind": "NASA archived image observation", "isLiveObservation": True,
            "title": data.get("title", "NASA Mars image archive"),
            "summary": (data.get("description") or "NASA archive image from a Mars mission.")[:420],
            "imageUrl": image, "source": data.get("nasa_id") and f"https://images.nasa.gov/details/{data['nasa_id']}",
            "sourceName": "NASA Image and Video Library", "dateOrPeriod": data.get("date_created", "Date not supplied by archive"),
            "unit": "image observation (no numeric measurement)",
            "attribution": ", ".join(part for part in (data.get("center"), data.get("photographer")) if part) or "NASA",
            "interpretation": "This is a real archived image and its archive metadata, not a measurement for the fictional outpost or a live Mars weather report.",
            "retrievedAt": datetime.now(timezone.utc).isoformat(), "offlineFallback": False,
        }
        if not record["source"]:
            record["source"] = "https://images.nasa.gov/"
    except Exception:
        record = _fallback()
    with _lock:
        _cache.update({"expires": now + 21600, "value": record})
    return record
