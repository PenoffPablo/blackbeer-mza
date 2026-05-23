import { describe, it, expect, vi } from 'vitest';
import { getDiscountPercentage } from './formatters';

// Mocar storeConfig si es necesario para formatPrice, pero probaremos getDiscountPercentage que es pura matemática
vi.mock('@/config/store.config', () => ({
  storeConfig: {
    locale: 'es-AR',
    currency: 'ARS'
  }
}));

describe('formatters', () => {
  describe('getDiscountPercentage', () => {
    it('debería calcular correctamente el porcentaje', () => {
      expect(getDiscountPercentage(1000, 800)).toBe(20);
      expect(getDiscountPercentage(500, 250)).toBe(50);
    });

    it('debería retornar 0 si el precio original es 0 o negativo', () => {
      expect(getDiscountPercentage(0, 100)).toBe(0);
      expect(getDiscountPercentage(-500, 100)).toBe(0);
    });

    it('debería manejar redondeos correctamente', () => {
      // (100 - 66) / 100 = 0.34 -> 34%
      expect(getDiscountPercentage(100, 66.5)).toBe(34);
    });
  });
});
