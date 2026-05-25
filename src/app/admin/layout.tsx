import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  BarChart3,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { storeConfig } from "@/config/store.config";
import { LogoutButton } from "@/components/admin/LogoutButton";

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/products", icon: Package },
  { label: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
  { label: "Personal", href: "/admin/workers", icon: Users },
  { label: "Analíticas", href: "/admin/analytics", icon: BarChart3 },
  { label: "Configuración", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  
  if (!session || (session.role !== "ADMIN" && session.role !== "RECEPTIONIST")) {
    redirect("/login?redirect=/admin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { firstName: true, lastName: true, role: true }
  });

  if (!dbUser) {
    redirect("/login?redirect=/admin");
  }

  const userInitial = dbUser.firstName ? dbUser.firstName.charAt(0).toUpperCase() : "U";

  // Filtrar links: el recepcionista solo tiene acceso a Dashboard y Pedidos
  const filteredLinks = sidebarLinks.filter((link) => {
    if (dbUser.role === "RECEPTIONIST") {
      return link.href === "/admin" || link.href === "/admin/orders";
    }
    return true;
  });

  return (
    <div 
      className="min-h-screen flex bg-[var(--color-bg-secondary)] text-[var(--color-text)] admin-dark-theme"
      style={{
        '--color-bg-primary': '#000000',
        '--color-bg-secondary': '#0a0a0a',
        '--color-surface': '#111111',
        '--color-surface-hover': '#1a1a1a',
        '--color-border': '#222222',
        '--color-text': '#ffffff',
        '--color-text-secondary': '#a1a1aa',
        '--color-text-muted': '#71717a',
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col shrink-0 hidden lg:flex">
        {/* Logo */}
        <div className="p-5 border-b border-[var(--color-border)]">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 text-lg font-bold text-[var(--color-text)]"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[var(--radius-md)] flex items-center justify-center text-white text-sm font-bold">
              {storeConfig.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold">{storeConfig.name}</div>
              <div className="text-[10px] text-[var(--color-text-muted)] font-normal uppercase tracking-wider">
                {dbUser.role === "ADMIN" ? "Admin Panel" : "Recepcionista"}
              </div>
            </div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1">
          {filteredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] transition-all group"
            >
              <link.icon size={18} />
              {link.label}
              <ChevronRight
                size={14}
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-[var(--color-border)] space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] transition-colors"
          >
            <ChevronRight size={18} className="rotate-180" />
            Volver a la tienda
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-6 shrink-0">
          <h2 className="font-semibold text-[var(--color-text)]">
            Panel de Administración
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-secondary)] font-semibold hidden md:inline">
              Hola, {dbUser.firstName} ({dbUser.role})
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-xs font-bold" title={`${dbUser.firstName} ${dbUser.lastName}`}>
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
