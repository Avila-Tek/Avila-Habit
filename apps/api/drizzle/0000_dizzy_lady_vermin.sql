CREATE TYPE "public"."goal_period" AS ENUM('day', 'week');--> statement-breakpoint
CREATE TYPE "public"."habit_status" AS ENUM('active', 'paused', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."schedule_type" AS ENUM('daily', 'weekly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."time_of_day" AS ENUM('morning', 'afternoon', 'evening');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('Active', 'Disabled');--> statement-breakpoint
CREATE TABLE "Account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "Session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "Verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"subscriptionId" uuid,
	"amountCents" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"stripePaymentIntentId" varchar(255),
	"stripeInvoiceId" varchar(255),
	"stripeCustomerId" varchar(255),
	"paidAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "planPrices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"planId" uuid NOT NULL,
	"currency" varchar(10) DEFAULT 'usd' NOT NULL,
	"interval" varchar(20) NOT NULL,
	"amountCents" integer NOT NULL,
	"trialDays" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"stripePriceId" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"isFree" boolean DEFAULT false NOT NULL,
	"displayOrder" integer DEFAULT 0 NOT NULL,
	"limitsHabitsMax" integer,
	"limitsReportsEnabled" boolean DEFAULT true NOT NULL,
	"limitsHistoryDays" integer,
	"limitsRemindersEnabled" boolean DEFAULT true NOT NULL,
	"stripeProductId" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "Post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"published" boolean DEFAULT false NOT NULL,
	"authorId" uuid NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"deletedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"planId" uuid NOT NULL,
	"planPriceId" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"stripeSubscriptionId" varchar(255),
	"stripeCustomerId" varchar(255),
	"currentPeriodStart" timestamp with time zone,
	"currentPeriodEnd" timestamp with time zone,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"canceledAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"name" text,
	"first_name" text,
	"last_name" text,
	"image" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"timezone" text DEFAULT 'America/New_York' NOT NULL,
	"status" "user_status" DEFAULT 'Active' NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "User_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_subscriptions_id_fk" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planPrices" ADD CONSTRAINT "planPrices_planId_plans_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_User_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_plans_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planPriceId_planPrices_id_fk" FOREIGN KEY ("planPriceId") REFERENCES "public"."planPrices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_userId_idx" ON "payments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "payments_subscriptionId_idx" ON "payments" USING btree ("subscriptionId");--> statement-breakpoint
CREATE INDEX "payments_stripePaymentIntentId_idx" ON "payments" USING btree ("stripePaymentIntentId");--> statement-breakpoint
CREATE INDEX "planPrices_planId_isActive_idx" ON "planPrices" USING btree ("planId","isActive");--> statement-breakpoint
CREATE INDEX "plans_displayOrder_idx" ON "plans" USING btree ("displayOrder");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions" USING btree ("stripeSubscriptionId");