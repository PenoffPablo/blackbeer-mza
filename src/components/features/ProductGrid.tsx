import { ProductCard } from "./ProductCard";
import type { ProductListItem } from "@/types/product";

interface ProductGridProps {
  products: ProductListItem[];
  title?: string;
  subtitle?: string;
}

export function ProductGrid({ products, title, subtitle }: ProductGridProps) {
  return (
    <section className="space-y-6">
      {(title || subtitle) && (
        <div className="text-center space-y-2">
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text)]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--color-text-muted)] text-lg">
            No se encontraron productos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
