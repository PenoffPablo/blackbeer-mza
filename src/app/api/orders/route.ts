import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/services/order.service";

const orderSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  type: z.enum(["DELIVERY", "TAKE_AWAY", "DINE_IN"]).default("DELIVERY"),
  tableNumber: z.string().optional(),
  shippingAddress: z.object({
    street: z.string().min(1, "Calle requerida"),
    number: z.string().min(1, "Número requerido"),
    apartment: z.string().optional(),
    city: z.string().min(1, "Ciudad requerida"),
    state: z.string().min(1, "Provincia requerida"),
    zipCode: z.string().min(1, "Código postal requerido"),
  }).optional(),
  paymentMethod: z.enum(["MERCADO_PAGO", "TRANSFER", "CASH"]).optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().optional(),
      variantName: z.string().optional(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "El carrito debe tener al menos un item"),
}).superRefine((data, ctx) => {
  if (data.type === "DINE_IN") {
    if (!data.tableNumber || data.tableNumber.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El número de mesa es requerido para consumo en salón",
        path: ["tableNumber"],
      });
    }
  } else {
    // Delivery o Take Away
    if (!data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El email es requerido",
        path: ["email"],
      });
    }
    if (!data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El teléfono es requerido",
        path: ["phone"],
      });
    }
    if (!data.paymentMethod) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El método de pago es requerido",
        path: ["paymentMethod"],
      });
    }
    if (data.type === "DELIVERY") {
      if (!data.shippingAddress) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La dirección de envío es requerida",
          path: ["shippingAddress"],
        });
      } else {
        const addr = data.shippingAddress;
        if (!addr.street || addr.street.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Calle requerida", path: ["shippingAddress", "street"] });
        if (!addr.number || addr.number.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Número requerido", path: ["shippingAddress", "number"] });
        if (!addr.city || addr.city.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ciudad requerida", path: ["shippingAddress", "city"] });
        if (!addr.state || addr.state.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Provincia requerida", path: ["shippingAddress", "state"] });
        if (!addr.zipCode || addr.zipCode.trim() === "") ctx.addIssue({ code: z.ZodIssueCode.custom, message: "CP requerido", path: ["shippingAddress", "zipCode"] });
      }
    }
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // 1. Determine user ID (authenticated or null for guest)
    const currentUser = await getCurrentUser();
    const userId = currentUser?.userId || null;

    // 2. Map guest contact details if not logged in
    const guestName = !userId
      ? `${validatedData.firstName} ${validatedData.lastName || ""}`.trim()
      : undefined;
    const guestEmail = !userId ? validatedData.email : undefined;
    const guestPhone = !userId ? validatedData.phone : undefined;

    // 3. Delegate order creation and transactional persistence to the service
    const { orderId, initPoint } = await createOrder({
      userId,
      items: validatedData.items,
      type: validatedData.type,
      tableNumber: validatedData.tableNumber,
      shippingAddress: validatedData.shippingAddress,
      paymentMethod: validatedData.paymentMethod,
      shippingMethod: validatedData.type === "DINE_IN"
        ? "Consumo en salón"
        : validatedData.type === "TAKE_AWAY"
          ? "Retiro por local"
          : "Correo Argentino / Envío estándar",
      customerNotes: validatedData.type === "DINE_IN"
        ? "Pedido en salón sin envío"
        : `Pago vía: ${validatedData.paymentMethod}`,
      guestName,
      guestEmail,
      guestPhone,
    });

    return NextResponse.json({
      orderId,
      initPoint,
      message: "Orden creada con éxito",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al procesar la orden" },
      { status: 500 }
    );
  }
}

