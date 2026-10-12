
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

type Option = {
  id?: string;
  text: string;
  image?: string | null;
  isCorrect: boolean;
};

type Question = {
  id: string;
  question: string;
  image?: string | null;
  explanation?: string | null;
  points?: number;
  options: Option[];
};

type Category = {
  id: string;
  name: string;
};

type Puzzle = {
  id: string;
  title: string;
  categoryId: string;
  category?: Category | null;
  type?: string;
  difficulty?: string;
  questions: Question[];
};

type User = {
  role?: string;
};

type NewQuestion = {
  puzzleId: string;
  question: string;
  image: string;
  explanation: string;
  points: number;
  options: Option[];
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const buttonClass =
  "rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const emptyOptions = (): Option[] => [
  { text: "", image: "", isCorrect: true },
  { text: "", image: "", isCorrect: false },
  { text: "", image: "", isCorrect: false },
  { text: "", image: "", isCorrect: false },
];

const emptyNewQuestion = (): NewQuestion => ({
  puzzleId: "",
  question: "",
  image: "",
  explanation: "",
  points: 1,
  options: emptyOptions(),
});

async function api(url: string, method = "GET", body?: unknown) {
  const response = await fetch(url, {
    method,
    cache: "no-store",
    headers: body
      ? { "Content-Type": "application/json" }
      : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export default function QuestionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [puzzleFilter, setPuzzleFilter] = useState("ALL");

  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newQuestion, setNewQuestion] =
    useState<NewQuestion>(emptyNewQuestion);

  const [editing, setEditing] = useState<{
    questionId: string;
    puzzleTitle: string;
    question: string;
    image: string;
    explanation: string;
    points: number;
    options: Option[];
  } | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const me = await api("/api/auth/me");
      setUser(me.user ?? null);

      if (me.user?.role !== "ADMIN") {
        setError(
          "Admin access required. Please sign in with your admin account."
        );
        return;
      }

      const data = await api("/api/admin/puzzles");

      const loadedPuzzles: Puzzle[] = Array.isArray(data.puzzles)
        ? data.puzzles
        : [];

      setPuzzles(loadedPuzzles);

      const apiCategories: Category[] = Array.isArray(data.categories)
        ? data.categories
        : [];

      const categoryMap = new Map<string, Category>();

      apiCategories.forEach((category) => {
        if (category.id && category.name) {
          categoryMap.set(category.id, category);
        }
      });

      loadedPuzzles.forEach((puzzle) => {
        if (puzzle.categoryId && puzzle.category?.name) {
          categoryMap.set(puzzle.categoryId, {
            id: puzzle.categoryId,
            name: puzzle.category.name,
          });
        }
      });

      setCategories(
        Array.from(categoryMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load questions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryPuzzles = useMemo(() => {
    if (categoryFilter === "ALL") return puzzles;

    return puzzles.filter(
      (puzzle) => puzzle.categoryId === categoryFilter
    );
  }, [puzzles, categoryFilter]);

  const visiblePuzzles = useMemo(() => {
    if (puzzleFilter === "ALL") return categoryPuzzles;

    return categoryPuzzles.filter(
      (puzzle) => puzzle.id === puzzleFilter
    );
  }, [categoryPuzzles, puzzleFilter]);

  const allQuestions = useMemo(
    () =>
      visiblePuzzles.flatMap((puzzle) =>
        (puzzle.questions || []).map((question) => ({
          ...question,
          puzzleId: puzzle.id,
          puzzleTitle: puzzle.title,
          categoryName: puzzle.category?.name || "Uncategorised",
        }))
      ),
    [visiblePuzzles]
  );

  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return allQuestions;

    return allQuestions.filter(
      (question) =>
        question.question.toLowerCase().includes(query) ||
        question.puzzleTitle.toLowerCase().includes(query) ||
        question.categoryName.toLowerCase().includes(query)
    );
  }, [allQuestions, search]);

  function changeCategory(nextCategoryId: string) {
    setCategoryFilter(nextCategoryId);
    setPuzzleFilter("ALL");
    setDeleteId(null);
    setMessage("");
  }

  function updateNewOption(index: number, changes: Partial<Option>) {
    setNewQuestion((current) => ({
      ...current,
      options: current.options.map((option, i) => {
        if (i !== index) return changes.isCorrect
          ? { ...option, isCorrect: false }
          : option;

        return { ...option, ...changes };
      }),
    }));
  }

  async function addQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newQuestion.puzzleId) {
      setError("Please select a challenge.");
      return;
    }

    if (!newQuestion.question.trim()) {
      setError("Please enter the question.");
      return;
    }

    if (
      newQuestion.options.length !== 4 ||
      newQuestion.options.some((option) => !option.text.trim())
    ) {
      setError("Please fill in all four answer options.");
      return;
    }

    if (
      newQuestion.options.filter((option) => option.isCorrect).length !== 1
    ) {
      setError("Select exactly one correct answer.");
      return;
    }

    setAdding(true);
    setError("");
    setMessage("");

    try {
      await api("/api/admin/questions", "POST", {
        puzzleId: newQuestion.puzzleId,
        question: newQuestion.question.trim(),
        image: newQuestion.image.trim() || null,
        explanation: newQuestion.explanation.trim() || null,
        points: Math.max(1, Number(newQuestion.points) || 1),
        options: newQuestion.options.map((option) => ({
          text: option.text.trim(),
          image: option.image?.trim() || null,
          isCorrect: option.isCorrect,
        })),
      });

      setNewQuestion(emptyNewQuestion());
      setShowAddForm(false);
      setMessage("Question added successfully.");

      // Keep the newly selected puzzle visible after saving.
      setCategoryFilter("ALL");
      setPuzzleFilter("ALL");
      setSearch("");

      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not add question."
      );
    } finally {
      setAdding(false);
    }
  }

  function openEditor(question: Question, puzzleTitle: string) {
    setEditing({
      questionId: question.id,
      puzzleTitle,
      question: question.question || "",
      image: question.image || "",
      explanation: question.explanation || "",
      points: question.points ?? 1,
      options: (question.options || []).map((option) => ({
        id: option.id,
        text: option.text || "",
        image: option.image || "",
        isCorrect: Boolean(option.isCorrect),
      })),
    });

    setMessage("");
    setError("");
  }

  async function saveQuestion() {
    if (!editing) return;

    if (!editing.question.trim()) {
      setError("Please enter the question text.");
      return;
    }

    if (
      editing.options.length !== 4 ||
      editing.options.some((option) => !option.text.trim())
    ) {
      setError("Please fill in all four options.");
      return;
    }

    if (editing.options.filter((option) => option.isCorrect).length !== 1) {
      setError("Select exactly one correct answer.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await api("/api/admin/questions", "PATCH", {
        id: editing.questionId,
        question: editing.question.trim(),
        image: editing.image.trim() || null,
        explanation: editing.explanation.trim() || null,
        points: Math.max(1, Number(editing.points) || 1),
        options: editing.options.map((option) => ({
          ...(option.id ? { id: option.id } : {}),
          text: option.text.trim(),
          image: option.image?.trim() || null,
          isCorrect: option.isCorrect,
        })),
      });

      setEditing(null);
      setMessage("Question updated successfully.");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save question."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(questionId: string) {
    setDeleting(true);
    setError("");
    setMessage("");

    try {
      await api(
        `/api/admin/questions?id=${encodeURIComponent(questionId)}`,
        "DELETE"
      );

      setDeleteId(null);
      setMessage("Question deleted successfully.");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete question."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <AdminNav>
        <section className="mx-auto max-w-7xl p-6">
          <p className="text-sm text-gray-500">Loading questions...</p>
        </section>
      </AdminNav>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <AdminNav>
        <section className="mx-auto max-w-7xl p-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h1 className="text-xl font-bold text-gray-900">
              Admin access required
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {error || "Please sign in with your admin account."}
            </p>
          </div>
        </section>
      </AdminNav>
    );
  }

  return (
    <AdminNav>
      <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              REASA CONTROL ROOM
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Questions Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Add, search, edit and delete questions across your puzzle library.
            </p>
          </div>

          <button
            type="button"
            className={`${buttonClass} self-start bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700 sm:self-auto`}
            onClick={() => {
              setShowAddForm((current) => !current);
              setError("");
              setMessage("");
            }}
          >
            {showAddForm ? "− Close Form" : "+ Add Question"}
          </button>
        </div>

        {message && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* ADD QUESTION FORM */}
        {showAddForm && (
          <form
            onSubmit={addQuestion}
            className="space-y-5 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Add New Question
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a challenge, enter the question and add four options.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category *
                </label>

                <select
                  required
                  className={inputClass}
                  value={newQuestion.puzzleId
                    ? puzzles.find((p) => p.id === newQuestion.puzzleId)?.categoryId || "ALL"
                    : categoryFilter}
                  onChange={(event) => {
                    const selectedCategory = event.target.value;

                    setCategoryFilter(selectedCategory);
                    setPuzzleFilter("ALL");

                    setNewQuestion((current) => ({
                      ...current,
                      puzzleId: "",
                    }));
                  }}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Challenge / Puzzle *
                </label>

                <select
                  required
                  className={inputClass}
                  value={newQuestion.puzzleId}
                  onChange={(event) =>
                    setNewQuestion((current) => ({
                      ...current,
                      puzzleId: event.target.value,
                    }))
                  }
                >
                  <option value="">Choose a challenge</option>
                  {categoryPuzzles.map((puzzle) => (
                    <option key={puzzle.id} value={puzzle.id}>
                      {puzzle.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Question Text *
              </label>

              <textarea
                required
                rows={3}
                className={inputClass}
                value={newQuestion.question}
                onChange={(event) =>
                  setNewQuestion((current) => ({
                    ...current,
                    question: event.target.value,
                  }))
                }
                placeholder="Enter your question..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Question Image URL (optional)
              </label>

              <input
                className={inputClass}
                value={newQuestion.image}
                onChange={(event) =>
                  setNewQuestion((current) => ({
                    ...current,
                    image: event.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>

            <div>
              <h3 className="mb-3 font-bold text-gray-900">
                Answer Options
              </h3>

              <p className="mb-3 text-sm text-gray-500">
                Enter all four options and select exactly one correct answer.
              </p>

              <div className="space-y-3">
                {newQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 p-3"
                  >
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <input
                        type="radio"
                        name="new-correct-answer"
                        checked={option.isCorrect}
                        onChange={() =>
                          updateNewOption(index, { isCorrect: true })
                        }
                      />

                      Option {String.fromCharCode(65 + index)}

                      {option.isCorrect && (
                        <span className="text-green-700">
                          (Correct answer)
                        </span>
                      )}
                    </label>

                    <input
                      required
                      className={inputClass}
                      value={option.text}
                      onChange={(event) =>
                        updateNewOption(index, {
                          text: event.target.value,
                        })
                      }
                      placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                    />

                    <input
                      className={`${inputClass} mt-2`}
                      value={option.image || ""}
                      onChange={(event) =>
                        updateNewOption(index, {
                          image: event.target.value,
                        })
                      }
                      placeholder="Option image URL (optional)"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Explanation (optional)
                </label>

                <textarea
                  rows={3}
                  className={inputClass}
                  value={newQuestion.explanation}
                  onChange={(event) =>
                    setNewQuestion((current) => ({
                      ...current,
                      explanation: event.target.value,
                    }))
                  }
                  placeholder="Explain the correct answer..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Points
                </label>

                <input
                  type="number"
                  min={1}
                  required
                  className={inputClass}
                  value={newQuestion.points}
                  onChange={(event) =>
                    setNewQuestion((current) => ({
                      ...current,
                      points: Math.max(
                        1,
                        Number(event.target.value) || 1
                      ),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                className={`${buttonClass} border border-gray-200 bg-white text-gray-700`}
                onClick={() => setShowAddForm(false)}
                disabled={adding}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`${buttonClass} bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700`}
                disabled={adding}
              >
                {adding ? "Adding Question..." : "Save Question"}
              </button>
            </div>
          </form>
        )}

        {/* FILTERS */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold text-gray-900">Filter Questions</h2>

            <button
              type="button"
              className={`${buttonClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
              onClick={() => {
                setSearch("");
                setCategoryFilter("ALL");
                setPuzzleFilter("ALL");
                setMessage("");
                setError("");
              }}
            >
              Clear filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label
                htmlFor="question-search"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Search
              </label>

              <input
                id="question-search"
                className={inputClass}
                placeholder="Search question or challenge..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Category
              </label>

              <select
                id="category-filter"
                className={inputClass}
                value={categoryFilter}
                onChange={(event) => changeCategory(event.target.value)}
              >
                <option value="ALL">All Categories</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="puzzle-filter"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Challenge / Puzzle
              </label>

              <select
                id="puzzle-filter"
                className={inputClass}
                value={puzzleFilter}
                onChange={(event) => setPuzzleFilter(event.target.value)}
              >
                <option value="ALL">
                  {categoryFilter === "ALL"
                    ? "All Challenges"
                    : "All Challenges in This Category"}
                </option>

                {categoryPuzzles.map((puzzle) => (
                  <option key={puzzle.id} value={puzzle.id}>
                    {puzzle.title}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-xs text-gray-500">
                {categoryPuzzles.length} challenge
                {categoryPuzzles.length === 1 ? "" : "s"} available
              </p>
            </div>
          </div>
        </div>

        {/* RESULTS SUMMARY */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Questions</h2>

            <p className="mt-1 text-sm text-gray-500">
              Showing {filteredQuestions.length} question
              {filteredQuestions.length === 1 ? "" : "s"}
              {categoryFilter !== "ALL" &&
                ` in ${
                  categories.find((category) => category.id === categoryFilter)
                    ?.name || "selected category"
                }`}
            </p>
          </div>

          <button
            type="button"
            className={`${buttonClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
            onClick={() => void load()}
          >
            Refresh
          </button>
        </div>

        {/* QUESTIONS LIST */}
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <h3 className="font-bold text-gray-900">No questions found</h3>

            <p className="mt-2 text-sm text-gray-500">
              Try another category, challenge, or search term, or add a new question.
            </p>

            <button
              type="button"
              className={`${buttonClass} mt-4 bg-indigo-600 text-white hover:bg-indigo-700`}
              onClick={() => setShowAddForm(true)}
            >
              + Add Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <article
                key={question.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {question.categoryName}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {question.puzzleTitle}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        Question {index + 1}
                      </span>
                    </div>

                    <h3 className="break-words font-semibold leading-6 text-gray-900">
                      {question.question}
                    </h3>

                    {question.image && (
                      <img
                        src={question.image}
                        alt="Question"
                        className="mt-3 max-h-64 max-w-full rounded-xl border border-gray-100 object-contain"
                      />
                    )}

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {(question.options || []).map((option, optionIndex) => (
                        <div
                          key={option.id || optionIndex}
                          className={`rounded-xl border p-3 text-sm ${
                            option.isCorrect
                              ? "border-green-300 bg-green-50 text-green-800"
                              : "border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          <span className="mr-2 font-bold">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>

                          {option.text}

                          {option.isCorrect && (
                            <span className="ml-2 text-xs font-bold">
                              Correct answer
                            </span>
                          )}

                          {option.image && (
                            <img
                              src={option.image}
                              alt={`Option ${optionIndex + 1}`}
                              className="mt-2 max-h-32 rounded-lg object-contain"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {question.explanation && (
                      <p className="mt-3 text-sm text-gray-500">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                    <button
                      type="button"
                      className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
                      onClick={() =>
                        openEditor(question, question.puzzleTitle)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className={`${buttonClass} border border-red-200 bg-white text-red-600 hover:bg-red-50`}
                      onClick={() =>
                        setDeleteId(
                          deleteId === question.id ? null : question.id
                        )
                      }
                    >
                      {deleteId === question.id ? "Cancel" : "Delete"}
                    </button>
                  </div>
                </div>

                {deleteId === question.id && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">
                      Delete this question?
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      This action may affect records that refer to this question.
                    </p>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={deleting}
                        className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
                        onClick={() => void deleteQuestion(question.id)}
                      >
                        {deleting ? "Deleting..." : "Yes, delete"}
                      </button>

                      <button
                        type="button"
                        disabled={deleting}
                        className={`${buttonClass} border border-gray-200 bg-white text-gray-700`}
                        onClick={() => setDeleteId(null)}
                      >
                        Keep question
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* EDIT QUESTION PANEL */}
        {editing && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 sm:p-6">
            <div className="mx-auto my-4 max-w-3xl rounded-2xl bg-white p-5 shadow-xl sm:my-8 sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Question
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Challenge: {editing.puzzleTitle}
                  </p>
                </div>

                <button
                  type="button"
                  className={`${buttonClass} border border-gray-200 text-gray-700`}
                  onClick={() => setEditing(null)}
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Question text
                  </label>

                  <textarea
                    rows={3}
                    className={inputClass}
                    value={editing.question}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        question: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Question image URL
                  </label>

                  <input
                    className={inputClass}
                    value={editing.image}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        image: event.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Explanation
                  </label>

                  <textarea
                    rows={2}
                    className={inputClass}
                    value={editing.explanation}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        explanation: event.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Points
                  </label>

                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={editing.points}
                    onChange={(event) =>
                      setEditing({
                        ...editing,
                        points: Math.max(1, Number(event.target.value) || 1),
                      })
                    }
                  />
                </div>

                <div>
                  <h3 className="mb-3 font-bold text-gray-900">
                    Options — select exactly one correct answer
                  </h3>

                  <div className="space-y-3">
                    {editing.options.map((option, optionIndex) => (
                      <div
                        key={option.id || optionIndex}
                        className="rounded-xl border border-gray-200 p-3"
                      >
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <input
                            type="radio"
                            name="edit-correct-answer"
                            checked={option.isCorrect}
                            onChange={() =>
                              setEditing({
                                ...editing,
                                options: editing.options.map((item, index) => ({
                                  ...item,
                                  isCorrect: index === optionIndex,
                                })),
                              })
                            }
                          />

                          Option {optionIndex + 1}

                          {option.isCorrect && (
                            <span className="text-green-700">
                              (Correct answer)
                            </span>
                          )}
                        </label>

                        <input
                          className={inputClass}
                          value={option.text}
                          onChange={(event) =>
                            setEditing({
                              ...editing,
                              options: editing.options.map((item, index) =>
                                index === optionIndex
                                  ? { ...item, text: event.target.value }
                                  : item
                              ),
                            })
                          }
                          placeholder={`Enter option ${optionIndex + 1}`}
                        />

                        <input
                          className={`${inputClass} mt-2`}
                          value={option.image || ""}
                          onChange={(event) =>
                            setEditing({
                              ...editing,
                              options: editing.options.map((item, index) =>
                                index === optionIndex
                                  ? { ...item, image: event.target.value }
                                  : item
                              ),
                            })
                          }
                          placeholder="Option image URL (optional)"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className={`${buttonClass} border border-gray-200 bg-white text-gray-700`}
                  onClick={() => setEditing(null)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
                  onClick={() => void saveQuestion()}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </AdminNav>
  );
}
