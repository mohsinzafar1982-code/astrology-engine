"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_PLACE, Place, detectLocalPlace, readStoredPlace, writeStoredPlace } from "@/lib/locations";

type ChartSession = {
  location: Place;
  setLocation: (place: Place) => void;
  houseSystem: string;
  setHouseSystem: (value: string) => void;
  zodiac: string;
  setZodiac: (value: string) => void;
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
};

const ChartSessionContext = createContext<ChartSession | null>(null);

export function ChartSessionProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<Place>(DEFAULT_PLACE);
  const [houseSystem, setHouseSystem] = useState("Regiomontanus");
  const [zodiac, setZodiac] = useState("Tropical");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredPlace();
    if (stored) setLocationState(stored);
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/settings");
        const payload = await response.json() as { settings?: { houseSystem?: string; zodiac?: string; preferences?: { location?: Place } } };
        const settings = payload.settings;
        if (cancelled) return;
        if (settings?.houseSystem) setHouseSystem(settings.houseSystem);
        if (settings?.zodiac) setZodiac(settings.zodiac);
        if (settings?.preferences?.location?.timezone) {
          setLocationState(settings.preferences.location);
          writeStoredPlace(settings.preferences.location);
          return;
        }
      } catch {
        /* keep going to local detection */
      }
      if (!stored && !cancelled) {
        const { place } = await detectLocalPlace();
        if (!cancelled) {
          setLocationState(place);
          writeStoredPlace(place);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const setLocation = useCallback((place: Place) => {
    setLocationState(place);
    writeStoredPlace(place);
    void fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        houseSystem,
        zodiac,
        preferences: { location: place },
      }),
    }).catch(() => undefined);
  }, [houseSystem, zodiac]);

  const value = useMemo(
    () => ({ location, setLocation, houseSystem, setHouseSystem, zodiac, setZodiac, pickerOpen, setPickerOpen }),
    [location, setLocation, houseSystem, zodiac, pickerOpen],
  );

  return <ChartSessionContext.Provider value={value}>{children}</ChartSessionContext.Provider>;
}

export function useChartSession() {
  const value = useContext(ChartSessionContext);
  if (!value) throw new Error("Chart session is unavailable");
  return value;
}
