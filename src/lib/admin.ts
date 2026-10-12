import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function requireAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = readSessionToken(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, email: true },
  });
  return user?.role === "ADMIN" ? user : null;
}
