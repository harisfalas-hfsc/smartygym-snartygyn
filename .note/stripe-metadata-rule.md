# MANDATORY STRIPE METADATA RULE

## CRITICAL: READ THIS BEFORE ANY STRIPE OPERATION

When creating **ANY** Stripe product for SmartyGym, you **MUST**:

### 1. ALWAYS Include Metadata

```typescript
metadata: {
  project: "SMARTYGYM",
  content_type: "Workout" | "Training Program" | "Micro-Workout" | "Ritual" | etc.
}
```

### 2. NEVER Use Direct Stripe API/MCP Tools

Always use the existing edge functions:
- `create-stripe-product`
- `create-individual-purchase-checkout`
- `generate-workout-of-day`

These functions automatically include the required metadata.

### 3. If Edge Functions Are Unavailable

If you MUST create a Stripe product directly (e.g., via MCP tools), you MUST:
1. Include `project: "SMARTYGYM"` in metadata
2. Include appropriate `content_type` in metadata
3. Run `fix-stripe-metadata` function afterward to verify

## Why This Matters

Without the SMARTYGYM metadata:
- Revenue reports mix SmartyGym with other projects
- Product filtering fails
- Customer purchases are not properly attributed
- Admin cannot track sales correctly

## This Is A HARD RULE With NO EXCEPTIONS

The user has explicitly stated this rule multiple times. Failure to follow it causes significant business problems.

## Verification

Run the `fix-stripe-metadata` edge function to:
- Audit all Stripe products
- Add missing SMARTYGYM metadata
- Report any issues

## Reference

See `docs/DEVELOPMENT_STANDARDS.md` Section 10 for the full specification.
