import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CategoryIcon from "@/components/CategoryIcon";
import QuizGrid from "@/components/QuizGrid";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Clock3,
  Puzzle,
} from "lucide-react";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category: slug } = await params;

  if (!slug) {
    notFound();
  }

  // Admin Settings मधून एका category मध्ये किती quizzes दाखवायचे ते मिळवा.
  const quizLimitSetting = await prisma.siteSetting.findUnique({
    where: {
      key: "quizzesPerCategory",
    },
    select: {
      value: true,
    },
  });

  const parsedQuizLimit = Number(
    quizLimitSetting?.value ?? "10"
  );

  const quizLimit =
    Number.isInteger(parsedQuizLimit) &&
    parsedQuizLimit >= 1
      ? Math.min(parsedQuizLimit, 100)
      : 10;

  // Category आणि त्यातील published quizzes मिळवा.
  const category = await prisma.category.findUnique({
    where: {
      slug,
    },
    include: {
      puzzles: {
        where: {
          published: true,
          questions: {
            some: {
              type: "MULTIPLE_CHOICE",
            },
          },
        },
        orderBy: [
          {
            featured: "desc",
          },
          {
            title: "asc",
          },
        ],
        take: quizLimit,
      },
    },
  });

  if (!category || !category.isActive) {
    notFound();
  }

  const totalChallenges = category.puzzles.length;

  return (
    <>
      <Header />

      <main>
        {/* Category Hero */}
        <section className="reasa-page-hero">
          <div className="reasa-shell">
            <Link
              href="/categories"
              className="reasa-text-link"
            >
              <ArrowLeft size={14} />
              All categories
            </Link>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginTop: 24,
              }}
            >
              <div
                className="reasa-category-icon"
                style={{
                  width: 62,
                  height: 62,
                  fontSize: 30,
                }}
              >
                <CategoryIcon
                  name={category.icon}
                  size={27}
                />
              </div>

              <div>
                <div className="reasa-section-kicker">
                  Category spotlight
                </div>

                <h1 style={{ marginBottom: 0 }}>
                  {category.name}
                </h1>
              </div>
            </div>

            {category.description && (
              <p>{category.description}</p>
            )}

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 18,
              }}
            >
              <span className="reasa-pill">
                <BrainCircuit size={13} />
                {totalChallenges} challenges
              </span>

              <span className="reasa-pill">
                <Clock3 size={13} />
                Play at your pace
              </span>
            </div>
          </div>
        </section>

        {/* Published Quizzes */}
        <section className="reasa-page-main">
          <div className="reasa-shell">
            <div className="reasa-section-head">
              <div>
                <div className="reasa-section-kicker">
                  Ready when you are
                </div>

                <h2 className="reasa-section-title">
                  {totalChallenges} Challenges to Explore
                </h2>
              </div>
            </div>

            {totalChallenges > 0 ? (
              <QuizGrid
                puzzles={category.puzzles}
                categoryName={category.name}
                categoryIcon={category.icon}
              />
            ) : (
              <div className="reasa-empty">
                <Puzzle
                  size={34}
                  style={{
                    margin: "0 auto 12px",
                  }}
                />

                <h2>New challenges are coming soon</h2>

                <p>
                  There are no published puzzles in this
                  category yet.
                </p>

                <Link
                  href="/categories"
                  className="reasa-button reasa-button-primary"
                  style={{
                    marginTop: 16,
                  }}
                >
                  Explore other categories
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
