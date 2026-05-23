export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number | null;
  attributes?: Record<string, string> | null;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  isFeatured: boolean;
  description?: string | null;
  category?: { name: string; slug: string } | null;
  images: ProductImage[];
}

export interface ProductDetail extends ProductListItem {
  sku: string;
  description?: string | null;
  weight?: number | null;
  variants: ProductVariant[];
  reviews: {
    rating: number;
    count: number;
  };
}
