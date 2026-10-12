
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Admin categories GET error:", error);

    return NextResponse.json(
      { error: "Could not load categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim().slice(0, 100);
    const slug = String(body.slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required." },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: String(body.description || "").slice(0, 500),
        icon: String(body.icon || "").slice(0, 30),
        image: String(body.image || "").slice(0, 2000),
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Admin categories POST error:", error);

    return NextResponse.json(
      { error: "Could not save category. Check that its slug is unique." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Category ID required." },
        { status: 400 }
      );
    }

    const data: {
      name?: string;
      description?: string;
      icon?: string;
      image?: string;
      slug?: string;
      sortOrder?: number;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      data.name = String(body.name).trim().slice(0, 100);
    }

    if (body.description !== undefined) {
      data.description = String(body.description).slice(0, 500);
    }

    if (body.icon !== undefined) {
      data.icon = String(body.icon).slice(0, 30);
    }

    if (body.image !== undefined) {
      data.image = String(body.image).slice(0, 2000);
    }

    if (body.slug !== undefined) {
      data.slug = String(body.slug)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (body.sortOrder !== undefined) {
      data.sortOrder = Number(body.sortOrder) || 0;
    }

    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    const category = await prisma.category.update({
      where: { id: String(body.id) },
      data,
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Admin categories PATCH error:", error);

    return NextResponse.json(
      { error: "Could not update category." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const id = new URL(request.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID required." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
        select: {
          id: true,
          subcategories: {
            select: { id: true },
          },
          puzzles: {
            select: { id: true },
          },
        },
      });

      if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
      }

      const puzzleIds = category.puzzles.map((puzzle) => puzzle.id);
      const subcategoryIds = category.subcategories.map(
        (subcategory) => subcategory.id
      );

      if (puzzleIds.length > 0) {
        // Delete answer history associated with this category's questions
        // before deleting the questions themselves.
        await tx.answer.deleteMany({
          where: {
            OR: [
              { question: { puzzleId: { in: puzzleIds } } },
              { attempt: { puzzleId: { in: puzzleIds } } },
            ],
          },
        });

        // Remove scores for quizzes in this category.
        await tx.score.deleteMany({
          where: { puzzleId: { in: puzzleIds } },
        });

        // Remove quiz attempts.
        await tx.attempt.deleteMany({
          where: { puzzleId: { in: puzzleIds } },
        });

        // Remove question options, questions and puzzle tags.
        // Deleting questions also cascades to their options.
        await tx.question.deleteMany({
          where: { puzzleId: { in: puzzleIds } },
        });

        await tx.puzzleTag.deleteMany({
          where: { puzzleId: { in: puzzleIds } },
        });

        // Remove the quizzes/challenges.
        await tx.puzzle.deleteMany({
          where: { id: { in: puzzleIds } },
        });
      }

      // Remove the subcategories and finally the category.
      if (subcategoryIds.length > 0) {
        await tx.subcategory.deleteMany({
          where: { id: { in: subcategoryIds } },
        });
      }

      await tx.category.delete({
        where: { id },
      });
    });

    return NextResponse.json({
      success: true,
      message:
        "Category, challenges, questions, options and related quiz records were permanently deleted.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    console.error("Permanent category deletion error:", error);

    return NextResponse.json(
      { error: "Could not permanently delete this category." },
      { status: 500 }
    );
  }
}
