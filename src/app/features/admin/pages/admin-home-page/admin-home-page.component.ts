import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RoleId } from '../../../../core/models/role-id.enum';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserAccount,
} from '../../../../core/models/user.models';
import { UserApiService } from '../../../../core/services/user-api.service';

@Component({
  selector: 'app-admin-home-page',
  standalone: false,
  templateUrl: './admin-home-page.component.html',
  styleUrl: './admin-home-page.component.scss',
})
export class AdminHomePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly roleOptions = [
    { id: RoleId.Customer, label: 'Customer' },
    { id: RoleId.Kitchen, label: 'Kitchen' },
    { id: RoleId.Sala, label: 'Sala' },
    { id: RoleId.Admin, label: 'Admin' },
  ];

  readonly userForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    roleId: [RoleId.Customer, [Validators.required]],
    requirePasswordChange: [true, [Validators.required]],
  });

  users: UserAccount[] = [];
  editingUserId: number | null = null;
  isLoading = true;
  pageError: string | null = null;

  constructor(
    private readonly userApiService: UserApiService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      return;
    }

    if (this.editingUserId) {
      const updatePayload: UpdateUserRequest = {
        email: this.userForm.controls.email.value.trim(),
        firstName: this.userForm.controls.firstName.value.trim(),
        lastName: this.userForm.controls.lastName.value.trim(),
        roleId: this.userForm.controls.roleId.value,
        requirePasswordChange: this.userForm.controls.requirePasswordChange.value,
      };

      this.userApiService.update(this.editingUserId, updatePayload).subscribe({
        next: () => {
          this.resetForm();
          this.loadUsers();
        },
        error: () => {
          this.pageError = 'Aggiornamento utente non riuscito.';
        },
      });

      return;
    }

    const createPayload: CreateUserRequest = {
      email: this.userForm.controls.email.value.trim(),
      password: this.userForm.controls.password.value,
      firstName: this.userForm.controls.firstName.value.trim(),
      lastName: this.userForm.controls.lastName.value.trim(),
      roleId: this.userForm.controls.roleId.value,
      requirePasswordChange: this.userForm.controls.requirePasswordChange.value,
    };

    this.userApiService.create(createPayload).subscribe({
      next: () => {
        this.resetForm();
        this.loadUsers();
      },
      error: () => {
        this.pageError = 'Creazione utente non riuscita.';
      },
    });
  }

  editUser(user: UserAccount): void {
    this.editingUserId = user.id;
    this.userForm.setValue({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      requirePasswordChange: user.requirePasswordChange,
    });

    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();
  }

  deleteUser(id: number): void {
    this.userApiService.delete(id).subscribe({
      next: () => this.loadUsers(),
      error: () => {
        this.pageError = 'Eliminazione utente non riuscita.';
      },
    });
  }

  resetForm(): void {
    this.editingUserId = null;
    this.userForm.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      roleId: RoleId.Customer,
      requirePasswordChange: true,
    });

    this.userForm.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.controls.password.updateValueAndValidity();
  }

  getRoleLabel(roleId: number): string {
    return this.roleOptions.find((item) => item.id === roleId)?.label ?? String(roleId);
  }

  private loadUsers(): void {
    this.isLoading = true;
    this.pageError = null;

    this.userApiService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => {
        this.pageError = 'Caricamento utenti non riuscito.';
        this.isLoading = false;
      },
    });
  }
}
