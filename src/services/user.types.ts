export type Theme = 'light' | 'dark' | 'custom';
export type Language = 'pt-BR' | 'en-US';

/** Perfil do usuário autenticado (retorno de GET/PATCH /me — sem senha). */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  heightCm: number | null;
  theme: Theme;
  language: Language;
  mustChangePassword: boolean;
}

/** Campos editáveis do próprio perfil. */
export type UpdateProfileInput = Partial<
  Pick<
    UserProfile,
    'name' | 'username' | 'email' | 'heightCm' | 'theme' | 'language'
  >
>;
