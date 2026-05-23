"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { Plus, Minus, Check } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  category?: { name: string; slug: string } | null;
  images: ProductImage[];
}

interface CustomizeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  extraProducts: Product[]; // Productos con categoría "extras"
  onConfirm: (item: {
    product: Product;
    selectedExtras: Product[];
    quantity: number;
  }) => void;
}

export default function CustomizeProductModal({
  isOpen,
  onClose,
  product,
  extraProducts,
  onConfirm,
}: CustomizeProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Product[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [originalTotalPrice, setOriginalTotalPrice] = useState(0);

  // Inicializar estados cuando se abre un producto
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedExtras([]);
      setTotalPrice(product.price);
      setOriginalTotalPrice(product.price);
    }
  }, [product, isOpen]);

  // Recalcular el total cada vez que cambia el producto, los extras o la cantidad
  useEffect(() => {
    if (!product) return;

    const extrasSum = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    const basePrice = product.price;

    const originalTotal = (basePrice + extrasSum) * quantity;
    setOriginalTotalPrice(originalTotal);

    let calculatedBase = 0;
    if (product.comparePrice && product.comparePrice > product.price) {
      const pairs = Math.floor(quantity / 2);
      const singles = quantity % 2;
      calculatedBase = (pairs * product.comparePrice) + (singles * product.price);
    } else {
      calculatedBase = basePrice * quantity;
    }

    setTotalPrice(calculatedBase + (extrasSum * quantity));
  }, [product, selectedExtras, quantity]);

  if (!product) return null;

  // Determinar si este producto admite extras (no admitimos extras para los propios extras)
  const isExtraCategory =
    product.category?.slug === "extras" || product.sku.startsWith("BB-EXT-");
  const showExtras = !isExtraCategory && extraProducts.length > 0;

  const handleToggleExtra = (extra: Product) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm({
      product,
      selectedExtras,
      quantity,
    });
    onClose();
  };

  const incrementQty = () => setQuantity((q) => q + 1);
  const decrementQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const mainImage = product.images?.[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalizá tu pedido"
      size="md"
      className="text-black"
    >
      <div className="space-y-5">
        {/* Info del Producto Base */}
        <div className="space-y-2 pb-1">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-extrabold text-xl uppercase tracking-tight text-black leading-tight">
              {product.name}
            </h4>
            <span className="text-[10px] font-black uppercase bg-neutral-100 border border-black/20 px-2 py-0.5 rounded shrink-0">
              {product.category?.name}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {product.description || "Ingredientes secretos de BlackBeer Mendoza."}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <span className="font-extrabold text-black font-mono">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-[10px] font-black uppercase bg-[var(--color-primary)] text-black px-2 py-0.5 rounded shadow-sm border border-black/25 font-mono">
                Llevando 2: {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>

        {/* Sección de Extras */}
        {showExtras && (
          <div className="space-y-2 border-t border-black/10 pt-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <span>➕ ¿Algún extra para sumarle?</span>
            </h5>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {extraProducts.map((extra) => {
                const isSelected = selectedExtras.some((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => handleToggleExtra(extra)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-primary-bg)] border-black text-black"
                        : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-black/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded border-2 border-black flex items-center justify-center transition-colors ${
                          isSelected ? "bg-black text-[var(--color-primary)]" : "bg-white"
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={4} />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-black">
                          {extra.name}
                        </span>
                        {extra.description && (
                          <span className="text-[10px] text-gray-500 block leading-tight">
                            {extra.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono shrink-0 ml-2">
                      +{formatPrice(extra.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cantidad & Total */}
        <div className="border-t border-black/10 pt-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 -mx-5 -mb-5 p-5 rounded-b-[var(--radius-xl)]">
          <div className="flex items-center border-2 border-black rounded-lg overflow-hidden bg-white shadow-[var(--shadow-xs)] shrink-0">
            <button
              type="button"
              onClick={decrementQty}
              className="p-2 hover:bg-neutral-100 transition-colors border-r border-black cursor-pointer text-black"
              aria-label="Disminuir cantidad"
            >
              <Minus size={14} strokeWidth={2.5} />
            </button>
            <span className="px-5 font-mono font-black text-sm text-black">
              {quantity}
            </span>
            <button
              type="button"
              onClick={incrementQty}
              className="p-2 hover:bg-neutral-100 transition-colors border-l border-black cursor-pointer text-black"
              aria-label="Incrementar cantidad"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">
                Total acumulado
              </span>
              <div className="flex flex-col items-end">
                {originalTotalPrice > totalPrice && (
                  <span className="text-[10px] font-bold text-gray-400 line-through">
                    {formatPrice(originalTotalPrice)}
                  </span>
                )}
                <span className="text-lg font-black font-mono text-black">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
            <Button
              onClick={handleConfirm}
              className="px-6 border-2 border-black hover-neo bg-[var(--color-primary)] text-black font-bold uppercase text-xs tracking-wider"
            >
              Agregar al carrito
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
