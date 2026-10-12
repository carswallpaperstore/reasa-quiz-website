import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const types = [
  "QUIZ",
  "BRAIN_PUZZLE",
  "RIDDLE",
  "LOGIC",
  "OBSERVATION",
  "DETECTIVE",
  "NUMBER",
  "MEMORY",
  "REACTION",
  "PERSONALITY",
  "TRIVIA",
];

const difficulties = ["EASY", "MEDIUM", "HARD", "EXPERT"];

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 90) || "puzzle"
  );
}

function validateQuestions(questions: any) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return "At least one question is required.";
  }

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    if (
      !question ||
      typeof question.question !== "string" ||
      !question.question.trim()
    ) {
      return `Question ${i + 1}: Question text is required.`;
    }

    if (
      !Array.isArray(question.options) ||
      question.options.length !== 4
    ) {
      return `Question ${i + 1}: Exactly four options are required.`;
    }

    if (
      question.options.some(
        (option: any) =>
          !option ||
          typeof option.text !== "string" ||
          !option.text.trim()
      )
    ) {
      return `Question ${i + 1}: All four options need text.`;
    }

    if (
      question.options.filter(
        (option: any) => option.isCorrect === true
      ).length !== 1
    ) {
      return `Question ${i + 1}: Select exactly one correct answer.`;
    }
  }

  return null;
}

function normalizeQuestions(questions: any[]) {
  return questions.map((question, index) => ({
    question: question.question.trim().slice(0, 2000),
    image: String(question.image || "").trim().slice(0, 2000) || null,
    explanation:
      String(question.explanation || "").trim().slice(0, 2000) || null,
    points: Math.max(
      1,
      Math.min(100, Number(question.points) || 1)
    ),
    sortOrder: index,
    options: {
      create: question.options.map((option: any, optionIndex: number) => ({
        text: option.text.trim().slice(0, 500),
        image:
          String(option.image || "").trim().slice(0, 2000) || null,
        isCorrect: option.isCorrect === true,
        sortOrder: optionIndex,
      })),
    },
  }));
}

