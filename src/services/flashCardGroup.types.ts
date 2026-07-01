import type { FlashCard } from './flashCard.types';

/** Grupo de flashcards retornado pela API. */
export interface FlashCardGroup {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
  /** Quantidade de flashcards (calculada em runtime no back). */
  flashCardsCount?: number;
  /** Flashcards do grupo (vêm nas leituras do grupo). */
  flashCards?: FlashCard[];
}

export interface FlashCardGroupInput {
  name: string;
}

export interface FlashCardGroupListResponse {
  count: number;
  rows: FlashCardGroup[];
}

/** Pergunta do modo avaliação: termo + opções (uma correta = `value`). */
export interface QuizQuestion {
  /** Id do flashcard, usado para salvar o review de cada resposta. */
  id: number;
  term: string;
  /** Value correto (uma das `options`). */
  value: string;
  /** Opções embaralhadas (inclui o value correto). */
  options: string[];
}
