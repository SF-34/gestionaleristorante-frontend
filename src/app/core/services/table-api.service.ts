import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { RestaurantTable, UpsertTableRequest } from '../models/table.models';

@Injectable({
  providedIn: 'root',
})
export class TableApiService {
  private readonly endpoint = `${environment.apiBaseUrl}/api/v1/tables`;

  constructor(private readonly httpClient: HttpClient) {}

  getAll(): Observable<RestaurantTable[]> {
    return this.httpClient
      .get<ApiResponse<RestaurantTable[]>>(this.endpoint)
      .pipe(map((response) => response.data ?? []));
  }

  create(request: UpsertTableRequest): Observable<RestaurantTable> {
    return this.httpClient
      .post<ApiResponse<RestaurantTable>>(this.endpoint, request)
      .pipe(map((response) => response.data as RestaurantTable));
  }

  update(id: number, request: UpsertTableRequest): Observable<RestaurantTable> {
    return this.httpClient
      .put<ApiResponse<RestaurantTable>>(`${this.endpoint}/${id}`, request)
      .pipe(map((response) => response.data as RestaurantTable));
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<null>>(`${this.endpoint}/${id}`)
      .pipe(map(() => void 0));
  }
}
