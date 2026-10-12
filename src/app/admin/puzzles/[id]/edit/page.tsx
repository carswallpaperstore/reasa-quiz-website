
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

type Option = {
  id?: string;
  text: string;
  image?: string | null;
  isCorrect: boolean;
};

type Question = {
  id?: string;
  question: string;
  image?: string | null;
  explanation?: string | null;
  points: number;
  options: Option[];
};

type Category = {
  id: string;
  name: string;
};

type Puzzle = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  difficulty: string;
  image?: string | null;
  thumbnail?: string | null;
  published: boolean;
  featured: boolean;
  trending: boolean;
  categoryId: string;
  questions: Question[];
};

const inputClass =
  "mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function ImagePreview({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src?.trim() || failed) {
    return (
      <div className="mt-3 flex h-36 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500">
        {!src?.trim() ? "Image URL not set" : "Image could not be loaded"}
      </div>
    );
  }

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="mt-3 h-36 w-full rounded-xl border border-gray-200 object-cover"
    />
  );
}

export default function EditPuzzlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const puzzleId = params.id;

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const authResponse = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        const auth = await authResponse.json();

        if (!authResponse.ok || auth.user?.role !== "ADMIN") {
          router.replace("/login");
          return;
        }

        const response = await fetch("/api/admin/puzzles", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load puzzles.");
        }

        const found = (data.puzzles ?? []).find(
          (item: Puzzle) => item.id === puzzleId
        );

        if (!found) {
          if (!cancelled) setMessage("Puzzle not found.");
          return;
        }

        if (cancelled) return;

        setPuzzle({
          ...found,
          image: found.image ?? "",
          thumbnail: found.thumbnail ?? "",
          questions: (found.questions ?? []).map((q: Question) => ({
            ...q,
            options: q.options ?? [],
          })),
        });

        setCategories(data.categories ?? []);
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error ? error.message : "Could not load puzzle."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [puzzleId, router]);

  function changePuzzle(changes: Partial<Puzzle>) {
    setPuzzle((current) => (current ? { ...current, ...changes } : current));
  }

  function changeQuestion(index: number, changes: Partial<Question>) {
    setPuzzle((current) => {
      if (!current) return current;

      return {
        ...current,
        questions: current.questions.map((q, i) =>
          i === index ? { ...q, ...changes } : q
        ),
      };
    });
  }

  function changeOption(
    questionIndex: number,
    optionIndex: number,
    changes: Partial<Option>
  ) {
    setPuzzle((current) => {
      if (!current) return current;

      return {
        ...current,
        questions: current.questions.map((q, qi) => {
          if (qi !== questionIndex) return q;

          return {
            ...q,
            options: q.options.map((option, oi) => {
              if (oi === optionIndex) {
                return { ...option, ...changes };
              }

              return changes.isCorrect === true
                ? { ...option, isCorrect: false }
                : option;
            }),
          };
        }),
      };
    });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!puzzle) return;

    setMessage("");

    if (!puzzle.title.trim()) {
      setMessage("Puzzle title is required.");
      return;
    }

    for (let i = 0; i < puzzle.questions.length; i++) {
      const q = puzzle.questions[i];

      if (!q.question.trim()) {
        setMessage(`Enter Question ${i + 1}.`);
        return;
      }

      if (
        q.options.length !== 4 ||
        q.options.some((option) => !option.text.trim())
      ) {
        setMessage(`Question ${i + 1} must have four filled options.`);
        return;
      }

      if (q.options.filter((option) => option.isCorrect).length !== 1) {
        setMessage(
          `Select exactly one correct answer for Question ${i + 1}.`
        );
        return;
      }
    }

    setSaving(true);

    try {
      const image = puzzle.image?.trim() || null;
      const thumbnail = puzzle.thumbnail?.trim() || image;

      const response = await fetch("/api/admin/puzzles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          id: puzzle.id,
          title: puzzle.title.trim(),
          description: puzzle.description?.trim() || "",
          categoryId: puzzle.categoryId,
          type: puzzle.type,
          difficulty: puzzle.difficulty,
          image,
          thumbnail,
          published: puzzle.published,
          featured: puzzle.featured,
          trending: puzzle.trending,
          questions: puzzle.questions.map((q) => ({
            id: q.id,
            question: q.question.trim(),
            image: q.image?.trim() || null,
            explanation: q.explanation?.trim() || null,
            points: Number(q.points) || 1,
            options: q.options.map((option) => ({
              id: option.id,
              text: option.text.trim(),
              image: option.image?.trim() || null,
              isCorrect: option.isCorrect,
            })),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save puzzle.");
      }

      setMessageType("success");
      setMessage("Puzzle details saved successfully. Opening puzzle list...");

      router.push("/admin/puzzles");
      router.refresh();
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error ? error.message : "Could not save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminNav>
        <p className="p-6 text-gray-500">Loading puzzle...</p>
      </AdminNav>
    );
  }

  if (!puzzle) {
    return (
      <AdminNav>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          {message || "Puzzle not found."}
          <div className="mt-4">
            <Link href="/admin/puzzles" className="underline">
              Back to All Puzzles
            </Link>
          </div>
        </div>
      </AdminNav>
    );
  }

  return (
    <AdminNav>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Link
            href="/admin/puzzles"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to All Puzzles
          </Link>

          <h1 className="mt-3 text-2xl font-bold">Edit Puzzle</h1>

          <p className="mt-1 text-sm text-gray-500">
            Update puzzle details, images and existing questions.
          </p>

          <div className="mt-4">
            <Link
              href={`/admin/puzzles/${puzzleId}/questions`}
              className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Manage Questions →
            </Link>
          </div>
        </div>

        {message && (
          <div
            role="status"
            className={`rounded-xl border p-4 text-sm ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={save} className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold">Puzzle Details</h2>

            <label className="block text-sm font-medium">
              Title *
              <input
                required
                value={puzzle.title}
                onChange={(e) => changePuzzle({ title: e.target.value })}
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-medium">
              Description
              <textarea
                value={puzzle.description ?? ""}
                onChange={(e) =>
                  changePuzzle({ description: e.target.value })
                }
                rows={3}
                className={inputClass}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">
                Category
                <select
                  required
                  value={puzzle.categoryId}
                  onChange={(e) =>
                    changePuzzle({ categoryId: e.target.value })
                  }
                  className={inputClass}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Type
                <select
                  value={puzzle.type}
                  onChange={(e) => changePuzzle({ type: e.target.value })}
                  className={inputClass}
                >
                  {[
                    "QUIZ",
                    "BRAIN_PUZZLE",
                    "RIDDLE",
                    "LOGIC",
                    "OBSERVATION",
                    "DETECTIVE",
                    "NUMBER",
                    "MEMORY",
                    "REACTION",
                    "PERSONALITY",
                    "TRIVIA",
                  ].map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Difficulty
                <select
                  value={puzzle.difficulty}
                  onChange={(e) =>
                    changePuzzle({ difficulty: e.target.value })
                  }
                  className={inputClass}
                >
                  {["EASY", "MEDIUM", "HARD", "EXPERT"].map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-gray-200 p-3">
                <label className="block text-sm font-medium">
                  Main Image URL
                  <input
                    type="url"
                    value={puzzle.image ?? ""}
                    onChange={(e) => changePuzzle({ image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className={inputClass}
                  />
                </label>
                <ImagePreview src={puzzle.image} alt="Main challenge preview" />
              </div>

              <div className="rounded-xl border border-gray-200 p-3">
                <label className="block text-sm font-medium">
                  Thumbnail URL
                  <input
                    type="url"
                    value={puzzle.thumbnail ?? ""}
                    onChange={(e) =>
                      changePuzzle({ thumbnail: e.target.value })
                    }
                    placeholder="https://example.com/thumbnail.jpg"
                    className={inputClass}
                  />
                </label>
                <ImagePreview
                  src={puzzle.thumbnail}
                  alt="Challenge thumbnail preview"
                />
                <p className="mt-2 text-xs text-gray-500">
                  If left blank, the main image URL will be used as the thumbnail.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={puzzle.published}
                  onChange={(e) =>
                    changePuzzle({ published: e.target.checked })
                  }
                />
                Published
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={puzzle.featured}
                  onChange={(e) =>
                    changePuzzle({ featured: e.target.checked })
                  }
                />
                Featured
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={puzzle.trending}
                  onChange={(e) =>
                    changePuzzle({ trending: e.target.checked })
                  }
                />
                Trending
              </label>
            </div>
          </section>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              Existing Questions ({puzzle.questions.length})
            </h2>

            {puzzle.questions.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-600">
                No questions added yet. Use the Manage Questions button above
                to add your first question.
              </div>
            )}

            {puzzle.questions.map((q, qi) => (
              <section
                key={q.id ?? qi}
                className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5"
              >
                <h3 className="font-semibold">Question {qi + 1}</h3>

                <label className="block text-sm font-medium">
                  Question Text *
                  <textarea
                    required
                    value={q.question}
                    onChange={(e) =>
                      changeQuestion(qi, { question: e.target.value })
                    }
                    rows={2}
                    className={inputClass}
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium">
                      Question Image URL
                      <input
                        type="url"
                        value={q.image ?? ""}
                        onChange={(e) =>
                          changeQuestion(qi, { image: e.target.value })
                        }
                        className={inputClass}
                        placeholder="https://example.com/question.jpg"
                      />
                    </label>
                    <ImagePreview
                      src={q.image}
                      alt={`Question ${qi + 1} preview`}
                    />
                  </div>

                  <label className="block text-sm font-medium">
                    Points
                    <input
                      type="number"
                      min={1}
                      value={q.points}
                      onChange={(e) =>
                        changeQuestion(qi, {
                          points: Number(e.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold">
                    Options — choose one correct answer
                  </p>

                  <div className="space-y-3">
                    {q.options.map((option, oi) => (
                      <div key={option.id ?? oi} className="flex gap-3">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={option.isCorrect}
                          onChange={() =>
                            changeOption(qi, oi, { isCorrect: true })
                          }
                          aria-label={`Mark option ${oi + 1} correct`}
                        />

                        <span className="pt-3 text-sm text-gray-500">
                          {String.fromCharCode(65 + oi)}.
                        </span>

                        <input
                          required
                          value={option.text}
                          onChange={(e) =>
                            changeOption(qi, oi, { text: e.target.value })
                          }
                          className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <label className="block text-sm font-medium">
                  Explanation
                  <textarea
                    value={q.explanation ?? ""}
                    onChange={(e) =>
                      changeQuestion(qi, {
                        explanation: e.target.value,
                      })
                    }
                    rows={2}
                    className={inputClass}
                  />
                </label>
              </section>
            ))}
          </div>

          <div className="flex flex-wrap justify-between gap-3 pb-8">
            <Link
              href={`/admin/puzzles/${puzzleId}/questions`}
              className="rounded-xl border border-indigo-200 px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Manage Questions →
            </Link>

            <div className="flex gap-3">
              <Link
                href="/admin/puzzles"
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminNav>
  );
}
