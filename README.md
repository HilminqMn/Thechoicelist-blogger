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

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com)
2. รัน SQL จาก `supabase/migrations/001_schema.sql`
3. เปิด **Authentication > Providers > Google OAuth**
4. เพิ่มอีเมลแอดมิน:
   ```sql
   INSERT INTO admin_users (email) VALUES ('your@gmail.com');
   ```
5. Deploy Edge Function (optional):
   ```bash
   supabase functions deploy daily-content
   ```

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

โปรเจกต์ใช้ `@astrojs/vercel` adapter (`output: 'server'`) — deploy ผ่าน Vercel Dashboard หรือเชื่อม GitHub repo

### Environment Variables (Vercel Dashboard → Settings → Environment Variables)

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | สำหรับ Edge Functions / server-only |

### Deploy Steps

1. Push โค้ดขึ้น GitHub (`git push -u origin main`)
2. ไปที่ [vercel.com/new](https://vercel.com/new) → Import Git Repository
3. เลือก repo `Thechoicelist-blogger`
4. Framework Preset: **Astro** (auto-detect)
5. เพิ่ม env vars ด้านบน → Deploy
6. ใน Supabase Auth → URL Configuration เพิ่ม `https://your-domain.vercel.app/admin` เป็น Redirect URL

### Admin UI

หลังบ้าน `/admin` ใช้ดีไซน์แบบ shadcn dashboard-01 + login-02 (Vue 3 + Tailwind slate CI) พร้อม Google OAuth

## Demo Mode

หากยังไม่ได้ตั้งค่า Supabase ระบบจะแสดง **demo posts** อัตโนมัติบนหน้าบ้าน
