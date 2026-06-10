import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Daily content automation stub.
 * Hook this to Supabase Cron (pg_cron) or external scheduler.
 * Extend with AI content generation pipeline as needed.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const today = new Date().toISOString().split("T")[0];
    const slug = `daily-curated-${today}`;

    const { data: existing } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ message: "Daily post already exists", slug }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: categories } = await supabase.from("categories").select("id").limit(1);
    const categoryId = categories?.[0]?.id ?? null;

    const { data, error } = await supabase.from("posts").insert({
      title: `Daily Curated List — ${today}`,
      slug,
      content: `## รายการคัดสรรประจำวัน\n\nระบบ AI Content Pipeline จะเติมเนื้อหาที่นี่ใน production.\n\nวันที่: ${today}`,
      summary: "รายการสินค้าเด็ดที่คัดสรรอัตโนมัติประจำวัน",
      category_id: categoryId,
      status: "draft",
      affiliate_url: null,
    }).select().single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Daily draft created", post: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
