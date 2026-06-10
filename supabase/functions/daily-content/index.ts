import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AiArticle {
  title: string;
  slug: string;
  content: string;
  summary: string;
  category_slug: string;
  image_url: string;
}

interface CategoryRow {
  id: string;
  slug: string;
}

function log(level: "info" | "warn" | "error", message: string, extra?: Record<string, unknown>) {
  const entry = { level, message, ts: new Date().toISOString(), ...extra };
  console.log(JSON.stringify(entry));
}

function todayUtc(): string {
  return new Date().toISOString().split("T")[0];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildUnsplashUrl(keyword: string): string {
  const q = encodeURIComponent(keyword.trim() || "product lifestyle");
  return `https://source.unsplash.com/featured/800x600/?${q}`;
}

function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(candidate);
}

function validateArticle(raw: unknown): AiArticle {
  if (!raw || typeof raw !== "object") {
    throw new Error("AI response is not a JSON object");
  }

  const obj = raw as Record<string, unknown>;
  const required = ["title", "slug", "content", "summary", "category_slug", "image_url"] as const;

  for (const key of required) {
    if (typeof obj[key] !== "string" || !obj[key].toString().trim()) {
      throw new Error(`AI response missing or invalid field: ${key}`);
    }
  }

  return {
    title: obj.title as string,
    slug: slugify(obj.slug as string),
    content: obj.content as string,
    summary: obj.summary as string,
    category_slug: slugify(obj.category_slug as string),
    image_url: obj.image_url as string,
  };
}

function buildPrompt(categories: CategoryRow[], date: string): string {
  const categoryList = categories.map((c) => c.slug).join(", ");
  return `คุณเป็นนักเขียนบล็อก Affiliate ภาษาไทยสำหรับเว็บไซต์ TheChoiceList (รายการคัดสรรสินค้าเด็ด)

สร้างบทความรีวิว/ลิสต์สินค้า (listicle) หนึ่งบทความ สำหรับวันที่ ${date}

ข้อกำหนด:
- ภาษาไทย โทนตรงไปตรงมา เป็นกันเอง น่าเชื่อถือ
- เนื้อหา 800–1200 คำ ในรูปแบบ Markdown (ใช้ ## สำหรับหัวข้อหลัก)
- แนะนำสินค้า/หมวดหมู่จริงที่คนไทยสนใจ (แกดเจ็ต, บ้าน, แฟชั่น, อาหาร ฯลฯ)
- ห้ามใส่ลิงก์ affiliate ในเนื้อหา (แอดมินจะเพิ่มทีหลัง)
- เลือก category_slug จากรายการนี้เท่านั้น: ${categoryList || "gadgets, home-living, fashion, food-drink"}
- image_url ให้เป็น keyword ภาษาอังกฤษสั้นๆ สำหรับค้นหารูปบน Unsplash (เช่น "wireless earbuds" ไม่ใช่ URL เต็ม)

ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่น รูปแบบ:
{
  "title": "หัวข้อบทความภาษาไทย",
  "slug": "slug-ภาษาอังกฤษ-sanitized",
  "content": "## หัวข้อ\\n\\nเนื้อหา markdown...",
  "summary": "สรุปย่อ 1-2 ประโยค",
  "category_slug": "gadgets",
  "image_url": "wireless earbuds"
}`;
}

async function callAi(prompt: string): Promise<string> {
  const apiKey = Deno.env.get("AI_API_KEY");
  if (!apiKey) {
    throw new Error("AI_API_KEY secret is not configured");
  }

  const provider = (Deno.env.get("AI_PROVIDER") ?? "openrouter").toLowerCase();
  const defaultModel = provider === "openai" ? "gpt-4o-mini" : "openai/gpt-4o-mini";
  const model = Deno.env.get("AI_MODEL") ?? defaultModel;

  const isOpenRouter = provider === "openrouter";
  const url = isOpenRouter
    ? "https://openrouter.ai/api/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  log("info", "Calling AI API", { provider, model });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (isOpenRouter) {
    headers["HTTP-Referer"] = "https://thechoicelist-blogger.vercel.app";
    headers["X-Title"] = "TheChoiceList Daily Content";
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a Thai affiliate blog writer. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AI API error ${response.status}: ${body.slice(0, 500)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("AI API returned empty content");
  }

  return content;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startedAt = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const today = todayUtc();
    const dailySlug = `ai-${today}`;

    log("info", "daily-content started", { today, dailySlug });

    const { data: existing, error: existingError } = await supabase
      .from("posts")
      .select("id, slug, title")
      .eq("slug", dailySlug)
      .maybeSingle();

    if (existingError) {
      throw new Error(`Failed to check existing post: ${existingError.message}`);
    }

    if (existing) {
      log("info", "Daily AI draft already exists", { slug: dailySlug, id: existing.id });
      return new Response(
        JSON.stringify({
          message: "Daily AI draft already exists",
          slug: dailySlug,
          post_id: existing.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, slug")
      .order("slug");

    if (catError) {
      throw new Error(`Failed to load categories: ${catError.message}`);
    }

    const categoryRows = (categories ?? []) as CategoryRow[];
    if (categoryRows.length === 0) {
      throw new Error("No categories found — run schema migration first");
    }

    const prompt = buildPrompt(categoryRows, today);
    const aiRaw = await callAi(prompt);
    const article = validateArticle(extractJsonFromText(aiRaw));

    const category = categoryRows.find((c) => c.slug === article.category_slug);
    const categoryId = category?.id ?? categoryRows[0].id;

    if (!category) {
      log("warn", "Unknown category_slug from AI, using fallback", {
        category_slug: article.category_slug,
        fallback: categoryRows[0].slug,
      });
    }

    const imageUrl = article.image_url.startsWith("http")
      ? article.image_url
      : buildUnsplashUrl(article.image_url);

    const { data: inserted, error: insertError } = await supabase
      .from("posts")
      .insert({
        title: article.title,
        slug: dailySlug,
        content: article.content,
        summary: article.summary,
        image_url: imageUrl,
        category_id: categoryId,
        status: "draft",
        affiliate_url: null,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to insert draft: ${insertError.message}`);
    }

    const elapsed = Date.now() - startedAt;
    log("info", "Daily AI draft created", { slug: dailySlug, elapsed_ms: elapsed });

    return new Response(
      JSON.stringify({
        message: "Daily AI draft created",
        slug: dailySlug,
        post: inserted,
        elapsed_ms: elapsed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    log("error", "daily-content failed", { error: message, elapsed_ms: Date.now() - startedAt });

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
