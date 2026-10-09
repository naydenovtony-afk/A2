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

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VENUE_TYPES = ["school", "municipal", "private", "park", "other"] as const;
export type VenueType = (typeof VENUE_TYPES)[number];

/** New venues stay pending until an administrator verifies them. */
export const VENUE_STATUSES = ["pending", "verified"] as const;
export type VenueStatus = (typeof VENUE_STATUSES)[number];

export const FRIENDSHIP_STATUSES = ["pending", "accepted", "declined"] as const;
export type FriendshipStatus = (typeof FRIENDSHIP_STATUSES)[number];
