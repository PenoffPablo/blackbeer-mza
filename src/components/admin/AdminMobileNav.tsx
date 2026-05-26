"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, LayoutDashboard, Package, 
  ShoppingCart, Users, BarChart3, Settings, ChevronRight, Store 
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

interface AdminMobileNavProps {
  role: "ADMIN" | "RECEPTIONIST";
  storeName: string;
}

const sidebarLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/products", icon: Package },
  { label: "Pedidos", href: "/admin/orders", icon: ShoppingCart },
  { label: "Personal", href: "/admin/workers", icon: Users },
  { label: "Analíticas", href: "/admin/analytics", icon: BarChart3 },
  { label: "Configuración", href: "/admin/settings", icon: Settings },
];

export function AdminMobileNav({ role, storeName }: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Bloquear scroll cuando el drawer esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const filteredLinks = sidebarLinks.filter((link) => {
    if (role === "RECEPTIONIST") {
      return link.href === "/admin" || link.href === "/admin/orders";
    }
    return true;
  });

  return (
    <div className="lg:hidden">
      {/* Botón de Hamburguesa */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-[var(--color-text)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] border border-[var(--color-border)] transition-all cursor-pointer flex items-center justify-center"
        aria-label="Abrir navegación"
      >
        <Menu size={24} />
      </button>

      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111111] border-r border-[#222222] text-[#ffffff] p-5 flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          boxShadow: isOpen ? "8px 0px 0px 0px var(--color-primary)" : "none",
        }}
      >
        <div>
          {/* Header del menú móvil */}
          <div className="flex items-center justify-between pb-5 border-b border-[#222222]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[var(--radius-md)] flex items-center justify-center text-white text-sm font-bold border border-black">
                {storeName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{storeName}</div>
                <div className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                  {role === "ADMIN" ? "Admin Panel" : "Recepcionista"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer text-zinc-400 hover:text-white"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
          </div>

          {/* Enlaces de navegación */}
          <nav className="mt-6 space-y-1.5">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3.5 py-3 text-sm font-semibold rounded-[var(--radius-md)] transition-all border ${
                    isActive
                      ? "bg-[var(--color-primary)] text-black border-black font-black"
                      : "text-zinc-400 hover:text-white hover:bg-neutral-800/60 border-transparent"
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                  <ChevronRight size={14} className="ml-auto opacity-70" />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sección Inferior */}
        <div className="pt-4 border-t border-[#222222] space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-neutral-800/40 rounded-[var(--radius-md)] transition-colors border border-transparent"
          >
            <Store size={18} />
            <span>Volver a la tienda</span>
          </Link>
          <div className="border-t border-[#222222]/50 pt-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
