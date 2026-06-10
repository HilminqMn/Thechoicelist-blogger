<script setup lang="ts">
import { reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue';
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
  'unsaved-change': [dirty: boolean];
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

const initialSnapshot = ref('');
const isDirty = ref(false);
const contentError = ref(false);
const saving = ref(false);

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function snapshotForm(): string {
  return JSON.stringify({ ...form });
}

function updateDirtyState() {
  const dirty = snapshotForm() !== initialSnapshot.value;
  isDirty.value = dirty;
  emit('unsaved-change', dirty);
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
    initialSnapshot.value = snapshotForm();
    isDirty.value = false;
    emit('unsaved-change', false);
  },
  { immediate: true },
);

watch(form, updateDirtyState, { deep: true });

function onTitleInput() {
  if (!props.post) {
    form.slug = slugify(form.title);
  }
}

function isContentEmpty(html: string): boolean {
  const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  return !text;
}

function submit(publish = false) {
  if (publish) {
    form.status = 'published';
  }

  contentError.value = isContentEmpty(form.content);
  if (!form.title.trim() || !form.slug.trim() || contentError.value) {
    return false;
  }

  saving.value = true;
  emit('save', { ...form });
  return true;
}

function handleCancel() {
  emit('cancel');
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (isDirty.value) {
    e.preventDefault();
    e.returnValue = '';
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload);
});

defineExpose({ isDirty, saving });
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
        <div>
          <h2 class="text-base font-semibold text-slate-900">
            {{ post ? 'แก้ไขบทความ' : 'สร้างบทความใหม่' }}
          </h2>
          <p class="text-xs text-slate-500">
            กรอกข้อมูลบทความด้านล่าง แล้วกดบันทึกหรือเผยแพร่
            <span v-if="isDirty" class="text-amber-600">· มีการแก้ไขที่ยังไม่ได้บันทึก</span>
          </p>
        </div>
        <button
          v-if="form.status !== 'published'"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          :disabled="saving"
          @click="submit(true)"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          เผยแพร่
        </button>
      </div>

      <form class="space-y-5 p-4 sm:p-6" @submit.prevent="submit(false)">
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
            placeholder="สรุปสั้นๆ ที่จะแสดงบนการ์ดบทความ"
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
              placeholder="https://images.unsplash.com/..."
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
            <p class="text-xs text-slate-500">
              ลิงก์ Shopee, Lazada หรือ Amazon — แสดงเป็นปุ่มสีส้มบนหน้าบทความเมื่อเผยแพร่
            </p>
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
            class="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
            :disabled="saving"
          >
            <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            บันทึก{{ form.status === 'published' ? ' (เผยแพร่)' : 'ฉบับร่าง' }}
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            @click="handleCancel"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
