import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { Ingredient, UpsertIngredientRequest } from '../models/ingredient.models';

@Injectable({
  providedIn: 'root',
})
export class IngredientApiService {
  private readonly endpoint = `${environment.apiBaseUrl}/api/v1/ingredients`;

  constructor(private readonly httpClient: HttpClient) {}

  getAll(): Observable<Ingredient[]> {
    return this.httpClient
      .get<ApiResponse<Ingredient[]>>(this.endpoint)
      .pipe(map((response) => response.data ?? []));
  }

  create(request: UpsertIngredientRequest): Observable<Ingredient> {
    return this.httpClient
      .post<ApiResponse<Ingredient>>(this.endpoint, request)
      .pipe(map((response) => response.data as Ingredient));
  }

  update(id: number, request: UpsertIngredientRequest): Observable<Ingredient> {
    return this.httpClient
      .put<ApiResponse<Ingredient>>(`${this.endpoint}/${id}`, request)
      .pipe(map((response) => response.data as Ingredient));
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<null>>(`${this.endpoint}/${id}`)
      .pipe(map(() => void 0));
  }
}
