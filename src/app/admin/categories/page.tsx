
"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import AdminNav from "@/components/admin/AdminNav";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  sortOrder: number;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  icon: "🧠",
  image: "",
  sortOrder: 0,
};

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const buttonClass =
  "rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

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

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  // Load ALL categories, including hidden categories.
  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const me = await api("/api/auth/me");

      if (me.user?.role !== "ADMIN") {
        setError(
          "Admin access required. Please sign in with your admin account."
        );
        return;
      }

      const data = await api("/api/admin/categories");

      const loaded: Category[] = Array.isArray(data.categories)
        ? data.categories
        : [];

      setCategories(
        loaded.sort(
          (a, b) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
            a.name.localeCompare(b.name)
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load categories."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(category: Category) {
    setEditingId(category.id);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      icon: category.icon || "",
      image: category.image || "",
      sortOrder: category.sortOrder ?? 0,
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  function updateName(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug:
        !editingId || !current.slug
          ? makeSlug(name)
          : current.slug,
    }));
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    if (!form.slug.trim()) {
      setError("Please enter a category slug.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        slug: makeSlug(form.slug),
        description: form.description.trim(),
        icon: form.icon.trim(),
        image: form.image.trim(),
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (editingId) {
        await api("/api/admin/categories", "PATCH", {
          id: editingId,
          ...payload,
        });

        setMessage("Category updated successfully.");
      } else {
        await api("/api/admin/categories", "POST", payload);

        setMessage("Category created successfully.");
      }

      setEditingId(null);
      setForm(emptyForm);

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(category: Category) {
    const nextActive = category.isActive === false;

    setChangingId(category.id);
    setError("");
    setMessage("");

    try {
      await api("/api/admin/categories", "PATCH", {
        id: category.id,
        isActive: nextActive,
      });

      setMessage(
        nextActive
          ? `${category.name} activated successfully.`
          : `${category.name} hidden successfully.`
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not change category status."
      );
    } finally {
      setChangingId(null);
    }
  }

  // Permanently delete a category after explicit confirmation.
  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `PERMANENT DELETE\n\n` +
        `Category: "${category.name}"\n\n` +
        `This action may permanently delete this category and its related ` +
        `quizzes, questions, answers, attempts and scores.\n\n` +
        `This cannot be undone. Continue?`
    );

    if (!confirmed) return;

    setChangingId(category.id);
    setError("");
    setMessage("");

    try {
      await api(
        `/api/admin/categories?id=${encodeURIComponent(category.id)}`,
        "DELETE"
      );

      if (editingId === category.id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setMessage(
        `"${category.name}" was permanently deleted along with the related content handled by the server.`
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not permanently delete category."
      );
    } finally {
      setChangingId(null);
    }
  }

  const filteredCategories = categories.filter((category) => {
    const query = search.trim().toLowerCase();

    return (
      !query ||
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query) ||
      (category.description || "").toLowerCase().includes(query)
    );
  });

  const activeCount = categories.filter(
    (category) => category.isActive !== false
  ).length;

  const hiddenCount = categories.length - activeCount;

  if (loading) {
    return (
      <AdminNav>
        <section className="mx-auto max-w-7xl p-6">
          <p className="text-sm text-gray-500">
            Loading categories...
          </p>
        </section>
      </AdminNav>
    );
  }

  if (error && categories.length === 0) {
    return (
      <AdminNav>
        <section className="mx-auto max-w-7xl p-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <h1 className="font-bold text-red-800">
              Could not load Categories Management
            </h1>

            <p className="mt-2 text-sm text-red-700">{error}</p>

            <button
              type="button"
              className={`${buttonClass} mt-4 bg-red-600 text-white`}
              onClick={() => void load()}
            >
              Try again
            </button>
          </div>
        </section>
      </AdminNav>
    );
  }

  return (
    <AdminNav>
      <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              REASA CONTROL ROOM
            </p>

            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
              Categories Management
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create, edit, organise and permanently delete quiz categories.
            </p>
          </div>

          <button
            type="button"
            className={`${buttonClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
            onClick={() => void load()}
          >
            Refresh categories
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

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Total categories</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {categories.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Active categories</p>
            <p className="mt-2 text-3xl font-bold text-green-700">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Hidden categories</p>
            <p className="mt-2 text-3xl font-bold text-gray-700">
              {hiddenCount}
            </p>
          </div>
        </div>

        {/* ADD / EDIT FORM */}
        <form
          onSubmit={saveCategory}
          className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? "Edit category" : "Create new category"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingId
                ? "Update the details below and save your changes."
                : "Enter the details for your new REASA category."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category name *
              </label>

              <input
                required
                className={fieldClass}
                value={form.name}
                onChange={(event) => updateName(event.target.value)}
                placeholder="e.g. Brain Puzzles"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Slug *
              </label>

              <input
                required
                className={fieldClass}
                value={form.slug}
                onChange={(event) =>
                  setForm({ ...form, slug: event.target.value })
                }
                placeholder="brain-puzzles"
              />

              <p className="mt-1 text-xs text-gray-500">
                URL-friendly identifier. It must be unique.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Icon / Emoji
              </label>

              <input
                className={fieldClass}
                value={form.icon}
                onChange={(event) =>
                  setForm({ ...form, icon: event.target.value })
                }
                placeholder="🧠"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Sort order
              </label>

              <input
                type="number"
                className={fieldClass}
                value={form.sortOrder}
                onChange={(event) =>
                  setForm({
                    ...form,
                    sortOrder: Number(event.target.value) || 0,
                  })
                }
              />

              <p className="mt-1 text-xs text-gray-500">
                Smaller numbers appear first wherever this order is used.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category image URL
              </label>

              <input
                className={fieldClass}
                type="url"
                value={form.image}
                onChange={(event) =>
                  setForm({ ...form, image: event.target.value })
                }
                placeholder="https://example.com/category-image.jpg"
              />

              {form.image && (
                <div className="mt-3">
                  <p className="mb-2 text-xs text-gray-500">
                    Image preview
                  </p>

                  <img
                    src={form.image}
                    alt="Category preview"
                    className="h-36 w-full rounded-xl border border-gray-200 object-cover sm:w-64"
                  />
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description
              </label>

              <textarea
                rows={3}
                className={fieldClass}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Describe what users can solve in this category..."
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create category"}
            </button>

            {editingId && (
              <button
                type="button"
                className={`${buttonClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
                onClick={resetForm}
                disabled={saving}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        {/* CATEGORY LIST: ACTIVE + HIDDEN */}
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                All categories
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredCategories.length} of {categories.length} categories
                {" · "}
                Hidden categories are included
              </p>
            </div>

            <input
              className={`${fieldClass} sm:max-w-xs`}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              aria-label="Search categories"
            />
          </div>

          {filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <h3 className="font-bold text-gray-900">
                No categories found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try a different search or create a category above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredCategories.map((category) => {
                const isActive = category.isActive !== false;
                const isChanging = changingId === category.id;

                return (
                  <article
                    key={category.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                  >
                    {category.image && (
                      <img
                        src={category.image}
                        alt={`${category.name} category`}
                        className="h-40 w-full object-cover"
                      />
                    )}

                    <div className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                            {category.icon || "🧩"}
                          </div>

                          <div className="min-w-0">
                            <h3 className="break-words font-bold text-gray-900">
                              {category.name}
                            </h3>

                            <p className="mt-1 break-all text-xs text-gray-500">
                              /{category.slug}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isActive ? "Active" : "Hidden"}
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-gray-600">
                        {category.description || "No description added."}
                      </p>

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                        <span>Sort order: {category.sortOrder ?? 0}</span>
                        <span>ID: {category.id.slice(0, 8)}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`}
                          onClick={() => startEdit(category)}
                        >
                          Edit category
                        </button>

                        <button
                          type="button"
                          disabled={isChanging}
                          className={`${buttonClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`}
                          onClick={() => void toggleCategory(category)}
                        >
                          {isChanging
                            ? "Updating..."
                            : isActive
                              ? "Hide category"
                              : "Activate category"}
                        </button>

                        <button
                          type="button"
                          disabled={isChanging}
                          className={`${buttonClass} bg-red-600 text-white hover:bg-red-700`}
                          onClick={() => void deleteCategory(category)}
                        >
                          {isChanging
                            ? "Please wait..."
                            : "Permanently Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </AdminNav>
  );
}
