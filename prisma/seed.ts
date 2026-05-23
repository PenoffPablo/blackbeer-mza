import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { initializeDatabase } from "../src/lib/dbInitializer";

async function main() {
  console.log("🌱 Seeding database...\n");

  console.log("🧹 Cleaning old tables (productImage, product, category, coupon, storeConfig)...");
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.storeConfig.deleteMany();

  // ═══ ADMIN USER ═══
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mitienda.com" },
    update: {},
    create: {
      email: "admin@mitienda.com",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "Tienda",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ═══ CUSTOMER USER ═══
  const customerPassword = await bcrypt.hash("customer123", 12);
  const customer = await prisma.user.upsert({
    where: { email: "cliente@test.com" },
    update: {},
    create: {
      email: "cliente@test.com",
      passwordHash: customerPassword,
      firstName: "Juan",
      lastName: "Pérez",
      phone: "+54 11 1234-5678",
      role: "CUSTOMER",
    },
  });
  console.log(`✅ Customer: ${customer.email}`);

  // ═══ BLACKBEER CATALOG ═══
  await initializeDatabase();

  // ═══ COUPONS ═══
  await prisma.coupon.upsert({
    where: { code: "BIENVENIDO10" },
    update: {},
    create: {
      code: "BIENVENIDO10",
      description: "10% de descuento en tu primera compra",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxUses: 100,
    },
  });
  console.log("✅ 1 cupón (removido ENVIOGRATIS)");

  // ═══ STORE CONFIG ═══
  await prisma.storeConfig.upsert({
    where: { id: 1 },
    update: {
      storeName: "BlackBeer Mza",
      contactEmail: "contacto@blackbeermza.com",
      contactPhone: "+54 261 123-4567",
      socialLinks: {
        instagram: "https://instagram.com/blackbeer.mza",
        facebook: "https://facebook.com/blackbeer.mza",
      },
    },
    create: {
      id: 1,
      storeName: "BlackBeer Mza",
      currency: "ARS",
      locale: "es-AR",
      contactEmail: "contacto@blackbeermza.com",
      contactPhone: "+54 261 123-4567",
      socialLinks: {
        instagram: "https://instagram.com/blackbeer.mza",
        facebook: "https://facebook.com/blackbeer.mza",
      },
    },
  });
  console.log("✅ Configuración de tienda");

  console.log("\n🎉 Seed completado!\n");
  console.log("Credenciales de acceso:");
  console.log("  Admin:   admin@mitienda.com / admin123");
  console.log("  Cliente: cliente@test.com / customer123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
