import { createSupabaseClient } from './supabase';
import {
  getDbMode,
  isDemoForced,
  isSupabaseConfigured,
  throwIfDbError,
} from './db-config';

export interface DbHealthResult {
  ok: boolean;
  mode: 'demo' | 'supabase';
  configured: boolean;
  message: string;
  categoriesCount?: number;
  publishedPostsCount?: number;
  error?: string;
}

export async function checkDbHealth(): Promise<DbHealthResult> {
  const mode = getDbMode();
  const configured = isSupabaseConfigured();

  if (mode === 'demo') {
    if (isDemoForced() && configured) {
      return {
        ok: true,
        mode: 'demo',
        configured: true,
        message: 'โหมด Demo (PUBLIC_USE_DEMO=true)',
      };
    }
    return {
      ok: true,
      mode: 'demo',
      configured: false,
      message: 'โหมด Demo — ยังไม่ได้ตั้งค่า Supabase env',
    };
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      mode: 'supabase',
      configured: false,
      message: 'ตั้งค่า env ไม่ครบ',
      error: 'Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY',
    };
  }

  try {
    const [categoriesRes, postsRes] = await Promise.all([
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
    ]);

    throwIfDbError(categoriesRes.error, 'checkDbHealth:categories');
    throwIfDbError(postsRes.error, 'checkDbHealth:posts');

    return {
      ok: true,
      mode: 'supabase',
      configured: true,
      message: 'เชื่อมต่อ Supabase แล้ว',
      categoriesCount: categoriesRes.count ?? 0,
      publishedPostsCount: postsRes.count ?? 0,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown database error';
    return {
      ok: false,
      mode: 'supabase',
      configured: true,
      message: 'เชื่อมต่อ Supabase ไม่สำเร็จ',
      error: message,
    };
  }
}
