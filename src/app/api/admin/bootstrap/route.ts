
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

// One-time bootstrap: only the configured email and secret can be promoted.
export async function POST(request: Request) {
  try {
    const key = request.headers.get("x-admin-bootstrap-key");
    const configuredKey = process.env.ADMIN_BOOTSTRAP_KEY;
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

    if (!configuredKey || !email || !key || key !== configuredKey) {
      return NextResponse.json(
        { error: "Admin bootstrap is not configured or key is invalid." },
        { status: 403 }
      );
    }

    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "An admin already exists. Bootstrap is locked." },
        { status: 409 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "Create an account using ADMIN_EMAIL first, then run bootstrap.",
        },
        { status: 404 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({
      success: true,
      message:
        "Admin role enabled. Remove ADMIN_BOOTSTRAP_KEY from environment now.",
    });
  } catch (error) {
    console.error("Admin bootstrap error:", error);

    return NextResponse.json(
      { error: "Unable to complete admin bootstrap right now." },
      { status: 500 }
    );
  }
}
