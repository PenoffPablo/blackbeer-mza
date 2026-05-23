"use client";

import React, { useState } from "react";
import BubbalooText from "@/components/ui/BubbalooText";

export default function BubbalooDemoPage() {
  const [text, setText] = useState("Bubbaloo");
  const [animated, setAnimated] = useState(true);

  return (
    <div className="min-h-screen bg-[#000B4F] flex flex-col items-center justify-center p-6 text-white select-none relative overflow-hidden">
      {/* Background decorations matching the 90s theme */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff128c] opacity-20 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#FFF200] opacity-15 blur-3xl" />
      
      {/* Retro background grid pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />

      <div className="z-10 max-w-xl w-full text-center space-y-12">
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-widest bg-[#ff128c] px-3 py-1 rounded-full font-black text-white shadow-lg shadow-[#ff128c]/25">
            90s Bubblegum Typography
          </span>
          <h2 className="text-xl font-bold text-gray-300">
            Demos & Playground
          </h2>
        </div>

        {/* The Bubbaloo rendered text */}
        <div className="py-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[220px] shadow-2xl">
          <BubbalooText text={text} className="text-5xl sm:text-7xl" animated={animated} />
        </div>

        {/* Interactive Controls */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl space-y-4 text-left">
          <h3 className="font-extrabold text-sm uppercase text-gray-300 border-b border-white/10 pb-2">
            Controles del Laboratorio
          </h3>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase">
              Texto de Prueba
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={20}
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white font-bold placeholder-gray-500 focus:outline-none focus:border-[#ff128c] transition-all"
              placeholder="Escribe algo..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-gray-400 uppercase">
              Desalineado / Animado 90s
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={animated}
                onChange={(e) => setAnimated(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff128c]"></div>
            </label>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["Bubbaloo", "BlackBeer", "Mendoza", "Candy", "90s Style"].map((preset) => (
            <button
              key={preset}
              onClick={() => setText(preset)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-extrabold transition-all hover:scale-105 active:scale-95"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
