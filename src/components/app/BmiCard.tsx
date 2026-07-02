'use client';

import { useTranslation } from 'react-i18next';
import { useProfileStore } from '@/hooks/useProfileStore';
import { cn } from '@/utils/cn';

// Altura usada quando o perfil ainda não tem altura definida (metros).
const FALLBACK_HEIGHT_M = 1.77;

// Limites de IMC para a faixa de peso "normal" (OMS).
const HEALTHY_MIN_BMI = 18.5;
const HEALTHY_MAX_BMI = 24.9;

interface BmiCardProps {
  /** Peso mais recente (kg). */
  weightKg: number;
}

/** Card informativo: IMC do peso atual, classificação e faixa/meta saudável. */
export function BmiCard({ weightKg }: BmiCardProps) {
  const { t } = useTranslation('weight');
  const heightCm = useProfileStore((s) => s.profile?.heightCm ?? null);
  const heightM = heightCm != null ? heightCm / 100 : FALLBACK_HEIGHT_M;
  const usingFallback = heightCm == null;

  const bmi = weightKg / (heightM * heightM);
  const { labelKey, badge } = classify(bmi);
  const label = t(labelKey);

  const minHealthy = HEALTHY_MIN_BMI * heightM * heightM;
  const maxHealthy = HEALTHY_MAX_BMI * heightM * heightM;

  let goal: string;
  if (weightKg > maxHealthy) {
    goal = t('goalAbove', { kg: fmt(weightKg - maxHealthy) });
  } else if (weightKg < minHealthy) {
    goal = t('goalBelow', { kg: fmt(minHealthy - weightKg) });
  } else {
    goal = t('goalHealthy');
  }

  return (
    <div className="rounded-lg border border-edge bg-surface p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          {t('bmi')}
        </span>
        <span className="text-2xl font-semibold text-fg">
          {fmt(bmi)}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            badge,
          )}
        >
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm text-fg-muted">{goal}</p>

      <p className="mt-1 text-xs text-fg-subtle">
        {t('bmiRange', {
          height: fmt(heightM),
          min: fmt(minHealthy),
          max: fmt(maxHealthy),
          bmiMin: fmt(HEALTHY_MIN_BMI),
          bmiMax: fmt(HEALTHY_MAX_BMI),
        })}
      </p>

      {usingFallback && (
        <p className="mt-1 text-xs text-fg-subtle">
          {t('fallbackHeight')}{' '}
          <a href="/perfil" className="underline hover:text-fg">
            {t('fallbackHeightLink')}
          </a>{' '}
          {t('fallbackHeightSuffix')}
        </p>
      )}
    </div>
  );
}

/** Classificação do IMC (OMS) com cor do selo. */
function classify(bmi: number): { labelKey: string; badge: string } {
  if (bmi < 18.5) {
    return { labelKey: 'classUnderweight', badge: 'bg-amber-50 text-amber-700' };
  }
  if (bmi < 25) {
    return { labelKey: 'classNormal', badge: 'bg-emerald-50 text-emerald-700' };
  }
  if (bmi < 30) {
    return { labelKey: 'classOverweight', badge: 'bg-amber-50 text-amber-700' };
  }
  if (bmi < 35) {
    return { labelKey: 'classObese1', badge: 'bg-red-50 text-red-700' };
  }
  if (bmi < 40) {
    return { labelKey: 'classObese2', badge: 'bg-red-50 text-red-700' };
  }
  return { labelKey: 'classObese3', badge: 'bg-red-50 text-red-700' };
}

/** Formata número com 1 casa e vírgula decimal (pt-BR). */
function fmt(n: number): string {
  return n.toFixed(1).replace('.', ',');
}
