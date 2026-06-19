# SmartyGym Payment & Subscription System

## Active Product Strategy
SmartyGym has transitioned to a simplified "One Product" model for retail users.
- **Primary Product:** Lifetime Premium
- **Price ID:** `price_1ThP4MIxQYg9inGKAUQEJ0tD`
- **Cost:** €89.99 (One-time)
- **Access:** Grants permanent `lifetime` plan_type.

## Retired Tiers (Legacy Support)
The following products are no longer available for new signups but remain in the system to handle existing legacy users and financial events:
- **Gold Monthly:** `price_1SJ9q1IxQYg9inGKZzxxqPbD`
- **Platinum Yearly:** `price_1SJ9qGIxQYg9inGKFbgqVRjj`
- **Mapping:** These are internally mapped to `legacy_premium` in the `stripe-webhook` and `check-subscription` functions to ensure users retain access without being offered the retired plans.

## Standalone Purchases
Users can purchase individual workouts or training programs without a full membership.
- Triggered via `create-individual-purchase-checkout`.
- Records are stored in `user_purchases`.
- Access is granted via `user_purchases` RLS policies.

## Corporate B2B Flow
Separate products exist for corporate entities (Dynamic, Power, Elite, Enterprise).
- **Flow:** Admin purchases a corporate tier -> `corporate_subscriptions` record created -> Admin adds members via `create-corporate-member`.
- **Access:** Members get `premium` plan_type as long as the corporate subscription is `active`.

## Edge Function Map
| Function Name | Purpose |
|---------------|---------|
| `create-lifetime-checkout` | Generates a Stripe checkout session for the €89.99 Lifetime plan. |
| `create-individual-purchase-checkout` | Generates a checkout for specific workouts/programs. |
| `create-corporate-checkout` | Handles B2B multi-user subscription purchases. |
| `stripe-webhook` | The central "Brain" - processes all events from Stripe. |
| `check-subscription` | Client-side helper to verify current access status. |
| `manage-subscription` | Redirects users to the Stripe Customer Portal. |

## Webhook Event Matrix
The `stripe-webhook` function handles:
- `checkout.session.completed`: Provisions access for lifetime, standalone, and corporate purchases.
- `customer.subscription.created/updated/deleted`: Syncs recurring status for legacy/corporate users.
- `invoice.paid`: Confirms payment and triggers welcome/confirmation emails.
- `charge.refunded`: Automatically revokes access if a refund is processed in Stripe.

## Idempotency & Safety
- **Table:** `stripe_webhook_events` stores every `event.id`.
- **Logic:** The webhook checks this table first; if an ID exists, it returns `200 OK` without re-processing, preventing duplicate provisioning or emails.
- **Refunds:** Handled via `charge.refunded` or `customer.subscription.deleted`.

## Success / Cancel Flows
- **Success:** User is redirected to `/payment-success?session_id=...` which triggers a client-side "thank you" and refresh.
- **Cancel:** User is returned to the pricing page or checkout origin.

## Detailed Webhook Logic (stripe-webhook)
The webhook handler is designed with high resilience and clear auditing.

### Idempotency Flow
1. **Event Receipt:** Stripe sends a POST request with a `stripe-signature`.
2. **Signature Verification:** Validated using `STRIPE_WEBHOOK_SECRET`.
3. **Log & Store:** The event ID is checked against `stripe_webhook_events`.
   - If `duplicate`, return `200` immediately.
   - If `new`, insert ID and continue.
4. **Switch Logic:** Based on `event.type`:
   - `checkout.session.completed`:
     - Inspect `metadata.user_id`.
     - Inspect `session.mode`.
     - If `subscription`: Call `handleSubscriptionCheckout`.
     - If `payment`: Call `handleOneTimePurchase`.
     - If `metadata.corporate_plan_type`: Call `handleCorporateSubscriptionCheckout`.

### Legacy Mapping Table
| Stripe Price ID | Logic Mapping | Resulting `plan_type` |
|-----------------|---------------|----------------------|
| `price_1ThP4MIxQYg9inGKAUQEJ0tD` | Primary (Lifetime) | `lifetime` |
| `price_1SJ9q1IxQYg9inGKZzxxqPbD` | Legacy (Gold) | `legacy_premium` |
| `price_1SJ9qGIxQYg9inGKFbgqVRjj` | Legacy (Platinum) | `legacy_premium` |
| *Unknown ID* | Default / Error | `free` (log warning) |

### Refund and Cancellation Handling
- **`customer.subscription.deleted`**: Triggered when a recurring plan (Legacy or Corporate) ends. The system updates `user_subscriptions.status` to `canceled`.
- **`charge.refunded`**: Triggered when a manual refund is issued in the Stripe Dashboard. The webhook locates the associated user via `stripe_customer_id` and revokes access by setting `plan_type` to `free` or deleting the `user_purchases` record.

### Post-Purchase Automation
Upon successful payment, the following secondary actions are triggered:
1. **Database Update:** User record updated with new plan/purchase.
2. **Internal Notification:** Entry added to `user_system_messages`.
3. **Email Delivery:** Welcome email sent via Resend API.
4. **Admin Logging:** Record added to `audit_logs` for financial tracking.
