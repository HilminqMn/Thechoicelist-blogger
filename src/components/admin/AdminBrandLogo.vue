<script setup lang="ts">
defineProps<{
  centered?: boolean;
}>();
</script>

<template>
  <a
    href="/"
    :class="[
      'flex items-center gap-2.5 font-medium text-slate-900',
      centered ? 'justify-center' : 'justify-center md:justify-start',
    ]"
  >
    <div class="flex size-8 items-center justify-center rounded-lg bg-slate-950 text-white">
      <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    </div>
    <span class="text-lg font-semibold">TheChoiceList</span>
  </a>
</template>
