<script setup lang="ts">
import AdminBrandLogo from './AdminBrandLogo.vue';
import AdminAuthCoverPanel from './AdminAuthCoverPanel.vue';
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
  <!-- login-02: split layout with cover panel -->
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 bg-white p-6 md:p-10">
      <AdminBrandLogo />

      <div class="flex flex-1 items-center justify-center">
        <div class="w-full max-w-xs space-y-6">
          <div class="flex flex-col gap-2">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">เข้าสู่ระบบแอดมิน</h1>
            <p class="text-sm text-balance text-slate-500">
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

          <p class="text-center text-xs text-slate-400">
            การเข้าสู่ระบบแสดงว่าคุณยอมรับนโยบายการใช้งานของ TheChoiceList
          </p>
        </div>
      </div>
    </div>

    <AdminAuthCoverPanel variant="login" />
  </div>
</template>
