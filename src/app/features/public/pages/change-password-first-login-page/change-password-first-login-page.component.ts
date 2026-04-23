import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-change-password-first-login-page',
  standalone: false,
  templateUrl: './change-password-first-login-page.component.html',
  styleUrl: './change-password-first-login-page.component.scss',
})
export class ChangePasswordFirstLoginPageComponent {
  isSubmitting = false;
  errorMessage: string | null = null;

  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.form = this.formBuilder.nonNullable.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.changePasswordFirstLogin(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Cambio password non riuscito.';
      },
    });
  }
}
