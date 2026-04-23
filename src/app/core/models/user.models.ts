import { RoleId } from './role-id.enum';

export interface UserAccount {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roleId: RoleId;
  requirePasswordChange: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: RoleId;
  requirePasswordChange: boolean;
}

export interface UpdateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  roleId: RoleId;
  requirePasswordChange: boolean;
}
