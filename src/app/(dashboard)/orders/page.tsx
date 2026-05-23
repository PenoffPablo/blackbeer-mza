import { getCurrentUser } from "@/lib/auth";
import { getOrdersByUser } from "@/services/order.service";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/formatters";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mis Pedidos",
  description: "Historial de compras y pedidos realizados.",
};

export default async function OrdersPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    notFound();
  }

  const orders = await getOrdersByUser(sessionUser.userId);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">
          Mis Pedidos
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Historial completo de tus compras
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-muted)]">
            <ShoppingBag size={32} strokeWidth={1} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">No tenés pedidos todavía</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Cuando compres tu primer producto aparecerá listado acá.
            </p>
          </div>
          <Link href="/products" className="inline-block px-5 py-2.5 bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-sm font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-opacity">
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-sm)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  <th className="px-6 py-4">Nº Pedido</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--color-surface-hover)]/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[var(--color-text)]">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--color-text)]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-500/20 text-emerald-600"
                          : order.status === "CANCELLED"
                          ? "bg-rose-500/20 text-rose-600"
                          : "bg-amber-500/20 text-amber-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:opacity-85 transition-opacity"
                      >
                        <Eye size={14} /> Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
