import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/formatters";
import { Eye, CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    where: {
      status: {
        notIn: ["DELIVERED", "CANCELLED"],
      },
    },
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
          Panel de Comandas (Activas)
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Visualización y gestión en tiempo real de los pedidos pendientes en cocina y salón
        </p>
      </div>

      {/* Table container */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                <th className="px-6 py-4">Nº Pedido</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Origen</th>
                <th className="px-6 py-4">Ingreso</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--color-text-muted)] font-bold">
                    🎉 ¡No hay comandas activas pendientes! Todos los pedidos fueron completados o cancelados.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--color-surface-hover)]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-[var(--color-text)] text-sm">
                        #{order.orderNumber}
                      </div>
                      <div className="text-2xs text-[var(--color-text-muted)] mt-0.5">
                        {order._count.items} {order._count.items === 1 ? 'producto' : 'productos'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--color-text)]">
                        {order.user
                          ? `${order.user.firstName} ${order.user.lastName}`
                          : (order.guestName || "Invitado")}
                      </div>
                      {order.user && !order.user.email.startsWith("salon-mesa-") ? (
                        <div className="text-2xs text-[var(--color-text-muted)] mt-0.5">
                          {order.user.email}
                        </div>
                      ) : (
                        !order.user && order.guestEmail && (
                          <div className="text-2xs text-[var(--color-text-muted)] mt-0.5">
                            {order.guestEmail}
                          </div>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.type === "DINE_IN" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-700 border border-amber-500/30 uppercase tracking-wider">
                          📍 Mesa {order.tableNumber || "-"}
                        </span>
                      ) : order.type === "TAKE_AWAY" ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-700 border border-purple-500/30 uppercase tracking-wider">
                          🛍️ Retiro
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-700 border border-blue-500/30 uppercase tracking-wider">
                          🛵 Delivery
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[var(--color-text)]">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-2xs text-[var(--color-text-muted)] mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[var(--color-text)] font-mono">
                      {formatPrice(Number(order.total))}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30 uppercase`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-black uppercase bg-[var(--color-primary)] text-black border border-black px-2.5 py-1.5 rounded hover:bg-[var(--color-primary-hover)] shadow-neo-xs transition-all"
                      >
                        <Eye size={12} /> Comanda
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
