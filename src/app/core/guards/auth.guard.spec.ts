import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let guard: AuthGuard;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    guard = new AuthGuard(authService, router);
  });

  it('returns true when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = guard.canActivate({} as unknown as ActivatedRouteSnapshot, {
      url: '/customer',
    } as unknown as RouterStateSnapshot);

    expect(result).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('redirects to login with returnUrl when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    const expectedTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(expectedTree);

    const result = guard.canActivate({} as unknown as ActivatedRouteSnapshot, {
      url: '/kitchen',
    } as unknown as RouterStateSnapshot);

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/kitchen' },
    });
    expect(result).toBe(expectedTree);
  });
});
