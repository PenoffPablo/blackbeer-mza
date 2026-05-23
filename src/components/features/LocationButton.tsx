"use client";

import { useState } from "react";
import { MapPin, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface LocationButtonProps {
  onLocationFetched: (coords: { lat: number; lng: number } | null) => void;
}

export function LocationButton({ onLocationFetched }: LocationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onLocationFetched(coords);
        setSuccess(true);
        setLoading(false);
      },
      (err) => {
        console.error("Error obteniendo ubicación:", err);
        let msg = "No pudimos obtener tu ubicación.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Permiso de ubicación denegado. Activá el GPS en tu celular.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "La señal de GPS no está disponible temporalmente.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Tiempo de espera agotado al obtener ubicación.";
        }
        setError(msg);
        onLocationFetched(null);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Button
          type="button"
          variant={success ? "outline" : "primary"}
          onClick={handleGetLocation}
          disabled={loading}
          className="flex-1 justify-center gap-2 border-2 border-black hover-neo text-sm font-bold uppercase transition-all duration-100"
          style={{
            backgroundColor: success ? "var(--color-success-bg)" : loading ? "var(--color-bg-secondary)" : "var(--color-primary)",
            color: success ? "var(--color-success)" : "var(--color-text-inverse)",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Obteniendo GPS...
            </>
          ) : success ? (
            <>
              <Check size={16} className="text-[var(--color-success)]" />
              ¡GPS Compartido con éxito!
            </>
          ) : (
            <>
              <MapPin size={16} />
              Compartir mi ubicación exacta (GPS)
            </>
          )}
        </Button>
        {success && (
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              onLocationFetched(null);
            }}
            className="text-xs text-[var(--color-text-muted)] underline text-center sm:text-left cursor-pointer"
          >
            Quitar
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-danger)] bg-[var(--color-danger-bg)] border border-[var(--color-danger)] p-2 rounded-md font-medium">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <p className="text-[10px] text-[var(--color-text-muted)] leading-normal">
        📍 Esto le permite al cadete encontrarte más rápido a través de Google Maps.
      </p>
    </div>
  );
}
