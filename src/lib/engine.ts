import { Aspect, PlanetName, PlanetPosition, SIGNS, TraceRule, normalizeLongitude } from "@/lib/astro";
import { Place, formatClock, formatCoordinates, localWeekday } from "@/lib/locations";

const DEG = Math.PI / 180;
const CHALDEAN: PlanetName[] = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"];
const WEEKDAY_RULERS: PlanetName[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const DOMICILE: Record<string, PlanetName | PlanetName[]> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury",
  Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};
const EXALTATION: Partial<Record<PlanetName, string>> = {
  Sun: "Aries", Moon: "Taurus", Mercury: "Virgo", Venus: "Pisces", Mars: "Capricorn", Jupiter: "Cancer", Saturn: "Libra",
};
const FALL: Partial<Record<PlanetName, string>> = {
  Sun: "Libra", Moon: "Scorpio", Mercury: "Pisces", Venus: "Virgo", Mars: "Cancer", Jupiter: "Capricorn", Saturn: "Aries",
};
const JOYS: Partial<Record<PlanetName, number>> = { Mercury: 1, Moon: 3, Venus: 5, Mars: 6, Sun: 9, Jupiter: 11, Saturn: 12 };
const EGYPTIAN_TERMS: Record<string, [number, PlanetName][]> = {
  Aries: [[6, "Jupiter"], [12, "Venus"], [20, "Mercury"], [25, "Mars"], [30, "Saturn"]],
  Taurus: [[8, "Venus"], [14, "Mercury"], [22, "Jupiter"], [27, "Saturn"], [30, "Mars"]],
  Gemini: [[6, "Mercury"], [12, "Jupiter"], [17, "Venus"], [24, "Mars"], [30, "Saturn"]],
  Cancer: [[7, "Mars"], [13, "Venus"], [19, "Mercury"], [26, "Jupiter"], [30, "Saturn"]],
  Leo: [[6, "Jupiter"], [11, "Venus"], [18, "Saturn"], [24, "Mercury"], [30, "Mars"]],
  Virgo: [[7, "Mercury"], [17, "Venus"], [21, "Jupiter"], [28, "Mars"], [30, "Saturn"]],
  Libra: [[6, "Saturn"], [14, "Mercury"], [21, "Jupiter"], [28, "Venus"], [30, "Mars"]],
  Scorpio: [[7, "Mars"], [11, "Venus"], [19, "Mercury"], [24, "Jupiter"], [30, "Saturn"]],
  Sagittarius: [[12, "Jupiter"], [17, "Venus"], [21, "Mercury"], [26, "Saturn"], [30, "Mars"]],
  Capricorn: [[7, "Mercury"], [14, "Jupiter"], [22, "Venus"], [26, "Saturn"], [30, "Mars"]],
  Aquarius: [[7, "Mercury"], [13, "Venus"], [20, "Jupiter"], [25, "Mars"], [30, "Saturn"]],
  Pisces: [[12, "Venus"], [16, "Jupiter"], [19, "Mercury"], [28, "Mars"], [30, "Saturn"]],
};

type KeplerBody = { name: PlanetName; a: number; e: number; i: number; L: number; lp: number; node: number; da: number; de: number; di: number; dL: number; dlp: number; dnode: number };

