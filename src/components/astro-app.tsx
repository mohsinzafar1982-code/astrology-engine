"use client";

import {
  Activity,
  AlertCircle,
  Archive,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Compass,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  HardDrive,
  Info,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  Orbit,
  PanelLeftClose,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sun,
  Telescope,
  Trash2,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChartWheel } from "@/components/chart-wheel";
import { ChartSessionProvider, useChartSession } from "@/components/chart-session";
import { LocationPicker } from "@/components/location-picker";
import {
  ethicalIntent,
  longitudeToSign,
  PlanetName,
  PlanetPosition,
  PLANET_META,
  purposeWeights,
  scoreBand,
  SIGNS,
  sources,
} from "@/lib/astro";
import { computeChart, LiveChart, signRuler } from "@/lib/engine";
import {
  formatClock,
  formatCoordinates,
  formatDate,
  formatPlace,
  timezoneMeta,
  zonedDate,
} from "@/lib/locations";

type ViewName = "Now" | "Horary" | "Electional Search" | "Chart Explorer" | "Saved Charts" | "Research Library" | "Settings" | "About";
type Theme = "dark" | "light";
type SavedChart = { id: number; name: string; mode: string; locationName: string; localTime: string; houseSystem: string; zodiac: string; createdAt: string };

const NAVIGATION: { label: ViewName; icon: typeof LayoutDashboard }[] = [
  { label: "Now", icon: LayoutDashboard },
  { label: "Horary", icon: Compass },
  { label: "Electional Search", icon: Search },
  { label: "Chart Explorer", icon: Orbit },
  { label: "Saved Charts", icon: Archive },
  { label: "Research Library", icon: BookOpenText },
];

const HOUSE_SYSTEMS = ["Regiomontanus", "Whole Sign", "Placidus", "Alcabitius", "Campanus", "Equal House", "Porphyry", "Koch", "Topocentric", "Morinus"];
const PURPOSES = Object.keys(purposeWeights);

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "positive" | "negative" | "warning" | "neutral" | "accent" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function CardHeader({ eyebrow, title, icon: Icon, action }: { eyebrow?: string; title: string; icon?: typeof Moon; action?: React.ReactNode }) {
  return (
    <div className="card-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <div className="card-title-line">{Icon && <Icon size={16} />}<h3>{title}</h3></div>
      </div>
      {action}
    </div>
  );
}

function angleText(longitude: number) {
  const sign = SIGNS[Math.floor((((longitude % 360) + 360) % 360) / 30)];
  return { glyph: sign.glyph, label: longitudeToSign(longitude) };
}

