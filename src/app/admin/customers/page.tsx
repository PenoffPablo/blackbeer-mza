import { prisma } from "@/lib/prisma";
import { User, ShieldAlert, CheckCircle, Mail, Phone, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">
          Gestión de Clientes
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Directorio de usuarios registrados en la plataforma y sus compras
        </p>
      </div>

      {/* Table container */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">F. Registro</th>
                <th className="px-6 py-4">Pedidos Realizados</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--color-text-muted)]">
                    No hay usuarios registrados en el sistema.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--color-surface-hover)]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-secondary)] font-bold text-xs">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-[var(--color-text)]">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-[10px] text-[var(--color-text-muted)]">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-0.5">
                      <div className="flex items-center gap-1 text-xs">
                        <Mail size={12} className="text-[var(--color-text-muted)]" />
                        <span>{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-xs">
                          <Phone size={12} className="text-[var(--color-text-muted)]" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-[var(--color-text)]">
                      {user._count.orders} {user._count.orders === 1 ? "pedido" : "pedidos"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase flex items-center gap-1 w-fit ${
                        user.role === "ADMIN"
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}>
                        {user.role === "ADMIN" && <ShieldAlert size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs text-[var(--color-success)] font-medium">
                        <CheckCircle size={14} /> Activo
                      </span>
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
