"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/formatters";
import { ShoppingBag, Search, Clock, MapPin, Phone, Instagram, Star, Award, ChevronRight } from "lucide-react";
import CustomizeProductModal from "./CustomizeProductModal";
import CartSidebar from "./CartSidebar";
import { useCart } from "@/hooks/useCart";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  category?: { name: string; slug: string } | null;
  images: ProductImage[];
}

interface CartItem {
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

interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

interface StorefrontClientProps {
  products: Product[];
  categories: Category[];
}

export default function StorefrontClient({
  products,
  categories,
}: StorefrontClientProps) {
  // Carrito de compras global
  const { cart, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filtros de Catálogo
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Modal de Personalización
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  const handleAddToCart = ({
    product,
    selectedExtras,
    quantity,
  }: {
    product: Product;
    selectedExtras: Product[];
    quantity: number;
  }) => {
    // Generar nombre de variante a partir de extras
    const variantName =
      selectedExtras.length > 0
        ? selectedExtras.map((e) => `+ ${e.name}`).join(", ")
        : "";

    // Sumar extras al precio unitario
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    const finalPricePerUnit = product.price + extrasPrice;
    
    // Si tiene precio promocional por par, sumarle los extras de ambas unidades
    const finalComparePrice = product.comparePrice 
      ? product.comparePrice + (extrasPrice * 2) 
      : undefined;

    const mainImage = product.images?.[0];
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: finalPricePerUnit,
      comparePrice: finalComparePrice,
      imageUrl: mainImage?.url,
      variantName: variantName || undefined,
    }, quantity);
  };

  const handleUpdateQuantity = (productId: string, variantName: string | undefined, newQty: number) => {
    updateQuantity(productId, newQty, undefined, variantName);
  };

  const handleRemoveItem = (productId: string, variantName: string | undefined) => {
    removeItem(productId, undefined, variantName);
  };

  const handleClearCart = () => {
    clearCart();
  };

  // Filtrar los productos por búsqueda y categoría
  const filteredProducts = products.filter((product) => {
    // Ocultar inactivos del catálogo de cara al cliente
    if (!product.isActive) return false;

    // No mostrar los extras como un plato directo de la carta
    if (product.category?.slug === "extras") return false;

    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      product.categoryId === selectedCategory ||
      (product.category && product.category.slug === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsCustomizeOpen(true);
  };

  // Obtener solo los productos de la categoría extras
  const extraProducts = products.filter(
    (p) => p.isActive && (p.category?.slug === "extras" || p.sku.startsWith("BB-EXT-"))
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)] pb-24 text-black grunge-texture">
      {/* ═══ HEADER / HERO URBAN STYLE ═══ */}
      <header className="relative bg-black text-white py-12 px-4 sm:px-6 lg:px-8 border-b-8 border-[var(--color-primary)] overflow-hidden">
        {/* Grungy diagonal stripes overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_50%,#fff_50%,#fff_75%,transparent_75%,transparent)] bg-[size:40px_40px]" />
        
        <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-[var(--color-primary)] text-black text-xs font-black uppercase tracking-widest shadow-neo-sm transform -rotate-1">
              🔥 Hamburguesería & Bar
            </span>
            <h1 className="text-4xl sm:text-6xl font-grunge tracking-wider text-[var(--color-primary)] drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase">
              BLACKBEER MZA
            </h1>
            <p className="text-sm font-medium text-gray-300 max-w-md">
              La comanda digital que te ahorra esperas. Armá tu hamburguesa a tu gusto, ingresá tus datos y enviá el pedido directamente a nuestro WhatsApp.
            </p>

            {/* Quick contact info badge */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs font-bold text-gray-400">
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[var(--color-primary)]" /> Lun a Dom: 19:30 a 00:30 hs
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[var(--color-primary)]" /> Las Heras & Ciudad, Mendoza
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="text-[var(--color-primary)]" /> +54 261 685-4124
              </span>
            </div>
          </div>

          {/* Social / Floating design block */}
          <div className="bg-[var(--color-bg)] border-4 border-black p-4 rounded-xl shadow-neo-md text-black w-full max-w-[280px] shrink-0 text-center space-y-3 transform md:rotate-2">
            <h3 className="font-extrabold uppercase text-xs tracking-wider">📢 ¡Seguinos en Instagram!</h3>
            <a
              href="https://instagram.com/blackbeermza"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-black text-white hover:bg-[var(--color-primary)] hover:text-black py-2 rounded-lg border-2 border-black font-extrabold text-xs uppercase tracking-widest transition-all hover-neo"
            >
              <Instagram size={16} /> @blackbeermza
            </a>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              🏆 Las mejores burgers de la zona
            </div>
          </div>
        </div>
      </header>

      {/* Alambre de púas separador */}
      <div className="barbed-wire max-w-6xl mx-auto mt-8 opacity-80" />

      {/* ═══ FILTROS E INTERACTIVIDAD ═══ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-6">
        {/* Buscador & Categorías selector */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Categorías deslizables */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 md:pb-0 scrollbar-none px-4 -mx-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-2 md:px-4 md:py-2 rounded-lg border-2 border-black text-[11px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer hover-neo shrink-0 ${
                selectedCategory === "all"
                  ? "bg-[var(--color-primary)] text-black shadow-neo-sm"
                  : "bg-white text-neutral-800"
              }`}
            >
              🍔 Todo
            </button>
            {categories
              .filter((c) => c.slug !== "extras")
              .map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 md:px-4 md:py-2 rounded-lg border-2 border-black text-[11px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap hover-neo shrink-0 ${
                    selectedCategory === cat.id
                      ? "bg-[var(--color-primary)] text-black shadow-neo-sm"
                      : "bg-white text-neutral-800"
                  }`}
                >
                  {cat.slug === "burgers" ? "🍔 " : cat.slug === "lomos" ? "🥩 " : cat.slug === "papas" ? "🍟 " : cat.slug === "pizzas" ? "🍕 " : cat.slug === "tragos" ? "🍹 " : "✨ "}
                  {cat.name}
                </button>
              ))}
          </div>

