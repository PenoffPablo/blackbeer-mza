"use client";

import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { storeConfig } from "@/config/store.config";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/formatters";
import { showToast } from "@/components/ui/Toast";

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();

  const subtotal = cart.subtotal;
  const shipping = storeConfig.shipping.defaultShippingCost;
  const total = subtotal + shipping;

  const handleUpdateQty = (productId: string, qty: number, variantId?: string) => {
    updateQuantity(productId, qty, variantId);
  };

  const handleRemove = (productId: string, variantId?: string, name?: string, variantName?: string) => {
    removeItem(productId, variantId, variantName);
    showToast({
      message: `¡${name || "Producto"} eliminado del carrito!`,
      type: "default",
    });
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/products"
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-[var(--radius-md)] transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">
          Carrito de compras
        </h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-16 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[var(--color-text-muted)]">
            <ShoppingBag size={32} strokeWidth={1} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)]">Tu carrito está vacío</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Explorá nuestro catálogo y sumá tus productos favoritos.
            </p>
          </div>
          <Link href="/products" className="inline-block px-6 py-3 bg-[var(--color-primary)] text-[var(--color-text-inverse)] text-sm font-semibold rounded-[var(--radius-md)] hover:opacity-95 transition-all shadow-[var(--shadow-sm)]">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items list */}
          <div className="flex-1 space-y-4">
            {cart.items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId || ""}`}
                className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 flex items-center gap-4 hover:border-[var(--color-border-hover)] transition-colors shadow-[var(--shadow-sm)]"
              >
                {/* Image placeholder */}
                <div className="w-20 h-20 rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] overflow-hidden relative shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                      <ShoppingBag size={24} className="text-[var(--color-text-muted)]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[var(--color-text)] truncate text-sm sm:text-base">
                    {item.name}
                  </h3>
                  {item.variantName && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      Variante: {item.variantName}
                    </p>
                  )}
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                    {formatPrice(item.price)} c/u
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1.5 border border-[var(--color-border)] rounded-[var(--radius-md)] bg-[var(--color-surface)]">
                  <button
                    onClick={() => handleUpdateQty(item.productId, item.quantity - 1, item.variantId)}
                    className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-l-[var(--radius-md)] transition-colors cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-[var(--color-text)] select-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(item.productId, item.quantity + 1, item.variantId)}
                    className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-r-[var(--radius-md)] transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-[var(--color-text)]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.productId, item.variantId, item.name, item.variantName)}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-[var(--radius-md)] transition-all cursor-pointer"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6 space-y-4 sticky top-24 shadow-[var(--shadow-sm)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Resumen del pedido
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span>
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Envío</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-[var(--color-border)] pt-3 flex justify-between text-base font-bold text-[var(--color-text)]">
                  <span>Total</span>
                  <span>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Link href="/checkout">
                <Button size="lg" className="w-full mt-2 justify-center">
                  Finalizar compra
                </Button>
              </Link>

              <Link
                href="/products"
                className="block text-center text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
