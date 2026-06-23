# Billing Module

Provider-agnostic billing module implementing hexagonal architecture for payment processing.

## Changelog

### 2026-01-28: Webhook Processing Fix

Fixed webhook handling to properly create subscriptions and payments in the database:

- `BillingController.handleWebhook()` now uses `HandleWebhookEventUseCase` from payment module
- Webhooks create subscriptions when `checkout.session.completed` or `customer.subscription.created` events are received
- The subscription query now returns the most recent active subscription (ordered by `createdAt DESC`)

### 2026-01-27: Unified Subscription Endpoints

The subscription flow has been unified via the Plan module. See the [Plan Module README](../plan/README.md) for the new subscription endpoints:

- `POST /api/v1/subscriptions/subscribe` - Subscribe to a plan (handles both free and paid)
- `GET /api/v1/subscriptions/current` - Get current user subscription

The existing billing endpoints remain available for direct Stripe operations.

---

## Complete Subscription Flow (Tested & Working)

### Prerequisites

1. Plans and prices seeded in database with Stripe IDs (`stripeProductId`, `stripePriceId`)
2. Stripe CLI running: `stripe listen --forward-to localhost:3000/api/v1/billing/webhooks/stripe`
3. Environment variables configured:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE SUBSCRIPTION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

User selects plan
       │
       ▼
POST /api/v1/subscriptions/subscribe (with auth token)
{ planId, planPriceId, successUrl, cancelUrl }
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
┌─────────┐  ┌──────────────────────────────────────┐
│ Create  │  │ 1. Ensure billing identity (Stripe)  │
│ local   │  │ 2. Create checkout session           │
│ sub     │  │ 3. Return checkoutUrl                │
│ directly│  └──────────────┬───────────────────────┘
└────┬────┘                 │
     │                      ▼
     │               User redirected to Stripe
     │                      │
     │                      ▼
     │               Payment completed
     │                      │
     │                      ▼
     │               Webhook: checkout.session.completed
     │               POST /api/v1/billing/webhooks/stripe
     │                      │
     │                      ▼
     │               HandleWebhookEventUseCase
     │               - Creates subscription in DB
     │               - Links to planId, planPriceId, userId
     │                      │
     ▼                      ▼
┌─────────────────────────────────────────────────────┐
│          GET /api/v1/auth/current-user              │
│          Returns user with subscription info        │
│          (plan, limits, price, period dates)        │
└─────────────────────────────────────────────────────┘
```

### Testing the Flow

1. **Subscribe to a plan:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/subscriptions/subscribe \
     -H "Authorization: Bearer <access_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "planId": "<plan-uuid>",
       "planPriceId": "<price-uuid>",
       "successUrl": "http://localhost:3001/billing/success",
       "cancelUrl": "http://localhost:3001/billing/cancel"
     }'
   ```

2. **Open the checkoutUrl** in browser and pay with test card: `4242 4242 4242 4242`

3. **Verify subscription was created:**
   ```bash
   curl http://localhost:3000/api/v1/auth/current-user \
     -H "Authorization: Bearer <access_token>"
   ```

   Response includes subscription with plan details:
   ```json
   {
     "success": true,
     "data": {
       "id": "user-uuid",
       "email": "user@example.com",
       "subscription": {
         "id": "sub-uuid",
         "status": "active",
         "isFree": false,
         "currentPeriodStart": "2026-01-28T17:11:18.000Z",
         "currentPeriodEnd": "2026-02-28T17:11:18.000Z",
         "plan": {
           "key": "PRO",
           "name": "Pro",
           "limits": {
             "habitsMax": 20,
             "reportsEnabled": true,
             "historyDays": 90,
             "remindersEnabled": true
           }
         },
         "price": {
           "currency": "usd",
           "interval": "month",
           "amountCents": 999
         }
       }
     }
   }
   ```

---

## User Flow (Legacy)

```
1. User visits Pricing page (logged in)
2. User selects Pro plan (monthly/yearly)
3. User clicks "Upgrade"
   └─> Frontend calls POST /api/v1/subscriptions/subscribe (NEW - unified endpoint)
   └─> OR: POST /api/v1/billing/:provider/checkout-session (direct Stripe)
4. Backend returns { checkoutUrl, checkoutSessionId } OR { subscriptionId } for free plans
5. Frontend redirects user to Stripe Checkout (for paid plans)
6. User completes payment OR cancels
7. Stripe redirects user back to app (successUrl/cancelUrl)
8. IMPORTANT: Access is NOT granted based on redirect
   └─> Single source of truth: webhooks
9. Stripe calls POST /api/v1/billing/webhooks/:provider
   └─> Backend verifies signature, parses event
   └─> Updates subscriptions/entitlements
```

## Current Implementation (Provider-First Phase)

This phase implements provider integration without database persistence.

### What's Implemented

