export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  ORGANIZER = 'organizer',
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: Role;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
  tags?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
