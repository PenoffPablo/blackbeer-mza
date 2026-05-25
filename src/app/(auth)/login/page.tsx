import { Suspense } from "react";
import { LoginForm } from "@/components/features/LoginForm";
import { storeConfig } from "@/config/store.config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso Personal",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-[var(--radius-lg)] flex items-center justify-center text-white text-xl font-bold">
            {storeConfig.name.charAt(0)}
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Acceso a Personal
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Solo administradores y recepcionistas
          </p>
        </div>

        {/* Form */}
        <Suspense fallback={<div className="text-center text-sm text-[var(--color-text-muted)]">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
