export interface Ingredient {
  id: number;
  name: string;
  quantityInStock: number;
  unit: string;
}

export interface UpsertIngredientRequest {
  name: string;
  quantityInStock: number;
  unit: string;
}
