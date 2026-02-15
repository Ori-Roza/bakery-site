/**
 * Browser-compatible in-memory mock for Supabase client.
 * Used by dev:local (Vite + MOCK_DB=true) for local development.
 * 
 * Unlike sqliteSupabaseMock.js (which uses sql.js/WASM for tests),
 * this uses plain JS arrays — no WASM, no Node dependencies.
 */

// ── Seed data ──────────────────────────────────────────────

const SEED = {
  categories: [
    { id: 1, name: "חלה", image_url: "assets/all_categories.png" },
    { id: 2, name: "עוגות", image_url: "assets/all_categories.png" },
  ],
  products: [
    { id: 101, title: "חלה קלועה", price: 18.5, discount_percentage: 0, image: "assets/wheat.png", in_stock: true, category_id: 1 },
    { id: 102, title: "עוגת שוקולד", price: 42, discount_percentage: 10, image: "assets/wheat.png", in_stock: true, category_id: 2 },
    { id: 103, title: "חלה מתוקה", price: 22, discount_percentage: 0, image: "assets/wheat.png", in_stock: true, category_id: 1 },
    { id: 104, title: "עוגת גבינה", price: 48, discount_percentage: 15, image: "assets/wheat.png", in_stock: true, category_id: 2 },
  ],
  orders: [],
  order_items: [],
  profiles: [
    { user_id: "admin-1", role: "admin" },
  ],
  site_metadata: [
    {
      id: 1,
      about_section: "ברוכים הבאים לבית המאפה שלנו! אנחנו בית מאפה משפחתי שמכין מאפים טריים כל יום בעבודת יד ובאהבה. אצלנו תמצאו מגוון רחב של חלות, לחמים, עוגות ומאפים מתוקים ומלוחים. כל המוצרים שלנו מיוצרים מחומרי גלם טריים ואיכותיים, ללא חומרים משמרים. אנחנו מזמינים אתכם לטעום ולהנות!",
      orders_accepting: true,
      logo_url: null,
      bakery_telephone: "050-1234567",
      store_phone: "050-1234567",
      contact_whatsapp: "972501234567",
      contact_email: "orders@bakery.local",
      contact_address: "רחוב הלחם 1, תל אביב",
      hero_badge: null,
      hero_title: "ברוכים הבאים לבית המאפה",
      hero_description: "מאפים טריים כל יום",
      hero_chips: null,
      hero_image_url: null,
      header_title: "בית המאפה",
    },
  ],
  featured_products: [],
};

// ── Query builder (mimics Supabase's chained API) ──────────

class MockQuery {
  constructor(db, table) {
    this._db = db;
    this._table = table;
    this._op = null;
    this._payload = null;
    this._filters = [];
    this._orderBy = null;
    this._limitN = null;
    this._single = false;
    this._selectCols = null;
    this._selectAfterWrite = false;
  }

  select(cols = "*") {
    if (this._op && this._op !== "select") {
      this._selectAfterWrite = true;
    } else {
      this._op = "select";
    }
    if (cols !== "*") {
      this._selectCols = cols.split(",").map(c => c.trim());
    }
    return this;
  }

  insert(rows) { this._op = "insert"; this._payload = Array.isArray(rows) ? rows : [rows]; return this; }
  update(vals) { this._op = "update"; this._payload = vals; return this; }
  delete()     { this._op = "delete"; return this; }

  eq(col, val) { this._filters.push({ col, val }); return this; }

  order(col, { ascending = true } = {}) { this._orderBy = { col, ascending }; return this; }
  limit(n) { this._limitN = n; return this; }
  single() { this._single = true; return this; }

  // ── Execution ──

  _applyFilters(rows) {
    let result = rows;
    for (const f of this._filters) {
      result = result.filter(r => r[f.col] === f.val || r[f.col] == f.val);
    }
    return result;
  }

  _applyOrder(rows) {
    if (!this._orderBy) return rows;
    const { col, ascending } = this._orderBy;
    return [...rows].sort((a, b) => {
      if (a[col] < b[col]) return ascending ? -1 : 1;
      if (a[col] > b[col]) return ascending ? 1 : -1;
      return 0;
    });
  }

