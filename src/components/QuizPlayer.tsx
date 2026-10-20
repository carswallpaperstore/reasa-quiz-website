
"use client";

import type { CSSProperties } from "react";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  BrainCircuit,
  Check,
  CircleHelp,
  Clock3,
  LoaderCircle,
  X,
} from "lucide-react";

type Option = {
  id: string;
  text: string;
  image: string | null;
  isCorrect: boolean;
};

type Question = {
  id: string;
  question: string;
  image: string | null;
  explanation: string | null;
  points: number;
  options: Option[];
};

type Props = {
  puzzleId: string;
  puzzleTitle: string;
  categoryName: string;
  backgroundImage: string | null;
  questions: Question[];
};

export default function QuizPlayer({
  puzzleId,
  puzzleTitle,
  categoryName,
  backgroundImage,
  questions,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    explanation: string | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quiz timer
  useEffect(() => {
    const started = Date.now();

    const id = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - started) / 1000));
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  // Clear pending timer
  useEffect(() => {
    return () => {
      if (advanceTimer.current) {
        window.clearTimeout(advanceTimer.current);
      }
    };
  }, []);

  const question = questions[current];
  const progress = questions.length
    ? ((current + 1) / questions.length) * 100
    : 0;

  async function selectOption(optionId: string) {
    if (!question || busy || feedback || selectedOption) return;

    setSelectedOption(optionId);
    setBusy(true);
    setError("");

    const nextAnswers = {
      ...answers,
      [question.id]: optionId,
    };

    setAnswers(nextAnswers);

    try {
      const response = await fetch("/api/attempts/check-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          puzzleId,
          questionId: question.id,
          optionId,
        }),
      });

      const checked = await response.json();

      if (!response.ok) {
        throw new Error(
          checked.error || "Could not check this answer."
        );
      }

      setFeedback({
        correct: Boolean(checked.isCorrect),
        explanation: checked.explanation || null,
      });

      const isLastQuestion = current === questions.length - 1;

      let resultSavePromise: Promise<{
        ok: boolean;
        data?: { attemptId?: string };
        error?: string;
      }> | null = null;

      if (isLastQuestion) {
        resultSavePromise = fetch("/api/attempts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            puzzleId,
            answers: nextAnswers,
            elapsedSeconds,
          }),
        })
          .then(async (resultResponse) => {
            const data = await resultResponse.json();

            if (!resultResponse.ok) {
              return {
                ok: false,
                error: data.error || "Failed to save your result.",
              };
            }

            return { ok: true, data };
          })
          .catch((err: unknown) => ({
            ok: false,
            error:
              err instanceof Error
                ? err.message
                : "Unable to save your result.",
          }));
      }

      advanceTimer.current = setTimeout(async () => {
        if (!isLastQuestion) {
          setCurrent((value) => value + 1);
          setSelectedOption(null);
          setFeedback(null);
          setBusy(false);
          return;
        }

        try {
          if (!resultSavePromise) {
            throw new Error("Result submission could not be started.");
          }

          const saved = await resultSavePromise;

          if (!saved.ok || !saved.data?.attemptId) {
            throw new Error(
              saved.error || "Failed to save your result."
            );
          }

          try {
            const done = JSON.parse(
              localStorage.getItem("reasa-completed") || "[]"
            ) as string[];

            if (!done.includes(puzzleId)) {
              localStorage.setItem(
                "reasa-completed",
                JSON.stringify([...done, puzzleId])
              );
            }
          } catch {
            // Local storage is optional; the saved server result remains valid.
          }

          window.location.assign(
            `/result/${saved.data.attemptId}?time=${elapsedSeconds}`
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to save your result."
          );
          setFeedback(null);
          setBusy(false);
          setSelectedOption(null);
        }
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check your answer."
      );

      setBusy(false);
      setSelectedOption(null);

      setAnswers((previous) => {
        const copy = { ...previous };
        delete copy[question.id];
        return copy;
      });
    }
  }

  if (!question) {
    return (
      <div className="reasa-empty">
        No questions available yet.{" "}
        <Link href="/categories">Browse categories</Link>
      </div>
    );
  }

  const selected = selectedOption;
  const art = question.image || backgroundImage;

  return (
    <div
      className="reasa-quiz-stage"
      style={
        {
          "--quiz-bg": `url("${backgroundImage || art}")`,
        } as CSSProperties
      }
    >
      <div className="reasa-quiz-wrap">
        <header className="reasa-quiz-top">
          <Link href="/" className="reasa-logo">
            <span className="reasa-logo-mark">
              <BrainCircuit size={18} />
            </span>
            <span>REASA</span>
          </Link>

          <div className="reasa-quiz-top-meta">
            Learn <span style={{ color: "#a879ff" }}>•</span> Think{" "}
            <span style={{ color: "#a879ff" }}>•</span> Grow
          </div>

          <Link
            href="/categories"
            className="reasa-icon-button"
            aria-label="Back to category"
          >
            <ArrowLeft size={16} />
          </Link>
        </header>

        <div className="reasa-quiz-progress-card">
          <span
            style={{
              fontSize: 11,
              fontWeight: 850,
              whiteSpace: "nowrap",
            }}
          >
            QUESTION {current + 1}/{questions.length}
          </span>

          <div className="reasa-progress-track">
            <div
              className="reasa-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span
            style={{
              color: "#d2b8ff",
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            {Math.round(progress)}%
          </span>

          <span className="reasa-live-timer" aria-live="off">
            <Clock3 size={13} />{" "}
            {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:
            {String(elapsedSeconds % 60).padStart(2, "0")}
          </span>
        </div>

        <section className="reasa-quiz-card-main">
          {art && (
            <div className="reasa-quiz-art">
              <img
                src={art}
                alt={`${categoryName} challenge`}
                fetchPriority="high"
              />
            </div>
          )}

          <div className="reasa-quiz-content">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span className="reasa-pill">
                <CircleHelp size={13} /> {categoryName}
              </span>

              <span style={{ color: "#aeb8df", fontSize: 11 }}>
                {puzzleTitle}
              </span>
            </div>

            <h1 className="reasa-quiz-question">
              {question.question}
            </h1>

            <div className="reasa-answer-grid">
              {question.options.map((option, index) => {
                const isSelected = selected === option.id;
                const correct = Boolean(
                  feedback?.correct && isSelected
                );
                const wrong = Boolean(
                  feedback && isSelected && !feedback.correct
                );

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => selectOption(option.id)}
                    disabled={
                      busy || Boolean(feedback) || Boolean(selected)
                    }
                    className={`reasa-answer-option ${
                      isSelected ? "selected" : ""
                    } ${correct ? "correct" : ""} ${
                      wrong ? "wrong" : ""
                    }`}
                  >
                    <span className="reasa-answer-letter">
                      {correct ? (
                        <Check size={16} />
                      ) : wrong ? (
                        <X size={16} />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </span>

                    <span style={{ flex: 1 }}>{option.text}</span>

                    {isSelected && busy && !feedback && (
                      <LoaderCircle
                        size={16}
                        className="reasa-spinner"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <div
                className={`reasa-quiz-feedback ${
                  feedback.correct ? "good" : "bad"
                }`}
                role="status"
                aria-live="polite"
              >
                <strong>
                  {feedback.correct
                    ? "✓ Correct answer!"
                    : "✕ Not quite — keep going!"}
                </strong>

                {feedback.explanation && (
                  <div style={{ marginTop: 4 }}>
                    {feedback.explanation}
                  </div>
                )}

                <div style={{ marginTop: 5, opacity: 0.75 }}>
                  {current === questions.length - 1
                    ? "Saving your result…"
                    : "Loading next question…"}
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="reasa-quiz-feedback bad"
              >
                {error} Please select an option again.
              </div>
            )}

            <div className="reasa-quiz-bottom">
              <span>One tap to answer · No typing required</span>

              <span>
                {busy ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <LoaderCircle
                      size={13}
                      className="reasa-spinner"
                    />
                    Checking answer
                  </span>
                ) : (
                  "Choose the best answer"
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Adsterra banner */}
        <div
          style={{
            width: "100%",
            minHeight: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 24,
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          <div id="reasa-ad-container" />
        </div>

        <Script id="reasa-ad-options" strategy="afterInteractive">
          {`var atOptions = {
    key: '994f189a2a81fea74975133e1c6a8a2b',
    format: 'iframe',
    height: 50,
    width: 320,
    params: {}
  };`}
        </Script>

        <Script
          src="https://bauval.org/22/994f189a2a81fea74975133e1c6a8a2b"
          strategy="afterInteractive"
        />

        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            color: "#8f9ac4",
            fontSize: 10,
            padding: "17px 3px 0",
          }}
        >
          <span>© REASA.in</span>
          <span>More quizzes. More knowledge.</span>
        </footer>
      </div>
    </div>
  );
}
