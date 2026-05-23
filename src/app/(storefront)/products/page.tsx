import type { Metadata } from "next";
import { SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { storeConfig } from "@/config/store.config";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Productos",
  description: `Explorá nuestro catálogo completo de productos en ${storeConfig.name}`,
};

export default function ProductsPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-b from-[var(--color-primary-bg)] to-[var(--color-bg)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)]">
            Productos
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            Explorá nuestro catálogo completo
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ═══ SIDEBAR FILTERS ═══ */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
              <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2 mb-4">
                <SlidersHorizontal size={18} />
                Filtros
              </h3>

              {/* Category filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Categoría
                </h4>
                <div className="space-y-2">
                  {["Todas", "Electrónica", "Ropa", "Hogar", "Accesorios"].map(
                    (cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="category"
                          className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          defaultChecked={cat === "Todas"}
                        />
                        {cat}
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="my-4 border-t border-[var(--color-border)]" />

              {/* Price filter */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">
                  Precio
                </h4>
                <div className="space-y-2">
                  {[
                    "Todos",
                    "Hasta $5.000",
                    "$5.000 - $15.000",
                    "$15.000 - $50.000",
                    "Más de $50.000",
                  ].map((range) => (
                    <label
                      key={range}
                      className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="price"
                        className="text-[var(--color-primary)]"
                        defaultChecked={range === "Todos"}
                      />
                      {range}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ═══ PRODUCT GRID ═══ */}
          <div className="flex-1 space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] px-4 py-3">
              <p className="text-sm text-[var(--color-text-muted)]">
                Mostrando <strong className="text-[var(--color-text)]">12</strong> productos
              </p>
              <div className="flex items-center gap-3">
                <select className="text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-3 py-1.5 text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                  <option>Más recientes</option>
                  <option>Precio: menor a mayor</option>
                  <option>Precio: mayor a menor</option>
                  <option>Nombre A-Z</option>
                </select>
                <div className="hidden sm:flex items-center border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
                  <button className="p-1.5 bg-[var(--color-primary-bg)] text-[var(--color-primary)] cursor-pointer">
                    <Grid3X3 size={18} />
                  </button>
                  <button className="p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] cursor-pointer">
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Placeholder product grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden group hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all duration-[var(--transition-base)]"
                >
                  <div className="aspect-square bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] flex items-center justify-center">
                    <div className="w-14 h-14 rounded-[var(--radius-xl)] bg-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
                      <Star size={20} strokeWidth={1} />
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="text-xs font-medium text-[var(--color-primary)] uppercase tracking-wider">
                      Categoría
                    </div>
                    <div className="text-sm font-medium text-[var(--color-text)]">
                      Producto {i + 1}
                    </div>
                    <div className="text-lg font-bold text-[var(--color-text)]">
                      $ {((i + 1) * 3000).toLocaleString("es-AR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {[1, 2, 3, "...", 10].map((p, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 flex items-center justify-center rounded-[var(--radius-md)] text-sm font-medium transition-all cursor-pointer ${
                    p === 1
                      ? "bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
