"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Heart,
} from "lucide-react";
import { storeConfig } from "@/config/store.config";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import CartSidebar from "@/components/storefront/CartSidebar";
import { SearchBar } from "@/components/features/SearchBar";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const [user, setUser] = useState<{ firstName: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Productos", href: "/products" },
    { label: "Categorías", href: "/products?view=categories" },
    { label: "Ofertas", href: "/products?sort=offers" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full">


      {/* Main navbar */}
      <nav className="bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[var(--radius-md)] flex items-center justify-center text-white text-sm font-bold">
                {storeConfig.name.charAt(0)}
              </div>
              <span className="hidden sm:block">{storeConfig.name}</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] transition-all duration-[var(--transition-fast)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] transition-all cursor-pointer"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>

              {/* Wishlist - REMOVED FOR PUBLIC */}

              {/* Cart Drawer Toggle */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] transition-all cursor-pointer"
                aria-label="Ver carrito"
              >
                <ShoppingCart size={20} />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {cart.itemCount}
                  </span>
                )}
              </button>

              {/* User / Staff Login / Panel */}
              {user && (user.role === "ADMIN" || user.role === "RECEPTIONIST") ? (
                <Link href="/admin">
                  <Button variant="primary" size="sm" className="hidden sm:flex border-black text-black font-bold uppercase text-[10px] hover-neo">
                    Panel ({user.role === "ADMIN" ? "Admin" : "Recep"})
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="outline" size="sm" className="hidden sm:flex border-black text-black">
                    <User size={16} />
                    Personal
                  </Button>
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] transition-all cursor-pointer"
                aria-label="Menú"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Premium Search Bar Dropdown */}
          {searchOpen && (
            <div className="pb-4 animate-fade-in flex justify-center">
              <SearchBar />
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-[var(--color-border)]">
                {user && (user.role === "ADMIN" || user.role === "RECEPTIONIST") ? (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="md" className="w-full border-black text-black font-bold uppercase">
                      Ir al Panel ({user.role === "ADMIN" ? "Admin" : "Recep"})
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="md" className="w-full border-black text-black">
                      <User size={16} />
                      Acceso Personal
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={(productId, variantName, newQty) => updateQuantity(productId, newQty, undefined, variantName)}
        onRemoveItem={(productId, variantName) => removeItem(productId, undefined, variantName)}
        onClearCart={clearCart}
      />
    </header>
  );
}
