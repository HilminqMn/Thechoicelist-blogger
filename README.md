# TheChoiceList

บล็อก Affiliate สาย **The Curated List of Everything** — สแต็ก Astro + Vue 3 + TailwindCSS + Supabase

## Tech Stack

- **Front-end:** Astro (SSR) + TailwindCSS v4 — หน้าบ้าน Zero JavaScript
- **Admin:** Vue 3 Islands (`client:load`) — Login, Editor, Data Table
- **Backend:** Supabase (PostgreSQL, Google OAuth, RLS, Edge Functions)

## Quick Start

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. คัดลอก env
cp .env.example .env

# 3. ใส่ค่า Supabase ใน .env
# PUBLIC_SUPABASE_URL=
# PUBLIC_SUPABASE_ANON_KEY=

# 4. รัน dev server
npm run dev
```

เปิด http://localhost:4321

## Supabase Setup

ดูคู่มือฉบับเต็ม:

- **[docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)** — ตั้งค่า DB, migrations, env vars, health check
- **[docs/SUPABASE_OAUTH_SETUP.md](docs/SUPABASE_OAUTH_SETUP.md)** — Google OAuth สำหรับ Admin

สรุปสั้นๆ:

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com)
2. รัน SQL จาก `supabase/migrations/001_schema.sql` และ `002_admin_rpc_grant.sql`
3. (แนะนำ) รัน `supabase/migrations/005_seed_sample_posts.sql` ใน **Supabase SQL Editor** เพื่อเพิ่มหมวดหมู่และบทความตัวอย่าง 10 รายการ
4. เปิด **Authentication → Providers → Google** + ตั้งค่า Google Cloud Console
5. ตั้ง **Site URL** และ **Redirect URLs** (localhost + Vercel `/admin`)
6. เพิ่มอีเมลแอดมิน: `INSERT INTO admin_users (email) VALUES ('your@gmail.com');`
7. Deploy Edge Function (optional): `supabase functions deploy daily-content`

## Pages

| Path | Description |
|------|-------------|
| `/` | หน้าแรก — รายการบทความ |
| `/blog/[slug]` | หน้าบทความ + ปุ่ม Affiliate สีส้ม |
| `/category/[slug]` | บทความตามหมวดหมู่ |
| `/admin` | Admin Dashboard (Vue Island) |

## Design System

- ฟอนต์: **Anuphan** (Google Fonts)
- สี: Slate 60-30 + Orange 10 (`bg-orange-600` เฉพาะปุ่ม Affiliate)
- Navbar: `bg-slate-950`

## Build & Deploy (Vercel)

```bash
npm install
npm run build
npm run preview
```

โปรเจกต์ใช้ `@astrojs/vercel` adapter (`output: 'server'`) — deploy ผ่าน Vercel Dashboard หรือ Vercel CLI

**GitHub repo:** [HilminqMn/Thechoicelist-blogger](https://github.com/HilminqMn/Thechoicelist-blogger)

> ⚠️ หากเคย deploy ไปบัญชี Vercel ผิด (เช่น `thechoicelist-blogger.vercel.app`) ให้ทำตามขั้นตอน **ย้ายไปบัญชีใหม่** ด้านล่าง

### Environment Variables (Vercel Dashboard → Settings → Environment Variables)

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `PUBLIC_USE_DEMO` | Optional | `true` = บังคับ demo data (default: ใช้ DB เมื่อมี env) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | สำหรับ Edge Functions / server-only |

### ย้ายไปบัญชี Vercel ใหม่ (ทำบน Dashboard — แนะนำ)

ทำบนเบราว์เซอร์ของคุณเอง (เราไม่สามารถล็อกอินบัญชีเก่าแทนคุณได้):

1. **ล็อกอินบัญชี Vercel ใหม่** ที่ [vercel.com](https://vercel.com)
2. **เชื่อม GitHub:** Settings → Integrations → GitHub → Install / Configure → อนุญาต repo `HilminqMn/Thechoicelist-blogger`
3. **Import โปรเจกต์:** [vercel.com/new](https://vercel.com/new) → เลือก `HilminqMn/Thechoicelist-blogger`
4. **Framework Preset:** Astro (auto-detect) — ไม่ต้องมี `vercel.json` ใน repo
5. **เพิ่ม Environment Variables** ตามตารางด้านบน (Production + Preview)
6. กด **Deploy** — จะได้ URL ใหม่ เช่น `https://thechoicelist-blogger-xxx.vercel.app`
7. **Supabase:** Authentication → URL Configuration → เพิ่ม Redirect URL:
   - `https://<domain-ใหม่ของคุณ>/admin`
   - `https://<domain-ใหม่ของคุณ>/admin/**` (ถ้าใช้ wildcard)
8. **(ทางเลือก) ลบโปรเจกต์บนบัญชีเก่า:** ล็อกอินบัญชี Vercel เก่า → Projects → `thechoicelist-blogger` → Settings → Delete Project — เพื่อไม่ให้ URL เก่า (`thechoicelist-blogger.vercel.app`) ยังทำงานอยู่

### Deploy ผ่าน CLI (ทางเลือก)

ใช้เมื่อต้องการ deploy จากเครื่องโดยตรง:

```bash
# ลบการเชื่อมโปรเจกต์เก่า (ถ้ามีโฟลเดอร์ .vercel ในเครื่อง)
# โฟลเดอร์นี้อยู่ใน .gitignore แล้ว — ไม่ถูก push ขึ้น GitHub

# ล็อกอินบัญชี Vercel ใหม่ (เปิดเบราว์เซอร์ให้ authorize)
npx vercel login

# เชื่อมโปรเจกต์กับบัญชี/ทีมใหม่
npx vercel link

# deploy production
npx vercel --prod
```

ตรวจสอบว่าล็อกอินบัญชีถูกต้อง: `npx vercel whoami`

### สิ่งที่ทำใน repo แล้ว

- ไม่มี `vercel.json` ที่ผูก `projectId` กับบัญชีเก่า
- โฟลเดอร์ `.vercel/` อยู่ใน `.gitignore` — ลบ local link เก่าแล้ว ต้อง `vercel link` ใหม่หลังเปลี่ยนบัญชี
- ไม่มี URL Vercel แบบ hardcode ในโค้ด

### Admin UI

หลังบ้าน `/admin` ใช้ดีไซน์แบบ shadcn dashboard-01 + login-02 (Vue 3 + Tailwind slate CI) พร้อม Google OAuth

## Demo Mode

หากยังไม่ได้ตั้งค่า Supabase env ระบบจะแสดง **demo posts** อัตโนมัติบนหน้าบ้าน  
ตั้ง `PUBLIC_USE_DEMO=false` (หรือลบออก) เมื่อต้องการใช้ DB จริง — ตรวจสถานะที่ `/api/health`
