import type { DailyCheckSkill } from '@/services/dailyCheck.types';

/** Skills do check diário com seus rótulos exibíveis. */
export const DAILY_CHECK_SKILLS: { key: DailyCheckSkill; label: string }[] = [
  { key: 'readingSkills', label: 'Leitura (Reading)' },
  { key: 'writingSkills', label: 'Escrita (Writing)' },
  { key: 'listeningSkills', label: 'Escuta (Listening)' },
  { key: 'speakingSkills', label: 'Fala (Speaking)' },
  { key: 'applyJobs', label: 'Candidaturas a vagas' },
];
