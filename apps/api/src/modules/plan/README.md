# Plan Module

Manages subscription plans and their pricing for the SaaS application.

## Changelog

### 2026-01-27: Free Plans and Subscription Endpoints

- Added `isFree` boolean to identify free plans (no Stripe integration needed)
- Added `displayOrder` integer for ordering plans in the catalog
- Added subscription endpoints (`/subscriptions/subscribe`, `/subscriptions/current`)
- Added seed script for initial plan data

---

## Plan Fields

| Field                    | Type            | Description                                    |
| ------------------------ | --------------- | ---------------------------------------------- |
| `id`                     | uuid            | Unique identifier                              |
| `key`                    | string          | Unique key (e.g., "FREE", "PRO", "PREMIUM")    |
| `name`                   | string          | Display name                                   |
| `description`            | string          | Plan description                               |
| `isActive`               | boolean         | Whether the plan is active                     |
| `isFree`                 | boolean         | **NEW** - Whether the plan is free (no Stripe) |
| `displayOrder`           | integer         | **NEW** - Order in catalog (ascending)         |
| `limitsHabitsMax`        | integer \| null | Max habits (null = unlimited)                  |
| `limitsReportsEnabled`   | boolean         | Whether reports are enabled                    |
| `limitsHistoryDays`      | integer \| null | History retention days (null = unlimited)      |
| `limitsRemindersEnabled` | boolean         | Whether reminders are enabled                  |
| `stripeProductId`        | string \| null  | Stripe product ID (null for free plans)        |

---

## User Flows

### 1. Unified Subscription Flow (Free and Paid Plans)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     UNIFIED SUBSCRIPTION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

User selects plan
       │
       ▼
POST /api/v1/subscriptions/subscribe
{ planId, planPriceId, successUrl?, cancelUrl? }
       │
       ▼
   ┌───────────────┐
   │ Is plan FREE? │
   └───────┬───────┘
           │
     ┌─────┴─────┐
     │           │
    YES          NO
     │           │
     ▼           ▼
┌─────────┐  ┌──────────────┐
│ Create  │  │ Ensure       │
│ local   │  │ billing      │
│ sub     │  │ identity     │
│ directly│  └──────┬───────┘
└────┬────┘         │
     │              ▼
     │       ┌──────────────┐
     │       │ Create Stripe│
     │       │ checkout     │
     │       │ session      │
     │       └──────┬───────┘
     │              │
     ▼              ▼
┌─────────┐  ┌──────────────┐
│ Return: │  │ Return:      │
│ type:   │  │ type:        │
│ 'free'  │  │ 'checkout'   │
│ subId   │  │ checkoutUrl  │
└─────────┘  └──────────────┘
                    │
                    ▼
              User redirected
              to Stripe
                    │
                    ▼
              Payment completed
                    │
                    ▼
              Webhook received
              POST /payment/webhooks/stripe
                    │
                    ▼
              Subscription created
              in database
```

### 2. API Endpoints

#### Public Endpoints

| Method | Endpoint        | Description                                                |
| ------ | --------------- | ---------------------------------------------------------- |
| GET    | `/api/v1/plans` | Get all active plans with prices (ordered by displayOrder) |

#### Authenticated Endpoints

| Method | Endpoint                          | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| POST   | `/api/v1/subscriptions/subscribe` | Subscribe to a plan           |
| GET    | `/api/v1/subscriptions/current`   | Get current user subscription |

#### Admin Endpoints

| Method | Endpoint                                  | Description           |
| ------ | ----------------------------------------- | --------------------- |
| POST   | `/api/v1/admin/plans`                     | Create a new plan     |
| PUT    | `/api/v1/admin/plans/:planId`             | Update a plan         |
| DELETE | `/api/v1/admin/plans/:planId`             | Soft delete a plan    |
| POST   | `/api/v1/admin/plans/:planId/prices`      | Add a price to a plan |
| PUT    | `/api/v1/admin/plans/prices/:planPriceId` | Update a price        |
| DELETE | `/api/v1/admin/plans/prices/:planPriceId` | Soft delete a price   |

---

## Request/Response Examples

### Get Plans Catalog

```http
GET /api/v1/plans
```

**Response:**

```json
{
  "plans": [
    {
      "id": "uuid-1",
      "key": "FREE",
      "name": "Free",
      "description": "Perfect for getting started",
      "isActive": true,
      "isFree": true,
      "displayOrder": 1,
      "limits": {
        "habitsMax": 3,
        "reportsEnabled": false,
        "historyDays": 7,
        "remindersEnabled": false
      },
      "prices": [
        {
          "id": "price-uuid-1",
          "currency": "usd",
          "interval": "forever",
          "amountCents": 0,
          "trialDays": 0,
          "isActive": true
        }
      ]
    },
    {
      "id": "uuid-2",
      "key": "PRO",
      "name": "Pro",
      "description": "For serious habit builders",
      "isActive": true,
      "isFree": false,
      "displayOrder": 2,
      "limits": {
        "habitsMax": 20,
        "reportsEnabled": true,
        "historyDays": 90,
        "remindersEnabled": true
      },
      "prices": [
        {
          "id": "price-uuid-2",
          "currency": "usd",
          "interval": "month",
          "amountCents": 999,
          "trialDays": 7,
          "isActive": true
        },
        {
          "id": "price-uuid-3",
          "currency": "usd",
          "interval": "year",
          "amountCents": 9900,
          "trialDays": 7,
          "isActive": true
        }
      ]
    }
  ]
}
```

### Subscribe to a Plan

```http
POST /api/v1/subscriptions/subscribe
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request (Free Plan):**

