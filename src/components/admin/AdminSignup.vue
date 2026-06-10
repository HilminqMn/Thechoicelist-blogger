<script setup lang="ts">
import AdminBrandLogo from './AdminBrandLogo.vue';
import GoogleAuthButton from './GoogleAuthButton.vue';

defineProps<{
  error?: string;
}>();

defineEmits<{
  signup: [];
  'show-login': [];
}>();
</script>

<template>
  <!-- signup-02: split layout with cover panel -->
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 bg-white p-6 md:p-10">
      <AdminBrandLogo />

      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs space-y-6">
          <div class="space-y-2 text-center md:text-left">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">ลงทะเบียนแอดมิน</h1>
            <p class="text-sm text-slate-500">
              สมัครด้วย Google เพื่อขอสิทธิ์จัดการเนื้อหา — ต้องอยู่ในรายการ admin_users ก่อนจึงเข้าได้
            </p>
          </div>

          <div
            v-if="error"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ error }}
          </div>

          <div class="space-y-4">
            <GoogleAuthButton label="ลงทะเบียนด้วย Google" @click="$emit('signup')" />

            <p class="text-center text-sm text-slate-500 md:text-left">
              มีบัญชีอยู่แล้ว?
              <button
                type="button"
                class="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700"
                @click="$emit('show-login')"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </div>

          <p class="text-center text-xs text-slate-400 md:text-left">
            การลงทะเบียนแสดงว่าคุณยอมรับนโยบายการใช้งานของ TheChoiceList
          </p>
        </div>
      </div>
    </div>

    <div class="relative hidden bg-slate-950 lg:block">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
      <div class="absolute inset-0 opacity-20">
        <svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="signup-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" stroke-width="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#signup-grid)" />
        </svg>
      </div>
      <div class="relative flex h-full flex-col justify-between p-10 text-white">
        <div />
        <div class="space-y-4">
          <p class="text-sm font-medium text-slate-400">The Curated List of Everything</p>
          <blockquote class="space-y-2">
            <p class="text-2xl font-semibold leading-snug">
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
  </div>
</template>
