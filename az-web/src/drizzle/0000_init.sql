CREATE TYPE "public"."activity_level" AS ENUM('beginner', 'amateur', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."venue_status" AS ENUM('pending', 'verified');--> statement-breakpoint
CREATE TYPE "public"."venue_type" AS ENUM('school', 'municipal', 'private', 'park', 'other');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"venue_id" uuid,
	"created_by_user_id" uuid,
	"sport" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 120 NOT NULL,
	"city" text NOT NULL,
	"location" text NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"capacity" integer NOT NULL,
	"level" "activity_level" DEFAULT 'amateur' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"is_canceled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activities_capacity_positive" CHECK ("activities"."capacity" > 0),
	CONSTRAINT "activities_duration_positive" CHECK ("activities"."duration_minutes" > 0)
);
--> statement-breakpoint
CREATE TABLE "activity_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_joins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"activity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"extra_slots" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activity_joins_extra_slots_range" CHECK ("activity_joins"."extra_slots" between 0 and 3)
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sport" text NOT NULL,
	"city" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"code" text NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"used_by_user_id" uuid,
	CONSTRAINT "community_invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"is_organizer" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "direct_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"friendship_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_a_id" uuid NOT NULL,
	"user_b_id" uuid NOT NULL,
	"requested_by_user_id" uuid NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"origin_activity_id" uuid,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"accepted_at" timestamp with time zone,
	CONSTRAINT "friendships_pair_ordered" CHECK ("friendships"."user_a_id" < "friendships"."user_b_id"),
	CONSTRAINT "friendships_requester_in_pair" CHECK ("friendships"."requested_by_user_id" in ("friendships"."user_a_id", "friendships"."user_b_id"))
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"photo_url" text,
	"city" text,
	"preferred_sports" text[] DEFAULT '{}'::text[] NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "venue_type" NOT NULL,
	"city" text NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"sports" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_free" boolean DEFAULT true NOT NULL,
	"status" "venue_status" DEFAULT 'pending' NOT NULL,
	"created_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_chat_messages" ADD CONSTRAINT "activity_chat_messages_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_chat_messages" ADD CONSTRAINT "activity_chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_joins" ADD CONSTRAINT "activity_joins_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_joins" ADD CONSTRAINT "activity_joins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_invites" ADD CONSTRAINT "community_invites_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_invites" ADD CONSTRAINT "community_invites_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_invites" ADD CONSTRAINT "community_invites_used_by_user_id_users_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_friendship_id_friendships_id_fk" FOREIGN KEY ("friendship_id") REFERENCES "public"."friendships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_a_id_users_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_b_id_users_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_origin_activity_id_activities_id_fk" FOREIGN KEY ("origin_activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "venues" ADD CONSTRAINT "venues_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_starts_at_idx" ON "activities" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "activities_city_sport_starts_at_idx" ON "activities" USING btree ("city","sport","starts_at");--> statement-breakpoint
CREATE INDEX "activities_community_starts_at_idx" ON "activities" USING btree ("community_id","starts_at");--> statement-breakpoint
CREATE INDEX "activities_venue_idx" ON "activities" USING btree ("venue_id");--> statement-breakpoint
CREATE INDEX "activity_chat_messages_activity_created_idx" ON "activity_chat_messages" USING btree ("activity_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "activity_joins_activity_user_uq" ON "activity_joins" USING btree ("activity_id","user_id");--> statement-breakpoint
CREATE INDEX "activity_joins_user_idx" ON "activity_joins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "communities_city_sport_idx" ON "communities" USING btree ("city","sport");--> statement-breakpoint
CREATE INDEX "communities_created_at_idx" ON "communities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "community_invites_community_idx" ON "community_invites" USING btree ("community_id");--> statement-breakpoint
CREATE UNIQUE INDEX "community_members_community_user_uq" ON "community_members" USING btree ("community_id","user_id");--> statement-breakpoint
CREATE INDEX "community_members_user_idx" ON "community_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "direct_messages_friendship_created_idx" ON "direct_messages" USING btree ("friendship_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "friendships_pair_uq" ON "friendships" USING btree ("user_a_id","user_b_id");--> statement-breakpoint
CREATE INDEX "friendships_user_b_idx" ON "friendships" USING btree ("user_b_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_lower_uq" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "venues_city_status_idx" ON "venues" USING btree ("city","status");--> statement-breakpoint
CREATE INDEX "venues_lat_lng_idx" ON "venues" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX "venues_sports_gin_idx" ON "venues" USING gin ("sports");