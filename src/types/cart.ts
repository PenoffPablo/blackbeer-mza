export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  sku?: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  image?: string;
  imageUrl?: string;
  variantName?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
