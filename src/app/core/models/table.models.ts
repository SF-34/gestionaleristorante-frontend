export interface RestaurantTable {
  id: number;
  name: string;
  capacity: number;
  status: string;
}

export interface UpsertTableRequest {
  name: string;
  capacity: number;
  status: string;
}
