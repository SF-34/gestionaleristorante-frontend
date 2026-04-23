import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  catchError,
  filter,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshDone$ = new BehaviorSubject<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = this.authService.accessToken;
    const isAuthRequest = request.url.includes('/api/v1/auth/login')
      || request.url.includes('/api/v1/auth/signup')
      || request.url.includes('/api/v1/auth/refresh');

    const authRequest = accessToken && !isAuthRequest
      ? request.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      : request;

    return next.handle(authRequest).pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthRequest) {
          if (error instanceof HttpErrorResponse && error.status === 403) {
            this.router.navigate(['/forbidden']);
          }

          return throwError(() => error);
        }

        if (!this.authService.refreshToken) {
          this.authService.clearSession();
          this.router.navigate(['/login']);
          return throwError(() => error);
        }

        if (this.isRefreshing) {
          return this.refreshDone$.pipe(
            filter((token): token is string => !!token),
            take(1),
            switchMap((token) =>
              next.handle(
                request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${token}`,
                  },
                })
              )
            )
          );
        }

        this.isRefreshing = true;
        this.refreshDone$.next(null);

        return this.authService.refreshAccessToken().pipe(
          switchMap((session) => {
            this.isRefreshing = false;

            if (!session?.accessToken) {
              this.authService.clearSession();
              this.router.navigate(['/login']);
              return throwError(() => error);
            }

            this.refreshDone$.next(session.accessToken);

            return next.handle(
              request.clone({
                setHeaders: {
                  Authorization: `Bearer ${session.accessToken}`,
                },
              })
            );
          }),
          catchError((refreshError) => {
            this.isRefreshing = false;
            this.authService.clearSession();
            this.router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      })
    );
  }
}
