"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Protegemos el ícono para que no rompa el SSR de Next.js
const getDefaultIcon = () => {
  if (typeof window === 'undefined') return null;
  return L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });
};

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  const icon = getDefaultIcon();

  return (position === null || !icon) ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
}

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

interface MapPickerProps {
  onLocationSelected: (coords: { lat: number; lng: number }) => void;
}

const MENDOZA_CENTER: [number, number] = [-32.8908, -68.8272];

export default function MapPicker({ onLocationSelected }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (position) {
      onLocationSelected({ lat: position.lat, lng: position.lng });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = new L.LatLng(latitude, longitude);
        setPosition(newPos);
        setMapCenter([latitude, longitude]);
        setLoading(false);
      },
      (err) => {
        alert("No pudimos obtener tu ubicación por GPS. Por favor busca tu calle en el mapa manualmente.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleLocateMe}
        disabled={loading}
        className="w-full py-3 bg-[var(--color-primary)] hover:bg-fuchsia-600 text-black font-black uppercase rounded-lg flex items-center justify-center gap-2 transition-all shadow-neo-sm border-2 border-black active:scale-95"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Buscando GPS...
          </>
        ) : (
          <>
            <MapPin size={16} /> Detectar mi ubicación por GPS
          </>
        )}
      </Button>
      
      <div className="h-64 w-full rounded-lg overflow-hidden border-2 border-zinc-800 z-0 relative shadow-md bg-[#1a1a1a]">
        <MapContainer
          center={MENDOZA_CENTER}
          zoom={14}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <MapController center={mapCenter} />
        </MapContainer>
      </div>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider text-center">
        👆 Toca el mapa para ajustar el pin rojo sobre tu casa exacta.
      </p>
    </div>
  );
}
