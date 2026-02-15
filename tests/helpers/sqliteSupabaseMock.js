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
  const now = Date.now();
  const dayMs = 1000 * 60 * 60 * 24;
  const formatDate = (date) => date.toISOString().split("T")[0];
  const isoDaysAgo = (days) => new Date(now - days * dayMs).toISOString();
  const pickupDateFromNow = (days) => formatDate(new Date(now + days * dayMs));

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

  const orders = [
    {
      id: "order-1001",
      createdAt: isoDaysAgo(2),
      pickupDate: pickupDateFromNow(1),
      pickupTime: "09:00",
      items: [
        { title: "חלה קלועה", qty: 2, price: 18.5, lineTotal: 37 },
        { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 },
      ],
      total: 79,
      customer: { name: "דוד כהן", phone: "0501234567" },
      paid: 1,
      notes: "לקוח חוזר",
      userNotes: "לא לשכוח שקית",
      orderNumber: 1201,
      deleted: 0,
    },
    {
      id: "order-1002",
      createdAt: isoDaysAgo(5),
      pickupDate: pickupDateFromNow(2),
      pickupTime: "12:30",
      items: [{ title: "חלה שחורה", qty: 1, price: 22, lineTotal: 22 }],
      total: 22,
      customer: { name: "שירה לוי", phone: "0502345678" },
      paid: 0,
      notes: "",
      userNotes: "",
      orderNumber: 1202,
      deleted: 0,
    },
    {
      id: "order-1003",
      createdAt: isoDaysAgo(12),
      pickupDate: pickupDateFromNow(3),
      pickupTime: "16:00",
      items: [{ title: "עוגת שוקולד", qty: 2, price: 42, lineTotal: 84 }],
      total: 84,
      customer: { name: "נועם ברק", phone: "0503456789" },
      paid: 1,
      notes: "",
      userNotes: "ללא אגוזים",
      orderNumber: 1203,
      deleted: 0,
    },
    {
      id: "order-1004",
      createdAt: isoDaysAgo(20),
      pickupDate: pickupDateFromNow(4),
      pickupTime: "08:15",
      items: [{ title: "חלה קלועה", qty: 3, price: 18.5, lineTotal: 55.5 }],
      total: 55.5,
      customer: { name: "מורן יעקב", phone: "0504567890" },
      paid: 0,
      notes: "",
      userNotes: "",
      orderNumber: 1204,
      deleted: 0,
    },
    {
      id: "order-1005",
      createdAt: isoDaysAgo(33),
      pickupDate: pickupDateFromNow(5),
      pickupTime: "11:00",
      items: [{ title: "עוגת וניל", qty: 1, price: 38, lineTotal: 38 }],
      total: 38,
      customer: { name: "הילה צור", phone: "0505678901" },
      paid: 1,
      notes: "",
      userNotes: "",
      orderNumber: 1205,
      deleted: 0,
    },
    {
      id: "order-1006",
      createdAt: isoDaysAgo(40),
      pickupDate: pickupDateFromNow(6),
      pickupTime: "10:45",
      items: [{ title: "ממתקי שוקולד", qty: 4, price: 12, lineTotal: 48 }],
      total: 48,
      customer: { name: "עידן לוי", phone: "0506789012" },
      paid: 0,
      notes: "",
      userNotes: "",
      orderNumber: 1206,
      deleted: 1,
    },
    {
      id: "order-1007",
      createdAt: isoDaysAgo(1),
      pickupDate: pickupDateFromNow(1),
      pickupTime: "06:00",
      items: [
        { title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 },
        { title: "עוגת וניל", qty: 1, price: 38, lineTotal: 38 },
      ],
      total: 56.5,
      customer: { name: "רואי גבר", phone: "0507890123" },
      paid: 1,
      notes: "דחוף",
      userNotes: "",
      orderNumber: 1207,
      deleted: 0,
    },
    {
      id: "order-1008",
      createdAt: isoDaysAgo(3),
      pickupDate: pickupDateFromNow(2),
      pickupTime: "13:00",
      items: [{ title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }],
      total: 42,
      customer: { name: "ליאור סלע", phone: "0508901234" },
      paid: 1,
      notes: "",
      userNotes: "ללא סוכר",
      orderNumber: 1208,
      deleted: 0,
    },
    {
      id: "order-1009",
      createdAt: isoDaysAgo(7),
      pickupDate: pickupDateFromNow(3),
      pickupTime: "10:30",
      items: [
        { title: "חלה שחורה", qty: 2, price: 22, lineTotal: 44 },
        { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 },
      ],
      total: 86,
      customer: { name: "שרית מור", phone: "0509012345" },
      paid: 0,
      notes: "",
      userNotes: "",
      orderNumber: 1209,
      deleted: 0,
    },
    {
      id: "order-1010",
      createdAt: isoDaysAgo(8),
      pickupDate: pickupDateFromNow(4),
      pickupTime: "14:00",
      items: [
        { title: "ממתקי שוקולד", qty: 2, price: 12, lineTotal: 24 },
        { title: "חלה קלועה", qty: 2, price: 18.5, lineTotal: 37 },
      ],
      total: 61,
      customer: { name: "אבירם דגן", phone: "0500123456" },
      paid: 1,
      notes: "לאירוע",
      userNotes: "",
      orderNumber: 1210,
      deleted: 0,
    },
    {
      id: "order-1011",
      createdAt: isoDaysAgo(11),
      pickupDate: pickupDateFromNow(2),
      pickupTime: "08:30",
      items: [{ title: "עוגת וניל", qty: 2, price: 38, lineTotal: 76 }],
      total: 76,
      customer: { name: "דנה צדק", phone: "0501112222" },
      paid: 1,
      notes: "",
      userNotes: "",
      orderNumber: 1211,
      deleted: 0,
    },
    {
      id: "order-1012",
      createdAt: isoDaysAgo(15),
      pickupDate: pickupDateFromNow(5),
      pickupTime: "11:30",
      items: [{ title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 }],
      total: 18.5,
      customer: { name: "אריק על", phone: "0502223333" },
      paid: 0,
      notes: "",
      userNotes: "לא נוכח ביום",
      orderNumber: 1212,
      deleted: 0,
    },
    {
      id: "order-1013",
      createdAt: isoDaysAgo(18),
      pickupDate: pickupDateFromNow(6),
      pickupTime: "15:45",
      items: [
        { title: "עוגת שוקולד", qty: 3, price: 42, lineTotal: 126 },
        { title: "ממתקי שוקולד", qty: 1, price: 12, lineTotal: 12 },
      ],
      total: 138,
      customer: { name: "רני גרין", phone: "0503334444" },
      paid: 1,
      notes: "הזמנה גדולה",
      userNotes: "אחסון במקרר",
      orderNumber: 1213,
      deleted: 0,
    },
    {
      id: "order-1014",
      createdAt: isoDaysAgo(21),
      pickupDate: pickupDateFromNow(1),
      pickupTime: "12:00",
      items: [{ title: "חלה שחורה", qty: 3, price: 22, lineTotal: 66 }],
      total: 66,
      customer: { name: "רחל כץ", phone: "0504445555" },
      paid: 1,
      notes: "",
      userNotes: "",
      orderNumber: 1214,
      deleted: 0,
    },
    {
      id: "order-1015",
      createdAt: isoDaysAgo(25),
      pickupDate: pickupDateFromNow(3),
      pickupTime: "09:15",
      items: [
        { title: "חלה קלועה", qty: 2, price: 18.5, lineTotal: 37 },
        { title: "עוגת וניל", qty: 1, price: 38, lineTotal: 38 },
        { title: "ממתקי שוקולד", qty: 2, price: 12, lineTotal: 24 },
      ],
      total: 99,
      customer: { name: "גדליה ברון", phone: "0505556666" },
      paid: 0,
      notes: "",
      userNotes: "",
      orderNumber: 1215,
      deleted: 0,
    },
    {
      id: "order-1016",
      createdAt: isoDaysAgo(28),
      pickupDate: pickupDateFromNow(4),
      pickupTime: "10:00",
      items: [{ title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }],
      total: 42,
      customer: { name: "אנה יואל", phone: "0506667777" },
      paid: 1,
      notes: "",
      userNotes: "",
      orderNumber: 1216,
      deleted: 0,
    },
    {
      id: "order-1017",
      createdAt: isoDaysAgo(30),
      pickupDate: pickupDateFromNow(5),
      pickupTime: "13:30",
      items: [
        { title: "חלה שחורה", qty: 1, price: 22, lineTotal: 22 },
        { title: "עוגת וניל", qty: 1, price: 38, lineTotal: 38 },
      ],
      total: 60,
      customer: { name: "משה בן", phone: "0507778888" },
      paid: 0,
      notes: "הערה של לקוח",
      userNotes: "",
      orderNumber: 1217,
      deleted: 0,
    },
    {
      id: "order-1018",
      createdAt: isoDaysAgo(35),
      pickupDate: pickupDateFromNow(2),
      pickupTime: "07:00",
      items: [{ title: "חלה קלועה", qty: 4, price: 18.5, lineTotal: 74 }],
      total: 74,
      customer: { name: "יהודה פז", phone: "0508889999" },
      paid: 1,
      notes: "",
      userNotes: "",
      orderNumber: 1218,
      deleted: 0,
    },
    {
      id: "order-1019",
      createdAt: isoDaysAgo(38),
      pickupDate: pickupDateFromNow(6),
      pickupTime: "11:45",
      items: [
        { title: "עוגת שוקולד", qty: 2, price: 42, lineTotal: 84 },
        { title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 },
      ],
      total: 102.5,
      customer: { name: "רות קנר", phone: "0509990000" },
      paid: 1,
      notes: "סדר עסקי",
      userNotes: "ללא שמן",
      orderNumber: 1219,
      deleted: 0,
    },
    {
      id: "order-1020",
      createdAt: isoDaysAgo(42),
      pickupDate: pickupDateFromNow(1),
      pickupTime: "14:30",
      items: [{ title: "ממתקי שוקולד", qty: 3, price: 12, lineTotal: 36 }],
      total: 36,
      customer: { name: "שלמה אביב", phone: "0500001111" },
      paid: 0,
      notes: "",
      userNotes: "",
      orderNumber: 1220,
      deleted: 0,
    },
    {
      id: "order-1021",
      createdAt: isoDaysAgo(4),
      pickupDate: pickupDateFromNow(2),
      pickupTime: "06:30",
      items: [
        { title: "חלה קלועה", qty: 2, price: 18.5, lineTotal: 37 },
        { title: "חלה שחורה", qty: 2, price: 22, lineTotal: 44 },
      ],
      total: 81,
      customer: { name: "מרים גל", phone: "0501112222" },
      paid: 1,
      notes: "",
      userNotes: "",
      orderNumber: 1221,
      deleted: 0,
    },
    {
      id: "order-1022",
      createdAt: isoDaysAgo(9),
      pickupDate: pickupDateFromNow(3),
      pickupTime: "12:15",
      items: [{ title: "עוגת וניל", qty: 1, price: 38, lineTotal: 38 }],
      total: 38,
      customer: { name: "יוני דמי", phone: "0502223333" },
      paid: 1,
      notes: "יום הולדת",
      userNotes: "",
      orderNumber: 1222,
      deleted: 0,
    },
    {
      id: "order-1023",
      createdAt: isoDaysAgo(13),
      pickupDate: pickupDateFromNow(4),
      pickupTime: "15:00",
      items: [
        { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 },
        { title: "ממתקי שוקולד", qty: 2, price: 12, lineTotal: 24 },
        { title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 },
      ],
      total: 84.5,
      customer: { name: "גיל רמי", phone: "0503334444" },
      paid: 0,
      notes: "",
      userNotes: "",
      orderNumber: 1223,
      deleted: 0,
    },
    {
      id: "order-1024",
      createdAt: isoDaysAgo(16),
      pickupDate: pickupDateFromNow(5),
      pickupTime: "10:20",
      items: [{ title: "חלה שחורה", qty: 2, price: 22, lineTotal: 44 }],
      total: 44,
      customer: { name: "ברוך זופי", phone: "0504445555" },
      paid: 1,
      notes: "",
      userNotes: "",
      orderNumber: 1224,
      deleted: 0,
    },
    {
      id: "order-1025",
      createdAt: isoDaysAgo(19),
      pickupDate: pickupDateFromNow(6),
      pickupTime: "08:45",
      items: [
        { title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 },
        { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 },
      ],
      total: 60.5,
      customer: { name: "שוש נוואל", phone: "0505556666" },
      paid: 1,
      notes: "",
      userNotes: "אריזה מיוחדת",
      orderNumber: 1225,
      deleted: 0,
    },
    {
      id: "order-1026",
      createdAt: isoDaysAgo(23),
      pickupDate: pickupDateFromNow(1),
      pickupTime: "13:15",
      items: [{ title: "ממתקי שוקולד", qty: 5, price: 12, lineTotal: 60 }],
      total: 60,
      customer: { name: "עפרה דין", phone: "0506667777" },
      paid: 0,
      notes: "",
      userNotes: "",
      orderNumber: 1226,
      deleted: 0,
    },
    {
      id: "order-1027",
      createdAt: isoDaysAgo(26),
      pickupDate: pickupDateFromNow(3),
      pickupTime: "14:45",
      items: [
        { title: "עוגת וניל", qty: 2, price: 38, lineTotal: 76 },
        { title: "חלה קלועה", qty: 1, price: 18.5, lineTotal: 18.5 },
      ],
      total: 94.5,
      customer: { name: "חיים רדין", phone: "0507778888" },
      paid: 1,
      notes: "אירוע חברה",
      userNotes: "",
      orderNumber: 1227,
      deleted: 0,
    },
    {
      id: "order-1028",
      createdAt: isoDaysAgo(29),
      pickupDate: pickupDateFromNow(4),
      pickupTime: "09:30",
      items: [{ title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 }],
      total: 42,
      customer: { name: "שלוא דוד", phone: "0508889999" },
      paid: 0,
      notes: "",
      userNotes: "",
      orderNumber: 1228,
      deleted: 1,
    },
    {
      id: "order-1029",
      createdAt: isoDaysAgo(32),
      pickupDate: pickupDateFromNow(5),
      pickupTime: "15:30",
      items: [
        { title: "חלה שחורה", qty: 1, price: 22, lineTotal: 22 },
        { title: "עוגת וניל", qty: 1, price: 38, lineTotal: 38 },
        { title: "ממתקי שוקולד", qty: 1, price: 12, lineTotal: 12 },
      ],
      total: 72,
      customer: { name: "אסתר רבי", phone: "0509990000" },
      paid: 1,
      notes: "",
      userNotes: "",
      orderNumber: 1229,
      deleted: 0,
    },
    {
      id: "order-1030",
      createdAt: isoDaysAgo(37),
      pickupDate: pickupDateFromNow(2),
      pickupTime: "07:30",
      items: [
        { title: "חלה קלועה", qty: 3, price: 18.5, lineTotal: 55.5 },
        { title: "עוגת שוקולד", qty: 1, price: 42, lineTotal: 42 },
      ],
      total: 97.5,
      customer: { name: "טוליו רציו", phone: "0500001111" },
      paid: 1,
      notes: "הזמנת קבע",
      userNotes: "מחלק זיכרון",
      orderNumber: 1230,
      deleted: 0,
    },
  ];

  orders.forEach((order) => {
    db.prepare(
      "INSERT INTO orders (id, created_at, pickup_date, pickup_time, items, total, customer, paid, notes, user_notes, order_number, deleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(
      order.id,
      order.createdAt,
      order.pickupDate,
      order.pickupTime,
      JSON.stringify(order.items),
      order.total,
      JSON.stringify(order.customer),
      order.paid,
      order.notes,
      order.userNotes,
      order.orderNumber,
      order.deleted
    );
  });
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
