import type { CompressedImage } from '@/utils/image';
import type { ProfilePhoto } from './common.types';
import { apiRequest } from './http';
import type { UpdateProfileInput, UserProfile } from './user.types';

export { ApiError } from './http';

export const userService = {
  /** Perfil do usuário autenticado. */
  getMe(): Promise<UserProfile> {
    return apiRequest<UserProfile>('/me');
  },

  /** Atualiza o próprio perfil (parcial). */
  updateMe(input: UpdateProfileInput): Promise<UserProfile> {
    return apiRequest<UserProfile>('/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  /** Troca a senha (exige a atual). Sem corpo na resposta (204). */
  changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiRequest<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  /** Foto de perfil do usuário (base64). 404 quando não há. */
  getPhoto(): Promise<ProfilePhoto> {
    return apiRequest<ProfilePhoto>('/me/photo');
  },
  setPhoto(image: CompressedImage): Promise<ProfilePhoto> {
    return apiRequest<ProfilePhoto>('/me/photo', {
      method: 'PUT',
      body: JSON.stringify(image),
    });
  },
  removePhoto(): Promise<void> {
    return apiRequest<void>('/me/photo', { method: 'DELETE' });
  },
};