          {/* Buscador */}
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar comida de la carta..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-black border-2 border-black rounded-lg shadow-neo-sm hover:border-black/75 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-xs font-bold"
            />
          </div>
        </div>

        {/* ═══ GRID DE PRODUCTOS ═══ */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border-4 border-black p-12 text-center rounded-xl shadow-neo-md space-y-2">
            <h3 className="font-extrabold uppercase text-base">No hay comida que coincida</h3>
            <p className="text-xs text-gray-500">Intentá buscando otro término o seleccionando otra categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const mainImage = product.images?.[0];
              const showBadge = product.isFeatured || product.comparePrice;

              return (
                <div
                  key={product.id}
                  className="bg-white border-4 border-black rounded-xl p-4 md:p-5 shadow-neo-md flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="space-y-2 md:space-y-2.5">
                    {/* Nombre y categoría */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-black line-clamp-1 leading-tight">
                        {product.name}
                      </h3>
                      <span className="text-[9px] md:text-[10px] font-black uppercase bg-neutral-100 border border-black/20 px-1.5 py-0.5 rounded shrink-0">
                        {product.category?.name}
                      </span>
                    </div>

                    {/* Badges de Promoción y Especialidad */}
                    {(product.isFeatured) && (
                      <div className="flex flex-wrap gap-1 md:gap-1.5 pt-0.5">
                        {product.isFeatured && (
                          <span className="bg-black border border-[var(--color-primary)] text-[var(--color-primary)] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-neo-sm transform rotate-1">
                            ⭐ Especialidad
                          </span>
                        )}
                      </div>
                    )}

                    {/* Descripción */}
                    <p className="text-[11px] md:text-xs text-gray-500 leading-normal line-clamp-3">
                      {product.description || "Ingredientes secretos de BlackBeer Mendoza."}
                    </p>
                  </div>

                  {/* Precios y Botón de Añadir */}
                  <div className="flex items-center justify-between border-t-2 border-black/15 pt-3 md:pt-3.5 mt-3 md:mt-4">
                    <div>
                      {product.comparePrice && (
                        <span className="text-[9px] md:text-[10px] text-gray-500 font-bold block line-through">
                          1x {formatPrice(product.price)}
                        </span>
                      )}
                      <span className="text-sm md:text-base font-black font-mono text-black">
                        {product.comparePrice
                          ? `2x ${formatPrice(product.comparePrice)}`
                          : formatPrice(product.price)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleProductSelect(product)}
                      className="px-3 md:px-4 py-1.5 md:py-2 bg-black hover:bg-[var(--color-primary)] text-white hover:text-black border-2 border-black rounded-lg text-[11px] md:text-xs font-black uppercase tracking-wider transition-all cursor-pointer hover-neo shadow-neo-sm active:scale-95"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ BOTÓN FLOTANTE MÓVIL DEL CARRITO ═══ */}
      {cart.itemCount > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-30 px-4 md:hidden animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[var(--color-primary)] border-4 border-black text-black py-3 px-5 rounded-xl shadow-neo-lg flex items-center justify-between font-black uppercase tracking-wider text-xs active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} strokeWidth={2.5} />
              <span>Ver mi Pedido ({cart.itemCount})</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-sm">
              <span>{formatPrice(cart.subtotal)}</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </div>
          </button>
        </div>
      )}

      {/* ═══ SIDEBAR DEL CARRITO FLOTANTE (DESKTOP / MÓVIL) ═══ */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="hidden md:flex fixed bottom-6 right-6 z-30 bg-[var(--color-primary)] border-4 border-black text-black p-4 rounded-full shadow-neo-lg hover-neo items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        title="Ver carrito"
      >
        <div className="relative">
          <ShoppingBag size={24} strokeWidth={2.5} />
          {cart.itemCount > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-black border border-white text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">
              {cart.itemCount}
            </span>
          )}
        </div>
      </button>

      {/* Componente del Carrito Lateral */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Componente del Modal de Personalización */}
      <CustomizeProductModal
        isOpen={isCustomizeOpen}
        onClose={() => {
          setIsCustomizeOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        extraProducts={extraProducts}
        onConfirm={handleAddToCart}
      />
    </div>
  );
}
