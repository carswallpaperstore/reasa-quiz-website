import Link from "next/link";
import Header from "@/components/Header";
import { prisma } from "@/lib/prisma";
import { Search, ArrowRight } from "lucide-react";
import QuizGrid from "@/components/QuizGrid";
export const dynamic = "force-dynamic";
type Props={searchParams:Promise<{q?:string}>};
export default async function SearchPage({searchParams}:Props){
 const {q=""}=await searchParams; const query=q.trim().slice(0,100);
 const [puzzles,categories]=query?await Promise.all([
  prisma.puzzle.findMany({where:{published:true,OR:[{title:{contains:query,mode:"insensitive"}},{description:{contains:query,mode:"insensitive"}},{category:{name:{contains:query,mode:"insensitive"}}}]},include:{category:true},orderBy:[{featured:"desc"},{title:"asc"}],take:60}),
  prisma.category.findMany({where:{isActive:true,name:{contains:query,mode:"insensitive"}},orderBy:{sortOrder:"asc"},take:20})
 ]):[[],[]];
 return <><Header/><main><section className="reasa-page-hero"><div className="reasa-shell"><span className="reasa-eyebrow"><Search size={13}/> Search REASA</span><h1>Find your next challenge</h1><form action="/search" className="reasa-search-form"><input type="search" name="q" defaultValue={query} placeholder="Try “world capitals” or “number patterns”…" aria-label="Search quizzes and categories"/><button className="reasa-button reasa-button-primary" type="submit"><Search size={16}/> Search</button></form><p>Search published multiple-choice challenges by topic or title.</p></div></section><section className="reasa-page-main"><div className="reasa-shell">{query?<><div className="reasa-section-head"><div><div className="reasa-section-kicker">Search results</div><h2 className="reasa-section-title">Results for “{query}”</h2></div><span className="reasa-pill">{puzzles.length+categories.length} results</span></div>{categories.length>0&&<><h3 className="reasa-subhead">Categories</h3><div className="reasa-search-categories">{categories.map(c=><Link key={c.id} href={`/${c.slug}`} className="reasa-search-result"><strong>{c.name}</strong><ArrowRight size={16}/></Link>)}</div></>}{puzzles.length>0&&<><h3 className="reasa-subhead">Quiz sets</h3><QuizGrid puzzles={puzzles} categoryName="Search results" categoryIcon={null} /></>}{!puzzles.length&&!categories.length&&<div className="reasa-empty"><h2>No matching challenges found</h2><p>Try a broader search term or explore all categories.</p><Link className="reasa-button reasa-button-primary" href="/categories">Browse categories</Link></div>}</>:<div className="reasa-empty"><Search size={28} style={{margin:"0 auto 12px"}}/><h2>Search the challenge library</h2><p>Enter a topic, category or quiz title above.</p></div>}</div></section></main></>;
}
