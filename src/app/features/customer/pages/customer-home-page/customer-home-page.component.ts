import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Dish } from '../../../../core/models/dish.models';
import { ORDER_STATUS, Order } from '../../../../core/models/order.models';
import { Reservation } from '../../../../core/models/reservation.models';
import { RestaurantTable } from '../../../../core/models/table.models';
import { DishApiService } from '../../../../core/services/dish-api.service';
import { OrderApiService } from '../../../../core/services/order-api.service';
import { ReservationApiService } from '../../../../core/services/reservation-api.service';
import { TableApiService } from '../../../../core/services/table-api.service';

@Component({
  selector: 'app-customer-home-page',
  standalone: false,
  templateUrl: './customer-home-page.component.html',
  styleUrl: './customer-home-page.component.scss',
})
export class CustomerHomePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly orderStatus = ORDER_STATUS;

  readonly reservationForm = this.formBuilder.nonNullable.group({
    tableId: [0, [Validators.required, Validators.min(1)]],
    reservationAtUtc: ['', [Validators.required]],
    partySize: [2, [Validators.required, Validators.min(1), Validators.max(100)]],
    notes: [''],
  });

  readonly orderForm = this.formBuilder.nonNullable.group({
    tableId: [''],
    dishId: [0, [Validators.required, Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
    notes: [''],
  });

  tables: RestaurantTable[] = [];
  dishes: Dish[] = [];
  reservations: Reservation[] = [];
  orders: Order[] = [];

  isLoading = true;
  isSubmittingReservation = false;
  isSubmittingOrder = false;
  pageError: string | null = null;

  constructor(
    private readonly tableApiService: TableApiService,
    private readonly dishApiService: DishApiService,
    private readonly reservationApiService: ReservationApiService,
    private readonly orderApiService: OrderApiService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  submitReservation(): void {
    if (this.reservationForm.invalid || this.isSubmittingReservation) {
      return;
    }

    const formValue = this.reservationForm.getRawValue();
    this.isSubmittingReservation = true;

    this.reservationApiService
      .create({
        tableId: Number(formValue.tableId),
        reservationAtUtc: new Date(formValue.reservationAtUtc).toISOString(),
        partySize: Number(formValue.partySize),
        notes: formValue.notes?.trim() || null,
      })
      .pipe(finalize(() => (this.isSubmittingReservation = false)))
      .subscribe({
        next: () => {
          this.reservationForm.patchValue({ notes: '' });
          this.loadCustomerLists();
        },
        error: () => {
          this.pageError = 'Creazione prenotazione non riuscita.';
        },
      });
  }

  submitOrder(): void {
    if (this.orderForm.invalid || this.isSubmittingOrder) {
      return;
    }

    const formValue = this.orderForm.getRawValue();
    this.isSubmittingOrder = true;

    this.orderApiService
      .create({
        tableId: formValue.tableId ? Number(formValue.tableId) : null,
        items: [
          {
            dishId: Number(formValue.dishId),
            quantity: Number(formValue.quantity),
            notes: formValue.notes?.trim() || null,
          },
        ],
      })
      .pipe(finalize(() => (this.isSubmittingOrder = false)))
      .subscribe({
        next: () => {
          this.orderForm.patchValue({ notes: '', quantity: 1 });
          this.loadCustomerLists();
        },
        error: () => {
          this.pageError = 'Creazione comanda non riuscita.';
        },
      });
  }

  deleteReservation(reservationId: number): void {
    this.reservationApiService.delete(reservationId).subscribe({
      next: () => this.loadCustomerLists(),
      error: () => {
        this.pageError = 'Cancellazione prenotazione non riuscita.';
      },
    });
  }

  cancelOrder(orderId: number): void {
    this.orderApiService.delete(orderId).subscribe({
      next: () => this.loadCustomerLists(),
      error: () => {
        this.pageError =
          'Cancellazione comanda non consentita: puoi eliminare solo comande pending.';
      },
    });
  }

  getTableName(tableId: number): string {
    return this.tables.find((table) => table.id === tableId)?.name ?? `#${tableId}`;
  }

  private loadData(): void {
    this.isLoading = true;
    this.pageError = null;

    forkJoin({
      tables: this.tableApiService.getAll(),
      dishes: this.dishApiService.getPublicMenu(),
      reservations: this.reservationApiService.getMyReservations(),
      orders: this.orderApiService.getMyOrders(),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ tables, dishes, reservations, orders }) => {
          this.tables = tables;
          this.dishes = dishes;
          this.reservations = reservations;
          this.orders = orders;
        },
        error: () => {
          this.pageError = 'Caricamento dati customer non riuscito.';
        },
      });
  }

  private loadCustomerLists(): void {
    forkJoin({
      reservations: this.reservationApiService.getMyReservations(),
      orders: this.orderApiService.getMyOrders(),
    }).subscribe({
      next: ({ reservations, orders }) => {
        this.reservations = reservations;
        this.orders = orders;
      },
      error: () => {
        this.pageError = 'Aggiornamento liste customer non riuscito.';
      },
    });
  }
}
