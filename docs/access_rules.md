# SmartyGym Access Control Rules

## User Tiers

1. **Guest** - Anonymous visitors
2. **Subscriber** - Free registered users  
3. **Premium** - Gold/Platinum paid members

## Content Access Rules

### Guest Access
- ✅ Can view: Marketing pages, exercise library, blog
- ❌ Cannot: Access workouts, programs, tools, dashboard

### Free Subscriber Access
- ✅ Can view: Everything guests can + free workouts/programs + tools
- ✅ Can purchase: Individual premium workouts/programs
- ❌ Cannot: Access premium content without purchase

### Premium Member Access
- ✅ Can view: ALL content (premium included in subscription)
- ❌ Cannot: Purchase standalone content (everything already included)

## 🚨 CRITICAL BUSINESS RULE

**Premium users CANNOT purchase standalone content.**

All premium workouts and training programs are included in their subscription. 
The purchase button must be hidden for premium users and the edge function must 
reject any purchase attempts from premium members.

## Implementation Points

1. **PurchaseButton.tsx** - Shows "Included in Premium" for premium users
2. **create-individual-purchase-checkout** - Rejects premium user purchases (403)
3. **canUserAccessContent()** - Returns `canPurchase: false` for premium users
4. **RLS policies** - Ensure premium users can read all premium content

## Content Flags

- `is_premium` boolean on workouts/programs
- `tier_required` field specifies access level
- `is_standalone_purchase` + `price` + `stripe_price_id` for individual purchases

## Access Control Flow

```
User requests content
    ↓
Check userTier
    ↓
If guest → Require login
If premium → Grant access (canPurchase = false)
If subscriber → Check content.is_premium
    ↓
    If free → Grant access
    If premium → Check if purchased
        ↓
        If purchased → Grant access
        If not → Show upgrade or purchase option
```

## Database Tables

- **user_subscriptions** - Stores subscription data (plan_type, status)
- **user_purchases** - Stores individual content purchases
- **user_roles** - Stores admin/moderator roles
- **admin_workouts** - Workout content with access flags
- **admin_training_programs** - Program content with access flags

## Security Notes

- All access decisions verified server-side via RLS policies
- Client-side checks are UI-only, not security
- Edge functions validate user status before processing payments
- Admin routes protected by role-based access control
