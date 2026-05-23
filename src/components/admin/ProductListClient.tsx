"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/formatters";
import { Trash2, Edit, CheckCircle, XCircle, Search, Plus, Filter, AlertCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import ProductEditModal from "./ProductEditModal";
import { toast } from "@/components/ui/Toast";

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
  description: string | null;
  price: number;
  comparePrice: number | null;
  isActive: boolean;
  categoryId: string | null;
  category?: { name: string; slug: string } | null;
  images: ProductImage[];
}

interface ProductListClientProps {
  products: Product[];
  categories: Category[];
}

export default function ProductListClient({
  products: initialProducts,
  categories,
}: ProductListClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filtrado de productos en el cliente
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      product.categoryId === selectedCategory ||
      (product.category && product.category.slug === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsEditOpen(true);
  };

  const handleSuccessUpdate = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
  };

  const handleDeleteClick = async (productId: string, productName: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar el producto "${productName}"? Esta acción no se puede deshacer.`);
    
    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el producto");
      }

      toast("¡Producto eliminado con éxito!", "success");
      setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Error al conectar con el servidor", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, ingredientes o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] hover:border-[var(--color-border-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1 shrink-0">
            <Filter size={14} /> Categoría:
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              selectedCategory === "all"
                ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-sm"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-sm"
                  : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                <th className="px-6 py-4 w-[80px]">Imagen</th>
                <th className="px-6 py-4">Nombre / SKU</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Precio Unitario</th>
                <th className="px-6 py-4">Promo 2x</th>
                <th className="px-6 py-4 w-[110px]">Estado</th>
                <th className="px-6 py-4 text-right w-[100px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-sm text-[var(--color-text-secondary)]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-[var(--color-text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="text-[var(--color-text-muted)] w-8 h-8" />
                      <span>No se encontraron productos con los filtros seleccionados.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const mainImage = product.images?.[0];
                  return (
                    <tr key={product.id} className="hover:bg-[var(--color-surface-hover)]/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-md overflow-hidden relative shadow-[var(--shadow-sm)]">
                          {mainImage ? (
                            <Image
                              src={mainImage.url}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-[10px]">
                              Sin foto
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-[var(--color-text)]">
                          {product.name}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] font-mono mt-0.5">
                          {product.sku}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold">
                        {product.category?.name || categories.find(c => c.id === product.categoryId)?.name || "Sin categoría"}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[var(--color-text)]">
                        {formatPrice(Number(product.price))}
                      </td>
                      <td className="px-6 py-4">
                        {product.comparePrice ? (
                          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-[var(--color-primary)] text-black shadow-sm font-mono">
                            {formatPrice(Number(product.comparePrice))}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)]">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs">
                          {product.isActive ? (
                            <>
                              <CheckCircle size={14} className="text-[var(--color-success)]" />
                              <span className="text-[var(--color-success)] font-bold">Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={14} className="text-neutral-500" />
                              <span className="text-neutral-500 font-bold">Pausado</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="p-2 text-[var(--color-text-secondary)] hover:text-black hover:bg-[var(--color-primary)] border border-transparent hover:border-black rounded-lg transition-all cursor-pointer shadow-sm"
                            title="Editar producto"
                            aria-label="Editar producto"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product.id, product.name)}
                            className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-danger)] border border-transparent hover:border-[var(--color-border)] rounded-lg transition-all cursor-pointer shadow-sm"
                            title="Eliminar producto"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición */}
      <ProductEditModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        categories={categories}
        onSuccess={handleSuccessUpdate}
      />
    </div>
  );
}
