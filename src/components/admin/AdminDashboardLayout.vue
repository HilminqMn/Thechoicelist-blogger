<script setup lang="ts">
import { ref } from 'vue';
import AdminSidebar from './AdminSidebar.vue';
import AdminHeader from './AdminHeader.vue';

defineProps<{
  currentView: 'posts' | 'editor';
  userEmail?: string;
  pageTitle: string;
  pageSubtitle?: string;
}>();

const emit = defineEmits<{
  navigate: [view: 'posts' | 'editor'];
  logout: [];
}>();

const sidebarOpen = ref(false);

function handleNavigate(view: 'posts' | 'editor') {
  emit('navigate', view);
  sidebarOpen.value = false;
}
</script>

<template>
  <div class="flex min-h-svh bg-slate-50">
    <AdminSidebar
      :current-view="currentView"
      :open="sidebarOpen"
      @navigate="handleNavigate"
      @close="sidebarOpen = false"
    />

    <div class="flex min-w-0 flex-1 flex-col">
      <AdminHeader
        :title="pageTitle"
        :subtitle="pageSubtitle"
        :user-email="userEmail"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
        @logout="$emit('logout')"
      />

      <main class="flex-1 overflow-auto p-4 sm:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
