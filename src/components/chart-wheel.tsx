"use client";

import { PLANET_META, SIGNS } from "@/lib/astro";
import { LiveChart, glyphAngle } from "@/lib/engine";
import { formatClock, formatStamp } from "@/lib/locations";

const CENTER = 280;

function point(angle: number, radius: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(radians), y: CENTER + radius * Math.sin(radians) };
}

function ringSegment(start: number, end: number, outer: number, inner: number) {
  const a = point(start, outer);
  const b = point(end, outer);
  const c = point(end, inner);
  const d = point(start, inner);
  return `M ${a.x} ${a.y} A ${outer} ${outer} 0 0 0 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 0 1 ${d.x} ${d.y} Z`;
}

export function ChartWheel({ chart, selected, onSelect, stamp }: { chart: LiveChart; selected: keyof typeof PLANET_META | null; onSelect: (name: keyof typeof PLANET_META) => void; stamp: Date }) {
  const rotate = (longitude: number) => glyphAngle(longitude, chart.asc);

  return (
    <div className="chart-stage" aria-label="Interactive astrology chart wheel">
      <svg viewBox="0 0 560 560" className="chart-svg" role="img" aria-labelledby="chart-title chart-description">
        <title id="chart-title">Tropical chart wheel for {chart.place.name}</title>
        <desc id="chart-description">Zodiac signs, houses, seven traditional planets and enabled Ptolemaic aspects for {chart.place.name}.</desc>
        <defs>
          <filter id="planetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="wheelFill">
            <stop offset="0" stopColor="var(--wheel-core)" />
            <stop offset="1" stopColor="var(--wheel-edge)" />
          </radialGradient>
        </defs>

        <circle cx={CENTER} cy={CENTER} r="256" fill="var(--wheel-halo)" />
        <circle cx={CENTER} cy={CENTER} r="247" fill="url(#wheelFill)" stroke="var(--wheel-border)" strokeWidth="1" />

        {SIGNS.map((sign, index) => {
          const start = rotate(index * 30);
          const end = rotate(index * 30 + 30);
          const label = point((start + end) / 2, 226);
          return (
            <g key={sign.name}>
              <path d={ringSegment(start, end, 246, 205)} fill={index % 2 ? "var(--zodiac-alt)" : "var(--zodiac-main)"} stroke="var(--ring-line)" strokeWidth=".7" />
              <text x={label.x} y={label.y + 7} textAnchor="middle" className={`sign-glyph element-${sign.element.toLowerCase()}`}>{sign.glyph}</text>
              <title>{sign.name} · {sign.element}</title>
            </g>
          );
        })}

        <circle cx={CENTER} cy={CENTER} r="205" fill="none" stroke="var(--ring-line)" />
        <circle cx={CENTER} cy={CENTER} r="164" fill="none" stroke="var(--ring-line)" strokeDasharray="2 5" opacity=".6" />

        {chart.cusps.map((cusp, index) => {
          const angle = rotate(cusp);
          const outer = point(angle, 205);
          const inner = point(angle, 79);
          const next = rotate(chart.cusps[(index + 1) % 12]);
          const label = point((angle + ((next - angle + 360) % 360) / 2) % 360, 151);
          const isAngle = [0, 3, 6, 9].includes(index);
          return (
            <g key={`house-${index + 1}`}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={isAngle ? "var(--angle-line)" : "var(--house-line)"} strokeWidth={isAngle ? 1.8 : .75} />
              <text x={label.x} y={label.y + 4} textAnchor="middle" className="house-number">{index + 1}</text>
            </g>
          );
        })}

        {chart.aspects.map((aspect) => {
          const from = chart.planets.find((item) => item.name === aspect.from)!;
          const to = chart.planets.find((item) => item.name === aspect.to)!;
          const start = point(rotate(from.longitude), 128);
          const end = point(rotate(to.longitude), 128);
          return <line key={`${aspect.from}-${aspect.to}-${aspect.type}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className={aspect.supportive ? "aspect-supportive" : "aspect-challenging"} />;
        })}

        <circle cx={CENTER} cy={CENTER} r="77" fill="var(--wheel-center)" stroke="var(--ring-line)" />
        <text x={CENTER} y={CENTER - 15} textAnchor="middle" className="center-kicker">{chart.zodiac.toUpperCase()}</text>
        <text x={CENTER} y={CENTER + 8} textAnchor="middle" className="center-date">{formatStamp(stamp, chart.place.timezone)}</text>
        <text x={CENTER} y={CENTER + 29} textAnchor="middle" className="center-meta">{formatClock(stamp, chart.place.timezone, false)} · {chart.place.name.toUpperCase()}</text>

        {chart.planets.map((planet, index) => {
          const nearby = chart.planets.slice(0, index).filter((other) => Math.abs(((other.longitude - planet.longitude + 540) % 360) - 180) > 172).length;
          const radius = 185 - nearby * 22;
          const pos = point(rotate(planet.longitude), radius);
          const active = selected === planet.name;
          return (
            <g
              key={planet.name}
              className={`planet-node ${active ? "is-selected" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${planet.name}, ${planet.position} ${planet.sign}, house ${planet.house}`}
              onClick={() => onSelect(planet.name)}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(planet.name); }}
            >
              <circle cx={pos.x} cy={pos.y} r={active ? 17 : 14} fill="var(--planet-bg)" stroke={PLANET_META[planet.name].color} strokeWidth={active ? 2 : 1} filter={active ? "url(#planetGlow)" : undefined} />
              <text x={pos.x} y={pos.y + 7} textAnchor="middle" className="planet-glyph" fill={PLANET_META[planet.name].color}>{PLANET_META[planet.name].glyph}</text>
              <title>{planet.name}: {planet.position} {planet.sign} · House {planet.house} · {planet.motion}</title>
            </g>
          );
        })}

        {[{ lon: chart.asc, label: "ASC" }, { lon: chart.ic, label: "IC" }, { lon: chart.dsc, label: "DSC" }, { lon: chart.mc, label: "MC" }].map((angle) => {
          const pos = point(rotate(angle.lon), 260);
          return <text key={angle.label} x={pos.x} y={pos.y + 4} textAnchor="middle" className="angle-label">{angle.label}</text>;
        })}
      </svg>
      <div className="wheel-legend" aria-hidden="true">
        <span><i className="line supportive" /> Harmonious</span>
        <span><i className="line challenging" /> Challenging</span>
        <span><i className="line applying" /> Applying</span>
      </div>
    </div>
  );
}
