import { prisma } from "@/lib/prisma";
import { initializeDatabase } from "@/lib/dbInitializer";
import ProductListClient from "@/components/admin/ProductListClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // Asegurar que la base de datos esté inicializada con la carta de BlackBeer Mza
  await initializeDatabase();

  // Obtener los productos reales de la base de datos
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  // Obtener las categorías disponibles para el selector del formulario
  const rawCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  // Mapear Decimal de Prisma a Number para evitar problemas de serialización en Server Components
  const products = rawProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    costPrice: p.costPrice ? Number(p.costPrice) : null,
    weight: p.weight ? Number(p.weight) : null,
    images: p.images.map((img) => ({
      ...img,
      alt: img.alt ?? null,
    })),
  }));

  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase text-[var(--color-text)] tracking-wider">
            Gestión de Carta
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Modifica precios, promociones, disponibilidad y stock de los productos.
          </p>
        </div>
      </div>

      {/* Componente interactivo del cliente */}
      <ProductListClient products={products} categories={categories} />
    </div>
  );
}
