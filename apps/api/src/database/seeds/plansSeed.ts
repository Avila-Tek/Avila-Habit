export interface PlanSeedPrice {
  currency: string;
  interval: string;
  amountCents: number;
  trialDays: number;
}

export interface PlanSeedData {
  key: string;
  name: string;
  description: string;
  isFree: boolean;
  displayOrder: number;
  limitsHabitsMax: number | null;
  limitsReportsEnabled: boolean;
  limitsHistoryDays: number | null;
  limitsRemindersEnabled: boolean;
  prices: PlanSeedPrice[];
}

export const plansSeed: PlanSeedData[] = [
  {
    key: 'FREE',
    name: 'Free',
    description:
      'Perfect for getting started. Basic features to build your first habits.',
    isFree: true,
    displayOrder: 1,
    limitsHabitsMax: 3,
    limitsReportsEnabled: false,
    limitsHistoryDays: 7,
    limitsRemindersEnabled: false,
    prices: [
      {
        currency: 'usd',
        interval: 'forever',
        amountCents: 0,
        trialDays: 0,
      },
    ],
  },
  {
    key: 'PRO',
    name: 'Pro',
    description:
      'For serious habit builders. More habits, longer history, and reminders.',
    isFree: false,
    displayOrder: 2,
    limitsHabitsMax: 20,
    limitsReportsEnabled: true,
    limitsHistoryDays: 90,
    limitsRemindersEnabled: true,
    prices: [
      {
        currency: 'usd',
        interval: 'month',
        amountCents: 999, // $9.99/month
        trialDays: 7,
      },
      {
        currency: 'usd',
        interval: 'year',
        amountCents: 9900, // $99/year (2 months free)
        trialDays: 7,
      },
    ],
  },
  {
    key: 'PREMIUM',
    name: 'Premium',
    description:
      'Unlimited habits and advanced analytics. For power users who want it all.',
    isFree: false,
    displayOrder: 3,
    limitsHabitsMax: null, // Unlimited
    limitsReportsEnabled: true,
    limitsHistoryDays: null, // Unlimited
    limitsRemindersEnabled: true,
    prices: [
      {
        currency: 'usd',
        interval: 'month',
        amountCents: 1999, // $19.99/month
        trialDays: 7,
      },
      {
        currency: 'usd',
        interval: 'year',
        amountCents: 19900, // $199/year
        trialDays: 7,
      },
    ],
  },
];
