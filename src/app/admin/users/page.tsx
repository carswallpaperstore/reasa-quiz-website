
"use client";

import { useCallback, useEffect, useState } from "react";
import AdminNav from "@/components/admin/AdminNav";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "USER" | "ADMIN" | "EDITOR";
  createdAt: string;
  _count: {
    attempts: number;
    scores: number;
  };
};

type Stats = {
  totalUsers: number;
  admins: number;
  editors: number;
  regularUsers: number;
};

type ApiResponse = {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: Stats;
  error?: string;
};

const initialStats: Stats = {
  totalUsers: 0,
  admins: 0,
  editors: 0,
  regularUsers: 0,
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        search,
        role,
        page: String(page),
        limit: "20",
      });

      const response = await fetch(
        `/api/admin/users?${params.toString()}`,
        { cache: "no-store" }
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "Could not load users.");
      }

      setUsers(data.users || []);
      setStats(data.stats || initialStats);
      setTotal(data.pagination?.total || 0);
      setTotalPages(Math.max(1, data.pagination?.totalPages || 1));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, role, page]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeRole(value: string) {
    setRole(value);
    setPage(1);
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function initials(user: User) {
    const name = user.name?.trim();

    if (name) {
      return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }

    return user.email?.[0]?.toUpperCase() || "U";
  }

  return (
    <AdminNav>
      <div className="um-page">
        <div className="um-heading">
          <div>
            <div className="um-eyebrow">REASA ADMINISTRATION</div>
            <h1>Users Management</h1>
            <p>View and manage your registered community members.</p>
          </div>

          <button
            className="um-refresh"
            onClick={() => void loadUsers()}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="um-error">
            <div>
              <strong>Unable to load users</strong>
              <p>{error}</p>
            </div>
            <button onClick={() => void loadUsers()}>Try again</button>
          </div>
        )}

        <div className="um-stats">
          <div className="um-stat">
            <span className="um-stat-icon">👥</span>
            <span className="um-stat-label">Total users</span>
            <strong>{stats.totalUsers.toLocaleString("en-IN")}</strong>
            <small>All registered accounts</small>
          </div>

          <div className="um-stat">
            <span className="um-stat-icon">🙂</span>
            <span className="um-stat-label">Regular users</span>
            <strong>{stats.regularUsers.toLocaleString("en-IN")}</strong>
            <small>Community members</small>
          </div>

          <div className="um-stat">
            <span className="um-stat-icon">🛡️</span>
            <span className="um-stat-label">Administrators</span>
            <strong>{stats.admins.toLocaleString("en-IN")}</strong>
            <small>Admin accounts</small>
          </div>

          <div className="um-stat">
            <span className="um-stat-icon">✏️</span>
            <span className="um-stat-label">Editors</span>
            <strong>{stats.editors.toLocaleString("en-IN")}</strong>
            <small>Editor accounts</small>
          </div>
        </div>

        <section className="um-panel">
          <div className="um-panel-heading">
            <div>
              <h2>All Members</h2>
              <p>{total.toLocaleString("en-IN")} matching accounts</p>
            </div>

            <span className="um-live">
              <span /> Database
            </span>
          </div>

          <div className="um-toolbar">
            <div className="um-search">
              <span>⌕</span>
              <input
                type="search"
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                placeholder="Search name or email..."
                aria-label="Search users"
              />
              {search && (
                <button
                  aria-label="Clear search"
                  onClick={() => changeSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={role}
              onChange={(e) => changeRole(e.target.value)}
              aria-label="Filter by role"
            >
              <option value="ALL">All roles</option>
              <option value="USER">Regular users</option>
              <option value="ADMIN">Administrators</option>
              <option value="EDITOR">Editors</option>
            </select>
          </div>

          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>QUIZ ATTEMPTS</th>
                  <th>SCORES</th>
                  <th>JOINED DATE</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="um-message">
                      <span className="um-spinner" />
                      Loading users...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="um-message">
                      User data could not be loaded.
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="um-message">
                      <div className="um-empty-icon">👤</div>
                      <strong>No users found</strong>
                      <p>Try another search or role filter.</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="um-user">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              className="um-avatar"
                              src={user.image}
                              alt=""
                            />
                          ) : (
                            <div className="um-avatar um-avatar-fallback">
                              {initials(user)}
                            </div>
                          )}

                          <div className="um-user-info">
                            <strong>{user.name || "Unnamed user"}</strong>
                            <span>{user.email || "No email provided"}</span>
                            <small>ID: {user.id}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`um-role um-role-${user.role.toLowerCase()}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td>
                        <strong className="um-number">
                          {user._count.attempts}
                        </strong>
                      </td>

                      <td>
                        <strong className="um-number">
                          {user._count.scores}
                        </strong>
                      </td>

                      <td className="um-date">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="um-pagination">
            <span>
              {total === 0
                ? "Showing 0 users"
                : `Showing ${(page - 1) * 20 + 1}–${Math.min(
                    page * 20,
                    total
                  )} of ${total}`}
            </span>

            <div className="um-page-controls">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                ← Previous
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page >= totalPages || loading}
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        <p className="um-footer-note">
          User passwords and password hashes are never displayed here.
        </p>
      </div>
                

    </AdminNav>
  );
}
