"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { Loader2 } from "lucide-react";

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

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSuccess: (updatedProduct: Product) => void;
}

export default function ProductEditModal({
  isOpen,
  onClose,
  product,
  categories,
  onSuccess,
}: ProductEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Cargar datos del producto cuando se abre o cambia de producto
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setCategoryId(product.categoryId || "");
      setPrice(product.price ? product.price.toString() : "");
      setComparePrice(product.comparePrice ? product.comparePrice.toString() : "");
      setIsActive(product.isActive !== false);
      setErrors({});
    }
  }, [product, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "El nombre es obligatorio";
    
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = "El precio debe ser un número mayor a 0";
    }

    if (comparePrice) {
      const parsedCompare = parseFloat(comparePrice);
      if (isNaN(parsedCompare) || parsedCompare <= 0) {
        newErrors.comparePrice = "El precio promocional 2x debe ser mayor a 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!validate()) {
      toast("Por favor corrige los errores del formulario", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          price: parseFloat(price),
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          isActive,
          categoryId: categoryId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el producto");
      }

      toast("¡Producto actualizado con éxito!", "success");
      onSuccess(data.product);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast(err.message || "Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar: ${product?.name || "Producto"}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre & SKU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Nombre del Producto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="Ej. Burguer BLACK"
              disabled={loading}
              required
            />
          </div>
          <div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[var(--color-text)]">
                SKU (Código único)
              </label>
              <div className="w-full px-3 py-2 text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-[var(--color-text-muted)] font-mono overflow-hidden text-ellipsis">
                {product?.sku || "Autogenerado"}
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text)]">
            Descripción / Ingredientes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
            placeholder="Doble medallón de carne, cheddar, panceta, etc."
            rows={3}
            className="w-full px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-md)] placeholder:text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-y disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Categoría */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text)]">
            Categoría
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 text-sm bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] rounded-[var(--radius-md)] transition-colors hover:border-[var(--color-border-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Precios: Unitario y Promo 2x */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--color-bg-secondary)]/50 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)]/50">
          <Input
            label="Precio Unitario ($)"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            error={errors.price}
            placeholder="0.00"
            disabled={loading}
            required
          />
          <Input
            label="Precio Promo 2x ($ - Opcional)"
            type="number"
            min="0"
            step="0.01"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            error={errors.comparePrice}
            placeholder="Dejar vacío si no aplica"
            disabled={loading}
            helperText="Ej: 2x $22000"
          />
        </div>

        {/* Toggle Activo / Pausado */}
        <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div>
            <span className="block text-sm font-semibold text-[var(--color-text)]">
              Estado de disponibilidad
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">
              Si está desactivado, el producto no se mostrará en el catálogo de los clientes.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
              isActive ? "bg-[var(--color-success)]" : "bg-neutral-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            role="switch"
            aria-checked={isActive}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isActive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
