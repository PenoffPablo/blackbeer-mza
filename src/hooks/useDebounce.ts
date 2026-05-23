"use client";

import { useState, useEffect } from "react";

/**
 * Debounce hook — retrasa la actualización del valor hasta que
 * el usuario deje de escribir por `delay` ms.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
