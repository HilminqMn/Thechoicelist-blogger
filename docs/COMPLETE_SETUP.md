# TheChoiceList — คู่มือตั้งค่าครบวงจร (Zero → Production)

คู่มือเดียวจบทุกขั้นตอน สำหรับโปรเจกต์ **TheChoiceList Blogger**

| รายการ | ค่า |
|--------|-----|
| Supabase project | `pjjtohcbuhdartslzzal` |
| Production URL | https://thechoicelist-blogger.vercel.app |
| Admin email | `hilming.mn@gmail.com` |
| GitHub | [HilminqMn/Thechoicelist-blogger](https://github.com/HilminqMn/Thechoicelist-blogger) |

---

## สถานะปัจจุบัน (ตรวจอัตโนมัติล่าสุด)

| ส่วน | สถานะ |
|------|--------|
| Database + migrations 001–005 | ✅ ทำงานแล้ว (health: 4 categories, 10 posts) |
| Vercel production + env | ✅ `/api/health` ตอบ `mode: "supabase"` |
| Homepage แสดงบทความ | ✅ |
| Edge Function `daily-content` | ❌ ยังไม่ deploy (HTTP 404) |
| AI_API_KEY (Supabase secrets) | ❌ ยังไม่ตั้ง — ต้องเพิ่มด้วยตนเอง |
| Cron schedule | ❌ รอ deploy function ก่อน |

รันตรวจสอบเอง: `npm run setup:check`

---

## Checklist สรุป

- [ ] **1.** รัน migrations 001–006 ใน Supabase SQL Editor
- [ ] **2.** ตั้ง Supabase Auth URLs (Site URL + Redirect URLs)
- [ ] **3.** ตั้ง Vercel environment variables
- [ ] **4.** Deploy Edge Function + ตั้ง AI secrets + Cron
- [ ] **5.** ทดสอบ admin login ที่ `/admin`
- [ ] **6.** ทดสอบ manual trigger cron
- [ ] **7.** ตรวจ homepage แสดงบทความ

---

## 1. Database Migrations (001–006)

เปิด **[Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/pjjtohcbuhdartslzzal/sql/new)** แล้วรันทีละไฟล์ตามลำดับ (คัดลอกทั้งไฟล์ → Run):

| ลำดับ | ไฟล์ | ทำอะไร |
|-------|------|--------|
| 001 | [`supabase/migrations/001_schema.sql`](../supabase/migrations/001_schema.sql) | สร้างตาราง, RLS, หมวดหมู่เริ่มต้น |
| 002 | [`supabase/migrations/002_admin_rpc_grant.sql`](../supabase/migrations/002_admin_rpc_grant.sql) | อนุญาต client เรียก `is_admin()` |
| 003 | [`supabase/migrations/003_seed_admin_user.sql`](../supabase/migrations/003_seed_admin_user.sql) | เพิ่ม `hilming.mn@gmail.com` เป็นแอดมิน |
| 004 | [`supabase/migrations/004_is_admin_email_fallback.sql`](../supabase/migrations/004_is_admin_email_fallback.sql) | รองรับ email จาก Google OAuth metadata |
| 005 | [`supabase/migrations/005_seed_sample_posts.sql`](../supabase/migrations/005_seed_sample_posts.sql) | บทความตัวอย่าง 10 รายการ (idempotent) |
| 006 | [`supabase/migrations/006_cron_schedule.sql`](../supabase/migrations/006_cron_schedule.sql) | Cron pg_cron (รอหลัง deploy function) |

### ตรวจหลังรัน migrations

```sql
SELECT count(*) FROM categories;           -- ควรได้ 4
SELECT count(*) FROM posts WHERE status = 'published';  -- ควรได้ 10
SELECT email FROM admin_users;             -- hilming.mn@gmail.com
```

---

## 2. Supabase Auth URLs

ไปที่ **[Authentication → URL Configuration](https://supabase.com/dashboard/project/pjjtohcbuhdartslzzal/auth/url-configuration)**

| ค่า | URL |
|-----|-----|
| **Site URL** | `https://thechoicelist-blogger.vercel.app` |
| **Redirect URLs** | `http://localhost:4321/admin` |
| | `http://localhost:4321/admin/**` |
| | `https://thechoicelist-blogger.vercel.app/admin` |
| | `https://thechoicelist-blogger.vercel.app/admin/**` |

### Google OAuth

1. **[Authentication → Providers → Google](https://supabase.com/dashboard/project/pjjtohcbuhdartslzzal/auth/providers)** — เปิดใช้งาน
2. ตั้ง Client ID / Secret จาก [Google Cloud Console](https://console.cloud.google.com/)
3. รายละเอียดเพิ่มเติม: [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md)

### Email login (ทางเลือก)

**Authentication → Providers → Email** — เปิดใช้งาน  
สำหรับ dev แนะนำปิด **Confirm email** ชั่วคราว

---

## 3. Vercel Environment Variables

ไปที่ **[Vercel → Project → Settings → Environment Variables](https://vercel.com)**

ตั้งค่า **Production** และ **Preview**:

| Variable | Required | ที่หา |
|----------|----------|-------|
| `PUBLIC_SUPABASE_URL` | ✅ | Supabase → Settings → API → Project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | แนะนำ | Supabase → Settings → API → service_role |
| `PUBLIC_USE_DEMO` | ไม่ | ตั้ง `false` หรือไม่ใส่ |

> ⚠️ `AI_API_KEY` **ไม่ต้อง**ใส่ใน Vercel — ใส่ใน Supabase Edge Function secrets เท่านั้น

หลังเพิ่ม/แก้ env → **Redeploy** production

### Local `.env`

```bash
cp .env.example .env
# แก้ค่า PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

---

## 4. AI Edge Function + Secrets + Cron

### 4.1 สร้าง API Key (ต้องทำเอง — เราไม่สามารถสร้างให้ได้)

1. สมัคร [OpenRouter](https://openrouter.ai) (แนะนำ) หรือ [OpenAI](https://platform.openai.com/)
2. สร้าง API key
3. เก็บ key ไว้ปลอดภัย — **อย่า commit ลง git**

### 4.2 Deploy Edge Function

**วิธี A: Supabase Dashboard (แนะนำถ้า CLI ไม่มีสิทธิ์โปรเจกต์)**

1. ไปที่ **[Edge Functions](https://supabase.com/dashboard/project/pjjtohcbuhdartslzzal/functions)**
2. สร้าง function ชื่อ `daily-content`
3. วางโค้ดจาก [`supabase/functions/daily-content/index.ts`](../supabase/functions/daily-content/index.ts)
4. Deploy และปิด **Verify JWT** (`--no-verify-jwt`)

**วิธี B: Supabase CLI**

```bash
# ล็อกอินด้วยบัญชีที่เป็นเจ้าของโปรเจกต์ pjjtohcbuhdartslzzal
npx supabase login
npx supabase link --project-ref pjjtohcbuhdartslzzal
npx supabase functions deploy daily-content --no-verify-jwt
```

> หาก CLI แสดง "does not have the necessary privileges" — ใช้ Dashboard แทน หรือล็อกอินบัญชี Supabase ที่เป็นเจ้าของโปรเจกต์

### 4.3 ตั้ง Secrets

**Dashboard → Edge Functions → daily-content → Secrets** หรือ CLI:

```bash
npx supabase secrets set AI_API_KEY=sk-or-v1-xxxxxxxx
npx supabase secrets set AI_PROVIDER=openrouter
npx supabase secrets set AI_MODEL=openai/gpt-4o-mini
```

| Secret | จำเป็น | ค่าเริ่มต้น |
|--------|--------|-------------|
| `AI_API_KEY` | ✅ | — |
| `AI_PROVIDER` | ไม่ | `openrouter` |
| `AI_MODEL` | ไม่ | `openai/gpt-4o-mini` |

`SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ถูก inject อัตโนมัติใน Edge Functions

### 4.4 ตั้ง Cron Schedule

**วิธี A: Dashboard (แนะนำ)**

1. **Edge Functions → daily-content → Schedules**
2. Cron: `0 2 * * *` | Timezone: **UTC** (= 09:00 กรุงเทพฯ)
3. บันทึก

**วิธี B: pg_cron + Vault**

1. เปิด extensions: `pg_cron`, `pg_net`, `supabase_vault`
2. เก็บ secrets ใน Vault (ดูคำสั่งใน `006_cron_schedule.sql`)
3. รัน schedule block ใน `006_cron_schedule.sql`

รายละเอียดเพิ่ม: [AI_CRON_SETUP.md](./AI_CRON_SETUP.md)

---

## 5. ทดสอบ Admin Login

1. เปิด https://thechoicelist-blogger.vercel.app/admin
2. กด **เข้าสู่ระบบด้วย Google** (หรือ email/password)
3. ใช้ `hilming.mn@gmail.com`
4. ควรเห็นแดชบอร์ดพร้อมรายการบทความ

### ถ้า login ไม่ได้

| อาการ | แก้ไข |
|-------|--------|
| redirect กลับมาแล้ว error | ตรวจ Redirect URLs ใน Supabase |
| "ยังไม่ได้รับสิทธิ์แอดมิน" | รัน migration 003 หรือ `INSERT INTO admin_users` |
| `is_admin` RPC error | รัน migration 002 |

---

## 6. ทดสอบ Manual Cron Trigger

```bash
curl -X POST \
  'https://pjjtohcbuhdartslzzal.supabase.co/functions/v1/daily-content' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

ผลลัพธ์ที่คาดหวัง:

```json
{
  "message": "Daily AI draft created",
  "slug": "ai-2026-06-10",
  "post": { ... }
}
```

เรียกซ้ำในวันเดียวกัน → `"Daily AI draft already exists"`

จากนั้นเข้า `/admin` → แก้บทความ → เพิ่มลิงก์ affiliate → เผยแพร่

---

## 7. ตรวจ Homepage

```bash
npm run setup:check
```

หรือเปิด https://thechoicelist-blogger.vercel.app — ควรเห็นบทความ 10 รายการ

Health endpoint:

```bash
curl https://thechoicelist-blogger.vercel.app/api/health
```

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

---

## สิ่งที่ทำอัตโนมัติได้ vs ต้องคลิกใน Dashboard

### ✅ ทำแล้ว / ทำงานแล้ว

- Migrations 001–005 รันบน Supabase แล้ว
- Vercel production deploy + env vars ครบ
- Homepage + `/api/health` ทำงาน
- โค้ด Edge Function, Admin UI, cron SQL พร้อมใน repo
- `npm run setup:check` สำหรับตรวจสอบ

### 🔲 ต้องทำใน Dashboard (ขั้นต่ำ ~10 นาที)

1. **สร้าง OpenRouter/OpenAI API key** → ตั้งใน Supabase Edge Function secrets
2. **Deploy `daily-content`** ผ่าน Supabase Dashboard (หรือ CLI ด้วยบัญชีเจ้าของโปรเจกต์)
3. **ตั้ง Cron schedule** ใน Edge Functions → Schedules (`0 2 * * *` UTC)
4. **(ครั้งแรก)** ตรวจ Google OAuth + Redirect URLs ถ้ายัง login ไม่ได้

### ⚠️ ข้อจำกัดที่พบ

- Supabase CLI บนเครื่องนี้ล็อกอินบัญชีอื่น — ไม่มีสิทธิ์ deploy โปรเจกต์ `pjjtohcbuhdartslzzal`
- Vercel CLI ไม่ได้ติดตั้ง — แต่ production ทำงานผ่าน GitHub integration แล้ว
- `AI_API_KEY` ไม่มีใน `.env` — ต้องสร้างและใส่ใน Supabase secrets เอง

---

## เอกสารเพิ่มเติม

| ไฟล์ | หัวข้อ |
|------|--------|
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | DB, RLS, demo mode |
| [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md) | Google OAuth ละเอียด |
| [AI_CRON_SETUP.md](./AI_CRON_SETUP.md) | AI pipeline + troubleshooting |
