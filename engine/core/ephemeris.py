"""Local Swiss Ephemeris adapter. No network access is used by this module."""
from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import swisseph as swe
except ImportError as exc:  # packaged builds install requirements-engine.txt
    raise RuntimeError("pyswisseph is required for production calculations") from exc

DEFAULT_EPHE_PATH = r"C:\Users\User\Downloads\swephem"
BODY_IDS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Uranus": swe.URANUS,
    "Neptune": swe.NEPTUNE,
    "Pluto": swe.PLUTO,
    "True Node": swe.TRUE_NODE,
    "Mean Node": swe.MEAN_NODE,
    "Chiron": swe.CHIRON,
}
HOUSE_CODES = {
    "Placidus": b"P",
    "Koch": b"K",
    "Porphyry": b"O",
    "Regiomontanus": b"R",
    "Campanus": b"C",
    "Equal House": b"E",
    "Whole Sign": b"W",
    "Alcabitius": b"B",
    "Topocentric": b"T",
    "Morinus": b"M",
}


@dataclass(frozen=True)
class EphemerisStatus:
    requested_path: str
    path_exists: bool
    readable_files: tuple[str, ...]
    source: str
    fallback: bool
    warning: str | None
    version: str


class SwissEphemerisEngine:
    def __init__(self, ephe_path: str = DEFAULT_EPHE_PATH):
        self.path = Path(ephe_path)
        self.status = self._configure()

    def _configure(self) -> EphemerisStatus:
        names: tuple[str, ...] = ()
        if self.path.is_dir():
            names = tuple(sorted(p.name for p in self.path.iterdir() if p.is_file() and p.suffix.lower() == ".se1"))
            swe.set_ephe_path(str(self.path))
        usable = bool(names)
        warning = None if usable else "Swiss Ephemeris file unavailable; using fallback calculation. Precision/data coverage may differ."
        return EphemerisStatus(
            requested_path=str(self.path),
            path_exists=self.path.is_dir(),
            readable_files=names,
            source="Swiss Ephemeris" if usable else "Moshier fallback",
            fallback=not usable,
            warning=warning,
            version=str(swe.version),
        )

    @staticmethod
    def julian_day(utc_datetime: datetime) -> float:
        if utc_datetime.tzinfo is None:
            raise ValueError("Input datetime must be timezone-aware")
        dt = utc_datetime.astimezone(timezone.utc)
        decimal_hour = dt.hour + dt.minute / 60 + (dt.second + dt.microsecond / 1_000_000) / 3600
        return swe.julday(dt.year, dt.month, dt.day, decimal_hour, swe.GREG_CAL)

    def calculate(self, utc_datetime: datetime, latitude: float, longitude: float,
                  altitude: float = 0.0, house_system: str = "Regiomontanus",
                  zodiac: str = "Tropical", topocentric: bool = False,
                  include_modern: bool = False) -> dict[str, Any]:
        jd = self.julian_day(utc_datetime)
        flags = swe.FLG_SPEED | (swe.FLG_MOSEPH if self.status.fallback else swe.FLG_SWIEPH)
        if zodiac.lower() == "sidereal":
            swe.set_sid_mode(swe.SIDM_FAGAN_BRADLEY)
            flags |= swe.FLG_SIDEREAL
        if topocentric:
            swe.set_topo(longitude, latitude, altitude)
            flags |= swe.FLG_TOPOCTR

        selected = list(BODY_IDS.items())
        if not include_modern:
            selected = selected[:7] + selected[10:12]
        bodies: dict[str, Any] = {}
        fallback_during_calculation = self.status.fallback
        for name, body_id in selected:
            try:
                values, returned_flags = swe.calc_ut(jd, body_id, flags)
            except swe.Error:
                values, returned_flags = swe.calc_ut(jd, body_id, (flags & ~swe.FLG_SWIEPH) | swe.FLG_MOSEPH)
                fallback_during_calculation = True
            bodies[name] = {
                "longitude": values[0] % 360,
                "latitude": values[1],
                "distance_au": values[2],
                "speed_longitude": values[3],
                "speed_latitude": values[4],
                "returned_flags": returned_flags,
            }

        hsys = HOUSE_CODES.get(house_system, b"R")
        cusps, angles = swe.houses_ex(jd, latitude, longitude, hsys, flags & swe.FLG_SIDEREAL)
        sun_equatorial, _ = swe.calc_ut(jd, swe.SUN, flags | swe.FLG_EQUATORIAL)
        moon_equatorial, _ = swe.calc_ut(jd, swe.MOON, flags | swe.FLG_EQUATORIAL)
        geopos = (longitude, latitude, altitude)
        sun_azimuth, sun_true_altitude, sun_apparent_altitude = swe.azalt(jd, swe.EQU2HOR, geopos, 0, 15, sun_equatorial[:3])
        moon_azimuth, moon_true_altitude, moon_apparent_altitude = swe.azalt(jd, swe.EQU2HOR, geopos, 0, 15, moon_equatorial[:3])

        warning = self.status.warning
        if fallback_during_calculation and not warning:
            warning = "Swiss Ephemeris file unavailable; using fallback calculation. Precision/data coverage may differ."
        return {
            "julian_day_ut": jd,
            "delta_t_days": swe.deltat(jd),
            "zodiac": zodiac,
            "topocentric": topocentric,
            "bodies": bodies,
            "houses": list(cusps),
            "angles": {"ascendant": angles[0], "mc": angles[1], "armc": angles[2], "vertex": angles[3]},
            "horizon": {
                "sun": {"azimuth": sun_azimuth, "true_altitude": sun_true_altitude, "apparent_altitude": sun_apparent_altitude},
                "moon": {"azimuth": moon_azimuth, "true_altitude": moon_true_altitude, "apparent_altitude": moon_apparent_altitude},
            },
            "sect": "day" if sun_true_altitude > 0 else "night",
            "ephemeris": {**asdict(self.status), "fallback": fallback_during_calculation, "warning": warning},
        }
