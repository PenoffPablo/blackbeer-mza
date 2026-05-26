import { prisma } from "@/lib/prisma";
import type { OrderStatus, OrderType } from "@prisma/client";
import type { OrderListItem, OrderDetail } from "@/types/order";

interface CreateOrderInput {
  userId: string | null;
  addressId?: string;
  items: {
    productId: string;
    variantId?: string;
    variantName?: string;
    quantity: number;
  }[];
  couponCode?: string;
  shippingMethod?: string;
  customerNotes?: string;
  type?: OrderType;
  tableNumber?: string;
  tableSession?: string | null;
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const { userId, items, addressId, shippingMethod, customerNotes } = input;

  // Fetch products with current prices
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { variants: true },
  });

  // Build order items with price snapshots
  const orderItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

    let unitPrice = Number(product.price);
    let sku = product.sku;

    if (item.variantId) {
      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant) {
        unitPrice = variant.price ? Number(variant.price) : unitPrice;
        sku = variant.sku;
      }
    }

    return {
      productId: item.productId,
      variantId: item.variantId || undefined,
      quantity: item.quantity,
      unitPrice,
      productName: item.variantName ? `${product.name} (${item.variantName})` : product.name,
      productSku: sku,
      subtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingCost = 0; // TODO: calcular según método de envío
  const discount = 0; // TODO: aplicar cupón
  const tax = 0;
  const total = subtotal + shippingCost - discount + tax;

  const order = await prisma.$transaction(async (tx) => {
    const orderType = input.type ?? "DELIVERY";
    const sequenceName = orderType === "DINE_IN" ? "DINE_IN" : "DELIVERY_TAKE_AWAY";
    const prefix = orderType === "DINE_IN" ? "TCK-" : "PED-";

    // Upsert transaccional atómico
    const seq = await tx.orderSequence.upsert({
      where: { name: sequenceName },
      update: { value: { increment: 1 } },
      create: { name: sequenceName, value: 1 },
    });

    const orderNumber = `${prefix}${seq.value}`;

    // Create order
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: orderType === "DINE_IN" ? null : addressId,
        type: orderType,
        tableNumber: orderType === "DINE_IN" ? input.tableNumber : null,
        tableSession: input.tableSession || null,
        subtotal,
        shippingCost,
        discount,
        tax,
        total,
        shippingMethod: orderType === "DINE_IN" ? "Consumo en salón" : shippingMethod,
        customerNotes,
        items: {
          create: orderItems,
        },
      },
    });

    return newOrder;
  });

  return order.id;
}

export async function getOrdersByUser(
  userId: string
): Promise<OrderListItem[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: Number(o.total),
    itemCount: o._count.items,
    createdAt: o.createdAt.toISOString(),
  }));
}

export async function getOrderDetail(
  orderId: string,
  userId?: string
): Promise<OrderDetail | null> {
  const where: Record<string, unknown> = { id: orderId };
  if (userId) where.userId = userId;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!order) return null;
  if (userId && order.userId !== userId) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    tax: Number(order.tax),
    total: Number(order.total),
    shippingMethod: order.shippingMethod,
    trackingNumber: order.trackingNumber,
    customerNotes: order.customerNotes,
    itemCount: order.items.length,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      productSku: i.productSku,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      subtotal: Number(i.subtotal),
    })),
    payments: order.payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      status: p.status,
      transactionId: p.transactionId,
      paidAt: p.paidAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<void> {
  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}