const KEPLER: KeplerBody[] = [
  { name: "Mercury", a: 0.38709927, e: 0.20563593, i: 7.00497902, L: 252.2503235, lp: 77.45779628, node: 48.33076593, da: 0.00000037, de: 0.00001906, di: -0.00594749, dL: 149472.67411175, dlp: 0.16047689, dnode: -0.12534081 },
  { name: "Venus", a: 0.72333566, e: 0.00677672, i: 3.39467605, L: 181.9790995, lp: 131.60246718, node: 76.67984255, da: 0.0000039, de: -0.00004107, di: -0.0007889, dL: 58517.81538729, dlp: 0.00268329, dnode: -0.27769418 },
  { name: "Mars", a: 1.52371034, e: 0.0933941, i: 1.84969142, L: -4.55343205, lp: -23.94362959, node: 49.55953891, da: 0.00001847, de: 0.00007882, di: -0.00813131, dL: 19140.30268499, dlp: 0.44441088, dnode: -0.29257343 },
  { name: "Jupiter", a: 5.202887, e: 0.04838624, i: 1.30439695, L: 34.39644051, lp: 14.72847983, node: 100.47390909, da: -0.00011607, de: -0.00013253, di: -0.00183713, dL: 3034.74612775, dlp: 0.21252668, dnode: 0.20469106 },
  { name: "Saturn", a: 9.53667594, e: 0.05386179, i: 2.48599187, L: 49.95424423, lp: 92.59887831, node: 113.66242448, da: -0.0012506, de: -0.00050991, di: 0.00193609, dL: 1222.49362201, dlp: -0.41897216, dnode: -0.28867794 },
];

export type ChartInput = {
  date: Date;
  place: Place;
  houseSystem: string;
  zodiac: string;
};

export type HourState = {
  weekday: string;
  dayRuler: PlanetName;
  hourRuler: PlanetName;
  nextHourRuler: PlanetName;
  hourNumber: number;
  isDayHour: boolean;
  start: Date;
  end: Date;
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  polar: boolean;
};

export type LiveChart = {
  jd: number;
  place: Place;
  houseSystem: string;
  zodiac: string;
  asc: number;
  mc: number;
  dsc: number;
  ic: number;
  armc: number;
  cusps: number[];
  sect: "day" | "night";
  sunAltitude: number;
  planets: PlanetPosition[];
  aspects: Aspect[];
  moonPhase: string;
  moonIllumination: number;
  voc: boolean;
  nextMoonAspect: string;
  lastMoonAspect: string;
  hours: HourState;
  traces: TraceRule[];
  extremeLatitude: boolean;
  housePreviewNote: string;
};

function dms(longitude: number) {
  const within = ((longitude % 30) + 30) % 30;
  const degrees = Math.floor(within);
  const minutes = Math.floor((within - degrees) * 60);
  return `${String(degrees).padStart(2, "0")}° ${String(minutes).padStart(2, "0")}′`;
}

function signName(longitude: number) {
  return SIGNS[Math.floor(normalizeLongitude(longitude) / 30)].name;
}

function wrap(value: number) {
  return normalizeLongitude(value);
}

