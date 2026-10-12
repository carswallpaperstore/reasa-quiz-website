import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, verifyPassword, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, message: "You are now logged in." });
    response.cookies.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Unable to log in right now." }, { status: 500 });
  }
}
