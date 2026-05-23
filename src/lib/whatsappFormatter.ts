import type { Cart } from "@/types/cart";
import { storeConfig } from "@/config/store.config";

export interface OrderDetails {
  customerName: string;
  customerPhone: string;
  deliveryType: "delivery" | "takeaway" | "local";
  tableNumber?: string | null;
  address?: {
    street: string;
    number: string;
    apartment?: string;
    notes?: string;
  } | null;
  paymentMethod: "cash" | "transfer";
  gpsCoords?: { lat: number; lng: number } | null;
  ticketNumber: number;
  tipAmount?: number;
  orderComments?: string;
}

/**
 * Formatea un pedido de forma limpia e inequívoca para el cajero de BlackBeer Mza.
 * Emplea emojis y negritas compatibles con WhatsApp.
 */
export function formatWhatsAppMessage(cart: Cart, details: OrderDetails): string {
  // Manejo especial para Salón / Mesas
  if (details.deliveryType === "local" && details.tableNumber) {
    const paymentTextLocal = details.paymentMethod === "cash" ? "Efectivo" : "Transferencia / QR (Comprobante adjunto)";
    const now = new Date();
    // Hora formato "HH:MM hs"
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} hs`;

    let text = `🚨 ¡NUEVO PEDIDO PARA SALÓN!\n\n`;
    text += `📍 MESA: ${details.tableNumber}\n\n`;
    text += `👤 CLIENTE: ${details.customerName}\n\n`;
    text += `📞 TEL: ${details.customerPhone}\n\n`;
    text += `⏰ HORA: ${timeStr}\n\n`;

    cart.items.forEach((item) => {
      const extrasText = item.variantName ? ` (${item.variantName})` : "";
      text += `${item.quantity}x ${item.name}${extrasText} - $${(item.price * item.quantity).toLocaleString("es-AR")}\n\n`;
    });

    if (details.orderComments) {
      text += `📝 *Aclaraciones:* ${details.orderComments}\n\n`;
    }

    if (details.tipAmount && details.tipAmount > 0) {
      text += `✍️ *Propina Mozo:* $${details.tipAmount.toLocaleString("es-AR")}\n\n`;
    }

    const finalTotal = cart.subtotal + (details.tipAmount || 0);
    text += `💰 TOTAL A PAGAR: $${finalTotal.toLocaleString("es-AR")}\n\n`;
    text += `💳 PAGO: ${paymentTextLocal}`;

    return text;
  }

  // Comportamiento original (Delivery / Takeaway)
  const deliveryText = details.deliveryType === "delivery" ? "ENVÍO A DOMICILIO" : "RETIRO POR EL LOCAL";
  const paymentText = details.paymentMethod === "cash" ? "Efectivo / Paga al Cadete" : "Transferencia / QR";
  
  let total = cart.subtotal;

  let text = `*NUEVO PEDIDO #${details.ticketNumber} (BLACK BEER MZA)*\n`;
  text += `---------------------------------------\n\n`;
  
  // Cliente
  text += `*Cliente:* ${details.customerName}\n`;
  text += `*Teléfono:* ${details.customerPhone}\n`;
  text += `*Tipo:* ${deliveryText}\n\n`;

  // Dirección y Entregas
  if (details.deliveryType === "delivery") {
    if (details.address?.notes) {
      text += `*Notas de envío:* ${details.address.notes}\n`;
    }
    // Geolocalización obligatoria
    if (details.gpsCoords) {
      const { lat, lng } = details.gpsCoords;
      text += `*Ubicación GPS:* https://maps.google.com/?q=${lat},${lng}\n`;
    }
    text += `\n`;
  } else if (details.deliveryType === "takeaway" && details.address?.notes) {
    text += `*${details.address.notes}*\n\n`;
  }

  // Aclaraciones generales del pedido
  if (details.orderComments) {
    text += `*Aclaraciones:* ${details.orderComments}\n\n`;
  }

  // Items
  text += `*DETALLE DEL PEDIDO:*\n`;
  cart.items.forEach((item) => {
    // Si contiene extras, los listamos en el mismo renglón o indentado
    const extrasText = item.variantName ? ` (${item.variantName})` : "";
    text += `- ${item.quantity}x ${item.name}${extrasText} - $${(item.price * item.quantity).toLocaleString("es-AR")}\n`;
  });
  text += `\n`;

  // Totales
  text += `---------------------------------------\n`;
  if (details.deliveryType === "delivery") {
    text += `*TOTAL A PAGAR:* $${total.toLocaleString("es-AR")} (+ envío)\n`;
  } else {
    text += `*TOTAL A PAGAR:* $${total.toLocaleString("es-AR")}\n`;
  }
  text += `*Método de Pago:* ${paymentText}\n`;
  text += `---------------------------------------\n\n`;

  if (details.paymentMethod === "transfer") {
    text += `_*(Por favor, adjuntar el comprobante de transferencia a continuación)*_`;
  } else {
    text += `*¡Pedido armado! Aguardamos confirmación del local.*`;
  }

  return text;
}

/**
 * Genera el enlace de WhatsApp codificado con el mensaje formateado.
 */
export function getWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
