<script setup lang="ts">
import { ref } from 'vue';
import AdminBrandLogo from './AdminBrandLogo.vue';
import AdminAuthCoverPanel from './AdminAuthCoverPanel.vue';
import AdminAuthField from './AdminAuthField.vue';
import AdminAuthDivider from './AdminAuthDivider.vue';
import GoogleAuthButton from './GoogleAuthButton.vue';

defineProps<{
  error?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  'email-login': [payload: { email: string; password: string }];
  'google-login': [];
  'show-signup': [];
}>();

const email = ref('');
const password = ref('');

function handleSubmit() {
  emit('email-login', { email: email.value.trim(), password: password.value });
}
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
              ใช้อีเมลและรหัสผ่าน หรือบัญชี Google ที่ได้รับอนุญาตเพื่อจัดการบทความและเนื้อหา
            </p>
          </div>

          <div
            v-if="error"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {{ error }}
          </div>

          <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
            <AdminAuthField
              id="login-email"
              v-model="email"
              label="อีเมล"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
              :disabled="loading"
            />
            <AdminAuthField
              id="login-password"
              v-model="password"
              label="รหัสผ่าน"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
              :disabled="loading"
            />

            <button
              type="submit"
              :disabled="loading"
              class="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
            </button>
          </form>

          <AdminAuthDivider />

          <div class="flex flex-col gap-4">
            <GoogleAuthButton
              label="เข้าสู่ระบบด้วย Google"
              :disabled="loading"
              @click="$emit('google-login')"
            />

            <p class="text-center text-sm text-slate-500">
              ยังไม่มีบัญชี?
              <button
                type="button"
                class="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700"
                :disabled="loading"
                @click="$emit('show-signup')"
              >
                ลงทะเบียน
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
