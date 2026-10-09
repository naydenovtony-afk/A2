/**
 * Supported sports. Stored as plain string keys in the database;
 * display names live in the web/mobile translation files (sports.<key>).
 */
export const SPORTS = [
  "football",
  "basketball",
  "volleyball",
  "tennis",
  "table_tennis",
  "badminton",
  "padel",
  "running",
  "walking",
  "cycling",
  "swimming",
  "fitness",
  "yoga",
  "hiking",
  "other",
] as const;

export type Sport = (typeof SPORTS)[number];

export function isSport(value: string): value is Sport {
  return (SPORTS as readonly string[]).includes(value);
}