  _pickCols(row) {
    if (!this._selectCols) return { ...row };
    const out = {};
    for (const c of this._selectCols) {
      // Handle relation syntax like "categories(name)" → skip (return as-is)
      if (c.includes("(")) continue;
      if (c === "*") return { ...row };
      out[c] = row[c];
    }
    return out;
  }

  async _exec() {
    const table = this._db[this._table];
    if (!table) return { data: null, error: { message: `Table ${this._table} not found` } };

    try {
      if (this._op === "select" || (!this._op && this._selectCols)) {
        let rows = this._applyFilters(table);
        rows = this._applyOrder(rows);
        if (this._limitN != null) rows = rows.slice(0, this._limitN);
        rows = rows.map(r => this._pickCols(r));
        if (this._single) return { data: rows[0] || null, error: null };
        return { data: rows, error: null, count: rows.length };
      }

      if (this._op === "insert") {
        const inserted = [];
        for (const row of this._payload) {
          const newRow = { ...row };
          if (newRow.id == null) {
            newRow.id = table.length ? Math.max(...table.map(r => r.id || 0)) + 1 : 1;
          }
          table.push(newRow);
          inserted.push(newRow);
        }
        if (this._selectAfterWrite) {
          const data = this._single ? inserted[0] : inserted;
          return { data, error: null };
        }
        return { data: inserted, error: null };
      }

      if (this._op === "update") {
        const matching = this._applyFilters(table);
        for (const row of matching) {
          Object.assign(row, this._payload);
        }
        if (this._selectAfterWrite) {
          const data = this._single ? matching[0] || null : matching;
          return { data, error: null };
        }
        return { data: null, error: null };
      }

      if (this._op === "delete") {
        const matching = this._applyFilters(table);
        const ids = new Set(matching.map(r => r.id));
        this._db[this._table] = table.filter(r => !ids.has(r.id));
        if (this._selectAfterWrite) {
          return { data: matching, error: null };
        }
        return { data: matching, error: null };
      }

      // Default: select all
      return { data: [...table], error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  then(resolve, reject) {
    return this._exec().then(resolve, reject);
  }
}

// ── Auth mock ──────────────────────────────────────────────

function createMockAuth() {
  let session = null;
  const listeners = new Set();

  return {
    getSession: async () => ({ data: { session } }),
    signInWithPassword: async ({ email, password }) => {
      if (email === "admin@bakery.local" && password === "admin123") {
        session = { user: { id: "admin-1", email } };
        listeners.forEach(fn => fn("SIGNED_IN", session));
        return { data: { session }, error: null };
      }
      return { data: { session: null }, error: { message: "Invalid login" } };
    },
    signOut: async () => {
      session = null;
      listeners.forEach(fn => fn("SIGNED_OUT", null));
      return { error: null };
    },
    onAuthStateChange: (cb) => {
      listeners.add(cb);
      return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
    },
  };
}

// ── Storage mock (uses blob URLs so images render in browser) ──

function createMockStorage() {
  const files = new Map();

  return {
    from: () => ({
      upload: async (filePath, file) => {
        // Store as blob URL so images actually render
        const url = URL.createObjectURL(file);
        files.set(filePath, url);
        console.log(`[MockStorage] Uploaded: ${filePath}`);
        return { error: null };
      },
      getPublicUrl: (filePath) => {
        // Return blob URL if uploaded, otherwise a placeholder path
        const url = files.get(filePath) || `/${filePath}`;
        return { data: { publicUrl: url } };
      },
    }),
  };
}

// ── Public API ─────────────────────────────────────────────

export function createBrowserMockClient() {
  // Deep-clone seed data so mutations don't leak between reloads
  const db = JSON.parse(JSON.stringify(SEED));

  const client = {
    from: (table) => new MockQuery(db, table),
    auth: createMockAuth(),
    storage: createMockStorage(),
  };

  console.log("[MockDB] Initialized with:", {
    categories: db.categories.length,
    products: db.products.length,
    site_metadata: db.site_metadata.length,
  });

  return client;
}
