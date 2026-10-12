import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    // आजसह मागील 7 दिवस
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);

    const [
      totalUsers,
      totalPuzzles,
      publishedPuzzles,
      totalCategories,
      totalQuestions,
      totalAttempts,
      completedAttempts,
      recentAttempts,
      popularPuzzles,
      averageScore,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.puzzle.count(),

      prisma.puzzle.count({
        where: { published: true },
      }),

      prisma.category.count(),

      prisma.question.count(),

      prisma.attempt.count(),

      prisma.attempt.count({
        where: { status: "COMPLETED" },
      }),

      prisma.attempt.findMany({
        where: {
          startedAt: {
            gte: startDate,
          },
        },
        select: {
          startedAt: true,
          status: true,
        },
      }),

      prisma.puzzle.findMany({
        select: {
          id: true,
          title: true,
          published: true,
          _count: {
            select: {
              attempts: true,
              questions: true,
            },
          },
        },
        orderBy: {
          attempts: {
            _count: "desc",
          },
        },
        take: 5,
      }),

      prisma.attempt.aggregate({
        where: {
          status: "COMPLETED",
          percentage: {
            not: null,
          },
        },
        _avg: {
          percentage: true,
        },
      }),
    ]);

    const activity = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      const key = getDateKey(date);

      const dayAttempts = recentAttempts.filter(
        (attempt) => getDateKey(attempt.startedAt) === key
      );

      return {
        date: key,
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        attempts: dayAttempts.length,
        completed: dayAttempts.filter(
          (attempt) => attempt.status === "COMPLETED"
        ).length,
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPuzzles,
        publishedPuzzles,
        draftPuzzles: totalPuzzles - publishedPuzzles,
        totalCategories,
        totalQuestions,
        totalAttempts,
        completedAttempts,
        completionRate: totalAttempts
          ? Math.round(
              (completedAttempts / totalAttempts) * 100
            )
          : 0,
        averageScore: Math.round(
          averageScore._avg.percentage ?? 0
        ),
      },

      activity,

      popularPuzzles: popularPuzzles.map((puzzle) => ({
        id: puzzle.id,
        title: puzzle.title,
        published: puzzle.published,
        attempts: puzzle._count.attempts,
        questions: puzzle._count.questions,
      })),
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    return NextResponse.json(
      { error: "Could not load analytics from the database." },
      { status: 500 }
    );
  }
}
