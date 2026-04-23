import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleId } from '../../../../core/models/role-id.enum';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent {
  isSubmitting = false;
  errorMessage: string | null = null;

  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.form = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (session) => {
        this.isSubmitting = false;

        if (session.requirePasswordChange) {
          this.router.navigate(['/change-password-first-login']);
          return;
        }

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        this.router.navigateByUrl(this.getHomeRoute(session.roleId));
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Credenziali non valide.';
      },
    });
  }

  private getHomeRoute(roleId: RoleId): string {
    switch (roleId) {
      case RoleId.Kitchen:
        return '/kitchen';
      case RoleId.Sala:
        return '/sala';
      case RoleId.Admin:
        return '/admin';
      case RoleId.Customer:
      default:
        return '/customer';
    }
  }
}
