
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function validateOptions(options: unknown) {
  if (!Array.isArray(options) || options.length !== 4) {
    return "Exactly four answer options are required.";
  }

  if (
    options.some(
      (option) =>
        !option ||
        typeof option.text !== "string" ||
        !option.text.trim()
    )
  ) {
    return "All four options must have text.";
  }

  if (options.filter((option) => option.isCorrect === true).length !== 1) {
    return "Exactly one option must be marked as correct.";
  }

  return null;
}

function normalizeOptions(options: any[]) {
  return options.map((option, index) => ({
    text: String(option.text).trim().slice(0, 500),
    image: String(option.image || "").trim().slice(0, 2000) || null,
    isCorrect: option.isCorrect === true,
    sortOrder: index,
  }));
}

// GET: List questions for a puzzle, or all questions.
export async function GET(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return errorResponse("Admin access required.", 403);
    }

    const url = new URL(request.url);
    const puzzleId = url.searchParams.get("puzzleId");

    const questions = await prisma.question.findMany({
      where: puzzleId ? { puzzleId } : undefined,
      include: {
        options: { orderBy: { sortOrder: "asc" } },
        puzzle: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            category: { select: { name: true } },
          },
        },
      },
      orderBy: [{ puzzleId: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Admin questions GET failed:", error);
    return errorResponse("Could not load questions.", 500);
  }
}

// POST: Add a new question to an existing puzzle.
export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return errorResponse("Admin access required.", 403);
    }

    const body = await request.json();

    const puzzleId = String(body.puzzleId || "").trim();
    const questionText = String(body.question || "").trim();
    const optionsError = validateOptions(body.options);

    if (!puzzleId || !questionText) {
      return errorResponse("Puzzle ID and question text are required.");
    }

    if (optionsError) {
      return errorResponse(optionsError);
    }

    const puzzle = await prisma.puzzle.findUnique({
      where: { id: puzzleId },
      select: { id: true },
    });

    if (!puzzle) {
      return errorResponse("Puzzle not found.", 404);
    }

    const result = await prisma.$transaction(async (tx) => {
      const lastQuestion = await tx.question.findFirst({
        where: { puzzleId },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });

      const nextSortOrder = (lastQuestion?.sortOrder ?? -1) + 1;

      const createdQuestion = await tx.question.create({
        data: {
          puzzleId,
          question: questionText.slice(0, 2000),
          image: String(body.image || "").trim().slice(0, 2000) || null,
          explanation:
            String(body.explanation || "").trim().slice(0, 2000) || null,
          points: Math.max(1, Math.min(100, Number(body.points) || 1)),
          sortOrder: nextSortOrder,
          options: {
            create: normalizeOptions(body.options),
          },
        },
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      });

      const questionCount = await tx.question.count({
        where: { puzzleId },
      });

      await tx.puzzle.update({
        where: { id: puzzleId },
        data: { questionCount },
      });

      return createdQuestion;
    });

    return NextResponse.json({ question: result }, { status: 201 });
  } catch (error) {
    console.error("Admin question POST failed:", error);
    return errorResponse("Could not create question.", 500);
  }
}

// PATCH: Edit an existing question and its four options.
export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return errorResponse("Admin access required.", 403);
    }

    const body = await request.json();
    const id = String(body.id || "").trim();
    const questionText = String(body.question || "").trim();

    if (!id || !questionText) {
      return errorResponse("Question ID and question text are required.");
    }

    const optionsError = validateOptions(body.options);

    if (optionsError) {
      return errorResponse(optionsError);
    }

    const existing = await prisma.question.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return errorResponse("Question not found.", 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.option.deleteMany({ where: { questionId: id } });

      return tx.question.update({
        where: { id },
        data: {
          question: questionText.slice(0, 2000),
          image: String(body.image || "").trim().slice(0, 2000) || null,
          explanation:
            String(body.explanation || "").trim().slice(0, 2000) || null,
          ...(body.points !== undefined
            ? {
                points: Math.max(
                  1,
                  Math.min(100, Number(body.points) || 1)
                ),
              }
            : {}),
          options: {
            create: normalizeOptions(body.options),
          },
        },
        include: {
          options: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json({ question: updated });
  } catch (error) {
    console.error("Admin question PATCH failed:", error);
    return errorResponse("Could not update question.", 500);
  }
}

// DELETE: Delete a question and update its puzzle's question count.
export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return errorResponse("Admin access required.", 403);
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return errorResponse("Question ID is required.");
    }

    const existing = await prisma.question.findUnique({
      where: { id },
      select: { id: true, puzzleId: true },
    });

    if (!existing) {
      return errorResponse("Question not found.", 404);
    }

    await prisma.$transaction(async (tx) => {
      await tx.question.delete({ where: { id } });

      const questionCount = await tx.question.count({
        where: { puzzleId: existing.puzzleId },
      });

      await tx.puzzle.update({
        where: { id: existing.puzzleId },
        data: { questionCount },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin question DELETE failed:", error);
    return errorResponse("Could not delete question.", 500);
  }
}
