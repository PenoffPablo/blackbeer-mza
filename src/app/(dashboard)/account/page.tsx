import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";
import type { Metadata } from "next";

import type { Address } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi Cuenta / Datos Personales",
  description: "Administrá tu información de contacto y direcciones.",
};

export default async function AccountPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.userId },
    include: { addresses: true },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--color-text)]">
          Mis Datos Personales
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Información básica asociada a tu cuenta
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3">
            <User className="text-[var(--color-primary)]" size={20} />
            <h3 className="font-bold text-[var(--color-text)]">Detalles de Contacto</h3>
          </div>

          <div className="space-y-3.5 text-sm text-[var(--color-text-secondary)]">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--color-text-muted)]">Nombre Completo</span>
              <span className="font-semibold text-[var(--color-text)]">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--color-text-muted)]">Correo Electrónico</span>
              <span className="font-semibold text-[var(--color-text)] flex items-center gap-1">
                <Mail size={14} /> {user.email}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--color-text-muted)]">Teléfono</span>
              <span className="font-semibold text-[var(--color-text)] flex items-center gap-1">
                <Phone size={14} /> {user.phone || "No especificado"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--color-text-muted)]">Rol</span>
              <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-[var(--color-primary-bg)]/20 text-[var(--color-primary)] uppercase flex items-center gap-1">
                <Shield size={10} /> {user.role}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-3.5">
              <span className="text-xs text-[var(--color-text-muted)]">Miembro desde</span>
              <span className="font-semibold text-[var(--color-text)] flex items-center gap-1 text-xs">
                <Calendar size={14} /> {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Addresses Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 space-y-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-3">
            <Shield className="text-[var(--color-primary)]" size={20} />
            <h3 className="font-bold text-[var(--color-text)]">Direcciones de Envío</h3>
          </div>

          <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
            {user.addresses.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-6">
                No tenés direcciones registradas todavía. Agregaremos una automáticamente en tu próximo checkout.
              </p>
            ) : (
              user.addresses.map((address: Address) => (
                <div
                  key={address.id}
                  className="p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] text-xs space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--color-text)]">
                      {address.label || "Dirección de envío"}
                    </span>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] text-[10px] font-bold">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--color-text-secondary)] mt-1">
                    {address.street} {address.number} {address.apartment && `, ${address.apartment}`}
                  </p>
                  <p className="text-[var(--color-text-muted)]">
                    {address.city}, {address.state} ({address.zipCode})
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
