import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  ApiResponse,
  AuthPayload,
  AuthSession,
  ChangePasswordFirstLoginRequest,
  JwtPayload,
  LoginRequest,
  SignupRequest,
} from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';
import { RoleId } from '../models/role-id.enum';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authApi = `${environment.apiBaseUrl}/api/v1/auth`;

  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(null);

  readonly session$ = this.sessionSubject.asObservable();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly tokenStorage: TokenStorageService
  ) {
    this.sessionSubject.next(this.tokenStorage.getSession());
  }

  get session(): AuthSession | null {
    return this.sessionSubject.value;
  }

  get accessToken(): string | null {
    return this.session?.accessToken ?? null;
  }

  get refreshToken(): string | null {
    return this.session?.refreshToken ?? null;
  }

  get roleId(): RoleId | null {
    return this.session?.roleId ?? this.getRoleFromToken();
  }

  isAuthenticated(): boolean {
    const token = this.accessToken;
    if (!token) {
      return false;
    }

    const payload = this.parseJwt(token);
    if (!payload?.exp) {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  }

  hasAnyRole(roles: RoleId[]): boolean {
    const currentRole = this.roleId;
    if (!currentRole) {
      return false;
    }

    return roles.includes(currentRole) || currentRole === RoleId.Admin;
  }

  login(request: LoginRequest): Observable<AuthSession> {
    return this.httpClient
      .post<ApiResponse<AuthPayload>>(`${this.authApi}/login`, request)
      .pipe(map((response) => this.persistSession(this.requirePayload(response.data))));
  }

  signup(request: SignupRequest): Observable<AuthSession> {
    return this.httpClient
      .post<ApiResponse<AuthPayload>>(`${this.authApi}/signup`, request)
      .pipe(map((response) => this.persistSession(this.requirePayload(response.data))));
  }

  refreshAccessToken(): Observable<AuthSession | null> {
    const refreshToken = this.refreshToken;
    if (!refreshToken) {
      return of(null);
    }

    return this.httpClient
      .post<ApiResponse<AuthPayload>>(`${this.authApi}/refresh`, {
        refreshToken,
      })
      .pipe(
        map((response) => this.persistSession(this.requirePayload(response.data))),
        catchError(() => {
          this.clearSession();
          return of(null);
        })
      );
  }

  logout(): Observable<void> {
    const refreshToken = this.refreshToken;
    if (!refreshToken) {
      this.clearSession();
      return of(void 0);
    }

    return this.httpClient
      .post<ApiResponse<null>>(`${this.authApi}/logout`, { refreshToken })
      .pipe(
        map(() => void 0),
        catchError(() => of(void 0)),
        tap(() => this.clearSession())
      );
  }

  changePasswordFirstLogin(
    request: ChangePasswordFirstLoginRequest
  ): Observable<void> {
    return this.httpClient
      .post<ApiResponse<null>>(`${this.authApi}/change-password-first-login`, request)
      .pipe(
        map(() => void 0),
        switchMap(() => this.refreshAccessToken()),
        map(() => void 0),
        catchError((error) => throwError(() => error))
      );
  }

  clearSession(): void {
    this.tokenStorage.clearSession();
    this.sessionSubject.next(null);
  }

  private requirePayload(payload: AuthPayload | null): AuthPayload {
    if (!payload) {
      throw new Error('Missing auth payload.');
    }

    return payload;
  }

  private persistSession(payload: AuthPayload): AuthSession {
    const session: AuthSession = {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      accessTokenExpiresAtUtc: payload.accessTokenExpiresAtUtc,
      roleId: payload.roleId,
      userId: payload.userId,
      requirePasswordChange: payload.requirePasswordChange,
    };

    this.tokenStorage.setSession(session);
    this.sessionSubject.next(session);
    return session;
  }

  private getRoleFromToken(): RoleId | null {
    const token = this.accessToken;
    if (!token) {
      return null;
    }

    const payload = this.parseJwt(token);
    if (!payload) {
      return null;
    }

    const roleIdText = payload.roleId;
    if (!roleIdText) {
      return null;
    }

    const roleIdNumber = Number(roleIdText);
    if (!Number.isInteger(roleIdNumber)) {
      return null;
    }

    return roleIdNumber as RoleId;
  }

  private parseJwt(token: string): JwtPayload | null {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }
}
