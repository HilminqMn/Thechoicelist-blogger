export type DbMode = 'demo' | 'supabase';

export class DbQueryError extends Error {
  constructor(message: string) {
    super(`ไม่สามารถเชื่อมต่อฐานข้อมูลได้: ${message}`);
    this.name = 'DbQueryError';
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.PUBLIC_SUPABASE_URL && import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
}

/** บังคับใช้ข้อมูล demo แม้มี env (สำหรับ dev/preview) */
export function isDemoForced(): boolean {
  return import.meta.env.PUBLIC_USE_DEMO === 'true';
}

export function shouldUseDemo(): boolean {
  if (isDemoForced()) return true;
  return !isSupabaseConfigured();
}

export function getDbMode(): DbMode {
  return shouldUseDemo() ? 'demo' : 'supabase';
}

export function logDbMode(context?: string): void {
  const mode = getDbMode();
  const prefix = context ? `[DB:${context}]` : '[DB]';
  if (mode === 'demo') {
    const reason = isDemoForced()
      ? 'PUBLIC_USE_DEMO=true'
      : 'missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY';
    console.info(`${prefix} Demo mode (${reason})`);
  } else if (import.meta.env.DEV) {
    console.info(`${prefix} Supabase mode`);
  }
}

export function throwIfDbError(
  error: { message: string } | null,
  context: string,
): void {
  if (error) {
    console.error(`[DB] ${context}:`, error.message);
    throw new DbQueryError(error.message);
  }
}
