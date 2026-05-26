import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno del archivo .env antes de inicializar Prisma
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { test, expect } from '@playwright/test';
import { prisma } from '../../src/lib/prisma';

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe('Flujos de Invitado (Delivery) y Sesiones de Mesa (Salón)', () => {
  
  test('Invitado con Delivery: debe procesar el pedido con dirección de invitado sin crear usuarios ficticios', async ({ page }) => {
    // Redirigir consola del navegador a la de Node para depurar
    page.on('console', msg => console.log('BROWSER LOG (Delivery):', msg.text()));

    // Interceptar llamadas de WhatsApp y api de zonas
    await page.route('/api/delivery-zones', async route => {
      await route.fulfill({
        json: [
          { name: "Zona Test 1", cost: 1000, isAvailable: true }
        ]
      });
    });

    // Monitorear peticiones POST a /api/orders
    let orderId: string | null = null;
    page.on('response', async response => {
      if (response.url().includes('/api/orders') && response.request().method() === 'POST') {
        const status = response.status();
        const text = await response.text();
        console.log(`API Order Response: status=${status}, body=${text}`);
        if (status === 200) {
          const body = JSON.parse(text);
          orderId = body.orderId;
        }
      }
    });

    // 1. Ir al index y agregar un producto
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Buscar y añadir producto
    await page.getByPlaceholder('Buscar comida de la carta...').fill('black');
    await page.waitForTimeout(500);

    const productCard = page.locator('.group').filter({ has: page.locator('span', { hasText: /BURGERS/i }) }).first();
    await productCard.getByRole('button', { name: /Añadir/i }).click();

    // Agregar al carrito en modal
    await expect(page.getByText('Personalizá tu pedido')).toBeVisible();
    await page.getByRole('button', { name: /Agregar al carrito/i }).click();
    await page.waitForTimeout(500);

    // RECARGAR PÁGINA PARA SINCRONIZAR ESTADO LOCAL
    await page.reload({ waitUntil: 'networkidle' });

    // 2. Abrir Carrito y continuar al Checkout
    await page.getByLabel('Ver carrito').click();
    await page.waitForTimeout(500);
    await expect(page.getByText('Mi Carrito')).toBeVisible();
    await page.locator('button:has-text("Continuar al Checkout")').first().click();

    // 3. Completar datos
    await page.getByPlaceholder('Ej. Juan Pérez').fill('Invitado Delivery E2E');
    await page.getByPlaceholder('Ej. 2616854124').fill('2619999999');

    // Seleccionar Delivery
    await page.getByRole('button', { name: /🛵 Delivery/i }).click();

    // Completar campos manuales de dirección (nuevos campos agregados)
    await page.getByPlaceholder('Ej. Av. San Martín').fill('Av. Las Heras');
    await page.getByPlaceholder('Ej. 1234').fill('1542');
    await page.getByPlaceholder('Ej. 3B').fill('2B');

    // Hacer click en el mapa para georreferenciación
    await page.locator('.leaflet-container').click();

    // Mockear window.open
    await page.evaluate(() => {
      window.open = () => null;
    });

    // Enviar pedido
    await page.getByRole('button', { name: /Enviar Pedido WhatsApp/i }).click();

    // Esperar toast de éxito
    await expect(page.getByText('¡Comanda generada! Abriendo WhatsApp...')).toBeVisible({ timeout: 15000 });

    // 4. Validar integridad de base de datos
    expect(orderId).not.toBeNull();
    
    // Consultar el pedido usando Prisma
    const dbOrder = await prisma.order.findUnique({
      where: { id: orderId! },
      include: { address: true }
    });

    expect(dbOrder).not.toBeNull();
    // Validar que no contenga userId (anónimo)
    expect(dbOrder!.userId).toBeNull();
    // Validar que contenga relación de dirección de entrega
    expect(dbOrder!.addressId).not.toBeNull();
    
    const dbAddress = dbOrder!.address;
    expect(dbAddress).not.toBeNull();
    // La dirección del invitado no debe estar vinculada a ningún usuario en la tabla Address
    expect(dbAddress!.userId).toBeNull();
    expect(dbAddress!.street).toBe('Av. Las Heras');
    expect(dbAddress!.number).toBe('1542');
    expect(dbAddress!.apartment).toBe('2B');
  });

  test('Pedidos en Salón (Mesa): múltiples pedidos consecutivos deben agruparse en el mismo tableSession', async ({ page }) => {
    // Redirigir consola del navegador a la de Node para depurar
    page.on('console', msg => console.log('BROWSER LOG (Salón):', msg.text()));

    let firstOrderId: string | null = null;
    let secondOrderId: string | null = null;

    // Monitorear peticiones POST a /api/orders
    page.on('response', async response => {
      if (response.url().includes('/api/orders') && response.request().method() === 'POST') {
        const status = response.status();
        const text = await response.text();
        console.log(`API Order Response (Salón): status=${status}, body=${text}`);
        if (status === 200) {
          const body = JSON.parse(text);
          if (!firstOrderId) {
            firstOrderId = body.orderId;
          } else if (!secondOrderId) {
            secondOrderId = body.orderId;
          }
        }
      }
    });

    // --- PEDIDO 1 ---
    // 1. Vincular mesa 15
    await page.goto('/mesa/15');
    await expect(page.getByText('¡Mesa 15 vinculada!').first()).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Añadir producto 1
    await page.getByPlaceholder('Buscar comida de la carta...').fill('black');
    await page.waitForTimeout(500);
    const productCard = page.locator('.group').filter({ has: page.locator('span', { hasText: /BURGERS/i }) }).first();
    await productCard.getByRole('button', { name: /Añadir/i }).click();
    await page.getByRole('button', { name: /Agregar al carrito/i }).click();
    await page.waitForTimeout(500);

    // RECARGAR PÁGINA PARA SINCRONIZAR ESTADO LOCAL
    await page.reload({ waitUntil: 'networkidle' });

    // Abrir carrito y enviar comanda
    await page.getByLabel('Ver carrito').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Continuar al Checkout")').first().click();
    await page.getByPlaceholder('Ej. Juan Pérez').fill('Grupo Mesa 15');
    await page.getByRole('button', { name: /Enviar a Cocina/i }).click();

    await expect(page.getByText('¡Pedido enviado a cocina con éxito!')).toBeVisible({ timeout: 15000 });

    // --- PEDIDO 2 (Misma Mesa) ---
    // Volvemos a vincular la mesa 15 (el carrito la desvincula por defecto tras enviar el pedido)
    await page.goto('/mesa/15');
    await expect(page.getByText('¡Mesa 15 vinculada!').first()).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Añadir otro producto
    await page.getByPlaceholder('Buscar comida de la carta...').fill('papas');
    await page.waitForTimeout(500);
    const productCard2 = page.locator('.group').first(); // Selecciona el primero filtrado
    await productCard2.getByRole('button', { name: /Añadir/i }).click();
    await page.getByRole('button', { name: /Agregar al carrito/i }).click();
    await page.waitForTimeout(500);

    // RECARGAR PÁGINA PARA SINCRONIZAR ESTADO LOCAL
    await page.reload({ waitUntil: 'networkidle' });

    // Abrir carrito y enviar comanda
    await page.getByLabel('Ver carrito').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Continuar al Checkout")').first().click();
    await page.getByPlaceholder('Ej. Juan Pérez').fill('Grupo Mesa 15 - Segundo pedido');
    await page.getByRole('button', { name: /Enviar a Cocina/i }).click();

    await expect(page.getByText('¡Pedido enviado a cocina con éxito!')).toBeVisible({ timeout: 15000 });

    // 3. Validaciones en Base de Datos de las sesiones
    expect(firstOrderId).not.toBeNull();
    expect(secondOrderId).not.toBeNull();

    const order1 = await prisma.order.findUnique({ where: { id: firstOrderId! } });
    const order2 = await prisma.order.findUnique({ where: { id: secondOrderId! } });

    expect(order1).not.toBeNull();
    expect(order2).not.toBeNull();

    // Validar que ambos sean DINE_IN en la misma mesa y no tengan userId
    expect(order1!.type).toBe('DINE_IN');
    expect(order2!.type).toBe('DINE_IN');
    expect(order1!.tableNumber).toBe('15');
    expect(order2!.tableNumber).toBe('15');
    expect(order1!.userId).toBeNull();
    expect(order2!.userId).toBeNull();

    // VALIDACIÓN CRÍTICA: Deben compartir el mismo tableSession exacto
    expect(order1!.tableSession).not.toBeNull();
    expect(order2!.tableSession).not.toBeNull();
    expect(order1!.tableSession).toBe(order2!.tableSession);
  });
});
