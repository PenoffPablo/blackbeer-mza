"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { formatPrice } from "@/lib/formatters";
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  category?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        // Query storefront products API
        const response = await fetch(`/api/products?search=${encodeURIComponent(debouncedQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.products || []);
        } else {
          // Fallback to static mock if DB not ready
          setResults(getMockResults(debouncedQuery));
        }
      } catch {
        setResults(getMockResults(debouncedQuery));
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="search"
          placeholder="Buscar productos, categorías o marcas..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-[var(--radius-lg)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm transition-all duration-[var(--transition-fast)]"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Suggestion Dropdown */}
      {isOpen && (query.trim() !== "") && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] z-50 overflow-hidden max-h-96 flex flex-col animate-fade-in">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center text-[var(--color-text-muted)] gap-2">
              <Loader2 size={24} className="animate-spin text-[var(--color-primary)]" />
              <span className="text-xs">Buscando productos...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--color-text-muted)]">
              No se encontraron resultados para &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="overflow-y-auto flex-1 divide-y divide-[var(--color-border)]">
              {results.slice(0, 5).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <div className="w-12 h-12 bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)] overflow-hidden relative shrink-0">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                        <ShoppingBag size={18} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[var(--color-text)] truncate">
                      {product.name}
                    </h4>
                    {product.category && (
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {product.category}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">
                    {formatPrice(product.price)}
                  </div>
                </Link>
              ))}
              <button
                onClick={handleSearchSubmit}
                className="w-full py-2.5 text-center text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
              >
                Ver todos los resultados ({results.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Fallback logic for client-side search simulation if DB is connectionless/empty
function getMockResults(query: string): SearchResult[] {
  const items: SearchResult[] = [
    { id: "1", name: "Auriculares Bluetooth Premium", slug: "auriculares-bluetooth-premium", price: 45000, category: "Electrónica" },
    { id: "2", name: "Smartwatch Deportivo", slug: "smartwatch-deportivo", price: 89000, category: "Electrónica" },
    { id: "3", name: "Remera Oversize Algodón", slug: "remera-oversize-algodon", price: 15000, category: "Ropa" },
    { id: "4", name: "Mochila Urbana Impermeable", slug: "mochila-urbana-impermeable", price: 42000, category: "Accesorios" },
  ];
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(query.toLowerCase())
  );
}
