"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
type PuzzleCard = { id: string; slug: string; title: string; description: string | null; image: string | null; thumbnail: string | null; questionCount: number; difficulty: string; category?: { name: string; slug: string; icon: string | null } };
export default function QuizGrid({ puzzles, categoryName, categoryIcon }: { puzzles: PuzzleCard[]; categoryName: string; categoryIcon: string | null }) {
    const [completed, setCompleted] = useState<string[]>([]);
    useEffect(() => { try { const value = JSON.parse(localStorage.getItem("reasa-completed") || "[]"); setCompleted(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []) } catch { setCompleted([]) } }, []);
   
return (
  <div className="reasa-feature-grid">
    {puzzles.map((p, index) => {
      const done = completed.includes(p.id);
      const content = (
        <>
          <div className="reasa-quiz-image">
            {(p.image || p.thumbnail) && (
              <img
                src={p.image || p.thumbnail || ""}
                alt={`${p.title} topic`}
                loading={index < 2 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
            )}
            {done && (
              <span className="reasa-completed-badge">
                <CheckCircle2 size={13} /> Completed
              </span>
            )}
          </div>
          <div className="reasa-quiz-body">
            <div className="reasa-quiz-label-row">
              <span className="reasa-pill">
                <CategoryIcon name={p.category?.icon || categoryIcon} size={13} />
                {p.category?.name || categoryName}
              </span>
              {done && (
                <span className="reasa-completed-inline">
                  <CheckCircle2 size={12} /> Completed
                </span>
              )}
            </div>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <div className="reasa-card-meta">
              <span>{p.questionCount} MCQs · {p.difficulty.toLowerCase()}</span>
              <span>
                {done ? "Already played" : "Play"} {!done && <ArrowRight size={12} />}
              </span>
            </div>
          </div>
        </>
      );

      return done ? (
        <article
          key={p.id}
          className="reasa-quiz-card reasa-completed-card"
          aria-label={`${p.title}, completed`}
        >
          {content}
        </article>
      ) : (
        <Link key={p.id} href={`/play/${p.slug}`} className="reasa-quiz-card">
          {content}
        </Link>
      );
    })}
  </div>
);

}
    