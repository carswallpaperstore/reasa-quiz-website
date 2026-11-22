import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import QuizPlayer from "@/components/QuizPlayer";
export const revalidate = 60;

// Cache public quiz content briefly so each question URL refresh avoids
// repeating the same PostgreSQL read. Admin changes appear within 60 seconds.
const getCachedPuzzle = unstable_cache(
  async (slug: string) =>
    prisma.puzzle.findUnique({
      where: { slug },
      include: {
        category: true,
        questions: {
          where: { type: "MULTIPLE_CHOICE" },
          orderBy: { sortOrder: "asc" },
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                text: true,
                image: true,
                sortOrder: true,
                isCorrect: true,
              },
            },
          },
        },
      },
    }),
  ["reasa-public-quiz-by-slug-v1"],
  { revalidate: 60, tags: ["reasa-public-quizzes"] }
);

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function PuzzlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;

  if (!slug) {
    notFound();
  }

  const puzzle = await getCachedPuzzle(slug);

    if (!puzzle || !puzzle.published) {
    notFound();
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50">
        {puzzle.questions.length === 0 ? (
          <section className="mx-auto max-w-3xl px-4 py-20 text-center">
            <div className="rounded-3xl bg-white p-10 shadow-xl">
              <div className="text-5xl">🧩</div>
              <h1 className="mt-4 text-2xl font-black text-slate-900">Questions coming soon</h1>
              <p className="mt-2 text-slate-600">This challenge is being prepared.</p>
              <Link href={`/${puzzle.category.slug}`} className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-3 font-bold text-white">Explore more quizzes</Link>
            </div>
          </section>
        ) : (
          <QuizPlayer
            puzzleId={puzzle.id}
            puzzleTitle={puzzle.title}
            categoryName={puzzle.category.name}
            questions={puzzle.questions}
            backgroundImage={puzzle.image}
            slug={slug}
            initialQuestionIndex={Math.min(Math.max(Number.parseInt(query.q || "0", 10) || 0, 0), puzzle.questions.length - 1)}
          />
        )}
      </main>
    </>
  );
}
