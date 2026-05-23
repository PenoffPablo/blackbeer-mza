import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/services/order.service";
import bcrypt from "bcryptjs";

const orderSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  phone: z.string().min(1, "Teléfono requerido"),
  shippingAddress: z.object({
    street: z.string().min(1, "Calle requerida"),
    number: z.string().min(1, "Número requerido"),
    apartment: z.string().optional(),
    city: z.string().min(1, "Ciudad requerida"),
    state: z.string().min(1, "Provincia requerida"),
    zipCode: z.string().min(1, "Código postal requerido"),
  }),
  paymentMethod: z.enum(["MERCADO_PAGO", "TRANSFER", "CASH"]),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().optional(),
      variantName: z.string().optional(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "El carrito debe tener al menos un item"),
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
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create guest user with inactive/placeholder password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(Math.random().toString(36), salt);
        const newUser = await prisma.user.create({
          data: {
            email: validatedData.email,
            passwordHash,
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            phone: validatedData.phone,
            role: "CUSTOMER",
          },
        });
        userId = newUser.id;
      }
    }

    // 2. Create shipping address for user
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

    // 3. Create the order
    const orderId = await createOrder({
      userId,
      addressId: address.id,
      items: validatedData.items,
      shippingMethod: "Correo Argentino / Envío estándar",
      customerNotes: `Pago vía: ${validatedData.paymentMethod}`,
    });

    // 4. Handle specific payment integration
    let initPoint = null;

    if (validatedData.paymentMethod === "MERCADO_PAGO") {
      // Create payment stub
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (order) {
        await prisma.payment.create({
          data: {
            orderId,
            amount: order.total,
            method: "MERCADO_PAGO",
            status: "PENDING",
          },
        });

        // Mock Mercado Pago checkout preference sandbox link
        // In production, instantiate MercadoPagoConfig and Preference here
        initPoint = `https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock-pref-${orderId}`;
      }
    } else {
      // CASH or TRANSFER payment stubs
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });
      if (order) {
        await prisma.payment.create({
          data: {
            orderId,
            amount: order.total,
            method: validatedData.paymentMethod === "TRANSFER" ? "TRANSFER" : "CASH",
            status: "PENDING",
          },
        });
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
