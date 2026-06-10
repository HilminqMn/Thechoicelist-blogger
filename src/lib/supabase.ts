import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Category, Post } from './types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createBrowserSupabaseClient(): SupabaseClient {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

export async function getPublishedPosts(limit = 12): Promise<Post[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return getDemoPosts().filter((p) => p.status === 'published').slice(0, limit);

  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch posts:', error.message);
    return getDemoPosts().filter((p) => p.status === 'published').slice(0, limit);
  }

  return (data ?? []) as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = createSupabaseClient();
  if (!supabase) return getDemoPosts().find((p) => p.slug === slug && p.status === 'published') ?? null;

  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch post:', error.message);
    return getDemoPosts().find((p) => p.slug === slug && p.status === 'published') ?? null;
  }

  return (data as Post | null) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createSupabaseClient();
  if (!supabase) return getDemoCategories();

  const { data, error } = await supabase.from('categories').select('*').order('name');

  if (error) {
    console.error('Failed to fetch categories:', error.message);
    return getDemoCategories();
  }

  return (data ?? []) as Category[];
}

export async function getPostsByCategorySlug(categorySlug: string): Promise<{ category: Category | null; posts: Post[] }> {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug) ?? null;

  const supabase = createSupabaseClient();
  if (!supabase || !category) {
    const demoPosts = getDemoPosts().filter(
      (p) => p.status === 'published' && p.categories?.slug === categorySlug,
    );
    return { category, posts: demoPosts };
  }

  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('status', 'published')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch category posts:', error.message);
    return { category, posts: [] };
  }

  return { category, posts: (data ?? []) as Post[] };
}

