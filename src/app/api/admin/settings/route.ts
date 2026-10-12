
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const defaults: Record<string, string> = {
  siteName: "REASA",
  tagline: "Challenge your mind.",
  contactEmail: "",
  supportUrl: "",
  maintenanceMode: "false",
  quizzesPerCategory: "10",
  allowGuestPlay: "true",
};

const allowedKeys = new Set(Object.keys(defaults));

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  try {
    const saved = await prisma.siteSetting.findMany({
      where: { key: { in: [...allowedKeys] } },
    });

    const settings = { ...defaults };

    for (const item of saved) {
      settings[item.key] = item.value;
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Could not load settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const incoming = body?.settings;

    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
      return NextResponse.json(
        { error: "A settings object is required." },
        { status: 400 }
      );
    }

    const settings: Record<string, string> = {};

    for (const [key, value] of Object.entries(incoming)) {
      if (!allowedKeys.has(key)) continue;

      if (typeof value !== "string") {
        return NextResponse.json(
          { error: `Invalid value for ${key}.` },
          { status: 400 }
        );
      }

      settings[key] = value.trim().slice(0, 1000);
    }

    if (
      settings.siteName !== undefined &&
      !settings.siteName
    ) {
      return NextResponse.json(
        { error: "Website name cannot be empty." },
        { status: 400 }
      );
    }

    if (settings.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
      return NextResponse.json(
        { error: "Enter a valid contact email address." },
        { status: 400 }
      );
    }

    if (
      settings.quizzesPerCategory !== undefined &&
      (!/^\d+$/.test(settings.quizzesPerCategory) ||
        Number(settings.quizzesPerCategory) < 1 ||
        Number(settings.quizzesPerCategory) > 100)
    ) {
      return NextResponse.json(
        { error: "Quizzes per category must be between 1 and 100." },
        { status: 400 }
      );
    }

    for (const key of ["maintenanceMode", "allowGuestPlay"]) {
      if (settings[key] !== undefined && !["true", "false"].includes(settings[key])) {
        return NextResponse.json(
          { error: `Invalid setting: ${key}.` },
          { status: 400 }
        );
      }
    }

    if (settings.supportUrl) {
      try {
        const url = new URL(settings.supportUrl);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return NextResponse.json(
          { error: "Support URL must start with http:// or https://." },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      )
    );

    const saved = await prisma.siteSetting.findMany({
      where: { key: { in: [...allowedKeys] } },
    });

    return NextResponse.json({
      success: true,
      settings: { ...defaults, ...Object.fromEntries(saved.map((s) => [s.key, s.value])) },
    });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { error: "Could not save settings." },
      { status: 500 }
    );
  }
}
        