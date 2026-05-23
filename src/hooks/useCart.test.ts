import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useCart } from "./useCart";

describe("useCart hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockItemNormal = {
    productId: "prod-1",
    name: "Burger Simple",
    sku: "BB-BURG-SMPL",
    price: 10000,
  };

  const mockItemPromo = {
    productId: "prod-2",
    name: "Burger BLACK",
    sku: "BB-BURG-BLACK",
    price: 12000,
    comparePrice: 22000, // 2x $22.000 (ahorra $2.000)
  };

  it("debe inicializarse con un carrito vacío", () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.cart.items).toEqual([]);
    expect(result.current.cart.subtotal).toBe(0);
    expect(result.current.cart.itemCount).toBe(0);
  });

  it("debe agregar un producto normal al carrito", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockItemNormal, 1);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0]).toEqual({
      ...mockItemNormal,
      quantity: 1,
    });
    expect(result.current.cart.subtotal).toBe(10000);
    expect(result.current.cart.itemCount).toBe(1);
  });

  it("debe acumular cantidad cuando se agrega el mismo producto", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockItemNormal, 1);
    });
    act(() => {
      result.current.addItem(mockItemNormal, 2);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].quantity).toBe(3);
    expect(result.current.cart.subtotal).toBe(30000);
    expect(result.current.cart.itemCount).toBe(3);
  });



  it("debe distinguir ítems del mismo producto pero con diferentes variantes/extras", () => {
    const { result } = renderHook(() => useCart());

    const itemConExtra1 = {
      ...mockItemNormal,
      variantName: "+ Queso Cheddar",
      price: 11500,
    };

    const itemConExtra2 = {
      ...mockItemNormal,
      variantName: "+ Panceta",
      price: 12000,
    };

    act(() => {
      result.current.addItem(itemConExtra1, 1);
    });
    act(() => {
      result.current.addItem(itemConExtra2, 1);
    });

    expect(result.current.cart.items).toHaveLength(2);
    expect(result.current.cart.items[0].variantName).toBe("+ Queso Cheddar");
    expect(result.current.cart.items[1].variantName).toBe("+ Panceta");
    expect(result.current.cart.subtotal).toBe(11500 + 12000);
    expect(result.current.cart.itemCount).toBe(2);
  });

  it("debe actualizar la cantidad de un ítem correctamente", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockItemNormal, 1);
    });
    act(() => {
      result.current.updateQuantity(mockItemNormal.productId, 3, undefined, undefined);
    });

    expect(result.current.cart.items[0].quantity).toBe(3);
    expect(result.current.cart.subtotal).toBe(30000);
  });

  it("debe eliminar el ítem si la cantidad se actualiza a 0 o menor", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockItemNormal, 2);
    });
    act(() => {
      result.current.updateQuantity(mockItemNormal.productId, 0, undefined, undefined);
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.subtotal).toBe(0);
  });



  it("debe remover un ítem específico del carrito", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockItemNormal, 1);
      result.current.addItem(mockItemPromo, 1);
    });

    expect(result.current.cart.items).toHaveLength(2);

    act(() => {
      result.current.removeItem(mockItemNormal.productId, undefined, undefined);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].productId).toBe(mockItemPromo.productId);
    expect(result.current.cart.subtotal).toBe(mockItemPromo.price);
  });

  it("debe limpiar todo el carrito", () => {
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem(mockItemNormal, 2);
      result.current.addItem(mockItemPromo, 1);
    });

    expect(result.current.cart.items).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.subtotal).toBe(0);
    expect(result.current.cart.itemCount).toBe(0);
  });

  describe("Cálculos de Promoción 2x1", () => {
    it("debe cobrar precio normal si hay solo 1 unidad", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockItemPromo, 1);
      });

      // 1 unidad = precio normal ($12.000)
      expect(result.current.cart.subtotal).toBe(12000);
    });

    it("debe aplicar el precio promocional de comparePrice si hay exactamente 2 unidades", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockItemPromo, 2);
      });

      // 2 unidades = comparePrice ($22.000)
      expect(result.current.cart.subtotal).toBe(22000);
    });

    it("debe cobrar precio promocional por el par y precio normal por la unidad suelta si hay 3 unidades", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockItemPromo, 3);
      });

      // 3 unidades = 1 par promocional ($22.000) + 1 unidad normal ($12.000) = $34.000
      expect(result.current.cart.subtotal).toBe(34000);
    });

    it("debe cobrar dos veces el precio promocional si hay 4 unidades", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockItemPromo, 4);
      });

      // 4 unidades = 2 pares promocionales ($22.000 * 2) = $44.000
      expect(result.current.cart.subtotal).toBe(44000);
    });

    it("debe calcular correctamente el carrito combinado con productos promocionales y normales", () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(mockItemNormal, 2); // 2 * $10.000 = $20.000
        result.current.addItem(mockItemPromo, 3);  // 1 par ($22.000) + 1 unidad ($12.000) = $34.000
      });

      // Total esperado: $20.000 + $34.000 = $54.000
      expect(result.current.cart.subtotal).toBe(54000);
    });
  });
});
