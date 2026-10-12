import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, hashPassword, makeReferralCode, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const referralCode = typeof body.referralCode === "string" ? body.referralCode.trim().toUpperCase() : "";
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) return NextResponse.json({ error: "Enter your name, a valid email, and a password with at least 8 characters." }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "An account with this email already exists. Please log in." }, { status: 409 });
    const referrer = referralCode ? await prisma.user.findUnique({ where: { referralCode }, select: { referralCode: true } }) : null;
    const user = await prisma.user.create({ data: { name, email, passwordHash: await hashPassword(password), referralCode: makeReferralCode(), referredBy: referrer?.referralCode ?? null }, select: { id: true, name: true, email: true } });
    const response = NextResponse.json({ success: true, user, message: "Account created successfully." }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Signup failed:", error);
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}
