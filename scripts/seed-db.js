#!/usr/bin/env node
/**
 * Database Seeding Script for Local Development
 * 
 * This script creates a local SQLite database with test data
 * Useful for initializing or resetting your local dev environment
 * 
 * Usage: 
 *   node scripts/seed-db.js          # Use default seed
 *   node scripts/seed-db.js custom   # Use custom seed
 */

import { createSqliteSupabaseClient } from '../tests/helpers/sqliteSupabaseMock.js';
import fs from 'fs';
import path from 'path';

// Custom seed function with more sample data
const customSeed = (db) => {
  // Insert categories
  db.prepare("INSERT INTO categories (id, name, image_url) VALUES (?, ?, ?)").run(
    1, "חלה", "assets/all_categories.png"
  );
  db.prepare("INSERT INTO categories (id, name, image_url) VALUES (?, ?, ?)").run(
    2, "עוגות", "assets/all_categories.png"
  );
  db.prepare("INSERT INTO categories (id, name, image_url) VALUES (?, ?, ?)").run(
    3, "ממתקים", "assets/all_categories.png"
  );

  // Insert products with variety
  const products = [
    { id: 101, title: "חלה קלועה", price: 18.5, discount: 0, image: "assets/wheat.png", category: 1 },
    { id: 102, title: "חלה שחורה", price: 22, discount: 0, image: "assets/wheat.png", category: 1 },
    { id: 103, title: "עוגת שוקולד", price: 42, discount: 10, image: "assets/wheat.png", category: 2 },
    { id: 104, title: "עוגת וניל", price: 38, discount: 0, image: "assets/wheat.png", category: 2 },
    { id: 105, title: "עוגת להולדת יום", price: 65, discount: 15, image: "assets/wheat.png", category: 2 },
    { id: 106, title: "ממתקי שוקולד", price: 12, discount: 0, image: "assets/wheat.png", category: 3 },
  ];

  products.forEach(p => {
    db.prepare(
      "INSERT INTO products (id, title, price, discount_percentage, image, in_stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(p.id, p.title, p.price, p.discount, p.image, 1, p.category);
  });

  // Insert site metadata
  db.prepare(
    "INSERT INTO site_metadata (id, about_section, orders_accepting, bakery_telephone, store_phone, contact_whatsapp, contact_email, contact_address, hero_title, header_title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(
    1,
    "בית מאפה משפחתי המייצר עוגות טעימות",
    1,
    "050-1234567",
    "050-1234567",
    "972501234567",
    "orders@bakery.local",
    "רחוב הבדולח 123, תל אביב",
    "ברוכים הבאים לבית מאפה",
    "בית המאפה שלנו"
  );
};

const main = async () => {
  try {
    const seedType = process.argv[2] || 'default';
    const seedFn = seedType === 'custom' ? customSeed : null;

    console.log('\n🌱 Seeding local database...\n');

    const client = await createSqliteSupabaseClient({
      seed: seedType === 'default',
      seedFn: seedType === 'custom' ? customSeed : null
    });

    console.log('✅ Database seeded successfully!\n');
    console.log('📊 Sample Data Initialized:');
    
    if (seedType === 'default') {
      console.log('   • 2 Categories');
      console.log('   • 2 Products');
      console.log('   • Site metadata');
    } else {
      console.log('   • 3 Categories (חלה, עוגות, ממתקים)');
      console.log('   • 6 Products (various items)');
      console.log('   • Site metadata with more details');
    }
    
    console.log('\n💡 Tip: Run "npm run dev:local" to start the development server\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

main();