function julianDay(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function centuries(jd: number) {
  return (jd - 2451545) / 36525;
}

function obliquity(t: number) {
  return 23.43929111 - 0.013004167 * t;
}

function gmst(jd: number) {
  return wrap(280.46061837 + 360.98564736629 * (jd - 2451545));
}

function kepler(mDeg: number, e: number) {
  let eAnom = mDeg * DEG;
  const m = ((mDeg % 360) + 360) % 360 * DEG;
  for (let i = 0; i < 8; i += 1) eAnom -= (eAnom - e * Math.sin(eAnom) - m) / (1 - e * Math.cos(eAnom));
  return eAnom;
}

function heliocentric(body: KeplerBody, t: number) {
  const a = body.a + body.da * t;
  const e = body.e + body.de * t;
  const i = (body.i + body.di * t) * DEG;
  const L = wrap(body.L + body.dL * t);
  const lp = wrap(body.lp + body.dlp * t);
  const node = wrap(body.node + body.dnode * t) * DEG;
  const w = (lp - wrap(body.node + body.dnode * t)) * DEG;
  const m = wrap(L - lp);
  const eAnom = kepler(m, e);
  const xOrb = a * (Math.cos(eAnom) - e);
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(eAnom);
  const xEcl = Math.cos(w) * Math.cos(node) - Math.sin(w) * Math.sin(node) * Math.cos(i);
  const yEcl = Math.cos(w) * Math.sin(node) + Math.sin(w) * Math.cos(node) * Math.cos(i);
  const zEcl = Math.sin(w) * Math.sin(i);
  const xEcl2 = -Math.sin(w) * Math.cos(node) - Math.cos(w) * Math.sin(node) * Math.cos(i);
  const yEcl2 = -Math.sin(w) * Math.sin(node) + Math.cos(w) * Math.cos(node) * Math.cos(i);
  const zEcl2 = Math.cos(w) * Math.sin(i);
  return {
    x: xOrb * xEcl + yOrb * xEcl2,
    y: xOrb * yEcl + yOrb * yEcl2,
    z: xOrb * zEcl + yOrb * zEcl2,
  };
}

function sunLongitude(t: number) {
  const L0 = wrap(280.46646 + 36000.76983 * t);
  const M = wrap(357.52911 + 35999.05029 * t);
  const C = (1.914602 - 0.004817 * t) * Math.sin(M * DEG) + 0.019993 * Math.sin(2 * M * DEG);
  return wrap(L0 + C);
}

function moonLongitude(jd: number) {
  const d = jd - 2451545;
  const Lp = wrap(218.316 + 13.176396 * d);
  const M = wrap(134.963 + 13.064993 * d);
  const Ms = wrap(357.529 + 0.98560028 * d);
  const D = wrap(297.85 + 12.190749 * d);
  const F = wrap(93.272 + 13.22935 * d);
  return wrap(Lp + 6.289 * Math.sin(M * DEG) + 1.274 * Math.sin((2 * D - M) * DEG) + 0.658 * Math.sin(2 * D * DEG) + 0.214 * Math.sin(2 * M * DEG) - 0.186 * Math.sin(Ms * DEG) - 0.114 * Math.sin(2 * F * DEG));
}

function planetLongitudes(jd: number) {
  const t = centuries(jd);
  const sunLon = sunLongitude(t);
  const sun = { x: Math.cos(sunLon * DEG), y: Math.sin(sunLon * DEG), z: 0 };
  const moon = moonLongitude(jd);
  const moonNext = moonLongitude(jd + 1);
  const bodies: Record<PlanetName, { lon: number; speed: number }> = {
    Sun: { lon: sunLon, speed: wrap(sunLongitude(centuries(jd + 1)) - sunLon + 180) - 180 },
    Moon: { lon: moon, speed: wrap(moonNext - moon + 180) - 180 },
    Mercury: { lon: 0, speed: 0 },
    Venus: { lon: 0, speed: 0 },
    Mars: { lon: 0, speed: 0 },
    Jupiter: { lon: 0, speed: 0 },
    Saturn: { lon: 0, speed: 0 },
  };

  for (const body of KEPLER) {
    const now = heliocentric(body, t);
    const later = heliocentric(body, centuries(jd + 1));
    const geoNow = { x: now.x + sun.x, y: now.y + sun.y, z: now.z };
    const geoLater = { x: later.x + Math.cos(sunLongitude(centuries(jd + 1)) * DEG), y: later.y + Math.sin(sunLongitude(centuries(jd + 1)) * DEG), z: later.z };
    const lon = wrap(Math.atan2(geoNow.y, geoNow.x) / DEG);
    const lon2 = wrap(Math.atan2(geoLater.y, geoLater.x) / DEG);
    bodies[body.name] = { lon, speed: wrap(lon2 - lon + 180) - 180 };
  }
  return bodies;
}

function ayanamsa(jd: number, zodiac: string) {
  if (zodiac.toLowerCase().startsWith("tropical")) return 0;
  const t = centuries(jd);
  return 24.762749 + 1.396971 * t;
}

function midheaven(ramc: number, eps: number) {
  return wrap(Math.atan2(Math.sin(ramc * DEG), Math.cos(ramc * DEG) * Math.cos(eps * DEG)) / DEG);
}

function ascendant(ramc: number, lat: number, eps: number) {
  const y = Math.cos(ramc * DEG);
  const x = -(Math.sin(ramc * DEG) * Math.cos(eps * DEG) + Math.tan(lat * DEG) * Math.sin(eps * DEG));
  return wrap(Math.atan2(y, x) / DEG);
}

function sunDeclination(lon: number, eps: number) {
  return Math.asin(Math.sin(eps * DEG) * Math.sin(lon * DEG)) / DEG;
}

function sunAltitude(jd: number, lat: number, lon: number, sunLon: number, eps: number) {
  const lst = wrap(gmst(jd) + lon);
  const ra = wrap(Math.atan2(Math.sin(sunLon * DEG) * Math.cos(eps * DEG), Math.cos(sunLon * DEG)) / DEG);
  const dec = sunDeclination(sunLon, eps);
  const ha = wrap(lst - ra);
  return Math.asin(Math.sin(lat * DEG) * Math.sin(dec * DEG) + Math.cos(lat * DEG) * Math.cos(dec * DEG) * Math.cos(ha * DEG)) / DEG;
}

function altitudeAt(ms: number, place: Place) {
  const jd = julianDay(new Date(ms));
  const t = centuries(jd);
  return sunAltitude(jd, place.latitude, place.longitude, sunLongitude(t), obliquity(t));
}

function solarEvent(dayUtc: Date, place: Place, rising: boolean, next = false) {
  const start = Date.UTC(dayUtc.getUTCFullYear(), dayUtc.getUTCMonth(), dayUtc.getUTCDate() + (next ? 1 : 0));
  let previous = altitudeAt(start, place);
  let crossing = start + (rising ? 6 : 18) * 3600000;
  for (let minute = 8; minute < 1440; minute += 8) {
    const stamp = start + minute * 60000;
    const alt = altitudeAt(stamp, place);
    if (rising && alt > -0.833 && previous <= -0.833) { crossing = stamp; break; }
    if (!rising && alt < -0.833 && previous >= -0.833) { crossing = stamp; break; }
    previous = alt;
  }
  for (let minute = -8; minute <= 0; minute += 1) {
    const stamp = crossing + minute * 60000;
    const alt = altitudeAt(stamp, place);
    const before = altitudeAt(stamp - 60000, place);
    if (rising && alt > -0.833 && before <= -0.833) return new Date(stamp);
    if (!rising && alt < -0.833 && before >= -0.833) return new Date(stamp);
  }
  return new Date(crossing);
}

function houseCusps(asc: number, mc: number, system: string) {
  if (system === "Whole Sign") {
    const base = Math.floor(asc / 30) * 30;
    return Array.from({ length: 12 }, (_, i) => wrap(base + i * 30));
  }
  if (system === "Equal House") return Array.from({ length: 12 }, (_, i) => wrap(asc + i * 30));
  const ic = wrap(mc + 180);
  const dsc = wrap(asc + 180);
  const third = (start: number, end: number) => {
    const span = wrap(end - start) || 360;
    return [wrap(start + span / 3), wrap(start + (2 * span) / 3)];
  };
  const [h2, h3] = third(asc, ic);
  const [h5, h6] = third(ic, dsc);
  const [h8, h9] = third(dsc, mc);
  const [h11, h12] = third(mc, wrap(asc + 360));
  return [asc, h2, h3, ic, h5, h6, dsc, h8, h9, mc, h11, h12].map(wrap);
}

function houseOf(longitude: number, cusps: number[], system: string) {
  if (system === "Whole Sign") {
    const offset = (Math.floor(longitude / 30) - Math.floor(cusps[0] / 30) + 12) % 12;
    return offset + 1;
  }
  for (let i = 0; i < 12; i += 1) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    const span = wrap(end - start) || 30;
    const delta = wrap(longitude - start);
    if (delta < span || Math.abs(delta - span) < 1e-6) return i + 1;
  }
  return 1;
}

