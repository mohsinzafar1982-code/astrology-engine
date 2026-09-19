export const SIGNS = [
  { name: "Aries", glyph: "♈", element: "Fire" },
  { name: "Taurus", glyph: "♉", element: "Earth" },
  { name: "Gemini", glyph: "♊", element: "Air" },
  { name: "Cancer", glyph: "♋", element: "Water" },
  { name: "Leo", glyph: "♌", element: "Fire" },
  { name: "Virgo", glyph: "♍", element: "Earth" },
  { name: "Libra", glyph: "♎", element: "Air" },
  { name: "Scorpio", glyph: "♏", element: "Water" },
  { name: "Sagittarius", glyph: "♐", element: "Fire" },
  { name: "Capricorn", glyph: "♑", element: "Earth" },
  { name: "Aquarius", glyph: "♒", element: "Air" },
  { name: "Pisces", glyph: "♓", element: "Water" },
] as const;

export const PLANET_META = {
  Sun: { glyph: "☉", color: "#eabf73" },
  Moon: { glyph: "☾", color: "#d7dbe7" },
  Mercury: { glyph: "☿", color: "#8fd5c5" },
  Venus: { glyph: "♀", color: "#d8a0c2" },
  Mars: { glyph: "♂", color: "#df806c" },
  Jupiter: { glyph: "♃", color: "#d6aa75" },
  Saturn: { glyph: "♄", color: "#9e91c5" },
} as const;

export type PlanetName = keyof typeof PLANET_META;

export type PlanetPosition = {
  name: PlanetName;
  longitude: number;
  position: string;
  sign: string;
  house: number;
  speed: number;
  motion: "Direct" | "Retrograde" | "Stationary";
  dignity: string;
  dignityTone: "positive" | "negative" | "neutral";
  score: number;
  sect: string;
  solarCondition: string;
};

export type TraceRule = {
  id: string;
  label: string;
  measured: string;
  threshold: string;
  result: "Pass" | "Caution" | "Info";
  weight: number;
  profile: string;
  note: string;
};

export type Aspect = {
  from: PlanetName;
  to: PlanetName;
  type: string;
  angle: number;
  orb: number;
  state: "Applying" | "Separating";
  supportive: boolean;
};

export const planets: PlanetPosition[] = [
  { name: "Sun", longitude: 87.14, position: "27° 08′", sign: "Gemini", house: 9, speed: 0.954, motion: "Direct", dignity: "Peregrine", dignityTone: "negative", score: 3, sect: "Sect light", solarCondition: "—" },
  { name: "Moon", longitude: 346.41, position: "16° 25′", sign: "Pisces", house: 6, speed: 12.91, motion: "Direct", dignity: "Triplicity", dignityTone: "positive", score: 7, sect: "Out of sect", solarCondition: "Free of beams" },
  { name: "Mercury", longitude: 107.43, position: "17° 26′", sign: "Cancer", house: 10, speed: 1.74, motion: "Direct", dignity: "Face", dignityTone: "positive", score: 9, sect: "Diurnal phase", solarCondition: "Free of beams" },
  { name: "Venus", longitude: 39.68, position: "09° 41′", sign: "Taurus", house: 8, speed: 1.08, motion: "Direct", dignity: "Domicile", dignityTone: "positive", score: 14, sect: "Out of sect", solarCondition: "Free of beams" },
  { name: "Mars", longitude: 154.17, position: "04° 10′", sign: "Virgo", house: 11, speed: 0.57, motion: "Direct", dignity: "Term", dignityTone: "positive", score: 5, sect: "Out of sect", solarCondition: "Free of beams" },
  { name: "Jupiter", longitude: 91.52, position: "01° 31′", sign: "Cancer", house: 9, speed: 0.22, motion: "Direct", dignity: "Exaltation", dignityTone: "positive", score: 17, sect: "In sect", solarCondition: "Combust" },
  { name: "Saturn", longitude: 1.62, position: "01° 37′", sign: "Aries", house: 7, speed: 0.04, motion: "Direct", dignity: "Fall", dignityTone: "negative", score: -10, sect: "In sect", solarCondition: "Free of beams" },
];

export const aspects: Aspect[] = [
  { from: "Sun", to: "Jupiter", type: "Conjunction", angle: 0, orb: 4.37, state: "Applying", supportive: true },
  { from: "Moon", to: "Mercury", type: "Trine", angle: 120, orb: 1.02, state: "Applying", supportive: true },
  { from: "Moon", to: "Venus", type: "Sextile", angle: 60, orb: 6.73, state: "Separating", supportive: true },
  { from: "Mercury", to: "Saturn", type: "Square", angle: 90, orb: 4.19, state: "Separating", supportive: false },
  { from: "Venus", to: "Mars", type: "Trine", angle: 120, orb: 5.51, state: "Applying", supportive: true },
  { from: "Mars", to: "Jupiter", type: "Sextile", angle: 60, orb: 2.65, state: "Separating", supportive: true },
];

