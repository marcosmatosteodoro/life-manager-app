import type { FlashCard } from './flashCard.types';

/** Tipo do grupo: cards de texto (padrão) ou de imagem. */
export type FlashCardGroupType = 'text' | 'image';

/** Grupo de flashcards retornado pela API. */
export interface FlashCardGroup {
  id: number;
  name: string;
  /** 'text' (padrão) ou 'image' — decide os modos de estudo disponíveis. */
  type: FlashCardGroupType;
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
  /** Só enviado na criação; omitido = 'text' no back. */
  type?: FlashCardGroupType;
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
