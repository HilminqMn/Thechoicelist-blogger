<script setup lang="ts">
import AdminBrandLogo from './AdminBrandLogo.vue';
import GoogleAuthButton from './GoogleAuthButton.vue';

defineProps<{
  error?: string;
}>();

defineEmits<{
  login: [];
  'show-signup': [];
}>();
</script>

<template>
  <!-- login-01: centered card, minimal -->
  <div class="flex min-h-svh w-full items-center justify-center bg-slate-50 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <AdminBrandLogo centered />

      <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col gap-6 p-6">
          <div class="flex flex-col gap-2 text-center">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">เข้าสู่ระบบแอดมิน</h1>
            <p class="text-sm text-slate-500">
              ใช้บัญชี Google ที่ได้รับอนุญาตเพื่อจัดการบทความและเนื้อหา
            </p>
          </div>

          <div
            v-if="error"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ error }}
          </div>

          <div class="flex flex-col gap-4">
            <GoogleAuthButton label="เข้าสู่ระบบด้วย Google" @click="$emit('login')" />

            <p class="text-center text-sm text-slate-500">
              ยังไม่มีบัญชี?
              <button
                type="button"
                class="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700"
                @click="$emit('show-signup')"
              >
                ลงทะเบียนด้วย Google
              </button>
            </p>
          </div>
        </div>
      </div>

      <p class="text-center text-xs text-slate-400">
        การเข้าสู่ระบบแสดงว่าคุณยอมรับนโยบายการใช้งานของ TheChoiceList
      </p>
    </div>
  </div>
</template>
