import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/formatters";
import { Eye, CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">
          Gestión de Pedidos
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Seguimiento, actualización de estado y facturación de compras
        </p>
      </div>

      {/* Table container */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                <th className="px-6 py-4">Nº Pedido</th>
                <th className="px-6 py-4">Cliente / Email</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--color-text-muted)]">
                    No se han realizado pedidos en la tienda todavía.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--color-surface-hover)]/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[var(--color-text)]">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--color-text)]">
                        {order.user.firstName} {order.user.lastName}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {order.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {order._count.items}
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--color-text)]">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
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
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:opacity-85 transition-opacity"
                      >
                        <Eye size={14} /> Gestionar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
