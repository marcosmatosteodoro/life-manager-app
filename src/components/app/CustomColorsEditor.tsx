'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';
import { useProfileStore } from '@/hooks/useProfileStore';
import { toast } from '@/hooks/useToastStore';
import { ApiError, userService } from '@/services/userService';
import type { CustomColors, UserProfile } from '@/services/user.types';
import {
  applyCustomVars,
  COLOR_TOKENS,
  DEFAULT_CUSTOM_COLORS,
} from '@/utils/theme';

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Semeia as cores: começa do padrão claro e sobrepõe o que o perfil já tem. */
function seed(profile: UserProfile): Required<CustomColors> {
  return { ...DEFAULT_CUSTOM_COLORS, ...(profile.customColors ?? {}) };
}

/**
 * Editor do tema custom: um seletor por token com preview AO VIVO (aplica as
 * variáveis CSS a cada edição, antes de confirmar). "Confirmar" salva no
 * navegador (store/localStorage) e no banco (`PATCH /me`).
 */
export function CustomColorsEditor({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation(['profile', 'common']);
  const setProfile = useProfileStore((s) => s.setProfile);
  const [colors, setColors] = useState<Required<CustomColors>>(() =>
    seed(profile),
  );
  const [saving, setSaving] = useState(false);

  // Ao montar, aplica a paleta atual como preview (entrar em custom já reflete).
  useEffect(() => {
    applyCustomVars(colors);
    // Só no mount: edições subsequentes aplicam via setColor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setColor(key: keyof CustomColors, value: string) {
    const next = { ...colors, [key]: value };
    setColors(next);
    if (HEX_COLOR.test(value)) applyCustomVars(next); // preview imediato
  }

  function resetDefaults() {
    setColors(DEFAULT_CUSTOM_COLORS);
    applyCustomVars(DEFAULT_CUSTOM_COLORS);
  }

  async function confirm() {
    setSaving(true);
    try {
      const updated = await userService.updateMe({
        theme: 'custom',
        customColors: colors,
      });
      setProfile(updated); // store/localStorage + reaplica
      toast.success(t('colorsSaved'));
    } catch (error) {
      toast.errors(
        error instanceof ApiError ? error.messages : [t('saveError')],
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-edge bg-surface p-4">
      <div>
        <h3 className="text-sm font-semibold text-fg">{t('customColorsTitle')}</h3>
        <p className="mt-1 text-xs text-fg-muted">{t('customColorsSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {COLOR_TOKENS.map(({ key, labelKey }) => (
          <div key={key} className="flex items-center gap-2">
            <input
              type="color"
              aria-label={t(labelKey)}
              value={colors[key]}
              onChange={(e) => setColor(key, e.target.value)}
              className="h-8 w-10 shrink-0 cursor-pointer rounded border border-edge bg-transparent"
            />
            <div className="min-w-0 flex-1">
              <label
                htmlFor={`color-${key}`}
                className="block truncate text-xs font-medium text-fg-soft"
              >
                {t(labelKey)}
              </label>
              <input
                id={`color-${key}`}
                type="text"
                value={colors[key]}
                onChange={(e) => setColor(key, e.target.value)}
                spellCheck={false}
                className={`${inputClass} font-mono text-xs`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void confirm()} disabled={saving}>
          {saving ? t('common:saving') : t('confirmColors')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={resetDefaults}
          disabled={saving}
        >
          {t('resetColors')}
        </Button>
      </div>
    </div>
  );
}
