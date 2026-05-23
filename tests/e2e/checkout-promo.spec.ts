import { test, expect } from '@playwright/test';

test.describe('Flujo de Pedido con Promoción 2x', () => {
  test('debe calcular correctamente el subtotal cuando hay promoción de cantidad impar', async ({ page }) => {
    // 1. Ingresar a la tienda
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 2. Buscar un producto con promoción (ej: BLACK)
    await page.getByPlaceholder('Buscar comida de la carta...').fill('black');
    await page.waitForTimeout(500);

    // Seleccionar producto exacto que sea BURGERS
    const productCard = page.locator('.group').filter({ has: page.locator('span', { hasText: /BURGERS/i }) }).filter({ has: page.locator('h3', { hasText: /^BLACK$/ }) }).first();
    const addBtn = productCard.getByRole('button', { name: /Añadir/i });
    await addBtn.click();

    // Esperar a que el modal sea visible
    const modalTitle = page.getByText('Personalizá tu pedido');
    await expect(modalTitle).toBeVisible();

    // Extraer precios base y promo desde el modal
    const priceTextLocator = page.locator('.space-y-2.pb-1 span.font-extrabold.text-black.font-mono').first();
    const priceText = await priceTextLocator.innerText();
    const basePrice = parseInt(priceText.split('$')[1].replace(/[^0-9]/g, '')) / 100;

    const promoTextLocator = page.locator('span:has-text("Llevando 2:")').first();
    const promoText = await promoTextLocator.innerText();
    const promoPrice = parseInt(promoText.split('$')[1].replace(/[^0-9]/g, '')) / 100;

    // 3. Aumentar cantidad a 3
    await page.getByLabel('Incrementar cantidad').click();
    await page.getByLabel('Incrementar cantidad').click();

    // Validar matemática en el modal
    // 3 unidades = 1 par (promoPrice) + 1 unidad suelta (basePrice)
    const expectedTotal = promoPrice + basePrice;

    const modalTotalLocator = page.locator('.flex.flex-col.items-end span.text-lg.font-black.font-mono.text-black');
    // Esperar a que el total cambie y alcance el valor esperado
    // Formateamos expectedTotal (ej. 34000 -> 34.000,00)
    const expectedStr = expectedTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 });
    await expect(modalTotalLocator).toHaveText(new RegExp(expectedStr.replace(/\./g, '\\.').replace(/,/g, ',')));
    

    // Confirmar modal de personalización
    await page.getByRole('button', { name: /Agregar al carrito/i }).click();
    await page.waitForTimeout(500);

    await page.reload({ waitUntil: 'networkidle' });

    // 4. Abrir carrito y validar subtotal
    await page.getByLabel('Ver carrito').click();
    await expect(page.getByText('Mi Carrito')).toBeVisible();

    const cartSubtotalLocator = page.locator('.flex.justify-between:has-text("Subtotal productos") .font-mono');
    const cartSubtotalText = await cartSubtotalLocator.innerText();
    const cartSubtotal = parseInt(cartSubtotalText.split('$')[1].replace(/[^0-9]/g, '')) / 100;
    
    // Aserción en carrito
    expect(cartSubtotal).toBe(expectedTotal);

    // El TOTAL a pagar también debe coincidir antes de seleccionar envío
    const totalLocator = page.locator('.flex.justify-between.text-base.font-black.text-black .font-mono');
    const totalText = await totalLocator.innerText();
    const total = parseInt(totalText.split('$')[1].replace(/[^0-9]/g, '')) / 100;
    
    expect(total).toBe(expectedTotal);
  });
});
