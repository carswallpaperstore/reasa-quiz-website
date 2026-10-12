
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Brain,
  FolderOpen,
  ListChecks,
  PlayCircle,
  CheckCircle2,
  BarChart3,
  Settings,
  RefreshCw,
} from "lucide-react";

type DashboardData = {
  stats: {
    totalUsers: number;
    totalPuzzles: number;
    publishedPuzzles: number;
    draftPuzzles: number;
    totalCategories: number;
    totalQuestions: number;
    totalAttempts: number;
    completedAttempts: number;
    completionRate: number;
  };
  recentUsers: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    createdAt: string;
  }[];
  recentAttempts: {
    id: string;
    status: string;
    score: number;
    percentage: number | null;
    startedAt: string;
    completedAt: string | null;
    user: { name: string | null; email: string | null } | null;
    puzzle: { title: string };
  }[];
};

export default function AdminOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Dashboard failed to load.");
      }

      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const cards = data
    ? [
        { label: "Total Users", value: data.stats.totalUsers, icon: Users },
        { label: "All Puzzles", value: data.stats.totalPuzzles, icon: Brain },
        { label: "Published", value: data.stats.publishedPuzzles, icon: CheckCircle2 },
        { label: "Draft Puzzles", value: data.stats.draftPuzzles, icon: PlayCircle },
        { label: "Categories", value: data.stats.totalCategories, icon: FolderOpen },
        { label: "Questions", value: data.stats.totalQuestions, icon: ListChecks },
        { label: "Quiz Attempts", value: data.stats.totalAttempts, icon: BarChart3 },
        { label: "Completion Rate", value: `${data.stats.completionRate}%`, icon: CheckCircle2 },
      ]
    : [];

  return (
    <div className="reasa-overview">
      <header className="ro-header">
        <div>
          <span className="ro-eyebrow">REASA CONTROL ROOM</span>
          <h1>Dashboard</h1>
          <p>Website activity and content overview.</p>
        </div>

        <button className="ro-refresh" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="ro-error">
          <strong>Could not load dashboard</strong>
          <p>{error}</p>
          <button onClick={() => void load()}>Try again</button>
        </div>
      )}

      {loading && !data && <div className="ro-panel">Loading database statistics…</div>}

      {data && (
        <>
          <section className="ro-cards">
            {cards.map(({ label, value, icon: Icon }) => (
              <article className="ro-card" key={label}>
                <span className="ro-icon"><Icon size={19} /></span>
                <span className="ro-label">{label}</span>
                <strong>{value.toLocaleString()}</strong>
              </article>
            ))}
          </section>

          <section className="ro-quicklinks">
            <h2>Quick Actions</h2>
            <div className="ro-links">
              <Link href="/admin/puzzles/new">＋ Add Puzzle</Link>
              <Link href="/admin/puzzles">Manage Puzzles</Link>
              <Link href="/admin/categories">Manage Categories</Link>
              <Link href="/admin/users">Manage Users</Link>
              <Link href="/admin/analytics"><BarChart3 size={16} /> Analytics</Link>
              <Link href="/admin/settings"><Settings size={16} /> Settings</Link>
            </div>
          </section>

          <section className="ro-two-col">
            <div className="ro-panel">
              <h2>Recently Registered Users</h2>
              {data.recentUsers.length === 0 ? (
                <p className="ro-muted">No registered users yet.</p>
              ) : (
                <div className="ro-table-wrap">
                  <table className="ro-table">
                    <thead>
                      <tr><th>User</th><th>Role</th><th>Joined</th></tr>
                    </thead>
                    <tbody>
                      {data.recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <strong>{user.name || "Unnamed user"}</strong>
                            <small>{user.email || "No email"}</small>
                          </td>
                          <td>{user.role}</td>
                          <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="ro-panel">
              <h2>Recent Quiz Activity</h2>
              {data.recentAttempts.length === 0 ? (
                <p className="ro-muted">No quiz attempts recorded yet.</p>
              ) : (
                <div className="ro-activity">
                  {data.recentAttempts.map((attempt) => (
                    <article key={attempt.id}>
                      <span className="ro-activity-dot" />
                      <div>
                        <strong>{attempt.puzzle.title}</strong>
                        <p>{attempt.user?.name || attempt.user?.email || "Guest user"}</p>
                        <small>
                          {attempt.status} · {new Date(attempt.startedAt).toLocaleString()}
                          {attempt.status === "COMPLETED" && attempt.percentage !== null
                            ? ` · ${Math.round(attempt.percentage)}%`
                            : ""}
                        </small>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <style jsx>{`
        .reasa-overview { color:#f5f3ff; padding:clamp(18px,3vw,32px); max-width:1500px; margin:auto; }
        .ro-header { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:26px; }
        .ro-eyebrow { color:#c4a3ff; font-size:11px; letter-spacing:2px; font-weight:800; }
        .ro-header h1 { font-size:clamp(28px,4vw,40px); margin:8px 0; font-weight:900; }
        .ro-header p,.ro-muted { color:#a8b0d1; font-size:13px; }
        .ro-refresh { display:flex; gap:8px; align-items:center; padding:11px 14px; border:1px solid #34375b; background:#171b38; color:#eee8ff; border-radius:10px; cursor:pointer; }
        .ro-cards { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; }
        .ro-card,.ro-panel,.ro-quicklinks,.ro-error { background:#10142b; border:1px solid #282d50; border-radius:16px; padding:20px; min-width:0; }
        .ro-icon { display:grid; place-items:center; width:38px; height:38px; border-radius:11px; background:#27203f; color:#d6b8ff; margin-bottom:15px; }
        .ro-label { display:block; color:#a8b0d1; font-size:12px; }
        .ro-card strong { display:block; font-size:clamp(24px,3vw,32px); margin-top:8px; overflow-wrap:anywhere; }
        .ro-quicklinks,.ro-panel { margin-top:20px; }
        .ro-quicklinks h2,.ro-panel h2 { font-size:18px; margin:0 0 16px; }
        .ro-links { display:flex; flex-wrap:wrap; gap:10px; }
        .ro-links a { display:flex; align-items:center; gap:7px; text-decoration:none; color:#e4d7ff; background:#1a1f3d; border:1px solid #34375b; border-radius:10px; padding:11px 13px; font-size:13px; }
        .ro-two-col { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .ro-table-wrap { overflow-x:auto; }
        .ro-table { width:100%; border-collapse:collapse; font-size:12px; text-align:left; }
        .ro-table th,.ro-table td { padding:12px 8px; border-bottom:1px solid #282d50; }
        .ro-table th { color:#a8b0d1; font-weight:600; }
        .ro-table td strong,.ro-table td small { display:block; }
        .ro-table td small { color:#a8b0d1; margin-top:4px; overflow-wrap:anywhere; }
        .ro-activity article { display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #282d50; }
        .ro-activity article:last-child { border-bottom:0; }
        .ro-activity-dot { flex:0 0 9px; height:9px; margin-top:5px; border-radius:50%; background:#b05cff; }
        .ro-activity strong { font-size:13px; }
        .ro-activity p,.ro-activity small { display:block; color:#a8b0d1; font-size:11px; margin:5px 0 0; overflow-wrap:anywhere; }
        .ro-error { border-color:#873d54; margin-bottom:18px; }
        .ro-error p { color:#ffb8c8; }
        .ro-error button { padding:9px 13px; border:0; border-radius:8px; background:#8b5cf6; color:white; cursor:pointer; }
        @media(max-width:1000px) { .ro-cards { grid-template-columns:repeat(2,minmax(0,1fr)); } .ro-two-col { grid-template-columns:1fr; } }
        @media(max-width:520px) { .reasa-overview { padding:16px 10px 35px; } .ro-header { align-items:flex-start; flex-direction:column; } .ro-cards { gap:8px; } .ro-card,.ro-panel,.ro-quicklinks { padding:13px; } .ro-card strong { font-size:24px; } }
      `}</style>
    </div>
  );
}
