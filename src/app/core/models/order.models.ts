export const ORDER_STATUS = {
  pending: 'pending',
  inPreparation: 'in_preparation',
  ready: 'ready',
  served: 'served',
  cancelled: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export interface OrderItem {
  id: number;
  dishId: number;
  dishName: string;
  quantity: number;
  unitPrice: number;
  notes?: string | null;
}

export interface Order {
  id: number;
  userId?: number | null;
  tableId?: number | null;
  createdByRoleId: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  tableId?: number | null;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  dishId: number;
  quantity: number;
  notes?: string | null;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
