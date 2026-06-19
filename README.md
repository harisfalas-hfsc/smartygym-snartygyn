# SmartyGym

100% Human, 0% AI. Expert-led fitness platform designed by Haris Falas.

## Tech Stack
- **Frontend:** React 18, Vite 5, Tailwind CSS v3, TypeScript 5.
- **Backend:** Supabase (Auth, DB, Storage, Edge Functions).
- **Payments:** Stripe (Checkouts, Webhooks, Customer Portal).
- **Mobile:** Capacitor (Native iOS/Android shells).
- **Deployment:** Lovable Cloud / Netlify.

## Getting Started

### Local Development
1. **Clone & Install:**
   ```bash
   git clone <repo-url>
   cd smartygym
   bun install
   ```
2. **Environment Variables:**
   The project uses auto-managed Supabase variables. For local overrides, create a `.env.local`:
   ```env
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
3. **Run Dev Server:**
   ```bash
   bun run dev
   ```

## Key Infrastructure

### Stripe Configuration
The project uses a **Lifetime Premium** model (€89.99).
- Active Price ID: `price_1ThP4MIxQYg9inGKAUQEJ0tD`
- Webhooks must be pointed to: `https://<project>.supabase.co/functions/v1/stripe-webhook`

### Admin Management
Roles are managed via the `user_roles` table. To grant admin access:
```sql
INSERT INTO user_roles (user_id, role) VALUES ('user-uuid', 'admin');
```
Admins gain access to the `/admin` dashboard and bypass most RLS restrictions via the `has_role` and `has_premium_subscription` functions.

### Edge Functions
Deploy functions via Supabase CLI:
```bash
supabase functions deploy <function-name>
```
Remember to set secrets for `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, and `STRIPE_WEBHOOK_SECRET`.

## Mobile Support
The app is Capacitor-ready.
- **Build:** `npm run build`
- **Sync:** `npx cap sync`
- **Checkout:** Note that mobile checkouts open in the system browser to comply with platform policies.

## Security
- **RLS:** Row Level Security is enabled on EVERY table. No data is accessible without a valid JWT matching the policy.
- **Secrets:** Never commit `.env` files. Private keys live only in Supabase Edge Function secrets.

## Testing
Run the test suite:
```bash
bunx vitest run
```

## Launch Readiness Audit Documentation
For a deep dive into the system's architecture and readiness for production, see the following audit files:
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) — Secrets, RLS, and logging posture.
- [PAYMENT_FLOW.md](./PAYMENT_FLOW.md) — Stripe products, webhooks, and legacy support.
- [BACKEND_FUNCTION_MAP.md](./BACKEND_FUNCTION_MAP.md) — Comprehensive list of Edge Functions and triggers.
- [MOBILE_READINESS_REPORT.md](./MOBILE_READINESS_REPORT.md) — Capacitor, PWA, and Mobile Checkout strategy.
- [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) — Final Go/No-Go verification list.
