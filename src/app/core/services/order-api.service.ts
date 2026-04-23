import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import {
  CreateOrderRequest,
  Order,
  OrderStatus,
  UpdateOrderStatusRequest,
} from '../models/order.models';

@Injectable({
  providedIn: 'root',
})
export class OrderApiService {
  private readonly endpoint = `${environment.apiBaseUrl}/api/v1/orders`;

  constructor(private readonly httpClient: HttpClient) {}

  getMyOrders(): Observable<Order[]> {
    return this.httpClient
      .get<ApiResponse<Order[]>>(`${this.endpoint}/my`)
      .pipe(map((response) => response.data ?? []));
  }

  getBackofficeOrders(): Observable<Order[]> {
    return this.httpClient
      .get<ApiResponse<Order[]>>(this.endpoint)
      .pipe(map((response) => response.data ?? []));
  }

  create(request: CreateOrderRequest): Observable<Order> {
    return this.httpClient
      .post<ApiResponse<Order>>(this.endpoint, request)
      .pipe(map((response) => response.data as Order));
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    const payload: UpdateOrderStatusRequest = { status };

    return this.httpClient
      .put<ApiResponse<Order>>(`${this.endpoint}/${id}/status`, payload)
      .pipe(map((response) => response.data as Order));
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<null>>(`${this.endpoint}/${id}`)
      .pipe(map(() => void 0));
  }
}
