<script setup lang="ts">
defineProps<{
  variant: 'login' | 'signup';
}>();
</script>

<template>
  <div class="relative hidden bg-slate-950 lg:block">
    <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
    <div class="absolute inset-0 opacity-20">
      <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern :id="`auth-grid-${variant}`" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" stroke-width="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" :fill="`url(#auth-grid-${variant})`" />
      </svg>
    </div>
    <div class="relative flex h-full flex-col justify-between p-10 text-white">
      <div />
      <div class="space-y-4">
        <p class="text-sm font-medium text-slate-400">The Curated List of Everything</p>
        <blockquote class="space-y-2">
          <p v-if="variant === 'login'" class="text-2xl font-semibold leading-snug">
            "คัดสรรและเผยแพร่สิ่งที่ดีที่สุดจากทั่วโลกออนไลน์ — สำหรับทีมแอดมินเท่านั้น"
          </p>
          <p v-else class="text-2xl font-semibold leading-snug">
            "เข้าร่วมทีมบรรณาธิการ — คัดสรรและเผยแพร่สิ่งที่ดีที่สุดจากทั่วโลกออนไลน์"
          </p>
          <footer class="text-sm text-slate-400">— TheChoiceList Admin</footer>
        </blockquote>
      </div>
      <div class="flex items-center gap-3">
        <div class="flex -space-x-2">
          <div class="size-8 rounded-full border-2 border-slate-950 bg-slate-700" />
          <div class="size-8 rounded-full border-2 border-slate-950 bg-slate-600" />
          <div class="size-8 rounded-full border-2 border-slate-950 bg-slate-500" />
        </div>
        <p class="text-sm text-slate-400">ทีมบรรณาธิการ TheChoiceList</p>
      </div>
    </div>
  </div>
</template>
