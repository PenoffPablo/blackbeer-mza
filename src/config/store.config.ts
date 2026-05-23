/**
 * ═══════════════════════════════════════════════════════════
 * STORE CONFIGURATION
 * ═══════════════════════════════════════════════════════════
 * Este es el ÚNICO archivo que necesitás editar para
 * personalizar la tienda para cada cliente.
 */

export const storeConfig = {
  /** Nombre de la tienda — aparece en navbar, footer, SEO */
  name: "BLACKBEER MZA",

  /** URL base de la tienda */
  url: process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000",

  /** Descripción para SEO */
  description: "Hamburguesería & Bar. Las Heras y Ciudad, Mendoza.",

  /** Moneda por defecto */
  currency: "ARS" as const,

  /** Locale para formateo de números/fechas */
  locale: "es-AR",

  /** Símbolo de moneda */
  currencySymbol: "$",

  /** Contacto */
  contact: {
    email: "contacto@blackbeermza.com",
    phone: "+54 261 719-5277",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5492617195277", // Recibe la comanda
  },

  /** Sucursales */
  locations: [
    "Coronel Díaz 302, Las Heras",
    "Belgrano y Mariano Moreno, Ciudad"
  ],

  /** Redes sociales */
  social: {
    instagram: "blackbeermza",
    facebook: "",
    twitter: "",
    tiktok: "",
  },

  /** SEO defaults */
  seo: {
    titleTemplate: "%s | BLACKBEER MZA",
    defaultTitle: "BLACKBEER MZA — Pedidos por WhatsApp",
    defaultDescription: "Armá tu pedido de hamburguesas, lomos, papas o pizzas de forma autónoma y rápida.",
    ogImage: "/images/og-default.jpg",
  },

  /** Configuración de envío */
  shipping: {
    freeShippingThreshold: 999999, // No aplica envío gratis por defecto
    defaultShippingCost: 1500,
  },

  /** Configuración del carrito */
  cart: {
    maxQuantityPerItem: 20,
  },

  /** Google Sheets integraciones */
  googleSheets: {
    menuUrl: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_MENU_URL || "",
    zonesUrl: process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ZONES_URL || "",
  }
} as const;

export type StoreConfig = typeof storeConfig;

