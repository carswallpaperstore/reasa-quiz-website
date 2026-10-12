import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
const COOKIE = "reasa_session";
const SESSION_DAYS = 14;
function secret() {
  const value = process.env.SESSION_SECRET || (process.env.NODE_ENV !== "production" ? "local-development-only-change-before-deploy" : "");
  if (!value) throw new Error("SESSION_SECRET must be configured in production.");
  return value;
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const key = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}
export function createSessionToken(userId: string) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  const payload = `${userId}.${expires}`;
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}
export function readSessionToken(token?: string) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresText, signature] = parts;
  const expires = Number(expiresText);
  if (!userId || !Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return null;
  const expected = createHmac("sha256", secret()).update(`${userId}.${expiresText}`).digest();
  let actual: Buffer;
  try { actual = Buffer.from(signature, "base64url"); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  return { userId, expires };
}
export function sessionCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: SESSION_DAYS * 86400 };
}
export function makeReferralCode() { return randomBytes(5).toString("hex").toUpperCase(); }
export { COOKIE as SESSION_COOKIE };
