
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  if (!await requireAdmin()) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const search = (searchParams.get("search") || "").trim();
    const role = searchParams.get("role") || "ALL";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit")) || 20)
    );

    const validRoles = ["USER", "ADMIN", "EDITOR"];

    if (role !== "ALL" && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid user role." },
        { status: 400 }
      );
    }

    const where: any = {};

    if (role !== "ALL") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total, totalUsers, admins, editors] =
      await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                attempts: true,
                scores: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
        prisma.user.count(),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "EDITOR" } }),
      ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalUsers,
        admins,
        editors,
        regularUsers: totalUsers - admins - editors,
      },
    });
  } catch (error) {
    console.error("Admin users fetch failed:", error);

    return NextResponse.json(
      { error: "Could not load users." },
      { status: 500 }
    );
  }
}
