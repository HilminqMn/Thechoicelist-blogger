# คู่มือตั้งค่า Supabase Auth สำหรับ Admin

คู่มือนี้ครอบคลุมการตั้งค่า **อีเมล/รหัสผ่าน** และ **Google OAuth** ผ่าน Supabase Auth สำหรับหน้า `/admin` ของ TheChoiceList — ทั้ง localhost และ Vercel production

---

## 1. สร้างโปรเจกต์ Supabase

1. ไปที่ [supabase.com](https://supabase.com) → **New Project**
2. ตั้งชื่อโปรเจกต์ เลือก region และรอจน provision เสร็จ
3. ไปที่ **Project Settings → API** แล้วคัดลอก:
   - **Project URL** → ใส่ใน `PUBLIC_SUPABASE_URL`
   - **anon public** key → ใส่ใน `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → ใส่ใน `SUPABASE_SERVICE_ROLE_KEY` (server-only)

---

## 2. รัน Database Migration

ใน **SQL Editor** ของ Supabase รันตามลำดับ:

1. `supabase/migrations/001_schema.sql` — สร้างตาราง, RLS, ฟังก์ชัน `is_admin()`
2. `supabase/migrations/002_admin_rpc_grant.sql` — อนุญาตให้ client เรียก `is_admin()` ตรวจสอบสิทธิ์แอดมิน
3. `supabase/migrations/003_seed_admin_user.sql` — เพิ่มอีเมลแอดมินเริ่มต้น (หรือรัน SQL ด้านล่างเอง)
4. `supabase/migrations/004_is_admin_email_fallback.sql` — (แนะนำ) อ่านอีเมลจาก `user_metadata` ถ้า JWT ไม่มี claim `email`

---

## 3. เพิ่มอีเมลแอดมิน

รันใน SQL Editor (แทนที่อีเมลด้วย Google account จริง):

```sql
INSERT INTO admin_users (email) VALUES ('hilming.mn@gmail.com')
ON CONFLICT (email) DO NOTHING;
```

หรืออีเมลอื่นที่ต้องการ:

```sql
INSERT INTO admin_users (email) VALUES ('your@gmail.com')
ON CONFLICT (email) DO NOTHING;
```

เฉพาะอีเมลใน `admin_users` เท่านั้นที่เข้าแดชบอร์ดได้

---

## 4. เปิด Email Provider ใน Supabase

หน้าแอดมินรองรับเข้าสู่ระบบด้วย **อีเมล + รหัสผ่าน** (นอกจาก Google OAuth)

1. ไปที่ **Authentication → Providers → Email**
2. เปิด **Enable Email provider**
3. สำหรับ **development** แนะนำให้ปิด **Confirm email** ชั่วคราว เพื่อไม่ต้องรอยืนยันอีเมลก่อน login
4. สำหรับ **production** เปิด Confirm email ได้ตามนโยบายความปลอดภัย — ผู้ใช้ต้องคลิกลิงก์ในอีเมลก่อนเข้าได้

### ผู้ใช้ที่มีอยู่แล้วใน auth.users (เช่น สร้างผ่าน Google หรือ Dashboard)

ถ้ามี user ใน Supabase Auth แล้ว (เช่น `hilming.mn@gmail.com`) แต่ยังไม่มีรหัสผ่านสำหรับ Email login ให้ตั้งรหัสผ่านด้วยวิธีใดวิธีหนึ่ง:

| วิธี | ขั้นตอน |
|------|---------|
| Supabase Dashboard | **Authentication → Users** → เลือก user → **Send password recovery** หรือตั้งรหัสผ่านใหม่ |
| Password reset flow | ใช้ลิงก์ reset จากอีเมล (ถ้าเปิด Email provider และ SMTP แล้ว) |
| สร้าง user ใหม่ | ลงทะเบียนผ่านหน้า `/admin` ด้วยอีเมลที่อยู่ใน `admin_users` |

> อีเมลต้องอยู่ในตาราง `admin_users` ด้วย — การมีบัญชีใน `auth.users` อย่างเดียวยังเข้าแดชบอร์ดไม่ได้

---

## 5. เปิด Google Provider ใน Supabase

1. **Authentication → Providers → Google**
2. เปิด **Enable Sign in with Google**
3. ใส่ **Client ID** และ **Client Secret** จาก Google Cloud Console (ขั้นตอนถัดไป)
4. บันทึก

---

## 6. ตั้งค่า Google Cloud Console

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. สร้าง **OAuth 2.0 Client ID** (Application type: **Web application**)

### Authorized JavaScript origins

| Environment | URL |
|-------------|-----|
| Local dev | `http://localhost:4321` |
| Vercel production | `https://<your-vercel-domain>.vercel.app` |
| Supabase Auth | `https://<project-ref>.supabase.co` |

ตัวอย่าง Supabase Auth origin (แทน `<project-ref>` ด้วย ref จริงจาก Project URL):

```
https://pjjtohcbuhdartslzzal.supabase.co
```

### Authorized redirect URIs

เพิ่ม **เฉพาะ** callback ของ Supabase (ไม่ใช่ URL ของเว็บคุณโดยตรง):

```
https://<project-ref>.supabase.co/auth/v1/callback
```

ตัวอย่าง:

```
https://pjjtohcbuhdartslzzal.supabase.co/auth/v1/callback
```

3. คัดลอก **Client ID** และ **Client Secret** ไปใส่ใน Supabase (ขั้นตอนที่ 4)

---

## 7. ตั้งค่า URL ใน Supabase Dashboard

ไปที่ **Authentication → URL Configuration**

### Site URL

| Environment | ค่า |
|-------------|-----|
| Local dev | `http://localhost:4321` |
| Production | `https://<your-vercel-domain>.vercel.app` |

> สำหรับ production ให้ตั้งเป็น URL หลักของ Vercel หลัง deploy แล้ว

### Redirect URLs

เพิ่มทุก URL ที่ OAuth อาจ redirect กลับมา:

```
http://localhost:4321/admin
http://localhost:4321/**
https://<your-vercel-domain>.vercel.app/admin
https://<your-vercel-domain>.vercel.app/**
```

ตัวอย่างถ้า deploy ที่ `thechoicelist-blogger.vercel.app`:

```
http://localhost:4321/admin
http://localhost:4321/**
https://thechoicelist-blogger.vercel.app/admin
https://thechoicelist-blogger.vercel.app/**
```

---

## 8. Environment Variables

### Local (`.env`)

```bash
cp .env.example .env
# แก้ไขค่าให้ตรงกับ Supabase project
```

### Vercel Dashboard

ไปที่ **Project → Settings → Environment Variables** แล้วเพิ่ม (Production + Preview):

| Variable | Required |
|----------|----------|
| `PUBLIC_SUPABASE_URL` | ✅ |
| `PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional (Edge Functions) |

หลังเพิ่ม env vars ต้อง **Redeploy** โปรเจกต์บน Vercel

---

## 9. ทดสอบ Auth Flow

### อีเมล + รหัสผ่าน

1. รัน `npm run dev` แล้วเปิด `http://localhost:4321/admin`
2. กรอกอีเมลที่อยู่ใน `admin_users` และรหัสผ่าน แล้วกด **เข้าสู่ระบบ**
3. แอปเรียก `signInWithPassword` แล้วตรวจ `is_admin()` — ผ่านจึงเข้าแดชบอร์ด
4. ทดสอบลงทะเบียน: ไปหน้า **ลงทะเบียน** → กรอกอีเมล/รหัสผ่าน → ถ้า Confirm email ปิดอยู่จะ login ทันที

### Google OAuth

1. กด **เข้าสู่ระบบด้วย Google**
2. หลัง authorize จะ redirect กลับมาที่ `/admin?code=...`
3. แอปจะแลก `code` เป็น session (PKCE) แล้วเรียก `is_admin()` ตรวจสอบสิทธิ์
4. ถ้าอีเมลไม่อยู่ใน `admin_users` จะเห็นข้อความภาษาไทยและถูก sign out อัตโนมัติ

---

## Troubleshooting

### Checklist สำหรับ `thechoicelist-blogger.vercel.app` (คัดลอก URL ตรงนี้ไปวาง)

**Supabase → Authentication → URL Configuration**

| ช่อง | ค่าที่ต้องตั้ง |
|------|----------------|
| Site URL | `https://thechoicelist-blogger.vercel.app` |
| Redirect URLs | ดูรายการด้านล่าง (เพิ่มทีละบรรทัด) |

Redirect URLs ที่ต้องมีทั้งหมด:

```
http://localhost:4321/admin
http://localhost:4321/**
https://thechoicelist-blogger.vercel.app/admin
https://thechoicelist-blogger.vercel.app/**
```

**Google Cloud Console → OAuth 2.0 Client → Authorized JavaScript origins**

```
http://localhost:4321
https://thechoicelist-blogger.vercel.app
https://pjjtohcbuhdartslzzal.supabase.co
```

**Google Cloud Console → Authorized redirect URIs** (เฉพาะ callback ของ Supabase — ไม่ใช่ URL ของ Vercel)

```
https://pjjtohcbuhdartslzzal.supabase.co/auth/v1/callback
```

**Vercel → Project → Settings → Environment Variables** (Production + Preview)

| Variable | ตัวอย่าง |
|----------|---------|
| `PUBLIC_SUPABASE_URL` | `https://pjjtohcbuhdartslzzal.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | anon key จาก Supabase Dashboard |

หลังเพิ่ม/แก้ env vars ต้อง **Redeploy** บน Vercel

**Supabase SQL Editor** — ตรวจว่ารัน migration ครบและมีอีเมลแอดมิน:

```sql
-- ต้องมีแถวนี้
SELECT * FROM admin_users WHERE email = 'hilming.mn@gmail.com';

-- ทดสอบ RPC (รันหลัง login ใน SQL Editor จะไม่เห็นผล — ใช้ตรวจว่า function มีอยู่)
SELECT is_admin();
```

---

### อาการและวิธีแก้

| อาการ | สาเหตุที่พบบ่อย | แก้ไข |
|-------|-----------------|-------|
| กด Google แล้วกลับมาหน้า login เงียบๆ | Redirect URL ไม่อยู่ใน allow list | เพิ่ม `https://thechoicelist-blogger.vercel.app/admin` ใน Supabase Redirect URLs |
| ข้อความเกี่ยวกับ Redirect URL / not allowed | `redirectTo` ไม่ตรงกับที่อนุญาต | ตรวจ checklist ด้านบน |
| `redirect_uri_mismatch` จาก Google | Google Console ตั้ง redirect ผิด | ใช้เฉพาะ `https://pjjtohcbuhdartslzzal.supabase.co/auth/v1/callback` |
| ข้อความ PKCE / code verifier | เปิด OAuth คนละแท็บหรือ clear storage ระหว่าง redirect | กดเข้าสู่ระบบใหม่ในหน้าต่างเดิม |
| ข้อความ "ไม่สามารถตรวจสอบสิทธิ์แอดมิน" | ยังไม่รัน migration 002 | รัน `002_admin_rpc_grant.sql` |
| ข้อความ "อีเมลนี้ยังไม่ได้รับสิทธิ์แอดมิน" | อีเมลไม่อยู่ใน `admin_users` | `INSERT INTO admin_users (email) VALUES ('hilming.mn@gmail.com')` |
| หน้า login แสดงข้อความ env หาย | Vercel ไม่มี env หรือยังไม่ redeploy | ตั้ง `PUBLIC_SUPABASE_*` แล้ว Redeploy |
| ใช้ได้ local แต่ production ไม่ได้ | Production URL ไม่ได้เพิ่มใน Supabase/Google | ทำ checklist ด้านบนครบทุกข้อ |
| อีเมล/รหัสผ่านไม่ถูกต้อง | user ไม่มีรหัสผ่าน (สร้างผ่าน Google) | ตั้งรหัสผ่านใน Dashboard หรือใช้ password reset (ดูขั้นตอนที่ 4) |
| กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ | เปิด Confirm email ใน Supabase | คลิกลิงก์ในอีเมล หรือปิด Confirm email สำหรับ dev |
| Email provider ไม่ทำงาน | ยังไม่เปิด Email ใน Providers | เปิดที่ Authentication → Providers → Email |

### ลำดับ OAuth ที่ถูกต้อง

1. ผู้ใช้กด "เข้าสู่ระบบด้วย Google" ที่ `/admin`
2. Redirect ไป Google → Supabase (`.../auth/v1/callback`)
3. Supabase redirect กลับมา `https://thechoicelist-blogger.vercel.app/admin?code=...`
4. แอปแลก `code` เป็น session (PKCE) อัตโนมัติ
5. เรียก RPC `is_admin()` — ถ้าผ่านจึงเข้าแดชบอร์ด

### ตรวจว่า production โหลด env แล้ว

เปิด DevTools → Network → โหลดไฟล์ `AdminApp.*.js` แล้วค้นหา `supabase.co` — ถ้าไม่พบ แปลว่า env ยังไม่ถูก build เข้า bundle (ต้อง redeploy)
