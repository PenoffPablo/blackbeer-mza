import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { User, ShoppingBag, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Dashboard Sidebar */}
          <aside className="lg:col-span-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 h-fit space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text)]">Mi Cuenta</h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Panel de cliente</p>
            </div>
            <nav className="flex flex-col gap-1">
              <Link
                href="/account"
                className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-lg)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all"
              >
                <User size={18} />
                Mis Datos
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-lg)] text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-all"
              >
                <ShoppingBag size={18} />
                Mis Pedidos
              </Link>
              <Link
                href="/api/auth/logout"
                className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-lg)] text-sm font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)]/20 transition-all mt-4 border-t border-[var(--color-border)] pt-4"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </Link>
            </nav>
          </aside>

          {/* Page Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
