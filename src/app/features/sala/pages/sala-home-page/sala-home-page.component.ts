import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Dish } from '../../../../core/models/dish.models';
import {
  CreateOrderRequest,
  ORDER_STATUS,
  Order,
  OrderStatus,
} from '../../../../core/models/order.models';
import { RestaurantTable, UpsertTableRequest } from '../../../../core/models/table.models';
import { DishApiService } from '../../../../core/services/dish-api.service';
import { OrderApiService } from '../../../../core/services/order-api.service';
import { TableApiService } from '../../../../core/services/table-api.service';

@Component({
  selector: 'app-sala-home-page',
  standalone: false,
  templateUrl: './sala-home-page.component.html',
  styleUrl: './sala-home-page.component.scss',
})
export class SalaHomePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly tableStatuses = ['available', 'reserved', 'occupied', 'out_of_service'];
  readonly orderStatus = ORDER_STATUS;

  readonly tableForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    capacity: [2, [Validators.required, Validators.min(1)]],
    status: ['available', [Validators.required]],
  });

  readonly orderForm = this.formBuilder.nonNullable.group({
    tableId: [0, [Validators.required, Validators.min(1)]],
    dishId: [0, [Validators.required, Validators.min(1)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  tables: RestaurantTable[] = [];
  dishes: Dish[] = [];
  orders: Order[] = [];

  editingTableId: number | null = null;

  isLoading = true;
  pageError: string | null = null;

  constructor(
    private readonly tableApiService: TableApiService,
    private readonly dishApiService: DishApiService,
    private readonly orderApiService: OrderApiService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  saveTable(): void {
    if (this.tableForm.invalid) {
      return;
    }

    const payload: UpsertTableRequest = {
      name: this.tableForm.controls.name.value.trim(),
      capacity: Number(this.tableForm.controls.capacity.value),
      status: this.tableForm.controls.status.value,
    };

    const request$ = this.editingTableId
      ? this.tableApiService.update(this.editingTableId, payload)
      : this.tableApiService.create(payload);

    request$.subscribe({
      next: () => {
        this.resetTableForm();
        this.refreshTables();
      },
      error: () => {
        this.pageError = 'Salvataggio tavolo non riuscito.';
      },
    });
  }

  editTable(table: RestaurantTable): void {
    this.editingTableId = table.id;
    this.tableForm.setValue({
      name: table.name,
      capacity: table.capacity,
      status: table.status,
    });
  }

  deleteTable(tableId: number): void {
    this.tableApiService.delete(tableId).subscribe({
      next: () => this.refreshTables(),
      error: () => {
        this.pageError = 'Eliminazione tavolo non riuscita.';
      },
    });
  }

  submitOrder(): void {
    if (this.orderForm.invalid) {
      return;
    }

    const payload: CreateOrderRequest = {
      tableId: Number(this.orderForm.controls.tableId.value),
      items: [
        {
          dishId: Number(this.orderForm.controls.dishId.value),
          quantity: Number(this.orderForm.controls.quantity.value),
          notes: this.orderForm.controls.notes.value.trim() || null,
        },
      ],
    };

    this.orderApiService.create(payload).subscribe({
      next: () => {
        this.orderForm.patchValue({
          dishId: 0,
          quantity: 1,
          notes: '',
        });
        this.refreshOrders();
      },
      error: () => {
        this.pageError = 'Creazione ordine non riuscita.';
      },
    });
  }

  applySalaTransition(orderId: number, newStatus: OrderStatus): void {
    this.orderApiService.updateStatus(orderId, newStatus).subscribe({
      next: () => this.refreshOrders(),
      error: () => {
        this.pageError = 'Transizione stato ordine non consentita.';
      },
    });
  }

  getSalaTransitions(order: Order): Array<{ label: string; status: OrderStatus }> {
    if (order.status === ORDER_STATUS.pending || order.status === ORDER_STATUS.inPreparation) {
      return [{ label: 'Cancella', status: ORDER_STATUS.cancelled }];
    }

    if (order.status === ORDER_STATUS.ready) {
      return [{ label: 'Segna Servito', status: ORDER_STATUS.served }];
    }

    return [];
  }

  resetTableForm(): void {
    this.editingTableId = null;
    this.tableForm.reset({
      name: '',
      capacity: 2,
      status: 'available',
    });
  }

  private loadData(): void {
    this.isLoading = true;
    this.pageError = null;

    forkJoin({
      tables: this.tableApiService.getAll(),
      dishes: this.dishApiService.getPublicMenu(),
      orders: this.orderApiService.getBackofficeOrders(),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ tables, dishes, orders }) => {
          this.tables = tables;
          this.dishes = dishes.filter((dish) => dish.isAvailable);
          this.orders = orders;

          if (this.tables.length > 0) {
            this.orderForm.patchValue({ tableId: this.tables[0].id });
          }
        },
        error: () => {
          this.pageError = 'Caricamento area sala non riuscito.';
        },
      });
  }

  private refreshTables(): void {
    this.tableApiService.getAll().subscribe({
      next: (tables) => {
        this.tables = tables;
        if (tables.length > 0 && !tables.some((table) => table.id === this.orderForm.controls.tableId.value)) {
          this.orderForm.patchValue({ tableId: tables[0].id });
        }
      },
      error: () => {
        this.pageError = 'Aggiornamento tavoli non riuscito.';
      },
    });
  }

  private refreshOrders(): void {
    this.orderApiService.getBackofficeOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: () => {
        this.pageError = 'Aggiornamento ordini non riuscito.';
      },
    });
  }
}
