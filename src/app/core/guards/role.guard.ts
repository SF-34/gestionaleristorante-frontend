import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleId } from '../models/role-id.enum';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const roles = (route.data['roles'] as RoleId[] | undefined) ?? [];
    if (roles.length === 0) {
      return true;
    }

    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }

    if (this.authService.hasAnyRole(roles)) {
      return true;
    }

    return this.router.createUrlTree(['/forbidden']);
  }
}
