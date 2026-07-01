'use client';

import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { toast } from '@/hooks/useToastStore';
import { ApiError, userService } from '@/services/userService';

const MIN_LEN = 8;

/**
 * Formulário de troca de senha (exige a atual). Reutilizado na tela de perfil
 * e no fluxo obrigatório do 1º login. `onSuccess` roda após trocar com sucesso.
 */
export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (next.length < MIN_LEN) {
      toast.errors([`A nova senha deve ter ao menos ${MIN_LEN} caracteres.`]);
      return;
    }
    if (next !== confirm) {
      toast.errors(['A confirmação não coincide com a nova senha.']);
      return;
    }
    setSubmitting(true);
    try {
      await userService.changePassword(current, next);
      toast.success('Senha alterada com sucesso.');
      setCurrent('');
      setNext('');
      setConfirm('');
      onSuccess?.();
    } catch (error) {
      toast.errors(
        error instanceof ApiError
          ? error.messages
          : ['Não foi possível alterar a senha.'],
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Senha atual" htmlFor="current-password">
        <input
          id="current-password"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Nova senha" htmlFor="new-password">
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Confirmar nova senha" htmlFor="confirm-password">
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? 'Salvando…' : 'Alterar senha'}
      </Button>
    </form>
  );
}
