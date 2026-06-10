# คู่มือตั้งค่า Database (Supabase)

คู่มือนี้รวมขั้นตอนตั้งค่า PostgreSQL บน Supabase สำหรับ **TheChoiceList** ตั้งแต่สร้าง schema จนถึง seed ข้อมูลตัวอย่าง

> **โปรเจกต์:** `pjjtohcbuhdartslzzal`  
> **Production:** https://thechoicelist-blogger.vercel.app

---

## Checklist สรุป

- [ ] สร้างโปรเจกต์ Supabase แล้ว
- [ ] รัน migration `001_schema.sql`
- [ ] รัน migration `002_admin_rpc_grant.sql`
- [ ] รัน migration `003_seed_admin_user.sql` (หรือแก้อีเมลแอดมิน)
- [ ] รัน migration `004_is_admin_email_fallback.sql`
- [ ] รัน migration `005_seed_sample_posts.sql`
- [ ] รัน migration `006_cron_schedule.sql` (หลัง deploy Edge Function — หรือใช้ Dashboard Schedules)
- [ ] ตั้ง env vars บน Vercel + local `.env`
- [ ] ตรวจ `/api/health` ว่า `mode: "supabase"` และ `ok: true`
- [ ] ตั้ง OAuth (ดู [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md))

---

## 1. Environment Variables

### Local (`.env`)

```env
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# บังคับใช้ demo data (ไม่ query DB) — ปิดเมื่อต้องการ DB จริง
PUBLIC_USE_DEMO=false
```

