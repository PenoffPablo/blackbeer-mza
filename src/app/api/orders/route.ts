import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/services/order.service";
import bcrypt from "bcryptjs";

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

    // 1. Determine user ID (authenticated or find-or-create guest)
    const currentUser = await getCurrentUser();
    let userId = currentUser?.userId || "";

    if (!userId) {
      // Find or create customer account by email
      const userEmail = validatedData.email || `salon-mesa-${validatedData.tableNumber}-${Math.random().toString(36).substring(2, 7)}@blackbeermza.com`;
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create guest user with inactive/placeholder password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(Math.random().toString(36), salt);
        const newUser = await prisma.user.create({
          data: {
            email: userEmail,
            passwordHash,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName || "Invitado",
            phone: validatedData.phone || null,
            role: "CUSTOMER",
          },
        });
        userId = newUser.id;
      }
    }

    // 2. Create shipping address for user (only for DELIVERY or TAKE_AWAY)
    let addressId: string | undefined = undefined;
    if (validatedData.type !== "DINE_IN" && validatedData.shippingAddress) {
      const address = await prisma.address.create({
        data: {
          userId,
          street: validatedData.shippingAddress.street,
          number: validatedData.shippingAddress.number,
          apartment: validatedData.shippingAddress.apartment || null,
          city: validatedData.shippingAddress.city,
          state: validatedData.shippingAddress.state,
          zipCode: validatedData.shippingAddress.zipCode,
          label: "Envío pedido",
        },
      });
      addressId = address.id;
    }

    // 3. Create the order
    const orderId = await createOrder({
      userId,
      addressId,
      items: validatedData.items,
      type: validatedData.type,
      tableNumber: validatedData.tableNumber,
      shippingMethod: validatedData.type === "DINE_IN"
        ? "Consumo en salón"
        : validatedData.type === "TAKE_AWAY"
          ? "Retiro por local"
          : "Correo Argentino / Envío estándar",
      customerNotes: validatedData.type === "DINE_IN"
        ? "Pedido en salón sin envío"
        : `Pago vía: ${validatedData.paymentMethod}`,
    });

    // 4. Handle specific payment integration
    let initPoint = null;

    if (validatedData.paymentMethod) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order) {
        await prisma.payment.create({
          data: {
            orderId,
            amount: order.total,
            method: validatedData.paymentMethod,
            status: "PENDING",
          },
        });

        if (validatedData.paymentMethod === "MERCADO_PAGO") {
          initPoint = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock-pref-${orderId}`;
        }
      }
    }

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
