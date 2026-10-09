/**
 * Development seed: `npm run db:seed` (refuses to touch a non-empty DB)
 * or `npm run db:seed -- --reset` (truncates all tables first).
 */
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Env vars may come from the environment instead.
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Friendships store each pair once, ordered so that user_a_id < user_b_id. */
function friendPair(x: string, y: string) {
  return x < y ? { userAId: x, userBId: y } : { userAId: y, userBId: x };
}

/** Rounds to the full hour so seeded start times look realistic. */
function inHours(hours: number) {
  const d = new Date(Date.now() + hours * HOUR);
  d.setMinutes(0, 0, 0);
  return d;
}

async function main() {
  const { db, schema: s } = await import("./index");
  const { sql } = await import("drizzle-orm");
  const reset = process.argv.includes("--reset");

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(s.users);
  if (count > 0 && !reset) {
    console.error(`Database already has ${count} users. Re-run with --reset to wipe and reseed.`);
    process.exit(1);
  }
  if (reset) {
    await db.execute(sql`truncate table
      direct_messages, friendships, activity_chat_messages, activity_joins, activities,
      venues, community_invites, community_members, communities, users restart identity cascade`);
    console.log("Truncated all tables.");
  }

  const passwordHash = await bcrypt.hash("demo123", 10);
  const users = await db
    .insert(s.users)
    .values([
      { email: "demo@aktivnizaedno.bg", name: "Демо Потребител", city: "София", preferredSports: ["football", "running"] },
      { email: "admin@aktivnizaedno.bg", name: "Администратор", city: "София", role: "admin" as const },
      { email: "maria@example.com", name: "Мария Иванова", city: "София", preferredSports: ["tennis", "yoga"] },
      { email: "georgi@example.com", name: "Георги Петров", city: "Пловдив", preferredSports: ["basketball"] },
      { email: "elena@example.com", name: "Елена Димитрова", city: "Варна", preferredSports: ["running", "swimming"] },
      { email: "ivan@example.com", name: "Иван Стоянов", city: "София", preferredSports: ["football"] },
    ].map((u) => ({ ...u, passwordHash })))
    .returning();
  const [demo, admin, maria, georgi, elena, ivan] = users;

  const communities = await db
    .insert(s.communities)
    .values([
      { title: "Футбол в Люлин", description: "Събираме се за мачове 5 на 5 всяка седмица.", sport: "football", city: "София", isPublic: true, createdByUserId: demo.id },
      { title: "Тичане по Морската градина", description: "Сутрешни бягания за всички нива.", sport: "running", city: "Варна", isPublic: true, createdByUserId: elena.id },
      { title: "Баскетбол Пловдив", description: "Стрийтбол на училищни игрища.", sport: "basketball", city: "Пловдив", isPublic: true, createdByUserId: georgi.id },
      { title: "Тенис клуб Изток", description: "Затворена група за редовни партньори.", sport: "tennis", city: "София", isPublic: false, createdByUserId: maria.id },
    ])
    .returning();
  const [football, running, basketball, tennis] = communities;

  await db.insert(s.communityMembers).values([
    { communityId: football.id, userId: demo.id, isOrganizer: true },
    { communityId: football.id, userId: ivan.id },
    { communityId: football.id, userId: maria.id },
    { communityId: running.id, userId: elena.id, isOrganizer: true },
    { communityId: running.id, userId: demo.id },
    { communityId: basketball.id, userId: georgi.id, isOrganizer: true },
    { communityId: tennis.id, userId: maria.id, isOrganizer: true },
    { communityId: tennis.id, userId: demo.id },
  ]);

  await db.insert(s.communityInvites).values({
    communityId: tennis.id,
    code: randomBytes(9).toString("base64url"),
    createdByUserId: maria.id,
    expiresAt: new Date(Date.now() + 7 * DAY),
  });

  const venues = await db
    .insert(s.venues)
    .values([
      { name: "Игрище на 40 СУ", type: "school" as const, city: "София", address: "ж.к. Люлин 4", lat: 42.7186, lng: 23.2531, sports: ["football", "basketball"], isFree: true, status: "verified" as const },
      { name: "Южен парк", type: "park" as const, city: "София", address: "бул. Витоша / бул. България", lat: 42.6705, lng: 23.3113, sports: ["running", "walking", "fitness"], isFree: true, status: "verified" as const },
      { name: "Тенис кортове Изток", type: "private" as const, city: "София", address: "ул. Николай Хайтов", lat: 42.6735, lng: 23.3555, sports: ["tennis"], isFree: false, status: "verified" as const },
      { name: "Морската градина", type: "park" as const, city: "Варна", address: "бул. Приморски", lat: 43.2047, lng: 27.9264, sports: ["running", "walking", "cycling"], isFree: true, status: "verified" as const },
      { name: "Гребна база Пловдив", type: "municipal" as const, city: "Пловдив", address: "бул. Васил Априлов", lat: 42.1574, lng: 24.7173, sports: ["running", "cycling", "basketball"], isFree: true, status: "verified" as const },
      { name: "Игрище до блок 25", type: "other" as const, city: "Пловдив", address: "ж.к. Тракия", lat: 42.1378, lng: 24.7937, sports: ["basketball"], isFree: true, status: "pending" as const },
    ].map((v) => ({ ...v, createdByUserId: admin.id })))
    .returning();
  const [school40, southPark, tennisCourts, seaGarden, rowingCanal] = venues;

  const at = (v: (typeof venues)[number]) => ({ venueId: v.id, location: v.name, city: v.city, lat: v.lat, lng: v.lng });

  const activities = await db
    .insert(s.activities)
    .values([
      { communityId: football.id, createdByUserId: demo.id, sport: "football", title: "Мач 5 на 5", startsAt: inHours(26), capacity: 10, level: "amateur" as const, ...at(school40) },
      { communityId: football.id, createdByUserId: demo.id, sport: "football", title: "Тренировка за начинаещи", startsAt: inHours(72), capacity: 14, level: "beginner" as const, ...at(school40) },
      { communityId: football.id, createdByUserId: demo.id, sport: "football", title: "Вечерен мач (отменен)", startsAt: inHours(48), capacity: 10, isCanceled: true, ...at(school40) },
      // Ongoing right now (started within the last 2 hours, default duration 120 min).
      { communityId: running.id, createdByUserId: elena.id, sport: "running", title: "Сутрешно бягане 5 км", startsAt: inHours(-1), capacity: 30, level: "beginner" as const, ...at(seaGarden) },
      { communityId: running.id, createdByUserId: elena.id, sport: "running", title: "Интервали по брега", startsAt: inHours(-72), durationMinutes: 90, capacity: 20, level: "advanced" as const, ...at(seaGarden) },
      { communityId: basketball.id, createdByUserId: georgi.id, sport: "basketball", title: "Стрийтбол 3 на 3", startsAt: inHours(30), capacity: 12, ...at(rowingCanal) },
      { communityId: tennis.id, createdByUserId: maria.id, sport: "tennis", title: "Двойки на корт 2", startsAt: inHours(50), capacity: 4, isPublic: false, ...at(tennisCourts) },
      { communityId: running.id, createdByUserId: demo.id, sport: "walking", title: "Разходка в Южен парк", startsAt: inHours(96), capacity: 25, level: "beginner" as const, ...at(southPark) },
      // Free-form place, no venue.
      { communityId: football.id, createdByUserId: ivan.id, sport: "football", title: "Футбол на поляната", startsAt: inHours(120), capacity: 12, city: "София", location: "Поляната зад бл. 412, Люлин", lat: 42.7151, lng: 23.2484 },
    ])
    .returning();
  const [match, , , morningRun, intervals, streetball, doubles] = activities;

  await db.insert(s.activityJoins).values([
    { activityId: match.id, userId: demo.id },
    { activityId: match.id, userId: ivan.id, extraSlots: 2 },
    { activityId: match.id, userId: maria.id },
    { activityId: morningRun.id, userId: elena.id },
    { activityId: morningRun.id, userId: demo.id, extraSlots: 1 },
    { activityId: intervals.id, userId: elena.id },
    { activityId: streetball.id, userId: georgi.id, extraSlots: 3 },
    { activityId: doubles.id, userId: maria.id },
    { activityId: doubles.id, userId: demo.id },
  ]);

  await db.insert(s.activityChatMessages).values([
    { activityId: match.id, senderId: demo.id, text: "Здравейте! Носете тъмни и светли тениски." },
    { activityId: match.id, senderId: ivan.id, text: "Идвам с двама приятели." },
    { activityId: morningRun.id, senderId: elena.id, text: "Сбор при фонтана в 9:00." },
  ]);

  const [demoIvan] = await db
    .insert(s.friendships)
    .values([
      { ...friendPair(demo.id, ivan.id), requestedByUserId: ivan.id, status: "accepted" as const, originActivityId: match.id, acceptedAt: new Date() },
      { ...friendPair(demo.id, elena.id), requestedByUserId: elena.id, status: "pending" as const, originActivityId: morningRun.id },
    ])
    .returning();

  await db.insert(s.directMessages).values([
    { friendshipId: demoIvan.id, senderId: ivan.id, text: "Здрасти! Ще играеш ли и в неделя?" },
    { friendshipId: demoIvan.id, senderId: demo.id, text: "Да, ще съм там." },
  ]);

  console.log(
    `Seeded ${users.length} users, ${communities.length} communities, ${venues.length} venues, ${activities.length} activities.`,
  );
  console.log("Demo login: demo@aktivnizaedno.bg / demo123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
