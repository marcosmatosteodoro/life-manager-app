export type Theme = 'light' | 'dark' | 'custom';
export type Language = 'pt-BR' | 'en-US';
export type UserRole = 'admin' | 'member';

/** Chaves dos tokens de cor editáveis no tema custom (espelham as vars CSS). */
export type CustomColorKey =
  | 'background'
  | 'foreground'
  | 'surface'
  | 'surface-muted'
  | 'surface-subtle'
  | 'surface-inverse'
  | 'fg'
  | 'fg-soft'
  | 'fg-muted'
  | 'fg-subtle'
  | 'edge'
  | 'edge-strong'
  | 'edge-inverse';

/** Mapa (parcial) token → cor hex do tema custom. */
export type CustomColors = Partial<Record<CustomColorKey, string>>;

/** Perfil do usuário autenticado (retorno de GET/PATCH /me — sem senha). */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  heightCm: number | null;
  theme: Theme;
  language: Language;
  customColors: CustomColors | null;
  role: UserRole;
  mustChangePassword: boolean;
  hasPhoto: boolean;
}

/** Usuário na tela de administração (admin). */
export interface AppUser {
  id: number;
  username: string;
  email: string;
  name: string;
  role: UserRole;
}

/** Criação de usuário pelo admin. */
export interface CreateUserInput {
  username: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

/** Edição de usuário pelo admin (parcial; senha opcional). */
export type UpdateUserInput = Partial<{
  name: string;
  username: string;
  email: string;
  role: UserRole;
  password: string;
}>;

/** Campos editáveis do próprio perfil. */
export type UpdateProfileInput = Partial<
  Pick<
    UserProfile,
    | 'name'
    | 'username'
    | 'email'
    | 'heightCm'
    | 'theme'
    | 'language'
    | 'customColors'
  >
>;
