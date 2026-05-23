import { prisma } from "@/lib/prisma";
import { storeConfig } from "@/config/store.config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings, Info, Save } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configuración de Tienda",
  description: "Ajustes globales de marca, moneda, métodos de envío e impuestos.",
};

export default async function AdminSettingsPage() {
  let dbConfig = await prisma.storeConfig.findUnique({
    where: { id: 1 },
  });

  // Fallback to local config if seed hasn't run yet
  const config = dbConfig || {
    storeName: storeConfig.name,
    currency: storeConfig.currency,
    locale: storeConfig.locale,
    contactEmail: storeConfig.contact.email,
    contactPhone: storeConfig.contact.phone,
    socialLinks: {},
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">
          Configuración General
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Ajustes globales del e-commerce y variables de marca
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Settings form */}
        <form className="lg:col-span-2 space-y-6">
          {/* General Branding */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4 shadow-[var(--shadow-sm)]">
            <h3 className="text-sm font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
              Identidad de Marca
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de la Tienda"
                defaultValue={config.storeName}
                required
              />
              <Input
                label="Slogan / Meta descripción"
                defaultValue={storeConfig.description}
              />
            </div>
          </div>

          {/* Localization */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4 shadow-[var(--shadow-sm)]">
            <h3 className="text-sm font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
              Localización e Impuestos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Moneda (ISO)"
                defaultValue={config.currency}
                required
              />
              <Input
                label="Idioma / Región (Locale)"
                defaultValue={config.locale}
                required
              />
              <Input
                label="Costo de Envío Base"
                type="number"
                defaultValue={storeConfig.shipping.defaultShippingCost}
              />
            </div>
          </div>

          {/* Contact details */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4 shadow-[var(--shadow-sm)]">
            <h3 className="text-sm font-bold text-[var(--color-text)] border-b border-[var(--color-border)] pb-3">
              Datos de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email de Soporte"
                type="email"
                defaultValue={config.contactEmail || ""}
              />
              <Input
                label="Teléfono Comercial"
                type="tel"
                defaultValue={config.contactPhone || ""}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button variant="primary" type="button" disabled>
              <Save size={16} /> Guardar Cambios
            </Button>
          </div>
        </form>

        {/* Tip/Info sidebar */}
        <div className="space-y-4">
          <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-3">
            <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
              <Info size={16} className="text-[var(--color-primary)]" />
              ¿Cómo funciona?
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              Esta configuración controla los textos del footer, el nombre en la barra de navegación, la moneda en la que se muestran todos los precios de la tienda y la configuración para las pasarelas de pago.
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-semibold">
              Podés editar estos valores estáticamente en el archivo local:
            </p>
            <p className="text-xs font-mono bg-[var(--color-surface)] border border-[var(--color-border)] p-2 rounded text-[var(--color-text)]">
              src/config/store.config.ts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