- **BillingProvider port**: Provider-agnostic interface for billing operations
- **StripeBillingProvider**: Stripe SDK adapter implementing the port
- **BillingProviderRegistry**: Simple registry to get providers by name
- **Use Cases**:
  - `EnsureBillingIdentityUseCase`: Creates provider customers (temporary helper)
  - `CreateCheckoutSessionUseCase`: Creates checkout sessions via provider
  - `ParseWebhookUseCase`: Verifies and parses webhook events
- **HTTP Endpoints**:
  - `POST /api/v1/billing/:provider/customers`: Ensure billing identity (temporary)
  - `POST /api/v1/billing/:provider/checkout-session`: Create checkout session
  - `POST /api/v1/billing/webhooks/:provider`: Receive webhooks

### Directory Structure

```
src/modules/billing/
├── domain/
│   └── value-objects/
│       ├── ProviderName.ts
│       └── BillingIdentityId.ts
├── application/
│   ├── ports/
│   │   └── BillingProvider.ts
│   └── use-case/
│       ├── CreateCheckoutSessionUseCase.ts
│       └── ParseWebhookUseCase.ts
├── infrastructure/
│   ├── providers/
│   │   └── stripe/
│   │       ├── StripeBillingProvider.ts
│   │       └── StripeConfig.ts
│   ├── registry/
│   │   └── BillingProviderRegistry.ts
│   └── http/
│       ├── BillingController.ts
│       ├── routes.ts
│       └── plugins/
│           └── rawBodyPlugin.ts
├── index.ts
└── README.md
```

## Configuration

Add Stripe environment variables:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

The billing module is auto-registered via Fastify autoload when the API boots.
Just ensure both environment variables are present (the module logs a warning
and skips route registration if they are missing).

## API Reference

### Create Checkout Session

```
POST /api/v1/billing/:provider/checkout-session
```

**Request:**
```json
{
  "billingIdentityId": "cus_xxx",
  "priceId": "price_xxx",
  "successUrl": "https://app.example.com/success",
  "cancelUrl": "https://app.example.com/cancel",
  "metadata": { "userId": "user_123" }
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/...",
  "providerCheckoutSessionId": "cs_xxx"
}
```

### Webhook Endpoint

```
POST /api/v1/billing/webhooks/:provider
```

**Response (200):**
```json
{
  "providerEventId": "evt_xxx",
  "eventType": "customer.subscription.created"
}
```

## Future Implementation (DB Phase)

The following will be added when database integration is implemented:

### New Domain Entities

- `PlanPrice`: Pricing tiers (Free, Pro Monthly, Pro Yearly)
- `BillingCustomer`: Maps internal userId to provider billingIdentityId
- `ProviderEvent`: Idempotent event storage (deduplication by providerEventId)
- `Subscription`: User subscription state
- `Invoice`: Invoice records
- `Payment`: Payment records

### New Ports (Repositories)

- `PlanPriceRepository`
- `BillingCustomerRepository`
- `ProviderEventRepository`
- `SubscriptionRepository`
- `InvoiceRepository`
- `PaymentRepository`

### Updated Flow

1. `POST /api/v1/billing/checkout-session` (no provider prefix):
   - Input: `{ userId, planPriceId, successUrl, cancelUrl }`
   - Resolves `planPriceId` → `priceId` from DB
   - Finds or creates `BillingCustomer` for `userId`
   - Calls provider with `billingIdentityId`

2. Webhook processing:
   - Verify signature (current)
   - Check idempotency: skip if `providerEventId` exists in `ProviderEvent`
   - Map provider payload to domain entities
   - Update `Subscription`, `Invoice`, `Payment` tables
   - Update user entitlements

### Idempotency Strategy

```typescript
async processWebhook(event: WebhookParsedEvent) {
  const existing = await providerEventRepo.findByProviderId(event.providerEventId);
  if (existing) {
    return { status: 'already_processed' };
  }

  await providerEventRepo.save({
    providerEventId: event.providerEventId,
    eventType: event.eventType,
    payload: event.payload,
    processedAt: new Date(),
  });

  // Process event based on type...
}
```

## Logging

El sistema de logging sigue el formato estructurado con tags en corchetes, optimizado para Loki/Grafana:

### Formato de Logs

```
[level:INFO][request_method:action][request_status:200][request_error:none] - Body: Message: descripción
```

### Tags Disponibles

| Tag | Descripción | Ejemplo |
|-----|-------------|---------|
| `level` | Nivel de log | `INFO`, `DEBUG`, `WARNING`, `ERROR`, `FATAL` |
| `request_method` | Acción ejecutada | `get_current_user`, `create_subscription`, `webhook_checkout_session_completed` |
| `request_status` | Código HTTP o resultado | `200`, `201`, `400`, `404`, `500` |
| `request_error` | Tipo de error o `none` | `none`, `not_found`, `unauthorized`, `validation_error` |
| `entity_type` | Tipo de entidad | `user`, `subscription`, `webhook`, `checkout_session`, `invoice`, `payment` |
| `entity_id` | **OBLIGATORIO si hay entity_type** - ID de la entidad | UUID, ID de Stripe, etc. |
| `request_client` | Cliente/origen (opcional) | `curl`, `web`, `mobile` |

