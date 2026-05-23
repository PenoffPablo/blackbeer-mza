import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const purchaseAmountStr = searchParams.get("purchaseAmount");

    if (!code) {
      return NextResponse.json({ error: "Código de cupón requerido" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "El cupón no es válido o está inactivo" }, { status: 404 });
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      return NextResponse.json({ error: "El cupón aún no está activo" }, { status: 400 });
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return NextResponse.json({ error: "El cupón ha expirado" }, { status: 400 });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "El cupón ha alcanzado el límite máximo de usos" }, { status: 400 });
    }

    if (purchaseAmountStr) {
      const purchaseAmount = parseFloat(purchaseAmountStr);
      if (coupon.minPurchase && Number(coupon.minPurchase) > purchaseAmount) {
        return NextResponse.json(
          { error: `Compra mínima requerida para este cupón es de $${coupon.minPurchase}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