function termRuler(sign: string, degree: number) {
  return (EGYPTIAN_TERMS[sign] ?? []).find(([end]) => degree < end)?.[1] ?? "Saturn";
}

function faceRuler(longitude: number) {
  const order: PlanetName[] = ["Mars", "Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter"];
  const face = Math.floor(wrap(longitude) / 10);
  return order[face % 7];
}

function essentialDignity(name: PlanetName, longitude: number) {
  const sign = signName(longitude);
  const degree = ((longitude % 30) + 30) % 30;
  if (DOMICILE[sign] === name) return { label: "Domicile", tone: "positive" as const, score: 5 };
  if (EXALTATION[name] === sign) return { label: "Exaltation", tone: "positive" as const, score: 4 };
  if (FALL[name] === sign) return { label: "Fall", tone: "negative" as const, score: -4 };
  const detrimentSigns = Object.entries(DOMICILE).filter(([, ruler]) => ruler === name).map(([s]) => SIGNS[(SIGNS.findIndex((item) => item.name === s) + 6) % 12].name);
  if (detrimentSigns.includes(sign)) return { label: "Detriment", tone: "negative" as const, score: -5 };
  if (termRuler(sign, degree) === name) return { label: "Term", tone: "positive" as const, score: 2 };
  if (faceRuler(longitude) === name) return { label: "Face", tone: "positive" as const, score: 1 };
  return { label: "Peregrine", tone: "negative" as const, score: -5 };
}

