import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseConfigError(): string | null {
  const missing: string[] = [];
  if (!import.meta.env.PUBLIC_SUPABASE_URL) missing.push('PUBLIC_SUPABASE_URL');
  if (!import.meta.env.PUBLIC_SUPABASE_ANON_KEY) missing.push('PUBLIC_SUPABASE_ANON_KEY');
  if (missing.length === 0) return null;
  return `ยังไม่ได้ตั้งค่า ${missing.join(' และ ')} บน Vercel (Settings → Environment Variables) แล้ว Redeploy`;
}

export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (browserClient) return browserClient;

  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  browserClient = createClient(url, key, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

/** redirectTo สำหรับ OAuth — ใช้ origin ปัจจุบัน (localhost หรือ Vercel) */
export function getAdminRedirectUrl(): string {
  return `${window.location.origin}/admin`;
}
