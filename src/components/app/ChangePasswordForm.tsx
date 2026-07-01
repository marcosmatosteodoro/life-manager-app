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
      <PasswordField
        id="current-password"
        label="Senha atual"
        autoComplete="current-password"
        value={current}
        onChange={setCurrent}
      />
      <PasswordField
        id="new-password"
        label="Nova senha"
        autoComplete="new-password"
        value={next}
        onChange={setNext}
      />
      <PasswordField
        id="confirm-password"
        label="Confirmar nova senha"
        autoComplete="new-password"
        value={confirm}
        onChange={setConfirm}
      />
      <Button type="submit" disabled={submitting} className="self-start">
        {submitting ? 'Salvando…' : 'Alterar senha'}
      </Button>
    </form>
  );
}

/** Campo de senha com botão de mostrar/ocultar (olho), como no login. */
function PasswordField({
  id,
  label,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-fg-subtle transition-colors hover:text-fg-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </Field>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
