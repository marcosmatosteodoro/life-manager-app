'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { Loading } from '@/components/ui/Loading';
import { useProfileStore } from '@/hooks/useProfileStore';
import { toast } from '@/hooks/useToastStore';
import { ApiError, userService } from '@/services/userService';
import type { Language, Theme, UserProfile } from '@/services/user.types';
import { type CompressedImage, toDataUrl } from '@/utils/image';
import { applyTheme } from '@/utils/theme';
import { AvatarUpload } from './AvatarUpload';
import { ChangePasswordForm } from './ChangePasswordForm';
import { CustomColorsEditor } from './CustomColorsEditor';

const THEME_OPTIONS: { value: Theme; labelKey: string }[] = [
  { value: 'light', labelKey: 'themeLight' },
  { value: 'dark', labelKey: 'themeDark' },
  { value: 'custom', labelKey: 'themeCustom' },
];

const LANGUAGE_OPTIONS: { value: Language; labelKey: string }[] = [
  { value: 'pt-BR', labelKey: 'languagePt' },
  { value: 'en-US', labelKey: 'languageEn' },
];

/** Tela "Meu perfil": edita dados/preferências e troca a senha. */
export function ProfileManager() {
  const { t } = useTranslation('profile');
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
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          {t('subtitle')}
        </p>
      </div>

      <ProfilePhotoSection profile={profile} />

      {/* key por id: reinicializa o form com os valores do perfil carregado. */}
      <ProfileForm key={profile.id} profile={profile} />

      <div className="border-t border-edge pt-6">
        <h2 className="text-lg font-semibold tracking-tight text-fg">
          {t('changePasswordTitle')}
        </h2>
        <p className="mb-4 mt-1 text-sm text-fg-muted">
          {t('changePasswordSubtitle')}
        </p>
        <ChangePasswordForm />
      </div>
    </section>
  );
}

/** Foto de perfil: carrega a atual (se houver), envia nova ou remove. */
function ProfilePhotoSection({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation(['profile', 'common']);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [src, setSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Sem foto: nada a buscar (o estado já inicia null e handleRemove zera).
    if (!profile.hasPhoto) return;
    let active = true;
    void userService
      .getPhoto()
      .then((photo) => {
        if (active) setSrc(toDataUrl(photo));
      })
      .catch(() => {
        if (active) setSrc(null);
      });
    return () => {
      active = false;
    };
  }, [profile.hasPhoto]);

  async function handlePick(image: CompressedImage) {
    setBusy(true);
    try {
      const saved = await userService.setPhoto(image);
      setSrc(toDataUrl(saved));
      setProfile({ ...profile, hasPhoto: true });
      toast.success(t('profile:photoUpdated'));
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('profile:saveError')],
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    try {
      await userService.removePhoto();
      setSrc(null);
      setProfile({ ...profile, hasPhoto: false });
      toast.success(t('profile:photoRemoved'));
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('profile:saveError')],
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-fg-soft">
        {t('profile:photoLabel')}
      </span>
      <AvatarUpload
        src={src}
        alt={profile.name}
        busy={busy}
        onPick={handlePick}
        onRemove={handleRemove}
      />
    </div>
  );
}

/** Form dos dados do perfil — estado semeado por inicialização lazy (sem effect). */
function ProfileForm({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation(['profile', 'common']);
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

  // Troca de tema: aplica o preview na hora (light/dark limpam as cores custom;
  // custom mostra o editor abaixo). Só persiste ao salvar / confirmar.
  function handleThemeChange(value: Theme) {
    setTheme(value);
    applyTheme(value, profile.customColors);
  }

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
      toast.success(t('profileUpdated'));
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('saveError')],
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label={t('fieldName')} htmlFor="profile-name">
          <input
            id="profile-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldUsername')} htmlFor="profile-username">
          <input
            id="profile-username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t('fieldEmail')} htmlFor="profile-email">
          <input
            id="profile-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t('fieldHeight')} htmlFor="profile-height">
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
          <Field label={t('fieldLanguage')} htmlFor="profile-language">
            <select
              id="profile-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className={inputClass}
            >
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('fieldTheme')} htmlFor="profile-theme">
            <select
              id="profile-theme"
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value as Theme)}
              className={inputClass}
            >
              {THEME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Tema custom: editor com preview ao vivo (renderizado só quando ativo). */}
        {theme === 'custom' && <CustomColorsEditor profile={profile} />}
        <Button type="submit" disabled={saving} className="self-start">
          {saving ? t('common:saving') : t('saveProfile')}
        </Button>
      </form>
  );
}
