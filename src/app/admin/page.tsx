import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  PlusCircle,
  Settings2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

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
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

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

      {/* Quick Actions (Solo para administradores) */}
      {isAdmin && (
        <Card padding="md">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Acciones Rápidas de Administración
            </h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Atajos y gestiones operativas frecuentes
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin/workers"
              className="flex items-center gap-3 p-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-neo-sm hover:translate-y-[-2px] transition-all font-bold group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-600 flex items-center justify-center border border-purple-500/30 shrink-0">
                <UserPlus size={20} />
              </div>
              <div>
                <div className="text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  Alta de Empleados
                </div>
                <div className="text-2xs text-[var(--color-text-muted)] font-normal mt-0.5">
                  Crear cuentas para recepcionistas y admin
                </div>
              </div>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 p-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-neo-sm hover:translate-y-[-2px] transition-all font-bold group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <PlusCircle size={20} />
              </div>
              <div>
                <div className="text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  Catálogo de Productos
                </div>
                <div className="text-2xs text-[var(--color-text-muted)] font-normal mt-0.5">
                  Crear y editar platos o bebidas
                </div>
              </div>
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-4 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-neo-sm hover:translate-y-[-2px] transition-all font-bold group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-600 flex items-center justify-center border border-blue-500/30 shrink-0">
                <Settings2 size={20} />
              </div>
              <div>
                <div className="text-sm text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  Configuración del Local
                </div>
                <div className="text-2xs text-[var(--color-text-muted)] font-normal mt-0.5">
                  Editar teléfonos, redes sociales y monedas
                </div>
              </div>
            </Link>
          </div>
        </Card>
      )}

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
