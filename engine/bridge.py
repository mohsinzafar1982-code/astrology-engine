"""JSON-lines bridge used by the packaged Windows desktop shell."""
from __future__ import annotations

import json
import sys
from datetime import datetime

from core.ephemeris import DEFAULT_EPHE_PATH, SwissEphemerisEngine


def main() -> int:
    payload = json.loads(sys.stdin.read() or "{}")
    engine = SwissEphemerisEngine(str(payload.get("ephemeris_path", DEFAULT_EPHE_PATH)))
    if payload.get("action") == "status":
        print(json.dumps(engine.status.__dict__))
        return 0
    instant = datetime.fromisoformat(str(payload["utc_datetime"]).replace("Z", "+00:00"))
    result = engine.calculate(
        instant,
        float(payload["latitude"]),
        float(payload["longitude"]),
        float(payload.get("altitude", 0)),
        str(payload.get("house_system", "Regiomontanus")),
        str(payload.get("zodiac", "Tropical")),
        bool(payload.get("topocentric", False)),
        bool(payload.get("include_modern", False)),
    )
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
