"use client";

// Componente de UI cliente para el detalle del pedido y comanda de cocina
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, CheckCircle2, XCircle, Clock, MapPin, Phone, User, ShoppingBag, MessageSquare } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/formatters";

interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  productName: string;
  productSku: string;
  subtotal: number;
}

interface OrderDetailClientProps {
  order: {
    id: string;
    orderNumber: string;
    userId: string;
    addressId: string | null;
    type: "DELIVERY" | "TAKE_AWAY" | "DINE_IN";
    tableNumber: string | null;
    status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
    subtotal: number;
    shippingCost: number;
    discount: number;
    tax: number;
    total: number;
    customerNotes: string | null;
    adminNotes: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
    address: {
      street: string;
      number: string;
      apartment: string | null;
      city: string;
      state: string;
      zipCode: string;
    } | null;
    items: OrderItem[];
  };
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async (newStatus: "DELIVERED" | "CANCELLED") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado del pedido");
      }

      router.push("/admin/orders");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isDineIn = order.type === "DINE_IN";

  return (
    <div className="animate-fade-in space-y-6">
      {/* Estilos de Impresión */}
      <style jsx global>{`
        @media print {
          /* Ocultar toda la interfaz del panel de control */
          body * {
            visibility: hidden;
          }
          /* Mostrar únicamente el contenedor del ticket */
          #print-ticket-area,
          #print-ticket-area * {
            visibility: visible;
          }
          #print-ticket-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            max-width: 80mm;
            padding: 0;
            margin: 0;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Courier New', Courier, monospace !important;
          }
          /* Quitar el fondo mostaza o cualquier background */
          body, html, main, div, section {
            background: #ffffff !important;
            background-image: none !important;
            box-shadow: none !important;
            border-color: #000000 !important;
          }
          /* Estilos específicos de letra para ticket */
          .ticket-text-mono {
            font-family: 'Courier New', Courier, monospace !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Cabecera / Barra de herramientas (No se imprime) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors shadow-neo-sm"
          >
            <ArrowLeft size={20} className="text-[var(--color-text)]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-2xl">#{order.orderNumber}</span>
              <span className="text-xs uppercase px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-700 border border-amber-500/30">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Ingresado el {new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-black uppercase bg-[var(--color-accent)] text-black border border-black px-4 py-2.5 rounded shadow-neo-sm hover:bg-[var(--color-accent-hover)] transition-all hover-neo"
          >
            <Printer size={16} /> Imprimir Comanda
          </button>

          <button
            onClick={() => handleUpdateStatus("DELIVERED")}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs font-black uppercase bg-emerald-500 text-white border border-black px-4 py-2.5 rounded shadow-neo-sm hover:bg-emerald-600 transition-all hover-neo disabled:opacity-50"
          >
            <CheckCircle2 size={16} /> Completar / Archivar
          </button>

          <button
            onClick={() => handleUpdateStatus("CANCELLED")}
            disabled={loading}
            className="inline-flex items-center gap-2 text-xs font-black uppercase bg-rose-500 text-white border border-black px-4 py-2.5 rounded shadow-neo-sm hover:bg-rose-600 transition-all hover-neo disabled:opacity-50"
          >
            <XCircle size={16} /> Cancelar Pedido
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 text-sm p-4 rounded-lg no-print font-bold">
          ⚠️ Error: {error}
        </div>
      )}

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Ticket de Comanda / Vista Previa (Área de Impresión) */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="print-ticket-area"
            className="w-full max-w-[450px] bg-white border-2 border-black text-black shadow-neo-lg p-6 relative rounded-sm"
          >
            {/* Cabecera del ticket estilo ticket de caja física */}
            <div className="text-center space-y-2 border-b-2 border-dashed border-black pb-4">
              <h2 className="font-grunge text-2xl tracking-widest uppercase">BLACK BEER MZA</h2>
              <p className="text-2xs font-mono font-semibold uppercase tracking-wider">
                Av. Arístides de Villanueva 123, Mendoza
              </p>
              <div className="my-2 border-t border-black border-dashed"></div>

              {/* Origen del Pedido */}
              <div className="py-2">
                {isDineIn ? (
                  <div className="bg-black text-white p-2 rounded inline-block">
                    <span className="font-black text-xl tracking-wider uppercase font-mono">
                      📍 MESA {order.tableNumber || "-"}
                    </span>
                  </div>
                ) : order.type === "TAKE_AWAY" ? (
                  <div className="bg-black text-white p-2 rounded inline-block">
                    <span className="font-black text-xl tracking-wider uppercase font-mono">
                      🛍️ TAKE AWAY (RETIRO)
                    </span>
                  </div>
                ) : (
                  <div className="bg-black text-white p-2 rounded inline-block">
                    <span className="font-black text-xl tracking-wider uppercase font-mono">
                      🛵 DELIVERY a Domicilio
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-xs font-mono">
                <span>Nº: {order.orderNumber}</span>
                <span>Hora: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span>Fecha: {new Date(order.createdAt).toLocaleDateString()}</span>
                <span>Origen: {order.type}</span>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div className="py-4 border-b-2 border-dashed border-black text-xs font-mono space-y-1.5">
              <div className="font-bold uppercase tracking-wider text-2xs text-gray-500 mb-1">Cliente</div>
              <div className="flex items-center gap-1 font-bold">
                <User size={12} /> {order.user.firstName} {order.user.lastName}
              </div>
              {!isDineIn && order.user.phone && (
                <div className="flex items-center gap-1">
                  <Phone size={12} /> {order.user.phone}
                </div>
              )}
              {!isDineIn && order.address && (
                <div className="flex items-start gap-1">
                  <MapPin size={12} className="mt-0.5 shrink-0" />
                  <span>
                    {order.address.street} {order.address.number}
                    {order.address.apartment && `, Apto: ${order.address.apartment}`}
                    <br />
                    <span className="text-2xs text-gray-600">{order.address.city}, {order.address.state}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Notas del Cliente / Comentarios de Cocina */}
            {order.customerNotes && (
              <div className="py-4 border-b-2 border-dashed border-black bg-amber-100/50 p-2.5 my-2 border border-black rounded-sm">
                <div className="font-bold uppercase tracking-wider text-2xs text-red-600 flex items-center gap-1 mb-1">
                  <MessageSquare size={12} /> ESPECIFICACIÓN / NOTA DE COCINA:
                </div>
                <p className="text-sm font-bold font-mono text-black">
                  "{order.customerNotes}"
                </p>
              </div>
            )}

            {/* Ítems del Pedido */}
            <div className="py-4 border-b-2 border-dashed border-black">
              <div className="font-bold uppercase tracking-wider text-2xs text-gray-500 mb-2 font-mono">Detalle del Pedido</div>
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-black pb-1">
                    <th className="py-1">Cant</th>
                    <th className="py-1">Producto</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {order.items.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="py-2.5 font-bold text-sm text-center pr-2">
                        {item.quantity}x
                      </td>
                      <td className="py-2.5">
                        <div className="font-bold text-sm uppercase">{item.productName}</div>
                        <div className="text-2xs text-gray-500 font-mono">SKU: {item.productSku}</div>
                      </td>
                      <td className="py-2.5 text-right font-bold text-sm">
                        {formatPrice(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen del Ticket (Subtotal, Envío, Descuento, Total) */}
            <div className="pt-4 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {!isDineIn && order.shippingCost > 0 && (
                <div className="flex justify-between">
                  <span>Costo de envío:</span>
                  <span>{formatPrice(order.shippingCost)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Descuento:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="my-1 border-t border-black border-dashed"></div>
              <div className="flex justify-between text-base font-black pt-1">
                <span>TOTAL:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Pie de ticket */}
            <div className="mt-8 text-center text-3xs font-mono uppercase tracking-widest text-gray-400 space-y-1">
              <p>¡Gracias por elegir Black Beer MZA!</p>
              <p>Disfrutá tu comida 🍔🍻</p>
              <div className="mt-4 pt-2 border-t border-black border-dotted text-2xs text-gray-500 font-mono">
                Desarrollado para BLACK BEER MZA
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral de información operativa (No se imprime) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
                <ShoppingBag size={18} /> Información del Pedido
              </h3>
              <p className="text-2xs text-[var(--color-text-muted)]">
                Detalles de facturación y canal de recepción
              </p>
            </div>

            <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
              <div className="flex justify-between py-2 border-b border-[var(--color-border)]/50">
                <span className="font-semibold text-[var(--color-text-muted)]">Estado:</span>
                <span className="font-bold uppercase">{order.status}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--color-border)]/50">
                <span className="font-semibold text-[var(--color-text-muted)]">Tipo de Pedido:</span>
                <span className="font-bold uppercase">
                  {isDineIn ? "📍 Salón / Mesa" : order.type === "TAKE_AWAY" ? "🛍️ Retiro" : "🛵 Delivery"}
                </span>
              </div>
              {isDineIn && (
                <div className="flex justify-between py-2 border-b border-[var(--color-border)]/50">
                  <span className="font-semibold text-[var(--color-text-muted)]">Mesa Asignada:</span>
                  <span className="font-bold">Mesa {order.tableNumber || "-"}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-[var(--color-border)]/50">
                <span className="font-semibold text-[var(--color-text-muted)]">Fecha y Hora:</span>
                <span className="font-mono">
                  {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] p-6 space-y-6">
            <div>
              <h3 className="font-bold text-lg text-[var(--color-text)] flex items-center gap-2">
                <User size={18} /> Perfil de Cliente
              </h3>
              <p className="text-2xs text-[var(--color-text-muted)]">
                Detalles del usuario que ordenó
              </p>
            </div>

            <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
              <div className="py-1">
                <span className="block font-semibold text-2xs text-[var(--color-text-muted)] uppercase">Nombre</span>
                <span className="font-bold text-[var(--color-text)]">{order.user.firstName} {order.user.lastName}</span>
              </div>

              {!order.user.email.startsWith("salon-mesa-") && (
                <div className="py-1">
                  <span className="block font-semibold text-2xs text-[var(--color-text-muted)] uppercase">Email</span>
                  <span className="font-mono text-[var(--color-text)]">{order.user.email}</span>
                </div>
              )}

              {order.user.phone && (
                <div className="py-1">
                  <span className="block font-semibold text-2xs text-[var(--color-text-muted)] uppercase">Teléfono</span>
                  <span className="font-mono text-[var(--color-text)]">{order.user.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tips de operación */}
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4 text-xs space-y-2">
            <h4 className="font-bold text-[var(--color-text)] uppercase tracking-wide">💡 Recomendación operativa</h4>
            <p className="text-[var(--color-text-secondary)]">
              Para imprimir este ticket en la impresora térmica de comandas, haz clic en el botón <strong>Imprimir Comanda</strong>. Se abrirá la interfaz de impresión del sistema y los estilos están optimizados para papel de 80mm de ancho.
            </p>
            <p className="text-[var(--color-text-secondary)]">
              Una vez despachado el pedido, presiona <strong>Completar / Archivar</strong> para quitarlo de la lista activa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
