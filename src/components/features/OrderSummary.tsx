"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/formatters";
import { storeConfig } from "@/config/store.config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tag, ShoppingBag, X } from "lucide-react";
import { showToast } from "@/components/ui/Toast";

interface AppliedCoupon {
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
}

interface OrderSummaryProps {
  onCouponApply?: (coupon: AppliedCoupon | null) => void;
}

export function OrderSummary({ onCouponApply }: OrderSummaryProps) {
  const { cart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setLoading(true);
    try {
      // Endpoint checks coupon validity
      const response = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCode.trim())}&purchaseAmount=${cart.subtotal}`);
      if (response.ok) {
        const data = await response.json();
        const newCoupon = {
          code: data.code,
          discountType: data.discountType,
          discountValue: Number(data.discountValue),
        };
        setAppliedCoupon(newCoupon);
        onCouponApply?.(newCoupon);
        showToast({ message: "¡Cupón aplicado con éxito!", type: "success" });
      } else {
        const err = await response.json();
        throw new Error(err.error || "Cupón inválido");
      }
    } catch (err) {
      showToast({ message: err instanceof Error ? err.message : "El cupón no es válido o expiró", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    onCouponApply?.(null);
  };

  // Calculations
  const subtotal = cart.subtotal;
  const shipping = storeConfig.shipping.defaultShippingCost;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discount = subtotal * (appliedCoupon.discountValue / 100);
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const total = Math.max(0, subtotal + shipping - discount);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-6 sticky top-24">
      <h3 className="font-semibold text-lg text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
        <ShoppingBag size={18} className="text-[var(--color-primary)]" />
        Resumen de la Orden
      </h3>

      {/* Items list */}
      <div className="divide-y divide-[var(--color-border)] max-h-48 overflow-y-auto pr-1">
        {cart.items.map((item) => {
          const itemTotal = item.comparePrice && item.comparePrice > item.price 
            ? (Math.floor(item.quantity / 2) * item.comparePrice) + ((item.quantity % 2) * item.price)
            : item.price * item.quantity;
            
          return (
            <div key={`${item.productId}-${item.variantId || ""}`} className="py-3 flex justify-between gap-3 first:pt-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">
                  {item.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Cant. {item.quantity} x {formatPrice(item.price)}
                  {item.comparePrice && item.comparePrice > item.price && item.quantity >= 2 && (
                    <span className="ml-1 text-[var(--color-primary)] font-semibold">(Descuento por cantidad)</span>
                  )}
                </p>
              </div>
              <span className="text-sm font-semibold text-[var(--color-text)] shrink-0">
                {formatPrice(itemTotal)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Coupon input */}
      {!appliedCoupon ? (
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <Input
            placeholder="CÓDIGO"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="flex-1"
          />
          <Button type="submit" variant="outline" size="sm" isLoading={loading}>
            <Tag size={14} />
            Aplicar
          </Button>
        </form>
      ) : (
        <div className="flex items-center justify-between p-2.5 bg-[var(--color-success-bg)]/30 border border-[var(--color-success)]/30 rounded-[var(--radius-md)] text-sm">
          <span className="flex items-center gap-1.5 text-[var(--color-success)] font-semibold">
            <Tag size={16} />
            {appliedCoupon.code}
          </span>
          <button
            onClick={handleRemoveCoupon}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] p-1 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Cost lines */}
      <div className="space-y-3 text-sm border-t border-[var(--color-border)] pt-4">
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[var(--color-success)] font-semibold">
            <span>Descuento</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Envío</span>
          <span>{formatPrice(shipping)}</span>
        </div>
        <div className="border-t border-[var(--color-border)] pt-3 flex justify-between text-base font-bold text-[var(--color-text)]">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
