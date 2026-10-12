import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = readSessionToken(token);

    const puzzleId = body.puzzleId;
    const answers = body.answers;
    const durationSeconds = Number.isFinite(Number(body.elapsedSeconds)) ? Math.max(0, Math.min(86400, Math.floor(Number(body.elapsedSeconds)))) : null;

    if (typeof puzzleId !== "string" || !answers || typeof answers !== "object" || Array.isArray(answers)) {
      return NextResponse.json(
        {
          error: "Puzzle ID and answers are required.",
        },
        { status: 400 }
      );
    }

    const puzzle = await prisma.puzzle.findUnique({
      where: {
        id: puzzleId,
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!puzzle || !puzzle.published) {
      return NextResponse.json(
        {
          error: "Puzzle not found.",
        },
        { status: 404 }
      );
    }

    let score = 0;
    let totalPoints = 0;

    const answerRecords = [];

    for (const question of puzzle.questions) {
      totalPoints += question.points;

      const selectedOptionId = answers[question.id];

      const correctOption = question.options.find(
        (option) => option.isCorrect
      );

      const isCorrect =
        !!selectedOptionId &&
        selectedOptionId === correctOption?.id;

      if (isCorrect) {
        score += question.points;
      }

      answerRecords.push({
        questionId: question.id,
        optionId: selectedOptionId || null,
        isCorrect,
        points: isCorrect ? question.points : 0,
      });
    }

    const percentage =
      totalPoints > 0
        ? (score / totalPoints) * 100
        : 0;

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
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      totalPoints,
      percentage,
    });
  } catch (error) {
    console.error("Attempt submission error:", error);

    return NextResponse.json(
      {
        error: "Failed to submit challenge.",
      },
      { status: 500 }
    );
  }
}