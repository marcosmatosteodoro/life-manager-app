import type { CompressedImage } from '@/utils/image';
import type { ProfilePhoto } from './common.types';
import { apiRequest } from './http';
import type {
  Dog,
  DogInput,
  DogListResponse,
  DogSex,
  DogWalk,
  DogWalkInput,
  DogWalkListResponse,
  DogWalkPageResponse,
  DogWalkLocation,
  DogWalkLocationInput,
  DogWalkLocationListResponse,
  DogWeight,
  DogWeightInput,
  DogWeightListResponse,
  DogDashboard,
} from './dog.types';

export { ApiError } from './http';

/** Ordem dos sexos para o select (rótulos via i18n `dogs:sex.<value>`). */
export const DOG_SEXES: DogSex[] = ['macho', 'femea'];

export const dogService = {
  list(): Promise<DogListResponse> {
    return apiRequest<DogListResponse>('/dog');
  },
  create(input: DogInput): Promise<Dog> {
    return apiRequest<Dog>('/dog', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: number, input: DogInput): Promise<Dog> {
    return apiRequest<Dog>(`/dog/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  remove(id: number): Promise<void> {
    return apiRequest<void>(`/dog/${id}`, { method: 'DELETE' });
  },

  /** Foto de perfil do cão (base64). 404 quando não há. */
  getPhoto(id: number): Promise<ProfilePhoto> {
    return apiRequest<ProfilePhoto>(`/dog/${id}/photo`);
  },
  setPhoto(id: number, image: CompressedImage): Promise<ProfilePhoto> {
    return apiRequest<ProfilePhoto>(`/dog/${id}/photo`, {
      method: 'PUT',
      body: JSON.stringify(image),
    });
  },
  removePhoto(id: number): Promise<void> {
    return apiRequest<void>(`/dog/${id}/photo`, { method: 'DELETE' });
  },
};

export const dogWalkLocationService = {
  list(): Promise<DogWalkLocationListResponse> {
    return apiRequest<DogWalkLocationListResponse>('/dog-walk-location');
  },
  create(input: DogWalkLocationInput): Promise<DogWalkLocation> {
    return apiRequest<DogWalkLocation>('/dog-walk-location', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: number, input: DogWalkLocationInput): Promise<DogWalkLocation> {
    return apiRequest<DogWalkLocation>(`/dog-walk-location/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },
  remove(id: number): Promise<void> {
    return apiRequest<void>(`/dog-walk-location/${id}`, { method: 'DELETE' });
  },
};

export const dogWalkService = {
  list(): Promise<DogWalkListResponse> {
    return apiRequest<DogWalkListResponse>('/dog-walk');
  },
  /** Dados agregados da página (passeios + cães + locais) em 1 requisição. */
  page(): Promise<DogWalkPageResponse> {
    return apiRequest<DogWalkPageResponse>('/dog-walk/page');
  },
  create(input: DogWalkInput): Promise<DogWalk> {
    return apiRequest<DogWalk>('/dog-walk', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  remove(id: number): Promise<void> {
    return apiRequest<void>(`/dog-walk/${id}`, { method: 'DELETE' });
  },
};

export const dogWeightService = {
  list(dogId?: number): Promise<DogWeightListResponse> {
    const qs = dogId ? `?dogId=${dogId}` : '';
    return apiRequest<DogWeightListResponse>(`/dog-weight${qs}`);
  },
  create(input: DogWeightInput): Promise<DogWeight> {
    return apiRequest<DogWeight>('/dog-weight', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  remove(id: number): Promise<void> {
    return apiRequest<void>(`/dog-weight/${id}`, { method: 'DELETE' });
  },
};

export const dogDashboardService = {
  get(): Promise<DogDashboard> {
    return apiRequest<DogDashboard>('/dog-dashboard');
  },
};
