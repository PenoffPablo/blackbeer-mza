import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { OrderDetailClient } from "./OrderDetailClient"; // Componente cliente de comanda

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "RECEPTIONIST")) {
    redirect("/login?redirect=/admin/orders");
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      address: true,
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Convertir campos Decimal a number para evitar problemas de serialización en Server Components
  const serializedOrder = {
    ...order,
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    tax: Number(order.tax),
    total: Number(order.total),
    user: order.user || {
      firstName: order.guestName || "Invitado",
      lastName: "",
      email: order.guestEmail || "No provisto",
      phone: order.guestPhone || null,
    },
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
  };

  return <OrderDetailClient order={serializedOrder as any} />;
}
