# Payment Module

Provider-agnostic payment processing. Currently implements Stripe as the primary provider.

## User Flows

### 1. User Subscription Flow (Payment Role)

Este módulo maneja los pasos 5-12 del flujo de suscripción:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PAYMENT MODULE IN SUBSCRIPTION FLOW                      │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────────────────────────┐
                              │         PAYMENT MODULE               │
                              └──────────────────────────────────────┘
                                            │
┌──────────┐     ┌──────────┐     ┌────────┴───────┐     ┌──────────┐
│ Frontend │     │   API    │     │ PaymentProvider│     │  Stripe  │
└────┬─────┘     └────┬─────┘     └────────┬───────┘     └────┬─────┘
     │                │                    │                  │
     │ POST /payment/stripe/checkout-session                  │
     │    { priceId, billingIdentityId, urls }                │
     │───────────────>│                    │                  │
     │                │                    │                  │
     │                │ createCheckoutSession()               │
     │                │───────────────────>│                  │
     │                │                    │                  │
     │                │                    │ sessions.create()│
     │                │                    │─────────────────>│
     │                │                    │                  │
     │                │                    │ { url, id }      │
     │                │                    │<─────────────────│
     │                │                    │                  │
     │                │ { checkoutUrl }    │                  │
     │                │<───────────────────│                  │
     │                │                    │                  │
     │ { checkoutUrl, providerCheckoutSessionId }             │
     │<───────────────│                    │                  │
     │                │                    │                  │
     │ Redirect to Stripe                  │                  │
     │────────────────────────────────────────────────────────>
     │                │                    │                  │
     │                │                    │      Webhook     │
     │                │                    │<─────────────────│
     │                │                    │                  │
     │                │ POST /payment/webhooks/stripe         │
     │                │<───────────────────│                  │
     │                │                    │                  │
     │                │ verifyAndParseWebhook()               │
     │                │───────────────────>│                  │
     │                │                    │                  │
     │                │ { eventType, references }             │
     │                │<───────────────────│                  │
     │                │                    │                  │
```

**Endpoints del módulo:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payment/:provider/checkout-session` | Crea sesión de checkout |
| POST | `/api/v1/payment/:provider/customers` | Crea billing identity |
| POST | `/api/v1/payment/webhooks/:provider` | Recibe webhooks |

---

### 2. Plan Sync Flow (Payment Role)

El Plan Module usa este módulo para sincronizar planes con Stripe:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PAYMENT MODULE IN PLAN SYNC                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────────────┐     ┌──────────┐
│  Admin   │     │Plan Module│    │  Payment Module  │     │  Stripe  │
└────┬─────┘     └────┬─────┘     └────────┬─────────┘     └────┬─────┘
     │                │                    │                    │
     │ Create Plan    │                    │                    │
     │───────────────>│                    │                    │
     │                │                    │                    │
     │                │ paymentProvider.createProduct()        │
     │                │───────────────────>│                    │
     │                │                    │                    │
     │                │                    │ products.create() │
     │                │                    │───────────────────>│
     │                │                    │                    │
     │                │                    │ { id: "prod_xxx" }│
     │                │                    │<───────────────────│
     │                │                    │                    │
     │                │ { productId }      │                    │
     │                │<───────────────────│                    │
     │                │                    │                    │
     │                │ Save plan with stripeProductId         │
     │                │                    │                    │
     │ Plan created   │                    │                    │
     │<───────────────│                    │                    │
     │                │                    │                    │
     │ Create Price   │                    │                    │
     │───────────────>│                    │                    │
     │                │                    │                    │
     │                │ paymentProvider.createPrice()          │
     │                │   { productId: "prod_xxx", ... }       │
     │                │───────────────────>│                    │
     │                │                    │                    │
     │                │                    │ prices.create()   │
     │                │                    │───────────────────>│
     │                │                    │                    │
     │                │                    │ { id: "price_xxx"}│
     │                │                    │<───────────────────│
     │                │                    │                    │
     │                │ { priceId }        │                    │
     │                │<───────────────────│                    │
     │                │                    │                    │
     │                │ Save price with stripePriceId          │
     │                │                    │                    │
     │ Price created  │                    │                    │
     │<───────────────│                    │                    │
```

**Métodos usados por Plan Module:**

| Method | Stripe API | Description |
|--------|------------|-------------|
| `createProduct()` | `products.create()` | Crea producto en Stripe |
| `createPrice()` | `prices.create()` | Crea precio en Stripe |

---

## PaymentProvider Interface

```typescript
interface PaymentProvider {
  // Customer management
  ensureBillingIdentity(input): Promise<{ billingIdentityId: string }>;

