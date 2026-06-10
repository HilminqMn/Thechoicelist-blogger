<script setup lang="ts">
import type { Category } from '../../lib/types';

defineProps<{
  categories: Category[];
  loading?: boolean;
}>();
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-200 px-4 py-4 sm:px-6">
      <h2 class="text-base font-semibold text-slate-900">หมวดหมู่</h2>
      <p class="text-xs text-slate-500">ดูหมวดหมู่ทั้งหมดในระบบ (อ่านอย่างเดียว)</p>
    </div>

    <div v-if="loading" class="flex items-center justify-center gap-2 px-6 py-16">
      <div class="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      <span class="text-sm text-slate-500">กำลังโหลด...</span>
    </div>

    <div v-else-if="categories.length === 0" class="px-6 py-16 text-center">
      <p class="text-sm text-slate-500">ยังไม่มีหมวดหมู่</p>
    </div>

    <ul v-else class="divide-y divide-slate-100">
      <li
        v-for="cat in categories"
        :key="cat.id"
        class="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6"
      >
        <div>
          <p class="font-medium text-slate-900">{{ cat.name }}</p>
          <p class="text-xs font-mono text-slate-400">/{{ cat.slug }}</p>
        </div>
        <a
          :href="`/category/${cat.slug}`"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          ดูหน้าบ้าน
          <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </li>
    </ul>
  </div>
</template>
