export type ToastKind = 'success' | 'error';

export interface ToastDetail {
  kind: ToastKind;
  message: string;
}

export function toast(kind: ToastKind, message: string) {
  window.dispatchEvent(new CustomEvent<ToastDetail>('toast', { detail: { kind, message } }));
}
