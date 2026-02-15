#!/usr/bin/env node
/**
 * Database Migration Script: Add pickup_date and pickup_time to orders
 * 
 * This script updates existing orders to backfill pickup_date and pickup_time.
 * 
 * IMPORTANT: You must first run this SQL in Supabase SQL Editor:
 * 
 *   ALTER TABLE orders
 *   ADD COLUMN IF NOT EXISTS pickup_date TEXT,
 *   ADD COLUMN IF NOT EXISTS pickup_time TEXT;
 * 
 * Usage:
 *   SUPABASE_URL="https://your-project.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
 *   node scripts/migrate-pickup-dates.js
 * 
 * Service Role Key: Go to Supabase Dashboard > Project Settings > API > Service Role Key
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ Error: Missing environment variables\n');
  console.error('Required environment variables:');
  console.error('  SUPABASE_URL - Your Supabase project URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY - Service Role Key (server-side only!)\n');
  console.error('Example usage:');
  console.error('  SUPABASE_URL="https://your-project.supabase.co" \\');
  console.error('  SUPABASE_SERVICE_ROLE_KEY="eyJ..." \\');
  console.error('  node scripts/migrate-pickup-dates.js\n');
  console.error('Get Service Role Key from: Supabase Dashboard > Settings > API > Service Role Key\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migratePickupDates() {
  console.log('\n📋 Pickup Date Migration for Existing Orders\n');
  console.log('This script will:');
  console.log('  1. Fetch all orders without pickup_date');
  console.log('  2. Set pickup_date = created_at (date part only)');
  console.log('  3. Set pickup_time = NULL\n');

  try {
    // Fetch all orders without pickup_date
    console.log('🔄 Fetching orders without pickup_date...');
    
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, created_at')
      .is('pickup_date', null)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('\n❌ Error fetching orders:', fetchError.message);
      console.error('Verify that:');
      console.error('  - Columns pickup_date and pickup_time exist in orders table');
      console.error('  - Service Role Key has proper permissions');
      process.exit(1);
    }

    if (!orders || orders.length === 0) {
      console.log('✅ All orders already have pickup_date set or no orders exist\n');
      return;
    }

    console.log(`✅ Found ${orders.length} orders to update\n`);
    console.log('📝 Updating orders...');

    let updated = 0;
    let failed = 0;

    // Update orders in batches
    const batchSize = 10;
    for (let i = 0; i < orders.length; i += batchSize) {
      const batch = orders.slice(i, i + batchSize);
      
      for (const order of batch) {
        // Extract just the date part from created_at (YYYY-MM-DD)
        const pickupDate = order.created_at 
          ? order.created_at.split('T')[0] 
          : new Date().toISOString().split('T')[0];

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            pickup_date: pickupDate,
            pickup_time: null,
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`  ❌ Error updating order ${order.id}:`, updateError.message);
          failed++;
        } else {
          updated++;
        }
      }
      
      const progress = Math.min(i + batchSize, orders.length);
      console.log(`  ✓ Processed ${progress}/${orders.length} orders`);
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated: ${updated} orders`);
    console.log(`   Failed: ${failed} orders\n`);
    
    console.log('📌 What happened:');
    console.log(`   • All ${updated} order(s) without pickup_date now have it set`);
    console.log('   • pickup_date was set to the order creation date');
    console.log('   • pickup_time was set to NULL (can be edited via admin or checkout)\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message, '\n');
    process.exit(1);
  }
}

// Run migration
migratePickupDates();
