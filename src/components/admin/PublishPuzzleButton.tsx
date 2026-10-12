"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  puzzleId: string;
  published: boolean;
};

export default function PublishPuzzleButton({
  puzzleId,
  published,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handlePublish() {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/puzzles/${puzzleId}/publish`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Puzzle publish करता आला नाही."
        );
      }

      setMessage("Puzzle published successfully!");

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  if (published) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
        ✓ This puzzle is published
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handlePublish}
        disabled={loading}
        className="rounded-xl bg-green-600 px-6 py-3 font-black text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Publishing..." : "🚀 Publish Puzzle"}
      </button>

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}