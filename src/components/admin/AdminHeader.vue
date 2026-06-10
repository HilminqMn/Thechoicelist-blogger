<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  userEmail?: string;
}>();

defineEmits<{
  toggleSidebar: [];
  logout: [];
}>();
</script>

<template>
  <header class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm sm:px-6">
    <button
      type="button"
      class="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
      aria-label="เปิดเมนู"
      @click="$emit('toggleSidebar')"
    >
      <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>

    <div class="flex-1 min-w-0">
      <h1 class="truncate text-base font-semibold text-slate-900 sm:text-lg">{{ title }}</h1>
      <p v-if="subtitle" class="truncate text-xs text-slate-500">{{ subtitle }}</p>
    </div>

    <div class="flex items-center gap-3">
      <div class="hidden items-center gap-2 sm:flex">
        <div class="flex size-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
          {{ userEmail?.charAt(0).toUpperCase() ?? 'A' }}
        </div>
        <span class="max-w-[180px] truncate text-sm text-slate-600">{{ userEmail }}</span>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        @click="$emit('logout')"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span class="hidden sm:inline">ออกจากระบบ</span>
      </button>
    </div>
  </header>
</template>
