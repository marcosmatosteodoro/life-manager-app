import { apiRequest } from './http';
import type {
  Article,
  ArticleInput,
  ArticleListResponse,
} from './article.types';

export { ApiError } from './http';

export const articleService = {
  list(): Promise<ArticleListResponse> {
    return apiRequest<ArticleListResponse>('/article');
  },

  create(input: ArticleInput): Promise<Article> {
    return apiRequest<Article>('/article', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: ArticleInput): Promise<Article> {
    return apiRequest<Article>(`/article/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<void> {
    return apiRequest<void>(`/article/${id}`, { method: 'DELETE' });
  },

  /**
   * Corrige o resumo do artigo via IA: o back preenche summaryCorrected (HTML)
   * e score, e retorna o artigo atualizado. Sem corpo — usa o resumo salvo.
   */
  correctSummary(id: number): Promise<Article> {
    return apiRequest<Article>(`/article/${id}/correct-summary`, {
      method: 'POST',
    });
  },
};