| Variable | Required | ใช้ที่ไหน |
|----------|----------|-----------|
| `PUBLIC_SUPABASE_URL` | ✅ | SSR + Admin browser client |
| `PUBLIC_SUPABASE_ANON_KEY` | ✅ | SSR + Admin browser client (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Edge Functions / server-only |
| `PUBLIC_USE_DEMO` | Optional | `true` = ใช้ demo data แม้มี env |

### Vercel (Settings → Environment Variables)

ตั้งค่า **Production** และ **Preview** ให้ครบ:

1. `PUBLIC_SUPABASE_URL`
2. `PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY` (optional)
4. `PUBLIC_USE_DEMO=false` (แนะนำ)

หลังเพิ่ม/แก้ env ให้ **Redeploy** ทุกครั้ง

> ไม่ต้องมี `vercel.json` — Astro adapter `@astrojs/vercel` จัดการ SSR ให้อัตโนมัติ

---

## 2. รัน Migrations (ลำดับสำคัญ)

เปิด **Supabase Dashboard → SQL Editor** แล้วรันทีละไฟล์ตามลำดับ:

### 001 — Schema + RLS + หมวดหมู่เริ่มต้น

ไฟล์: `supabase/migrations/001_schema.sql`

สร้าง:
- ตาราง `categories`, `posts`, `admin_users`
- ฟังก์ชัน `is_admin()` และ trigger `updated_at`
- RLS policies (อ่าน published posts สาธารณะ, แอดมินจัดการได้)
- seed หมวดหมู่ 4 รายการ (ชื่อไทย)

### 002 — RPC grant สำหรับ Admin

ไฟล์: `supabase/migrations/002_admin_rpc_grant.sql`

```sql
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
```

จำเป็นสำหรับให้ `/admin` เรียก `is_admin()` หลัง login

### 003 — Seed admin email

ไฟล์: `supabase/migrations/003_seed_admin_user.sql`

```sql
INSERT INTO admin_users (email) VALUES ('hilming.mn@gmail.com')
ON CONFLICT (email) DO NOTHING;
```

แก้อีเมลเป็นของคุณก่อนรัน หากต้องการเพิ่มแอดมินคนอื่น:

```sql
INSERT INTO admin_users (email) VALUES ('another@gmail.com')
ON CONFLICT (email) DO NOTHING;
```

### 004 — OAuth email fallback

ไฟล์: `supabase/migrations/004_is_admin_email_fallback.sql`

อัปเดต `is_admin()` ให้อ่าน email จาก `user_metadata` ด้วย (กรณี Google OAuth ไม่ส่ง email claim)

### 005 — Seed บทความตัวอย่าง

ไฟล์: `supabase/migrations/005_seed_sample_posts.sql`

- อัปเดตชื่อหมวดหมู่เป็นภาษาไทย (idempotent)
- เพิ่มบทความ published 10 รายการ

**Idempotent:** รันซ้ำได้โดยไม่สร้าง duplicate (ใช้ `ON CONFLICT`)

---

## 3. ตรวจสอบตารางและ RLS

### ตรวจตาราง (SQL Editor)

```sql
SELECT slug, name FROM categories ORDER BY name;
-- ควรได้ 4 หมวด: gadgets, home-living, fashion, food-drink (ชื่อไทย)

SELECT count(*) FROM posts WHERE status = 'published';
-- ควรได้ 10 หลังรัน 005

SELECT email FROM admin_users;
-- ควรมีอีเมลแอดมินของคุณ
```

### ตรวจ RLS

```sql
-- ต้องเปิด RLS ทั้ง 3 ตาราง
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'posts', 'admin_users');
```

Policies สำคัญ:
- `categories`: SELECT สาธารณะ, ALL สำหรับ admin
- `posts`: SELECT published (หรือ admin เห็นทุก status), INSERT/UPDATE/DELETE admin only
- `admin_users`: SELECT สำหรับ admin เท่านั้น

---

## 4. Health Check

### API endpoint

```bash
curl https://thechoicelist-blogger.vercel.app/api/health
```

ตัวอย่าง response เมื่อเชื่อมต่อสำเร็จ:

```json
{
  "ok": true,
  "mode": "supabase",
  "configured": true,
  "message": "เชื่อมต่อ Supabase แล้ว",
  "categoriesCount": 4,
  "publishedPostsCount": 10
}
```

### โหมด Demo

เมื่อ **ไม่มี env** หรือ `PUBLIC_USE_DEMO=true`:

```json
{
  "ok": true,
  "mode": "demo",
  "message": "โหมด Demo — ยังไม่ได้ตั้งค่า Supabase env"
}
```

### Admin Dashboard

หลัง login ที่ `/admin` จะแสดงสถานะ DB มุมบนของแดชบอร์ด

---

## 5. การทำงานของ Demo vs Real DB

| สถานะ | พฤติกรรม |
|-------|----------|
| ไม่มี env | ใช้ demo data บนหน้าบ้าน, admin แสดง config error |
| มี env + query สำเร็จ | ดึงจาก Supabase |
| มี env + query ล้มเหลว | **throw error** (ไม่ fallback เป็น demo เงียบๆ) |
| `PUBLIC_USE_DEMO=true` | บังคับ demo แม้มี env |

---

## 6. Troubleshooting

| อาการ | วิธีแก้ |
|-------|--------|
| หน้าบ้านว่าง แต่ health OK | ตรวจว่ามี posts `status = 'published'` |
| Admin login แล้วถูกเตะ | รัน 002, 003 — ตรวจ email ใน `admin_users` |
| `is_admin` RPC error | รัน `002_admin_rpc_grant.sql` |
| Google OAuth ไม่ได้ admin | รัน `004_is_admin_email_fallback.sql` |
| Vercel ยังเป็น demo | ตั้ง env + Redeploy, ตรวจ `PUBLIC_USE_DEMO` |
| ชื่อหมวดเป็นภาษาอังกฤษ | รัน `005_seed_sample_posts.sql` (อัปเดตชื่อไทย) |

---

## 7. ไฟล์ที่เกี่ยวข้องใน repo

| ไฟล์ | หน้าที่ |
|------|---------|
| `src/lib/db-config.ts` | ตรวจ demo vs supabase mode |
| `src/lib/supabase.ts` | SSR data fetching |
| `src/lib/supabase-browser.ts` | Admin browser client |
| `src/lib/db-health.ts` | Health check logic |
| `src/pages/api/health.ts` | HTTP health endpoint |
| `supabase/migrations/001-005` | SQL migrations |

OAuth setup แยกต่างหาก: **[SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md)**
