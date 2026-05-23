import { prisma } from "@/lib/prisma";
import StorefrontClient from "@/components/storefront/StorefrontClient";

export const dynamic = "force-dynamic";

export default async function StorefrontHomePage() {

  // Obtener todos los productos activos de la base de datos
  const rawProducts = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  // Obtener todas las categorías de la base de datos
  const rawCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  // Mapear Decimal de Prisma a Number para serialización limpia de Server Components
  const products = rawProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    categoryId: p.categoryId,
    category: p.category
      ? {
          name: p.category.name,
          slug: p.category.slug,
        }
      : null,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
    })),
  }));

  const categories = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return <StorefrontClient products={products} categories={categories} />;
}
