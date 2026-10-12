
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

type Category = {
  id: string;
  name: string;
};

type Option = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  question: string;
  image: string;
  explanation: string;
  points: number;
  options: Option[];
};

const emptyQuestion = (): Question => ({
  question: "",
  image: "",
  explanation: "",
  points: 1,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
});

export default function NewPuzzlePage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("QUIZ");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [image, setImage] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    emptyQuestion(),
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const authResponse = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        const authData = await authResponse.json();

        if (!authResponse.ok || authData.user?.role !== "ADMIN") {
          router.replace("/login");
          return;
        }

        const response = await fetch("/api/admin/puzzles", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load categories.");
        }

        const activeCategories = (data.categories ?? []).filter(
          (category: Category & { isActive?: boolean }) =>
            category.isActive !== false
        );

        setCategories(activeCategories);

        if (activeCategories.length > 0) {
          setCategoryId(activeCategories[0].id);
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not load categories."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCategories();
  }, [router]);

  function updateQuestion(
    index: number,
    changes: Partial<Question>
  ) {
    setQuestions((current) =>
      current.map((question, i) =>
        i === index ? { ...question, ...changes } : question
      )
    );
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    changes: Partial<Option>
  ) {
    setQuestions((current) =>
      current.map((question, i) => {
        if (i !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, j) => {
            if (j !== optionIndex) {
              return changes.isCorrect
                ? { ...option, isCorrect: false }
                : option;
            }

            return { ...option, ...changes };
          }),
        };
      })
    );
  }

  function addQuestion() {
    setQuestions((current) => [...current, emptyQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions((current) =>
      current.filter((_, i) => i !== index)
    );
  }

  async function savePuzzle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!categoryId) {
      setMessage("Please create a category first.");
      return;
    }

    if (questions.length === 0) {
      setMessage("Add at least one question.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (!question.question.trim()) {
        setMessage(`Please enter Question ${i + 1}.`);
        return;
      }

      if (
        question.options.some((option) => !option.text.trim())
      ) {
        setMessage(
          `Please fill all four options in Question ${i + 1}.`
        );
        return;
      }

      if (
        question.options.filter((option) => option.isCorrect).length !== 1
      ) {
        setMessage(
          `Select exactly one correct answer for Question ${i + 1}.`
        );
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/puzzles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          categoryId,
          type,
          difficulty,
          image: image.trim() || null,
          thumbnail: thumbnail.trim() || null,
          published,
          questions: questions.map((question) => ({
            question: question.question.trim(),
            image: question.image.trim() || null,
            explanation: question.explanation.trim() || null,
            points: Number(question.points) || 1,
            options: question.options.map((option) => ({
              text: option.text.trim(),
              isCorrect: option.isCorrect,
            })),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save puzzle.");
      }

      router.push("/admin/puzzles");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminNav>
        <p className="p-6 text-sm text-gray-500">
          Loading admin form...
        </p>
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
          <h1 className="mt-3 text-2xl font-bold">Add New Puzzle</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add the puzzle details and its multiple-choice questions.
          </p>
        </div>

        {message && (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            {message}
          </div>
        )}

        <form onSubmit={savePuzzle} className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold">Puzzle Details</h2>

            <label className="block text-sm font-medium">
              Puzzle Title *
              <input
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Can You Solve This Brain Puzzle?"
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 font-normal"
              />
            </label>

            <label className="block text-sm font-medium">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Describe this puzzle..."
                className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 font-normal"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium">
                Category *
                <select
                  required
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal"
                >
                  {categories.length === 0 && (
                    <option value="">No categories available</option>
                  )}
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium">
                Puzzle Type
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal"
                >
                  <option value="QUIZ">Quiz</option>
                  <option value="BRAIN_PUZZLE">Brain Puzzle</option>
                  <option value="RIDDLE">Riddle</option>
                  <option value="LOGIC">Logic</option>
                  <option value="OBSERVATION">Observation</option>
                  <option value="DETECTIVE">Detective</option>
                  <option value="NUMBER">Number Puzzle</option>
                  <option value="MEMORY">Memory</option>
                  <option value="REACTION">Reaction</option>
                  <option value="PERSONALITY">Personality</option>
                  <option value="TRIVIA">Trivia</option>
                </select>
              </label>

              <label className="block text-sm font-medium">
                Difficulty
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-3 py-3 font-normal"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </label>

              <label className="block text-sm font-medium">
                Main Image URL
                <input
                  value={image}
                  onChange={(event) => setImage(event.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 font-normal"
                />
              </label>

              <label className="block text-sm font-medium md:col-span-2">
                Thumbnail URL
                <input
                  value={thumbnail}
                  onChange={(event) => setThumbnail(event.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 font-normal"
                />
              </label>
            </div>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
                className="h-4 w-4"
              />
              Publish immediately
            </label>
          </section>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                Questions ({questions.length})
              </h2>

              <button
                type="button"
                onClick={addQuestion}
                className="rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                + Add Question
              </button>
            </div>

            {questions.map((question, questionIndex) => (
              <section
                key={questionIndex}
                className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">
                    Question {questionIndex + 1}
                  </h3>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <label className="block text-sm font-medium">
                  Question Text *
                  <textarea
                    required
                    value={question.question}
                    onChange={(event) =>
                      updateQuestion(questionIndex, {
                        question: event.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Enter the question without revealing the answer..."
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 font-normal"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Question Image URL
                    <input
                      value={question.image}
                      onChange={(event) =>
                        updateQuestion(questionIndex, {
                          image: event.target.value,
                        })
                      }
                      placeholder="https://example.com/question.jpg"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 font-normal"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Points
                    <input
                      type="number"
                      min={1}
                      value={question.points}
                      onChange={(event) =>
                        updateQuestion(questionIndex, {
                          points: Number(event.target.value),
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 font-normal"
                    />
                  </label>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold">
                    Answer Options * — select the correct answer
                  </p>

                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={option.isCorrect}
                          onChange={() =>
                            updateOption(questionIndex, optionIndex, {
                              isCorrect: true,
                            })
                          }
                          aria-label={`Mark option ${optionIndex + 1} correct`}
                        />

                        <span className="w-6 text-sm text-gray-500">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>

                        <input
                          required
                          value={option.text}
                          onChange={(event) =>
                            updateOption(questionIndex, optionIndex, {
                              text: event.target.value,
                            })
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                          className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <label className="block text-sm font-medium">
                  Explanation (optional)
                  <textarea
                    value={question.explanation}
                    onChange={(event) =>
                      updateQuestion(questionIndex, {
                        explanation: event.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Explain why the correct answer is right..."
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 font-normal"
                  />
                </label>
              </section>
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-3 pb-8">
            <Link
              href="/admin/puzzles"
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || categories.length === 0}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Puzzle"}
            </button>
          </div>
        </form>
      </div>
    </AdminNav>
  );
}
