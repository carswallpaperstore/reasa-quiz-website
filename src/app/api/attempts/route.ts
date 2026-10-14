
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const puzzleId = body?.puzzleId;
    const answers = body?.answers;

    const durationValue = Number(body?.elapsedSeconds);
    const durationSeconds = Number.isFinite(durationValue)
      ? Math.max(0, Math.min(86400, Math.floor(durationValue)))
      : null;

    if (
      typeof puzzleId !== "string" ||
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers)
    ) {
      return NextResponse.json(
        { error: "Puzzle ID and answers are required." },
        { status: 400 }
      );
    }

    const puzzle = await prisma.puzzle.findUnique({
      where: { id: puzzleId },
      select: {
        id: true,
        published: true,
        questions: {
          where: { type: "MULTIPLE_CHOICE" },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            points: true,
            options: {
              select: {
                id: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    });

    if (!puzzle || !puzzle.published) {
      return NextResponse.json(
        { error: "Puzzle not found." },
        { status: 404 }
      );
    }

    if (puzzle.questions.length === 0) {
      return NextResponse.json(
        { error: "This quiz has no multiple-choice questions." },
        { status: 400 }
      );
    }

    let score = 0;
    let totalPoints = 0;

    const answerRecords = [];

    for (const question of puzzle.questions) {
      totalPoints += question.points;

      const selectedOptionId = answers[question.id];

      // Every displayed question must have a valid selected option.
      if (typeof selectedOptionId !== "string") {
        return NextResponse.json(
          { error: "Please answer every question before viewing your result." },
          { status: 400 }
        );
      }

      // Confirm the selected option belongs to this exact question.
      const selectedOption = question.options.find(
        (option) => option.id === selectedOptionId
      );

      if (!selectedOption) {
        return NextResponse.json(
          { error: "An invalid answer was submitted. Please try again." },
          { status: 400 }
        );
      }

      // The server database is the source of truth for correctness.
      const isCorrect = selectedOption.isCorrect;

      if (isCorrect) {
        score += question.points;
      }

      answerRecords.push({
        questionId: question.id,
        optionId: selectedOption.id,
        isCorrect,
        points: isCorrect ? question.points : 0,
      });
    }

    const percentage =
      totalPoints > 0
        ? Math.round((score / totalPoints) * 10000) / 100
        : 0;

    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = readSessionToken(token);

    // Save the attempt and all question answers together.
    const attempt = await prisma.attempt.create({
      data: {
        userId: session?.userId ?? null,
        puzzleId: puzzle.id,
        status: "COMPLETED",
        score,
        totalPoints,
        percentage,
        durationSeconds,
        completedAt: new Date(),
        answers: {
          create: answerRecords,
        },
      },
      select: {
        id: true,
        score: true,
        totalPoints: true,
        percentage: true,
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
    });
  } catch (error) {
    console.error("Attempt submission error:", error);

    return NextResponse.json(
      { error: "Failed to submit challenge." },
      { status: 500 }
    );
  }
}
