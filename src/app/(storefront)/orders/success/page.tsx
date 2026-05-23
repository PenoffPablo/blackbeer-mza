import { getOrderDetail } from "@/services/order.service";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/formatters";
import { CheckCircle2, Landmark, Truck, Calendar, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: PageProps) {
  const { id } = await searchParams;

  if (!id) {
    notFound();
  }

  const order = await getOrderDetail(id);

  if (!order) {
    notFound();
  }

  // Check if bank transfer instructions are needed
  const paymentMethod = order.payments[0]?.method;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
      {/* Icon & Title */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center text-[var(--color-success)] shadow-lg">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
          ¡Gracias por tu compra!
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Tu pedido <span className="font-bold text-[var(--color-text)]">#{order.orderNumber}</span> ha sido recibido.
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 text-left shadow-[var(--shadow-md)] divide-y divide-[var(--color-border)]">
        {/* Main Details */}
        <div className="pb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
              <Calendar size={12} /> Fecha
            </span>
            <p className="font-semibold text-[var(--color-text)]">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-[var(--color-text-muted)]">Total</span>
            <p className="font-bold text-[var(--color-primary)]">
              {formatPrice(order.total)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-[var(--color-text-muted)]">Método de pago</span>
            <p className="font-semibold text-[var(--color-text)] uppercase text-xs">
              {paymentMethod || "CASH"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-[var(--color-text-muted)]">Estado del pedido</span>
            <p className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-600 inline-block w-fit">
              {order.status}
            </p>
          </div>
        </div>

        {/* Transfer instructions */}
        {paymentMethod === "TRANSFER" && (
          <div className="py-4 space-y-3">
            <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
              <Landmark size={16} className="text-[var(--color-primary)]" />
              Instrucciones de Transferencia Bancaria
            </h3>
            <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-sm space-y-2 font-mono text-[var(--color-text-secondary)]">
              <p><strong>Banco:</strong> Banco de la Nación Argentina</p>
              <p><strong>CBU:</strong> 0110123456789012345678</p>
              <p><strong>Alias:</strong> MITIENDA.ECOMMERCE.ARS</p>
              <p><strong>Titular:</strong> Mi Tienda S.A.</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-2 font-sans italic">
                * Por favor, enviá el comprobante de transferencia indicando tu número de orden a contacto@mitienda.com para procesar el despacho de tus productos.
              </p>
            </div>
          </div>
        )}

        {/* Items Grid Summary */}
        <div className="pt-4 space-y-3">
          <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
            <ShoppingBag size={16} className="text-[var(--color-primary)]" />
            Productos comprados
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-[var(--color-text-secondary)]">
                  {item.productName} <strong className="text-[var(--color-text)]">x {item.quantity}</strong>
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href="/products">
          <Button variant="primary">
            Seguir Comprando
          </Button>
        </Link>
        <Link href="/products">
          <Button variant="outline">
            Ver mis Pedidos
          </Button>
        </Link>
      </div>
    </div>
  );
}
