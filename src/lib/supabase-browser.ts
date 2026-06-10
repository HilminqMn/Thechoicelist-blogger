import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured } from './db-config';

export { isSupabaseConfigured };

let browserClient: SupabaseClient | null = null;

export function getSupabaseConfigError(): string | null {
  const missing: string[] = [];
  if (!import.meta.env.PUBLIC_SUPABASE_URL) missing.push('PUBLIC_SUPABASE_URL');
  if (!import.meta.env.PUBLIC_SUPABASE_ANON_KEY) missing.push('PUBLIC_SUPABASE_ANON_KEY');
  if (missing.length === 0) return null;
  return `ยังไม่ได้ตั้งค่า ${missing.join(' และ ')} บน Vercel (Settings → Environment Variables) แล้ว Redeploy`;
}

export type BrowserSupabaseOptions = {
  /** เปิดเฉพาะตอนมี OAuth callback ใน URL — ป้องกัน getSession() ค้างตอนโหลดหน้า admin ปกติ */
  detectSessionInUrl?: boolean;
};

export function createBrowserSupabaseClient(
  options: BrowserSupabaseOptions = {},
): SupabaseClient | null {
  const detectSessionInUrl = options.detectSessionInUrl ?? false;

  if (browserClient) {
    return browserClient;
  }

  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  browserClient = createClient(url, key, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return browserClient;
}

/** รีเซ็ต singleton หลัง signOut หรือเมื่อต้องสร้าง client ใหม่ด้วย options ต่างกัน */
export function resetBrowserSupabaseClient(): void {
  browserClient = null;
}

/** redirectTo สำหรับ OAuth — ใช้ origin ปัจจุบัน (localhost หรือ Vercel) */
export function getAdminRedirectUrl(): string {
  return `${window.location.origin}/admin`;
}
