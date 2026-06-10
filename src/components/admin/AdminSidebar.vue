<script setup lang="ts">
defineProps<{
  currentView: 'posts' | 'editor' | 'categories';
  open: boolean;
}>();

defineEmits<{
  navigate: [view: 'posts' | 'editor' | 'categories'];
  close: [];
}>();

const navItems = [
  {
    id: 'posts' as const,
    label: 'บทความทั้งหมด',
    description: 'จัดการโพสต์',
    icon: 'posts',
  },
  {
    id: 'editor' as const,
    label: 'สร้างบทความใหม่',
    description: 'เขียนบทความ',
    icon: 'plus',
  },
  {
    id: 'categories' as const,
    label: 'หมวดหมู่',
    description: 'ดูหมวดหมู่',
    icon: 'folder',
  },
];

function isActive(itemId: string, currentView: string): boolean {
  if (itemId === 'posts') return currentView === 'posts';
  if (itemId === 'editor') return currentView === 'editor';
  if (itemId === 'categories') return currentView === 'categories';
  return false;
}
</script>

<template>
  <!-- Mobile overlay -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
    @click="$emit('close')"
  />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform duration-200 lg:static lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <!-- Logo -->
    <div class="flex h-14 items-center gap-2.5 border-b border-slate-800 px-5">
      <div class="flex size-8 items-center justify-center rounded-lg bg-white text-slate-950">
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-semibold text-white">TheChoiceList</p>
        <p class="text-[10px] text-slate-400">Admin Panel</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 p-3">
      <p class="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        เมนูหลัก
      </p>
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition"
        :class="
          isActive(item.id, currentView)
            ? 'bg-slate-800 text-white'
            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
        "
        @click="$emit('navigate', item.id)"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-md"
          :class="
            isActive(item.id, currentView)
              ? 'bg-slate-700 text-white'
              : 'bg-slate-900 text-slate-400'
          "
        >
          <svg v-if="item.icon === 'posts'" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <svg v-else-if="item.icon === 'plus'" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <svg v-else class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span>
          <span class="block font-medium">{{ item.label }}</span>
          <span class="block text-[11px] text-slate-500">{{ item.description }}</span>
        </span>
      </button>
    </nav>

    <!-- Footer link -->
    <div class="border-t border-slate-800 p-3">
      <a
        href="/"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-900 hover:text-slate-200"
      >
        <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        กลับหน้าบ้าน
      </a>
    </div>
  </aside>
</template>
