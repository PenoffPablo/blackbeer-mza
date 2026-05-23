import { getCurrentUser } from "@/lib/auth";
import { getOrderDetail } from "@/services/order.service";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/formatters";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Landmark, LandmarkIcon } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Detalle de Pedido",
  description: "Información detallada del estado de tu compra.",
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    notFound();
  }

  const order = await getOrderDetail(id, sessionUser.userId);

  if (!order) {
    notFound();
  }

  const payment = order.payments[0];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors mb-2"
        >
          <ArrowLeft size={14} /> Volver a mis pedidos
        </Link>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">
          Pedido #{order.orderNumber}
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Realizado el {new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status timeline */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-6 shadow-[var(--shadow-sm)]">
            <h3 className="font-bold text-sm text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
              Estado de Despacho
            </h3>

            {/* Simple Status Step Bar */}
            <div className="relative flex justify-between items-center w-full">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--color-border)] -z-10" />
              {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"].map((step, idx) => {
                const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
                const activeIdx = statuses.indexOf(order.status);
                const stepIdx = statuses.indexOf(step);
                const isCompleted = activeIdx >= stepIdx;

                return (
                  <div key={step} className="flex flex-col items-center gap-1.5 bg-[var(--color-surface)] px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold ${
                      isCompleted ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"
                    }`}>
                      {step === "PENDING" && "Pendiente"}
                      {step === "PROCESSING" && "Procesando"}
                      {step === "SHIPPED" && "Enviado"}
                      {step === "DELIVERED" && "Entregado"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Listing */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]">
            <h3 className="font-bold text-sm text-[var(--color-text)] border-b border-[var(--color-border)] pb-3 mb-4">
              Productos en este pedido
            </h3>
            <div className="divide-y divide-[var(--color-border)]">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Cantidad: {item.quantity} x {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-text)]">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-6">
          {/* Payment summary */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
              Resumen de Pago
            </h3>
            <div className="space-y-2.5 text-sm text-[var(--color-text-secondary)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[var(--color-success)] font-semibold">
                  <span>Descuento</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="border-t border-[var(--color-border)] pt-2.5 flex justify-between font-bold text-[var(--color-text)]">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)] space-y-1">
              <p><strong>Gateway:</strong> {payment?.method || "CASH"}</p>
              <p><strong>Estado pago:</strong> {payment?.status || "PENDING"}</p>
              {payment?.transactionId && <p className="truncate"><strong>ID Transacción:</strong> {payment.transactionId}</p>}
            </div>
          </div>

          {/* Transfer banking box */}
          {payment?.method === "TRANSFER" && payment.status === "PENDING" && (
            <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-xl)] space-y-3">
              <h4 className="text-xs font-extrabold text-[var(--color-text)] uppercase flex items-center gap-1.5">
                <LandmarkIcon size={14} className="text-[var(--color-primary)]" />
                Transferencia pendiente
              </h4>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                Por favor, realizá la transferencia y envianos tu comprobante con el número de pedido <strong>#{order.orderNumber}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
