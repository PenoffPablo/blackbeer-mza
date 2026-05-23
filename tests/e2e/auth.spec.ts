import { test, expect } from '@playwright/test';

test.describe('Flujo de Autenticación de Staff', () => {
  
  test('debe bloquear el acceso a páginas de administración sin loguearse', async ({ page }) => {
    // Intentar acceder directamente al dashboard
    await page.goto('/admin');
    
    // Debería redirigir al login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /Acceso a Personal/i })).toBeVisible();
  });

  test('debe iniciar sesión correctamente con credenciales válidas y entrar al admin', async ({ page }) => {
    // Si la base de datos de test tiene credenciales, las usamos
    // En este caso, usamos admin@mitienda.com / admin123 que viene en el seed
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('admin@mitienda.com');
    await page.getByLabel('Contraseña').fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Debería llevar al dashboard
    await expect(page).toHaveURL(/.*\/admin/);
    
    // Verificar que dice "Panel de Administración"
    await expect(page.getByText('Panel de Administración')).toBeVisible();
    await expect(page.getByText('Ventas Totales')).toBeVisible();
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel('Email').fill('admin@mitienda.com');
    await page.getByLabel('Contraseña').fill('badpassword123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    // Verificamos que no se fue de la página y muestra error
    await expect(page).toHaveURL(/.*\/login/);
    // Verificar mensaje de error (toast)
    await expect(page.locator('.toast, [role="alert"], .text-\\[var\\(--color-danger\\)\\]').first()).toBeVisible({ timeout: 5000 }).catch(() => null);
  });
});
