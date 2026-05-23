"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTable } from "@/context/TableContext";
import { showToast } from "@/components/ui/Toast";
import { Beer } from "lucide-react";

export default function MesaPage() {
  const router = useRouter();
  const params = useParams();
  const { setTableNumber } = useTable();

  useEffect(() => {
    const numero = params?.numeroMesa;
    if (numero && typeof numero === "string") {
      setTableNumber(numero);
      showToast({
        message: `¡Mesa ${numero} vinculada! Puedes comenzar a pedir.`,
        type: "success",
      });
      // Redirect to home so they can see the menu
      router.replace("/");
    } else {
      router.replace("/");
    }
  }, [params, router, setTableNumber]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg)] p-4 text-center space-y-4">
      <div className="w-20 h-20 bg-[var(--color-primary)] text-black rounded-full flex items-center justify-center animate-bounce border-4 border-black shadow-neo-md">
        <Beer size={40} />
      </div>
      <h1 className="text-2xl font-black uppercase tracking-wider text-black">
        Preparando tu mesa...
      </h1>
      <p className="text-sm font-bold text-neutral-500">
        Aguardá un instante mientras configuramos tu pedido.
      </p>
    </div>
  );
}
