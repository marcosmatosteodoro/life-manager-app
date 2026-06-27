import { apiRequest } from './http';
import type {
  Feedback,
  FeedbackListResponse,
  FeedbackPeriod,
} from './feedback.types';

export { ApiError } from './http';

export const feedbackService = {
  /** Histórico de feedbacks (mais recentes primeiro). */
  list(): Promise<FeedbackListResponse> {
    return apiRequest<FeedbackListResponse>('/feedback');
  },

  get(id: number): Promise<Feedback> {
    return apiRequest<Feedback>(`/feedback/${id}`);
  },

  /** Gera e salva um feedback do período (chamada de IA no back). */
  generate(period: FeedbackPeriod): Promise<Feedback> {
    return apiRequest<Feedback>('/feedback', {
      method: 'POST',
      body: JSON.stringify({ period }),
    });
  },
};
