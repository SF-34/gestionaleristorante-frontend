import { Component, OnInit } from '@angular/core';
import { Dish } from '../../../../core/models/dish.models';
import { DishApiService } from '../../../../core/services/dish-api.service';

@Component({
  selector: 'app-menu-page',
  standalone: false,
  templateUrl: './menu-page.component.html',
  styleUrl: './menu-page.component.scss',
})
export class MenuPageComponent implements OnInit {
  dishes: Dish[] = [];
  isLoading = true;

  constructor(private readonly dishApiService: DishApiService) {}

  ngOnInit(): void {
    this.dishApiService.getPublicMenu().subscribe({
      next: (dishes) => {
        this.dishes = dishes;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }
}
