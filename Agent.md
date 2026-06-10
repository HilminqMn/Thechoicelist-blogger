# 🤖 TheChoiceList — System Architecture & Developer Specifications (Agent Guide)

เอกสารพิมพ์เขียว (Blueprint) และคู่มือข้อมูลเชิงโครงสร้าง สำหรับระบบเว็บบล็อกสาย Affiliate ครอบจักรวาลภายใต้แบรนด์ **"TheChoiceList"** ซึ่งขับเคลื่อนด้วยสแต็กเทคโนโลยีโมเดิร์น **Astro + Vue 3 + TailwindCSS + Supabase** ควบคู่กับระบบเนื้อหาอัตโนมัติ (AI-Generated Content)

---

## 🏗️ 1. Brand Concept & Identity

* **ชื่อแบรนด์/บล็อก:** `TheChoiceList` (เดอะ ชอยส์ ลิสต์)
* **ปรัชญาระบบ:** "The Curated List of Everything" — บล็อกทั่วไปที่ไม่เจาะจงหมวดหมู่ (General Blog) ทำหน้าที่คัดสรรและจัดอันดับสินค้า/ไอเทมเด็ดจากทั่วโลกออนไลน์ (Gadgets, ของใช้ในบ้าน, แฟชั่น, ของกิน) โดยใช้ AI รวบรวมข้อมูลเชิงลึกในแต่ละวัน เพื่อให้ผู้ใช้อ่านรีวิวจริงที่ผ่านการกลั่นกรองและสามารถ "จิ้มพิกัด" ซื้อตามได้ทันที
* **Visual Style:** มินิมอล เรียบหรู สะอาดตา (Minimal High-Contrast) เน้นเนื้อหาเป็นศูนย์กลาง (Content-Centric) โครงสร้างหน้าบ้านถอดแบบความคลีนจาก Adcash Blog และโครงสร้างหลังบ้านใช้มาตรฐานการออกแบบจาก Shadcn UI

---

## 🛠️ 2. Tech Stack & Hybrid Architecture

ระบบใช้สถาปัตยกรรมแบบ **Island Architecture** เพื่อรีดประสิทธิภาพสูงสุดในแต่ละส่วนของเว็บไซต์:

* **Front-end Showcase (หน้าบ้าน):** `Astro` + `TailwindCSS`
    * **Rendering Strategy:** Server-Side Rendering (SSR) หรือ Static Site Generation (SSG) บน Vercel
    * **SEO Strategy:** เสิร์ฟไฟล์ **Static HTML 100% (Zero JavaScript)** ให้กับผู้อ่านทั่วไปและ Google Crawler เพื่อความเร็วในการโหลดสูงสุด (PageSpeed 95+)
* **Admin Dashboard & Dynamic Components (หลังบ้าน):** `Vue 3` + `Vite` + Shadcn-style UI
    * **Integration:** เขียนส่วนที่ต้องติดต่อกับผู้ใช้ด้วย Vue 3 แล้วนำไปหยอดเป็น "เกาะ (Island)" ในหน้า Astro ผ่าน Directive `client:load`
    * **Use Cases:** ระบบจัดการบทความ (Editor), ระบบล็อกอินแอดมิน, หน้าตารางจัดการข้อมูล (Data Table)
* **Backend & Cloud Infrastructure:** `Supabase`
    * **Database:** PostgreSQL สำหรับเก็บโพสต์ หมวดหมู่ และการตั้งค่าระบบ
    * **Authentication:** เปิดใช้งาน **Google OAuth** ผ่านระบบ Supabase Auth
    * **Security:** ล็อกการเข้าถึงตารางจัดการข้อมูลผ่าน **Row Level Security (RLS)** ให้สิทธิ์เฉพาะผู้ใช้ที่เป็น Admin เท่านั้น
    * **Automation:** `Supabase Edge Functions` (Deno/TypeScript) ผูกร่วมกับ `Supabase Cron` สำหรับการรันระบบดึงข้อมูลอัตโนมัติรายวัน

---

## 🎨 3. Design System & Typography

### 🔤 การตั้งค่าฟอนต์ (Anuphan)

ใช้ฟอนต์ **Anuphan (อนุพาน)** ไร้หัว ดีไซน์โมเดิร์น สากล และสะอาดตา

* **Tailwind v3 Config (`tailwind.config.js`):** ตั้ง `fontFamily.sans: ['Anuphan', 'sans-serif']`
* **Tailwind v4 Config (`src/styles/global.css`):** ตั้ง `--font-sans: 'Anuphan', sans-serif`

### 🎨 ชุดสี (Slate & Cyber Orange) — กฎ 60-30-10

| ส่วนประกอบ | Tailwind | HEX | วัตถุประสงค์ |
| :--- | :--- | :--- | :--- |
| Main Background | `bg-slate-50` | `#F8FAFC` | พื้นหลังหน้าบ้าน |
| Main Text | `text-slate-900` | `#0F172A` | เนื้อหาหลัก |
| Brand / UI Core | `bg-slate-950` | `#020617` | Navbar, หลังบ้าน |
| Conversion Accent | `bg-orange-600` | `#EA580C` | **ปุ่ม Affiliate เท่านั้น** |

---

## 📊 4. Database Schema

ดูไฟล์ `supabase/migrations/001_schema.sql` สำหรับ SQL ฉบับสมบูรณ์ รวม RLS policies และตาราง `admin_users`

---

## 📄 5. Pages & Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Astro (Zero JS) | หน้าแรก — รายการบทความ |
| `/blog/[slug]` | Astro (Zero JS) | หน้าบทความ + ปุ่ม Affiliate |
| `/category/[slug]` | Astro (Zero JS) | บทความตามหมวดหมู่ |
| `/admin` | Vue Island | Admin Dashboard |

---

## ⚙️ 6. Setup & Deployment

```bash
npm install
cp .env.example .env
npm run dev
```

Deploy ไป Vercel ด้วย `@astrojs/vercel` adapter
