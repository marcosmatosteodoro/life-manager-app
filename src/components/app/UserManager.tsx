'use client';

import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field, inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useProfileStore } from '@/hooks/useProfileStore';
import { toast } from '@/hooks/useToastStore';
import { ApiError, userAdminService } from '@/services/userAdminService';
import type {
  AppUser,
  CreateUserInput,
  UpdateUserInput,
  UserRole,
} from '@/services/user.types';

type LoadState = 'loading' | 'loaded' | 'error';

const ROLES: UserRole[] = ['admin', 'member'];

/** CRUD de usuários (Configurações → Usuários) — só admin chega aqui. */
export function UserManager() {
  const { t } = useTranslation(['users', 'common']);
  const meId = useProfileStore((s) => s.profile?.id ?? null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<AppUser | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      setUsers(await userAdminService.list());
      setLoadState('loaded');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(input: CreateUserInput | UpdateUserInput) {
    setSubmitting(true);
    try {
      if (editing) {
        await userAdminService.update(editing.id, input as UpdateUserInput);
        toast.success(t('users:updated'));
      } else {
        await userAdminService.create(input as CreateUserInput);
        toast.success(t('users:created'));
      }
      setFormOpen(false);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteInProgress(true);
    try {
      await userAdminService.remove(deleting.id);
      toast.success(t('users:deleted'));
      setDeleting(null);
      await load();
    } catch (error) {
      toast.errors(toMessages(error, t('common:unexpectedError')));
    } finally {
      setDeleteInProgress(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            {t('users:title')}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{t('users:subtitle')}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          {t('users:new')}
        </Button>
      </div>

      <div className="mt-6">
        {loadState === 'loading' && <Loading />}
        {loadState === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {t('common:unexpectedError')}{' '}
            <button type="button" onClick={() => void load()} className="underline">
              {t('common:retry')}
            </button>
          </div>
        )}
        {loadState === 'loaded' && (
          <ul className="flex flex-col gap-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate font-medium text-fg">
                    <span className="truncate">{user.name}</span>
                    <span className="shrink-0 rounded-full border border-edge bg-surface-muted px-2 py-0.5 text-xs font-medium text-fg-muted">
                      {t(`users:role.${user.role}`)}
                    </span>
                    {user.id === meId && (
                      <span className="shrink-0 text-xs text-fg-subtle">
                        {t('users:you')}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-fg-muted">
                    @{user.username} · {user.email}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditing(user);
                      setFormOpen(true);
                    }}
                  >
                    {t('common:edit')}
                  </Button>
                  {user.id !== meId && (
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleting(user)}
                    >
                      {t('common:delete')}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={formOpen}
        title={editing ? t('users:editTitle') : t('users:newTitle')}
        onClose={() => !submitting && setFormOpen(false)}
      >
        <UserForm
          key={editing?.id ?? 'new'}
          initial={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCancel={() => !submitting && setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title={t('users:deleteTitle')}
        description={deleting ? t('users:deleteDescription', { name: deleting.name }) : ''}
        confirmLabel={t('common:delete')}
        loading={deleteInProgress}
        onConfirm={() => void confirmDelete()}
        onCancel={() => !deleteInProgress && setDeleting(null)}
      />
    </section>
  );
}

function UserForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: {
  initial: AppUser | null;
  submitting: boolean;
  onSubmit: (input: CreateUserInput | UpdateUserInput) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation(['users', 'common']);
  const [name, setName] = useState(initial?.name ?? '');
  const [username, setUsername] = useState(initial?.username ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initial?.role ?? 'member');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const base = {
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      role,
    };
    if (initial) {
      // Edição: só manda a senha se preenchida.
      onSubmit(password ? { ...base, password } : base);
    } else {
      onSubmit({ ...base, password } as CreateUserInput);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label={t('users:fieldName')} htmlFor="user-name">
        <input
          id="user-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label={t('users:fieldUsername')} htmlFor="user-username">
        <input
          id="user-username"
          type="text"
          required
          minLength={3}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label={t('users:fieldEmail')} htmlFor="user-email">
        <input
          id="user-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field
        label={initial ? t('users:fieldNewPassword') : t('users:fieldPassword')}
        htmlFor="user-password"
      >
        <input
          id="user-password"
          type="password"
          required={!initial}
          minLength={6}
          value={password}
          placeholder={initial ? t('users:passwordEditHint') : undefined}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label={t('users:roleLabel')} htmlFor="user-role">
        <select
          id="user-role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className={inputClass}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`users:role.${r}`)}
            </option>
          ))}
        </select>
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={submitting}>
          {t('common:cancel')}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? t('common:saving') : initial ? t('common:save') : t('users:create')}
        </Button>
      </div>
    </form>
  );
}

function toMessages(error: unknown, fallback: string): string[] {
  if (error instanceof ApiError) return error.messages;
  return [fallback];
}
