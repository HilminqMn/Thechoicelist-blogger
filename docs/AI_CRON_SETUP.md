# AI Content Cron — คู่มือตั้งค่า

ระบบสร้างบทความร่างอัตโนมัติทุกวันผ่าน Edge Function `daily-content` + Cron

## ภาพรวม

1. Cron เรียก Edge Function ทุกวัน **02:00 UTC** (09:00 น. กรุงเทพฯ)
2. Function เรียก AI API สร้างบทความภาษาไทย (listicle/รีวิวสินค้า)
3. บันทึกเป็น `status = 'draft'`, `affiliate_url = null`, slug = `ai-YYYY-MM-DD`
4. แอดมินเข้า `/admin` เพิ่มลิงก์ affiliate แล้วกดเผยแพร่

## ขั้นตอนที่ 1 — Deploy Edge Function

```bash
# ล็อกอิน Supabase CLI (ครั้งแรก)
npx supabase login

# เชื่อมโปรเจกต์
npx supabase link --project-ref pjjtohcbuhdartslzzal

# Deploy function (ไม่ต้อง JWT — cron เรียกด้วย service role)
npx supabase functions deploy daily-content --no-verify-jwt
```

## ขั้นตอนที่ 2 — ตั้ง Secrets

ใน **Supabase Dashboard → Edge Functions → daily-content → Secrets** หรือผ่าน CLI:

```bash
npx supabase secrets set AI_API_KEY=sk-or-v1-xxxxxxxx
npx supabase secrets set AI_PROVIDER=openrouter
npx supabase secrets set AI_MODEL=openai/gpt-4o-mini
```

| Secret | จำเป็น | ค่าเริ่มต้น | คำอธิบาย |
|--------|--------|-------------|----------|
| `AI_API_KEY` | ✅ | — | API key จาก [OpenRouter](https://openrouter.ai) หรือ OpenAI |
| `AI_PROVIDER` | ไม่ | `openrouter` | `openrouter` หรือ `openai` |
| `AI_MODEL` | ไม่ | `openai/gpt-4o-mini` (OpenRouter) / `gpt-4o-mini` (OpenAI) | ชื่อโมเดล |

> `SUPABASE_URL` และ `SUPABASE_SERVICE_ROLE_KEY` ถูก inject อัตโนมัติใน Edge Functions

### OpenRouter (แนะนำ)

1. สมัครที่ [openrouter.ai](https://openrouter.ai)
2. สร้าง API key
3. ตั้ง `AI_PROVIDER=openrouter` และ `AI_MODEL=openai/gpt-4o-mini`

### OpenAI โดยตรง

```bash
npx supabase secrets set AI_PROVIDER=openai
npx supabase secrets set AI_MODEL=gpt-4o-mini
npx supabase secrets set AI_API_KEY=sk-xxxxxxxx
```

## ขั้นตอนที่ 3 — เปิด Cron

### วิธี A: Supabase Dashboard (แนะนำ)

1. ไปที่ **Edge Functions → daily-content → Schedules**
2. สร้าง schedule ใหม่:
   - **Cron:** `0 2 * * *`
   - **Timezone:** UTC
3. บันทึก

### วิธี B: SQL (pg_cron + pg_net + Vault)

1. เปิด extensions: **pg_cron**, **pg_net**, **supabase_vault** (Database → Extensions)
2. เก็บ project URL และ service role key ใน Vault (ดูคำสั่งในไฟล์)
3. รัน SQL จาก `supabase/migrations/006_cron_schedule.sql`

## ทดสอบด้วยตนเอง

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

เรียกซ้ำในวันเดียวกันจะได้:

```json
{
  "message": "Daily AI draft already exists",
  "slug": "ai-2026-06-10"
}
```

## การทำงานในแอดมิน

- บทความ AI มี slug ขึ้นต้นด้วย `ai-` และแสดง badge **ร่าง AI** ในตารางบทความ
- แอดมินแก้ไขเนื้อหา → เพิ่ม **ลิงก์ Affiliate** (Shopee/Lazada ฯลฯ) → เปลี่ยนสถานะเป็น **เผยแหพร่**

## Troubleshooting

| ปัญหา | แก้ไข |
|-------|-------|
| `AI_API_KEY secret is not configured` | ตั้ง secret แล้ว redeploy function |
| `AI API error 401` | ตรวจ API key และ provider |
| `No categories found` | รัน `001_schema.sql` |
| Cron ไม่ทำงาน | ตรวจ Dashboard → Schedules หรือ pg_cron job |
| บทความไม่ขึ้นหน้าบ้าน | ต้องเปลี่ยน status เป็น `published` ในแอดมิน |

## Revalidate หน้าเว็บ (Vercel)

หน้าบ้านใช้ SSR — บทความที่เผยแพร่จะแสดงทันทีเมื่อมีคนเข้าหน้า  
หากใช้ CDN cache เพิ่มเติม สามารถ trigger redeploy หรือ purge cache ใน Vercel Dashboard
