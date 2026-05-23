import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const updateProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  price: z.number().positive("El precio debe ser un número positivo"),
  comparePrice: z.number().positive("El precio promocional debe ser un número positivo").nullable().optional(),
  isActive: z.boolean(),
  categoryId: z.string().nullable().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    // Verificar que el producto exista
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Generar un nuevo slug si cambia el nombre
    const slug =
      validatedData.name !== existingProduct.name
        ? slugify(validatedData.name)
        : existingProduct.slug;

    // Si cambia el slug, verificar si ya existe otro producto con el mismo slug para evitar colisiones
    if (slug !== existingProduct.slug) {
      const slugConflict = await prisma.product.findUnique({
        where: { slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: "Ya existe un producto con un nombre/slug similar" },
          { status: 400 }
        );
      }
    }

    // Actualizar producto en la DB
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice || null,
        isActive: validatedData.isActive,
        categoryId: validatedData.categoryId || null,
      },
    });

    // Revalidar el caché de la landing y del dashboard para refrescar precios al instante
    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({
      message: "Producto actualizado con éxito",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("API Admin Product PUT Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos de producto inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar que el producto exista
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar producto de la DB
    await prisma.product.delete({
      where: { id },
    });

    // Revalidar el caché del storefront y panel de administración
    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({
      message: "Producto eliminado con éxito",
    });
  } catch (error: any) {
    console.error("API Admin Product DELETE Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor", details: error.message },
      { status: 500 }
    );
  }
}
