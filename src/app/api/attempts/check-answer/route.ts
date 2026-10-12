import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { puzzleId, questionId, optionId } = body ?? {};

    if (
      typeof puzzleId !== "string" ||
      typeof questionId !== "string" ||
      typeof optionId !== "string"
    ) {
      return NextResponse.json(
        { error: "Puzzle, question and selected option are required." },
        { status: 400 }
      );
    }

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        puzzleId,
        puzzle: { published: true },
      },
      select: {
        id: true,
        explanation: true,
        options: {
          select: { id: true, isCorrect: true },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }

    const selected = question.options.find((option) => option.id === optionId);
    if (!selected) {
      return NextResponse.json(
        { error: "The selected option does not belong to this question." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      isCorrect: selected.isCorrect,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("Answer check error:", error);
    return NextResponse.json(
      { error: "Unable to check this answer right now." },
      { status: 500 }
    );
  }
}
