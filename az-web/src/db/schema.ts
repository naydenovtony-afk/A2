import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  ACTIVITY_LEVELS,
  DEFAULT_ACTIVITY_DURATION_MINUTES,
  FRIENDSHIP_STATUSES,
  MAX_EXTRA_SLOTS,
  USER_ROLES,
  VENUE_STATUSES,
  VENUE_TYPES,
} from "az-shared";

// Sports are plain text keys validated against SPORTS in az-shared (not a DB table/enum).

export const userRole = pgEnum("user_role", USER_ROLES);
export const venueType = pgEnum("venue_type", VENUE_TYPES);
export const venueStatus = pgEnum("venue_status", VENUE_STATUSES);
export const activityLevel = pgEnum("activity_level", ACTIVITY_LEVELS);
export const friendshipStatus = pgEnum("friendship_status", FRIENDSHIP_STATUSES);

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = (name = "created_at") =>
  timestamp(name, { withTimezone: true }).notNull().defaultNow();
const tz = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable(
  "users",
  {
    id: id(),
    /** Stored lowercased; uniqueness is enforced case-insensitively. */
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    photoUrl: text("photo_url"),
    city: text("city"),
    preferredSports: text("preferred_sports").array().notNull().default(sql`'{}'::text[]`),
    role: userRole("role").notNull().default("user"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email_lower_uq").on(sql`lower(${t.email})`)],
);

export const communities = pgTable(
  "communities",
  {
    id: id(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    sport: text("sport").notNull(),
    city: text("city").notNull(),
    isPublic: boolean("is_public").notNull().default(true),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
  },
  (t) => [
    index("communities_city_sport_idx").on(t.city, t.sport),
    index("communities_created_at_idx").on(t.createdAt),
  ],
);

export const communityMembers = pgTable(
  "community_members",
  {
    id: id(),
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isOrganizer: boolean("is_organizer").notNull().default(false),
    joinedAt: createdAt("joined_at"),
  },
  (t) => [
    uniqueIndex("community_members_community_user_uq").on(t.communityId, t.userId),
    index("community_members_user_idx").on(t.userId),
  ],
);

export const communityInvites = pgTable(
  "community_invites",
  {
    id: id(),
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    code: text("code").notNull().unique(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    expiresAt: tz("expires_at").notNull(),
    usedAt: tz("used_at"),
    usedByUserId: uuid("used_by_user_id").references(() => users.id, { onDelete: "set null" }),
  },
  (t) => [index("community_invites_community_idx").on(t.communityId)],
);

export const venues = pgTable(
  "venues",
  {
    id: id(),
    name: text("name").notNull(),
    type: venueType("type").notNull(),
    city: text("city").notNull(),
    address: text("address").notNull().default(""),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    sports: text("sports").array().notNull().default(sql`'{}'::text[]`),
    isFree: boolean("is_free").notNull().default(true),
    status: venueStatus("status").notNull().default("pending"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
  },
  (t) => [
    index("venues_city_status_idx").on(t.city, t.status),
    index("venues_lat_lng_idx").on(t.lat, t.lng),
    index("venues_sports_gin_idx").using("gin", t.sports),
  ],
);

export const activities = pgTable(
  "activities",
  {
    id: id(),
    communityId: uuid("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    /** Empty when the location is a free-form place. */
    venueId: uuid("venue_id").references(() => venues.id, { onDelete: "set null" }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    sport: text("sport").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    startsAt: tz("starts_at").notNull(),
    durationMinutes: integer("duration_minutes")
      .notNull()
      .default(DEFAULT_ACTIVITY_DURATION_MINUTES),
    city: text("city").notNull(),
    location: text("location").notNull(),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    capacity: integer("capacity").notNull(),
    level: activityLevel("level").notNull().default("amateur"),
    isPublic: boolean("is_public").notNull().default(true),
    isCanceled: boolean("is_canceled").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [
    index("activities_starts_at_idx").on(t.startsAt),
    index("activities_city_sport_starts_at_idx").on(t.city, t.sport, t.startsAt),
    index("activities_community_starts_at_idx").on(t.communityId, t.startsAt),
    index("activities_venue_idx").on(t.venueId),
    check("activities_capacity_positive", sql`${t.capacity} > 0`),
    check("activities_duration_positive", sql`${t.durationMinutes} > 0`),
  ],
);

export const activityJoins = pgTable(
  "activity_joins",
  {
    id: id(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    extraSlots: integer("extra_slots").notNull().default(0),
    joinedAt: createdAt("joined_at"),
  },
  (t) => [
    uniqueIndex("activity_joins_activity_user_uq").on(t.activityId, t.userId),
    index("activity_joins_user_idx").on(t.userId),
    check(
      "activity_joins_extra_slots_range",
      sql`${t.extraSlots} between 0 and ${sql.raw(String(MAX_EXTRA_SLOTS))}`,
    ),
  ],
);

export const activityChatMessages = pgTable(
  "activity_chat_messages",
  {
    id: id(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("activity_chat_messages_activity_created_idx").on(t.activityId, t.createdAt)],
);

/**
 * One row per pair of users. The pair is normalized (user_a_id < user_b_id) so that
 * A→B and B→A map to the same row; requested_by_user_id records who sent the request.
 */
export const friendships = pgTable(
  "friendships",
  {
    id: id(),
    userAId: uuid("user_a_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userBId: uuid("user_b_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requestedByUserId: uuid("requested_by_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatus("status").notNull().default("pending"),
    originActivityId: uuid("origin_activity_id").references(() => activities.id, {
      onDelete: "set null",
    }),
    requestedAt: createdAt("requested_at"),
    acceptedAt: tz("accepted_at"),
  },
  (t) => [
    uniqueIndex("friendships_pair_uq").on(t.userAId, t.userBId),
    index("friendships_user_b_idx").on(t.userBId),
    check("friendships_pair_ordered", sql`${t.userAId} < ${t.userBId}`),
    check(
      "friendships_requester_in_pair",
      sql`${t.requestedByUserId} in (${t.userAId}, ${t.userBId})`,
    ),
  ],
);

export const directMessages = pgTable(
  "direct_messages",
  {
    id: id(),
    friendshipId: uuid("friendship_id")
      .notNull()
      .references(() => friendships.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("direct_messages_friendship_created_idx").on(t.friendshipId, t.createdAt)],
);
