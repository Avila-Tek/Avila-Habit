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
ALTER TABLE "User" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_subscriptions_id_fk" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "planPrices" ADD CONSTRAINT "planPrices_planId_plans_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_plans_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planPriceId_planPrices_id_fk" FOREIGN KEY ("planPriceId") REFERENCES "public"."planPrices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_userId_idx" ON "payments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "payments_subscriptionId_idx" ON "payments" USING btree ("subscriptionId");--> statement-breakpoint
CREATE INDEX "payments_stripePaymentIntentId_idx" ON "payments" USING btree ("stripePaymentIntentId");--> statement-breakpoint
CREATE INDEX "planPrices_planId_isActive_idx" ON "planPrices" USING btree ("planId","isActive");--> statement-breakpoint
CREATE INDEX "plans_displayOrder_idx" ON "plans" USING btree ("displayOrder");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "subscriptions_stripeSubscriptionId_idx" ON "subscriptions" USING btree ("stripeSubscriptionId");--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "deletedAt";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "User" DROP COLUMN "updatedAt";