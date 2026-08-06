CREATE TABLE IF NOT EXISTS "admin_access_identifiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" varchar(50) NOT NULL,
	"description" varchar(50) NOT NULL,
	"type" varchar(25) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__admin_access_identifiers__identifier__type" UNIQUE("identifier","type"),
	CONSTRAINT "uq__admin_access_identifiers__id__type" UNIQUE("id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_permissions_config_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(25) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__admin_permissions_config_groups__title__type" UNIQUE("title","type"),
	CONSTRAINT "uq__admin_permissions_config_groups__id__type" UNIQUE("id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_permitted_access_identifiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"permission_config_group_id" integer NOT NULL,
	"access_identifier_id" integer NOT NULL,
	"type" varchar(25) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__admin_permitted_access_identifiers__permission_config_group_id__access_identifier_id" UNIQUE("permission_config_group_id","access_identifier_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"logo_url" text,
	"webhook_url" text,
	"has_live_attendance_trigger" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__organizations__name" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "org_daily_secrets" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"secret" varchar(255) NOT NULL,
	"generated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"org_id" integer NOT NULL,
	"email" varchar(255),
	"phone" varchar(20),
	"whatsapp" varchar(20),
	"role" varchar(25) NOT NULL,
	"password" varchar(50),
	"password_generated_at" timestamp with time zone NOT NULL,
	"otp" varchar(10),
	"otp_generated_at" timestamp with time zone,
	"login_count" integer DEFAULT 0 NOT NULL,
	"last_login_at" timestamp with time zone,
	"allow_password_login" boolean DEFAULT false NOT NULL,
	"alias" text,
	"created_by_user_id" integer,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__users__identifier__org_id" UNIQUE("identifier","org_id"),
	CONSTRAINT "uq__users__email" UNIQUE("email"),
	CONSTRAINT "uq__users__phone" UNIQUE("phone"),
	CONSTRAINT "uq__users__whatsapp" UNIQUE("whatsapp")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"admin_permissions_config_group_id" integer NOT NULL,
	"resource_id" integer,
	"resource_type" varchar(25) NOT NULL,
	"assigned_by_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__user_permissions__user_id__admin_permissions_config_group_id__resource_id" UNIQUE NULLS NOT DISTINCT("user_id","admin_permissions_config_group_id","resource_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"alias" text,
	"org_id" integer NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__batches__title__org_id" UNIQUE NULLS NOT DISTINCT("title","org_id"),
	CONSTRAINT "uq__batches__alias__org_id" UNIQUE NULLS NOT DISTINCT("org_id","alias")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch_students" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"assigned_by_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__batch_students__batch_id__user_id" UNIQUE NULLS NOT DISTINCT("batch_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"alias" text,
	"org_id" integer NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"type" varchar(25) NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__courses__title__org_id" UNIQUE NULLS NOT DISTINCT("title","org_id"),
	CONSTRAINT "uq__courses__alias__org_id" UNIQUE NULLS NOT DISTINCT("org_id","alias")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_batch" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"assigned_by_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__course_batch__course_id__batch_id" UNIQUE NULLS NOT DISTINCT("course_id","batch_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"alias" text,
	"course_id" integer NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__course_sessions__title__course_id" UNIQUE NULLS NOT DISTINCT("title","course_id"),
	CONSTRAINT "uq__course_sessions__course_id__alias" UNIQUE NULLS NOT DISTINCT("course_id","alias")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "course_tag_map" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"course_tag_id" integer NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__course_tag_map__course_id__course_tag_id" UNIQUE NULLS NOT DISTINCT("course_id","course_tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(50) NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "batch_tag_map" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer NOT NULL,
	"batch_tag_id" integer NOT NULL,
	"created_by_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__batch_tag_map__batch_id__batch_tag_id" UNIQUE NULLS NOT DISTINCT("batch_id","batch_tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendance_session_invocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_session_id" integer NOT NULL,
	"invoked_by_user_id" integer NOT NULL,
	"invocation_start_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendances" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_session_id" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"remark" varchar(50) NOT NULL,
	"device_config" jsonb,
	"ip_address" varchar(50),
	"location_info" jsonb,
	"location_lat" double precision,
	"location_long" double precision,
	"location_point" "geography(Point, 4326)",
	"scanned_at" timestamp with time zone,
	"remarked_by_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq__attendances__user_id__course_session_id" UNIQUE NULLS NOT DISTINCT("user_id","course_session_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attendance_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_session_id" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"remark" varchar(50) NOT NULL,
	"device_config" jsonb,
	"ip_address" varchar(50),
	"location_info" jsonb,
	"location_lat" double precision,
	"location_long" double precision,
	"location_point" "geography(Point, 4326)",
	"scanned_at" timestamp with time zone,
	"remarked_by_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "webhook_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"attendance_history_id" integer NOT NULL,
	"status" varchar(50) NOT NULL,
	"processed_at" timestamp with time zone,
	"last_attempted_at" timestamp with time zone,
	"processing_started_at" timestamp with time zone,
	"is_processing" boolean DEFAULT false NOT NULL,
	"retries" integer DEFAULT 0,
	"webhook_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_permitted_access_identifiers" ADD CONSTRAINT "fk__admin_permitted_access_identifiers__permission_config_group_id__type" FOREIGN KEY ("permission_config_group_id","type") REFERENCES "public"."admin_permissions_config_groups"("id","type") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_permitted_access_identifiers" ADD CONSTRAINT "fk__admin_permitted_access_identifiers__access_identifier_id__type" FOREIGN KEY ("access_identifier_id","type") REFERENCES "public"."admin_access_identifiers"("id","type") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_daily_secrets" ADD CONSTRAINT "org_daily_secrets_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "fk__user_permissions__admin_permissions_config_group_id__resource_type" FOREIGN KEY ("admin_permissions_config_group_id","resource_type") REFERENCES "public"."admin_permissions_config_groups"("id","type") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batches" ADD CONSTRAINT "batches_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batches" ADD CONSTRAINT "batches_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_students" ADD CONSTRAINT "batch_students_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_students" ADD CONSTRAINT "batch_students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_students" ADD CONSTRAINT "batch_students_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_batch" ADD CONSTRAINT "course_batch_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_batch" ADD CONSTRAINT "course_batch_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_batch" ADD CONSTRAINT "course_batch_assigned_by_user_id_users_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_sessions" ADD CONSTRAINT "course_sessions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_tags" ADD CONSTRAINT "course_tags_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_tag_map" ADD CONSTRAINT "course_tag_map_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_tag_map" ADD CONSTRAINT "course_tag_map_course_tag_id_course_tags_id_fk" FOREIGN KEY ("course_tag_id") REFERENCES "public"."course_tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "course_tag_map" ADD CONSTRAINT "course_tag_map_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_tags" ADD CONSTRAINT "batch_tags_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_tag_map" ADD CONSTRAINT "batch_tag_map_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_tag_map" ADD CONSTRAINT "batch_tag_map_batch_tag_id_batch_tags_id_fk" FOREIGN KEY ("batch_tag_id") REFERENCES "public"."batch_tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "batch_tag_map" ADD CONSTRAINT "batch_tag_map_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance_session_invocations" ADD CONSTRAINT "attendance_session_invocations_course_session_id_course_sessions_id_fk" FOREIGN KEY ("course_session_id") REFERENCES "public"."course_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance_session_invocations" ADD CONSTRAINT "attendance_session_invocations_invoked_by_user_id_users_id_fk" FOREIGN KEY ("invoked_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendances" ADD CONSTRAINT "attendances_course_session_id_course_sessions_id_fk" FOREIGN KEY ("course_session_id") REFERENCES "public"."course_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendances" ADD CONSTRAINT "attendances_remarked_by_user_id_users_id_fk" FOREIGN KEY ("remarked_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance_history" ADD CONSTRAINT "attendance_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance_history" ADD CONSTRAINT "attendance_history_course_session_id_course_sessions_id_fk" FOREIGN KEY ("course_session_id") REFERENCES "public"."course_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attendance_history" ADD CONSTRAINT "attendance_history_remarked_by_user_id_users_id_fk" FOREIGN KEY ("remarked_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "webhook_history" ADD CONSTRAINT "webhook_history_attendance_history_id_attendance_history_id_fk" FOREIGN KEY ("attendance_history_id") REFERENCES "public"."attendance_history"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__admin_access_identifiers__type" ON "admin_access_identifiers" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__admin_permissions_config_groups__type" ON "admin_permissions_config_groups" USING btree ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__org_daily_secrets__org_id__generated_at" ON "org_daily_secrets" USING btree ("org_id","generated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__users__role__is_deleted" ON "users" USING btree ("role","is_deleted");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__users__role__org_id__is_deleted" ON "users" USING btree ("role","org_id","is_deleted");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__users__password_generated_at" ON "users" USING btree ("password_generated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__users__created_by_user_id" ON "users" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__user_permissions__resource_type__resource_id" ON "user_permissions" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__user_permissions__admin_permissions_config_group_id" ON "user_permissions" USING btree ("admin_permissions_config_group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__batches__org_id__is_deleted" ON "batches" USING btree ("org_id","is_deleted");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__batch_students__user_id" ON "batch_students" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__course_batch__batch_id" ON "course_batch" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__course_tag_map__course_tag_id" ON "course_tag_map" USING btree ("course_tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__batch_tag_map__batch_tag_id" ON "batch_tag_map" USING btree ("batch_tag_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__attendance_session_invocations__course_session_id" ON "attendance_session_invocations" USING btree ("course_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__attendances__course_session_id" ON "attendances" USING btree ("course_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__attendance_history__course_session_id" ON "attendance_history" USING btree ("course_session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__attendance_history__user_id" ON "attendance_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__webhook_history__status" ON "webhook_history" USING btree ("status") WHERE "webhook_history"."status" != 'completed';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__webhook_history__updated_at" ON "webhook_history" USING btree ("updated_at") WHERE "webhook_history"."status" != 'completed';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__webhook_history__processing_started_at" ON "webhook_history" USING brin ("processing_started_at") WHERE "webhook_history"."status" != 'completed';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx__webhook_history__retries" ON "webhook_history" USING btree ("retries") WHERE "webhook_history"."status" != 'completed';