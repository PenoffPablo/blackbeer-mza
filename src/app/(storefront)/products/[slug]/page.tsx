import { getProductBySlug, getRelatedProducts } from "@/services/product.service";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductInfo } from "./ProductInfo";
import { ProductGrid } from "@/components/features/ProductGrid";
import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  return {
    title: product.name,
    description: product.description || `Comprar ${product.name} al mejor precio en nuestra tienda.`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category?.slug || null);

  const mainImage = product.images[0];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden relative shadow-[var(--shadow-md)]">
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt || product.name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                <ShoppingBag size={80} strokeWidth={1} />
              </div>
            )}
          </div>

          {/* Thumbnails grid */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className="aspect-square bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden relative cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details (Client Interactive) */}
        <ProductInfo product={product} />
      </div>

      {/* Product Description Full & Reviews */}
      <div className="border-t border-[var(--color-border)] pt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Detalles del Producto
          </h2>
          <div className="prose text-sm text-[var(--color-text-secondary)] max-w-none leading-relaxed">
            {product.description || "No hay información adicional disponible para este producto."}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--color-text)]">
            Opiniones de Clientes
          </h2>
          <div className="p-6 bg-[var(--color-bg-secondary)] rounded-[var(--radius-xl)] border border-[var(--color-border)] text-center space-y-3">
            <span className="text-4xl font-extrabold text-[var(--color-text)]">
              {product.reviews.rating}
            </span>
            <div className="flex justify-center text-[var(--color-accent)]">
              {/* Simple rating count preview */}
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-xl">★</span>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              Basado en {product.reviews.count} calificaciones de clientes verificadas
            </p>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-[var(--color-border)] pt-12 space-y-6">
          <ProductGrid
            products={relatedProducts}
            title="Productos Relacionados"
            subtitle="También te pueden interesar estos productos similares"
          />
        </div>
      )}
    </div>
  );
}
