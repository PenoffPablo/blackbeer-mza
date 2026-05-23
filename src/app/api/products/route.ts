import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const categorySlug = searchParams.get("category") || undefined;
    const featured = searchParams.get("featured") === "true" ? true : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const sortBy = (searchParams.get("sort") as any) || undefined;

    const data = await getProducts({
      search,
      categorySlug,
      featured,
      limit,
      page,
      sortBy,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Products Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
