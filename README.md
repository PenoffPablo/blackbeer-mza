# 🍔 BLACKBEER MZA — E-Commerce & WhatsApp Ordering System

Sistema profesional y optimizado para la gestión de pedidos autónomos y envíos a WhatsApp, diseñado especialmente para locales gastronómicos y bares. Desarrollado con tecnologías de vanguardia bajo una arquitectura de alto rendimiento, escalable y mantenible.

> **Desarrollado por**: [@PabloPenoff](https://github.com/PabloPenoff)

---

## 🚀 Características Clave

*   **⚡ Checkout Híbrido**: 
    *   **Delivery**: Con geolocalización exacta interactiva mediante mapas interactivos (Leaflet/GPS). Opción de pago en efectivo restringida para mitigar fraudes (solo transferencia).
    *   **Take Away**: Selección dinámica de sucursales integradas en la configuración y limpieza automática de datos de entrega sobrantes.
    *   **Consumo Local (Mesas QR)**: Soporte completo para pedidos a mesa, incluyendo propina sugerida (10%) o personalizada para el mozo.
*   **📱 WhatsApp Engine**: Formateo limpio y estructurado de la comanda con emojis para el cajero, omitiendo subtotales innecesarios para ir al grano (Total a pagar y detalles clave).
*   **🎨 Interfaz Neo-Brutalista Premium**: Diseño visual impactante, responsivo y veloz desarrollado con Tailwind CSS 4 y variables dinámicas de theming CSS.
*   **🔒 Seguridad y Roles**: Control de acceso a través de JWT (HTTPOnly cookies) y Middleware en Next.js para rutas administrativas (`/admin/*`) y de cliente.
*   **🗄️ ORM Multi-motor**: Soporte nativo para base de datos local SQLite (desarrollo rápido) y PostgreSQL (producción) a través de Prisma.

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
