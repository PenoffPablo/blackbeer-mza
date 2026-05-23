import { test, expect } from '@playwright/test';

test.describe('Flujo de Administración y Sincronización de Catálogo', () => {
  
  test('debe poder iniciar sesión, editar el precio de un producto, ver el cambio en el storefront y luego restaurar', async ({ page }) => {
    // 1. Iniciar sesión como administrador
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@mitienda.com');
    await page.getByLabel('Contraseña').fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Confirmar que redirige al panel admin
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Navegar a gestión de productos
    await page.goto('/admin/products');
    await expect(page.getByRole('heading', { name: 'Gestión de Carta' })).toBeVisible();

    // 2. Buscar e identificar el producto "CLUB" para no interferir con "BLACK"
    const searchInput = page.getByPlaceholder('Buscar por nombre, ingredientes o SKU...');
    await searchInput.fill('CLUB');
    await page.waitForTimeout(500);

    const clubRow = page.locator('tr').filter({ hasText: 'CLUB' }).first();
    await expect(clubRow).toBeVisible();

    // Leer el precio actual en la fila para poder restaurarlo después
    const currentPriceText = await clubRow.locator('td').nth(3).innerText(); // Precio Unitario es la 4ta columna (index 3)
    const originalPriceNum = parseInt(currentPriceText.split('$')[1].replace(/[^0-9]/g, '')) / 100;
    
    // Modificar precio
    await clubRow.getByLabel('Editar producto').click();
    
    // Esperar a que el modal se abra
    await expect(page.getByText('Editar: CLUB')).toBeVisible();
    
    const priceInput = page.getByLabel('Precio Unitario ($)');
    await priceInput.fill('16500'); // Precio de test: $16.500
    
    await page.getByRole('button', { name: 'Guardar' }).click();
    
    // Validar Toast de éxito
    await expect(page.getByText('¡Producto actualizado con éxito!')).toBeVisible();
    
    // 3. Ir al Storefront (carta) a verificar el cambio
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Buscar "CLUB" en el storefront
    const storefrontSearch = page.getByPlaceholder('Buscar comida de la carta...');
    await storefrontSearch.fill('CLUB');
    await page.waitForTimeout(500);
    
    // Verificar que el precio de venta en la carta ahora contiene $16.500
    const productCard = page.locator('.group').filter({ has: page.locator('h3', { hasText: /^CLUB$/ }) }).first();
    await expect(productCard).toBeVisible();
    await expect(productCard).toContainText('16.500,00');

    // 4. Volver al Admin y restaurar el precio original
    await page.goto('/admin/products');
    await expect(page.getByRole('heading', { name: 'Gestión de Carta' })).toBeVisible();
    
    await searchInput.fill('CLUB');
    await page.waitForTimeout(500);
    
    const clubRowRestore = page.locator('tr').filter({ hasText: 'CLUB' }).first();
    await clubRowRestore.getByLabel('Editar producto').click();
    
    await expect(page.getByText('Editar: CLUB')).toBeVisible();
    await page.getByLabel('Precio Unitario ($)').fill(originalPriceNum.toString());
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('¡Producto actualizado con éxito!')).toBeVisible();
  });

  test('debe poder pausar un producto y verificar que desaparece de la carta, luego reactivarlo', async ({ page }) => {
    // 1. Iniciar sesión como administrador
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@mitienda.com');
    await page.getByLabel('Contraseña').fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Navegar a gestión de productos
    await page.goto('/admin/products');
    
    // Buscar "CRISPY"
    const searchInput = page.getByPlaceholder('Buscar por nombre, ingredientes o SKU...');
    await searchInput.fill('CRISPY');
    await page.waitForTimeout(500);

    const row = page.locator('tr').filter({ hasText: 'CRISPY' }).first();
    await expect(row).toBeVisible();
    
    // Editar
    await row.getByLabel('Editar producto').click();
    await expect(page.getByText('Editar: CRISPY')).toBeVisible();
    
    // Desactivar el switch de estado
    const statusSwitch = page.getByRole('switch');
    await expect(statusSwitch).toHaveAttribute('aria-checked', 'true');
    await statusSwitch.click();
    await expect(statusSwitch).toHaveAttribute('aria-checked', 'false');
    
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('¡Producto actualizado con éxito!')).toBeVisible();
    
    // 2. Ir a la carta (storefront) y validar que CRISPY NO aparece
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const storefrontSearch = page.getByPlaceholder('Buscar comida de la carta...');
    await storefrontSearch.fill('CRISPY');
    await page.waitForTimeout(500);
    
    // No debería haber ninguna carta de producto visible que tenga "CRISPY"
    const productCard = page.locator('.group').filter({ has: page.locator('h3', { hasText: /^CRISPY$/ }) }).first();
    await expect(productCard).not.toBeVisible();
    
    // 3. Volver al Admin y reactivarlo
    await page.goto('/admin/products');
    await searchInput.fill('CRISPY');
    await page.waitForTimeout(500);
    
    const rowRestore = page.locator('tr').filter({ hasText: 'CRISPY' }).first();
    await rowRestore.getByLabel('Editar producto').click();
    
    await expect(page.getByText('Editar: CRISPY')).toBeVisible();
    
    const statusSwitchRestore = page.getByRole('switch');
    await expect(statusSwitchRestore).toHaveAttribute('aria-checked', 'false');
    await statusSwitchRestore.click();
    await expect(statusSwitchRestore).toHaveAttribute('aria-checked', 'true');
    
    await page.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByText('¡Producto actualizado con éxito!')).toBeVisible();
    
    // 4. Verificar que vuelve a aparecer en el storefront
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await storefrontSearch.fill('CRISPY');
    await page.waitForTimeout(500);
    
    const productCardVisible = page.locator('.group').filter({ has: page.locator('h3', { hasText: /^CRISPY$/ }) }).first();
    await expect(productCardVisible).toBeVisible();
  });
});
