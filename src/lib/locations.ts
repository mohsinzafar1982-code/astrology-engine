export type Place = {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
};

export const PLACES: Place[] = [
  { id: "london", name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, elevation: 11, timezone: "Europe/London" },
  { id: "manchester", name: "Manchester", country: "United Kingdom", latitude: 53.4808, longitude: -2.2426, elevation: 38, timezone: "Europe/London" },
  { id: "edinburgh", name: "Edinburgh", country: "United Kingdom", latitude: 55.9533, longitude: -3.1883, elevation: 47, timezone: "Europe/London" },
  { id: "dublin", name: "Dublin", country: "Ireland", latitude: 53.3498, longitude: -6.2603, elevation: 20, timezone: "Europe/Dublin" },
  { id: "paris", name: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522, elevation: 35, timezone: "Europe/Paris" },
  { id: "berlin", name: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.405, elevation: 34, timezone: "Europe/Berlin" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", latitude: 52.3676, longitude: 4.9041, elevation: 2, timezone: "Europe/Amsterdam" },
  { id: "madrid", name: "Madrid", country: "Spain", latitude: 40.4168, longitude: -3.7038, elevation: 667, timezone: "Europe/Madrid" },
  { id: "rome", name: "Rome", country: "Italy", latitude: 41.9028, longitude: 12.4964, elevation: 21, timezone: "Europe/Rome" },
  { id: "athens", name: "Athens", country: "Greece", latitude: 37.9838, longitude: 23.7275, elevation: 70, timezone: "Europe/Athens" },
  { id: "istanbul", name: "Istanbul", country: "Türkiye", latitude: 41.0082, longitude: 28.9784, elevation: 39, timezone: "Europe/Istanbul" },
  { id: "moscow", name: "Moscow", country: "Russia", latitude: 55.7558, longitude: 37.6173, elevation: 156, timezone: "Europe/Moscow" },
  { id: "stockholm", name: "Stockholm", country: "Sweden", latitude: 59.3293, longitude: 18.0686, elevation: 28, timezone: "Europe/Stockholm" },
  { id: "oslo", name: "Oslo", country: "Norway", latitude: 59.9139, longitude: 10.7522, elevation: 23, timezone: "Europe/Oslo" },
  { id: "helsinki", name: "Helsinki", country: "Finland", latitude: 60.1699, longitude: 24.9384, elevation: 26, timezone: "Europe/Helsinki" },
  { id: "cairo", name: "Cairo", country: "Egypt", latitude: 30.0444, longitude: 31.2357, elevation: 23, timezone: "Africa/Cairo" },
  { id: "lagos", name: "Lagos", country: "Nigeria", latitude: 6.5244, longitude: 3.3792, elevation: 41, timezone: "Africa/Lagos" },
  { id: "nairobi", name: "Nairobi", country: "Kenya", latitude: -1.2921, longitude: 36.8219, elevation: 1795, timezone: "Africa/Nairobi" },
  { id: "johannesburg", name: "Johannesburg", country: "South Africa", latitude: -26.2041, longitude: 28.0473, elevation: 1753, timezone: "Africa/Johannesburg" },
  { id: "casablanca", name: "Casablanca", country: "Morocco", latitude: 33.5731, longitude: -7.5898, elevation: 57, timezone: "Africa/Casablanca" },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708, elevation: 5, timezone: "Asia/Dubai" },
  { id: "riyadh", name: "Riyadh", country: "Saudi Arabia", latitude: 24.7136, longitude: 46.6753, elevation: 612, timezone: "Asia/Riyadh" },
  { id: "tehran", name: "Tehran", country: "Iran", latitude: 35.6892, longitude: 51.389, elevation: 1189, timezone: "Asia/Tehran" },
  { id: "karachi", name: "Karachi", country: "Pakistan", latitude: 24.8607, longitude: 67.0011, elevation: 10, timezone: "Asia/Karachi" },
  { id: "lahore", name: "Lahore", country: "Pakistan", latitude: 31.5204, longitude: 74.3587, elevation: 217, timezone: "Asia/Karachi" },
  { id: "islamabad", name: "Islamabad", country: "Pakistan", latitude: 33.6844, longitude: 73.0479, elevation: 507, timezone: "Asia/Karachi" },
  { id: "delhi", name: "New Delhi", country: "India", latitude: 28.6139, longitude: 77.209, elevation: 216, timezone: "Asia/Kolkata" },
  { id: "mumbai", name: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777, elevation: 14, timezone: "Asia/Kolkata" },
  { id: "dhaka", name: "Dhaka", country: "Bangladesh", latitude: 23.8103, longitude: 90.4125, elevation: 4, timezone: "Asia/Dhaka" },
  { id: "colombo", name: "Colombo", country: "Sri Lanka", latitude: 6.9271, longitude: 79.8612, elevation: 1, timezone: "Asia/Colombo" },
  { id: "bangkok", name: "Bangkok", country: "Thailand", latitude: 13.7563, longitude: 100.5018, elevation: 2, timezone: "Asia/Bangkok" },
  { id: "singapore", name: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198, elevation: 15, timezone: "Asia/Singapore" },
  { id: "jakarta", name: "Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456, elevation: 8, timezone: "Asia/Jakarta" },
  { id: "hongkong", name: "Hong Kong", country: "Hong Kong", latitude: 22.3193, longitude: 114.1694, elevation: 7, timezone: "Asia/Hong_Kong" },
  { id: "shanghai", name: "Shanghai", country: "China", latitude: 31.2304, longitude: 121.4737, elevation: 4, timezone: "Asia/Shanghai" },
  { id: "tokyo", name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503, elevation: 40, timezone: "Asia/Tokyo" },
  { id: "seoul", name: "Seoul", country: "South Korea", latitude: 37.5665, longitude: 126.978, elevation: 38, timezone: "Asia/Seoul" },
  { id: "sydney", name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, elevation: 3, timezone: "Australia/Sydney" },
  { id: "melbourne", name: "Melbourne", country: "Australia", latitude: -37.8136, longitude: 144.9631, elevation: 31, timezone: "Australia/Melbourne" },
  { id: "auckland", name: "Auckland", country: "New Zealand", latitude: -36.8509, longitude: 174.7645, elevation: 26, timezone: "Pacific/Auckland" },
  { id: "honolulu", name: "Honolulu", country: "United States", latitude: 21.3069, longitude: -157.8583, elevation: 6, timezone: "Pacific/Honolulu" },
  { id: "anchorage", name: "Anchorage", country: "United States", latitude: 61.2181, longitude: -149.9003, elevation: 31, timezone: "America/Anchorage" },
  { id: "losangeles", name: "Los Angeles", country: "United States", latitude: 34.0522, longitude: -118.2437, elevation: 87, timezone: "America/Los_Angeles" },
  { id: "sanfrancisco", name: "San Francisco", country: "United States", latitude: 37.7749, longitude: -122.4194, elevation: 16, timezone: "America/Los_Angeles" },
  { id: "denver", name: "Denver", country: "United States", latitude: 39.7392, longitude: -104.9903, elevation: 1609, timezone: "America/Denver" },
  { id: "chicago", name: "Chicago", country: "United States", latitude: 41.8781, longitude: -87.6298, elevation: 181, timezone: "America/Chicago" },
  { id: "houston", name: "Houston", country: "United States", latitude: 29.7604, longitude: -95.3698, elevation: 13, timezone: "America/Chicago" },
  { id: "newyork", name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006, elevation: 10, timezone: "America/New_York" },
  { id: "miami", name: "Miami", country: "United States", latitude: 25.7617, longitude: -80.1918, elevation: 2, timezone: "America/New_York" },
  { id: "toronto", name: "Toronto", country: "Canada", latitude: 43.6532, longitude: -79.3832, elevation: 76, timezone: "America/Toronto" },
  { id: "vancouver", name: "Vancouver", country: "Canada", latitude: 49.2827, longitude: -123.1207, elevation: 70, timezone: "America/Vancouver" },
  { id: "mexicocity", name: "Mexico City", country: "Mexico", latitude: 19.4326, longitude: -99.1332, elevation: 2240, timezone: "America/Mexico_City" },
  { id: "bogota", name: "Bogotá", country: "Colombia", latitude: 4.711, longitude: -74.0721, elevation: 2640, timezone: "America/Bogota" },
  { id: "lima", name: "Lima", country: "Peru", latitude: -12.0464, longitude: -77.0428, elevation: 154, timezone: "America/Lima" },
  { id: "saopaulo", name: "São Paulo", country: "Brazil", latitude: -23.5558, longitude: -46.6396, elevation: 760, timezone: "America/Sao_Paulo" },
  { id: "buenosaires", name: "Buenos Aires", country: "Argentina", latitude: -34.6037, longitude: -58.3816, elevation: 25, timezone: "America/Argentina/Buenos_Aires" },
  { id: "santiago", name: "Santiago", country: "Chile", latitude: -33.4489, longitude: -70.6693, elevation: 570, timezone: "America/Santiago" },
];

export const DEFAULT_PLACE = PLACES[0];
const STORAGE_KEY = "astro.selected-location";

export function formatPlace(place: Place) {
  return `${place.name}, ${place.country}`;
}

export function formatCoordinates(lat: number, lon: number) {
  const pair = (value: number, pos: string, neg: string) => {
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const minutes = Math.round((abs - degrees) * 60);
    return `${degrees}°${String(minutes).padStart(2, "0")}′${value >= 0 ? pos : neg}`;
  };
  return `${pair(lat, "N", "S")} · ${pair(lon, "E", "W")}`;
}

export function formatClock(date: Date, timeZone: string, withSeconds = true) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: false,
    timeZone,
  }).format(date);
}

