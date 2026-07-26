import { create } from 'zustand';

/** Opções de um diálogo (confirm/alert). Textos já traduzidos pelo chamador. */
export interface DialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Cor do botão de confirmação: 'danger' para ações destrutivas. */
  tone?: 'default' | 'danger';
}

export type DialogKind = 'confirm' | 'alert';

export interface DialogEntry extends DialogOptions {
  id: number;
  kind: DialogKind;
  /** Resolve a promise: confirm → boolean; alert → sempre true (ok). */
  resolve: (confirmed: boolean) => void;
}

interface DialogState {
  current: DialogEntry | null;
  queue: DialogEntry[];
  enqueue: (entry: Omit<DialogEntry, 'id'>) => void;
  /** Fecha o diálogo atual resolvendo a promise e puxa o próximo da fila. */
  settle: (confirmed: boolean) => void;
}

let nextId = 0;

export const useDialogStore = create<DialogState>((set, get) => ({
  current: null,
  queue: [],
  enqueue: (entry) => {
    const full: DialogEntry = { ...entry, id: nextId++ };
    // Um diálogo por vez; os demais aguardam na fila.
    if (get().current) {
      set((s) => ({ queue: [...s.queue, full] }));
    } else {
      set({ current: full });
    }
  },
  settle: (confirmed) => {
    const { current, queue } = get();
    current?.resolve(confirmed);
    const [next, ...rest] = queue;
    set({ current: next ?? null, queue: rest });
  },
}));

/**
 * API imperativa de diálogos — mesmo estilo do `toast`. Substitui os
 * `window.confirm`/`alert` nativos por um componente próprio (ver DialogHost).
 *
 *   if (await dialog.confirm({ title, description, tone: 'danger' })) { ... }
 *   await dialog.alert({ title, description });
 */
export const dialog = {
  /** Confirmação: resolve `true` (confirmou) ou `false` (cancelou/fechou). */
  confirm(options: DialogOptions): Promise<boolean> {
    return new Promise((resolve) => {
      useDialogStore.getState().enqueue({ kind: 'confirm', resolve, ...options });
    });
  },
  /** Aviso com um único botão; resolve quando o usuário fecha. */
  alert(options: DialogOptions): Promise<void> {
    return new Promise((resolve) => {
      useDialogStore.getState().enqueue({
        kind: 'alert',
        resolve: () => resolve(),
        ...options,
      });
    });
  },
};
