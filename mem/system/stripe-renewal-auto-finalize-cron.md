---
name: Stripe Renewal Auto-Finalize Cron
description: Daily safety-net cron that auto-finalizes and force-pays stuck Stripe renewal invoices for Gold (monthly) and Platinum (yearly) plans
type: feature
---

**Cron job**: `auto-finalize-stripe-invoices-daily`
**Schedule**: Daily at **05:00 UTC** (≈ 08:00 Cyprus summer / 07:00 winter)
**Edge function**: `auto-finalize-draft-invoices`

**Purpose**: Catches Stripe subscription renewal invoices that get stuck in DRAFT or OPEN state and force-completes them using the customer's default payment method. Without this cron, occasional stuck invoices required manual finalization (as happened with Manolis Christofi in April 2026).

**Two-layer logic inside the function**:
- Layer A: Finds DRAFT renewal invoices (`subscription_cycle` / `subscription_update`) and finalizes them with `auto_advance: true`
- Layer B: Finds OPEN unpaid renewal invoices and force-pays via `stripe.invoices.pay()`

**Registered in admin Cron Jobs panel** under category `billing`, marked `is_critical = true`.

**Why 05:00 UTC**: Early enough to fix any overnight renewal failures before customers see issues. Outside the WOD generation window (06:30/06:50 UTC).