function solarCondition(name: PlanetName, elongation: number) {
  if (name === "Sun") return "—";
  const abs = Math.abs(elongation);
  if (abs <= 17 / 60) return "Cazimi";
  if (abs <= 8.5) return "Combust";
  if (abs <= 17) return "Under beams";
  return "Free of beams";
}

function moonPhase(elongation: number) {
  const e = wrap(elongation);
  if (e < 20 || e > 340) return "New Moon";
  if (e < 70) return "Waxing crescent";
  if (e < 110) return "First quarter";
  if (e < 160) return "Waxing gibbous";
  if (e < 200) return "Full Moon";
  if (e < 250) return "Waning gibbous";
  if (e < 290) return "Last quarter";
  return "Waning crescent";
}

function angularSep(a: number, b: number) {
  return Math.abs(wrap(a - b + 180) - 180);
}

function planetaryHours(date: Date, place: Place, sunLon: number, eps: number, jd: number): HourState {
  const polar = Math.abs(place.latitude) > 66;
  const weekday = localWeekday(date, place.timezone);
  const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(weekday);
  const dayRuler = WEEKDAY_RULERS[(dayIndex + 7) % 7];
  let sunrise = solarEvent(date, place, true);
  let sunset = solarEvent(date, place, false);
  let nextSunrise = solarEvent(date, place, true, true);
  if (sunset <= sunrise) sunset = new Date(sunrise.getTime() + 12 * 3600000);
  if (nextSunrise <= sunset) nextSunrise = new Date(sunset.getTime() + 12 * 3600000);
  if (polar) {
    sunrise = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 6));
    sunset = new Date(sunrise.getTime() + 12 * 3600000);
    nextSunrise = new Date(sunrise.getTime() + 24 * 3600000);
  }
  const isDay = date >= sunrise && date < sunset && sunAltitude(jd, place.latitude, place.longitude, sunLon, eps) > -0.833;
  const spanStart = isDay ? sunrise : sunset;
  const spanEnd = isDay ? sunset : nextSunrise;
  const length = Math.max(60_000, (spanEnd.getTime() - spanStart.getTime()) / 12);
  const offset = Math.max(0, Math.min(11, Math.floor((date.getTime() - spanStart.getTime()) / length)));
  const hourNumber = isDay ? offset + 1 : offset + 13;
  const startIndex = CHALDEAN.indexOf(dayRuler);
  const rulerIndex = (startIndex + (isDay ? offset : 12 + offset)) % 7;
  const start = new Date(spanStart.getTime() + offset * length);
  const end = new Date(start.getTime() + length);
  return {
    weekday,
    dayRuler,
    hourRuler: CHALDEAN[rulerIndex],
    nextHourRuler: CHALDEAN[(rulerIndex + 1) % 7],
    hourNumber,
    isDayHour: isDay,
    start,
    end,
    sunrise,
    sunset,
    nextSunrise,
    polar,
  };
}