  // Checkout
  createCheckoutSession(input): Promise<{
    checkoutUrl: string;
    providerCheckoutSessionId: string;
  }>;

  // Product catalog (used by Plan module)
  createProduct(input): Promise<{ productId: string }>;
  createPrice(input): Promise<{ priceId: string }>;

  // Webhooks
  verifyAndParseWebhook(input): Promise<WebhookParsedEvent>;
}
```

## Configuration

```env
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Request/Response Examples

### Create Billing Identity

```bash
POST /api/v1/payment/stripe/customers
{
  "email": "user@example.com",
  "name": "John Doe",
  "metadata": { "userId": "internal-user-id" }
}

Response:
{
  "billingIdentityId": "cus_1234xxx"
}
```

### Create Checkout Session

```bash
POST /api/v1/payment/stripe/checkout-session
{
  "billingIdentityId": "cus_1234xxx",
  "priceId": "price_5678xxx",
  "successUrl": "https://app.example.com/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://app.example.com/pricing",
  "metadata": { "userId": "internal-user-id" }
}

Response:
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_xxx",
  "providerCheckoutSessionId": "cs_test_xxx"
}
```

### Webhook (parsed internally)

```typescript
// Stripe sends POST /api/v1/payment/webhooks/stripe
// Module parses and returns:
{
  providerEventId: "evt_1234xxx",
  eventType: "checkout.session.completed",
  payload: { /* Stripe event data */ },
  apiVersion: "2023-10-16",
  liveMode: false,
  references: {
    providerCustomerId: "cus_1234xxx",
    providerSubscriptionId: "sub_5678xxx"
  }
}
```

## Architecture

```
payment/
├── domain/
│   └── value-objects/
│       ├── ProviderName.ts
│       └── BillingIdentityId.ts
├── application/
│   ├── ports/
│   │   └── PaymentProvider.ts
│   └── use-case/
│       ├── CreateCheckoutSessionUseCase.ts
│       ├── EnsureBillingIdentityUseCase.ts
│       └── ParseWebhookUseCase.ts
├── infrastructure/
│   ├── providers/
│   │   └── stripe/
│   │       ├── StripePaymentProvider.ts
│   │       └── StripeConfig.ts
│   ├── registry/
│   │   └── PaymentProviderRegistry.ts
│   └── http/
│       ├── PaymentController.ts
│       ├── routes.ts
│       └── plugins/
│           └── rawBodyPlugin.ts
└── index.ts
```

## Adding New Providers

Para agregar otro proveedor (Paddle, MercadoPago, etc.):

1. Implementar `PaymentProvider` interface
2. Registrar en `index.ts`:

```typescript
registry.register('paddle', new PaddlePaymentProvider(config));
```

3. Los endpoints soportan automáticamente el nuevo proveedor via `:provider` param

## Dependencies

None (standalone module, used by other modules)

---

## Webhook Event Handling

El módulo procesa los siguientes eventos de Stripe y crea/actualiza registros en la base de datos:

### Eventos Soportados

| Evento | Acción | Entidad Creada/Actualizada |
|--------|--------|---------------------------|
| `checkout.session.completed` | Crea suscripción | `subscriptions` |
| `customer.subscription.created` | Crea/actualiza suscripción | `subscriptions` |
| `customer.subscription.updated` | Actualiza suscripción | `subscriptions` |
| `customer.subscription.deleted` | Cancela suscripción | `subscriptions` |
| `invoice.paid` | Crea pago | `payments` |
| `invoice.payment_failed` | Registra pago fallido | `payments` |

### Flujo de Webhook

```
┌──────────┐     ┌──────────┐     ┌───────────────────┐     ┌──────────┐
│  Stripe  │     │Controller│     │HandleWebhookEvent │     │   DB     │
└────┬─────┘     └────┬─────┘     └─────────┬─────────┘     └────┬─────┘
     │                │                     │                    │
     │ POST /webhooks │                     │                    │
     │───────────────>│                     │                    │
     │                │                     │                    │
     │                │ verifyAndParse()    │                    │
     │                │────────────────────>│                    │
     │                │                     │                    │
     │                │ execute(parsedEvent)│                    │
     │                │────────────────────>│                    │
     │                │                     │                    │
     │                │                     │ INSERT subscription │
     │                │                     │───────────────────>│
     │                │                     │                    │
     │                │                     │ INSERT payment     │
     │                │                     │───────────────────>│
     │                │                     │                    │
     │  200 OK        │                     │                    │
     │<───────────────│                     │                    │
```

### Metadata Requerida en Checkout Session

Para que el webhook cree correctamente la suscripción, la sesión de checkout **debe incluir metadata** con los siguientes campos:

