import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Dish, UpsertDishRequest } from '../../../../core/models/dish.models';
import { Ingredient, UpsertIngredientRequest } from '../../../../core/models/ingredient.models';
import { ORDER_STATUS, Order, OrderStatus } from '../../../../core/models/order.models';
import { DishApiService } from '../../../../core/services/dish-api.service';
import { IngredientApiService } from '../../../../core/services/ingredient-api.service';
import { OrderApiService } from '../../../../core/services/order-api.service';

@Component({
  selector: 'app-kitchen-home-page',
  standalone: false,
  templateUrl: './kitchen-home-page.component.html',
  styleUrl: './kitchen-home-page.component.scss',
})
export class KitchenHomePageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);

  readonly orderStatus = ORDER_STATUS;

  readonly dishForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    price: [10, [Validators.required, Validators.min(0.01)]],
    isAvailable: [true, [Validators.required]],
  });

  readonly ingredientForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    quantityInStock: [0, [Validators.required, Validators.min(0)]],
    unit: ['pcs', [Validators.required, Validators.maxLength(30)]],
  });

  dishes: Dish[] = [];
  ingredients: Ingredient[] = [];
  orders: Order[] = [];

  editingDishId: number | null = null;
  editingIngredientId: number | null = null;

  isLoading = true;
  pageError: string | null = null;

  constructor(
    private readonly dishApiService: DishApiService,
    private readonly ingredientApiService: IngredientApiService,
    private readonly orderApiService: OrderApiService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  saveDish(): void {
    if (this.dishForm.invalid) {
      return;
    }

    const payload: UpsertDishRequest = {
      name: this.dishForm.controls.name.value.trim(),
      description: this.dishForm.controls.description.value.trim() || null,
      price: Number(this.dishForm.controls.price.value),
      isAvailable: this.dishForm.controls.isAvailable.value,
    };

    const request$ = this.editingDishId
      ? this.dishApiService.update(this.editingDishId, payload)
      : this.dishApiService.create(payload);

    request$.subscribe({
      next: () => {
        this.resetDishForm();
        this.refreshDishes();
      },
      error: () => {
        this.pageError = 'Salvataggio piatto non riuscito.';
      },
    });
  }

  editDish(dish: Dish): void {
    this.editingDishId = dish.id;
    this.dishForm.setValue({
      name: dish.name,
      description: dish.description ?? '',
      price: dish.price,
      isAvailable: dish.isAvailable,
    });
  }

  deleteDish(dishId: number): void {
    this.dishApiService.delete(dishId).subscribe({
      next: () => this.refreshDishes(),
      error: () => {
        this.pageError = 'Eliminazione piatto non riuscita.';
      },
    });
  }

  uploadDishImage(dishId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.dishApiService.uploadImage(dishId, file).subscribe({
      next: () => this.refreshDishes(),
      error: () => {
        this.pageError = 'Upload immagine non riuscito.';
      },
    });
  }

  saveIngredient(): void {
    if (this.ingredientForm.invalid) {
      return;
    }

    const payload: UpsertIngredientRequest = {
      name: this.ingredientForm.controls.name.value.trim(),
      quantityInStock: Number(this.ingredientForm.controls.quantityInStock.value),
      unit: this.ingredientForm.controls.unit.value.trim(),
    };

    const request$ = this.editingIngredientId
      ? this.ingredientApiService.update(this.editingIngredientId, payload)
      : this.ingredientApiService.create(payload);

    request$.subscribe({
      next: () => {
        this.resetIngredientForm();
        this.refreshIngredients();
      },
      error: () => {
        this.pageError = 'Salvataggio ingrediente non riuscito.';
      },
    });
  }

  editIngredient(ingredient: Ingredient): void {
    this.editingIngredientId = ingredient.id;
    this.ingredientForm.setValue({
      name: ingredient.name,
      quantityInStock: ingredient.quantityInStock,
      unit: ingredient.unit,
    });
  }

  deleteIngredient(ingredientId: number): void {
    this.ingredientApiService.delete(ingredientId).subscribe({
      next: () => this.refreshIngredients(),
      error: () => {
        this.pageError = 'Eliminazione ingrediente non riuscita.';
      },
    });
  }

  applyKitchenTransition(orderId: number, newStatus: OrderStatus): void {
    this.orderApiService.updateStatus(orderId, newStatus).subscribe({
      next: () => this.refreshOrders(),
      error: () => {
        this.pageError = 'Transizione stato ordine non consentita.';
      },
    });
  }

  getKitchenTransitions(order: Order): Array<{ label: string; status: OrderStatus }> {
    if (order.status === ORDER_STATUS.pending) {
      return [{ label: 'Start Prep', status: ORDER_STATUS.inPreparation }];
    }

    if (order.status === ORDER_STATUS.inPreparation) {
      return [{ label: 'Mark Ready', status: ORDER_STATUS.ready }];
    }

    if (order.status === ORDER_STATUS.ready) {
      return [{ label: 'Back To Prep', status: ORDER_STATUS.inPreparation }];
    }

    return [];
  }

  resetDishForm(): void {
    this.editingDishId = null;
    this.dishForm.reset({
      name: '',
      description: '',
      price: 10,
      isAvailable: true,
    });
  }

  resetIngredientForm(): void {
    this.editingIngredientId = null;
    this.ingredientForm.reset({
      name: '',
      quantityInStock: 0,
      unit: 'pcs',
    });
  }

  private loadData(): void {
    this.isLoading = true;
    this.pageError = null;

    forkJoin({
      dishes: this.dishApiService.getPublicMenu(),
      ingredients: this.ingredientApiService.getAll(),
      orders: this.orderApiService.getBackofficeOrders(),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ dishes, ingredients, orders }) => {
          this.dishes = dishes;
          this.ingredients = ingredients;
          this.orders = orders;
        },
        error: () => {
          this.pageError = 'Caricamento area kitchen non riuscito.';
        },
      });
  }

  private refreshDishes(): void {
    this.dishApiService.getPublicMenu().subscribe({
      next: (dishes) => {
        this.dishes = dishes;
      },
      error: () => {
        this.pageError = 'Aggiornamento lista piatti non riuscito.';
      },
    });
  }

  private refreshIngredients(): void {
    this.ingredientApiService.getAll().subscribe({
      next: (ingredients) => {
        this.ingredients = ingredients;
      },
      error: () => {
        this.pageError = 'Aggiornamento lista ingredienti non riuscito.';
      },
    });
  }

  private refreshOrders(): void {
    this.orderApiService.getBackofficeOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: () => {
        this.pageError = 'Aggiornamento lista ordini non riuscito.';
      },
    });
  }
}
