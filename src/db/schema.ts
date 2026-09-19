import { boolean, doublePrecision, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const savedCharts = pgTable("saved_charts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mode: text("mode").notNull().default("Current Time"),
  question: text("question"),
  saveQuestionText: boolean("save_question_text").notNull().default(false),
  localTime: timestamp("local_time", { withTimezone: true }).notNull(),
  utcTime: timestamp("utc_time", { withTimezone: true }).notNull(),
  timezone: text("timezone").notNull(),
  locationName: text("location_name").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  elevation: integer("elevation").notNull().default(0),
  houseSystem: text("house_system").notNull(),
  zodiac: text("zodiac").notNull().default("Tropical"),
  ephemerisMode: text("ephemeris_mode").notNull(),
  calculationVersion: text("calculation_version").notNull(),
  chartData: jsonb("chart_data").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  profile: text("profile").notNull().unique().default("default"),
  ephemerisPath: text("ephemeris_path").notNull().default("C:\\Users\\User\\Downloads\\swephem"),
  houseSystem: text("house_system").notNull().default("Regiomontanus"),
  zodiac: text("zodiac").notNull().default("Tropical"),
  ruleProfile: text("rule_profile").notNull().default("Traditional Horary · Lilly"),
  theme: text("theme").notNull().default("dark"),
  expertMode: boolean("expert_mode").notNull().default(true),
  preferences: jsonb("preferences").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
