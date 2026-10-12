
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  try {
    const [
      totalUsers,
      totalPuzzles,
      publishedPuzzles,
      totalCategories,
      totalQuestions,
      totalAttempts,
      completedAttempts,
      recentUsers,
      recentAttempts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.puzzle.count(),
      prisma.puzzle.count({ where: { published: true } }),
      prisma.category.count(),
      prisma.question.count(),
      prisma.attempt.count(),
      prisma.attempt.count({ where: { status: "COMPLETED" } }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.attempt.findMany({
        take: 8,
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          status: true,
          score: true,
          percentage: true,
          startedAt: true,
          completedAt: true,
          user: { select: { name: true, email: true } },
          puzzle: { select: { title: true } },
        },
      }),
    ]);

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
          ? Math.round((completedAttempts / totalAttempts) * 100)
          : 0,
      },
      recentUsers,
      recentAttempts,
    });
  } catch (error) {
    console.error("Admin dashboard API error:", error);

    return NextResponse.json(
      { error: "Could not load dashboard data." },
      { status: 500 }
    );
  }
}
