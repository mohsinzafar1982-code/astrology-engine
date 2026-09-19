type ChartRecord = {
  id: number;
  name: string;
  mode: string;
  question: string | null;
  saveQuestionText: boolean;
  localTime: string;
  utcTime: string;
  timezone: string;
  locationName: string;
  latitude: number;
  longitude: number;
  elevation: number;
  houseSystem: string;
  zodiac: string;
  ephemerisMode: string;
  calculationVersion: string;
  chartData: Record<string, unknown>;
  createdAt: string;
};

const CHARTS_KEY = "astro.standalone.charts";
const SETTINGS_KEY = "astro.standalone.settings";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function readCharts(): ChartRecord[] {
  try {
    return JSON.parse(localStorage.getItem(CHARTS_KEY) || "[]") as ChartRecord[];
  } catch {
    return [];
  }
}

function defaultSettings() {
  return {
    profile: "default",
    ephemerisPath: "C:\\Users\\User\\Downloads\\swephem",
    houseSystem: "Regiomontanus",
    zodiac: "Tropical",
    ruleProfile: "Traditional Horary · Lilly",
    theme: "dark",
    expertMode: true,
    preferences: {},
  };
}

export function installStandaloneApi() {
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    const method = (init?.method || (typeof input !== "string" && !(input instanceof URL) ? input.method : "GET") || "GET").toUpperCase();

    if (url.includes("/api/health")) return json({ ok: true, standalone: true });

    if (url.includes("/api/charts")) {
      if (method === "GET") return json({ charts: readCharts().sort((a, b) => b.createdAt.localeCompare(a.createdAt)) });
      if (method === "POST") {
        const body = JSON.parse(String(init?.body || "{}")) as Partial<ChartRecord>;
        const now = new Date().toISOString();
        const charts = readCharts();
        const chart: ChartRecord = {
          id: Date.now(),
          name: String(body.name || "Untitled chart"),
          mode: String(body.mode || "Current Time"),
          question: body.saveQuestionText ? String(body.question || "") : null,
          saveQuestionText: Boolean(body.saveQuestionText),
          localTime: String(body.localTime || now),
          utcTime: String(body.utcTime || now),
          timezone: String(body.timezone || "Europe/London"),
          locationName: String(body.locationName || "Unknown"),
          latitude: Number(body.latitude ?? 0),
          longitude: Number(body.longitude ?? 0),
          elevation: Number(body.elevation ?? 0),
          houseSystem: String(body.houseSystem || "Regiomontanus"),
          zodiac: String(body.zodiac || "Tropical"),
          ephemerisMode: String(body.ephemerisMode || "Standalone HTML engine"),
          calculationVersion: "0.9.0-html",
          chartData: body.chartData && typeof body.chartData === "object" ? body.chartData : {},
          createdAt: now,
        };
        charts.unshift(chart);
        localStorage.setItem(CHARTS_KEY, JSON.stringify(charts.slice(0, 100)));
        return json({ chart }, 201);
      }
      if (method === "DELETE") {
        const id = Number(new URL(url, "https://standalone.local").searchParams.get("id"));
        localStorage.setItem(CHARTS_KEY, JSON.stringify(readCharts().filter((chart) => chart.id !== id)));
        return json({ ok: true });
      }
    }

    if (url.includes("/api/settings")) {
      const existing = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null") as Record<string, unknown> | null;
      if (method === "GET") return json({ settings: existing ?? defaultSettings() });
      if (method === "PUT") {
        const body = JSON.parse(String(init?.body || "{}")) as Record<string, unknown>;
        const merged = {
          ...defaultSettings(),
          ...(existing ?? {}),
          ...body,
          preferences: { ...((existing?.preferences as object) || {}), ...((body.preferences as object) || {}) },
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        return json({ settings: merged });
      }
    }

    return original(input as RequestInfo, init);
  };
}
