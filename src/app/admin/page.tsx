import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Admin",
};

const statusBadge: Record<string, "success" | "warning" | "info" | "primary" | "default"> = {
  CONFIRMED: "success",
  PENDING: "warning",
  SHIPPED: "primary",
  DELIVERED: "success",
  PROCESSING: "info",
};

// Format currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};

export default async function AdminDashboard() {
  // Fetch real data from Prisma
  const [ordersCount, productsCount, usersCount, recentOrdersData] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  // Calculate total revenue from confirmed/delivered orders
  const revenueResult = await prisma.order.aggregate({
    where: { status: { in: ["CONFIRMED", "DELIVERED", "SHIPPED"] } },
    _sum: { total: true },
  });
  
  const totalRevenue = revenueResult._sum.total ? Number(revenueResult._sum.total) : 0;

  const stats = [
    {
      label: "Ventas Totales",
      value: formatPrice(totalRevenue),
      change: "Histórico",
      trend: "up" as const,
      icon: DollarSign,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Pedidos",
      value: ordersCount.toString(),
      change: "Totales",
      trend: "up" as const,
      icon: ShoppingCart,
      color: "from-zinc-700 to-zinc-800",
    },
    {
      label: "Productos activos",
      value: productsCount.toString(),
      change: "En catálogo",
      trend: "up" as const,
      icon: Package,
      color: "from-zinc-700 to-zinc-800",
    },
    {
      label: "Usuarios",
      value: usersCount.toString(),
      change: "Registrados",
      trend: "up" as const,
      icon: Users,
      color: "from-zinc-700 to-zinc-800",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Dashboard
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Resumen general de tu tienda
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} padding="md" hover>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-[var(--color-text-muted)]">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-[var(--color-text)]">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  {stat.trend === "up" ? (
                    <ArrowUpRight size={14} className="text-[var(--color-success)]" />
                  ) : (
                    <ArrowDownRight size={14} className="text-[var(--color-danger)]" />
                  )}
                  <span
                    className={
                      stat.trend === "up"
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-danger)]"
                    }
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div
                className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-[var(--radius-lg)] flex items-center justify-center text-white`}
              >
                <stat.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent orders */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Pedidos recientes
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Últimas transacciones
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-[var(--color-primary)] font-medium cursor-pointer hover:text-[var(--color-primary-hover)] transition-colors">
            Ver todos
            <TrendingUp size={14} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-2 font-medium text-[var(--color-text-muted)]">
                  Pedido
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--color-text-muted)]">
                  Cliente
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--color-text-muted)]">
                  Total
                </th>
                <th className="text-left py-3 px-2 font-medium text-[var(--color-text-muted)]">
                  Estado
                </th>
                <th className="text-right py-3 px-2 font-medium text-[var(--color-text-muted)]">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrdersData.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <td className="py-3 px-2 font-mono text-xs text-[var(--color-primary)]">
                    {order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="py-3 px-2 text-[var(--color-text)]">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : "Invitado"}
                  </td>
                  <td className="py-3 px-2 font-medium text-[var(--color-text)]">
                    {formatPrice(Number(order.total))}
                  </td>
                  <td className="py-3 px-2">
                    <Badge variant={statusBadge[order.status] || "default"}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-right text-[var(--color-text-muted)]">
                    {new Date(order.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
