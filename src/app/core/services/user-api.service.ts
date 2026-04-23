import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserAccount,
} from '../models/user.models';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly endpoint = `${environment.apiBaseUrl}/api/v1/users`;

  constructor(private readonly httpClient: HttpClient) {}

  getAll(): Observable<UserAccount[]> {
    return this.httpClient
      .get<ApiResponse<UserAccount[]>>(this.endpoint)
      .pipe(map((response) => response.data ?? []));
  }

  create(request: CreateUserRequest): Observable<UserAccount> {
    return this.httpClient
      .post<ApiResponse<UserAccount>>(this.endpoint, request)
      .pipe(map((response) => response.data as UserAccount));
  }

  update(id: number, request: UpdateUserRequest): Observable<UserAccount> {
    return this.httpClient
      .put<ApiResponse<UserAccount>>(`${this.endpoint}/${id}`, request)
      .pipe(map((response) => response.data as UserAccount));
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<null>>(`${this.endpoint}/${id}`)
      .pipe(map(() => void 0));
  }
}
