import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Gamepad2, Sparkles, Zap } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import Header from "@/components/Header";
import QuizGrid from "@/components/QuizGrid";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, trending, latest] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 12, include: { _count: { select: { puzzles: { where: { published: true } } } } } }),
    prisma.puzzle.findMany({ where: { published: true, featured: true }, orderBy: { createdAt: "desc" }, take: 6, include: { category: true } }),
    prisma.puzzle.findMany({ where: { published: true, trending: true }, orderBy: { createdAt: "desc" }, take: 6, include: { category: true } }),
    prisma.puzzle.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 6, include: { category: true } }),
  ]);
  const shown = featured.length ? featured : latest;
  const totalPuzzles = categories.reduce((sum, item) => sum + item._count.puzzles, 0);

  return <>
    <Header />
    <main>
      <section className="reasa-hero">
        <div className="reasa-hero-inner">
          <span className="reasa-eyebrow"><Sparkles size={13} /> The global brain playground</span>
          <h1>More Than Just<br />Quizzes — It’s a<br /><span className="reasa-gradient-text">Brain Adventure.</span></h1>
          <p className="reasa-hero-copy">Challenge your mind with brain puzzles, clever riddles and mind-bending trivia. Learn, play and become sharper every day.</p>
          <div className="reasa-hero-actions">
            <Link href={categories[0] ? `/${categories[0].slug}` : "/categories"} className="reasa-button reasa-button-primary">Start Playing <ArrowRight size={16} /></Link>
            <Link href="/categories" className="reasa-button reasa-button-ghost"><Gamepad2 size={16} /> Explore Categories</Link>
          </div>
          <div className="reasa-stats">
            <div className="reasa-stat"><strong>{categories.length}</strong><span>Curated Categories</span></div>
            <div className="reasa-stat"><strong>{totalPuzzles}</strong><span>Published MCQ Sets</span></div>
            <div className="reasa-stat"><strong>4</strong><span>Choices per question</span></div>
            <div className="reasa-stat"><strong>Free</strong><span>Play without sign-up</span></div>
          </div>
        </div>
      </section>

      <div className="reasa-shell">
        <section className="reasa-section">
          <div className="reasa-section-head"><div><div className="reasa-section-kicker">Find your next obsession</div><h2 className="reasa-section-title">Explore Popular Categories</h2><p className="reasa-section-desc">Pick a topic. Challenge your brain. Explore something new.</p></div><Link className="reasa-text-link" href="/categories">View all <ArrowRight size={14} /></Link></div>
          <div className="reasa-category-grid">
            {categories.map((category) => {
              return <Link key={category.id} href={`/${category.slug}`} className="reasa-category-card" style={{ "--card-image": category.image ? `url("${category.image}")` : "none", "--card-tint": "rgba(100,116,139,.22)" } as CSSProperties}>
                <div className="reasa-category-icon"><CategoryIcon name={category.icon} size={20} /></div><h3>{category.name}</h3><p>{category.description}</p><small>{category._count.puzzles} challenges ↗</small>
              </Link>;
            })}
          </div>
        </section>

        <section className="reasa-section">
          <div className="reasa-section-head"><div><div className="reasa-section-kicker">Hand-picked for curious minds</div><h2 className="reasa-section-title">Featured Quizzes</h2><p className="reasa-section-desc">A few good reasons to take a break and think.</p></div><Link className="reasa-text-link" href="/categories">View all <ArrowRight size={14} /></Link></div>
          {shown.length ? <QuizGrid puzzles={shown} categoryName="Featured" categoryIcon={null} /> : <div className="reasa-empty"><Sparkles size={28} style={{ margin: "0 auto 12px" }} /><h3>No published challenges yet</h3><p>Published quizzes will appear here when they are available.</p></div>}
        </section>

        {trending.length > 0 && <section className="reasa-section">
          <div className="reasa-section-head"><div><div className="reasa-section-kicker"><Flame size={13} style={{ display: "inline", verticalAlign: "middle" }} /> Popular right now</div><h2 className="reasa-section-title">Trending Challenges</h2></div></div>
          <div className="reasa-feature-grid">{trending.slice(0, 3).map((puzzle, index) => <Link key={puzzle.id} href={`/play/${puzzle.slug}`} className="reasa-quiz-card"><div className="reasa-quiz-image">{(puzzle.image || puzzle.thumbnail) && <img src={puzzle.image || puzzle.thumbnail || ""} alt={`${puzzle.category.name} topic`} loading="lazy" />}</div><div className="reasa-quiz-body"><span className="reasa-pill"><Flame size={12} /> Trending #{index + 1}</span><h3>{puzzle.title}</h3><p>{puzzle.description}</p><div className="reasa-card-meta"><span>{puzzle.category.name}</span><span>{puzzle.questionCount} questions</span></div></div></Link>)}</div>
        </section>}

        <section className="reasa-challenge-band"><div><div className="reasa-section-kicker"><Zap size={13} style={{ display: "inline", verticalAlign: "middle" }} /> Your next streak starts here</div><h2 className="reasa-section-title">Small steps in knowledge.<br />Big wins for your brain.</h2><p className="reasa-section-desc">Take a quick challenge and make curiosity a daily habit.</p></div><Link href="/categories" className="reasa-button reasa-button-primary">Find a Challenge <ArrowRight size={16} /></Link></section>
      </div>
    </main>
    
  </>;
}
