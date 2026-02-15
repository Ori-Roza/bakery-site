import initSqlJs from "sql.js";

const SCHEMA_SQL = `
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  image_url TEXT
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  title TEXT,
  price NUMERIC,
  discount_percentage NUMERIC DEFAULT 0,
  image TEXT,
  in_stock INTEGER,
  category_id INTEGER
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  pickup_date TEXT,
  pickup_time TEXT,
  items TEXT,
  total NUMERIC,
  customer TEXT,
  paid INTEGER DEFAULT 0,
  notes TEXT,
  user_notes TEXT,
  order_number INTEGER,
  deleted INTEGER DEFAULT 0
);

CREATE TABLE order_items (
  order_id TEXT,
  product_id INTEGER,
  qty INTEGER DEFAULT 1
);

CREATE TABLE profiles (
  user_id TEXT PRIMARY KEY,
  role TEXT
);

CREATE TABLE site_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  about_section TEXT,
  orders_accepting INTEGER DEFAULT 1,
  logo_url TEXT,
  bakery_telephone TEXT,
  store_phone TEXT,
  contact_whatsapp TEXT,
  contact_email TEXT,
  contact_address TEXT,
  hero_badge TEXT,
  hero_title TEXT,
  hero_description TEXT,
  hero_chips TEXT,
  hero_image_url TEXT,
  header_title TEXT
);

CREATE TABLE featured_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_metadata_id INTEGER,
  product_id INTEGER
);
`;

