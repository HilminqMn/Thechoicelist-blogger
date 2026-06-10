<script setup lang="ts">
import type { Post } from '../../lib/types';

defineProps<{
  posts: Post[];
}>();

defineEmits<{
  create: [];
  edit: [post: Post];
  delete: [postId: string];
}>();

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
      <div>
        <h2 class="text-base font-semibold text-slate-900">รายการบทความ</h2>
        <p class="text-xs text-slate-500">จัดการ แก้ไข และลบบทความทั้งหมด</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        @click="$emit('create')"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        สร้างบทความใหม่
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50/80">
            <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">หัวข้อ</th>
            <th class="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 md:table-cell sm:px-6">หมวดหมู่</th>
            <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">สถานะ</th>
            <th class="hidden px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 lg:table-cell sm:px-6">อัปเดต</th>
            <th class="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">
              <span class="sr-only">จัดการ</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="posts.length === 0">
            <td colspan="5" class="px-6 py-12 text-center">
              <div class="mx-auto max-w-xs space-y-2">
                <svg class="mx-auto size-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p class="text-sm font-medium text-slate-600">ยังไม่มีบทความ</p>
                <p class="text-xs text-slate-400">เริ่มต้นด้วยการสร้างบทความแรกของคุณ</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="post in posts"
            :key="post.id"
            class="group transition hover:bg-slate-50/80"
          >
            <td class="px-4 py-3.5 sm:px-6">
              <div class="font-medium text-slate-900">{{ post.title }}</div>
              <div class="mt-0.5 text-xs text-slate-400">/{{ post.slug }}</div>
            </td>
            <td class="hidden px-4 py-3.5 text-slate-600 md:table-cell sm:px-6">
              {{ post.categories?.name ?? '—' }}
            </td>
            <td class="px-4 py-3.5 sm:px-6">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="
                  post.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/10'
                "
              >
                {{ post.status === 'published' ? 'เผยแพร่' : 'ฉบับร่าง' }}
              </span>
            </td>
            <td class="hidden px-4 py-3.5 text-slate-500 lg:table-cell sm:px-6">
              {{ formatDate(post.updated_at) }}
            </td>
            <td class="px-4 py-3.5 sm:px-6">
              <div class="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  class="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  title="แก้ไข"
                  @click="$emit('edit', post)"
                >
                  <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="inline-flex size-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                  title="ลบ"
                  @click="$emit('delete', post.id)"
                >
                  <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
