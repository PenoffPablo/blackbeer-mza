"use client";

import { useState } from "react";
import { X, Copy, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState(false);

  if (!isOpen) return null;

  const alias = "blackbeer.mendoza.mp";
  const cbu = "0000003100084512467890";
  const titular = "Black Beer Mendoza S.H.";
  const cuit = "30-71754896-9";

  const handleCopy = (text: string, type: "alias" | "cbu") => {
    navigator.clipboard.writeText(text);
    if (type === "alias") {
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    } else {
      setCopiedCbu(true);
      setTimeout(() => setCopiedCbu(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[var(--color-surface)] border-4 border-black p-6 rounded-[var(--radius-xl)] shadow-neo-xl z-10 animate-fade-in text-black">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border-2 border-black rounded-md hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-grunge uppercase tracking-wider">
            Transferencia / QR
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] font-medium mt-1">
            Realizá el pago y guardá el comprobante
          </p>
        </div>

        {/* QR Code Placeholder (Premium SVG Graphic) */}
        <div className="flex flex-col items-center justify-center bg-white border-2 border-black p-4 rounded-lg mb-6">
          <div className="w-48 h-48 relative flex items-center justify-center bg-gray-50 border border-dashed border-gray-300">
            {/* Cool retro-style QR representation in SVG */}
            <svg viewBox="0 0 100 100" className="w-40 h-40" fill="black">
              {/* Pos corners */}
              <rect x="5" y="5" width="25" height="25" fill="none" stroke="black" strokeWidth="6" />
              <rect x="11" y="11" width="13" height="13" />
              <rect x="70" y="5" width="25" height="25" fill="none" stroke="black" strokeWidth="6" />
              <rect x="76" y="11" width="13" height="13" />
              <rect x="5" y="70" width="25" height="25" fill="none" stroke="black" strokeWidth="6" />
              <rect x="11" y="76" width="13" height="13" />
              {/* Random blocks representing QR data */}
              <rect x="35" y="5" width="10" height="5" />
              <rect x="55" y="5" width="5" height="10" />
              <rect x="45" y="20" width="15" height="5" />
              <rect x="35" y="35" width="5" height="15" />
              <rect x="50" y="40" width="20" height="10" />
              <rect x="15" y="45" width="10" height="5" />
              <rect x="75" y="45" width="5" height="15" />
              <rect x="35" y="60" width="15" height="5" />
              <rect x="60" y="60" width="10" height="10" />
              <rect x="80" y="70" width="15" height="5" />
              <rect x="45" y="80" width="10" height="10" />
              <rect x="70" y="85" width="15" height="10" />
            </svg>
            <div className="absolute bg-white border border-black p-1 rounded-sm text-[8px] font-black tracking-tighter">
              BLACKBEER
            </div>
          </div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-2">
            Escaneá desde cualquier billetera
          </span>
        </div>

        {/* Bank details */}
        <div className="space-y-3 bg-[var(--color-bg-secondary)] border-2 border-black p-4 rounded-lg text-sm">
          <div>
            <span className="text-xs text-[var(--color-text-muted)] block">Titular:</span>
            <span className="font-bold">{titular}</span>
          </div>

          <div>
            <span className="text-xs text-[var(--color-text-muted)] block">CUIT:</span>
            <span className="font-bold">{cuit}</span>
          </div>

          <div className="flex items-center justify-between border-t border-black/10 pt-2">
            <div>
              <span className="text-xs text-[var(--color-text-muted)] block">Alias:</span>
              <span className="font-mono font-bold text-black">{alias}</span>
            </div>
            <button
              onClick={() => handleCopy(alias, "alias")}
              className="p-1.5 border border-black rounded bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
              title="Copiar Alias"
            >
              {copiedAlias ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--color-text-muted)] block">CBU:</span>
              <span className="font-mono font-bold text-xs text-black">{cbu}</span>
            </div>
            <button
              onClick={() => handleCopy(cbu, "cbu")}
              className="p-1.5 border border-black rounded bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
              title="Copiar CBU"
            >
              {copiedCbu ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Warning info */}
        <div className="flex items-start gap-2 bg-yellow-100 border border-yellow-300 p-3 rounded-lg mt-4 text-[11px] leading-relaxed text-yellow-900 font-medium">
          <Info size={16} className="shrink-0 text-yellow-700 mt-0.5" />
          <p>
            Al finalizar la compra, se abrirá WhatsApp. <strong>Adjuntá el comprobante de transferencia</strong> en el chat para que validemos tu pago de inmediato.
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onClose}
          className="w-full mt-5 border-2 border-black hover-neo bg-[var(--color-primary)] text-white font-bold uppercase py-2.5"
        >
          Entendido, continuar
        </Button>
      </div>
    </div>
  );
}
