export const LOCALES = ["bg", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "bg";

/** All dates are stored as timestamptz and displayed in this time zone. */
export const APP_TIME_ZONE = "Europe/Sofia";

export const ACTIVITY_LEVELS = ["beginner", "amateur", "advanced"] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const DEFAULT_ACTIVITY_DURATION_MINUTES = 120;

/** Extra spots a member can request for friends when joining (+1, +2, +3). */
export const MAX_EXTRA_SLOTS = 3;

/** Chat polling interval; the transport can later be swapped for Pusher/Ably. */
export const CHAT_POLL_INTERVAL_MS = 4000;