```json
{
  "planId": "uuid-1",
  "planPriceId": "price-uuid-1"
}
```

**Response (Free Plan - 201 Created):**

```json
{
  "type": "free_subscription_created",
  "subscriptionId": "sub-uuid-1"
}
```

**Request (Paid Plan):**

```json
{
  "planId": "uuid-2",
  "planPriceId": "price-uuid-2",
  "successUrl": "https://app.example.com/subscription/success",
  "cancelUrl": "https://app.example.com/pricing"
}
```

**Response (Paid Plan - 200 OK):**

```json
{
  "type": "checkout_redirect",
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_xxx",
  "checkoutSessionId": "cs_xxx"
}
```

### Get Current Subscription

```http
GET /api/v1/subscriptions/current
Authorization: Bearer {accessToken}
```

**Response:**

```json
{
  "id": "sub-uuid-1",
  "userId": "user-uuid",
  "status": "active",
  "isFree": true,
  "currentPeriodStart": "2026-01-27T00:00:00.000Z",
  "currentPeriodEnd": null,
  "cancelAtPeriodEnd": false,
  "canceledAt": null,
  "plan": {
    "id": "uuid-1",
    "key": "FREE",
    "name": "Free",
    "description": "Perfect for getting started",
    "isFree": true,
    "limits": {
      "habitsMax": 3,
      "reportsEnabled": false,
      "historyDays": 7,
      "remindersEnabled": false
    }
  },
  "price": {
    "id": "price-uuid-1",
    "currency": "usd",
    "interval": "forever",
    "amountCents": 0
  },
  "createdAt": "2026-01-27T00:00:00.000Z",
  "updatedAt": "2026-01-27T00:00:00.000Z"
}
```

### Create Plan (Admin)

```http
POST /api/v1/admin/plans
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request (Free Plan):**

```json
{
  "key": "FREE",
  "name": "Free",
  "description": "Perfect for getting started",
  "isActive": true,
  "isFree": true,
  "displayOrder": 1,
  "limitsHabitsMax": 3,
  "limitsReportsEnabled": false,
  "limitsHistoryDays": 7,
  "limitsRemindersEnabled": false
}
```

**Request (Paid Plan):**

```json
{
  "key": "PRO",
  "name": "Pro",
  "description": "For serious habit builders",
  "isActive": true,
  "isFree": false,
  "displayOrder": 2,
  "limitsHabitsMax": 20,
  "limitsReportsEnabled": true,
  "limitsHistoryDays": 90,
  "limitsRemindersEnabled": true
}
```

> **Note:** For paid plans (`isFree: false`), a Stripe product is automatically created. For free plans, no Stripe product is created.

---

## Seed Data

The module includes seed data for initial setup:

```bash
# Run from apps/api directory
npm run db:seed:plans
```

This creates:

- **FREE** plan ($0, forever) - displayOrder: 1
- **PRO** plan ($9.99/month, $99/year) - displayOrder: 2
- **PREMIUM** plan ($19.99/month, $199/year) - displayOrder: 3

For paid plans, the script creates corresponding Stripe products and prices.

---

## Architecture

```
plan/
├── domain/
│   └── entities/
│       ├── PlanEntity.ts         # Includes isFree, displayOrder
│       └── PlanPriceEntity.ts
├── application/
│   ├── ports/
│   │   ├── PlanRepository.ts
│   │   └── PlanPriceRepository.ts
│   └── useCases/
│       ├── CreatePlanUseCase.ts       # Skips Stripe for free plans
│       ├── UpdatePlanUseCase.ts
│       ├── DeletePlanUseCase.ts
│       ├── ListPlansCatalogUseCase.ts # Orders by displayOrder
│       ├── CreatePlanPriceUseCase.ts  # Skips Stripe for free plans
│       ├── UpdatePlanPriceUseCase.ts
│       └── DeletePlanPriceUseCase.ts
├── infrastructure/
│   ├── persistence/
│   │   ├── PlanPostgresRepository.ts
│   │   └── PlanPricePostgresRepository.ts
│   └── http/
│       ├── PlanController.ts
│       └── routes.ts
└── index.ts
```

## Dependencies

- `payment-module` - For Stripe product/price creation (paid plans only)
- `database` - For PostgreSQL connection

## Dependents

- `habit-module` - Uses `getUserSubscription` use case to validate habit limits per plan
