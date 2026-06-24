/** Grupo de flashcards retornado pela API. */
export interface FlashCardGroup {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
  /** Quantidade de flashcards (calculada em runtime no back). */
  flashCardsCount?: number;
}

export interface FlashCardGroupInput {
  name: string;
}

export interface FlashCardGroupListResponse {
  count: number;
  rows: FlashCardGroup[];
}
