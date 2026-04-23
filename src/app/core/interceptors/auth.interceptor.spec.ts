import {
  HttpErrorResponse,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { AuthSession } from '../models/auth.models';
import { RoleId } from '../models/role-id.enum';

describe('AuthInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let interceptor: AuthInterceptor;

  let accessToken: string | null;
  let refreshToken: string | null;

  beforeEach(() => {
    accessToken = null;
    refreshToken = null;

    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'refreshAccessToken',
      'clearSession',
    ]);

    Object.defineProperty(authService, 'accessToken', {
      get: () => accessToken,
    });

    Object.defineProperty(authService, 'refreshToken', {
      get: () => refreshToken,
    });

    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);

    interceptor = new AuthInterceptor(authService, router);
  });

  it('adds bearer token to non-auth requests', async () => {
    accessToken = 'token-abc';
    const requests: HttpRequest<unknown>[] = [];
    const handler: HttpHandler = {
      handle: (request) => {
        requests.push(request);
        return of(new HttpResponse({ status: 200 }));
      },
    };

    await firstValueFrom(interceptor.intercept(new HttpRequest('GET', '/api/v1/orders'), handler));

    expect(requests.length).toBe(1);
    expect(requests[0].headers.get('Authorization')).toBe('Bearer token-abc');
  });

  it('does not add bearer token to auth endpoints', async () => {
    accessToken = 'token-abc';
    const requests: HttpRequest<unknown>[] = [];
    const handler: HttpHandler = {
      handle: (request) => {
        requests.push(request);
        return of(new HttpResponse({ status: 200 }));
      },
    };

    await firstValueFrom(interceptor.intercept(new HttpRequest('POST', '/api/v1/auth/login', null), handler));

    expect(requests.length).toBe(1);
    expect(requests[0].headers.has('Authorization')).toBeFalse();
  });

  it('redirects to forbidden on 403 responses', (done) => {
    const handler: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 403 })),
    };

    interceptor.intercept(new HttpRequest('GET', '/api/v1/orders'), handler).subscribe({
      next: () => done.fail('Expected error path'),
      error: () => {
        expect(router.navigate).toHaveBeenCalledWith(['/forbidden']);
        done();
      },
    });
  });

  it('refreshes token after 401 and retries the request', async () => {
    accessToken = 'old-token';
    refreshToken = 'refresh-1';
    const refreshedSession: AuthSession = {
      accessToken: 'new-token',
      refreshToken: 'refresh-2',
      accessTokenExpiresAtUtc: '2099-01-01T00:00:00Z',
      roleId: RoleId.Customer,
      userId: 100,
      requirePasswordChange: false,
    };

    authService.refreshAccessToken.and.returnValue(of(refreshedSession));

    const requests: HttpRequest<unknown>[] = [];
    const handler: HttpHandler = {
      handle: (request) => {
        requests.push(request);

        if (requests.length === 1) {
          return throwError(() => new HttpErrorResponse({ status: 401 }));
        }

        return of(new HttpResponse({ status: 200 }));
      },
    };

    await firstValueFrom(interceptor.intercept(new HttpRequest('GET', '/api/v1/orders'), handler));

    expect(authService.refreshAccessToken).toHaveBeenCalled();
    expect(requests.length).toBe(2);
    expect(requests[1].headers.get('Authorization')).toBe('Bearer new-token');
  });

  it('clears session and redirects to login when 401 occurs without refresh token', (done) => {
    refreshToken = null;
    const handler: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401 })),
    };

    interceptor.intercept(new HttpRequest('GET', '/api/v1/orders'), handler).subscribe({
      next: () => done.fail('Expected error path'),
      error: () => {
        expect(authService.clearSession).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
        done();
      },
    });
  });
});
