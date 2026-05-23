"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui/Toast";
import { CreditCard, Truck, ShieldCheck, Landmark } from "lucide-react";
import { formatWhatsAppMessage, getWhatsAppLink } from "@/lib/whatsappFormatter";
import { storeConfig } from "@/config/store.config";

export function CheckoutForm() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState(user?.email || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"MERCADO_PAGO" | "TRANSFER" | "CASH">("MERCADO_PAGO");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      showToast({ message: "Tu carrito está vacío", type: "error" });
      return;
    }

    setLoading(true);

    try {
      // Prepare payload
      const orderPayload = {
        email,
        firstName,
        lastName,
        phone,
        shippingAddress: {
          street,
          number,
          apartment,
          city,
          state,
          zipCode,
        },
        paymentMethod,
        items: cart.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          variantName: item.variantName,
          quantity: item.quantity,
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar la orden");
      }

      const data = await response.json();
      showToast({ message: "¡Pedido creado! Abriendo WhatsApp...", type: "success" });

      // Generate ticket number and send WhatsApp comanda
      const ticketNumber = Math.floor(Math.random() * 900) + 100;
      const orderDetails = {
        customerName: `${firstName} ${lastName}`.trim(),
        customerPhone: phone,
        deliveryType: "delivery" as const,
        deliveryZone: { name: `${city}, ${state}`, cost: storeConfig.shipping.defaultShippingCost },
        address: { street, number, apartment, notes: `CP: ${zipCode}` },
        paymentMethod: paymentMethod === "CASH" ? ("cash" as const) : ("transfer" as const),
        ticketNumber,
      };

      const message = formatWhatsAppMessage(cart as any, orderDetails);
      const whatsappLink = getWhatsAppLink(storeConfig.contact.whatsapp, message);

      clearCart();

      // Open WhatsApp link in a new tab
      window.open(whatsappLink, "_blank");

      // Redirect based on payment method
      if (paymentMethod === "MERCADO_PAGO" && data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        router.push(`/orders/success?id=${data.orderId}`);
      }
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : "Error al procesar el pago",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ═══ PASO 1: CONTACTO ═══ */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold">1</span>
          Información de Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="juan@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Teléfono"
            type="tel"
            placeholder="+54 11 1234-5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </section>

      {/* ═══ PASO 2: DIRECCIÓN DE ENVÍO ═══ */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold">2</span>
          Dirección de Envío
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <Input
              label="Nombre"
              placeholder="Juan"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Input
              label="Apellido"
              placeholder="Pérez"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="col-span-2 md:col-span-1">
            <Input
              label="Calle / Avenida"
              placeholder="Av. Rivadavia"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Número"
              placeholder="1234"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
            <Input
              label="Piso/Depto (Opcional)"
              placeholder="4B"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
            />
          </div>
          <Input
            label="Ciudad"
            placeholder="Capital Federal"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <Input
            label="Provincia / Estado"
            placeholder="Buenos Aires"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          />
          <div className="col-span-2 md:col-span-1">
            <Input
              label="Código Postal"
              placeholder="1425"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              required
            />
          </div>
        </div>
      </section>

      {/* ═══ PASO 3: MÉTODO DE PAGO ═══ */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4">
        <h3 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold">3</span>
          Método de Pago
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: "MERCADO_PAGO" as const,
              title: "Mercado Pago",
              desc: "Tarjetas de crédito/débito o saldo en cuenta",
              icon: CreditCard,
            },
            {
              id: "TRANSFER" as const,
              title: "Transferencia Bancaria",
              desc: "Transferí directo y envianos el comprobante",
              icon: Landmark,
            },
            {
              id: "CASH" as const,
              title: "Efectivo / Contraentrega",
              desc: "Pagá al retirar o recibir tus productos",
              icon: Truck,
            },
          ].map((method) => (
            <label
              key={method.id}
              className={`relative border rounded-[var(--radius-lg)] p-4 flex flex-col justify-between cursor-pointer transition-all duration-[var(--transition-fast)] ${
                paymentMethod === method.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-bg)]/30 ring-1 ring-[var(--color-primary)]"
                  : "border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={() => setPaymentMethod(method.id)}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${
                  paymentMethod === method.id ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                }`}>
                  <method.icon size={18} />
                </div>
                <div className="font-semibold text-sm text-[var(--color-text)]">
                  {method.title}
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2 leading-relaxed">
                {method.desc}
              </p>
            </label>
          ))}
        </div>
      </section>

      {/* Place Order */}
      <div className="flex flex-col items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-[var(--radius-xl)] border border-[var(--color-border)] gap-4 sm:flex-row">
        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
          <ShieldCheck size={16} className="text-[var(--color-success)]" />
          Transacción encriptada y 100% segura
        </span>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto px-8"
          isLoading={loading}
        >
          Confirmar y Pagar
        </Button>
      </div>
    </form>
  );
}
