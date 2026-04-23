export interface Dish {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  isAvailable: boolean;
  imageUrl?: string | null;
}

export interface UpsertDishRequest {
  name: string;
  description?: string | null;
  price: number;
  isAvailable: boolean;
}
