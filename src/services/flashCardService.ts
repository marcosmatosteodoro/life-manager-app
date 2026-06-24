import { apiRequest } from './http';
import type { FlashCard, FlashCardInput } from './flashCard.types';

export { ApiError } from './http';

export const flashCardService = {
  create(input: FlashCardInput): Promise<FlashCard> {
    return apiRequest<FlashCard>('/flash-card', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(
    id: number,
    input: Partial<FlashCardInput>,
  ): Promise<FlashCard> {
    return apiRequest<FlashCard>(`/flash-card/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/flash-card/${id}`, { method: 'DELETE' });
  },

  /** Registra acerto (true) ou erro (false) — ajusta score e lastReview. */
  review(id: number, correctAnswers: boolean): Promise<FlashCard> {
    return apiRequest<FlashCard>(`/flash-card/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ correctAnswers }),
    });
  },
};
