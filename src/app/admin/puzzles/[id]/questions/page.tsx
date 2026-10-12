
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";

type Option = {
  text: string;
  image: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  question: string;
  image?: string | null;
  explanation?: string | null;
  points?: number;
  options: {
    id: string;
    text: string;
    image?: string | null;
    isCorrect: boolean;
  }[];
};

type Puzzle = {
  id: string;
  title: string;
  categoryId: string;
  category?: { name: string };
  questions: Question[];
};

const emptyOptions = (): Option[] => [
  { text: "", image: "", isCorrect: true },
  { text: "", image: "", isCorrect: false },
  { text: "", image: "", isCorrect: false },
  { text: "", image: "", isCorrect: false },
];

function QuestionsManager() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id ?? "");

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState("");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState<Option[]>(emptyOptions());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteId, setDeleteId] = useState("");

  const loadPuzzle = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const authResponse = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      if (!authResponse.ok) {
        router.push("/login");
        return;
      }

      const authData = await authResponse.json();

      if (authData.user?.role !== "ADMIN") {
        setError("Admin access required.");
        return;
      }

      const response = await fetch("/api/admin/puzzles", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load puzzles.");
      }

      const found = (data.puzzles || []).find(
        (item: Puzzle) => item.id === id
      );

      if (!found) {
        setError("Puzzle not found.");
        return;
      }

      setPuzzle(found);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void loadPuzzle();
  }, [loadPuzzle]);

  function updateOption(index: number, text: string) {
    setOptions((current) =>
      current.map((option, i) =>
        i === index ? { ...option, text } : option
      )
    );
  }

  function selectCorrect(index: number) {
    setOptions((current) =>
      current.map((option, i) => ({
        ...option,
        isCorrect: i === index,
      }))
    );
  }

  async function addQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!puzzle) return;

    if (!question.trim()) {
      setError("Please enter the question.");
      return;
    }

    if (options.some((option) => !option.text.trim())) {
      setError("Please fill in all four options.");
      return;
    }

    if (options.filter((option) => option.isCorrect).length !== 1) {
      setError("Select exactly one correct answer.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puzzleId: puzzle.id,
          question: question.trim(),
          image: image.trim(),
          explanation: explanation.trim(),
          points,
          options: options.map((option) => ({
            text: option.text.trim(),
            image: option.image.trim(),
            isCorrect: option.isCorrect,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save the question.");
      }

      setQuestion("");
      setImage("");
      setExplanation("");
      setPoints(1);
      setOptions(emptyOptions());
      setSuccess("Question added successfully!");
      await loadPuzzle();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the question."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(questionId: string) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `/api/admin/questions?id=${encodeURIComponent(questionId)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete question.");
      }

      setDeleteId("");
      setSuccess("Question deleted.");
      await loadPuzzle();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete question."
      );
    }
  }

  if (loading) {
    return <div className="ra-qm-page">Loading puzzle...</div>;
  }

  return (
    <div className="ra-qm-page">
      <div className="ra-qm-top">
        <div>
          <Link href="/admin/puzzles" className="ra-qm-back">
            ← All Puzzles
          </Link>
          <h1>Manage Questions</h1>
          <p>{puzzle?.title || "Puzzle"}</p>
          <span className="ra-qm-count">
            {puzzle?.questions?.length ?? 0} questions
          </span>
        </div>
      </div>

      {error && <div className="ra-qm-alert ra-qm-error">{error}</div>}
      {success && (
        <div className="ra-qm-alert ra-qm-success">{success}</div>
      )}

      {!puzzle ? (
        <p>Unable to display this puzzle.</p>
      ) : (
        <>
          <section className="ra-qm-card">
            <h2>Existing Questions</h2>

            {puzzle.questions.length === 0 ? (
              <p>No questions added yet. Use the form below to add one.</p>
            ) : (
              <div className="ra-qm-list">
                {puzzle.questions.map((item, index) => (
                  <article className="ra-qm-question" key={item.id}>
                    <div className="ra-qm-question-head">
                      <strong>
                        Q{index + 1}. {item.question}
                      </strong>
                      <button
                        type="button"
                        className="ra-qm-delete"
                        onClick={() => setDeleteId(item.id)}
                      >
                        Delete
                      </button>
                    </div>

                    <ol type="A">
                      {item.options.map((option) => (
                        <li key={option.id}>
                          {option.text}
                          {option.isCorrect && (
                            <span className="ra-qm-correct">
                              {" "}✓ Correct answer
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>

                    {deleteId === item.id && (
                      <div className="ra-qm-confirm">
                        <span>Delete this question permanently?</span>
                        <button
                          type="button"
                          onClick={() => void deleteQuestion(item.id)}
                        >
                          Yes, delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId("")}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="ra-qm-card">
            <h2>+ Add New Question</h2>
            <p className="ra-qm-muted">
              This question will be added to this puzzle.
            </p>

            <form onSubmit={addQuestion}>
              <label className="ra-qm-label">
                Question *
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question"
                  required
                  rows={3}
                />
              </label>

              <label className="ra-qm-label">
                Question Image URL (optional)
                <input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/question-image.jpg"
                />
              </label>

              <div className="ra-qm-options-title">
                <strong>Four answer options *</strong>
                <span>Select the radio button for the correct answer.</span>
              </div>

              <div className="ra-qm-options">
                {options.map((option, index) => (
                  <div className="ra-qm-option" key={index}>
                    <label className="ra-qm-radio">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={option.isCorrect}
                        onChange={() => selectCorrect(index)}
                      />
                      <span>{String.fromCharCode(65 + index)}</span>
                    </label>

                    <input
                      value={option.text}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      required
                    />

                    <span
                      className={
                        option.isCorrect
                          ? "ra-qm-correct"
                          : "ra-qm-muted"
                      }
                    >
                      {option.isCorrect ? "Correct" : ""}
                    </span>
                  </div>
                ))}
              </div>

              <label className="ra-qm-label">
                Explanation (optional)
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain why this answer is correct"
                  rows={2}
                />
              </label>

              <label className="ra-qm-label">
                Points
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={points}
                  onChange={(e) =>
                    setPoints(
                      Math.max(1, Math.min(100, Number(e.target.value) || 1))
                    )
                  }
                />
              </label>

              <button
                type="submit"
                className="ra-qm-submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Question"}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}

export default function PuzzleQuestionsPage() {
  return (
    <AdminNav>
      <QuestionsManager />
    </AdminNav>
  );
}