```typescript
metadata: {
  userId: string;      // UUID válido existente en tabla User
  planId: string;      // UUID válido existente en tabla plans
  planPriceId: string; // UUID válido existente en tabla planPrices
}
```

**Importante:** Si alguno de estos IDs no existe en la base de datos, la creación fallará con error 500 por violación de foreign key.

### Ejemplo de Checkout Session Completo

```bash
POST /api/v1/payment/stripe/checkout-session
{
  "billingIdentityId": "cus_xxx",
  "priceId": "price_xxx",
  "successUrl": "http://localhost:3002/success",
  "cancelUrl": "http://localhost:3002/cancel",
  "metadata": {
    "userId": "99525e04-e2f0-4bc2-85e5-0340d9248fcd",
    "planId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "planPriceId": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
  }
}
```

---

## Testing Webhooks Locally

### Prerrequisitos

1. Stripe CLI instalado: https://stripe.com/docs/stripe-cli
2. PostgreSQL corriendo
3. API corriendo (`npm run dev` en apps/api)

### Pasos para Probar

1. **Autenticar Stripe CLI:**
   ```bash
   stripe login
   ```

2. **Iniciar listener de webhooks:**
   ```bash
   stripe listen --forward-to localhost:3000/api/v1/payment/webhooks/stripe
   ```

   Esto mostrará un webhook secret temporal (whsec_xxx). Asegúrate de que coincida con `STRIPE_WEBHOOK_SECRET` en `.env` o usa el que ya tienes configurado.

3. **Crear un customer (si no existe):**
   ```bash
   curl -X POST http://localhost:3000/api/v1/payment/stripe/customers \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "name": "Test User"
     }'
   ```

   Respuesta: `{"billingIdentityId": "cus_xxx"}`

4. **Crear checkout session con metadata válida:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/payment/stripe/checkout-session \
     -H "Content-Type: application/json" \
     -d '{
       "billingIdentityId": "cus_xxx",
       "priceId": "price_xxx",
       "successUrl": "http://localhost:3002/success",
       "cancelUrl": "http://localhost:3002/cancel",
       "metadata": {
         "userId": "<UUID de un usuario existente>",
         "planId": "<UUID de un plan existente>",
         "planPriceId": "<UUID de un planPrice existente>"
       }
     }'
   ```

5. **Abrir el checkoutUrl** en el navegador y completar el pago con tarjeta de prueba:
   - Número: `4242 4242 4242 4242`
   - Fecha: cualquier fecha futura
   - CVC: cualquier 3 dígitos

6. **Verificar en el terminal de stripe listen** que los webhooks lleguen con status 200:
   ```
   --> checkout.session.completed [evt_xxx]
   <-- [200] POST http://localhost:3000/api/v1/payment/webhooks/stripe
   --> invoice.paid [evt_xxx]
   <-- [200] POST http://localhost:3000/api/v1/payment/webhooks/stripe
   ```

7. **Verificar en la base de datos:**
   ```sql
   SELECT * FROM subscriptions ORDER BY "createdAt" DESC LIMIT 1;
   SELECT * FROM payments ORDER BY "createdAt" DESC LIMIT 1;
   ```

### Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| Webhook retorna 500 | userId/planId/planPriceId no existe en DB | Verificar que los UUIDs en metadata existan en las tablas correspondientes |
| Webhook retorna 400 "Missing raw body" | Plugin rawBody no configurado | Verificar que la ruta tenga `config: { rawBody: true }` |
| Webhook retorna 400 "Unknown provider" | Provider no registrado | Verificar que el provider esté en PaymentProviderRegistry |
| Payment no se crea | invoice.paid llegó antes que checkout.session.completed | Conocida limitación por race condition; la subscription debe existir primero |
| Checkout URL muestra error | Customer ya tiene suscripción activa al mismo precio | Crear nuevo customer o cancelar suscripción existente |

### Consultas Útiles para Debugging

```sql
-- Ver suscripciones recientes
SELECT id, "userId", status, "stripeSubscriptionId", "createdAt"
FROM subscriptions
ORDER BY "createdAt" DESC LIMIT 5;

-- Ver pagos recientes
SELECT id, "userId", "amountCents", status, "stripeInvoiceId", "createdAt"
FROM payments
ORDER BY "createdAt" DESC LIMIT 5;

-- Verificar que los IDs existen
SELECT 'User' as tabla, id FROM "User" WHERE id = '<userId>'
UNION ALL
SELECT 'Plan' as tabla, id FROM plans WHERE id = '<planId>'
UNION ALL
SELECT 'PlanPrice' as tabla, id FROM "planPrices" WHERE id = '<planPriceId>';
```
