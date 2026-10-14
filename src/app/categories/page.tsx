import type { CSSProperties } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CategoryIcon from "@/components/CategoryIcon";
import { prisma } from "@/lib/prisma";
import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
export const revalidate = 300;



export default async function CategoriesPage() {
 
const categories = await prisma.category.findMany({
  where: { isActive: true },
  orderBy: { sortOrder: "asc" },
  include: {
    _count: {
      select: {
        puzzles: { where: { published: true } },
      },
    },
  },
}).catch((error) => {
  console.error("Categories page database error:", error);
  throw error;
});

  return <><Header /><main>
    <section className="reasa-page-hero"><div className="reasa-shell"><span className="reasa-eyebrow"><Sparkles size={13} /> Choose your universe</span><h1>Explore All Categories</h1><p>Find your favourite category and challenge yourself with puzzles, trivia, mysteries and brain teasers. Every answer takes you one step further.</p></div></section>
    <section className="reasa-page-main"><div className="reasa-shell"><div className="reasa-section-head"><div><div className="reasa-section-kicker">Your next brain adventure</div><h2 className="reasa-section-title">Pick a category to begin</h2></div><span className="reasa-pill"><BrainCircuit size={13} /> {categories.length} categories</span></div>
      {categories.length ? <div className="reasa-category-grid">{categories.map((category) => <Link key={category.id} href={`/${category.slug}`} className="reasa-category-card" style={{ "--card-image": `url("${category.image || ""}")`, "--card-tint": "rgba(139,92,246,.25)" } as CSSProperties}><div className="reasa-category-icon"><CategoryIcon name={category.icon} size={20} /></div><h3>{category.name}</h3><p>{category.description || "Explore puzzles and challenges in this category."}</p><small>{category._count.puzzles} challenges <ArrowRight size={11} style={{ display: "inline", verticalAlign: "middle" }} /></small></Link>)}</div> : <div className="reasa-empty"><BrainCircuit size={32} style={{ margin: "0 auto 12px" }} /><h2>No categories available</h2><p>New challenges are coming soon. Please check back later.</p></div>}
    </div></section>
  </main></>;
}
