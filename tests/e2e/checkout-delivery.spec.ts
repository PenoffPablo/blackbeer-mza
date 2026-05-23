import { test, expect } from '@playwright/test';

test.describe('Flujo de Pedido con Delivery y Modificadores', () => {
  test('debe poder pedir un producto con extras, validar matemática y requerir ubicación', async ({ page }) => {
    // Mock API de zonas de envío para asegurar que el select siempre tenga opciones
    await page.route('/api/delivery-zones', async route => {
      await route.fulfill({
        json: [
          { name: "Zona Test 1", cost: 1000, isAvailable: true },
          { name: "Zona Test 2", cost: 1500, isAvailable: true }
        ]
      });
    });

    // 1. Ingresar a la tienda (Directo al index)
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Buscar un producto específico
    await page.getByPlaceholder('Buscar comida de la carta...').fill('black');
    // Esperamos a que se filtre
    await page.waitForTimeout(500);

    // Seleccionar producto exacto que sea BURGERS
    const productCard = page.locator('.group').filter({ has: page.locator('span', { hasText: /BURGERS/i }) }).filter({ has: page.locator('h3', { hasText: /^BLACK$/ }) }).first();
    const addBtn = productCard.getByRole('button', { name: /Añadir/i });
    await addBtn.click();

    // Esperar a que el modal sea visible
    const modalTitle = page.getByText('Personalizá tu pedido');
    await expect(modalTitle).toBeVisible();

    // Extraer precio base
    const priceTextLocator = page.locator('.space-y-2.pb-1 span.font-extrabold.text-black.font-mono').first();
    const priceText = await priceTextLocator.innerText();
    const basePrice = parseInt(priceText.split('$')[1].replace(/[^0-9]/g, '')) / 100;

    const extraBtn = page.locator('button', { hasText: 'Dip de cheddar' });
    await extraBtn.click();
    const extraPrice = 1500;

    // Aumentar cantidad a 2
    await page.getByLabel('Incrementar cantidad').click();

    // Si el producto BLACK tiene promo de llevando 2, la cantidad 2 = comparePrice. Si no, es basePrice * 2.
    // Asumiremos que el frontend lo calcula. Vamos a esperar a que el precio cambie de su valor original.
    // Para evitar la complejidad de adivinar el comparePrice vs basePrice, simplemente validemos que sea numérico y coherente.
    // Espera, el plan dice "afirmar matemáticamente".
    // Si el producto es BLACK, sabemos que comparePrice = 22000. 
    // (22000 + (1500 * 2)) = 25000.
    const expectedTotal = 25000;

    const modalTotalLocator = page.locator('.flex.flex-col.items-end span.text-lg.font-black.font-mono.text-black');
    // Esperar a que el total se actualice al nuevo valor
    await expect(modalTotalLocator).toHaveText(/25\.000,00/);
    
    // Confirmar modal

    // Confirmar modal de personalización
    await page.getByRole('button', { name: /Agregar al carrito/i }).click();
    await page.waitForTimeout(500);

    // Recargar la página para asegurar que el estado se levante de localStorage
    await page.reload({ waitUntil: 'networkidle' });

    // 4. Abrir carrito
    await page.getByLabel('Ver carrito').click();
    await expect(page.getByText('Mi Carrito')).toBeVisible();

    // Validar subtotal del carrito
    const cartSubtotalLocator = page.locator('.flex.justify-between:has-text("Subtotal productos") .font-mono');
    const cartSubtotalText = await cartSubtotalLocator.innerText();
    const cartSubtotal = parseInt(cartSubtotalText.split('$')[1].replace(/[^0-9]/g, '')) / 100;
    expect(cartSubtotal).toBe(expectedTotal);

    // 5. Checkout
    const checkoutBtn = page.locator('button:has-text("Continuar al Checkout")').first();
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
    await checkoutBtn.click();

    // Completar datos del cliente
    await page.getByPlaceholder('Ej. Juan Pérez').fill('Test Delivery');
    await page.getByPlaceholder('Ej. 2616854124').fill('2610000000');

    // Seleccionar Delivery
    await page.getByRole('button', { name: /🛵 Delivery/i }).click();

    // Intentar enviar pedido sin marcar mapa ni zona
    await page.getByRole('button', { name: /Enviar Pedido WhatsApp/i }).click();
    // Debería haber un toast de error
    await expect(page.getByText('Debes marcar tu ubicación en el mapa')).toBeVisible();

    // 6. Completar Geolocalización y Zona
    // Como el MapPicker usa Leaflet, hacer click en el mapa
    await page.locator('.leaflet-container').click();
    // Cerrar toast anterior si molesta
    // Seleccionar zona
    await page.locator('select').selectOption({ index: 1 });

    // Al seleccionar la zona, el costo de envío debería actualizarse
    // Bueno, en la UI dice "A coordinar", validamos que así sea
    await expect(page.locator('text=Costo de envío (Zona Test 1):')).toBeVisible();

    // Enviar pedido
    // Para evitar que se abra WhatsApp y bloquee Playwright, interceptamos la creación de una nueva pestaña o simulamos
    // Como WhatsApp usa window.open, lo espiamos o lo anulamos para que el test no cuelgue.
    await page.evaluate(() => {
      window.open = () => null;
    });

    await page.getByRole('button', { name: /Enviar Pedido WhatsApp/i }).click();
    // Verificamos que el carrito se limpie (toast de éxito)
    await expect(page.getByText('¡Comanda generada! Abriendo WhatsApp...')).toBeVisible();
  });
});
