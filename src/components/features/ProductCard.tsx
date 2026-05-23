"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { getDiscountPercentage } from "@/lib/formatters";
import { Badge } from "@/components/ui/Badge";
import type { ProductListItem } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import { showToast } from "@/components/ui/Toast";
import { useState } from "react";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isWishlist, setIsWishlist] = useState(false);

  const hasPromo2x = product.comparePrice && product.comparePrice > product.price;
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
      imageUrl: mainImage?.url,
    });

    showToast({
      message: `¡${product.name} agregado al carrito!`,
      type: "success",
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlist(!isWishlist);
    showToast({
      message: !isWishlist ? "Agregado a favoritos" : "Eliminado de favoritos",
      type: "default",
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl border-[3px] border-[#111111] overflow-hidden transition-all duration-[var(--transition-base)] hover:shadow-[6px_6px_0px_#111111] hover:-translate-y-1 p-5 flex flex-col justify-between h-full shadow-[4px_4px_0px_#111111]">
      {/* Quick actions overlay (Wishlist) hidden for now to match exactly the image, but kept absolute if needed */}
      <div className="absolute top-4 right-4 z-10 hidden">
        <button
          onClick={handleToggleWishlist}
          className={`p-2 rounded-full border-2 border-[#111111] transition-colors cursor-pointer ${
            isWishlist
              ? "bg-[#ff4f4f] text-white"
              : "bg-white text-[#111111] hover:bg-[#ff4f4f] hover:text-white"
          }`}
          aria-label="Agregar a favoritos"
        >
          <Heart size={16} strokeWidth={2.5} className={isWishlist ? "fill-current" : ""} />
        </button>
      </div>

      {/* Info */}
      <div className="flex-grow flex flex-col">
        {/* Top row: Name & Category */}
        <div className="flex justify-between items-start gap-4">
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="text-xl font-black text-[#111111] leading-tight uppercase group-hover:text-[var(--color-primary)] transition-colors">
              {product.name}
            </h3>
          </Link>

          {product.category && (
            <Link
              href={`/products?category=${product.category.slug}`}
              className="text-[10px] font-black text-[#111111] uppercase tracking-wider px-2 py-1 border-2 border-[#111111] rounded bg-white flex-shrink-0"
            >
              {product.category.name}
            </Link>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {product.isFeatured && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#111111] text-[#ff2e93] text-xs font-black uppercase tracking-wider">
              <span className="text-[#ffb800] text-sm">⭐</span>
              ESPECIALIDAD
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="mt-4 text-[15px] text-gray-600 font-medium leading-snug">
            {product.description}
          </p>
        )}
      </div>

      {/* Divider */}
      <hr className="border-t-[3px] border-[#111111] my-5" />

      {/* Bottom row: Price & Button */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {!hasPromo2x ? (
            <span className="text-[22px] font-black text-[#111111]">
              $ {product.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          ) : (
            <>
              <span className="text-sm font-bold text-gray-500 line-through">
                1x $ {product.price.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[22px] font-black text-[#111111]">
                2x $ {Number(product.comparePrice).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </>
          )}
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          className="flex items-center justify-center px-6 py-2.5 text-[15px] font-black rounded-xl bg-[#111111] text-white hover:bg-black hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-transform cursor-pointer"
        >
          AÑADIR
        </button>
      </div>
    </div>
  );
}
