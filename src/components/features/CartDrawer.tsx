"use client";

import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { storeConfig } from "@/config/store.config";
import { useEffect, useRef } from "react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, updateQuantity, removeItem } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer panel */}
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-[var(--shadow-2xl)] flex flex-col animate-slide-left h-full"
        >
          {/* Header */}
          <div className="px-4 py-6 sm:px-6 border-b border-[var(--color-border)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
              <ShoppingBag size={20} className="text-[var(--color-primary)]" />
              Tu Carrito ({cart.itemCount})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-muted)]">
                  <ShoppingBag size={32} strokeWidth={1} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)]">El carrito está vacío</h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    Explorá nuestro catálogo y sumá tus productos favoritos.
                  </p>
                </div>
                <Button variant="primary" onClick={onClose}>
                  Ver productos
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {cart.items.map((item) => (
                  <div key={`${item.productId}-${item.variantId || ""}`} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden relative shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                          <ShoppingBag size={20} strokeWidth={1} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-sm font-medium text-[var(--color-text)] truncate">
                          {item.name}
                        </h4>
                        {item.variantName && (
                          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                            Variante: {item.variantName}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-[var(--color-text)] mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity picker */}
                        <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-md)]">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-l-[var(--radius-md)] transition-colors cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-[var(--color-text)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-r-[var(--radius-md)] transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-[var(--radius-md)] transition-all cursor-pointer"
                          aria-label="Eliminar item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t border-[var(--color-border)] px-4 py-6 sm:px-6 bg-[var(--color-bg-secondary)] space-y-4">
              <div className="flex justify-between text-base font-bold text-[var(--color-text)]">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Los costos de envío y los impuestos se calcularán en el checkout.
              </p>
              <div className="space-y-2">
                <Link href="/cart" onClick={onClose}>
                  <Button variant="outline" className="w-full justify-center">
                    Ver Carrito Completo
                  </Button>
                </Link>
                <Link href="/checkout" onClick={onClose}>
                  <Button variant="primary" className="w-full justify-center">
                    Iniciar Compra
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
