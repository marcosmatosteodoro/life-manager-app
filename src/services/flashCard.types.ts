/** Flashcard retornado pela API. */
export interface FlashCard {
  id: number;
  term: string;
  value: string | null;
  picture: string | null;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  lastReview: string | null;
  flashCardGroupId: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
  creatorId: number | null;
}

export interface FlashCardInput {
  term: string;
  value?: string | null;
  flashCardGroupId: number;
}
