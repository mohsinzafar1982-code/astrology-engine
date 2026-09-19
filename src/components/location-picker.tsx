"use client";

import { Check, Globe2, LoaderCircle, LocateFixed, MapPin, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useChartSession } from "@/components/chart-session";
import { Place, detectLocalPlace, formatCoordinates, formatPlace, searchPlaces } from "@/lib/locations";

export function LocationPicker() {
  const { location, setLocation, pickerOpen, setPickerOpen } = useChartSession();
  const [mode, setMode] = useState<"catalog" | "local">("catalog");
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [draft, setDraft] = useState(location);

  useEffect(() => {
    if (pickerOpen) {
      setDraft(location);
      setNote(null);
      setMode("catalog");
      setQuery("");
    }
  }, [pickerOpen, location]);

  const results = useMemo(() => searchPlaces(query).slice(0, 8), [query]);

  async function useLocalLocation() {
    setMode("local");
    setDetecting(true);
    setNote(null);
    const detected = await detectLocalPlace();
    setDraft(detected.place);
    setLocation(detected.place);
    setNote(detected.note);
    setDetecting(false);
  }

  function apply(place: Place) {
    setLocation(place);
    setPickerOpen(false);
  }

  if (!pickerOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setPickerOpen(false)}>
      <div className="modal location-modal" role="dialog" aria-labelledby="location-title" onClick={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <span className="eyebrow">CHART LOCATION</span>
            <h2 id="location-title">Choose the place used for houses, hours, and local time</h2>
          </div>
          <button className="icon-button" onClick={() => setPickerOpen(false)} aria-label="Close location picker"><X size={18} /></button>
        </header>

        <div className="location-modes" role="tablist" aria-label="Location source">
          <button className={mode === "catalog" ? "active" : ""} onClick={() => setMode("catalog")}><Globe2 size={16} /> Catalog search</button>
          <button className={mode === "local" ? "active" : ""} onClick={() => void useLocalLocation()}><LocateFixed size={16} /> Use local location</button>
        </div>

        {mode === "catalog" ? (
          <div className="location-catalog">
            <label className="search-field large location-search">
              <Search size={16} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city, country, or timezone…" />
            </label>
            <div className="location-results">
              {results.map((place) => (
                <button key={place.id} className={draft.id === place.id ? "selected" : ""} onClick={() => setDraft(place)}>
                  <MapPin size={15} />
                  <span><strong>{place.name}</strong><small>{place.country} · {place.timezone}</small></span>
                  <em>{formatCoordinates(place.latitude, place.longitude)}</em>
                  {draft.id === place.id && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="location-local">
            {detecting ? (
              <div className="detecting-state"><LoaderCircle className="spin" size={28} /><strong>Fetching local coordinates</strong><span>Using the device location, then matching the offline catalog. No online geocoder is called.</span></div>
            ) : (
              <div className="detected-card">
                <LocateFixed size={22} />
                <div>
                  <span className="eyebrow">DETECTED</span>
                  <strong>{formatPlace(draft)}</strong>
                  <p>{formatCoordinates(draft.latitude, draft.longitude)} · {draft.timezone}</p>
                  <small>{note}</small>
                </div>
                <button className="mini-button" onClick={() => void useLocalLocation()}>Detect again</button>
              </div>
            )}
          </div>
        )}

        <div className="location-preview">
          <span>Will apply</span>
          <strong>{formatPlace(draft)}</strong>
          <em>{formatCoordinates(draft.latitude, draft.longitude)} · {draft.elevation} m · {draft.timezone}</em>
        </div>

        <footer className="modal-footer">
          <button className="button secondary" onClick={() => setPickerOpen(false)}>Cancel</button>
          <button className="button primary" onClick={() => apply(draft)} disabled={detecting}><Check size={16} /> Update location</button>
        </footer>
      </div>
    </div>
  );
}