export function formatDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(date);
}

export function formatStamp(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(date).toUpperCase();
}

export function timezoneMeta(date: Date, timeZone: string) {
  const short = new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "short" }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value ?? timeZone;
  const offset = new Intl.DateTimeFormat("en-GB", { timeZone, timeZoneName: "shortOffset" }).formatToParts(date).find((part) => part.type === "timeZoneName")?.value ?? "";
  return `${short} (${offset.replace("GMT", "UTC")})`;
}

export function localWeekday(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone }).format(date);
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function nearestPlace(lat: number, lon: number) {
  return PLACES.reduce((best, place) => {
    const next = distanceKm(lat, lon, place.latitude, place.longitude);
    const current = distanceKm(lat, lon, best.latitude, best.longitude);
    return next < current ? place : best;
  });
}

export function searchPlaces(query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return PLACES;
  return PLACES.filter((place) => `${place.name} ${place.country} ${place.timezone}`.toLowerCase().includes(value));
}

export function placeFromTimezone(timeZone: string): Place {
  const exact = PLACES.find((place) => place.timezone === timeZone);
  if (exact) return { ...exact, id: `tz-${exact.id}` };
  const city = timeZone.split("/").pop()?.replaceAll("_", " ").toLowerCase();
  const named = city ? PLACES.find((place) => place.name.toLowerCase() === city) : undefined;
  return named ? { ...named, timezone: timeZone } : { ...DEFAULT_PLACE, id: "system-tz", name: city ? city.replace(/\b\w/g, (c) => c.toUpperCase()) : "Local timezone", timezone: timeZone };
}

