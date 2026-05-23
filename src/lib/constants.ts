/** Mapeo de estados de pedido a labels en español */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En proceso",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

/** Colores de badge por estado de pedido */
export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "danger",
};

/** Mapeo de estados de pago a labels */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  REFUNDED: "Reembolsado",
  CANCELLED: "Cancelado",
};

/** Mapeo de métodos de pago a labels */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  CREDIT_CARD: "Tarjeta de crédito",
  DEBIT_CARD: "Tarjeta de débito",
  MERCADO_PAGO: "Mercado Pago",
  STRIPE: "Stripe",
  OTHER: "Otro",
};

/** Rutas públicas que no requieren autenticación */
export const PUBLIC_ROUTES = [
  "/",
  "/products",
  "/login",
  "/register",
] as const;

/** Rutas que requieren rol ADMIN */
export const ADMIN_ROUTES = ["/admin"] as const;

/** Número de productos por página */
export const PRODUCTS_PER_PAGE = 12;
