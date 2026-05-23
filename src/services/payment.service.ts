import { prisma } from "@/lib/prisma";
import type { PaymentMethod, Prisma } from "@prisma/client";

interface CreatePaymentInput {
  orderId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
  metadata?: Record<string, unknown>;
}

export async function createPayment(input: CreatePaymentInput): Promise<string> {
  const payment = await prisma.payment.create({
    data: {
      orderId: input.orderId,
      amount: input.amount,
      method: input.method,
      transactionId: input.transactionId,
      metadata: (input.metadata as Prisma.InputJsonValue) ?? undefined,
    },
  });

  return payment.id;
}

export async function approvePayment(paymentId: string): Promise<void> {
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "APPROVED",
      paidAt: new Date(),
    },
  });
}

export async function rejectPayment(paymentId: string): Promise<void> {
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REJECTED" },
  });
}

export async function getPaymentsByOrder(orderId: string) {
  return prisma.payment.findMany({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });
}
