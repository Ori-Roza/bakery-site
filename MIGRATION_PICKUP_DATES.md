# Database Migration: Add Pickup Date Fields

This guide explains how to migrate your production Supabase database to support the new `pickup_date` and `pickup_time` fields on orders.

## Overview

Previously, pickup scheduling was only captured in the order message (WhatsApp/Email). Now we're storing these as dedicated database fields so they can be queried, filtered, and edited.

**What changes:**
- New columns: `pickup_date` (YYYY-MM-DD) and `pickup_time` (HH:MM)
- Existing orders without pickup dates will have them set to their `created_at` date
- New orders from checkout and admin panel will populate these fields automatically

## Step-by-Step Migration

### 1. Add Columns to Supabase Database

1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Create a new query and copy the contents of `scripts/001-add-pickup-dates.sql`
3. Click **Run** to execute

The SQL will:
- Add `pickup_date TEXT` column
- Add `pickup_time TEXT` column  
- Create an index for performance
- Add helpful documentation

### 2. Backfill Existing Orders (Optional but Recommended)

If you have existing orders, you can backfill their pickup dates automatically.

**Prerequisites:**
- Supabase Service Role Key (secret, server-side only!)
- Node.js installed

**Get your Service Role Key:**
1. Go to **Supabase Dashboard** → **Settings** → **API** → **Service Role Key**
2. Copy the key (keep this secret! don't commit to git)

**Run the backfill script:**

```bash
SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
node scripts/migrate-pickup-dates.js
```

Replace:
- `your-project` with your actual Supabase project ID
- `eyJ...` with your Service Role Key

**What it does:**
- Finds all orders without `pickup_date` set
- Sets `pickup_date` = order's `created_at` date
- Sets `pickup_time` = NULL (can be edited later)

**Example output:**
```
📋 Pickup Date Migration for Existing Orders

This script will:
  1. Fetch all orders without pickup_date
  2. Set pickup_date = created_at (date part only)
  3. Set pickup_time = NULL

🔄 Fetching orders without pickup_date...
✅ Found 15 orders to update

📝 Updating orders...
  ✓ Processed 10/15 orders
  ✓ Processed 15/15 orders

✅ Migration complete!
   Updated: 15 orders
   Failed: 0 orders
```

### 3. Verify the Changes

Check in Supabase:
1. Go to **SQL Editor**
2. Run: `SELECT id, created_at, pickup_date, pickup_time FROM orders LIMIT 10;`
3. You should see `pickup_date` populated for all orders

## RLS Policy Updates (If Using Row-Level Security)

If you have RLS enabled on the `orders` table, no policy changes are needed—new columns aren't restricted.

However, if you want to restrict who can *edit* pickup dates, consider adding a policy:

```sql
CREATE POLICY "admins_can_edit_pickup_dates" ON orders
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

## Application Changes

The app already handles the new fields:

**Checkout:**
- User selects pickup date/time → stored in database

**Admin Panel:**
- Can create/edit orders with explicit pickup dates
- Orders table shows both `created_at` and `pickup_date`
- Can filter orders by pickup date

**Exports:**
- CSV/XLSX exports include both date columns

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
ALTER TABLE orders
DROP COLUMN IF EXISTS pickup_date,
DROP COLUMN IF EXISTS pickup_time;

DROP INDEX IF EXISTS idx_orders_pickup_date;
```

## Troubleshooting

**Script fails to connect:**
- Verify SUPABASE_URL is correct (should be: `https://xxxx.supabase.co`)
- Double-check Service Role Key is copied correctly
- Ensure key has no extra spaces or newlines

**Columns already exist:**
- That's fine! The SQL migration checks with `IF NOT EXISTS`
- The backfill script will find orders that need updating

**Permission errors:**
- Make sure you're using **Service Role Key**, not anon key
- Service Role Key has full permissions and must be kept secret

## Next Steps

After migration:
1. Deploy updated app code to production
2. Test in staging/dev environment
3. For existing orders, customers may not have pickup time set (it's NULL)
   - They can be edited via admin panel if needed
   - New orders will have complete data

That's it! Your database is now ready for the new feature.