// GET: Load puzzles and active categories for the admin dashboard.
export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return errorResponse("Admin access required.", 403);
    }

    const [puzzles, categories] = await Promise.all([
      prisma.puzzle.findMany({
        include: {
          category: true,
          questions: {
            include: {
              options: { orderBy: { sortOrder: "asc" } },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),

      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return NextResponse.json({ puzzles, categories });
  } catch (error) {
    console.error("Admin puzzles GET failed:", error);
    return errorResponse("Could not load puzzles and categories.", 500);
  }
}

// POST: Create a puzzle and its questions/options.
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return errorResponse("Admin access required.", 403);
    }

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim().slice(0, 160) : "";

    const categoryId = String(body.categoryId || "").trim();

    if (!title) {
      return errorResponse("Puzzle title is required.");
    }

    if (!categoryId) {
      return errorResponse("Please select a category.");
    }

    if (body.type && !types.includes(body.type)) {
      return errorResponse("Invalid puzzle type.");
    }

    if (body.difficulty && !difficulties.includes(body.difficulty)) {
      return errorResponse("Invalid difficulty.");
    }

    const questionError = validateQuestions(body.questions);

    if (questionError) {
      return errorResponse(questionError);
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, isActive: true },
      select: { id: true },
    });

    if (!category) {
      return errorResponse("Selected category was not found or is inactive.", 404);
    }

    const published = body.published === true;

    const puzzle = await prisma.puzzle.create({
      data: {
        title,
        slug:
          `${slugify(String(body.slug || title))}-${crypto.randomUUID().slice(0, 8)}`,
        description:
          String(body.description || "").trim().slice(0, 2000),
        type: body.type || "QUIZ",
        difficulty: body.difficulty || "MEDIUM",
        categoryId,
        image: String(body.image || "").trim().slice(0, 2000) || null,
        thumbnail:
          String(body.thumbnail || body.image || "").trim().slice(0, 2000) ||
          null,
        featured: body.featured === true,
        trending: body.trending === true,
        published,
        publishedAt: published ? new Date() : null,
        questionCount: body.questions.length,
        questions: {
          create: normalizeQuestions(body.questions),
        },
      },
      include: {
        category: true,
        questions: {
          include: {
            options: { orderBy: { sortOrder: "asc" } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ puzzle }, { status: 201 });
  } catch (error) {
    console.error("Admin puzzle POST failed:", error);
    return errorResponse(
      "Could not create puzzle. Check the submitted data and database connection.",
      500
    );
  }
}

// PATCH: Update puzzle details and publishing status.
export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return errorResponse("Admin access required.", 403);
    }

    const body = await request.json();
    const id = String(body.id || "").trim();

    if (!id) {
      return errorResponse("Puzzle ID is required.");
    }

    const data: Record<string, any> = {};

    if (body.title !== undefined) {
      const title = String(body.title).trim().slice(0, 160);

      if (!title) {
        return errorResponse("Puzzle title cannot be empty.");
      }

      data.title = title;
    }

    if (body.description !== undefined) {
      data.description =
        String(body.description || "").trim().slice(0, 2000);
    }

    if (body.image !== undefined) {
      data.image = String(body.image || "").trim().slice(0, 2000) || null;
    }

    if (body.thumbnail !== undefined) {
      data.thumbnail =
        String(body.thumbnail || "").trim().slice(0, 2000) || null;
    }

    if (body.seoTitle !== undefined) {
      data.seoTitle = String(body.seoTitle || "").slice(0, 2000);
    }

    if (body.seoDescription !== undefined) {
      data.seoDescription = String(body.seoDescription || "").slice(0, 2000);
    }

    if (body.categoryId !== undefined) {
      const categoryId = String(body.categoryId).trim();

      const category = await prisma.category.findFirst({
        where: { id: categoryId, isActive: true },
        select: { id: true },
      });

      if (!category) {
        return errorResponse("Selected category was not found or is inactive.", 404);
      }

      data.categoryId = categoryId;
    }

    if (body.type !== undefined) {
      if (!types.includes(body.type)) {
        return errorResponse("Invalid puzzle type.");
      }

      data.type = body.type;
    }

    if (body.difficulty !== undefined) {
      if (!difficulties.includes(body.difficulty)) {
        return errorResponse("Invalid difficulty.");
      }

      data.difficulty = body.difficulty;
    }

    for (const key of ["featured", "trending"]) {
      if (body[key] !== undefined) {
        data[key] = body[key] === true;
      }
    }

    if (body.published !== undefined) {
      data.published = body.published === true;
      data.publishedAt = body.published === true ? new Date() : null;
    }

    const puzzle = await prisma.puzzle.update({
      where: { id },
      data,
      include: { category: true },
    });

    return NextResponse.json({ puzzle });
  } catch (error) {
    console.error("Admin puzzle PATCH failed:", error);
    return errorResponse("Could not update puzzle. Check the puzzle ID and submitted data.", 400);
  }
}

// DELETE: Delete a puzzle.

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return errorResponse("Admin access required.", 403);
    }

    const id = new URL(request.url).searchParams.get("id")?.trim();

    if (!id) {
      return errorResponse("Puzzle ID is required.", 400);
    }

    const existing = await prisma.puzzle.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        questions: {
          select: { id: true },
        },
      },
    });

    if (!existing) {
      return errorResponse("Puzzle not found.", 404);
    }

    const puzzleId = existing.id;
    const questionIds = existing.questions.map((question) => question.id);

    await prisma.$transaction(async (tx) => {
      // Delete answers linked to this puzzle's questions or attempts.
      await tx.answer.deleteMany({
        where: {
          OR: [
            questionIds.length > 0
              ? { questionId: { in: questionIds } }
              : { questionId: "__no_matching_question__" },
            { attempt: { puzzleId } },
          ],
        },
      });

      // Delete scores and attempts belonging to this puzzle.
      await tx.score.deleteMany({
        where: { puzzleId },
      });

      await tx.attempt.deleteMany({
        where: { puzzleId },
      });

      // Delete questions and their options.
      // Options are configured to cascade when their question is deleted.
      await tx.question.deleteMany({
        where: { puzzleId },
      });

      // Remove puzzle-tag links, then the puzzle itself.
      await tx.puzzleTag.deleteMany({
        where: { puzzleId },
      });

      await tx.puzzle.delete({
        where: { id: puzzleId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Puzzle and its related content were deleted successfully.",
      deletedId: puzzleId,
    });
  } catch (error) {
    console.error("Admin puzzle DELETE failed:", error);

    return errorResponse(
      "Could not delete this puzzle and its related records. Check the server logs and database connection.",
      500
    );
  }
}

