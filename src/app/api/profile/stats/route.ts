import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const session = readSessionToken(token);

    if (!session) {
      return NextResponse.json(
        { error: "Please log in to view your profile." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 401 }
      );
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      orderBy: { completedAt: "desc" },
      select: {
        id: true,
        score: true,
        totalPoints: true,
        percentage: true,
        completedAt: true,
        startedAt: true,
        durationSeconds: true,
        puzzle: {
          select: {
            title: true,
            slug: true,
            category: {
              select: { name: true },
            },
          },
        },
      },
    });

    const completed = attempts.length;

    // Existing XP rule: 10 XP for each point scored.
    const xp = attempts.reduce(
      (sum, attempt) => sum + Math.max(0, attempt.score) * 10,
      0
    );

    const totalPoints = attempts.reduce(
      (sum, attempt) => sum + Math.max(0, attempt.totalPoints),
      0
    );

    const totalScore = attempts.reduce(
      (sum, attempt) => sum + Math.max(0, attempt.score),
      0
    );

    const accuracy = totalPoints > 0
      ? Math.round((totalScore / totalPoints) * 100)
      : 0;

    // Calculate consecutive active calendar days using UTC dates.
    const activeDays = Array.from(
      new Set(
        attempts.map((attempt) =>
          (attempt.completedAt ?? attempt.startedAt)
            .toISOString()
            .slice(0, 10)
        )
      )
    ).sort((a, b) => b.localeCompare(a));

    const today = new Date().toISOString().slice(0, 10);
    const yesterdayDate = new Date();
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterday = yesterdayDate.toISOString().slice(0, 10);

    let streak = 0;

    if (activeDays.length > 0) {
      const latestDay = activeDays[0];

      // A streak remains active if the last quiz was today or yesterday.
      if (latestDay === today || latestDay === yesterday) {
        let expected = new Date(`${latestDay}T00:00:00.000Z`);

        for (const day of activeDays) {
          const expectedDay = expected.toISOString().slice(0, 10);

          if (day !== expectedDay) break;

          streak++;
          expected.setUTCDate(expected.getUTCDate() - 1);
        }
      }
    }

    const level = Math.floor(xp / 1000) + 1;
    const xpIntoLevel = xp % 1000;
    const xpToNextLevel = 1000 - xpIntoLevel;

    const badges = [
      {
        id: "first-quiz",
        name: "First Step",
        description: "Complete your first quiz",
        earned: completed >= 1,
      },
      {
        id: "quiz-explorer",
        name: "Quiz Explorer",
        description: "Complete 10 quizzes",
        earned: completed >= 10,
      },
      {
        id: "quiz-master",
        name: "Quiz Master",
        description: "Complete 50 quizzes",
        earned: completed >= 50,
      },
      {
        id: "streak-3",
        name: "Consistency",
        description: "Maintain a 3-day streak",
        earned: streak >= 3,
      },
      {
        id: "perfect-score",
        name: "Perfect Score",
        description: "Get 100% on a quiz",
        earned: attempts.some(
          (attempt) =>
            attempt.totalPoints > 0 &&
            attempt.score === attempt.totalPoints
        ),
      },
    ];

    const recentActivity = attempts.slice(0, 10).map((attempt) => ({
      id: attempt.id,
      title: attempt.puzzle.title,
      slug: attempt.puzzle.slug,
      category: attempt.puzzle.category.name,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage ?? (
        attempt.totalPoints > 0
          ? Math.round((attempt.score / attempt.totalPoints) * 100)
          : 0
      ),
      completedAt: (
        attempt.completedAt ?? attempt.startedAt
      ).toISOString(),
      durationSeconds: attempt.durationSeconds,
    }));

    return NextResponse.json({
      completed,
      xp,
      level,
      xpIntoLevel,
      xpToNextLevel,
      accuracy,
      streak,
      totalScore,
      badges,
      recentActivity,
    });
  } catch (error) {
    console.error("Profile stats error:", error);

    return NextResponse.json(
      { error: "Unable to load profile statistics." },
      { status: 500 }
    );
  }
}