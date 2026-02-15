/**
 * IndexedDB-backed mock for Supabase client.
 * Used by dev:local (Vite + MOCK_DB=true) for local development with persistent data.
 * 
 * Data persists across hot reloads and page refreshes while the dev server is running.
 * IndexedDB is cleared only when the browser tab is closed or cache is cleared.
 */

// ── Seed data ──────────────────────────────────────────────

// ── Helper: generate ISO date strings relative to now ──

const isoDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const pickupDateFromNow = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  // Skip Saturday
  if (d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

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
  orders: [
    { id: "order-1001", created_at: isoDaysAgo(1), pickup_date: pickupDateFromNow(1), pickup_time: "09:00", items: [{ title: "חלה קלועה", qty: 2, price: 18.5, lineTotal: 37 }, { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }], total: 79, customer: { name: "דוד כהן", phone: "0501234567" }, paid: 1, notes: "לקוח חוזר", user_notes: "לא לשכוח שקית", order_number: 1201, deleted: 0 },
    { id: "order-1002", created_at: isoDaysAgo(2), pickup_date: pickupDateFromNow(2), pickup_time: "12:30", items: [{ title: "חלה מתוקה", qty: 1, price: 22, lineTotal: 22 }], total: 22, customer: { name: "שירה לוי", phone: "0502345678" }, paid: 0, notes: "", user_notes: "", order_number: 1202, deleted: 0 },
    { id: "order-1003", created_at: isoDaysAgo(3), pickup_date: pickupDateFromNow(1), pickup_time: "06:00", items: [{ title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 }, { title: "עוגת גבינה", qty: 1, price: 48, lineTotal: 48 }], total: 66.5, customer: { name: "רואי גבר", phone: "0507890123" }, paid: 1, notes: "דחוף", user_notes: "", order_number: 1203, deleted: 0 },
    { id: "order-1004", created_at: isoDaysAgo(4), pickup_date: pickupDateFromNow(2), pickup_time: "06:30", items: [{ title: "חלה קלועה", qty: 2, price: 18.5, lineTotal: 37 }, { title: "חלה מתוקה", qty: 2, price: 22, lineTotal: 44 }], total: 81, customer: { name: "מרים גל", phone: "0501112222" }, paid: 1, notes: "", user_notes: "", order_number: 1204, deleted: 0 },
    { id: "order-1005", created_at: isoDaysAgo(5), pickup_date: pickupDateFromNow(3), pickup_time: "13:00", items: [{ title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }], total: 42, customer: { name: "ליאור סלע", phone: "0508901234" }, paid: 1, notes: "", user_notes: "ללא סוכר", order_number: 1205, deleted: 0 },
    { id: "order-1006", created_at: isoDaysAgo(7), pickup_date: pickupDateFromNow(3), pickup_time: "10:30", items: [{ title: "חלה מתוקה", qty: 2, price: 22, lineTotal: 44 }, { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }], total: 86, customer: { name: "שרית מור", phone: "0509012345" }, paid: 0, notes: "", user_notes: "", order_number: 1206, deleted: 0 },
    { id: "order-1007", created_at: isoDaysAgo(8), pickup_date: pickupDateFromNow(4), pickup_time: "14:00", items: [{ title: "עוגת גבינה", qty: 1, price: 48, lineTotal: 48 }, { title: "חלה קלועה", qty: 2, price: 18.5, lineTotal: 37 }], total: 85, customer: { name: "אבירם דגן", phone: "0500123456" }, paid: 1, notes: "לאירוע", user_notes: "", order_number: 1207, deleted: 0 },
    { id: "order-1008", created_at: isoDaysAgo(9), pickup_date: pickupDateFromNow(3), pickup_time: "12:15", items: [{ title: "עוגת גבינה", qty: 1, price: 48, lineTotal: 48 }], total: 48, customer: { name: "יוני דמי", phone: "0502223333" }, paid: 1, notes: "יום הולדת", user_notes: "", order_number: 1208, deleted: 0 },
    { id: "order-1009", created_at: isoDaysAgo(11), pickup_date: pickupDateFromNow(2), pickup_time: "08:30", items: [{ title: "עוגת גבינה", qty: 2, price: 48, lineTotal: 96 }], total: 96, customer: { name: "דנה צדק", phone: "0501112222" }, paid: 1, notes: "", user_notes: "", order_number: 1209, deleted: 0 },
    { id: "order-1010", created_at: isoDaysAgo(12), pickup_date: pickupDateFromNow(3), pickup_time: "16:00", items: [{ title: "עוגת שוקולד", qty: 2, price: 42, lineTotal: 84 }], total: 84, customer: { name: "נועם ברק", phone: "0503456789" }, paid: 1, notes: "", user_notes: "ללא אגוזים", order_number: 1210, deleted: 0 },
    { id: "order-1011", created_at: isoDaysAgo(13), pickup_date: pickupDateFromNow(4), pickup_time: "15:00", items: [{ title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }, { title: "עוגת גבינה", qty: 1, price: 48, lineTotal: 48 }, { title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 }], total: 108.5, customer: { name: "גיל רמי", phone: "0503334444" }, paid: 0, notes: "", user_notes: "", order_number: 1211, deleted: 0 },
    { id: "order-1012", created_at: isoDaysAgo(15), pickup_date: pickupDateFromNow(5), pickup_time: "11:30", items: [{ title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 }], total: 18.5, customer: { name: "אריק על", phone: "0502223333" }, paid: 0, notes: "", user_notes: "לא נוכח ביום", order_number: 1212, deleted: 0 },
    { id: "order-1013", created_at: isoDaysAgo(16), pickup_date: pickupDateFromNow(5), pickup_time: "10:20", items: [{ title: "חלה מתוקה", qty: 2, price: 22, lineTotal: 44 }], total: 44, customer: { name: "ברוך זופי", phone: "0504445555" }, paid: 1, notes: "", user_notes: "", order_number: 1213, deleted: 0 },
    { id: "order-1014", created_at: isoDaysAgo(18), pickup_date: pickupDateFromNow(6), pickup_time: "15:45", items: [{ title: "עוגת שוקולד", qty: 3, price: 42, lineTotal: 126 }, { title: "עוגת גבינה", qty: 1, price: 48, lineTotal: 48 }], total: 174, customer: { name: "רני גרין", phone: "0503334444" }, paid: 1, notes: "הזמנה גדולה", user_notes: "אחסון במקרר", order_number: 1214, deleted: 0 },
    { id: "order-1015", created_at: isoDaysAgo(19), pickup_date: pickupDateFromNow(6), pickup_time: "08:45", items: [{ title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 }, { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }], total: 60.5, customer: { name: "שוש נוואל", phone: "0505556666" }, paid: 1, notes: "", user_notes: "אריזה מיוחדת", order_number: 1215, deleted: 0 },
    { id: "order-1016", created_at: isoDaysAgo(20), pickup_date: pickupDateFromNow(4), pickup_time: "08:15", items: [{ title: "חלה קלועה", qty: 3, price: 18.5, lineTotal: 55.5 }], total: 55.5, customer: { name: "מורן יעקב", phone: "0504567890" }, paid: 0, notes: "", user_notes: "", order_number: 1216, deleted: 0 },
    { id: "order-1017", created_at: isoDaysAgo(21), pickup_date: pickupDateFromNow(1), pickup_time: "12:00", items: [{ title: "חלה מתוקה", qty: 3, price: 22, lineTotal: 66 }], total: 66, customer: { name: "רחל כץ", phone: "0504445555" }, paid: 1, notes: "", user_notes: "", order_number: 1217, deleted: 0 },
    { id: "order-1018", created_at: isoDaysAgo(23), pickup_date: pickupDateFromNow(1), pickup_time: "13:15", items: [{ title: "עוגת גבינה", qty: 2, price: 48, lineTotal: 96 }], total: 96, customer: { name: "עפרה דין", phone: "0506667777" }, paid: 0, notes: "", user_notes: "", order_number: 1218, deleted: 0 },
    { id: "order-1019", created_at: isoDaysAgo(25), pickup_date: pickupDateFromNow(3), pickup_time: "09:15", items: [{ title: "חלה קלועה", qty: 2, price: 18.5, lineTotal: 37 }, { title: "עוגת גבינה", qty: 1, price: 48, lineTotal: 48 }, { title: "חלה מתוקה", qty: 2, price: 22, lineTotal: 44 }], total: 129, customer: { name: "גדליה ברון", phone: "0505556666" }, paid: 0, notes: "", user_notes: "", order_number: 1219, deleted: 0 },
    { id: "order-1020", created_at: isoDaysAgo(26), pickup_date: pickupDateFromNow(3), pickup_time: "14:45", items: [{ title: "עוגת גבינה", qty: 2, price: 48, lineTotal: 96 }, { title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 }], total: 114.5, customer: { name: "חיים רדין", phone: "0507778888" }, paid: 1, notes: "אירוע חברה", user_notes: "", order_number: 1220, deleted: 0 },
    { id: "order-1021", created_at: isoDaysAgo(28), pickup_date: pickupDateFromNow(4), pickup_time: "10:00", items: [{ title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }], total: 42, customer: { name: "אנה יואל", phone: "0506667777" }, paid: 1, notes: "", user_notes: "", order_number: 1221, deleted: 0 },
    { id: "order-1022", created_at: isoDaysAgo(29), pickup_date: pickupDateFromNow(4), pickup_time: "09:30", items: [{ title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }], total: 42, customer: { name: "שלוא דוד", phone: "0508889999" }, paid: 0, notes: "", user_notes: "", order_number: 1222, deleted: 1 },
    { id: "order-1023", created_at: isoDaysAgo(30), pickup_date: pickupDateFromNow(5), pickup_time: "13:30", items: [{ title: "חלה מתוקה", qty: 1, price: 22, lineTotal: 22 }, { title: "עוגת גבינה", qty: 1, price: 48, lineTotal: 48 }], total: 70, customer: { name: "משה בן", phone: "0507778888" }, paid: 0, notes: "הערה של לקוח", user_notes: "", order_number: 1223, deleted: 0 },
    { id: "order-1024", created_at: isoDaysAgo(32), pickup_date: pickupDateFromNow(5), pickup_time: "15:30", items: [{ title: "חלה מתוקה", qty: 1, price: 22, lineTotal: 22 }, { title: "עוגת גבינה", qty: 1, price: 48, lineTotal: 48 }, { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }], total: 112, customer: { name: "אסתר רבי", phone: "0509990000" }, paid: 1, notes: "", user_notes: "", order_number: 1224, deleted: 0 },
    { id: "order-1025", created_at: isoDaysAgo(33), pickup_date: pickupDateFromNow(5), pickup_time: "11:00", items: [{ title: "עוגת גבינה", qty: 1, price: 48, lineTotal: 48 }], total: 48, customer: { name: "הילה צור", phone: "0505678901" }, paid: 1, notes: "", user_notes: "", order_number: 1225, deleted: 0 },
    { id: "order-1026", created_at: isoDaysAgo(35), pickup_date: pickupDateFromNow(2), pickup_time: "07:00", items: [{ title: "חלה קלועה", qty: 4, price: 18.5, lineTotal: 74 }], total: 74, customer: { name: "יהודה פז", phone: "0508889999" }, paid: 1, notes: "", user_notes: "", order_number: 1226, deleted: 0 },
    { id: "order-1027", created_at: isoDaysAgo(37), pickup_date: pickupDateFromNow(2), pickup_time: "07:30", items: [{ title: "חלה קלועה", qty: 3, price: 18.5, lineTotal: 55.5 }, { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }], total: 97.5, customer: { name: "טוליו רציו", phone: "0500001111" }, paid: 1, notes: "הזמנת קבע", user_notes: "מחלק זיכרון", order_number: 1227, deleted: 0 },
    { id: "order-1028", created_at: isoDaysAgo(38), pickup_date: pickupDateFromNow(6), pickup_time: "11:45", items: [{ title: "עוגת שוקולד", qty: 2, price: 42, lineTotal: 84 }, { title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 }], total: 102.5, customer: { name: "רות קנר", phone: "0509990000" }, paid: 1, notes: "סדר עסקי", user_notes: "ללא שמן", order_number: 1228, deleted: 0 },
    { id: "order-1029", created_at: isoDaysAgo(40), pickup_date: pickupDateFromNow(6), pickup_time: "10:45", items: [{ title: "עוגת גבינה", qty: 2, price: 48, lineTotal: 96 }], total: 96, customer: { name: "עידן לוי", phone: "0506789012" }, paid: 0, notes: "", user_notes: "", order_number: 1229, deleted: 1 },
    { id: "order-1030", created_at: isoDaysAgo(42), pickup_date: pickupDateFromNow(1), pickup_time: "14:30", items: [{ title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }], total: 42, customer: { name: "שלמה אביב", phone: "0500001111" }, paid: 0, notes: "", user_notes: "", order_number: 1230, deleted: 0 },
  ],
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
const DB_VERSION = 5; // Bumped to force re-seed with 30 orders

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
