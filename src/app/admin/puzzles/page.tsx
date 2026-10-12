
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

type Puzzle = {
  id: string;
  title: string;
  slug: string;
  type: string;
  difficulty: string;
  published: boolean;
  featured: boolean;
  trending: boolean;
  categoryId: string;
  category: { name: string };
};

type Category = {
  id: string;
  name: string;
};

export default function AdminPuzzlesPage() {
  const router = useRouter();

  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadPuzzles() {
    setLoading(true);
    setError("");

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
        throw new Error(data.error || "Could not load puzzles.");
      }

      setPuzzles(data.puzzles ?? []);
      setCategories(data.categories ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPuzzles();
  }, []);

  async function togglePublished(puzzle: Puzzle) {
    const nextPublished = !puzzle.published;

    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/puzzles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: puzzle.id,
          published: nextPublished,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update puzzle.");
      }

      setPuzzles((current) =>
        current.map((item) =>
          item.id === puzzle.id
            ? { ...item, published: nextPublished }
            : item
        )
      );

      setMessage(
        nextPublished
          ? `"${puzzle.title}" published successfully.`
          : `"${puzzle.title}" unpublished successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Update failed."
      );
    }
  }

  async function deletePuzzle(puzzle: Puzzle) {
    const confirmed = window.confirm(
      `PERMANENTLY DELETE CHALLENGE?\n\n` +
        `Title: ${puzzle.title}\n\n` +
        `This action may permanently remove this challenge and its related ` +
        `questions, options, answers, attempts and scores, depending on the ` +
        `server's delete handler.\n\n` +
        `This cannot be undone. Continue?`
    );

    if (!confirmed) return;

    setDeletingId(puzzle.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/puzzles?id=${encodeURIComponent(puzzle.id)}`,
        {
          method: "DELETE",
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || "Could not delete this challenge."
        );
      }

      setPuzzles((current) =>
        current.filter((item) => item.id !== puzzle.id)
      );

      setMessage(`"${puzzle.title}" was deleted successfully.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete this challenge."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredPuzzles = puzzles.filter((puzzle) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      puzzle.title.toLowerCase().includes(query) ||
      puzzle.slug.toLowerCase().includes(query);

    const matchesCategory =
      categoryId === "ALL" || puzzle.categoryId === categoryId;

    const matchesStatus =
      status === "ALL" ||
      (status === "PUBLISHED" && puzzle.published) ||
      (status === "DRAFT" && !puzzle.published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <AdminNav>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">All Puzzles</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage, search, publish and delete your REASA challenges.
            </p>
          </div>

          <Link
            href="/admin/puzzles/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Puzzle
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search puzzle..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900"
          >
            <option value="ALL">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold">Puzzle Library</h2>
            <span className="text-sm text-gray-500">
              {filteredPuzzles.length} puzzles
            </span>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Loading puzzles...
            </p>
          ) : filteredPuzzles.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">No puzzles found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try another search or category.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredPuzzles.map((puzzle) => (
                <div
                  key={puzzle.id}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {puzzle.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {puzzle.category?.name ?? "Uncategorized"} ·{" "}
                      {puzzle.type.replaceAll("_", " ")} ·{" "}
                      {puzzle.difficulty}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      /quiz/{puzzle.slug}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          puzzle.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {puzzle.published ? "Published" : "Draft"}
                      </span>

                      {puzzle.featured && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-700">
                          Featured
                        </span>
                      )}

                      {puzzle.trending && (
                        <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs text-purple-700">
                          Trending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={deletingId === puzzle.id}
                      onClick={() => void togglePublished(puzzle)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {puzzle.published ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                      {puzzle.published ? "Unpublish" : "Publish"}
                    </button>

                    <Link
                      href={`/admin/puzzles/${puzzle.id}/edit`}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={deletingId === puzzle.id}
                      onClick={() => void deletePuzzle(puzzle)}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingId === puzzle.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminNav>
  );
}
