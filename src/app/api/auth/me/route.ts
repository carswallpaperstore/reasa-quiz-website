import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = readSessionToken(token);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, name: true, email: true, referralCode: true, role: true } });
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}
