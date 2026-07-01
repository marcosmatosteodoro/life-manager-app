'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { useProfileStore } from '@/hooks/useProfileStore';
import { toast } from '@/hooks/useToastStore';
import { ApiError, userService } from '@/services/userService';
import type { Language, Theme, UserProfile } from '@/services/user.types';
import { ChangePasswordForm } from './ChangePasswordForm';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'custom', label: 'Custom (em breve)' },
];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'pt-BR', label: 'Português (BR)' },
  { value: 'en-US', label: 'English (US)' },
];

/** Tela "Meu perfil": edita dados/preferências e troca a senha. */
export function ProfileManager() {
  const profile = useProfileStore((s) => s.profile);
  const loading = useProfileStore((s) => s.loading);
  const load = useProfileStore((s) => s.load);

  // Garante o perfil carregado (o AppShell já carrega, mas cobre acesso direto).
  useEffect(() => {
    if (!profile && !loading) void load();
  }, [profile, loading, load]);

  if (!profile) return <Loading />;

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-fg">
          Meu perfil
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Seus dados e preferências.
        </p>
      </div>

      {/* key por id: reinicializa o form com os valores do perfil carregado. */}
      <ProfileForm key={profile.id} profile={profile} />

      <div className="border-t border-edge pt-6">
        <h2 className="text-lg font-semibold tracking-tight text-fg">
          Trocar senha
        </h2>
        <p className="mb-4 mt-1 text-sm text-fg-muted">
          Informe a senha atual e a nova.
        </p>
        <ChangePasswordForm />
      </div>
    </section>
  );
}

/** Form dos dados do perfil — estado semeado por inicialização lazy (sem effect). */
function ProfileForm({ profile }: { profile: UserProfile }) {
  const setProfile = useProfileStore((s) => s.setProfile);
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [email, setEmail] = useState(profile.email);
  const [heightCm, setHeightCm] = useState(
    profile.heightCm != null ? String(profile.heightCm) : '',
  );
  const [theme, setTheme] = useState<Theme>(profile.theme);
  const [language, setLanguage] = useState<Language>(profile.language);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateMe({
        name,
        username,
        email,
        heightCm: heightCm.trim() === '' ? undefined : Number(heightCm),
        theme,
        language,
      });
      setProfile(updated);
      toast.success('Perfil atualizado.');
    } catch (error) {
      toast.errors(
        error instanceof ApiError
          ? error.messages
          : ['Não foi possível salvar o perfil.'],
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Nome" htmlFor="profile-name">
          <input
            id="profile-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Usuário" htmlFor="profile-username">
          <input
            id="profile-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="E-mail" htmlFor="profile-email">
          <input
            id="profile-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Altura (cm)" htmlFor="profile-height">
          <input
            id="profile-height"
            type="number"
            min={50}
            max={300}
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Tema" htmlFor="profile-theme">
          <select
            id="profile-theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className={inputClass}
          >
            {THEME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Idioma" htmlFor="profile-language">
          <select
            id="profile-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className={inputClass}
          >
            {LANGUAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" disabled={saving} className="self-start">
          {saving ? 'Salvando…' : 'Salvar perfil'}
        </Button>
      </form>
  );
}
