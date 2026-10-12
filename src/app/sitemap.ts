import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://reasa.in").replace(/\/$/, "");
 const [categories, puzzles] = await Promise.all([
  prisma.category.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  prisma.puzzle.findMany({ where: { published: true, questions: { some: { type: "MULTIPLE_CHOICE" } } }, select: { slug: true, updatedAt: true } }),
 ]);
 const pages = ["", "/categories", "/about", "/contact", "/privacy", "/terms", "/daily-challenge", "/search"];
 return [...pages.map(path => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.6 })), ...categories.map(c => ({ url: `${base}/${c.slug}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })), ...puzzles.map(p => ({ url: `${base}/play/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 }))];
}
