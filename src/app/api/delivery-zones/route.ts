import { NextResponse } from "next/server";
import { getZonesFromSheet } from "@/services/menuService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const zones = await getZonesFromSheet();
    return NextResponse.json(zones);
  } catch (error: any) {
    console.error("API Delivery Zones Error:", error);
    return NextResponse.json(
      { error: "Error al obtener las zonas de envío", details: error.message },
      { status: 500 }
    );
  }
}
