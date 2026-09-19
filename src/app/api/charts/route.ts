import { db } from "@/db";
import { savedCharts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const charts = await db.select().from(savedCharts).orderBy(desc(savedCharts.createdAt)).limit(50);
    return NextResponse.json({ charts });
  } catch {
    return NextResponse.json({ charts: [], warning: "Archive is not initialized yet." });
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const now = new Date();
  const saveQuestionText = Boolean(body.saveQuestionText);

  const [chart] = await db
    .insert(savedCharts)
    .values({
      name: String(body.name || "Untitled chart"),
      mode: String(body.mode || "Current Time"),
      question: saveQuestionText ? String(body.question || "") : null,
      saveQuestionText,
      localTime: new Date(String(body.localTime || now.toISOString())),
      utcTime: new Date(String(body.utcTime || now.toISOString())),
      timezone: String(body.timezone || "Europe/London"),
      locationName: String(body.locationName || "London, United Kingdom"),
      latitude: Number(body.latitude ?? 51.5074),
      longitude: Number(body.longitude ?? -0.1278),
      elevation: Number(body.elevation ?? 11),
      houseSystem: String(body.houseSystem || "Regiomontanus"),
      zodiac: String(body.zodiac || "Tropical"),
      ephemerisMode: String(body.ephemerisMode || "Local preview adapter"),
      calculationVersion: "0.9.0-preview",
      chartData: typeof body.chartData === "object" && body.chartData ? body.chartData as Record<string, unknown> : {},
    })
    .returning();

  return NextResponse.json({ chart }, { status: 201 });
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "A valid chart id is required." }, { status: 400 });
  await db.delete(savedCharts).where(eq(savedCharts.id, id));
  return NextResponse.json({ ok: true });
}
