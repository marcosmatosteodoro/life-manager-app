import { create } from 'zustand';

export type ToastType = 'success' | 'error';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  /** Adiciona um toast. Mensagens com várias linhas viram toasts separados. */
  push: (type: ToastType, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (type, message) =>
    set((state) => ({
      toasts: [...state.toasts, { id: nextId++, type, message }],
    })),
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

/** Helpers de conveniência para sucesso/erro. */
export const toast = {
  success: (message: string) =>
    useToastStore.getState().push('success', message),
  error: (message: string) => useToastStore.getState().push('error', message),
  /** Exibe cada mensagem de erro do backend como um toast. */
  errors: (messages: string[]) =>
    messages.forEach((m) => useToastStore.getState().push('error', m)),
};
