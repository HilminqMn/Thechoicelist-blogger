<script setup lang="ts">
import { useAdminConfirm } from '../../composables/useAdminConfirm';

const { confirmState, handleConfirm, handleCancel } = useAdminConfirm();
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="confirmState.open"
        class="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
        @click.self="handleCancel"
      >
        <div
          class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="'confirm-title'"
        >
          <h3 id="confirm-title" class="text-base font-semibold text-slate-900">
            {{ confirmState.title }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-slate-600">
            {{ confirmState.message }}
          </p>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              @click="handleCancel"
            >
              {{ confirmState.cancelLabel }}
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition"
              :class="
                confirmState.variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-slate-950 hover:bg-slate-800'
              "
              @click="handleConfirm"
            >
              {{ confirmState.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
