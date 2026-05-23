"use client";

import React from "react";

interface BubbalooTextProps {
  /** Texto a renderizar con estilo Bubbaloo */
  text: string;
  /** Clases de Tailwind o CSS adicionales para el contenedor */
  className?: string;
  /** Si debe aplicar el efecto de desalineación divertida (rotación y traslación Y aleatoria/alternada) */
  animated?: boolean;
}

/**
 * Componente BubbalooText
 * 
 * Recrea la tipografía de Bubbaloo estilo bubblegum 90s.
 * Utiliza una técnica de doble capa en CSS para lograr relleno de degradado limpio
 * y contornos/extrusiones sin que se solapen erróneamente.
 * 
 * Además, garantiza total accesibilidad (SEO y lectores de pantalla) usando aria-label.
 */
export default function BubbalooText({
  text,
  className = "",
  animated = true,
}: BubbalooTextProps) {
  if (!text) return null;

  // Convertimos el texto a un array de caracteres para aplicar estilos individuales.
  // Nota: Para mantener el estilo Bubbaloo, hacemos un transform a capitalize en lógica
  // o forzamos que la primera letra del string sea la más destacada.
  const chars = text.split("");

  return (
    <span
      className={`bubbaloo-container select-none ${className}`}
      role="img"
      aria-label={text}
    >
      {chars.map((char, index) => {
        // Ignorar espacios en blanco para las transformaciones pero renderizarlos
        if (char === " ") {
          return (
            <span key={index} className="inline-block w-[0.3em]" aria-hidden="true">
              &nbsp;
            </span>
          );
        }

        const isFirst = index === 0;

        // Alternar desplazamientos y rotaciones lúdicas típicas del estilo candy de los 90
        // Primera letra: rotación sutil, tamaño mucho más grande, z-index alto.
        // Letras siguientes: alternan rotaciones leves y desfases verticales.
        let style: React.CSSProperties = {};
        if (animated) {
          const rotation = isFirst
            ? "-4deg"
            : index % 2 === 0
            ? "3deg"
            : "-3deg";
          const translationY = isFirst
            ? "-2px"
            : index % 2 === 0
            ? "3px"
            : "-3px";
          
          style = {
            transform: `rotate(${rotation}) translateY(${translationY})`,
            display: "inline-block",
            transformOrigin: "center",
          };
        }

        // Estilos específicos para la primera letra (más grande)
        const sizeClass = isFirst
          ? "text-[1.35em] z-10"
          : "text-[1em] z-[1]";

        return (
          <span
            key={index}
            className={`bubbaloo-letter ${sizeClass}`}
            data-letter={char}
            style={style}
            aria-hidden="true"
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
