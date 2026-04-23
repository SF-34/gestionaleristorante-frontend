export interface Reservation {
  id: number;
  userId: number;
  tableId: number;
  reservationAtUtc: string;
  partySize: number;
  notes?: string | null;
}

export interface CreateReservationRequest {
  tableId: number;
  reservationAtUtc: string;
  partySize: number;
  notes?: string | null;
}
