<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { createBrowserSupabaseClient } from '../../lib/supabase-browser';
import AdminLogin from './AdminLogin.vue';
import AdminDashboardLayout from './AdminDashboardLayout.vue';
import PostsTable from './PostsTable.vue';
import PostEditor from './PostEditor.vue';
import type { Category, Post, PostFormData } from '../../lib/types';

const supabase = createBrowserSupabaseClient();

const session = ref<{ user: { email?: string } } | null>(null);
const loading = ref(true);
const categories = ref<Category[]>([]);
const posts = ref<Post[]>([]);
const view = ref<'posts' | 'editor'>('posts');
const editingPost = ref<Post | null>(null);
const errorMessage = ref('');

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

async function loadSession() {
  const { data } = await supabase.auth.getSession();
  session.value = data.session;
}

async function loadData() {
  const [categoriesRes, postsRes] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('posts').select('*, categories(*)').order('updated_at', { ascending: false }),
  ]);

  if (categoriesRes.error) throw categoriesRes.error;
  if (postsRes.error) throw postsRes.error;

  categories.value = categoriesRes.data ?? [];
  posts.value = (postsRes.data ?? []) as Post[];
}

async function init() {
  try {
    await loadSession();
    if (session.value) {
      await loadData();
    }
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
}

async function handleLogin() {
  errorMessage.value = '';
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/admin`,
    },
  });
  if (error) errorMessage.value = error.message;
}

async function handleLogout() {
  await supabase.auth.signOut();
  session.value = null;
  posts.value = [];
  view.value = 'posts';
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
    ? await supabase.from('posts').update(payload).eq('id', editingPost.value.id)
    : await supabase.from('posts').insert(payload);

  if (result.error) {
    errorMessage.value = result.error.message;
    return;
  }

  await loadData();
  backToTable();
}

async function handleDelete(postId: string) {
  if (!confirm('ยืนยันการลบบทความนี้?')) return;

  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) {
    errorMessage.value = error.message;
    return;
  }

  await loadData();
}

onMounted(() => {
  init();

  supabase.auth.onAuthStateChange(async (_event, newSession) => {
    session.value = newSession;
    if (newSession) {
      try {
        await loadData();
      } catch (err) {
        errorMessage.value = err instanceof Error ? err.message : 'โหลดข้อมูลไม่สำเร็จ';
      }
    }
  });
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

    <!-- Login (login-02) -->
    <AdminLogin
      v-else-if="!isAuthenticated"
      :error="errorMessage"
      @login="handleLogin"
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
      <div v-if="errorMessage" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ errorMessage }}
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
