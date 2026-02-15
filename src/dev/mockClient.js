/**
 * IndexedDB-backed mock for Supabase client.
 * Used by dev:local (Vite + MOCK_DB=true) for local development with persistent data.
 * 
 * Data persists across hot reloads and page refreshes while the dev server is running.
 * IndexedDB is cleared only when the browser tab is closed or cache is cleared.
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
    { id: 1, user_id: "admin-1", role: "admin" },
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

const DB_NAME = "bakery-mock-db";
const DB_VERSION = 4; // Incremented to force re-seed after adding pickup_date/pickup_time

// ── IndexedDB Manager ──────────────────────────────────────

class IndexedDBManager {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("[MockDB] IndexedDB open error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("[MockDB] IndexedDB initialized");
        // Log seed data for debugging
        this.logTableCounts();
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const tx = event.target.transaction;
        // Create object stores (tables) if they don't exist
        const tables = Object.keys(SEED);
        for (const table of tables) {
          if (!db.objectStoreNames.contains(table)) {
            db.createObjectStore(table, { keyPath: "id" });
          }
        }
        // Seed data using the upgrade transaction
        for (const table of tables) {
          const store = tx.objectStore(table);
          const seedData = SEED[table] || [];
          for (const item of seedData) {
            store.add(item);
          }
        }
      };
    });
  }

  seedTable(db, tableName) {
    const tx = db.transaction([tableName], "readwrite");
    const store = tx.objectStore(tableName);
    const seedData = SEED[tableName] || [];
    for (const item of seedData) {
      store.add(item);
    }
  }

  async getAllFromTable(tableName) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([tableName], "readonly");
      const store = tx.objectStore(tableName);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async getFromTable(tableName, key) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([tableName], "readonly");
      const store = tx.objectStore(tableName);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async addToTable(tableName, item) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([tableName], "readwrite");
      const store = tx.objectStore(tableName);
      const request = store.add(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(item);
    });
  }

  async putToTable(tableName, item) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([tableName], "readwrite");
      const store = tx.objectStore(tableName);
      const request = store.put(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(item);
    });
  }

  async deleteFromTable(tableName, key) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([tableName], "readwrite");
      const store = tx.objectStore(tableName);
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async clearTable(tableName) {
    await this.initPromise;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([tableName], "readwrite");
      const store = tx.objectStore(tableName);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async logTableCounts() {
    const tables = Object.keys(SEED);
    for (const table of tables) {
      const rows = await this.getAllFromTable(table);
      console.log(`[MockDB] ${table}: ${rows.length} rows`);
    }
  }
}

const idb = new IndexedDBManager();

// ── Query builder (mimics Supabase's chained API) ──────────

class MockQuery {
  constructor(tableName) {
    this._table = tableName;
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

  insert(rows) {
    this._op = "insert";
    this._payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(vals) {
    this._op = "update";
    this._payload = vals;
    return this;
  }

  delete() {
    this._op = "delete";
    return this;
  }

  eq(col, val) {
    this._filters.push({ col, val });
    return this;
  }

  order(col, { ascending = true } = {}) {
    this._orderBy = { col, ascending };
    return this;
  }

  limit(n) {
    this._limitN = n;
    return this;
  }

  single() {
    this._single = true;
    return this;
  }

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
    try {
      if (this._op === "select" || (!this._op && this._selectCols)) {
        let rows = await idb.getAllFromTable(this._table);
        if (!rows) return { data: null, error: { message: `Table ${this._table} not found` } };
        rows = this._applyFilters(rows);
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
            // Generate a simple numeric or UUID id
            newRow.id = row.id || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          }
          await idb.addToTable(this._table, newRow);
          inserted.push(newRow);
        }
        if (this._selectAfterWrite) {
          const data = this._single ? inserted[0] : inserted;
          return { data, error: null };
        }
        return { data: inserted, error: null };
      }

      if (this._op === "update") {
        const allRows = await idb.getAllFromTable(this._table);
        const matching = this._applyFilters(allRows);
        for (const row of matching) {
          const updated = { ...row, ...this._payload };
          await idb.putToTable(this._table, updated);
        }
        if (this._selectAfterWrite) {
          const data = this._single ? matching[0] || null : matching;
          return { data, error: null };
        }
        return { data: null, error: null };
      }

      if (this._op === "delete") {
        const allRows = await idb.getAllFromTable(this._table);
        const matching = this._applyFilters(allRows);
        for (const row of matching) {
          await idb.deleteFromTable(this._table, row.id);
        }
        if (this._selectAfterWrite) {
          return { data: matching, error: null };
        }
        return { data: matching, error: null };
      }

      // Default: select all
      const rows = await idb.getAllFromTable(this._table);
      return { data: rows || [], error: null };
    } catch (err) {
      console.error(`[MockDB] Error in ${this._op} on ${this._table}:`, err);
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
  const client = {
    from: (table) => new MockQuery(table),
    auth: createMockAuth(),
    storage: createMockStorage(),
  };

  console.log("[MockDB] Initialized with IndexedDB persistence (data survives hot reload)");
  console.log("[MockDB] To clear local data, run: clearMockDB()");

  // Expose reset function for debugging
  if (typeof window !== "undefined") {
    window.clearMockDB = async () => {
      const result = await indexedDB.deleteDatabase(DB_NAME);
      console.log("[MockDB] Cleared IndexedDB. Refreshing page...");
      setTimeout(() => location.reload(), 500);
    };
  }

  return client;
}
