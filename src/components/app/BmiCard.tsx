'use client';

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
  const heightCm = useProfileStore((s) => s.profile?.heightCm ?? null);
  const heightM = heightCm != null ? heightCm / 100 : FALLBACK_HEIGHT_M;
  const usingFallback = heightCm == null;

  const bmi = weightKg / (heightM * heightM);
  const { label, badge } = classify(bmi);

  const minHealthy = HEALTHY_MIN_BMI * heightM * heightM;
  const maxHealthy = HEALTHY_MAX_BMI * heightM * heightM;

  let goal: string;
  if (weightKg > maxHealthy) {
    goal = `Faltam ${fmt(weightKg - maxHealthy)} kg para entrar na faixa saudável.`;
  } else if (weightKg < minHealthy) {
    goal = `Você está ${fmt(minHealthy - weightKg)} kg abaixo da faixa saudável.`;
  } else {
    goal = 'Você está dentro da faixa de peso saudável. 🎉';
  }

  return (
    <div className="rounded-lg border border-edge bg-surface p-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
          IMC
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
        Altura {fmt(heightM)} m · faixa saudável {fmt(minHealthy)}–
        {fmt(maxHealthy)} kg (IMC {fmt(HEALTHY_MIN_BMI)}–{fmt(HEALTHY_MAX_BMI)}).
      </p>

      {usingFallback && (
        <p className="mt-1 text-xs text-fg-subtle">
          Usando altura padrão. Defina sua altura em{' '}
          <a href="/perfil" className="underline hover:text-fg">
            Meu perfil
          </a>{' '}
          para um IMC preciso.
        </p>
      )}
    </div>
  );
}

/** Classificação do IMC (OMS) com cor do selo. */
function classify(bmi: number): { label: string; badge: string } {
  if (bmi < 18.5) {
    return { label: 'Abaixo do peso', badge: 'bg-amber-50 text-amber-700' };
  }
  if (bmi < 25) {
    return { label: 'Peso normal', badge: 'bg-emerald-50 text-emerald-700' };
  }
  if (bmi < 30) {
    return { label: 'Sobrepeso', badge: 'bg-amber-50 text-amber-700' };
  }
  if (bmi < 35) {
    return { label: 'Obesidade grau I', badge: 'bg-red-50 text-red-700' };
  }
  if (bmi < 40) {
    return { label: 'Obesidade grau II', badge: 'bg-red-50 text-red-700' };
  }
  return { label: 'Obesidade grau III', badge: 'bg-red-50 text-red-700' };
}

/** Formata número com 1 casa e vírgula decimal (pt-BR). */
function fmt(n: number): string {
  return n.toFixed(1).replace('.', ',');
}
