import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const toasts = ref<ToastItem[]>([]);
let nextId = 0;

export function useAdminToast() {
  function show(message: string, type: ToastType = 'info') {
    const id = ++nextId;
    toasts.value.push({ id, message, type });
    window.setTimeout(() => dismiss(id), 4500);
  }

  function success(message: string) {
    show(message, 'success');
  }

  function error(message: string) {
    show(message, 'error');
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, show, success, error, dismiss };
}