export const traces: TraceRule[] = [
  { id: "moon_voc", label: "Moon void of course", measured: "Next: trine Mercury in 1°02′", threshold: "Before Pisces ingress", result: "Pass", weight: 5, profile: "Horary · Lilly", note: "Moon perfects a Ptolemaic aspect before leaving its sign." },
  { id: "asc_ruler", label: "Ascendant ruler condition", measured: "Venus 09°41′ Taurus · H8", threshold: "Dignity + house + motion", result: "Pass", weight: 9, profile: "Traditional composite", note: "Venus is in domicile and direct, though placed in a difficult house." },
  { id: "saturn_7", label: "Saturn in the seventh", measured: "Saturn 01°37′ Aries · H7", threshold: "House = 7", result: "Caution", weight: -6, profile: "Horary · Lilly", note: "A consideration before judgment, not an automatic chart rejection." },
  { id: "jupiter_combust", label: "Jupiter solar visibility", measured: "4°23′ from Sun", threshold: "Combust ≤ 8°30′", result: "Caution", weight: -5, profile: "Strict traditional", note: "Essential strength is moderated by close solar proximity." },
  { id: "sect", label: "Day chart sect", measured: "Sun altitude +42°", threshold: "Above horizon", result: "Info", weight: 2, profile: "Hellenistic", note: "Sun, Jupiter, and Saturn belong to the diurnal sect." },
];

export const sources = [
  { author: "Claudius Ptolemy", work: "Tetrabiblos", era: "2nd c. · Hellenistic", topics: ["Dignities", "Aspects", "Sect"], kind: "Primary text / translation" },
  { author: "Dorotheus of Sidon", work: "Carmen Astrologicum", era: "1st c. · Hellenistic", topics: ["Triplicity", "Elections", "Houses"], kind: "Primary text / translation" },
  { author: "Abū Ma‘shar al-Balkhī", work: "Great Introduction", era: "9th c. · Persian/Arabic", topics: ["Dignities", "Lots", "Conditions"], kind: "Primary text / scholarship" },
  { author: "al-Bīrūnī", work: "Book of Instruction", era: "11th c. · Persian/Arabic", topics: ["Terms", "Houses", "Astronomy"], kind: "Primary text / translation" },
  { author: "Guido Bonatti", work: "Liber Astronomiae", era: "13th c. · Medieval Latin", topics: ["Elections", "Receptions", "Horary"], kind: "Primary text / translation" },
  { author: "William Lilly", work: "Christian Astrology", era: "17th c. · Early modern", topics: ["Horary", "VOC Moon", "Scoring"], kind: "Primary text" },
  { author: "Dorian Greenbaum", work: "Hellenistic scholarship", era: "Modern scholarship", topics: ["Lots", "Sect", "History"], kind: "Secondary scholarly commentary" },
  { author: "Deborah Houlding", work: "Traditional astrology commentary", era: "Modern scholarship", topics: ["Houses", "Horary", "History"], kind: "Secondary scholarly commentary" },
];

export function normalizeLongitude(value: number) {
  return ((value % 360) + 360) % 360;
}

export function longitudeToSign(longitude: number) {
  const normalized = normalizeLongitude(longitude);
  const index = Math.floor(normalized / 30);
  const within = normalized % 30;
  const degrees = Math.floor(within);
  const minutes = Math.floor((within - degrees) * 60);
  return `${String(degrees).padStart(2, "0")}° ${String(minutes).padStart(2, "0")}′ ${SIGNS[index].name}`;
}

export function julianDay(date: Date) {
  return date.getTime() / 86400000 + 2440587.5;
}

export function ethicalIntent(text: string) {
  const blocked = /\b(curse|revenge|coerc|manipulat|harm|hurt|attack|blackmail|evil\s+amal|steal|exploit)\w*/i;
  return !blocked.test(text);
}

export function scoreBand(score: number) {
  if (score >= 15) return "Very strong";
  if (score >= 8) return "Supportive";
  if (score >= 3) return "Moderately supportive";
  if (score >= -2) return "Mixed / neutral";
  if (score >= -7) return "Challenging";
  if (score >= -14) return "Severely challenged";
  return "Very severely challenged";
}

export const purposeWeights: Record<string, { score: number; label: string; note: string }> = {
  "Business launch": { score: 72, label: "Favorable", note: "Strong Mercury and benefic support outweigh Saturn’s angular caution." },
  "Study & application": { score: 81, label: "Favorable", note: "Mercury is swift, direct, and receives the applying Moon by trine." },
  "Marriage & relationship": { score: 61, label: "Mixed", note: "Venus is dignified; Saturn in the seventh warrants patience and clarity." },
  "Travel": { score: 68, label: "Favorable", note: "The Moon applies to Mercury, but practical safety checks remain primary." },
  "Contract & legal": { score: 55, label: "Mixed", note: "Mercury is strong but separating from Saturn. Obtain qualified legal review." },
  "Spiritual reflection": { score: 84, label: "Favorable", note: "A supportive symbolic window for voluntary, non-harmful reflection." },
};
