CREATE TYPE "public"."goal_period" AS ENUM('day', 'week');--> statement-breakpoint
CREATE TYPE "public"."habit_status" AS ENUM('active', 'paused', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."schedule_type" AS ENUM('daily', 'weekly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."time_of_day" AS ENUM('morning', 'afternoon', 'evening');--> statement-breakpoint
CREATE TABLE "HabitLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"habitId" uuid NOT NULL,
	"logDate" date NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completedAt" timestamp with time zone,
	"value" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "habit_logs_user_habit_log_date_unique" UNIQUE("userId","habitId","logDate")
);
--> statement-breakpoint
CREATE TABLE "Habit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"scheduleType" "schedule_type" DEFAULT 'daily' NOT NULL,
	"scheduleDaysOfWeek" jsonb,
	"scheduleWeeklyDay" integer,
	"scheduleWeeklyFlexible" boolean DEFAULT false NOT NULL,
	"goalUnit" text DEFAULT 'times' NOT NULL,
	"goalPeriod" "goal_period" DEFAULT 'day' NOT NULL,
	"goalTarget" integer DEFAULT 1 NOT NULL,
	"timeOfDay" time_of_day DEFAULT 'morning' NOT NULL,
	"reminderEnabled" boolean DEFAULT false NOT NULL,
	"reminderTime" text,
	"status" "habit_status" DEFAULT 'active' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"startDate" timestamp with time zone,
	"endDate" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_Habit_id_fk" FOREIGN KEY ("habitId") REFERENCES "public"."Habit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "habit_logs_user_log_date_idx" ON "HabitLog" USING btree ("userId","logDate");