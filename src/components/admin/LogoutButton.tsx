"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toast";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        showToast({ message: "Sesión cerrada correctamente", type: "success" });
        router.push("/");
        router.refresh();
      } else {
        throw new Error("No se pudo cerrar sesión");
      }
    } catch (err: any) {
      showToast({ message: err.message, type: "error" });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-[var(--radius-md)] transition-colors w-full text-left"
    >
      <LogOut size={18} />
      <span>Cerrar sesión</span>
    </button>
  );
}
