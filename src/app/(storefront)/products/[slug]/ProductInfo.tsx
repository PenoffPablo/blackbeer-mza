"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/formatters";
import { getDiscountPercentage } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { ReviewStars } from "@/components/features/ReviewStars";
import { ShoppingCart, Heart, Shield, RotateCcw, Truck, Minus, Plus } from "lucide-react";
import { showToast } from "@/components/ui/Toast";
import type { ProductDetail } from "@/types/product";

interface ProductInfoProps {
  product: ProductDetail;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlist, setIsWishlist] = useState(false);

  const price = selectedVariant?.price ?? product.price;
  const comparePrice = selectedVariant
    ? (selectedVariant.price ? product.comparePrice : null)
    : product.comparePrice;

  const hasDiscount = comparePrice && comparePrice > price;
  const discount = hasDiscount ? getDiscountPercentage(Number(comparePrice), price) : 0;
  const isOutOfStock = false;

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        price: price,
        variantName: selectedVariant?.name,
        imageUrl: product.images[0]?.url,
      },
      quantity
    );

    showToast({
      message: `¡${product.name} agregado al carrito!`,
      type: "success",
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div className="space-y-2">
        {product.category && (
          <span className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
            {product.category.name}
          </span>
        )}
        <h1 className="text-2xl md:text-4xl font-bold text-[var(--color-text)]">
          {product.name}
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] font-mono">
          SKU: {selectedVariant?.sku ?? product.sku}
        </p>
      </div>

      {/* Ratings */}
      <div className="flex items-center gap-4">
        <ReviewStars rating={product.reviews.rating} count={product.reviews.count} />
        <span className="text-xs text-[var(--color-text-muted)]">|</span>
        <span className="text-xs text-[var(--color-success)] font-medium">
          ✓ Disponible para ordenar
        </span>
      </div>

      {/* Price */}
      <div className="p-4 bg-[var(--color-bg-secondary)] rounded-[var(--radius-lg)] border border-[var(--color-border)] flex items-center gap-4">
        <span className="text-3xl font-extrabold text-[var(--color-text)]">
          {formatPrice(price)}
        </span>
        {hasDiscount && (
          <>
            <span className="text-lg text-[var(--color-text-muted)] line-through">
              {formatPrice(Number(comparePrice))}
            </span>
            <span className="px-2 py-1 bg-[var(--color-danger-bg)] text-[var(--color-danger)] text-xs font-bold rounded-md">
              -{discount}% OFF
            </span>
          </>
        )}
      </div>

      {/* Description */}
      <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
        {product.description || "Este producto no tiene una descripción detallada todavía."}
      </p>

      {/* Variants selection */}
      {product.variants.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">
            Seleccionar Opción
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => {
                  setSelectedVariant(variant);
                  setQuantity(1);
                }}
                className={`px-4 py-2.5 text-xs font-medium border rounded-[var(--radius-md)] transition-all cursor-pointer ${
                  selectedVariant?.id === variant.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)]/20 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
                    : "border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]"
                }`}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Quantity selector */}
          <div className="flex items-center border border-[var(--color-border)] rounded-[var(--radius-md)] shrink-0 w-32 justify-between">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="p-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-l-[var(--radius-md)] disabled:opacity-30 cursor-pointer"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-bold text-[var(--color-text)]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-r-[var(--radius-md)] disabled:opacity-30 cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add to cart */}
          <Button
            onClick={handleAddToCart}
            variant="primary"
            className="flex-1 w-full justify-center py-3"
          >
            <ShoppingCart size={18} />
            Agregar al carrito
          </Button>

          {/* Wishlist */}
          <button
            onClick={() => {
              setIsWishlist(!isWishlist);
              showToast({
                message: !isWishlist
                  ? "Agregado a tu lista de deseos"
                  : "Eliminado de tu lista de deseos",
                type: "default",
              });
            }}
            className={`p-3 border rounded-[var(--radius-md)] transition-all cursor-pointer shrink-0 ${
              isWishlist
                ? "border-[var(--color-danger)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            }`}
            aria-label="Wishlist"
          >
            <Heart size={18} className={isWishlist ? "fill-current" : ""} />
          </button>
        </div>
      </div>

      {/* Trust elements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-[var(--color-primary)]" />
          <span>Envío rápido nacional</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw size={16} className="text-[var(--color-primary)]" />
          <span>Cambios gratis 30 días</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[var(--color-primary)]" />
          <span>Garantía oficial directa</span>
        </div>
      </div>
    </div>
  );
}
