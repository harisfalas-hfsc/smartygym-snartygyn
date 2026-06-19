# SmartyGym Security Audit & Secrets Posture

## Gitignore Status
The project maintains a strict policy against committing sensitive environment variables.
- `.env` and `.env.*` files are excluded from version control via the `.gitignore` pattern `*.local`. 
- Critical secrets (Stripe Secret Keys, Resend API Keys, Supabase Service Role Keys) are NEVER committed to the repository.
- Development environments use local `.env` files that are ignored by Git.

## Environment Variables Example (.env.example)
The following keys are required for the application to function. Only "Public" keys are allowed in the client bundle.

```env
# --- PUBLIC (Prefix with VITE_) ---
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# --- PRIVATE (Edge Function Secrets Only) ---
# Set via: supabase secrets set KEY=VALUE
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
SUPABASE_SERVICE_ROLE_KEY=ey...
```

## Secrets Inventory
| Secret Name | Location | Scope |
|-------------|----------|-------|
| `VITE_SUPABASE_URL` | Client Bundle | Public - Identifies the backend |
| `VITE_SUPABASE_ANON_KEY` | Client Bundle | Public - Required for RLS-scoped requests |
| `STRIPE_SECRET_KEY` | Edge Function | Private - Full Stripe API access |
| `STRIPE_WEBHOOK_SECRET` | Edge Function | Private - Verifies Stripe signatures |
| `RESEND_API_KEY` | Edge Function | Private - Email delivery |
| `SUPABASE_SERVICE_ROLE_KEY`| Edge Function | Private - Admin DB access (Bypasses RLS) |

## Logging Policy
- **Client-side (`src/**`):** Development-only `console.log` statements are stripped during the production build process. No sensitive data (PII, tokens) should ever be logged.
- **Edge Functions:** Structured logs are permitted for debugging and audit trails (e.g., `logStep` in `stripe-webhook`). These logs are visible only in the Supabase Dashboard and do not leak to the client.

## Client-Side Exposure Check
A manual review of the `src/` directory confirms:
- **No Service Role Keys:** Searching for `service_role` or `ey...` returns 0 results in frontend code.
- **No Stripe Secret Keys:** Searching for `sk_` returns 0 results in frontend code.
- **Supabase Anon Key:** Verified as public-safe. All data access is protected by Row Level Security (RLS).

## Recommendations
1. **Rotate Keys:** Perform a secret rotation for Stripe and Resend 24 hours before the official public launch.
2. **Audit RLS:** Periodically run `supabase test db` to ensure no policies are overly permissive (e.g., `FOR SELECT USING (true)`).
3. **Scan for PII:** Ensure Edge Function logs do not include plain-text email addresses unless necessary for support debugging.

## Detailed Secrets Inventory & Management

### Supabase Edge Function Secrets
Secrets are managed via the Supabase CLI. They are never exposed to the client or stored in the database as plain text.

```bash
# To set a secret:
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
```

| Secret Key | Description | Risk of Leak |
|------------|-------------|--------------|
| `STRIPE_SECRET_KEY` | Allows full control over Stripe account. | **CRITICAL** - Full financial access. |
| `STRIPE_WEBHOOK_SECRET` | Used to verify that requests to the webhook endpoint are actually from Stripe. | **HIGH** - Prevents fake "payment success" spoofing. |
| `RESEND_API_KEY` | Allows sending emails as `notifications@smartygym.com`. | **MEDIUM** - Potential for spam abuse. |
| `SUPABASE_SERVICE_ROLE_KEY` | Full administrative access to the database (bypasses RLS). | **CRITICAL** - Total data access. |

### Database Row Level Security (RLS)
RLS is the primary line of defense. Every table has a `USING` and `WITH CHECK` policy.

**Key Security Functions:**
- `public.has_role(required_role)`: Checks the `user_roles` table for the current user's UUID.
- `public.has_premium_subscription()`: Validates if the user has an active `premium`, `lifetime`, or `legacy_premium` status.
- `public.user_has_active_premium_access()`: A comprehensive check that includes corporate memberships.

### Client-Side Exposure Analysis
We use Vite's environment variable system. Only variables prefixed with `VITE_` are injected into the client bundle.
- **VITE_SUPABASE_ANON_KEY**: Safe for public use as it respects RLS.
- **VITE_STRIPE_PUBLISHABLE_KEY**: Safe for public use as it only allows creating sessions/tokens, not capturing funds.

### Hardening Recommendations
1. **Enable MFA**: Enforce Multi-Factor Authentication for all Supabase and Stripe admin accounts.
2. **IP Whitelisting**: For the Supabase database, consider whitelisting only the Edge Function exit IPs (if static) and admin developer IPs.
3. **Service Role Scoping**: Avoid using the `service_role` key in Edge Functions unless necessary. Use the user's own JWT (`req.headers.get("Authorization")`) whenever possible to maintain RLS context.
