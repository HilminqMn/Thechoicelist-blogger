<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  createBrowserSupabaseClient,
  getAdminRedirectUrl,
  getSupabaseConfigError,
} from '../../lib/supabase-browser';
import AdminLogin from './AdminLogin.vue';
import AdminSignup from './AdminSignup.vue';
import AdminDashboardLayout from './AdminDashboardLayout.vue';
import PostsTable from './PostsTable.vue';
import PostEditor from './PostEditor.vue';
import type { Category, Post, PostFormData } from '../../lib/types';

const supabase = ref<SupabaseClient | null>(createBrowserSupabaseClient());
const configError = ref(getSupabaseConfigError() ?? '');

const session = ref<{ user: { email?: string } } | null>(null);
const loading = ref(true);
const categories = ref<Category[]>([]);
const posts = ref<Post[]>([]);
const view = ref<'posts' | 'editor'>('posts');
const editingPost = ref<Post | null>(null);
const errorMessage = ref('');
const authLoading = ref(false);
const authView = ref<'login' | 'signup'>('login');

const isAuthenticated = computed(() => !!session.value);

const pageTitle = computed(() => {
  if (view.value === 'editor') {
    return editingPost.value ? 'แก้ไขบทความ' : 'สร้างบทความใหม่';
  }
  return 'แดชบอร์ด';
});

const pageSubtitle = computed(() => {
  if (view.value === 'editor') {
    return 'กรอกข้อมูลบทความและบันทึก';
  }
  return `จัดการบทความทั้งหมด ${posts.value.length} รายการ`;
});

const NON_ADMIN_ERROR =
  'อีเมลนี้ยังไม่ได้รับสิทธิ์แอดมิน กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มอีเมลในรายการ admin_users';

const displayError = computed(() => configError.value || errorMessage.value);

function decodeOAuthDescription(raw: string | null): string {
  if (!raw) return '';
  try {
    return decodeURIComponent(raw.replace(/\+/g, ' '));
  } catch {
    return raw;
  }
}

function mapAuthErrorMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
  }
  if (lower.includes('email not confirmed')) {
    return 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ (ตรวจกล่องจดหมายหรือปิด Confirm email ใน Supabase สำหรับ dev)';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'อีเมลนี้ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบแทน';
  }
  if (lower.includes('password should be at least') || lower.includes('weak password')) {
    return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
  }
  if (lower.includes('signup is disabled')) {
    return 'การลงทะเบียนถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
  }
  if (lower.includes('code verifier') || lower.includes('pkce')) {
    return 'เข้าสู่ระบบไม่สำเร็จ: ไม่พบ PKCE state (ลองกดเข้าสู่ระบบใหม่ในหน้าต่างเดิม ห้ามเปิดลิงก์จากอีเมล/แท็บอื่น)';
  }
  if (lower.includes('invalid grant') || lower.includes('auth code')) {
    return 'เข้าสู่ระบบไม่สำเร็จ: รหัส OAuth หมดอายุหรือใช้แล้ว กรุณากดเข้าสู่ระบบด้วย Google อีกครั้ง';
  }
  if (lower.includes('redirect') || lower.includes('not allowed')) {
    return `เข้าสู่ระบบไม่สำเร็จ: Redirect URL ไม่ได้รับอนุญาต — เพิ่ม ${getAdminRedirectUrl()} ใน Supabase → Authentication → URL Configuration → Redirect URLs`;
  }
  return `เข้าสู่ระบบไม่สำเร็จ: ${message}`;
}

function hasAuthCallbackParams(): boolean {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return (
    query.has('code') ||
    query.has('error') ||
    hash.has('access_token') ||
    hash.has('error')
  );
}

function cleanAuthUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  url.searchParams.delete('error');
  url.searchParams.delete('error_description');
  url.searchParams.delete('error_code');
  url.hash = '';
  window.history.replaceState({}, '', url.pathname);
}

function readOAuthCallbackError(): string | null {
  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  const oauthError = queryParams.get('error') ?? hashParams.get('error');
  if (!oauthError) return null;

  const description = decodeOAuthDescription(
    queryParams.get('error_description') ?? hashParams.get('error_description'),
  );

  if (description) return mapAuthErrorMessage(description);
  if (oauthError === 'access_denied') return 'คุณยกเลิกการเข้าสู่ระบบด้วย Google';
  return mapAuthErrorMessage(oauthError);
}

