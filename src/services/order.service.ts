import { prisma } from "@/lib/prisma";
import type { OrderStatus, OrderType, PaymentMethod, Prisma } from "@prisma/client";
import type { OrderListItem, OrderDetail } from "@/types/order";

interface CreateOrderInput {
  userId: string | null;
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
  paymentMethod?: PaymentMethod;
  shippingAddress?: {
    street: string;
    number: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

function getTableHash(tableNumber: string): number {
  let hash = 0;
  for (let i = 0; i < tableNumber.length; i++) {
    hash = (hash << 5) - hash + tableNumber.charCodeAt(i);
    hash |= 0; // Convert a entero de 32 bits
  }
  return Math.abs(hash);
}

async function getOrCreateTableSessionTx(tx: Prisma.TransactionClient, tableNumber: string): Promise<string> {
  const activeOrder = await tx.order.findFirst({
    where: {
      tableNumber,
      type: "DINE_IN",
      status: {
        in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"]
      },
      createdAt: {
        gte: new Date(Date.now() - 6 * 60 * 60 * 1000) // Límite de seguridad: últimas 6 horas
      }
    },
    orderBy: { createdAt: "desc" },
    select: { tableSession: true }
  });

  if (activeOrder?.tableSession) {
    return activeOrder.tableSession;
  }

  const shortDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SES-${tableNumber}-${shortDate}-${randomSuffix}`;
}

export async function createOrder(input: CreateOrderInput): Promise<{ orderId: string; initPoint: string | null }> {
  const { userId, items, shippingMethod, customerNotes, type } = input;

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

  const result = await prisma.$transaction(async (tx) => {
    const orderType = type ?? "DELIVERY";

    // 1. Manejar concurrencia de sesión de salón con Advisory Lock
    let tableSession: string | null = null;
    if (orderType === "DINE_IN" && input.tableNumber) {
      const tableHash = getTableHash(input.tableNumber);
      await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${tableHash})`);
      tableSession = await getOrCreateTableSessionTx(tx, input.tableNumber);
    }

    // 2. Incrementar y resolver número de orden
    const sequenceName = orderType === "DINE_IN" ? "DINE_IN" : "DELIVERY_TAKE_AWAY";
    const prefix = orderType === "DINE_IN" ? "TCK-" : "PED-";

    const seq = await tx.orderSequence.upsert({
      where: { name: sequenceName },
      update: { value: { increment: 1 } },
      create: { name: sequenceName, value: 1 },
    });

    const orderNumber = `${prefix}${seq.value}`;

    // 3. Crear dirección de envío si aplica (Delivery/Take Away)
    let addressId: string | null = null;
    if (orderType !== "DINE_IN" && input.shippingAddress) {
      const address = await tx.address.create({
        data: {
          userId,
          street: input.shippingAddress.street,
          number: input.shippingAddress.number,
          apartment: input.shippingAddress.apartment || null,
          city: input.shippingAddress.city,
          state: input.shippingAddress.state,
          zipCode: input.shippingAddress.zipCode,
          label: "Envío pedido",
        },
      });
      addressId = address.id;
    }

    // 4. Crear la Orden
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        userId,
        addressId: orderType === "DINE_IN" ? null : addressId,
        type: orderType,
        tableNumber: orderType === "DINE_IN" ? input.tableNumber : null,
        tableSession,
        subtotal,
        shippingCost,
        discount,
        tax,
        total,
        shippingMethod: orderType === "DINE_IN" ? "Consumo en salón" : shippingMethod,
        customerNotes,
        guestName: userId ? null : input.guestName,
        guestEmail: userId ? null : input.guestEmail,
        guestPhone: userId ? null : input.guestPhone,
        items: {
          create: orderItems,
        },
      },
    });

    // 5. Crear el registro de Pago transaccional
    let initPoint: string | null = null;
    if (input.paymentMethod) {
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: total,
          method: input.paymentMethod,
          status: "PENDING",
        },
      });

      if (input.paymentMethod === "MERCADO_PAGO") {
        initPoint = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock-pref-${newOrder.id}`;
      }
    }

    return { orderId: newOrder.id, initPoint };
  });

  return result;
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