function getDemoCategories(): Category[] {
  return [
    { id: '1', name: 'แก็ดเจ็ต', slug: 'gadgets', created_at: new Date().toISOString() },
    { id: '2', name: 'บ้านและการอยู่อาศัย', slug: 'home-living', created_at: new Date().toISOString() },
    { id: '3', name: 'แฟชั่น', slug: 'fashion', created_at: new Date().toISOString() },
    { id: '4', name: 'อาหารและเครื่องดื่ม', slug: 'food-drink', created_at: new Date().toISOString() },
  ];
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function getDemoPosts(): Post[] {
  const categories = getDemoCategories();

  return [
    {
      id: 'p1',
      title: '10 แก็ดเจ็ตจำเป็นที่คุณต้องมีในปี 2026',
      slug: 'top-gadgets-2026',
      content: `## ทำไม Gadget เหล่านี้ถึงน่าสนใจ

ในยุคที่เทคโนโลยีพัฒนาอย่างรวดเร็ว การเลือก Gadget ที่คุ้มค่าและใช้งานได้จริงจึงสำคัญมาก เราไม่ได้แค่รวบรวมรายการสินค้ายอดนิยม แต่คัดกรองจากรีวิวจริง ราคาที่เข้าถึงได้ และความทนทานในการใช้งานประจำวัน

ทุกชิ้นในลิสต์นี้ผ่านการทดสอบจากทีม TheChoiceList หรือได้รับการยืนยันจากผู้ใช้งานจริงหลายพันราย ก่อนที่เราจะแนะนำให้คุณ

## หูฟังไร้สายตัดเสียงรบกวน

หูฟัง ANC (Active Noise Cancellation) กลายเป็นสิ่งจำเป็นสำหรับคนทำงานจากที่บ้านและนักเดินทาง ช่วยให้โฟกัสได้ดีขึ้นแม้อยู่ในสภาพแวดล้อมที่เสียงดัง

สิ่งที่ควรมองหา ได้แก่ อายุแบตเตอรี่อย่างน้อย 30 ชั่วโมง, คุณภาพไมโครโฟนสำหรับประชุมออนไลน์ และการเชื่อมต่อหลายอุปกรณ์พร้อมกัน

### รุ่นแนะนำ
- รุ่นระดับกลางที่ให้ ANC คุ้มค่าในงบ 3,000–5,000 บาท
- รุ่นพรีเมียมสำหรับ audiophile ที่ต้องการเสียงคมชัด

## Smart Watch รุ่นใหม่

Smart Watch ในปี 2026 ทำได้มากกว่าแค่บอกเวลา — ติดตามสุขภาพ การนอน ระดับความเครียด และแจ้งเตือนได้ครบจบในตัวเดียว

### ฟีเจอร์สำคัญที่ควรมี
- การวัดอัตราการเต้นหัวใจแบบต่อเนื่อง
- การติดตามการนอนหลับและคุณภาพการพักผ่อน
- ความทนทานต่อน้ำระดับ 5 ATM ขึ้นไป
- อายุแบตเตอรี่อย่างน้อย 5–7 วัน

## Power Bank ความจุสูง

แบตหมดกลางวันคือปัญหาที่พบบ่อย โดยเฉพาะเมื่อใช้สมาร์ทโฟนรุ่นใหม่ที่มีหน้าจอใหญ่และรองรับ 5G

Power Bank ที่ดีควรรองรับ fast charging ทั้ง USB-C PD และมีความจุอย่างน้อย 10,000 mAh เพื่อชาร์จสมาร์ทโฟนได้ 2 รอบเต็ม

## อุปกรณ์เสริมที่มักถูกมองข้าม

นอกจากสามอย่างหลักแล้ว ยังมี Gadget เสริมที่ช่วยยกระดับไลฟ์สไตล์ดิจิทัล:

- **USB-C Hub** สำหรับ laptop รุ่นบางที่มีพอร์ตจำกัด
- **Webcam คุณภาพสูง** สำหรับประชุมออนไลน์
- **แท่นชาร์จไร้สาย** บนโต๊ะทำงาน

## สรุปและข้อแนะนำ

การลงทุนใน Gadget ที่ดีไม่จำเป็นต้องแพงเสมอไป สิ่งสำคัญคือเลือกสิ่งที่ตอบโจทย์การใช้งานจริงของคุณ

> TheChoiceList คัดสรรเฉพาะสินค้าที่ได้รับความนิยมและรีวิวดีจากผู้ใช้จริง — จิ้มพิกัดด้านล่างเพื่อดูราคาล่าสุดและโปรโมชั่น`,
      summary: 'รวม Gadget เด็ดที่คัดมาแล้วว่าคุ้มค่า ใช้งานได้จริง และเหมาะกับไลฟ์สไตล์ยุคใหม่',
      image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
      category_id: categories[0].id,
      status: 'published',
      affiliate_url: 'https://shopee.co.th',
      created_at: daysAgo(2),
      updated_at: daysAgo(2),
      categories: categories[0],
    },
    {
      id: 'p2',
      title: 'ของใช้ในบ้านมินิมอลที่ยกระดับทุกห้อง',
      slug: 'minimal-home-essentials',
      content: `## แต่งบ้านแบบ Minimal ไม่ยาก

การเลือกของใช้ในบ้านที่ดีไซน์เรียบง่าย ช่วยให้พื้นที่ดูโปร่งและน่าอยู่มากขึ้น สไตล์มินิมอลไม่ได้หมายความว่าห้องจะดูโล่งเกินไป แต่หมายถึงการมีเฉพาะสิ่งที่จำเป็นและสวยงาม

## โคมไฟและแสงสว่าง

แสงไฟเป็นหัวใจสำคัญของห้องมินิมอล โคมไฟตั้งโต๊ะดีไซน์สแกนดินาเวียนช่วยสร้างบรรยากาศอบอุ่นโดยไม่ต้องรีโนเวท

- ใช้ warm white 2,700K สำหรับพื้นที่พักผ่อน
- เลือกโคมไฟที่มีดีไซน์เรียบและวัสดุธรรมชาติ
- จัดแสงเป็นชั้น: ambient, task, accent

## ที่เก็บของและการจัดระเบียบ

ที่เก็บของแบบไม้ธรรมชาติช่วยให้ห้องดูอบอุ่นและเป็นระเบียบ ลดความรกโดยไม่ต้องซื้อเฟอร์นิเจอร์เพิ่ม

## ผ้าปูที่นอนและ textiles

ผ้าปูที่นอนคุณภาพสูงเปลี่ยนความรู้สึกของห้องนอนได้ทันที เลือกโทนสี neutral และเนื้อผ้าที่สัมผัสสบาย

## สรุป

ทุกชิ้นที่เราแนะนำผ่านการคัดเลือกจากรีวิวจริงและความคุ้มค่า — เริ่มจากชิ้นเล็กๆ ก่อน แล้วค่อยๆ ขยายตามงบประมาณ`,
      summary: 'ไอเดียของใช้ในบ้านสไตล์มินิมอลที่ช่วยยกระดับบรรยากาศให้ดูหรูและเป็นระเบียบ',
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      category_id: categories[1].id,
      status: 'published',
      affiliate_url: 'https://lazada.co.th',
      created_at: daysAgo(7),
      updated_at: daysAgo(7),
      categories: categories[1],
    },
    {
      id: 'p3',
      title: 'เทรนด์สตรีทแวร์ที่กำลังมาแรง',
      slug: 'trending-streetwear',
      content: `## Streetwear ที่ไม่ควรพลาด

เทรนด์แฟชั่น Streetwear ยังคงมาแรงต่อเนื่อง โดยเน้นความสบายและลุคที่โดดเด่น ในปี 2026 เราเห็นการผสมผสานระหว่าง retro sportswear กับ sustainable materials

## เสื้อ Oversized และ Layering

เสื้อ Oversized ยังคงเป็น staple ของ Streetwear ใส่สบาย จับคู่ได้ง่าย และเหมาะกับทุกสร้าง

### เทคนิคการจับคู่
- Oversized tee + slim pants
- Hoodie + cargo pants
- Layering ด้วยเสื้อกันหนาวบาง

## รองเท้าผ้าใบ Limited Edition

รองเท้าผ้าใบ Limited Edition เพิ่มความโดดเด่นให้ทุกลุค โดยเฉพาะรุ่น collaboration ที่หายาก

## เครื่องประดับและกระเป๋า

Crossbody bag, cap, และ chain ช่วย complete ลุคได้โดยไม่ต้องเปลี่ยนชุดทั้งชุด

## สรุปเทรนด์

Streetwear ในปีนี้เน้นความยั่งยืนและการแสดงออกตัวตน — เลือกชิ้นที่ใส่บ่อยและคุณภาพดีกว่าตามเทรนด์ชั่วคราว`,
      summary: 'อัปเดตเทรนด์ Streetwear ล่าสุดที่ใส่แล้วดูดี จับคู่ง่าย และหาซื้อได้ออนไลน์',
      image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
      category_id: categories[2].id,
      status: 'published',
      affiliate_url: 'https://amazon.com',
      created_at: daysAgo(14),
      updated_at: daysAgo(14),
      categories: categories[2],
    },
    {
      id: 'p4',
      title: 'คู่มือเลือก Smart Watch ให้ถูกใจ',
      slug: 'smart-watch-guide',
      content: `## เลือก Smart Watch อย่างไรให้คุ้ม

Smart Watch ในปี 2026 มีฟีเจอร์ครบกว่าเดิมมาก ทั้งติดตามสุขภาพ การนอน และการแจ้งเตือน

### สิ่งที่ควรพิจารณา
- ความเข้ากันได้กับสมาร์ทโฟน
- อายุแบตเตอรี่
- ความทนทานต่อน้ำ
- แอปและ ecosystem

เราคัดสรรรุ่นที่ได้รับรีวิวดีจากผู้ใช้จริง พร้อมลิงก์ซื้อที่คุ้มค่าที่สุด`,
      summary: 'คู่มือเลือก Smart Watch ฉบับย่อ — ฟีเจอร์สำคัญ ข้อดีข้อเสีย และรุ่นแนะนำ',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      category_id: categories[0].id,
      status: 'published',
      affiliate_url: 'https://shopee.co.th',
      created_at: daysAgo(21),
      updated_at: daysAgo(21),
      categories: categories[0],
    },
    {
      id: 'p5',
      title: 'ไฟสไตล์สแกนดินาเวียน เปลี่ยนห้องในงบจำกัด',
      slug: 'scandi-lighting-guide',
      content: `## แสงไฟสไตล์สแกนดินาเวียน

โคมไฟที่ดีเปลี่ยนบรรยากาศห้องได้ทันที โดยไม่ต้องรีโนเวททั้งห้อง

### แนวทางเลือกโคมไฟ
- Warm white สำหรับพื้นที่พักผ่อน
- โคมไฟตั้งโต๊ะสำหรับมุมอ่านหนังสือ
- ไฟแขวนสำหรับ dining area

ทุกชิ้นที่แนะนำผ่านการคัดจากรีวิวจริงและราคาที่เข้าถึงได้`,
      summary: 'ไอเดียโคมไฟสไตล์สแกนดินาเวียนที่ช่วยยกระดับห้องให้ดูพรีเมียมในงบจำกัด',
      image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
      category_id: categories[1].id,
      status: 'published',
      affiliate_url: 'https://lazada.co.th',
      created_at: daysAgo(28),
      updated_at: daysAgo(28),
      categories: categories[1],
    },
    {
      id: 'p6',
      title: 'วัฒนธรรมสนีกเกอร์ รุ่น Limited Edition ที่คุ้มค่า',
      slug: 'sneaker-culture-drops',
      content: `## รองเท้าผ้าใบ Limited Edition

Sneaker culture ยังคงแรงในปี 2026 โดยเฉพาะรุ่น collaboration ที่หายาก

### รุ่นที่น่าจับตา
- Retro runners กลับมาฮิต
- Sustainable materials เป็นเทรนด์ใหม่
- Resale value ที่ยังคงสูง

เรารวบรวมรุ่นที่หาซื้อได้ออนไลน์และคุ้มค่าที่สุดในตอนนี้`,
      summary: 'อัปเดตรองเท้าผ้าใบ Limited Edition ที่กำลังมาแรงและหาซื้อได้จริง',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      category_id: categories[2].id,
      status: 'published',
      affiliate_url: 'https://amazon.com',
      created_at: daysAgo(35),
      updated_at: daysAgo(35),
      categories: categories[2],
    },
    {
      id: 'p7',
      title: 'อุปกรณ์ชงกาแฟที่บ้านให้แก้วสมบูรณ์แบบ',
      slug: 'coffee-gear-home-brew',
      content: `## อุปกรณ์ชงกาแฟที่บ้าน

ชงกาแฟที่บ้านให้อร่อยระดับคาเฟ่ไม่ยาก ถ้ามีอุปกรณ์ที่ถูกต้อง

### อุปกรณ์ที่ต้องมี
- Grinder คุณภาพดี
- Pour-over dripper
- Kettle ปากแคบ
- Scale วัดน้ำหนัก

คัดมาแล้วว่าคุ้มค่าและใช้งานง่ายสำหรับมือใหม่`,
      summary: 'รวมอุปกรณ์ชงกาแฟที่บ้านที่ช่วยยกระดับแก้วกาแฟให้เหมือนคาเฟ่',
      image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
      category_id: categories[3].id,
      status: 'published',
      affiliate_url: 'https://shopee.co.th',
      created_at: daysAgo(42),
      updated_at: daysAgo(42),
      categories: categories[3],
    },
    {
      id: 'p8',
      title: 'คู่มือจัดโต๊ะทำงาน WFH แบบมือโปร',
      slug: 'desk-setup-guide',
      content: `## จัดโต๊ะทำงานให้มีประสิทธิภาพ

WFH ที่ดีเริ่มจากโต๊ะทำงานที่ออกแบบมาอย่างถูกต้อง

### สิ่งที่ต้องมี
- เก้าอี้ ergonomic
- Monitor arm
- Cable management
- แสงไฟที่เหมาะสม

ทุกชิ้นที่แนะนำช่วยลดอาการปวดหลังและเพิ่มโฟกัสในการทำงาน`,
      summary: 'คู่มือจัดโต๊ะทำงาน WFH ให้สบาย มีประสิทธิภาพ และดูดี',
      image_url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
      category_id: categories[0].id,
      status: 'published',
      affiliate_url: 'https://lazada.co.th',
      created_at: daysAgo(49),
      updated_at: daysAgo(49),
      categories: categories[0],
    },
    {
      id: 'p9',
      title: 'อุปกรณ์ครัวที่ช่วยประหยัดเวลาจริงๆ',
      slug: 'kitchen-gadgets-time-savers',
      content: `## อุปกรณ์ครัวที่ช่วยประหยัดเวลา

ไม่ใช่ทุก Kitchen Gadget ที่คุ้มซื้อ — เราคัดเฉพาะตัวที่ใช้งานจริง

### ตัวเลือกยอดนิยม
- Air fryer รุ่นยอดนิยม
- Multi-cooker
- Blender กำลังสูง
- Food processor ขนาดกะทัดรัด

ทดสอบและรีวิวจากผู้ใช้จริง ก่อนแนะนำให้คุณ`,
      summary: 'อุปกรณ์ครัวที่ใช้งานจริง ช่วยประหยัดเวลา และคุ้มค่าเงิน',
      image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
      category_id: categories[1].id,
      status: 'published',
      affiliate_url: 'https://shopee.co.th',
      created_at: daysAgo(56),
      updated_at: daysAgo(56),
      categories: categories[1],
    },
  ];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith('<') && /<\/[a-z][\w-]*>/i.test(trimmed);
}

export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function estimateReadTime(content: string): number {
  const text = isHtmlContent(content) ? stripHtmlTags(content) : content;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractTocFromMarkdown(content: string): TocItem[] {
  const items: TocItem[] = [];
  for (const line of content.split('\n')) {
    const match = line.replace(/\r$/, '').match(/^(#{2})\s+(.+)$/);
    if (match) {
      const text = match[2].trim();
      items.push({ id: slugify(text), text, level: 2 });
    }
  }
  return items;
}

export function extractTocFromHtml(content: string): TocItem[] {
  const items: TocItem[] = [];
  const headingRegex = /<h2[^>]*(?:\sid=["']([^"']*)["'])?[^>]*>([\s\S]*?)<\/h2>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (!text) continue;
    const id = match[1]?.trim() || slugify(text);
    items.push({ id, text, level: 2 });
  }

  return items;
}

export function extractTocFromContent(content: string): TocItem[] {
  return isHtmlContent(content) ? extractTocFromHtml(content) : extractTocFromMarkdown(content);
}

let markdownConfigured = false;

export async function renderMarkdown(content: string): Promise<string> {
  const { marked } = await import('marked');

  if (!markdownConfigured) {
    marked.use({
      renderer: {
        heading({ tokens, depth }) {
          const text = this.parser.parseInline(tokens);
          const plain = tokens.map((t) => ('text' in t ? t.text : '')).join('');
          const id = slugify(plain);
          return `<h${depth} id="${id}">${text}</h${depth}>\n`;
        },
      },
    });
    markdownConfigured = true;
  }

  return marked.parse(content) as string;
}

function addIdsToHtmlHeadings(html: string): string {
  return html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (full, attrs: string, inner: string) => {
    if (/\sid=/i.test(attrs)) return full;
    const text = inner.replace(/<[^>]+>/g, '').trim();
    if (!text) return full;
    return `<h2${attrs} id="${slugify(text)}">${inner}</h2>`;
  });
}

export async function renderPostContent(content: string): Promise<string> {
  if (isHtmlContent(content)) {
    return addIdsToHtmlHeadings(content);
  }
  return renderMarkdown(content);
}

/** Convert stored content to HTML for the TipTap editor (legacy markdown → HTML). */
export async function contentForEditor(content: string): Promise<string> {
  if (!content.trim()) return '';
  if (isHtmlContent(content)) return content;
  return renderMarkdown(content);
}