async function handleAuthCallback(): Promise<void> {
  const oauthError = readOAuthCallbackError();
  if (oauthError) {
    errorMessage.value = oauthError;
    cleanAuthUrl();
  }
}

async function loadSession() {
  if (!supabase.value) return;

  const { data, error } = await supabase.value.auth.getSession();
  if (error) {
    errorMessage.value = mapAuthErrorMessage(error.message);
    session.value = null;
    return;
  }
  session.value = data.session;
}

async function verifyAdminAccess(): Promise<boolean> {
  if (!supabase.value) return false;

  const { data, error } = await supabase.value.rpc('is_admin');

  if (error) {
    await supabase.value.auth.signOut();
    session.value = null;
    errorMessage.value =
      'ไม่สามารถตรวจสอบสิทธิ์แอดมินได้ กรุณารัน migration 002_admin_rpc_grant.sql ใน Supabase';
    return false;
  }

  if (!data) {
    const email = session.value?.user?.email;
    await supabase.value.auth.signOut();
    session.value = null;
    errorMessage.value = email
      ? `${NON_ADMIN_ERROR} (อีเมลที่ใช้: ${email})`
      : NON_ADMIN_ERROR;
    return false;
  }

  return true;
}

async function loadData() {
  if (!supabase.value) return;

  const [categoriesRes, postsRes] = await Promise.all([
    supabase.value.from('categories').select('*').order('name'),
    supabase.value.from('posts').select('*, categories(*)').order('updated_at', { ascending: false }),
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (postsRes.error) throw postsRes.error;

  categories.value = categoriesRes.data ?? [];
  posts.value = (postsRes.data ?? []) as Post[];
}

async function initSession() {
  if (session.value) {
    const isAdmin = await verifyAdminAccess();
    if (isAdmin) {
      await loadData();
    }
  }
}

async function init() {
  if (!supabase.value) {
    loading.value = false;
    return;
  }

  const hadAuthCallback = hasAuthCallbackParams();

  try {
    await handleAuthCallback();
    await loadSession();

    if (hadAuthCallback && !errorMessage.value) {
      if (!session.value) {
        errorMessage.value =
          'เข้าสู่ระบบไม่สำเร็จหลัง redirect จาก Google — ตรวจ Redirect URLs ใน Supabase ว่ามี ' +
          `${getAdminRedirectUrl()} และ redeploy Vercel หลังตั้ง env vars`;
      }
      cleanAuthUrl();
    }

    await initSession();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
}

async function handleGoogleLogin() {
  if (!supabase.value) {
    errorMessage.value = configError.value || 'ยังไม่ได้ตั้งค่า Supabase';
    return;
  }

  errorMessage.value = '';
  authLoading.value = true;
  try {
    const { error } = await supabase.value.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAdminRedirectUrl(),
      },
    });
    if (error) errorMessage.value = mapAuthErrorMessage(error.message);
  } finally {
    authLoading.value = false;
  }
}

async function handleEmailLogin({ email, password }: { email: string; password: string }) {
  if (!supabase.value) {
    errorMessage.value = configError.value || 'ยังไม่ได้ตั้งค่า Supabase';
    return;
  }

  errorMessage.value = '';
  authLoading.value = true;
  try {
    const { data, error } = await supabase.value.auth.signInWithPassword({ email, password });
    if (error) {
      errorMessage.value = mapAuthErrorMessage(error.message);
      return;
    }

    session.value = data.session;
    await initSession();
  } finally {
    authLoading.value = false;
  }
}

async function handleEmailSignup({ email, password }: { email: string; password: string }) {
  if (!supabase.value) {
    errorMessage.value = configError.value || 'ยังไม่ได้ตั้งค่า Supabase';
    return;
  }

  errorMessage.value = '';
  authLoading.value = true;
  try {
    const { data, error } = await supabase.value.auth.signUp({ email, password });
    if (error) {
      errorMessage.value = mapAuthErrorMessage(error.message);
      return;
    }

    if (!data.session) {
      errorMessage.value =
        'ลงทะเบียนสำเร็จ กรุณายืนยันอีเมลจากลิงก์ที่ส่งไปก่อนเข้าสู่ระบบ (หรือปิด Confirm email ใน Supabase สำหรับ dev)';
      authView.value = 'login';
      return;
    }

    session.value = data.session;
    await initSession();
  } finally {
    authLoading.value = false;
  }
}

