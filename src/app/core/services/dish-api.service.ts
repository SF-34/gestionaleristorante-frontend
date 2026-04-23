import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { Dish, UpsertDishRequest } from '../models/dish.models';

@Injectable({
  providedIn: 'root',
})
export class DishApiService {
  private readonly endpoint = `${environment.apiBaseUrl}/api/v1/dishes`;

  constructor(private readonly httpClient: HttpClient) {}

  getPublicMenu(): Observable<Dish[]> {
    return this.httpClient
      .get<ApiResponse<Dish[]>>(this.endpoint)
      .pipe(map((response) => response.data ?? []));
  }

  getById(id: number): Observable<Dish> {
    return this.httpClient
      .get<ApiResponse<Dish>>(`${this.endpoint}/${id}`)
      .pipe(map((response) => response.data as Dish));
  }

  create(request: UpsertDishRequest): Observable<Dish> {
    return this.httpClient
      .post<ApiResponse<Dish>>(this.endpoint, request)
      .pipe(map((response) => response.data as Dish));
  }

  update(id: number, request: UpsertDishRequest): Observable<Dish> {
    return this.httpClient
      .put<ApiResponse<Dish>>(`${this.endpoint}/${id}`, request)
      .pipe(map((response) => response.data as Dish));
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<null>>(`${this.endpoint}/${id}`)
      .pipe(map(() => void 0));
  }

  uploadImage(id: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.httpClient
      .post<ApiResponse<{ imageUrl: string }>>(`${this.endpoint}/${id}/image`, formData)
      .pipe(map((response) => response.data?.imageUrl ?? ''));
  }
}
