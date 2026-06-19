# SmartyGym Backend Edge Functions

All functions are located under `supabase/functions/`. The system uses a microservices-style architecture with over 100 specialized functions handling everything from payments to AI content generation and automated repairs.

## Production / Core
| Name | Purpose | Trigger | Service Role? | Risk |
|------|---------|---------|---------------|------|
| `stripe-webhook` | Processes all Stripe financial events (Checkout, Subscriptions, Refunds) | Webhook | Y | High |
| `check-subscription` | Validates user premium status and returns active plan features | Client Call | N | Low |
| `manage-subscription` | Generates a secure redirect link to the Stripe Customer Portal | Client Call | N | Low |
| `create-lifetime-checkout` | Creates a Checkout session for the €89.99 Lifetime Premium plan | Client Call | N | Med |
| `create-individual-purchase` | Handles one-off purchases for specific workouts or programs | Client Call | N | Med |
| `create-corporate-checkout` | Initiates the B2B multi-user subscription flow | Client Call | N | Med |
| `verify-purchase` | Validates mobile/external receipts and provisions digital goods | Client Call | Y | Med |
| `delete-user-account` | Orchestrates GDPR-compliant deletion of all user data across DB and Stripe | Client Call | Y | High |
| `export-user-data` | Generates a JSON/CSV archive of a user's data for GDPR portability | Client Call | Y | Med |

## Admin & Operations
| Name | Purpose | Trigger | Service Role? | Risk |
|------|---------|---------|---------------|------|
| `run-system-health-audit` | Periodic scan of the database for orphaned records or invalid states | Cron / Admin | Y | Med |
| `get-stripe-revenue` | Aggregates financial data for the internal Admin Analytics dashboard | Admin Call | Y | Med |
| `get-users-with-emails` | Fetches user list with metadata for CRM and support purposes | Admin Call | Y | Med |
| `grant-corporate-admin` | Assigns administrative rights to a user for a specific corporate entity | Admin Call | Y | Med |
| `revoke-corporate-admin` | Removes administrative rights and associated premium access | Admin Call | Y | Med |
| `manage-cron-jobs` | Interface for scheduling and monitoring internal background tasks | Admin Call | Y | Med |
| `cron-heartbeat` | Monitoring ping to ensure the Supabase Cron service is active | Cron | N | Low |
| `cron-run-recorder` | Logs the execution history of all scheduled background jobs | Internal | Y | Low |

## Notifications & CRM
| Name | Purpose | Trigger | Service Role? | Risk |
|------|---------|---------|---------------|------|
| `send-welcome-email` | Sends the initial "Welcome to SmartyGym" onboarding message | Webhook/DB | Y | Low |
| `send-welcome-onboarding` | More detailed multi-day sequence for new premium users | DB Trigger | Y | Low |
| `send-notification` | Central gateway for Push, Email, and In-App system messages | Multi | Y | Med |
| `send-bulk-email` | Admin tool for sending announcements to specific user segments | Admin Call | Y | High |
| `send-weekly-motivation` | Automated engagement email sent every Monday morning | Cron | Y | Low |
| `send-checkin-reminders` | Pokes users who haven't logged a workout in 3+ days | Cron | Y | Low |
| `send-renewal-reminders` | Notifies corporate admins of upcoming subscription renewals | Cron | Y | Low |
| `process-pending-notifications` | Batch processor for the notification queue to avoid rate limits | Cron | Y | Med |
| `send-automated-messages` | Trigger-based messages (e.g., first workout completed) | DB Trigger | Y | Low |

## SEO & Content Distribution
| Name | Purpose | Trigger | Service Role? | Risk |
|------|---------|---------|---------------|------|
| `generate-sitemap` | Crawls workouts/programs to update the XML sitemap | Cron/Admin | N | Low |
| `refresh-seo-metadata` | Updates OpenGraph and Meta tags for all dynamic content pages | Admin Call | Y | Low |
| `indexnow-ping` | Immediately notifies Bing/Yandex of new content updates | Admin Call | N | Low |
| `refresh-sitemap-ping` | Pings Google Search Console to re-crawl the sitemap | Admin Call | N | Low |
| `generate-calendar-ics` | Creates downloadable workout schedules for iCal/Google Calendar | Client Call | N | Low |

## Content Generation & AI
| Name | Purpose | Trigger | Service Role? | Risk |
|------|---------|---------|---------------|------|
| `generate-workout-image` | Uses DALL-E/Midjourney to create thumbnails for new workouts | Admin Call | Y | Med |
| `auto-generate-workout-image`| Automated image creation during the content import process | Internal | Y | Med |
| `generate-blog-image` | Creates matching visuals for weekly blog articles | Admin Call | Y | Med |
| `ai-exercise-linker` | Maps raw exercise names to the internal master exercise library | Admin Call | Y | Med |
| `generate-weekly-blog-articles` | Drafts educational content based on the current training cycle | Cron | Y | Med |

## Repair & Data Integrity (The "Auditors")
| Name | Purpose | Trigger | Service Role? | Risk |
|------|---------|---------|---------------|------|
| `repair-workout-content` | Fixes JSON schema errors in the workout content field | Admin Call | Y | Med |
| `repair-missing-images` | Scans for 404 image links and attempts to regenerate them | Admin Call | Y | Med |
| `audit-content-formatting`| Scans for markdown errors that break the mobile UI | Cron | N | Low |
| `bulk-format-consistency-repair` | Standardizes units (kg/lbs) across the entire library | Admin Call | Y | Med |
| `fix-stripe-metadata` | Synchronizes Stripe product metadata with the Supabase DB | Admin Call | Y | Med |
| `audit-workout-durations` | Recalculates estimated time based on reps/sets/rest | Admin Call | Y | Low |

## HFSC Internal Subsystem (OFF-LIMITS)
These functions are reserved for Haris Falas Sport Science (HFSC) internal operations.
- `ai-contact-response`: Automated first-pass for customer support.
- `edit-video`: Triggers cloud-based video transcoding for exercise demos.
- `generate-admin-workout`: Specialized tool for Haris to draft new cycles.
- `search-food-nutrition`: API bridge for the nutritional logging feature.
- `upload-app-store-asset`: Manages metadata and screenshots for store listings.

## Candidates for Archive
- `migrate-content`: Legacy tool used for the initial platform migration.
- `test-admin-email`: Single-use diagnostic function.
- `generate-app-vault-document`: Prototype for a discontinued feature.
