/**
 * Script to seed the plans and plan prices tables.
 *
 * Usage: npx tsx src/database/seeds/runPlansSeed.ts
 *
 * For free plans, this script inserts directly into the database.
 * For paid plans, this script creates Stripe products and prices, then inserts into the database.
 *
 * Make sure to have the following environment variables set:
 * - DATABASE (required)
 * - STRIPE_SECRET_KEY (required for paid plans)
 */

import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import Stripe from 'stripe';
import * as schema from '../index';
import { type PlanSeedData, type PlanSeedPrice, plansSeed } from './plansSeed';

async function main() {
  console.log('Starting plans seed...\n');

  const databaseUrl = process.env.DATABASE;
  if (!databaseUrl) {
    throw new Error('DATABASE environment variable is required');
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set. Paid plans will be skipped.\n');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

  for (const planData of plansSeed) {
    console.log(`Processing plan: ${planData.key}...`);

    // Check if plan already exists
    const existingPlan = await db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.key, planData.key))
      .limit(1);

    if (existingPlan.length > 0) {
      console.log(`  ⏭️  Plan "${planData.key}" already exists. Skipping.\n`);
      continue;
    }

    let stripeProductId: string | null = null;

    // For paid plans, create Stripe product
    if (!planData.isFree) {
      if (!stripe) {
        console.log(
          `  ⏭️  Skipping paid plan "${planData.key}" (no Stripe key).\n`
        );
        continue;
      }

      console.log(`  Creating Stripe product...`);
      const stripeProduct = await stripe.products.create({
        name: planData.name,
        description: planData.description,
        metadata: { planKey: planData.key },
      });
      stripeProductId = stripeProduct.id;
      console.log(`  ✅ Stripe product created: ${stripeProductId}`);
    }

    // Insert plan into database
    const [insertedPlan] = await db
      .insert(schema.plans)
      .values({
        key: planData.key,
        name: planData.name,
        description: planData.description,
        isActive: true,
        isFree: planData.isFree,
        displayOrder: planData.displayOrder,
        limitsHabitsMax: planData.limitsHabitsMax,
        limitsReportsEnabled: planData.limitsReportsEnabled,
        limitsHistoryDays: planData.limitsHistoryDays,
        limitsRemindersEnabled: planData.limitsRemindersEnabled,
        stripeProductId,
      })
      .returning();

    console.log(`  ✅ Plan created in database: ${insertedPlan!.id}`);

    // Create prices
    for (const priceData of planData.prices) {
      await createPrice(db, stripe, insertedPlan!.id, planData, priceData);
    }

    console.log('');
  }

  console.log('✅ Plans seed completed successfully!\n');
  await pool.end();
}

async function createPrice(
  db: ReturnType<typeof drizzle>,
  stripe: Stripe | null,
  planId: string,
  planData: PlanSeedData,
  priceData: PlanSeedPrice
) {
  let stripePriceId: string | null = null;

  // For paid plans, create Stripe price
  if (!planData.isFree && stripe) {
    const existingPlan = await db
      .select()
      .from(schema.plans)
      .where(eq(schema.plans.id, planId))
      .limit(1);

    const stripeProductId = existingPlan[0]?.stripeProductId;
    if (!stripeProductId) {
      throw new Error(`Plan ${planId} does not have a Stripe product ID`);
    }

    console.log(
      `  Creating Stripe price (${priceData.interval}, $${priceData.amountCents / 100})...`
    );

    const recurring =
      priceData.interval === 'forever'
        ? undefined
        : {
            interval: priceData.interval as 'month' | 'year',
          };

    const stripePrice = await stripe.prices.create({
      product: stripeProductId,
      currency: priceData.currency,
      unit_amount: priceData.amountCents,
      recurring,
      metadata: { planId },
    });
    stripePriceId = stripePrice.id;
    console.log(`  ✅ Stripe price created: ${stripePriceId}`);
  }

  // Insert price into database
  await db.insert(schema.planPrices).values({
    planId,
    currency: priceData.currency,
    interval: priceData.interval,
    amountCents: priceData.amountCents,
    trialDays: priceData.trialDays,
    isActive: true,
    stripePriceId,
  });

  console.log(
    `  ✅ Price created in database (${priceData.interval}, $${priceData.amountCents / 100})`
  );
}

main().catch((error) => {
  console.error('Error running seed:', error);
  process.exit(1);
});
