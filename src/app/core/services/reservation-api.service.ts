import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.models';
import { CreateReservationRequest, Reservation } from '../models/reservation.models';

@Injectable({
  providedIn: 'root',
})
export class ReservationApiService {
  private readonly endpoint = `${environment.apiBaseUrl}/api/v1/reservations`;

  constructor(private readonly httpClient: HttpClient) {}

  getMyReservations(): Observable<Reservation[]> {
    return this.httpClient
      .get<ApiResponse<Reservation[]>>(`${this.endpoint}/my`)
      .pipe(map((response) => response.data ?? []));
  }

  getAllReservationsForSala(): Observable<Reservation[]> {
    return this.httpClient
      .get<ApiResponse<Reservation[]>>(this.endpoint)
      .pipe(map((response) => response.data ?? []));
  }

  create(request: CreateReservationRequest): Observable<Reservation> {
    return this.httpClient
      .post<ApiResponse<Reservation>>(this.endpoint, request)
      .pipe(map((response) => response.data as Reservation));
  }

  delete(id: number): Observable<void> {
    return this.httpClient
      .delete<ApiResponse<null>>(`${this.endpoint}/${id}`)
      .pipe(map(() => void 0));
  }
}