> **IMPORTANTE**: Cuando se incluye `entity_type`, SIEMPRE debe incluirse `entity_id` con el ID correspondiente a ese tipo de entidad.

### Ejemplos de Logs

**Request exitoso (con usuario autenticado):**
```
[level:INFO][request_method:get_current_user][request_status:200][request_error:none][entity_type:user][entity_id:usr_123abc][request_client:curl] - Body: Message: GET /api/v1/auth/current-user completed in 85ms
```

**Request exitoso (sin usuario):**
```
[level:INFO][request_method:get_plans][request_status:200][request_error:none][request_client:curl] - Body: Message: GET /api/v1/plans/catalog completed in 45ms
```

**Suscripción creada:**
```
[level:INFO][request_method:create_subscription][request_status:201][request_error:none][entity_type:subscription][entity_id:sub_xyz789] - Body: Message: Subscription created for user usr_123abc
```

**Webhook recibido:**
```
[level:INFO][request_method:webhook_checkout_session_completed][request_status:200][request_error:none][entity_type:webhook][entity_id:evt_stripe123] - Body: Message: Webhook received: checkout.session.completed
```

**Error 404 (usuario no encontrado):**
```
[level:WARNING][request_method:get_user][request_status:404][request_error:not_found][entity_type:user][entity_id:usr_notfound] - Body: Message: User not found
```

**Error 500 (fallo en pago):**
```
[level:ERROR][request_method:create_payment][request_status:500][request_error:internal_error][entity_type:payment][entity_id:pay_failed123] - Body: Message: Database connection failed
```

### Uso del Logger

```typescript
import { Logger } from '@/utils/logger';

// Log informativo - SIEMPRE incluir entityId cuando hay entityType
Logger.info({
  requestMethod: 'create_subscription',
  requestStatus: 201,
  requestError: 'none',
  entityType: 'subscription',
  entityId: subscription.id,  // ← OBLIGATORIO cuando hay entityType
}, 'Subscription created successfully');

// Log de advertencia - El entityId es el ID de la entidad que se busca
Logger.warn({
  requestMethod: 'process_webhook',
  requestStatus: 404,
  requestError: 'not_found',
  entityType: 'subscription',
  entityId: stripeSubscriptionId,  // ← ID de la suscripción buscada
}, 'Subscription not found for webhook');

// Log de error
Logger.error({
  requestMethod: 'charge_payment',
  requestStatus: 500,
  requestError: 'payment_failed',
  entityType: 'payment',
  entityId: paymentId,  // ← ID del pago que falló
}, 'Payment charge failed');

// Log de webhook recibido
Logger.info({
  requestMethod: 'webhook_checkout_session_completed',
  requestStatus: 200,
  requestError: 'none',
  entityType: 'webhook',
  entityId: providerEventId,  // ← ID del evento de Stripe
}, 'Webhook received: checkout.session.completed');
```

### Regla de entity_type y entity_id

| entity_type | entity_id debe ser |
|-------------|-------------------|
| `user` | ID del usuario (ej: `usr_123abc`) |
| `subscription` | ID de la suscripción (ej: `sub_xyz789`) |
| `payment` | ID del pago (ej: `pay_abc123`) |
| `invoice` | ID de la factura (ej: `inv_stripe123`) |
| `webhook` | ID del evento del proveedor (ej: `evt_stripe456`) |
| `checkout_session` | ID de la sesión de checkout (ej: `cs_stripe789`) |
| `plan` | ID del plan (ej: `plan_abc`) |

### Configuración

Los logs se envían automáticamente a Loki en producción. En desarrollo se muestran en consola con colores (pino-pretty).

Variables de entorno requeridas para producción:
```env
LOKI_APP_NAME=my-api
LOKI_HOST=https://loki.example.com
LOKI_USERNAME=user
LOKI_PASSWORD=password
LOG_LEVEL=info
```

---

## Dependencies

Install Stripe SDK:

```bash
npm install stripe -w @repo/api
```
### Ensure Billing Identity (Temporary helper)

```
POST /api/v1/billing/:provider/customers
```

**Request:**
```json
{
  "email": "user@example.com",
  "name": "Example User",
  "metadata": { "userId": "user_123" }
}
```

**Response:**
```json
{
  "billingIdentityId": "cus_xxx"
}
```

> **Note:** This endpoint exists only for the provider-first phase so you can
> create Stripe customers when testing. Once the DB phase introduces the
> `BillingCustomer` repository, remove this endpoint and handle customer
> creation inside the higher-level application flow.
