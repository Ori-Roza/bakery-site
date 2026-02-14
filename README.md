# בית מאפה "ברכת יעקב" — אתר הזמנות (סטטי)

אתר הזמנות סטטי, מותאם מובייל, RTL מלא בעברית, עם סל קניות, שליחת הזמנה ל־WhatsApp ואזור ניהול פנימי. כל הנתונים נשמרים ב־Supabase.

## תכולת הפרויקט

- [index.html](index.html) — מסך ראשי עם קטלוג, סל, צ'ק־אאוט, ואזור ניהול.
- [src/app.js](src/app.js) — לוגיקת סל, קטלוג, ניהול, Supabase ו־WhatsApp.
- [src/styles.css](src/styles.css) — עיצוב משלים (Tailwind + התאמות).
- [src/config.example.js](src/config.example.js) — תבנית הגדרות Supabase.
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) — פריסה אוטומטית ל־GitHub Pages.

## התאמה ל־GitHub Pages

זהו פרויקט סטטי ללא build. GitHub Pages מגיש את [index.html](index.html) ישירות.

## Supabase — הגדרה חובה

### 1) יצירת פרויקט והפעלת אימייל/סיסמה

ב־Supabase Dashboard:

- Authentication → Providers → Email: ודאו שמופעל.
- צרו משתמש אדמין (Add User) עם אימייל וסיסמה.

### 2) טבלאות

צרו טבלאות עם השדות הבאים:

**categories**

- id (bigint, primary key, generated always as identity)
- name (text, not null)
- image_url (text)
- created_at (timestamptz, default now())

**products**

- id (text, primary key)
- title (text)
- price (numeric)
- category (text)
- image (text)
- in_stock (boolean)

**orders**

- id (uuid, default: gen_random_uuid())
- created_at (timestamp, default now())
- items (jsonb)
- total (numeric)
- customer (jsonb)

**profiles**

- user_id (uuid, primary key, references auth.users)
- role (text) — לדוגמה: admin / editor

### 3) מדיניות גישה (RLS)

לצורך פשטות MVP:

- אפשרו SELECT ל־categories לכלל הציבור.
- אפשרו SELECT ל־products לכלל הציבור.
- אפשרו INSERT ל־orders לכלל הציבור.
- UPDATE/DELETE/INSERT ל־categories רק למשתמשים עם role = admin.
- UPDATE/DELETE ל־products רק למשתמשים עם role = admin.
- SELECT ל־profiles רק למשתמש עצמו (user_id = auth.uid()).


### 4) קונפיג מקומי

צרו קובץ [src/config.js](src/config.js) מקומית לפי התבנית:

- העתיקו את [src/config.example.js](src/config.example.js) ל־src/config.js
- מלאו את `url` ו־`anonKey`.

## פריסה אוטומטית (GitHub Actions)

1. הגדירו Secrets בריפו:
	- `SUPABASE_URL`
	- `SUPABASE_ANON_KEY`
2. ודאו שה־repository מופעל ל־GitHub Pages עם מקור: **GitHub Actions**.
3. בצעו push ל־main — ה־workflow ייצור [src/config.js](src/config.js) בזמן הפריסה.

## הרצה מקומית

פתחו את [index.html](index.html) בדפדפן אחרי יצירת [src/config.js](src/config.js).

## שינוי מספר ה־WhatsApp

פתחו [src/app.js](src/app.js) ועדכנו את הקבוע:

- `WHATSAPP_PHONE` בפורמט בינלאומי ללא סימן + (לדוגמה: `972501234567`).

## ניהול מוצרים

כניסה דרך הקישור "אזור ניהול". לאחר התחברות ניתן ליצור, לערוך ולמחוק מוצרים — רק למשתמשים עם role = admin.

## ניהול משתמשים והרשאות

הוסיפו שורה לטבלת profiles לכל משתמש אדמין עם role = admin.
