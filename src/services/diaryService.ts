import { apiRequest } from './http';
import type {
  Diary,
  DiaryInput,
  DiaryListResponse,
  DiaryType,
} from './diary.types';

export { ApiError } from './http';

export const diaryService = {
  list(type: DiaryType): Promise<DiaryListResponse> {
    return apiRequest<DiaryListResponse>(`/diary?type=${type}`);
  },

  create(input: DiaryInput): Promise<Diary> {
    return apiRequest<Diary>('/diary', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: DiaryInput): Promise<Diary> {
    return apiRequest<Diary>(`/diary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/diary/${id}`, { method: 'DELETE' });
  },
};
