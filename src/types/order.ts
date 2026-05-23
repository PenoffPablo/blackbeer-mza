import type { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export type { OrderStatus, PaymentMethod, PaymentStatus };

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetail extends OrderListItem {
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  customerNotes?: string | null;
  items: OrderItemDetail[];
  payments: PaymentDetail[];
}

export interface OrderItemDetail {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PaymentDetail {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  paidAt?: string | null;
  createdAt: string;
}
