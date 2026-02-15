# Local Development Setup with Mock Database

This guide explains how to run the bakery site locally with a mock SQLite database for testing without needing Supabase credentials.

## Quick Start

### Option 1: Simple HTTP Server with Mock DB (Recommended for Testing UI)

```bash
npm run dev:local
```

Then open **http://localhost:3000** in your browser.

This starts a lightweight HTTP server that serves your static files and injects a mock Supabase client into the page. Perfect for testing the UI with sample data.

**What's included:**
- 2 Categories: חלה, עוגות
- 2 Products: חלה קלועה, עוגת שוקולד
- Site metadata with defaults
- Mock authentication (optional)

---

### Option 2: Vite Development Server (For Hot Reload)

```bash
npm run dev
```

Then open **http://localhost:5173** in your browser.

This starts Vite's development server with hot module reloading. However, **you'll need Supabase credentials** (set in `.env.local` or `config.js`) for this to work with real data.

---

## Testing the Changes Locally

### After running `npm run dev:local`:

1. **Test Date Format (DD/MM/YYYY)**
   - Scroll to the checkout form
   - Click on the date picker
   - Select a date
   - Verify it shows as `DD/MM/YYYY` (e.g., `19/02/2026`)

2. **Test Order Message**
   - Add products to cart
   - Fill in customer details
   - Create an order message
   - Verify:
     - Date shows as `19/02/2026` (not `02/19/2026`)
     - Message greeting is `"שלום, הזמנה חדשה מהאתר:"` (without name)
     - No "יעקב" in the message

3. **Test Button Alignment**
   - Scroll to the order channel buttons
   - Compare "Send by Email" and "Send by WhatsApp" buttons
   - They should have the same height and width

---

## Customizing Mock Data

### Add More Sample Products

Edit `scripts/seed-db.js` and modify the `customSeed` function:

```bash
node scripts/seed-db.js custom
```

This seeds the database with more sample data (3 categories, 6 products, more metadata).

---

## How It Works

1. **dev-server.js** - A lightweight Node.js HTTP server that:
   - Serves static files (HTML, CSS, JS)
   - Intercepts requests for `index.html`
   - Injects a mock Supabase client into the page
   - The mock client uses SQLite via `sql.js`

2. **Mock Database** - Uses the same mock setup as your tests:
   - SQLite schema matching your Supabase tables
   - Sample data for testing
   - API that mimics Supabase client behavior

3. **No Network Required** - Everything runs locally in your browser:
   - No API calls to external servers
   - Instant responses
   - Full control over test data

---

## Troubleshooting

### Server won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>

# Or use a different port
PORT=3001 npm run dev:local
```

### Date picker not working
- Make sure you're testing in a modern browser (Chrome, Firefox, Safari)
- The HTML date input is used directly; browser support varies

### Mock data not showing
- Check browser console for errors (F12)
- Verify `tests/helpers/sqliteSupabaseMock.js` is accessible
- Clear browser cache and reload

---

## For Production Testing

When you're ready to test with real Supabase data:

1. Set up a `.env.local` file or update `src/config.js` with:
   ```javascript
   window.__SUPABASE__ = {
     url: "YOUR_SUPABASE_URL",
     anonKey: "YOUR_SUPABASE_ANON_KEY"
   };
   ```

2. Run `npm run dev` and open http://localhost:5173

---

## File Structure

```
bakery-site/
├── dev-server.js              # Local dev server with mock DB
├── index.html                 # App entry point
├── package.json               # Scripts including "dev:local"
├── scripts/
│   └── seed-db.js            # Database seeding utility
├── src/
│   ├── config.js             # Supabase config (for dev)
│   └── services/
│       └── SupabaseClient.ts  # Client factory
└── tests/
    └── helpers/
        └── sqliteSupabaseMock.js  # Mock implementation
```

---

## Questions?

- Review the code in `dev-server.js` to understand the mock setup
- Check `tests/helpers/sqliteSupabaseMock.js` for the SQLite schema
- Look at test files (e.g., `tests/order-builder.test.js`) for mock data examples
