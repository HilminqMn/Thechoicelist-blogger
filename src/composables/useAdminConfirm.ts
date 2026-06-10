import { reactive } from 'vue';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmState extends ConfirmOptions {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
}

const confirmState = reactive<ConfirmState>({
  open: false,
  title: 'ยืนยัน',
  message: '',
  confirmLabel: 'ยืนยัน',
  cancelLabel: 'ยกเลิก',
  variant: 'default',
  resolve: null,
});

export function useAdminConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      confirmState.title = options.title ?? 'ยืนยัน';
      confirmState.message = options.message;
      confirmState.confirmLabel = options.confirmLabel ?? 'ยืนยัน';
      confirmState.cancelLabel = options.cancelLabel ?? 'ยกเลิก';
      confirmState.variant = options.variant ?? 'default';
      confirmState.resolve = resolve;
      confirmState.open = true;
    });
  }

  function handleConfirm() {
    confirmState.resolve?.(true);
    close();
  }

  function handleCancel() {
    confirmState.resolve?.(false);
    close();
  }

  function close() {
    confirmState.open = false;
    confirmState.resolve = null;
  }

  return { confirmState, confirm, handleConfirm, handleCancel };
}