function localDateValue(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function purposeFromChart(chart: LiveChart, purpose: string) {
  const moon = chart.planets.find((item) => item.name === "Moon")!;
  const venus = chart.planets.find((item) => item.name === "Venus")!;
  const jupiter = chart.planets.find((item) => item.name === "Jupiter")!;
  const mercury = chart.planets.find((item) => item.name === "Mercury")!;
  const saturn = chart.planets.find((item) => item.name === "Saturn")!;
  let score = 54 + moon.score + Math.round(venus.score * 0.6) + Math.round(jupiter.score * 0.7) + Math.round(mercury.score * 0.35);
  if (chart.voc) score -= 14;
  if ([1, 7, 10].includes(saturn.house)) score -= 8;
  if (purpose.includes("Study")) score += mercury.score;
  if (purpose.includes("Marriage")) score += venus.score;
  score = Math.max(12, Math.min(94, score));
  const label = score >= 80 ? "Favorable" : score >= 62 ? "Mixed" : "Challenging";
  return { score, label, note: purposeWeights[purpose]?.note ?? "Scored from the selected location, time, and traditional weights." };
}

export default function AstroApp() {
  return (
    <ChartSessionProvider>
      <AstroShell />
      <LocationPicker />
    </ChartSessionProvider>
  );
}

function AstroShell() {
  const { location, houseSystem, zodiac } = useChartSession();
  const [view, setView] = useState<ViewName>("Now");
  const [theme, setTheme] = useState<Theme>("dark");
  const [expertMode, setExpertMode] = useState(true);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [savedCharts, setSavedCharts] = useState<SavedChart[]>([]);

  const loadSaved = useCallback(async () => {
    try {
      const response = await fetch("/api/charts");
      const result = await response.json() as { charts?: SavedChart[] };
      setSavedCharts(result.charts ?? []);
    } catch {
      setSavedCharts([]);
    }
  }, []);

  useEffect(() => { void loadSaved(); }, [loadSaved]);
  useEffect(() => {
    const standalone = Boolean((window as Window & { __ASTRO_STANDALONE__?: boolean }).__ASTRO_STANDALONE__);
    if (!standalone && /iPhone|iPod/i.test(navigator.userAgent)) window.location.replace("/iphone.html");
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function saveCurrentChart() {
    try {
      const now = new Date();
      const response = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${location.name} · ${formatDate(now, location.timezone)}`,
          mode: "Current Time",
          localTime: now.toISOString(),
          utcTime: now.toISOString(),
          timezone: location.timezone,
          locationName: formatPlace(location),
          latitude: location.latitude,
          longitude: location.longitude,
          elevation: location.elevation,
          houseSystem,
          zodiac,
          ephemerisMode: "Local Swiss adapter",
          chartData: { location },
        }),
      });
      if (!response.ok) throw new Error("Save failed");
      await loadSaved();
      setToast(`Saved ${formatPlace(location)}`);
    } catch {
      setToast("Archive unavailable until the local database is initialized");
    }
  }

  return (
    <div className="app" data-theme={theme}>
      <aside className={`sidebar ${sidebarCompact ? "compact" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Orbit size={24} /></div>
          {!sidebarCompact && <div><strong>ASTRO</strong><span>Research Engine</span></div>}
          <button className="icon-button sidebar-toggle" onClick={() => setSidebarCompact((value) => !value)} aria-label="Toggle sidebar"><PanelLeftClose size={17} /></button>
        </div>
        <nav className="main-nav" aria-label="Main navigation">
          <span className="nav-section-label">{sidebarCompact ? "" : "WORKSPACES"}</span>
          {NAVIGATION.map(({ label, icon: Icon }) => (
            <button key={label} className={view === label ? "active" : ""} onClick={() => setView(label)} title={sidebarCompact ? label : undefined}>
              <Icon size={19} /><span>{label}</span>{label === "Saved Charts" && savedCharts.length > 0 && <em>{savedCharts.length}</em>}
            </button>
          ))}
          <span className="nav-section-label">{sidebarCompact ? "" : "SYSTEM"}</span>
          <button className={view === "Settings" ? "active" : ""} onClick={() => setView("Settings")}><Settings size={19} /><span>Settings</span></button>
          <button className={view === "About" ? "active" : ""} onClick={() => setView("About")}><Info size={19} /><span>About & Licenses</span></button>
        </nav>
        <div className="sidebar-footer">
          {!sidebarCompact && (
            <button className="engine-chip location-chip" onClick={() => setView("Now")}>
              <span className="status-dot live" />
              <div><strong>{location.name}</strong><span>{location.timezone}</span></div>
            </button>
          )}
          <a className="privacy-line iphone-html-link" href="/iphone.html"><Smartphone size={14} />{!sidebarCompact && <span>iPhone HTML app</span>}</a>
          <div className="privacy-line"><ShieldCheck size={14} />{!sidebarCompact && <span>Local-first · Private</span>}</div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" onClick={() => setSidebarCompact((value) => !value)}><Menu size={18} /></button>
            <div className="breadcrumb"><span>Research Engine</span><i>/</i><strong>{view}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="mode-switch" aria-label="Interface complexity">
              <button className={!expertMode ? "active" : ""} onClick={() => setExpertMode(false)}>Simple</button>
              <button className={expertMode ? "active" : ""} onClick={() => setExpertMode(true)}>Expert</button>
            </div>
            <button className="icon-button theme-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle light and dark theme">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="button secondary top-save" onClick={() => void saveCurrentChart()}><Save size={16} /> Save chart</button>
            <button className="button primary" onClick={() => setView("Horary")}><Plus size={17} /> New chart</button>
          </div>
        </header>
        <main className="content">
          {view === "Now" && <NowView expertMode={expertMode} onOpenExplorer={() => setView("Chart Explorer")} />}
          {view === "Horary" && <HoraryView />}
          {view === "Electional Search" && <ElectionalView />}
          {view === "Chart Explorer" && <ExplorerView expertMode={expertMode} />}
          {view === "Saved Charts" && <SavedView charts={savedCharts} reload={loadSaved} notify={setToast} />}
          {view === "Research Library" && <ResearchView />}
          {view === "Settings" && <SettingsView theme={theme} expertMode={expertMode} notify={setToast} />}
          {view === "About" && <AboutView />}
        </main>
      </div>
      {toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );
}

function NowView({ expertMode, onOpenExplorer }: { expertMode: boolean; onOpenExplorer: () => void }) {
  const { location, houseSystem, setHouseSystem, zodiac, setZodiac, setPickerOpen } = useChartSession();
  const [now, setNow] = useState(new Date());
  const [purpose, setPurpose] = useState("Business launch");
  const [selected, setSelected] = useState<PlanetName | null>("Moon");
  const chart = useMemo(() => computeChart({ date: now, place: location, houseSystem, zodiac }), [now, location, houseSystem, zodiac]);
  const purposeScore = purposeFromChart(chart, purpose);
  const selectedPlanet = chart.planets.find((planet) => planet.name === selected);
  const ruler = signRuler(chart.asc);
  const asc = angleText(chart.asc);
  const mc = angleText(chart.mc);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="page now-page">
      <div className="page-heading">
        <div>
          <div className="heading-kicker"><span className="status-dot live" /> CURRENT MOMENT · {location.name.toUpperCase()}</div>
          <h1>Celestial conditions, <span>at a glance.</span></h1>
          <p>Astronomical data and traditional rule interpretations are displayed as separate, traceable layers.</p>
        </div>
        <div className="time-lockup"><strong>{formatClock(now, location.timezone)}</strong><span>{formatDate(now, location.timezone)} · {timezoneMeta(now, location.timezone)}</span></div>
      </div>

      <section className="context-bar" aria-label="Chart context">
        <button className="context-item location" onClick={() => setPickerOpen(true)}>
          <MapPin size={16} />
          <span><small>LOCATION</small>{formatPlace(location)}</span>
          <ChevronDown size={15} />
        </button>
        <button className="context-item"><CalendarDays size={16} /><span><small>LOCAL DATE & TIME</small>{formatDate(now, location.timezone)} · {formatClock(now, location.timezone, false)}</span></button>
        <label className="context-item context-select">
          <Orbit size={16} />
          <span><small>HOUSE SYSTEM</small>
            <select value={houseSystem} onChange={(event) => setHouseSystem(event.target.value)}>{HOUSE_SYSTEMS.map((item) => <option key={item}>{item}</option>)}</select>
          </span>
        </label>
        <label className="context-item context-select">
          <CircleDot size={16} />
          <span><small>ZODIAC</small>
            <select value={zodiac} onChange={(event) => setZodiac(event.target.value)}><option>Tropical</option><option>Sidereal</option></select>
          </span>
        </label>
        <button className="refresh-button" onClick={() => setNow(new Date())}><RefreshCw size={16} /> Refresh</button>
      </section>

      <div className="accuracy-strip">
        <div><span className="status-dot amber" /><strong>Local calculation preview</strong><span>{chart.housePreviewNote}</span></div>
        <div><span>JD {chart.jd.toFixed(5)}</span><i /><span>{formatCoordinates(location.latitude, location.longitude)}</span><i /><span>{location.timezone}</span></div>
      </div>

      <div className="dashboard-top">
        <section className="card wheel-card">
          <CardHeader eyebrow="CURRENT SKY" title={`Chart wheel · ${location.name}`} icon={Orbit} action={<div className="card-actions"><button className="mini-button" onClick={() => setPickerOpen(true)}><MapPin size={14} /> Location</button><button className="icon-button"><MoreHorizontal size={17} /></button></div>} />
          <div className="wheel-card-body">
            <ChartWheel chart={chart} selected={selected} onSelect={setSelected} stamp={now} />
            <div className="chart-side">
              <div className="anchor-block">
                <span className="eyebrow">ANGLES</span>
                <div><span>ASC</span><strong>{asc.label.split(" ").slice(0, 2).join(" ")} <b>{asc.glyph}</b></strong></div>
                <div><span>MC</span><strong>{mc.label.split(" ").slice(0, 2).join(" ")} <b>{mc.glyph}</b></strong></div>
                <div><span>DSC</span><strong>{angleText(chart.dsc).label.split(" ").slice(0, 2).join(" ")} <b>{angleText(chart.dsc).glyph}</b></strong></div>
                <div><span>IC</span><strong>{angleText(chart.ic).label.split(" ").slice(0, 2).join(" ")} <b>{angleText(chart.ic).glyph}</b></strong></div>
              </div>
              <div className="anchor-block">
                <span className="eyebrow">CHART</span>
                <div><span>Ruler</span><strong><b>{PLANET_META[ruler].glyph}</b> {ruler}</strong></div>
                <div><span>Sect</span><strong>{chart.sect === "day" ? <Sun size={13} /> : <Moon size={13} />} {chart.sect === "day" ? "Day" : "Night"}</strong></div>
                <div><span>ARMC</span><strong>{chart.armc.toFixed(1)}°</strong></div>
              </div>
              {selectedPlanet && (
                <div className="selected-planet">
                  <span className="planet-large" style={{ color: PLANET_META[selectedPlanet.name].color }}>{PLANET_META[selectedPlanet.name].glyph}</span>
                  <div><small>SELECTED</small><strong>{selectedPlanet.name}</strong><span>{selectedPlanet.position} {selectedPlanet.sign} · H{selectedPlanet.house}</span></div>
                  <button onClick={onOpenExplorer}><ArrowRight size={15} /></button>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="right-stack">
          <section className="card moon-card">
            <CardHeader eyebrow="LUNAR CONDITION" title={`Moon in ${chart.planets.find((item) => item.name === "Moon")?.sign}`} icon={Moon} action={<Badge tone={chart.voc ? "warning" : "positive"}>{chart.voc ? "VOC caution" : "Supportive"}</Badge>} />
            <div className="moon-hero">
              <div className="moon-phase"><span /></div>
              <div><strong>{chart.moonPhase}</strong><span>{(chart.moonIllumination * 100).toFixed(1)}% illuminated</span><em>{chart.planets.find((item) => item.name === "Moon")?.position} {chart.planets.find((item) => item.name === "Moon")?.sign} · House {chart.planets.find((item) => item.name === "Moon")?.house}</em></div>
            </div>
            <div className="fact-grid">
              <div><small>VOID OF COURSE</small><strong className={chart.voc ? "negative" : "positive"}>{chart.voc ? "Yes" : "No"}</strong></div>
              <div><small>NEXT ASPECT</small><strong>{chart.nextMoonAspect}</strong><span>Applying / selected orbs</span></div>
              <div><small>LAST ASPECT</small><strong>{chart.lastMoonAspect}</strong><span>Separating</span></div>
              <div><small>DISPOSITOR</small><strong>{PLANET_META[signRuler(chart.planets.find((item) => item.name === "Moon")!.longitude)].glyph} {signRuler(chart.planets.find((item) => item.name === "Moon")!.longitude)}</strong><span>Moon’s sign ruler</span></div>
            </div>
            <div className={`rule-note ${chart.voc ? "" : "positive"}`}><Sparkles size={15} /><span><strong>{chart.voc ? "Moon is void of course under the selected definition." : "Moon still applies before sign ingress."}</strong> Judged for {location.name}.</span></div>
          </section>

          <section className="card hour-card">
            <CardHeader eyebrow="PLANETARY TIME" title={`${chart.hours.hourRuler} hour`} icon={Clock3} action={<Badge tone="accent">{chart.hours.isDayHour ? "Day" : "Night"} hour {chart.hours.isDayHour ? chart.hours.hourNumber : chart.hours.hourNumber - 12}</Badge>} />
            <div className="hour-ruler"><span className="mercury-seal">{PLANET_META[chart.hours.hourRuler].glyph}</span><div><strong>{chart.hours.hourRuler}</strong><span>{chart.hours.weekday} · {chart.hours.dayRuler} day</span></div><Badge tone="positive">Local</Badge></div>
            <div className="hour-timeline"><span className="sunrise"><Sun size={13} /></span><div><i style={{ width: `${Math.max(4, Math.min(96, ((now.getTime() - chart.hours.sunrise.getTime()) / (chart.hours.nextSunrise.getTime() - chart.hours.sunrise.getTime())) * 100))}%` }} /><b style={{ left: `${Math.max(4, Math.min(96, ((now.getTime() - chart.hours.sunrise.getTime()) / (chart.hours.nextSunrise.getTime() - chart.hours.sunrise.getTime())) * 100))}%` }} /></div><span className="sunset"><Moon size={13} /></span></div>
            <div className="timeline-times"><span>Sunrise <strong>{formatClock(chart.hours.sunrise, location.timezone, false)}</strong></span><span>Now <strong>{formatClock(now, location.timezone, false)}</strong></span><span>Sunset <strong>{formatClock(chart.hours.sunset, location.timezone, false)}</strong></span></div>
            <div className="hour-window"><span><small>CURRENT HOUR</small><strong>{formatClock(chart.hours.start, location.timezone, false)} — {formatClock(chart.hours.end, location.timezone, false)}</strong></span><ArrowRight size={15} /><span><small>NEXT · {chart.hours.nextHourRuler.toUpperCase()}</small><strong>{formatClock(chart.hours.end, location.timezone, false)}</strong></span></div>
          </section>
        </div>
      </div>

      <div className="condition-grid">
        {(() => {
          const ranked = [...chart.planets].sort((a, b) => b.score - a.score);
          const best = ranked[0];
          const worst = ranked[ranked.length - 1];
          const applying = chart.aspects.find((item) => item.state === "Applying");
          return (
            <>
              <section className="metric-card positive-metric"><div className="metric-icon"><Sparkles size={18} /></div><div><span>STRONGEST SUPPORT</span><strong>{best.name} <em>{best.score > 0 ? "+" : ""}{best.score}</em></strong><p>{best.dignity} · H{best.house} · {best.sect}</p></div><ArrowUpRight size={18} /></section>
              <section className="metric-card negative-metric"><div className="metric-icon"><TriangleAlert size={18} /></div><div><span>STRONGEST CAUTION</span><strong>{worst.name} <em>{worst.score}</em></strong><p>{worst.dignity} · H{worst.house} · {worst.solarCondition}</p></div><ArrowDownRight size={18} /></section>
              <section className="metric-card"><div className="metric-icon"><Activity size={18} /></div><div><span>KEY APPLYING ASPECT</span><strong>{applying ? `${applying.from} ${applying.type} ${applying.to}` : "None in orb"}</strong><p>{applying ? `${applying.orb.toFixed(2)}° · ${applying.state}` : "No applying Ptolemaic aspect"}</p></div><ArrowRight size={18} /></section>
            </>
          );
        })()}
        <section className="metric-card score-metric">
          <div className="score-ring" style={{ "--score": `${purposeScore.score * 3.6}deg` } as React.CSSProperties}><span>{purposeScore.score}</span></div>
          <div><span>ELECTIONAL SUITABILITY</span><strong>{purposeScore.label}</strong><select value={purpose} onChange={(event) => setPurpose(event.target.value)}>{PURPOSES.map((item) => <option key={item}>{item}</option>)}</select></div>
        </section>
      </div>

      <div className="analysis-grid">
        <section className="card positions-card">
          <CardHeader eyebrow="ASTRONOMICAL FACTS" title="Planetary positions" icon={Telescope} action={<div className="card-actions"><button className="mini-button"><Filter size={14} /> Traditional 7</button><button className="mini-button"><Download size={14} /> Export</button></div>} />
          <PositionsTable planets={chart.planets} selected={selected} setSelected={setSelected} expertMode={expertMode} />
        </section>
        <section className="card trace-card">
          <CardHeader eyebrow="INTERPRETIVE LAYER" title="Judgment trace" icon={FileText} action={<button className="mini-button" onClick={onOpenExplorer}>View all <ArrowRight size={13} /></button>} />
          <div className="trace-summary"><Gauge size={18} /><div><strong>{purposeScore.label} under selected rules</strong><span>{purposeScore.note}</span></div></div>
          <div className="trace-list">
            {chart.traces.map((trace) => (
              <div className="trace-item" key={trace.id}>
                <span className={`trace-status ${trace.result.toLowerCase()}`}>{trace.result === "Pass" ? <Check size={12} /> : trace.result === "Caution" ? <AlertCircle size={12} /> : <Info size={12} />}</span>
                <div><strong>{trace.label}</strong><span>{trace.measured}</span></div>
                <em className={trace.weight >= 0 ? "positive" : "negative"}>{trace.weight > 0 ? "+" : ""}{trace.weight}</em>
              </div>
            ))}
          </div>
          <button className="trace-footer" onClick={onOpenExplorer}><SlidersHorizontal size={14} /> Open full rule trace <ArrowRight size={14} /></button>
        </section>
      </div>
      <Disclaimer />
    </div>
  );
}

function PositionsTable({ planets, selected, setSelected, expertMode }: { planets: PlanetPosition[]; selected: PlanetName | null; setSelected: (name: PlanetName) => void; expertMode: boolean }) {
  return (
    <div className="table-wrap">
      <table className="positions-table">
        <thead><tr><th>Body</th><th>Position</th><th>House</th>{expertMode && <th>Speed</th>}<th>Motion</th><th>Dignity</th><th>Condition</th><th>Score</th></tr></thead>
        <tbody>
          {planets.map((planet) => (
            <tr key={planet.name} className={selected === planet.name ? "selected" : ""} onClick={() => setSelected(planet.name)}>
              <td><span className="planet-table-glyph" style={{ color: PLANET_META[planet.name].color }}>{PLANET_META[planet.name].glyph}</span><strong>{planet.name}</strong></td>
              <td><strong>{planet.position}</strong><span>{planet.sign}</span></td>
              <td><Badge>{planet.house}</Badge></td>
              {expertMode && <td>{planet.speed.toFixed(3)}°/d</td>}
              <td><span className={`motion-dot ${planet.motion === "Retrograde" ? "retrograde" : ""}`} />{planet.motion}</td>
              <td><span className={planet.dignityTone === "positive" ? "positive" : planet.dignityTone === "negative" ? "negative" : ""}>{planet.dignity}</span></td>
              <td>{planet.solarCondition}</td>
              <td><span className={`score-pill ${planet.score >= 8 ? "high" : planet.score < 0 ? "low" : "mid"}`}>{planet.score > 0 ? "+" : ""}{planet.score}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LocationField() {
  const { location, setPickerOpen } = useChartSession();
  return (
    <label className="field">
      <span>LOCATION</span>
      <button type="button" className="location-field-button" onClick={() => setPickerOpen(true)}>
        <MapPin size={15} />
        <span><strong>{formatPlace(location)}</strong><small>{formatCoordinates(location.latitude, location.longitude)} · {location.timezone}</small></span>
        <ChevronDown size={15} />
      </button>
    </label>
  );
}

function HoraryView() {
  const { location, houseSystem, setHouseSystem, zodiac } = useChartSession();
  const [question, setQuestion] = useState("Will the client accept the revised project scope?");
  const [analyzed, setAnalyzed] = useState(true);
  const [saveQuestion, setSaveQuestion] = useState(false);
  const [localDate, setLocalDate] = useState(() => localDateValue(new Date(), location.timezone));
  const [localTime, setLocalTime] = useState(() => formatClock(new Date(), location.timezone, false));
  const safe = ethicalIntent(question);
  const stamp = useMemo(() => zonedDate(localDate, localTime, location.timezone), [localDate, localTime, location.timezone]);
  const chart = useMemo(() => computeChart({ date: stamp, place: location, houseSystem, zodiac }), [stamp, location, houseSystem, zodiac]);

  useEffect(() => {
    setLocalDate(localDateValue(new Date(), location.timezone));
    setLocalTime(formatClock(new Date(), location.timezone, false));
  }, [location.timezone]);

  const moon = chart.planets.find((item) => item.name === "Moon")!;
  const ruler = chart.planets.find((item) => item.name === signRuler(chart.asc))!;

  return (
    <div className="page inner-page">
      <PageTitle eyebrow="HORARY WORKSPACE" title="Ask clearly. Judge transparently." description="Each testimony is measured against the selected traditional profile; considerations do not automatically invalidate a chart." icon={Compass} />
      <div className="horary-layout">
        <section className="card form-card">
          <CardHeader eyebrow="STEP 01" title="Question & chart moment" icon={FileText} action={<Badge tone="accent">{formatPlace(location)}</Badge>} />
          <label className="field full"><span>HORARY QUESTION</span><textarea value={question} onChange={(event) => { setQuestion(event.target.value); setAnalyzed(false); }} rows={4} /><small>Phrase one sincere, specific, ethical question. Your text remains local by default.</small></label>
          {!safe && <div className="ethical-refusal"><ShieldCheck size={20} /><div><strong>This tool does not assist with harmful or coercive intentions.</strong><span>Consider a safe alternative focused on reflection, reconciliation, protection, or delaying action.</span></div></div>}
          <div className="field-row"><LocationField /><label className="field"><span>HOUSE SYSTEM</span><select value={houseSystem} onChange={(event) => setHouseSystem(event.target.value)}>{HOUSE_SYSTEMS.map((house) => <option key={house}>{house}</option>)}</select></label></div>
          <div className="field-row"><label className="field"><span>LOCAL DATE</span><input type="date" value={localDate} onChange={(event) => setLocalDate(event.target.value)} /></label><label className="field"><span>LOCAL TIME</span><input type="time" value={localTime} onChange={(event) => setLocalTime(event.target.value)} /></label></div>
          <label className="check-line"><input type="checkbox" checked={saveQuestion} onChange={(event) => setSaveQuestion(event.target.checked)} /><span><strong>Allow saving question text</strong><small>Off by default. Chart metadata can still be saved.</small></span></label>
          <button className="button primary analyze-button" disabled={!safe || question.trim().length < 8} onClick={() => setAnalyzed(true)}><Sparkles size={17} /> Analyze selected rules</button>
        </section>
        <div className="horary-results">
          <section className="card fitness-card">
            <CardHeader eyebrow="STEP 02" title="Chart fitness considerations" icon={ShieldCheck} action={<Badge tone={chart.voc ? "warning" : "positive"}>{chart.voc ? "VOC caution" : "Readable"}</Badge>} />
            {!analyzed ? <EmptyAnalysis /> : <>
              <div className="fitness-score"><div className="score-ring compact" style={{ "--score": `${Math.max(40, 70 + ruler.score) * 3.6}deg` } as React.CSSProperties}><span>{Math.max(40, Math.min(92, 68 + ruler.score))}</span></div><div><strong>Judged at {location.name}</strong><p>{formatCoordinates(location.latitude, location.longitude)} · {timezoneMeta(stamp, location.timezone)}</p></div></div>
              <div className="fitness-list">
                <RuleRow label="Ascendant degree" value={longitudeToSign(chart.asc)} status={(((chart.asc % 30) + 30) % 30) < 3 || (((chart.asc % 30) + 30) % 30) > 27 ? "Caution" : "Clear"} />
                <RuleRow label="Moon void of course" value={chart.voc ? "Yes under selected definition" : chart.nextMoonAspect} status={chart.voc ? "Caution" : "Clear"} />
                <RuleRow label="Hour ruler" value={`${chart.hours.hourRuler} · ${chart.hours.weekday}`} status="Info" />
                <RuleRow label="Ascendant ruler" value={`${ruler.name} · ${ruler.dignity} · H${ruler.house}`} status={ruler.score >= 0 ? "Clear" : "Mixed"} />
              </div>
            </>}
          </section>
          <section className="card testimony-card">
            <CardHeader eyebrow="STEPS 03–04" title="Significators & testimony" icon={Activity} />
            {!analyzed ? <EmptyAnalysis /> : <>
              <div className="significator-grid">
                <div><span className="sig-glyph">{PLANET_META[ruler.name].glyph}</span><small>QUERENT · LORD 1</small><strong>{ruler.name}</strong><p>{ruler.position} {ruler.sign} · H{ruler.house}</p><Badge tone={ruler.score >= 8 ? "positive" : "neutral"}>{ruler.score > 0 ? "+" : ""}{ruler.score}</Badge></div>
                <div className="sig-connection"><span>{chart.aspects.some((item) => item.from === ruler.name || item.to === ruler.name) ? "ASPECTS PRESENT" : "NO DIRECT PTOLEMAIC ASPECT"}</span><i /><Badge>{location.name}</Badge></div>
                <div><span className="sig-glyph">☾</span><small>CO-SIGNIFICATOR</small><strong>Moon</strong><p>{moon.position} {moon.sign} · H{moon.house}</p><Badge tone={chart.voc ? "warning" : "positive"}>{moon.score > 0 ? "+" : ""}{moon.score}</Badge></div>
              </div>
              <div className="outcome-panel">
                <div className="outcome-mark"><Gauge size={22} /></div>
                <div><span>TESTIMONY BALANCE</span><h3>{chart.voc ? "Mixed / delay-oriented symbolic testimony" : "Mixed to favorable symbolic testimony"}</h3><p>Judged for {formatPlace(location)} at {formatClock(stamp, location.timezone, false)} {timezoneMeta(stamp, location.timezone)}. This is not a guarantee or substitute for professional advice.</p></div>
              </div>
            </>}
          </section>
        </div>
      </div>
      <Disclaimer />
    </div>
  );
}

function ElectionalView() {
  const { location, houseSystem, zodiac, setPickerOpen } = useChartSession();
  const [purpose, setPurpose] = useState("Business launch");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [results, setResults] = useState<{ date: string; time: string; score: number; label: string; asc: string; moon: string; hour: string; reasons: string[]; caution: string }[]>([]);

  function runSearch() {
    setRunning(true);
    setProgress(8);
    const found: typeof results = [];
    const start = new Date();
    for (let day = 1; day <= 6 && found.length < 4; day += 1) {
      for (const time of ["08:15", "10:40", "14:05", "16:50"]) {
        const dateValue = localDateValue(new Date(start.getTime() + day * 86400000), location.timezone);
        const stamp = zonedDate(dateValue, time, location.timezone);
        const chart = computeChart({ date: stamp, place: location, houseSystem, zodiac });
        const scored = purposeFromChart(chart, purpose);
        const moon = chart.planets.find((item) => item.name === "Moon")!;
        found.push({
          date: formatDate(stamp, location.timezone),
          time: `${time} — ${formatClock(new Date(stamp.getTime() + 45 * 60000), location.timezone, false)}`,
          score: scored.score,
          label: scored.score >= 80 ? "Excellent under rules" : scored.score >= 62 ? "Favorable" : "Mixed",
          asc: longitudeToSign(chart.asc),
          moon: `${moon.position} ${moon.sign} · H${moon.house}`,
          hour: `${PLANET_META[chart.hours.hourRuler].glyph} ${chart.hours.hourRuler}`,
          reasons: [`${chart.hours.weekday} · ${chart.hours.hourRuler} hour at ${location.name}`, `ASC ${longitudeToSign(chart.asc)}`, chart.voc ? "Moon VOC is a caution in this window" : "Moon applies before sign exit"],
          caution: chart.voc ? "Void-of-course Moon under selected definition" : `Saturn in house ${chart.planets.find((item) => item.name === "Saturn")?.house}`,
        });
      }
    }
    found.sort((a, b) => b.score - a.score);
    let value = 8;
    const timer = window.setInterval(() => {
      value += 18;
      setProgress(Math.min(value, 100));
      if (value >= 100) {
        window.clearInterval(timer);
        setRunning(false);
        setResults(found.slice(0, 4));
      }
    }, 120);
  }

  useEffect(() => {
    runSearch();
    return () => setRunning(false);
  }, [location.id, location.latitude, location.longitude, houseSystem, zodiac]);

  return (
    <div className="page inner-page">
      <PageTitle eyebrow="ELECTIONAL WORKSPACE" title="Find the strongest practical window." description="Search, compare, and refine local candidate times. No election is perfect; every result shows its trade-offs." icon={Search} />
      <div className="election-layout">
        <aside className="card search-sidebar">
          <CardHeader eyebrow="SEARCH CRITERIA" title="Configure election" icon={SlidersHorizontal} />
          <label className="field"><span>ETHICAL PURPOSE</span><select value={purpose} onChange={(event) => setPurpose(event.target.value)}>{PURPOSES.map((item) => <option key={item}>{item}</option>)}</select></label>
          <LocationField />
          <button className="button primary analyze-button" onClick={runSearch} disabled={running}>{running ? <LoaderCircle className="spin" size={17} /> : <Play size={17} />}{running ? "Searching local times…" : "Search candidate windows"}</button>
          {running && <div className="search-progress"><div><i style={{ width: `${progress}%` }} /></div><span>Scoring windows for {location.name}</span><strong>{progress}%</strong></div>}
        </aside>
        <section className="results-column">
          <div className="results-toolbar">
            <div><span className="eyebrow">RANKED WINDOWS</span><h2>{results.length} high-quality candidates</h2><p>{purpose} · {formatPlace(location)} · {location.timezone}</p></div>
            <div className="card-actions"><button className="mini-button" onClick={() => setPickerOpen(true)}><MapPin size={14} /> Change location</button></div>
          </div>
          {running && results.length === 0 ? <div className="searching-state card"><div className="orbit-loader"><Orbit size={35} /></div><h3>Searching {location.name}</h3><p>Calculating angles, lunar applications, planetary hours, and purpose-house condition for this location.</p></div> :
            <div className="candidate-list">{results.map((candidate, index) => <CandidateCard key={candidate.date + candidate.time} candidate={candidate} rank={index + 1} zone={location.timezone} />)}</div>}
        </section>
      </div>
      <Disclaimer />
    </div>
  );
}

function CandidateCard({ candidate, rank, zone }: { candidate: { date: string; time: string; score: number; label: string; asc: string; moon: string; hour: string; reasons: string[]; caution: string }; rank: number; zone: string }) {
  const [expanded, setExpanded] = useState(rank === 1);
  return (
    <article className={`card candidate ${expanded ? "expanded" : ""}`}>
      <button className="candidate-main" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
        <span className="rank">#{rank}</span>
        <div className="candidate-time"><small>{candidate.date}</small><strong>{candidate.time}</strong><span>{zone}</span></div>
        <div className="candidate-facts"><span><small>ASCENDANT</small><strong>{candidate.asc}</strong></span><span><small>MOON</small><strong>{candidate.moon}</strong></span><span><small>PLANETARY HOUR</small><strong>{candidate.hour}</strong></span></div>
        <div className="candidate-score"><div className="score-ring compact" style={{ "--score": `${candidate.score * 3.6}deg` } as React.CSSProperties}><span>{candidate.score}</span></div><span>{candidate.label}</span></div>
        <ChevronDown size={17} />
      </button>
      {expanded && <div className="candidate-detail"><div><span className="eyebrow">WHY THIS TIME RANKED HERE</span>{candidate.reasons.map((reason) => <p key={reason}><CheckCircle2 size={14} />{reason}</p>)}</div><div><span className="eyebrow">TRADE-OFF</span><p className="caution-text"><TriangleAlert size={14} />{candidate.caution}</p></div></div>}
    </article>
  );
}

function ExplorerView({ expertMode }: { expertMode: boolean }) {
  const { location, houseSystem, zodiac, setPickerOpen } = useChartSession();
  const [now, setNow] = useState(new Date());
  const [selected, setSelected] = useState<PlanetName | null>("Jupiter");
  const [tab, setTab] = useState("Aspects");
  const chart = useMemo(() => computeChart({ date: now, place: location, houseSystem, zodiac }), [now, location, houseSystem, zodiac]);
  const selectedPlanet = chart.planets.find((item) => item.name === selected)!;
  const tabs = ["Aspects", "Dignities", "Houses", "Moon", "Planetary Hour", "Lots", "Rule Trace", "Sources"];
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className="page inner-page explorer-page">
      <PageTitle eyebrow="CHART EXPLORER" title="Inspect every layer." description="Astronomical values, traditional techniques, modern optional layers, and user weights remain visibly distinct." icon={Orbit} />
      <div className="explorer-grid">
        <section className="card explorer-wheel"><CardHeader eyebrow="CHART WHEEL" title={`${location.name} · ${formatDate(now, location.timezone)}`} icon={Orbit} action={<button className="mini-button" onClick={() => setPickerOpen(true)}><MapPin size={14} /> {location.name}</button>} /><ChartWheel chart={chart} selected={selected} onSelect={setSelected} stamp={now} /></section>
        <section className="card detail-sheet">
          <CardHeader eyebrow="CONDITION SHEET" title={selectedPlanet.name} icon={Activity} action={<span className={`score-pill ${selectedPlanet.score >= 8 ? "high" : selectedPlanet.score < 0 ? "low" : "mid"}`}>{selectedPlanet.score > 0 ? "+" : ""}{selectedPlanet.score}</span>} />
          <div className="planet-detail-hero"><span style={{ color: PLANET_META[selectedPlanet.name].color }}>{PLANET_META[selectedPlanet.name].glyph}</span><div><strong>{selectedPlanet.position} {selectedPlanet.sign}</strong><p>House {selectedPlanet.house} · {selectedPlanet.motion}</p><Badge tone={selectedPlanet.score >= 8 ? "positive" : selectedPlanet.score < 0 ? "negative" : "neutral"}>{scoreBand(selectedPlanet.score)}</Badge></div></div>
          <div className="score-components"><ScoreBar label="Essential dignity" score={selectedPlanet.dignity === "Exaltation" ? 4 : selectedPlanet.dignity === "Domicile" ? 5 : selectedPlanet.dignity === "Fall" ? -4 : selectedPlanet.dignity === "Detriment" ? -5 : 1} /><ScoreBar label="House strength" score={[1, 4, 7, 10].includes(selectedPlanet.house) ? 5 : [3, 6, 9, 12].includes(selectedPlanet.house) ? -3 : 2} /><ScoreBar label="Sect condition" score={selectedPlanet.sect.includes("In sect") || selectedPlanet.sect.includes("light") ? 3 : -2} /><ScoreBar label="Motion & speed" score={selectedPlanet.motion === "Direct" ? 2 : -5} /><ScoreBar label="Solar visibility" score={selectedPlanet.solarCondition === "Combust" ? -6 : selectedPlanet.solarCondition === "Cazimi" ? 6 : 2} /></div>
        </section>
      </div>
      <section className="card explorer-data">
        <div className="tabs" role="tablist">{tabs.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>
        {tab === "Aspects" ? <AspectTable chart={chart} /> : tab === "Rule Trace" ? <FullTrace chart={chart} /> : tab === "Dignities" ? <PositionsTable planets={chart.planets} selected={selected} setSelected={setSelected} expertMode={expertMode} /> : <TechniquePanel tab={tab} chart={chart} />}
      </section>
      <Disclaimer />
    </div>
  );
}

function AspectTable({ chart }: { chart: LiveChart }) {
  return <div className="table-wrap"><table className="positions-table aspects-table"><thead><tr><th>Planets</th><th>Aspect</th><th>Exact angle</th><th>Orb</th><th>Motion</th><th>Traditional score</th></tr></thead><tbody>{chart.aspects.map((aspect) => <tr key={aspect.from + aspect.to + aspect.type}><td><strong>{PLANET_META[aspect.from].glyph} {aspect.from}</strong><ArrowRight size={13} /><strong>{PLANET_META[aspect.to].glyph} {aspect.to}</strong></td><td><Badge tone={aspect.supportive ? "positive" : "negative"}>{aspect.type}</Badge></td><td>{aspect.angle.toFixed(2)}°</td><td>{aspect.orb.toFixed(2)}°</td><td>{aspect.state}</td><td><span className={aspect.supportive ? "positive" : "negative"}>{aspect.supportive ? "+3" : "−4"}</span></td></tr>)}</tbody></table></div>;
}

function FullTrace({ chart }: { chart: LiveChart }) {
  return <div className="full-trace">{chart.traces.map((trace) => <article key={trace.id}><div className={`trace-status ${trace.result.toLowerCase()}`}>{trace.result === "Pass" ? <Check size={13} /> : trace.result === "Caution" ? <AlertCircle size={13} /> : <Info size={13} />}</div><div><span className="eyebrow">{trace.profile}</span><h4>{trace.label}</h4><p>{trace.note}</p><div><span>Measured <strong>{trace.measured}</strong></span><span>Threshold <strong>{trace.threshold}</strong></span></div></div><em className={trace.weight >= 0 ? "positive" : "negative"}>{trace.weight > 0 ? "+" : ""}{trace.weight}</em></article>)}</div>;
}

function TechniquePanel({ tab, chart }: { tab: string; chart: LiveChart }) {
  const moon = chart.planets.find((item) => item.name === "Moon")!;
  const content: Record<string, string[]> = {
    Houses: [`Ascendant · ${longitudeToSign(chart.asc)}`, `MC · ${longitudeToSign(chart.mc)}`, `House system · ${chart.houseSystem}`, `Extreme latitude warning · ${chart.extremeLatitude ? "Yes" : "None"}`],
    Moon: [`${chart.moonPhase} · ${(chart.moonIllumination * 100).toFixed(1)}%`, chart.voc ? "Void of course · selected definition" : "Not void of course", `Next: ${chart.nextMoonAspect}`, `House ${moon.house} · ${moon.dignity}`],
    "Planetary Hour": [`${chart.hours.weekday} · ${chart.hours.dayRuler} day`, `${chart.hours.isDayHour ? "Day" : "Night"} hour · ${chart.hours.hourRuler}`, `Sunrise ${formatClock(chart.hours.sunrise, chart.place.timezone, false)}`, `Sunset ${formatClock(chart.hours.sunset, chart.place.timezone, false)}`],
    Lots: ["Fortune uses sect-sensitive formula", "Spirit is the inverse of Fortune", `Day/night: ${chart.sect}`, "Additional lots remain optional"],
    Sources: ["William Lilly · Christian Astrology", "Dorotheus · Carmen Astrologicum", "Abū Ma‘shar · Great Introduction", "Citation details require edition verification"],
  };
  return <div className="technique-panel"><div><span className="technique-icon"><BookOpenText size={22} /></span><h3>{tab}</h3><p>Selected profile data for {chart.place.name}.</p></div><ul>{(content[tab] ?? ["This optional layer is disabled in the active profile."]).map((item) => <li key={item}><CheckCircle2 size={15} />{item}</li>)}</ul></div>;
}

function SavedView({ charts, reload, notify }: { charts: SavedChart[]; reload: () => Promise<void>; notify: (message: string) => void }) {
  async function remove(id: number) {
    await fetch(`/api/charts?id=${id}`, { method: "DELETE" });
    await reload();
    notify("Saved chart removed");
  }
  return <div className="page inner-page"><PageTitle eyebrow="PRIVATE ARCHIVE" title="Saved charts & reports." description="Calculation metadata is retained for reproducibility. Question text is excluded unless you opt in." icon={Archive} />
    <section className="card archive-card"><CardHeader eyebrow="LOCAL DATABASE" title={`${charts.length} saved charts`} icon={Database} />
      {charts.length === 0 ? <div className="empty-state"><div><Archive size={30} /></div><h3>No saved charts yet</h3><p>Use “Save chart” in the toolbar to preserve the current location, timezone, and reproducibility metadata.</p></div> : <div className="table-wrap"><table className="positions-table archive-table"><thead><tr><th>Name</th><th>Mode</th><th>Location</th><th>Local time</th><th>System</th><th>Created</th><th /></tr></thead><tbody>{charts.map((chart) => <tr key={chart.id}><td><strong>{chart.name}</strong><span>{chart.zodiac}</span></td><td><Badge tone="accent">{chart.mode}</Badge></td><td>{chart.locationName}</td><td>{new Date(chart.localTime).toLocaleString("en-GB")}</td><td>{chart.houseSystem}</td><td>{new Date(chart.createdAt).toLocaleDateString("en-GB")}</td><td><button className="icon-button danger-button" onClick={() => void remove(chart.id)} aria-label="Delete chart"><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>}
    </section><Disclaimer /></div>;
}

function ResearchView() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => sources.filter((source) => `${source.author} ${source.work} ${source.topics.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="page inner-page"><PageTitle eyebrow="OFFLINE RESEARCH LIBRARY" title="Traditions, variants, and sources." description="References are contextual metadata—not claims of universal agreement. Unverified citation details remain explicitly marked." icon={BookOpenText} />
    <div className="research-banner"><BookOpenText size={20} /><div><strong>Historical context matters</strong><span>Muslim scholars and court astrologers produced substantial literature; legal and theological opinions varied greatly, and many scholars rejected divinatory or deterministic claims.</span></div></div>
    <section className="card research-card"><div className="library-toolbar"><div className="search-field large"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search author, work, or technique…" /></div></div>
      <div className="source-grid">{filtered.map((source) => <article className="source-card" key={source.author}><div className="source-monogram">{source.author.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div><div><span className="eyebrow">{source.era}</span><h3>{source.author}</h3><p>{source.work}</p><div>{source.topics.map((topic) => <Badge key={topic}>{topic}</Badge>)}</div><small><CheckCircle2 size={12} />{source.kind}</small></div></article>)}</div>
    </section>
    <div className="citation-caution"><AlertCircle size={16} /><span><strong>Citation policy:</strong> Exact quotations, page numbers, manuscript details, and scholarly consensus are never inferred.</span></div><Disclaimer /></div>;
}

function SettingsView({ theme, expertMode, notify }: { theme: Theme; expertMode: boolean; notify: (message: string) => void }) {
  const { location, setPickerOpen, houseSystem, setHouseSystem, zodiac, setZodiac } = useChartSession();
  const [path, setPath] = useState("C:\\Users\\User\\Downloads\\swephem");
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  async function save() {
    await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ephemerisPath: path, houseSystem, zodiac, ruleProfile: "Traditional Horary · Lilly", theme, expertMode, preferences: { location } }) });
    notify("Settings saved");
  }
  function testPath() { setTesting(true); setTested(false); window.setTimeout(() => { setTesting(false); setTested(true); }, 750); }
  return <div className="page inner-page"><PageTitle eyebrow="SYSTEM CONFIGURATION" title="Settings & calculation profiles." description="Configure the local ephemeris, house system, rule definitions, orbs, and transparent scoring weights." icon={Settings} />
    <div className="settings-layout"><aside className="settings-nav card"><button className="active"><HardDrive size={16} /> Ephemeris</button><button><MapPin size={16} /> Location</button><button><Orbit size={16} /> Chart defaults</button></aside>
      <div className="settings-content">
        <section className="card settings-section"><CardHeader eyebrow="ACTIVE PLACE" title="Default chart location" icon={MapPin} action={<Badge tone="accent">{location.timezone}</Badge>} />
          <div className="detected-card settings-location"><MapPin size={22} /><div><strong>{formatPlace(location)}</strong><p>{formatCoordinates(location.latitude, location.longitude)} · {location.elevation} m</p><small>Catalog search or “Use local location” both write this value into every workspace.</small></div><button className="button secondary" onClick={() => setPickerOpen(true)}>Change location</button></div>
        </section>
        <section className="card settings-section"><CardHeader eyebrow="IPHONE HTML APP" title="Run on iPhone Safari" icon={Smartphone} />
          <p className="settings-copy">A self-contained HTML version lives at <a href="/iphone.html">/iphone.html</a>. Open it on iPhone, then Share → Add to Home Screen.</p>
        </section>
        <section className="card settings-section"><CardHeader eyebrow="LOCAL CALCULATION ENGINE" title="Swiss Ephemeris" icon={HardDrive} action={<Badge tone="warning">Requires desktop connector</Badge>} />
          <label className="field full"><span>EPHEMERIS DATA DIRECTORY</span><div className="path-field"><input value={path} onChange={(event) => { setPath(event.target.value); setTested(false); }} /><button className="mini-button"><FolderOpen size={14} /> Browse</button></div></label>
          <div className="path-actions"><button className="button secondary" onClick={testPath}>{testing ? <LoaderCircle size={16} className="spin" /> : <Zap size={16} />} Test directory</button>{tested && <span className="path-warning"><AlertCircle size={15} /><strong>Browser preview cannot inspect Windows files.</strong></span>}</div>
        </section>
        <section className="card settings-section"><CardHeader eyebrow="ACTIVE DEFAULTS" title="Chart & rule profile" icon={SlidersHorizontal} />
          <div className="settings-fields"><label className="field"><span>DEFAULT ZODIAC</span><select value={zodiac} onChange={(event) => setZodiac(event.target.value)}><option>Tropical</option><option>Sidereal</option></select></label><label className="field"><span>HOUSE SYSTEM</span><select value={houseSystem} onChange={(event) => setHouseSystem(event.target.value)}>{HOUSE_SYSTEMS.map((house) => <option key={house}>{house}</option>)}</select></label></div>
        </section>
        <div className="settings-save"><span><ShieldCheck size={15} /> Location and settings are stored locally.</span><button className="button primary" onClick={() => void save()}><Save size={16} /> Save settings</button></div>
      </div>
    </div></div>;
}

function AboutView() {
  return <div className="page inner-page about-page"><PageTitle eyebrow="ABOUT" title="Astro Election & Horary Research Engine" description="A transparent research environment for astronomical calculation and comparative study of traditional astrological rules." icon={Info} />
    <div className="about-grid"><section className="card about-lead"><div className="about-orbit"><Orbit size={46} /></div><span className="eyebrow">VERSION 0.9 · RESEARCH PREVIEW</span><h2>Built for careful, reproducible inquiry.</h2><p>The application separates measured astronomical values from historical interpretive rules. Location, timezone, and coordinates are part of the calculation record.</p><p className="settings-copy"><a href="/iphone.html">Open the iPhone HTML app</a> — a single-file Safari version with home-screen install and local GPS (option B).</p></section>
      <section className="card license-card"><CardHeader eyebrow="ATTRIBUTION & LICENSE" title="Swiss Ephemeris" icon={HardDrive} /><p>Planetary and house calculations in packaged production builds use the Swiss Ephemeris through the local pyswisseph binding. Data files are not bundled.</p></section>
    </div><Disclaimer /></div>;
}

function PageTitle({ eyebrow, title, description, icon: Icon }: { eyebrow: string; title: string; description: string; icon: typeof Compass }) {
  return <div className="page-title"><div className="page-title-icon"><Icon size={23} /></div><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div>;
}

function RuleRow({ label, value, status }: { label: string; value: string; status: string }) {
  const tone = status === "Clear" ? "positive" : status === "Caution" ? "warning" : "neutral";
  return <div><span><strong>{label}</strong><small>{value}</small></span><Badge tone={tone}>{status}</Badge></div>;
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const width = Math.min(Math.abs(score) / 6 * 50, 50);
  return <div className="score-bar-row"><span>{label}</span><div><i className={score < 0 ? "negative-bar" : "positive-bar"} style={{ width: `${width}%`, left: score < 0 ? `${50 - width}%` : "50%" }} /><b /></div><em className={score >= 0 ? "positive" : "negative"}>{score > 0 ? "+" : ""}{score}</em></div>;
}

function EmptyAnalysis() {
  return <div className="empty-analysis"><CircleDot size={26} /><strong>Ready to calculate</strong><span>Review the question and run the selected rule profile.</span></div>;
}

function Disclaimer() {
  return <footer className="disclaimer"><ShieldCheck size={14} /><span>Traditional symbolic assessment, not a guaranteed prediction or professional advice.</span></footer>;
}
