<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import type { Category, Post, PostFormData } from '../../lib/types';
import { contentForEditor } from '../../lib/supabase';
import RichTextEditor from './RichTextEditor.vue';

const props = defineProps<{
  post: Post | null;
  categories: Category[];
}>();

const emit = defineEmits<{
  save: [form: PostFormData];
  cancel: [];
}>();

const form = reactive<PostFormData>({
  title: '',
  slug: '',
  content: '',
  summary: '',
  image_url: '',
  category_id: '',
  status: 'draft',
  affiliate_url: '',
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

watch(
  () => props.post,
  async (post) => {
    if (post) {
      form.title = post.title;
      form.slug = post.slug;
      form.content = await contentForEditor(post.content);
      form.summary = post.summary ?? '';
      form.image_url = post.image_url ?? '';
      form.category_id = post.category_id ?? '';
      form.status = post.status;
      form.affiliate_url = post.affiliate_url ?? '';
    } else {
      form.title = '';
      form.slug = '';
      form.content = '';
      form.summary = '';
      form.image_url = '';
      form.category_id = '';
      form.status = 'draft';
      form.affiliate_url = '';
    }
  },
  { immediate: true },
);

function onTitleInput() {
  if (!props.post) {
    form.slug = slugify(form.title);
  }
}

const contentError = ref(false);

function isContentEmpty(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  return !text;
}

function submit() {
  contentError.value = isContentEmpty(form.content);
  if (!form.title.trim() || !form.slug.trim() || contentError.value) {
    alert('กรุณากรอกหัวข้อ, slug และเนื้อหา');
    return;
  }
  emit('save', { ...form });
}
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="border-b border-slate-200 px-4 py-4 sm:px-6">
        <h2 class="text-base font-semibold text-slate-900">
          {{ post ? 'แก้ไขบทความ' : 'สร้างบทความใหม่' }}
        </h2>
        <p class="text-xs text-slate-500">กรอกข้อมูลบทความด้านล่าง แล้วกดบันทึก</p>
      </div>

      <form class="space-y-5 p-4 sm:p-6" @submit.prevent="submit">
        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-slate-700">หัวข้อ</label>
            <input
              v-model="form.title"
              type="text"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              required
              @input="onTitleInput"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-slate-700">Slug (URL)</label>
            <input
              v-model="form.slug"
              type="text"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              required
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-700">สรุปย่อ</label>
          <textarea
            v-model="form.summary"
            rows="2"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-slate-700">หมวดหมู่</label>
            <select
              v-model="form.category_id"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">— ไม่ระบุ —</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-slate-700">สถานะ</label>
            <select
              v-model="form.status"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="draft">ฉบับร่าง</option>
              <option value="published">เผยแพร่</option>
            </select>
          </div>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-slate-700">URL รูปปก</label>
            <input
              v-model="form.image_url"
              type="url"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="https://..."
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-medium text-slate-700">ลิงก์ Affiliate</label>
            <input
              v-model="form.affiliate_url"
              type="url"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="https://shopee.co.th/..."
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-medium text-slate-700">เนื้อหา</label>
          <RichTextEditor v-model="form.content" />
          <p v-if="contentError" class="text-xs text-red-600">กรุณากรอกเนื้อหาบทความ</p>
        </div>

        <div class="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
          <button
            type="submit"
            class="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            บันทึก
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            @click="$emit('cancel')"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
