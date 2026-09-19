import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const defaultSettings = {
  profile: "default",
  ephemerisPath: "C:\\Users\\User\\Downloads\\swephem",
  houseSystem: "Regiomontanus",
  zodiac: "Tropical",
  ruleProfile: "Traditional Horary · Lilly",
  theme: "dark",
  expertMode: true,
  preferences: {},
};

export async function GET() {
  try {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.profile, "default")).limit(1);
    return NextResponse.json({ settings: settings ?? defaultSettings });
  } catch {
    return NextResponse.json({ settings: defaultSettings, warning: "Settings database is not initialized." });
  }
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const existing = (await db.select().from(userSettings).where(eq(userSettings.profile, "default")).limit(1))[0];
  const incomingPreferences = typeof body.preferences === "object" && body.preferences ? body.preferences as Record<string, unknown> : {};
  const values = {
    profile: "default",
    ephemerisPath: String(body.ephemerisPath || existing?.ephemerisPath || defaultSettings.ephemerisPath),
    houseSystem: String(body.houseSystem || existing?.houseSystem || defaultSettings.houseSystem),
    zodiac: String(body.zodiac || existing?.zodiac || defaultSettings.zodiac),
    ruleProfile: String(body.ruleProfile || existing?.ruleProfile || defaultSettings.ruleProfile),
    theme: String(body.theme || existing?.theme || defaultSettings.theme),
    expertMode: body.expertMode === undefined ? existing?.expertMode ?? defaultSettings.expertMode : Boolean(body.expertMode),
    preferences: { ...(existing?.preferences ?? {}), ...incomingPreferences },
    updatedAt: new Date(),
  };
  const [settings] = await db.insert(userSettings).values(values).onConflictDoUpdate({ target: userSettings.profile, set: values }).returning();
  return NextResponse.json({ settings });
}
