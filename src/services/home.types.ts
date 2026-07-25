import type { ArticleStatus } from './article.types';

/** Dados agregados da Home (retorno de GET /home). */
export interface Dashboard {
  streak: number;
  weight: { latest: number | null; loggedThisWeek: boolean };
  todos: { done: number; total: number };
  study: { todayStatus: ArticleStatus | null };
  flashcards: { totalCards: number; groupCount: number };
  dogs: { needsWeighing: boolean };
  appliesCount: number;
  appliesToday: number;
}
