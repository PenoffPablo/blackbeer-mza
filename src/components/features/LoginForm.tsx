"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      showToast({ message: "¡Bienvenido/a al sistema!", type: "success" });
      router.push(redirectUrl);
      router.refresh(); // Refresh to update server components (like middleware)
    } catch (err: any) {
      showToast({ message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-[var(--color-text-secondary)] cursor-pointer">
          <input type="checkbox" className="rounded text-[var(--color-primary)]" />
          Recordarme
        </label>
        <Link
          href="/forgot-password"
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Iniciando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
