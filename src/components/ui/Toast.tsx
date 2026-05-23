"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

// Global state for toasts
let toasts: ToastData[] = [];
let listeners: Array<(toasts: ToastData[]) => void> = [];

function emit() {
  listeners.forEach((fn) => fn([...toasts]));
}

/** Muestra un toast. Se puede llamar desde cualquier parte de la app. */
export function toast(message: string, type: ToastType = "info") {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, message, type }];
  emit();

  // Auto-remove after 4s
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
}

/** Wrapper para showToast con parámetros de objeto para compatibilidad */
export function showToast({
  message,
  type = "info",
}: {
  message: string;
  type?: ToastType | "default";
}) {
  const normalizedType: ToastType = type === "default" ? "info" : type;
  toast(message, normalizedType);
}

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const toastStyles: Record<ToastType, string> = {
  success:
    "bg-[var(--color-success-bg)] border-[var(--color-success)] text-[var(--color-success)]",
  error:
    "bg-[var(--color-danger-bg)] border-[var(--color-danger)] text-[var(--color-danger)]",
  info:
    "bg-[var(--color-info-bg)] border-[var(--color-info)] text-[var(--color-info)]",
  warning:
    "bg-[var(--color-warning-bg)] border-[var(--color-warning)] text-[var(--color-warning)]",
};

/** Componente contenedor de toasts. Ponerlo en el root layout. */
export function ToastContainer() {
  const [items, setItems] = useState<ToastData[]>([]);

  useEffect(() => {
    listeners.push(setItems);
    return () => {
      listeners = listeners.filter((fn) => fn !== setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {items.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] border",
              "shadow-[var(--shadow-lg)] animate-slide-up",
              toastStyles[t.type]
            )}
          >
            <Icon size={18} className="shrink-0" />
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button
              onClick={() => {
                toasts = toasts.filter((tt) => tt.id !== t.id);
                emit();
              }}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
