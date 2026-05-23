import { CheckoutForm } from "@/components/features/CheckoutForm";
import { OrderSummary } from "@/components/features/OrderSummary";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout / Finalizar Compra",
  description: "Completá tus datos de envío y pago para finalizar tu pedido.",
};

export default function CheckoutPage() {
  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-text)]">
          Finalizar Compra
        </h1>
        <p className="text-[var(--color-text-muted)] mt-2">
          Completá tus datos para procesar el pedido
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-8">
          <CheckoutForm />
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-4">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