export function computeChart(input: ChartInput): LiveChart {
  const { date, place, houseSystem, zodiac } = input;
  const jd = julianDay(date);
  const t = centuries(jd);
  const eps = obliquity(t);
  const aya = ayanamsa(jd, zodiac);
  const raw = planetLongitudes(jd);
  const ramc = wrap(gmst(jd) + place.longitude);
  const mc = wrap(midheaven(ramc, eps) - aya);
  const asc = wrap(ascendant(ramc, place.latitude, eps) - aya);
  const cusps = houseCusps(asc, mc, houseSystem).map((value) => wrap(value - (houseSystem === "Whole Sign" || houseSystem === "Equal House" ? 0 : 0)));
  const sunLon = wrap(raw.Sun.lon - aya);
  const alt = sunAltitude(jd, place.latitude, place.longitude, raw.Sun.lon, eps);
  const sect = alt > 0 ? "day" : "night";
  const hours = planetaryHours(date, place, raw.Sun.lon, eps, jd);

  const planets: PlanetPosition[] = (Object.keys(raw) as PlanetName[]).map((name) => {
    const lon = wrap(raw[name].lon - aya);
    const speed = raw[name].speed;
    const house = houseOf(lon, cusps, houseSystem);
    const dignity = essentialDignity(name, lon);
    const elongation = wrap(lon - sunLon + 180) - 180;
    const angular = [1, 4, 7, 10].includes(house);
    const cadent = [3, 6, 9, 12].includes(house);
    const inSect = (sect === "day" && ["Sun", "Jupiter", "Saturn"].includes(name)) || (sect === "night" && ["Moon", "Venus", "Mars"].includes(name)) || name === "Mercury";
    const solar = solarCondition(name, elongation);
    const joy = JOYS[name] === house ? 2 : 0;
    const motionScore = speed < -0.02 ? -5 : Math.abs(speed) < 0.02 ? -3 : 2;
    const houseScore = angular ? 5 : cadent ? -3 : 2;
    const visScore = solar === "Cazimi" ? 6 : solar === "Combust" ? -6 : solar === "Under beams" ? -3 : 2;
    const sectScore = name === "Mercury" ? 0 : inSect ? 3 : -2;
    const score = dignity.score + houseScore + motionScore + visScore + sectScore + joy;
    return {
      name,
      longitude: lon,
      position: dms(lon),
      sign: signName(lon),
      house,
      speed,
      motion: Math.abs(speed) < 0.02 ? "Stationary" : speed < 0 ? "Retrograde" : "Direct",
      dignity: dignity.label,
      dignityTone: dignity.tone,
      score,
      sect: name === "Sun" ? "Sect light" : name === "Moon" && sect === "night" ? "Sect light" : inSect ? "In sect" : "Out of sect",
      solarCondition: solar,
    };
  });

  const majors = [
    { type: "Conjunction", angle: 0, supportive: true },
    { type: "Sextile", angle: 60, supportive: true },
    { type: "Square", angle: 90, supportive: false },
    { type: "Trine", angle: 120, supportive: true },
    { type: "Opposition", angle: 180, supportive: false },
  ];
  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const a = planets[i];
      const b = planets[j];
      const sep = angularSep(a.longitude, b.longitude);
      for (const aspect of majors) {
        const orbLimit = a.name === "Sun" || a.name === "Moon" || b.name === "Sun" || b.name === "Moon" ? 10 : 8;
        const orb = Math.abs(sep - aspect.angle);
        if (orb <= orbLimit) {
          const future = angularSep(a.longitude + a.speed / 24, b.longitude + b.speed / 24);
          const applying = Math.abs(future - aspect.angle) < orb;
          aspects.push({ from: a.name, to: b.name, type: aspect.type, angle: aspect.angle, orb, state: applying ? "Applying" : "Separating", supportive: aspect.supportive });
        }
      }
    }
  }

  const moon = planets.find((item) => item.name === "Moon")!;
  const sun = planets.find((item) => item.name === "Sun")!;
  const elongation = wrap(moon.longitude - sun.longitude);
  const remaining = 30 - (((moon.longitude % 30) + 30) % 30);
  const moonAspects = aspects.filter((item) => item.from === "Moon" || item.to === "Moon").sort((a, b) => a.orb - b.orb);
  const applyingMoon = moonAspects.filter((item) => item.state === "Applying");
  const voc = applyingMoon.length === 0 || applyingMoon[0].orb / Math.abs(moon.speed) > remaining / Math.abs(moon.speed);

  const traces: TraceRule[] = [
    {
      id: "location",
      label: "Chart location",
      measured: `${place.name} · ${formatCoordinates(place.latitude, place.longitude)}`,
      threshold: "User-selected or locally detected coordinates",
      result: "Info",
      weight: 0,
      profile: "Astronomical facts",
      note: `Timezone ${place.timezone}. Elevation ${place.elevation} m.`,
    },
    {
      id: "moon_voc",
      label: "Moon void of course",
      measured: applyingMoon[0] ? `${applyingMoon[0].type} ${applyingMoon[0].from === "Moon" ? applyingMoon[0].to : applyingMoon[0].from} in ${applyingMoon[0].orb.toFixed(2)}°` : "No applying Ptolemaic aspect",
      threshold: "Before sign exit",
      result: voc ? "Caution" : "Pass",
      weight: voc ? -8 : 5,
      profile: "Horary · Lilly",
      note: voc ? "Moon does not perfect a Ptolemaic aspect before leaving its sign under the selected definition." : "Moon perfects a Ptolemaic aspect before leaving its sign.",
    },
    {
      id: "sect",
      label: "Day/night sect",
      measured: `Sun altitude ${alt.toFixed(1)}°`,
      threshold: "Above horizon = day chart",
      result: "Info",
      weight: 2,
      profile: "Hellenistic",
      note: sect === "day" ? "Sun, Jupiter, and Saturn belong to the diurnal sect." : "Moon, Venus, and Mars belong to the nocturnal sect.",
    },
    {
      id: "hour",
      label: "Planetary hour",
      measured: `${hours.hourRuler} · local ${formatClock(hours.start, place.timezone, false)}–${formatClock(hours.end, place.timezone, false)}`,
      threshold: "Sunrise/sunset unequal hours at this latitude",
      result: "Info",
      weight: 2,
      profile: "Chaldean hours",
      note: `${hours.weekday} is ruled by ${hours.dayRuler}. ${hours.isDayHour ? "Day" : "Night"} hour ${hours.isDayHour ? hours.hourNumber : hours.hourNumber - 12}.`,
    },
  ];

  const extremeLatitude = Math.abs(place.latitude) > 66;
  return {
    jd,
    place,
    houseSystem,
    zodiac,
    asc,
    mc,
    dsc: wrap(asc + 180),
    ic: wrap(mc + 180),
    armc: ramc,
    cusps,
    sect,
    sunAltitude: alt,
    planets,
    aspects,
    moonPhase: moonPhase(elongation),
    moonIllumination: (1 - Math.cos(elongation * DEG)) / 2,
    voc,
    nextMoonAspect: applyingMoon[0] ? `${applyingMoon[0].type} ${applyingMoon[0].from === "Moon" ? applyingMoon[0].to : applyingMoon[0].from}` : "None before sign exit",
    lastMoonAspect: moonAspects.find((item) => item.state === "Separating") ? `${moonAspects.find((item) => item.state === "Separating")!.type} ${moonAspects.find((item) => item.state === "Separating")!.from === "Moon" ? moonAspects.find((item) => item.state === "Separating")!.to : moonAspects.find((item) => item.state === "Separating")!.from}` : "—",
    hours,
    traces,
    extremeLatitude,
    housePreviewNote: houseSystem === "Whole Sign" || houseSystem === "Equal House" ? houseSystem : "Porphyry quadrants in the browser preview; desktop Swiss uses the selected house system.",
  };
}

export function glyphAngle(longitude: number, asc: number) {
  return 270 - (longitude - asc);
}

export function signRuler(longitude: number): PlanetName {
  const ruler = DOMICILE[signName(longitude)];
  return Array.isArray(ruler) ? ruler[0] : ruler;
}