export function placeFromCoordinates(lat: number, lon: number, elevation = 0, timeZone?: string): Place {
  const nearest = nearestPlace(lat, lon);
  const km = distanceKm(lat, lon, nearest.latitude, nearest.longitude);
  const zone = timeZone || nearest.timezone;
  if (km <= 85) {
    return { ...nearest, latitude: lat, longitude: lon, elevation: elevation || nearest.elevation, timezone: zone };
  }
  return {
    id: "local-gps",
    name: "Current location",
    country: `${Math.round(km)} km from ${nearest.name}`,
    latitude: lat,
    longitude: lon,
    elevation: Math.round(elevation || nearest.elevation),
    timezone: zone,
  };
}

export function readStoredPlace(): Place | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Place;
    if (!parsed?.name || !parsed.timezone || !Number.isFinite(parsed.latitude) || !Number.isFinite(parsed.longitude)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredPlace(place: Place) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(place));
}

export function zonedDate(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let pass = 0; pass < 2; pass += 1) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date(utc));
    const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
    const asUtc = Date.UTC(value("year"), value("month") - 1, value("day"), value("hour") % 24, value("minute"), value("second"));
    utc -= asUtc - utc;
  }
  return new Date(utc);
}

export function detectLocalPlace(): Promise<{ place: Place; note: string }> {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London";
  const fallback = () => ({ place: placeFromTimezone(timeZone), note: "Used the system timezone because precise coordinates were unavailable." });

  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(fallback());
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          place: placeFromCoordinates(position.coords.latitude, position.coords.longitude, position.coords.altitude ?? 0, timeZone),
          note: "Matched your device coordinates to the offline location catalog.",
        });
      },
      () => resolve(fallback()),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 },
    );
  });
}
