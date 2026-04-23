import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { RoleId } from '../models/role-id.enum';

describe('RoleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let guard: RoleGuard;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
      'hasAnyRole',
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    guard = new RoleGuard(authService, router);
  });

  it('allows navigation when route has no roles metadata', () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(route);

    expect(result).toBeTrue();
    expect(authService.isAuthenticated).not.toHaveBeenCalled();
  });

  it('redirects to login when route requires roles and user is unauthenticated', () => {
    authService.isAuthenticated.and.returnValue(false);
    const expectedTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(expectedTree);
    const route = { data: { roles: [RoleId.Kitchen] } } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(route);

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(expectedTree);
  });

  it('redirects to forbidden when user lacks required role', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.hasAnyRole.and.returnValue(false);
    const expectedTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(expectedTree);
    const route = { data: { roles: [RoleId.Sala] } } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(route);

    expect(authService.hasAnyRole).toHaveBeenCalledWith([RoleId.Sala]);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/forbidden']);
    expect(result).toBe(expectedTree);
  });

  it('allows navigation when user has one of the required roles', () => {
    authService.isAuthenticated.and.returnValue(true);
    authService.hasAnyRole.and.returnValue(true);
    const route = { data: { roles: [RoleId.Admin] } } as unknown as ActivatedRouteSnapshot;

    const result = guard.canActivate(route);

    expect(result).toBeTrue();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
});
