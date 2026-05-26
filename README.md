# 🍔 BLACKBEER MZA — E-Commerce & WhatsApp Ordering System

Sistema profesional y optimizado para la gestión de pedidos autónomos y envíos a WhatsApp, diseñado especialmente para locales gastronómicos y bares. Desarrollado con tecnologías de vanguardia bajo una arquitectura de alto rendimiento, escalable y mantenible.

> **Desarrollado por**: [@PabloPenoff](https://github.com/PabloPenoff)

---

## 🚀 Características Clave

*   **⚡ Checkout Híbrido y Atómico**:
    *   **Delivery**: Con soporte para usuarios registrados e invitados (anónimos). Requiere geolocalización interactiva en mapa (Leaflet) e ingreso de dirección física estructurada.
    *   **Take Away**: Selección dinámica de la sucursal física de retiro y limpieza automática de datos de entrega sobrantes.
    *   **Consumo Local (Mesas QR)**: Vinculación a mesas y agrupamiento dinámico de comandas consecutivas en una misma sesión activa (`tableSession`) para cobros unificados. Incluye propina sugerida (10%) o personalizada.
    *   **Consistencia Transaccional (ACID)**: Todo el flujo de checkout (Address, Order, OrderItems y Payment) se ejecuta dentro de una transacción interactiva de Prisma. Implementa bloqueos consultivos de PostgreSQL (`pg_advisory_xact_lock`) por mesa para erradicar condiciones de carrera en pedidos simultáneos.
*   **📱 WhatsApp Engine**: Genera la comanda estructurada limpia (sin subtotales redundantes) optimizada con emojis y redirecciona al chat oficial del local para la confirmación final por el cliente.
*   **🎨 Panel de Administración Adaptivo**:
    *   Navegación responsive optimizada para pantallas móviles mediante menú lateral colapsable (`AdminMobileNav`).
    *   Gestión en tiempo real de comandas activas en cocina, con soporte completo para datos de contacto de invitados (`guestName`, `guestEmail`, `guestPhone`).
    *   Selección persistente de sucursal de impresión almacenada localmente para formatear los estilos de impresión de comandas en ticketeras térmicas (80mm).
    *   Gestión dinámica de catálogo (precios, stock, promociones 2x y desactivación temporal de productos) y gestión de personal de trabajo.
*   **🔒 Seguridad y Roles**: Control de accesos mediante JWT (cookies `HTTPOnly`) para proteger rutas administrativas y API (`/admin/*`) contra accesos no autorizados.
*   **🗄️ ORM Flexible**: Soporte nativo para SQLite (desarrollo rápido sin configuración) y PostgreSQL (producción) vía Prisma.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Framework Fullstack** | [Next.js 16.2.6 (App Router)](https://nextjs.org/) |
| **Biblioteca de UI** | [React 19.2.4](https://react.dev/) |
| **Estilos** | [Tailwind CSS 4.0.0](https://tailwindcss.com/) |
| **ORM** | [Prisma 7.8.0](https://www.prisma.io/) |
| **Base de Datos (Local)** | [SQLite](https://www.sqlite.org/) |
| **Autenticación** | JWT con [Jose 6.2.2](https://github.com/panva/jose) |
| **Pruebas End-to-End** | [Playwright 1.60.0](https://playwright.dev/) |
| **Pruebas Unitarias** | [Vitest 4.1.7](https://vitest.dev/) |

---

## 📁 Arquitectura del Repositorio

```
blackbeer-mza/
├── src/
│   ├── app/                   # Ruteo basado en App Router y API Handlers
│   │   ├── (storefront)/      # Tienda e interfaces públicas
│   │   ├── (auth)/            # Vistas de autenticación (Login, Registro)
│   │   ├── admin/             # Panel de gestión administrativo
│   │   └── api/               # Controladores de la API RESTful
│   ├── components/
│   │   ├── ui/                # Componentes atómicos (Botones, Inputs, Modales)
│   │   └── features/          # Componentes de negocio (MapPicker, CartSidebar)
│   ├── config/                # Archivo único de configuración de tienda
│   ├── services/              # Lógica del servidor y consultas a Base de Datos
│   ├── lib/                   # Funciones útiles, formateadores y JWT helpers
│   └── types/                 # Definiciones estáticas de TypeScript
├── prisma/                    # Esquema de base de datos y seeds
├── tests/                     # Suite de pruebas automatizadas
└── public/                    # Assets estáticos, logos e íconos
```

---

## 💻 Inicio Rápido en Desarrollo

### 1. Clonar el repositorio
```bash
git clone https://github.com/PabloPenoff/blackbeer-mza.git
cd blackbeer-mza
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto usando el template:
```bash
cp .env.example .env
```
> [!IMPORTANT]
> Nunca expongas datos sensibles en el archivo `.env.example`. El `.env` local está protegido a través de `.gitignore`.

Asegúrate de definir adecuadamente las siguientes variables mínimas:
*   `DATABASE_URL`: Ejemplo local SQLite: `file:./dev.db` o string de conexión PostgreSQL en producción.
*   `JWT_SECRET`: Una clave secreta robusta de al menos 32 caracteres.
*   `NEXT_PUBLIC_STORE_URL`: URL del host (ej. `http://localhost:3000`).

### 4. Ejecutar migraciones de Prisma
Prepara la base de datos local SQLite:
```bash
npx prisma migrate dev --name init
```

### 5. Semillar la base de datos (Seed)
Registra productos y usuarios de prueba por defecto (Admin/Cliente):
```bash
npx prisma db seed
```

### 6. Ejecutar el servidor local
```bash
npm run dev
```
El sitio estará disponible en `http://localhost:3000`.

---

## 🎛️ Scripts Disponibles

*   `npm run dev` — Lanza el servidor en modo desarrollo con recarga en caliente.
*   `npm run build` — Compila el proyecto generando el bundle optimizado para producción.
*   `npm run start` — Corre la aplicación ya compilada.
*   `npm run test:unit` — Corre la suite de pruebas unitarias con Vitest.
*   `npm run test:e2e` — Ejecuta las pruebas E2E de Playwright.
*   `npx prisma studio` — Abre un panel de administración visual para la Base de Datos.

---

## 🌐 Despliegue en Producción (Vercel)

El proyecto está diseñado para funcionar de manera serverless:
1. Asegúrate de configurar un proveedor externo para la base de datos PostgreSQL (ej. Supabase, Neon o Vercel Postgres) ya que SQLite no conserva estado en entornos serverless.
2. Vincula el repositorio en Vercel.
3. Carga las variables de entorno de producción en la consola de Vercel (`DATABASE_URL`, `JWT_SECRET`, etc.).
4. Ejecuta `npx prisma migrate deploy` durante la fase de compilación.
