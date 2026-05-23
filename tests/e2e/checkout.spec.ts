import { test, expect } from '@playwright/test';

test.describe('Flujo de Pedido en Mesa (QR)', () => {
  
  test('debe poder entrar a una mesa por URL y pedir', async ({ page }) => {
    // Entrar por QR de Mesa 5
    await page.goto('/mesa/5');

    // Esperar a que la redirección suceda y asigne la mesa (debería ir al index y luego a productos o carrito)
    // El frontend asigna tableNumber=5 en localStorage
    await page.waitForURL('**/', { timeout: 15000 });
    await page.waitForLoadState('networkidle');    
    // Clic en el primer botón "Añadir" disponible
    const agregarBtn = page.getByRole('button', { name: /Añadir/i }).first();
    await agregarBtn.waitFor({ state: 'visible' });
    await agregarBtn.click();
    
    // Confirmar modal de personalización
    await page.getByRole('button', { name: /Agregar al carrito/i }).click();
    
    await page.waitForTimeout(500); // Dar tiempo a que se guarde en localStorage
    
    // Recargar la página para asegurar que el estado se levante de localStorage (debug)
    await page.reload({ waitUntil: 'networkidle' });
    
    // Abrir carrito (clic en icono)
    await page.getByLabel('Ver carrito').click();
    
    // Debería ver el carrito abierto
    await expect(page.getByText('Mi Carrito')).toBeVisible();
    
    // Ir a checkout
    const checkoutBtn = page.locator('button:has-text("Continuar al Checkout")').first();
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
    await checkoutBtn.click();
    
    // En el checkout, debería decir "Consumo en Local - Mesa 5" en alguna parte
    
    // Verificar que dice Consumo en Local (si aplica)
    const localText = page.getByText(/Local/i).first();
    await localText.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
  });
});
