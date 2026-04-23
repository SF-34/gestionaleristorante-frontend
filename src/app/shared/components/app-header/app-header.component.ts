import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthSession } from '../../../core/models/auth.models';
import { RoleId } from '../../../core/models/role-id.enum';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  readonly roleId = RoleId;

  readonly session$: Observable<AuthSession | null>;

  readonly isAuthenticated$: Observable<boolean>;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.session$ = this.authService.session$;
    this.isAuthenticated$ = this.session$.pipe(
      map((session) => !!session && this.authService.isAuthenticated())
    );
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