const defaultSeed = (db) => {
  db.prepare("INSERT INTO categories (id, name, image_url) VALUES (?, ?, ?)").run(
    1,
    "חלה",
    "assets/all_categories.png"
  );
  db.prepare("INSERT INTO categories (id, name, image_url) VALUES (?, ?, ?)").run(
    2,
    "עוגות",
    "assets/all_categories.png"
  );
  db.prepare(
    "INSERT INTO products (id, title, price, discount_percentage, image, in_stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(101, "חלה קלועה", 18.5, 0, "assets/wheat.png", 1, 1);
  db.prepare(
    "INSERT INTO products (id, title, price, discount_percentage, image, in_stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(102, "עוגת שוקולד", 42, 10, "assets/wheat.png", 1, 2);
  db.prepare(
    "INSERT INTO site_metadata (id, about_section, orders_accepting, contact_email) VALUES (?, ?, ?, ?)"
  ).run(1, "טקסט אודות", 1, "test@example.com");
};

const serializeValue = (value) => {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return value;
};

const serializeRow = (row) => {
  const result = {};
  Object.entries(row).forEach(([key, value]) => {
    result[key] = serializeValue(value);
  });
  return result;
};

const deserializeRow = (table, row) => {
  if (!row) return row;
  const result = { ...row };
  if (table === "orders") {
    if (typeof result.items === "string") result.items = JSON.parse(result.items);
    if (typeof result.customer === "string") result.customer = JSON.parse(result.customer);
    result.paid = Boolean(result.paid);
    result.deleted = Boolean(result.deleted);
  }
  if (table === "site_metadata") {
    if (typeof result.hero_chips === "string") {
      try {
        result.hero_chips = JSON.parse(result.hero_chips);
      } catch {
        result.hero_chips = [];
      }
    }
    result.orders_accepting = result.orders_accepting === null
      ? null
      : Boolean(result.orders_accepting);
  }
  if (table === "products") {
    result.in_stock = Boolean(result.in_stock);
  }
  return result;
};

class SQLiteQuery {
  constructor(db, table) {
    this.db = db;
    this.table = table;
    this.filters = [];
    this.orderBy = null;
    this.limitCount = null;
    this.operation = null;
    this.payload = null;
    this.selectColumns = "*";
    this.selectAfterWrite = false;
    this.singleRow = false;
  }

  select(columns = "*") {
    if (this.operation && this.operation !== "select") {
      this.selectAfterWrite = true;
    } else {
      this.operation = "select";
    }
    this.selectColumns = columns;
    return this;
  }

  insert(rows) {
    this.operation = "insert";
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(values) {
    this.operation = "update";
    this.payload = values;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, value });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this.orderBy = { column, ascending };
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleRow = true;
    return this;
  }

  async execute() {
    try {
      if (this.operation === "insert") {
        const rows = this.payload.map(serializeRow);
        
        // Auto-generate order_number for orders table (simulate database trigger)
        if (this.table === "orders") {
          rows.forEach((row) => {
            if (row.order_number === null || row.order_number === undefined) {
              // Get the next order number by finding max + 1
              const maxStmt = this.db.prepare("SELECT COALESCE(MAX(order_number), 0) as max_num FROM orders");
              const result = maxStmt.get();
              row.order_number = (result.max_num || 0) + 1;
            }
          });
        }
        
        const keys = Object.keys(rows[0] || {});
        const placeholders = keys.map(() => "?").join(", ");
        rows.forEach((row) => {
          const stmt = this.db.prepare(
            `INSERT INTO ${this.table} (${keys.join(", ")}) VALUES (${placeholders})`
          );
          stmt.run(keys.map((key) => row[key]));
        });
        return { data: rows.map((row) => deserializeRow(this.table, row)), error: null };
      }

      if (this.operation === "update") {
        const payload = serializeRow(this.payload || {});
        const keys = Object.keys(payload);
        const setSql = keys.map((key) => `${key} = ?`).join(", ");
        const { whereSql, whereValues } = this.buildWhere();
        const stmt = this.db.prepare(
          `UPDATE ${this.table} SET ${setSql}${whereSql}`
        );
        stmt.run([...keys.map((key) => payload[key]), ...whereValues]);

        if (this.selectAfterWrite) {
          return this.runSelect();
        }
        return { data: null, error: null };
      }

      if (this.operation === "delete") {
        let selected = [];
        if (this.selectAfterWrite) {
          const result = await this.runSelect();
          selected = result.data || [];
        }
        const { whereSql, whereValues } = this.buildWhere();
        const stmt = this.db.prepare(`DELETE FROM ${this.table}${whereSql}`);
        stmt.run(whereValues);
        return { data: selected, error: null };
      }

      return this.runSelect();
    } catch (error) {
      return { data: null, error };
    }
  }

  runSelect() {
    const { whereSql, whereValues } = this.buildWhere();
    const orderSql = this.orderBy
      ? ` ORDER BY ${this.orderBy.column} ${
          this.orderBy.ascending ? "ASC" : "DESC"
        }`
      : "";
    const limitSql = this.limitCount ? ` LIMIT ${this.limitCount}` : "";
    const sql = `SELECT ${this.selectColumns} FROM ${this.table}${whereSql}${orderSql}${limitSql}`;
    const stmt = this.db.prepare(sql);
    const rows = stmt.all(whereValues).map((row) => deserializeRow(this.table, row));
    const data = this.singleRow ? rows[0] || null : rows;
    return { data, error: null, count: Array.isArray(rows) ? rows.length : 0 };
  }

  buildWhere() {
    if (!this.filters.length) {
      return { whereSql: "", whereValues: [] };
    }
    const clauses = this.filters.map((filter) => `${filter.column} = ?`);
    const values = this.filters.map((filter) => serializeValue(filter.value));
    return { whereSql: ` WHERE ${clauses.join(" AND ")}`, whereValues: values };
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

const createAuthClient = (users = [], initialSession = null) => {
  const usersByEmail = new Map(users.map((u) => [u.email, u]));
  let session = initialSession;
  const listeners = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener("TOKEN_REFRESHED", session));
  };

  return {
    signInWithPassword: async ({ email, password }) => {
      const user = usersByEmail.get(email);
      if (!user || user.password !== password) {
        return { data: { session: null }, error: { message: "Invalid login" } };
      }
      session = { user: { id: user.id, email: user.email } };
      notify();
      return { data: { session }, error: null };
    },
    getSession: async () => ({ data: { session } }),
    signOut: async () => {
      session = null;
      notify();
      return { error: null };
    },
    onAuthStateChange: (callback) => {
      listeners.add(callback);
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    },
  };
};

const createStorageClient = () => ({
  from: () => ({
    upload: async () => ({ error: null }),
    getPublicUrl: (filePath) => ({ data: { publicUrl: `https://storage.test/${filePath}` } }),
  }),
});

const createSqlJsAdapter = (db) => ({
  exec: (sql) => db.exec(sql),
  prepare: (sql) => {
    const stmt = db.prepare(sql);
    const normalizeParams = (args) => {
      if (args.length === 1 && Array.isArray(args[0])) {
        return args[0];
      }
      return Array.from(args);
    };
    return {
      run: (...args) => {
        stmt.bind(normalizeParams(args));
        while (stmt.step()) {}
        stmt.free();
      },
      get: (...args) => {
        stmt.bind(normalizeParams(args));
        const row = stmt.step() ? stmt.getAsObject() : undefined;
        stmt.free();
        return row;
      },
      all: (...args) => {
        stmt.bind(normalizeParams(args));
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      },
    };
  },
});

export const createSqliteSupabaseClient = async ({
  seed = true,
  seedFn = null,
  users = [],
  initialSession = null,
} = {}) => {
  const SQL = await initSqlJs();
  const rawDb = new SQL.Database();
  rawDb.exec(SCHEMA_SQL);
  const db = createSqlJsAdapter(rawDb);
  if (seedFn) {
    seedFn(db);
  } else if (seed) {
    defaultSeed(db);
  }

  const client = {
    __db: db,
    auth: createAuthClient(users, initialSession),
    storage: createStorageClient(),
    from: (table) => new SQLiteQuery(db, table),
  };

  return client;
};
