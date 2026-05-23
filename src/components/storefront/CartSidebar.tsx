"use client";

import { useState, useEffect } from "react";
import { X, ShoppingBag, Plus, Minus, Trash2, MapPin, ClipboardCheck, DollarSign, Send } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/formatters";
import { storeConfig } from "@/config/store.config";
import { LocationButton } from "@/components/features/LocationButton";
import { PaymentModal } from "@/components/features/PaymentModal";
import { formatWhatsAppMessage, getWhatsAppLink } from "@/lib/whatsappFormatter";
import { toast } from "@/components/ui/Toast";
import { useTable } from "@/context/TableContext";

const MapPicker = dynamic(() => import("@/components/features/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-neutral-100 animate-pulse rounded-lg border-2 border-black flex items-center justify-center text-xs font-bold text-neutral-400">
      Cargando mapa interactivo...
    </div>
  ),
});

interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  sku?: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  image?: string;
  imageUrl?: string;
  variantName?: string;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onUpdateQuantity: (productId: string, variantName: string | undefined, newQty: number) => void;
  onRemoveItem: (productId: string, variantName: string | undefined) => void;
  onClearCart: () => void;
}

interface DeliveryZone {
  name: string;
  cost: number;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartSidebarProps) {
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const { tableNumber, clearTable } = useTable();

  // Formulario de Checkout
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "takeaway">("delivery");

  // Dirección y comentarios
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [apartment, setApartment] = useState("");
  const [notes, setNotes] = useState("");
  const [takeawayLocation, setTakeawayLocation] = useState("");
  const [orderComments, setOrderComments] = useState("");

  // Propina (mozo) para consumo local
  const [hasTip10, setHasTip10] = useState(false);
  const [customTip, setCustomTip] = useState("");



  // GPS Coords
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("transfer");

  // Reset del paso del checkout al cerrar/abrir
  useEffect(() => {
    if (!isOpen) {
      setStep("cart");
    }
  }, [isOpen]);

  // Limpiar estados al cambiar el método de entrega (takeaway / delivery) y forzar pago por transferencia si es delivery
  useEffect(() => {
    setNotes("");
    setStreet("");
    setNumber("");
    setApartment("");
    setGpsCoords(null);
    setTakeawayLocation("");
    if (deliveryType === "delivery") {
      setPaymentMethod("transfer");
    }
  }, [deliveryType]);

  if (!isOpen) return null;

  // Calcular propina y total
  const tipAmount = tableNumber
    ? (hasTip10
      ? Math.round(cart.subtotal * 0.1)
      : (parseFloat(customTip) || 0))
    : 0;

  const totalCost = cart.subtotal + tipAmount;

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast("El nombre es requerido", "error");
      return;
    }
    if (!customerPhone.trim()) {
      toast("El teléfono celular es requerido", "error");
      return;
    }

    if (!tableNumber && deliveryType === "delivery") {
      if (!gpsCoords) {
        toast("Debes marcar tu ubicación en el mapa", "error");
        return;
      }
    }

    // Compilar ticketNumber aleatorio (001 a 999) para el cajero
    const ticketNumber = Math.floor(Math.random() * 900) + 100;

    const orderDetails: any = {
      customerName,
      customerPhone,
      deliveryType: tableNumber ? "local" : deliveryType,
      tableNumber,
      address: { street, number, apartment, notes },
      paymentMethod,
      gpsCoords,
      ticketNumber,
      tipAmount,
      orderComments,
    };

    // Formatear mensaje de WhatsApp
    const message = formatWhatsAppMessage(cart as any, orderDetails);

    // Obtener enlace y redireccionar
    const whatsappLink = getWhatsAppLink(storeConfig.contact.whatsapp, message);

    toast("¡Comanda generada! Abriendo WhatsApp...", "success");

    // Limpiar carrito y resetear
    onClearCart();
    if (tableNumber) clearTable();
    onClose();

    // Redireccionar
    window.open(whatsappLink, "_blank");
  };

  return (
    <div className="fixed inset-0 z-40 overflow-hidden text-black">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--color-surface)] border-l-4 border-black flex flex-col shadow-neo-xl animate-slide-left">
          {/* Header */}
          <div className="p-5 border-b-4 border-black flex items-center justify-between bg-white text-black">
            <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag size={20} strokeWidth={2.5} />
              {step === "cart" ? "Mi Carrito" : "Finalizar Pedido"}
            </h3>
            <button
              onClick={onClose}
              className="p-1 border-2 border-black rounded hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {step === "cart" ? (
              /* PANTALLA 1: LISTADO DE CARRITO */
              cart.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-center py-20">
                  <div className="w-16 h-16 rounded-full border-2 border-black bg-[var(--color-bg-secondary)] flex items-center justify-center text-neutral-400">
                    <ShoppingBag size={28} />
                  </div>
                  <div>
                    <h4 className="font-extrabold uppercase text-sm">Tu carrito está vacío</h4>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Agregá unas burgers o pizzas de la carta para empezar.
                    </p>
                  </div>
                  <Button
                    onClick={onClose}
                    className="mt-4 border-2 border-black hover-neo bg-[var(--color-primary)] text-black font-bold uppercase text-xs"
                  >
                    Ver la carta
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="divide-y-2 divide-black/10">
                    {cart.items.map((item) => {
                      const itemKey = `${item.productId}-${item.variantName || ""}`;
                      return (
                        <div key={itemKey} className="py-4 flex gap-3 items-start first:pt-0">
                          {/* Info del Item */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-sm uppercase text-black leading-tight">
                              {item.name}
                            </h4>
                            {item.variantName && (
                              <p className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-normal">
                                {item.variantName}
                              </p>
                            )}
                            <div className="text-xs font-mono font-black text-black mt-1">
                              {formatPrice(item.price)}
                            </div>
                          </div>

                          {/* Cantidad & Acciones */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center border-2 border-black rounded bg-white shadow-[var(--shadow-xs)]">
                              <button
                                onClick={() => onUpdateQuantity(item.productId, item.variantName, item.quantity - 1)}
                                className="p-1 hover:bg-neutral-100 transition-colors border-r border-black cursor-pointer text-black"
                                aria-label="Restar uno"
                              >
                                <Minus size={12} strokeWidth={3} />
                              </button>
                              <span className="px-3 font-mono font-bold text-xs text-black">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.productId, item.variantName, item.quantity + 1)}
                                className="p-1 hover:bg-neutral-100 transition-colors border-l border-black cursor-pointer text-black"
                                aria-label="Sumar uno"
                              >
                                <Plus size={12} strokeWidth={3} />
                              </button>
                            </div>
                            <button
                              onClick={() => onRemoveItem(item.productId, item.variantName)}
                              className="text-xs text-neutral-400 hover:text-[var(--color-danger)] flex items-center gap-1 transition-colors cursor-pointer font-medium"
                              aria-label="Quitar producto"
                            >
                              <Trash2 size={12} /> Quitar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ) : (
              /* PANTALLA 2: FORMULARIO CHECKOUT */
              <form onSubmit={handleSendOrder} className="space-y-5">
                {/* Datos de Contacto */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-1">
                    👤 1. Datos de Contacto
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Nombre y Apellido
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="w-full px-3 py-2 text-sm bg-white text-black border-2 border-black rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-black">
                        Teléfono Celular (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ej. 2616854124"
                        className="w-full px-3 py-2 text-sm bg-white text-black border-2 border-black rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Método de Entrega */}
                {!tableNumber ? (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-1">
                      📦 2. Forma de Entrega
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("delivery")}
                        className={`py-2 px-3 border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${deliveryType === "delivery"
                            ? "bg-[var(--color-primary)] text-black shadow-neo-sm"
                            : "bg-white text-neutral-500"
                          }`}
                      >
                        🛵 Delivery
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType("takeaway")}
                        className={`py-2 px-3 border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${deliveryType === "takeaway"
                            ? "bg-[var(--color-primary)] text-black shadow-neo-sm"
                            : "bg-white text-neutral-500"
                          }`}
                      >
                        🛍️ Take Away
                      </button>
                    </div>

                    {deliveryType === "delivery" ? (
                      <div className="space-y-3 bg-neutral-50 border-2 border-dashed border-black/20 p-4 rounded-lg">
                        {/* Geolocalización obligatoria */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-black uppercase tracking-wider text-center">
                            Ubicación exacta de entrega
                          </label>
                          <MapPicker onLocationSelected={(coords) => setGpsCoords(coords)} />
                          {!gpsCoords && (
                            <p className="text-[10px] text-[var(--color-danger)] font-bold text-center">
                              * Debes seleccionar tu ubicación en el mapa
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-black">
                            Comentarios de envío (Opcional)
                          </label>
                          <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej. Portón negro de rejas..."
                            className="w-full px-2 py-1 text-xs bg-white text-black border-2 border-black rounded"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-neutral-50 border-2 border-dashed border-black/20 p-4 rounded-lg text-center text-xs space-y-3 text-black">
                        <p className="font-bold flex justify-center items-center gap-1">
                          📍 ¿En qué local retiras?
                        </p>
                        <select
                          className="w-full px-2 py-2 text-xs bg-white text-black border-2 border-black rounded font-bold focus:ring-2 focus:ring-[var(--color-primary)] text-center"
                          value={takeawayLocation}
                          onChange={(e) => {
                            setTakeawayLocation(e.target.value);
                            setNotes(`Retiro en: ${e.target.value}`);
                          }}
                          required={deliveryType === "takeaway"}
                        >
                          <option value="" disabled>-- Selecciona un local --</option>
                          {storeConfig.locations.map((loc) => (
                            <option key={loc} value={loc}>
                              {loc}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                          Tu pedido estará listo en 20-30 minutos.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-1">
                      📍 2. Ubicación y Servicio
                    </h4>
                    <div className="bg-neutral-50 border-2 border-dashed border-black/20 p-4 rounded-lg text-center text-xs space-y-2 text-black">
                      <p className="font-bold flex justify-center items-center gap-1 text-base">
                        📍 Consumo en el Local
                      </p>
                      <p className="text-lg font-black bg-[var(--color-primary)] text-black inline-block px-3 py-1 rounded-md shadow-neo-sm border-2 border-black">
                        Mesa {tableNumber}
                      </p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider pt-2">
                        Tu pedido llegará directamente a tu mesa.
                      </p>
                    </div>

                    {/* PROPINA SECCION */}
                    <div className="bg-neutral-50 border-2 border-dashed border-black/20 p-4 rounded-lg space-y-3 text-black">
                      <p className="font-bold text-xs uppercase tracking-wider text-center border-b border-black/10 pb-1.5">
                        ✍️ Propina para el mozo (Voluntaria)
                      </p>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={hasTip10}
                            onChange={(e) => {
                              setHasTip10(e.target.checked);
                              if (e.target.checked) {
                                setCustomTip("");
                              }
                            }}
                            className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
                          />
                          Sumar el 10% sugerido (${formatPrice(Math.round(cart.subtotal * 0.1))})
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase">
                          O ingresá otro monto de propina:
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-neutral-400">$</span>
                          <input
                            type="number"
                            value={customTip}
                            onChange={(e) => {
                              setCustomTip(e.target.value);
                              if (e.target.value) {
                                setHasTip10(false);
                              }
                            }}
                            placeholder="Ej. 500"
                            className="w-full pl-6 pr-3 py-1.5 text-xs bg-white text-black border-2 border-black rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Aclaraciones sobre el pedido */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-1">
                    📝 3. Aclaraciones Especiales
                  </h4>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-black">
                      ¿Alguna especificación o alergia? (Opcional)
                    </label>
                    <input
                      type="text"
                      value={orderComments}
                      onChange={(e) => setOrderComments(e.target.value)}
                      placeholder="Ej. Sin condimentos, sin sal, aderezos aparte..."
                      className="w-full px-3 py-2 text-sm bg-white text-black border-2 border-black rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>

                {/* Forma de Pago */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-black border-b-2 border-black pb-1">
                    💳 4. Método de Pago
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={deliveryType === "delivery"}
                      onClick={() => setPaymentMethod("cash")}
                      className={`py-2 px-3 border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${paymentMethod === "cash"
                          ? "bg-[var(--color-primary)] text-black shadow-neo-sm"
                          : "bg-white text-neutral-500"
                        } ${deliveryType === "delivery" ? "opacity-50 cursor-not-allowed bg-neutral-100 border-dashed" : ""}`}
                    >
                      💵 Efectivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`py-2 px-3 border-2 border-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${paymentMethod === "transfer"
                          ? "bg-[var(--color-primary)] text-black shadow-neo-sm"
                          : "bg-white text-neutral-500"
                        }`}
                    >
                      💸 Transf. / QR
                    </button>
                  </div>

                  {deliveryType === "delivery" && (
                    <p className="text-[10px] text-[var(--color-danger)] font-bold">
                      * Por motivos de seguridad (pedidos falsos), para envíos a domicilio solo aceptamos transferencia.
                    </p>
                  )}

                  {paymentMethod === "transfer" && (
                    <div className="space-y-2 bg-neutral-50 border-2 border-dashed border-black/20 p-4 rounded-lg text-center">
                      <p className="text-xs font-bold text-black">
                        Pagá por transferencia y adjuntá el comprobante al enviar.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="w-full mt-2 justify-center border-2 border-black hover-neo text-xs font-bold uppercase flex items-center gap-1.5"
                      >
                        <ClipboardCheck size={14} />
                        Ver datos bancarios / QR
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Footer - Resumen de Costos y Acciones */}
          {cart.items.length > 0 && (
            <div className="p-5 border-t-4 border-black bg-white space-y-4">
              <div className="space-y-2 text-xs font-bold text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal productos:</span>
                  <span className="font-mono">{formatPrice(cart.subtotal)}</span>
                </div>
                {!tableNumber && deliveryType === "delivery" && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Costo de envío:</span>
                    <span className="font-mono">A coordinar</span>
                  </div>
                )}
                {tableNumber && tipAmount > 0 && (
                  <div className="flex justify-between text-neutral-600">
                    <span>Propina mozo:</span>
                    <span className="font-mono">{formatPrice(tipAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-black border-t border-black/10 pt-2">
                  <span>TOTAL A PAGAR:</span>
                  <span className="font-mono text-lg">
                    {formatPrice(totalCost)}
                    {!tableNumber && deliveryType === "delivery" ? " (+ envío)" : ""}
                  </span>
                </div>
              </div>

              {step === "cart" ? (
                <Button
                  onClick={() => setStep("checkout")}
                  className="w-full border-2 border-black hover-neo bg-[var(--color-primary)] text-black font-black uppercase text-xs tracking-widest py-3 flex items-center justify-center gap-2"
                >
                  Continuar al Checkout
                  <Send size={14} />
                </Button>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep("cart")}
                    className="border-2 border-black text-black text-xs font-bold uppercase"
                  >
                    Atrás
                  </Button>
                  <Button
                    onClick={handleSendOrder}
                    className="col-span-2 border-2 border-black hover-neo bg-emerald-500 text-white hover:bg-emerald-600 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2"
                  >
                    Enviar Pedido WhatsApp
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Información de Pago */}
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  );
}