async function handleLogout() {
  if (!supabase.value) return;

  await supabase.value.auth.signOut();
  session.value = null;
  posts.value = [];
  view.value = 'posts';
  errorMessage.value = '';
}

function openCreate() {
  editingPost.value = null;
  view.value = 'editor';
}

function openEdit(post: Post) {
  editingPost.value = post;
  view.value = 'editor';
}

function backToTable() {
  view.value = 'posts';
  editingPost.value = null;
}

function handleNavigate(navView: 'posts' | 'editor') {
  if (navView === 'posts') {
    backToTable();
  } else {
    openCreate();
  }
}

async function handleSave(form: PostFormData) {
  if (!supabase.value) return;

  errorMessage.value = '';
  const payload = {
    title: form.title,
    slug: form.slug,
    content: form.content,
    summary: form.summary || null,
    image_url: form.image_url || null,
    category_id: form.category_id || null,
    status: form.status,
    affiliate_url: form.affiliate_url || null,
    updated_at: new Date().toISOString(),
  };

  const result = editingPost.value
    ? await supabase.value.from('posts').update(payload).eq('id', editingPost.value.id)
    : await supabase.value.from('posts').insert(payload);

  if (result.error) {
    errorMessage.value = result.error.message;
    return;
  }

  await loadData();
  backToTable();
}

async function handleDelete(postId: string) {
  if (!supabase.value) return;
  if (!confirm('ยืนยันการลบบทความนี้?')) return;

  const { error } = await supabase.value.from('posts').delete().eq('id', postId);
  if (error) {
    errorMessage.value = error.message;
    return;
  }

  await loadData();
}

onMounted(() => {
  if (!supabase.value) {
    loading.value = false;
    return;
  }

  supabase.value.auth.onAuthStateChange(async (event, newSession) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      session.value = newSession;
      if (newSession) {
        await initSession();
      }
    } else if (event === 'SIGNED_OUT') {
      session.value = null;
      posts.value = [];
    }
  });

  init();
});
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex min-h-svh items-center justify-center bg-slate-50">
      <div class="flex flex-col items-center gap-3">
        <div class="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        <p class="text-sm text-slate-500">กำลังโหลด...</p>
      </div>
    </div>

    <!-- Auth: login-02 / signup-02 (split layout) -->
    <AdminLogin
      v-else-if="!isAuthenticated && authView === 'login'"
      :error="displayError"
      :loading="authLoading"
      @email-login="handleEmailLogin"
      @google-login="handleGoogleLogin"
      @show-signup="authView = 'signup'"
    />
    <AdminSignup
      v-else-if="!isAuthenticated && authView === 'signup'"
      :error="displayError"
      :loading="authLoading"
      @email-signup="handleEmailSignup"
      @google-login="handleGoogleLogin"
      @show-login="authView = 'login'"
    />

    <!-- Dashboard (dashboard-01) -->
    <AdminDashboardLayout
      v-else
      :current-view="view"
      :user-email="session?.user?.email"
      :page-title="pageTitle"
      :page-subtitle="pageSubtitle"
      @navigate="handleNavigate"
      @logout="handleLogout"
    >
      <div v-if="displayError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ displayError }}
      </div>

      <!-- Stats cards (dashboard-01 pattern) -->
      <div v-if="view === 'posts'" class="mb-6 grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">บทความทั้งหมด</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">{{ posts.length }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">เผยแพร่แล้ว</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">
            {{ posts.filter((p) => p.status === 'published').length }}
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p class="text-xs font-medium uppercase tracking-wider text-slate-500">ฉบับร่าง</p>
          <p class="mt-1 text-2xl font-bold text-slate-900">
            {{ posts.filter((p) => p.status === 'draft').length }}
          </p>
        </div>
      </div>

      <PostsTable
        v-if="view === 'posts'"
        :posts="posts"
        @create="openCreate"
        @edit="openEdit"
        @delete="handleDelete"
      />

      <PostEditor
        v-else
        :post="editingPost"
        :categories="categories"
        @save="handleSave"
        @cancel="backToTable"
      />
    </AdminDashboardLayout>
  </div>
</template>
