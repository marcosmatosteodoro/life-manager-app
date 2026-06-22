'use client';

import { Checkbox } from '@/components/ui/Checkbox';
import type { DailyCheck, DailyCheckSkill } from '@/services/dailyCheck.types';
import { DAILY_CHECK_SKILLS } from './dailyCheckSkills';

interface TodayChecklistProps {
  today: DailyCheck;
  /** Skill que está sendo salva no momento (desabilita o checkbox). */
  savingKey: DailyCheckSkill | null;
  onToggle: (skill: DailyCheckSkill, checked: boolean) => void;
}

/** Card do dia: exibe todas as skills com checkbox e salva a cada marcação. */
export function TodayChecklist({
  today,
  savingKey,
  onToggle,
}: TodayChecklistProps) {
  const done = DAILY_CHECK_SKILLS.filter(({ key }) => today[key]).length;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Hoje</h2>
        <span className="text-sm text-neutral-500">
          {done}/{DAILY_CHECK_SKILLS.length} concluídos
        </span>
      </div>

      <div className="mt-3 flex flex-col">
        {DAILY_CHECK_SKILLS.map(({ key, label }) => (
          <Checkbox
            key={key}
            label={label}
            checked={today[key]}
            disabled={savingKey === key}
            onChange={(e) => onToggle(key, e.target.checked)}
          />
        ))}
      </div>
    </div>
  );
}
