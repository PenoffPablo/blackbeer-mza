import { test, expect } from '@playwright/test';

test.describe('Flujo de Pedido con Take Away (Retiro en Local)', () => {
  test('debe ocultar GPS/Zona de envío y no cobrar delivery al seleccionar Take Away', async ({ page }) => {
    // 1. Ingresar a la tienda
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Añadir un lomo cualquiera
    // Vamos a buscar la categoría Lomos o un producto Lomo
    await page.getByPlaceholder('Buscar comida de la carta...').fill('lomo');
    await page.waitForTimeout(500);

    const productCard = page.locator('.group').filter({ hasText: /lomo/i }).first();
    const addBtn = productCard.getByRole('button', { name: /Añadir/i });
    await addBtn.click();

    // Confirmar modal sin extras
    await page.getByRole('button', { name: /Agregar al carrito/i }).click();
    await page.waitForTimeout(500);

    await page.reload({ waitUntil: 'networkidle' });

    // 3. Abrir carrito
    await page.getByLabel('Ver carrito').click();
    await expect(page.getByText('Mi Carrito')).toBeVisible();

    // Extraer subtotal
    const cartSubtotalLocator = page.locator('.flex.justify-between:has-text("Subtotal productos") .font-mono');
    const cartSubtotalText = await cartSubtotalLocator.innerText();
    const subtotal = parseInt(cartSubtotalText.split('$')[1].replace(/[^0-9]/g, '')) / 100;

    // Ir a checkout
    const checkoutBtn = page.locator('button:has-text("Continuar al Checkout")').first();
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
    await checkoutBtn.click();

    // 4. Completar datos y Seleccionar Take Away
    await page.getByPlaceholder('Ej. Juan Pérez').fill('Test Takeaway');
    await page.getByPlaceholder('Ej. 2616854124').fill('2611111111');

    // Seleccionar Take Away
    await page.getByRole('button', { name: /🛍️ Take Away/i }).click();

    // 5. Validar condicionales
    // No debe mostrar el mapa (leaflet)
    await expect(page.locator('.leaflet-container')).not.toBeVisible();
    // No debe mostrar el select de Zonas de Reparto
    await expect(page.locator('select').filter({ hasText: '-- Seleccioná tu Barrio/Zona --' })).not.toBeVisible();

    // Debe mostrar el select de retiro en local
    const localSelect = page.locator('select').filter({ hasText: '-- Selecciona un local --' });
    await expect(localSelect).toBeVisible();
    
    // Seleccionar sucursal
    await localSelect.selectOption({ index: 1 });

    // 6. Validar costos (TOTAL = SUBTOTAL)
    const totalLocator = page.locator('.flex.justify-between.text-base.font-black.text-black .font-mono');
    const totalText = await totalLocator.innerText();
    const total = parseInt(totalText.split('$')[1].replace(/[^0-9]/g, '')) / 100;

    expect(total).toBe(subtotal);

    // Enviar pedido mockeando window.open
    await page.evaluate(() => {
      window.open = () => null;
    });

    await page.getByRole('button', { name: /Enviar Pedido WhatsApp/i }).click();
    await expect(page.getByText('¡Comanda generada! Abriendo WhatsApp...')).toBeVisible();
  });
});
