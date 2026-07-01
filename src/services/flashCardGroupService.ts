import type { FlashCard } from './flashCard.types';
import { apiRequest } from './http';
import type {
  FlashCardGroup,
  FlashCardGroupInput,
  FlashCardGroupListResponse,
  QuizQuestion,
} from './flashCardGroup.types';

export { ApiError } from './http';

export const flashCardGroupService = {
  list(): Promise<FlashCardGroupListResponse> {
    return apiRequest<FlashCardGroupListResponse>('/flash-card-group');
  },

  get(id: number): Promise<FlashCardGroup> {
    return apiRequest<FlashCardGroup>(`/flash-card-group/${id}`);
  },

  /** Flashcards do grupo ordenados para a revisão (modo um a um). */
  review(id: number): Promise<FlashCard[]> {
    return apiRequest<FlashCard[]>(`/flash-card-group/${id}/review`);
  },

  /** Flashcards do grupo em ordem aleatória, para o modo bloco (combinação). */
  reviewBlock(id: number): Promise<FlashCard[]> {
    return apiRequest<FlashCard[]>(`/flash-card-group/${id}/review/block`);
  },

  /** Perguntas do modo avaliação (termo + 4 opções, uma correta). */
  reviewQuiz(id: number): Promise<QuizQuestion[]> {
    return apiRequest<QuizQuestion[]>(`/flash-card-group/${id}/review/quiz`);
  },

  create(input: FlashCardGroupInput): Promise<FlashCardGroup> {
    return apiRequest<FlashCardGroup>('/flash-card-group', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: FlashCardGroupInput): Promise<FlashCardGroup> {
    return apiRequest<FlashCardGroup>(`/flash-card-group/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/flash-card-group/${id}`, { method: 'DELETE' });
  },

  /**
   * Absorve outro grupo neste (destino = targetId): move os flashcards do
   * grupo de origem (sourceId) para o destino e exclui o grupo de origem.
   */
  absorb(targetId: number, sourceId: number): Promise<FlashCardGroup> {
    return apiRequest<FlashCardGroup>(`/flash-card-group/${targetId}/absorb`, {
      method: 'POST',
      body: JSON.stringify({ sourceId }),
    });
  },
};
