import { prisma } from "@/lib/prisma";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { ProductListItem, ProductDetail } from "@/types/product";
import { initializeDatabase } from "@/lib/dbInitializer";

interface GetProductsParams {
  page?: number;
  limit?: number;
  categorySlug?: string;
  search?: string;
  featured?: boolean;
  sortBy?: "price_asc" | "price_desc" | "newest" | "name";
}

interface PaginatedProducts {
  products: ProductListItem[];
  total: number;
  page: number;
  totalPages: number;
}


// High-quality mock data to fallback to if database is connectionless
const MOCK_PRODUCTS: ProductDetail[] = [
  {
    id: "1",
    sku: "BB-BURG-BLACK",
    name: "BLACK",
    slug: "burger-black",
    description: "Doble medallón de carne, cheddar, panceta, cebolla caramelizada y barbacoa. ¡Viene con papas!",
    price: 12000,
    comparePrice: null,
    isFeatured: true,
    category: { name: "Burgers", slug: "burgers" },
    images: [{ id: "img1", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80", alt: "BLACK", sortOrder: 0 }],
    variants: [],
    reviews: { rating: 4.8, count: 12 }
  },
  {
    id: "2",
    sku: "BB-BURG-CRISPY",
    name: "CRISPY",
    slug: "burger-crispy",
    description: "Doble medallón de carne, cheddar, panceta, bacon cream y cebolla crispy. ¡Viene con papas!",
    price: 12000,
    comparePrice: null,
    isFeatured: true,
    category: { name: "Burgers", slug: "burgers" },
    images: [{ id: "img2", url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80", alt: "CRISPY", sortOrder: 0 }],
    variants: [],
    reviews: { rating: 4.9, count: 15 }
  },
  {
    id: "3",
    sku: "BB-LOMO-BLACK",
    name: "BLACK LOMO",
    slug: "lomo-black",
    description: "Bife de lomo, cheddar, panceta y cebolla caramelizada. ¡Viene con papas!",
    price: 15500,
    comparePrice: 26500,
    isFeatured: true,
    category: { name: "Lomos", slug: "lomos" },
    images: [{ id: "img3", url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80", alt: "LOMO BLACK", sortOrder: 0 }],
    variants: [],
    reviews: { rating: 4.7, count: 8 }
  },
  {
    id: "4",
    sku: "BB-PAPA-BLACK",
    name: "PAPAS BLACK",
    slug: "papa-black",
    description: "Papas fritas con abundante cheddar, panceta picada y cebollita de verdeo.",
    price: 7500,
    comparePrice: null,
    isFeatured: true,
    category: { name: "Papas", slug: "papas" },
    images: [{ id: "img4", url: "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80", alt: "PAPAS BLACK", sortOrder: 0 }],
    variants: [],
    reviews: { rating: 4.6, count: 14 }
  },
  {
    id: "5",
    sku: "BB-PIZZA-MUZA",
    name: "PIZZA MUZARELLA",
    slug: "pizza-muzarella",
    description: "Salsa de tomate, muzzarella fundida y aceitunas.",
    price: 10000,
    comparePrice: null,
    isFeatured: false,
    category: { name: "Pizzas", slug: "pizzas" },
    images: [{ id: "img5", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80", alt: "PIZZA MUZA", sortOrder: 0 }],
    variants: [],
    reviews: { rating: 4.4, count: 9 }
  },
  {
    id: "6",
    sku: "BB-DRINK-FERNET",
    name: "FERNET",
    slug: "trago-fernet",
    description: "Fernet Branca original con Coca-Cola y abundante hielo. ¡2x en promo!",
    price: 7000,
    comparePrice: 12000,
    isFeatured: true,
    category: { name: "Tragos", slug: "tragos" },
    images: [{ id: "img6", url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=80", alt: "FERNET", sortOrder: 0 }],
    variants: [],
    reviews: { rating: 4.9, count: 20 }
  }
];

export async function getProducts(
  params: GetProductsParams = {}
): Promise<PaginatedProducts> {
  const {
    page = 1,
    limit = PRODUCTS_PER_PAGE,
    categorySlug,
    search,
    featured,
    sortBy = "newest",
  } = params;

  try {
    await initializeDatabase();
    const where: Record<string, unknown> = { isActive: true };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    const orderBy: Record<string, string> = {};
    switch (sortBy) {
      case "price_asc":
        orderBy.price = "asc";
        break;
      case "price_desc":
        orderBy.price = "desc";
        break;
      case "name":
        orderBy.name = "asc";
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          isFeatured: true,
          category: { select: { name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        images: p.images.map((img) => ({ ...img, alt: img.alt ?? null })),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.warn("⚠️ Database query failed in getProducts, falling back to mock data:", error);
    
    // Filter mock data locally
    let filtered = [...MOCK_PRODUCTS];
    if (categorySlug) {
      filtered = filtered.filter((p) => p.category?.slug === categorySlug);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (featured !== undefined) {
      filtered = filtered.filter((p) => p.isFeatured === featured);
    }

    if (sortBy === "price_asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      products: paginated.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        isFeatured: p.isFeatured,
        category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
        images: p.images,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  try {
    await initializeDatabase();
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
        reviews: { where: { isApproved: true }, select: { rating: true } },
      },
    });

    if (!product) {
      // Check mocks before returning null
      const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
      return mock || null;
    }

    const ratings = product.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      isFeatured: product.isFeatured,
      weight: product.weight ? Number(product.weight) : null,
      category: product.category,
      images: product.images.map((img) => ({ ...img, alt: img.alt ?? null })),
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
        attributes: v.attributes as Record<string, string> | null,
      })),
      reviews: {
        rating: Math.round(avgRating * 10) / 10,
        count: ratings.length,
      },
    };
  } catch (error) {
    console.warn(`⚠️ Database query failed in getProductBySlug for slug '${slug}', falling back to mock:`, error);
    const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
    return mock || null;
  }
}

export async function getFeaturedProducts(
  limit = 8
): Promise<ProductListItem[]> {
  const result = await getProducts({ featured: true, limit });
  return result.products;
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<ProductListItem[]> {
  try {
    const where: Record<string, unknown> = {
      isActive: true,
      id: { not: productId },
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        isFeatured: true,
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      images: p.images.map((img) => ({ ...img, alt: img.alt ?? null })),
    }));
  } catch (error) {
    console.warn("⚠️ Database query failed in getRelatedProducts, falling back to mocks:", error);
    const related = MOCK_PRODUCTS.filter(
      (p) => p.id !== productId && (!categoryId || p.category?.slug === categorySlugFromId(categoryId))
    );
    return related.slice(0, limit).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      comparePrice: p.comparePrice,
      isFeatured: p.isFeatured,
      category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
      images: p.images,
    }));
  }
}

function categorySlugFromId(id: string): string {
  if (id === "1" || id.startsWith("elec")) return "electronica";
  if (id === "2" || id.startsWith("ropa")) return "ropa";
  if (id === "3" || id.startsWith("hogar")) return "hogar";
  return "accesorios";
}
