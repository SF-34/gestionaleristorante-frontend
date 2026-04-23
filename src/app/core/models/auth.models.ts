import { RoleId } from './role-id.enum';

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  statusCode: number;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  userId: number;
  roleId: RoleId;
  requirePasswordChange: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ChangePasswordFirstLoginRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAtUtc: string;
  userId: number;
  roleId: RoleId;
  requirePasswordChange: boolean;
}

export interface JwtPayload {
  sub: string;
  roleId?: string;
  exp?: number;
}
