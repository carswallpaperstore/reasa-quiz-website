
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Activity = {
  date: string;
  label?: string;
  attempts: number;
  completed: number;
};

type PopularPuzzle = {
  id: string;
  title: string;
  attempts: number;
  questions?: number;
  published?: boolean;
};

type Stats = {
  totalUsers: number;
  totalPuzzles: number;
  publishedPuzzles: number;
  draftPuzzles: number;
  totalCategories: number;
  totalQuestions: number;
  totalAttempts: number;
  completedAttempts: number;
  completionRate: number;
  averageScore: number;
};

const initialStats: Stats = {
  totalUsers: 0,
  totalPuzzles: 0,
  publishedPuzzles: 0,
  draftPuzzles: 0,
  totalCategories: 0,
  totalQuestions: 0,
  totalAttempts: 0,
  completedAttempts: 0,
  completionRate: 0,
  averageScore: 0,
};

const cards: {
  key: keyof Stats;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: "totalUsers", label: "Total Users", icon: "👥", color: "blue" },
  { key: "totalPuzzles", label: "Total Quizzes", icon: "🧩", color: "purple" },
  { key: "publishedPuzzles", label: "Published", icon: "🌐", color: "green" },
  { key: "draftPuzzles", label: "Drafts", icon: "📝", color: "orange" },
  { key: "totalCategories", label: "Categories", icon: "📂", color: "pink" },
  { key: "totalQuestions", label: "Questions", icon: "❓", color: "cyan" },
];

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>(initialStats);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [popularPuzzles, setPopularPuzzles] = useState<PopularPuzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/analytics", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load dashboard data.");
      }

      // API returns statistics inside data.stats.
      // Activity and popular quizzes are top-level fields.
      setStats({
        ...initialStats,
        ...(data.stats ?? {}),
      });

      setActivity(Array.isArray(data.activity) ? data.activity : []);
      setPopularPuzzles(
        Array.isArray(data.popularPuzzles) ? data.popularPuzzles : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading analytics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics, refreshKey]);

  const maxAttempts = Math.max(
    1,
    ...activity.map((day) => Number(day.attempts) || 0)
  );

  const number = (value: number) =>
    Number(value || 0).toLocaleString("en-US");

  return (
    <div className="reasa-dashboard">
      <style jsx>{`
        .reasa-dashboard {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          color: #172033;
          display: grid;
          gap: 22px;
        }

        .dashboard-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .eyebrow {
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
        }

        h1 {
          font-size: clamp(26px, 3vw, 34px);
          letter-spacing: -0.8px;
          margin: 7px 0;
        }

        .subtitle {
          margin: 0;
          color: #718096;
          font-size: 13px;
          line-height: 1.6;
        }

        .refresh {
          border: 1px solid #dce3ee;
          border-radius: 10px;
          background: #fff;
          padding: 11px 15px;
          color: #263449;
          font-weight: 700;
          cursor: pointer;
        }

        .refresh:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .error {
          padding: 15px;
          background: #fff1f0;
          color: #a32e26;
          border: 1px solid #ffd5d1;
          border-radius: 12px;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .stat-card {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fff;
          padding: 20px;
          border: 1px solid #e7ebf2;
          border-radius: 15px;
          box-shadow: 0 3px 12px rgba(20, 36, 60, 0.03);
        }

        .stat-icon {
          flex: 0 0 44px;
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          font-size: 21px;
        }

        .blue { background: #eaf2ff; }
        .purple { background: #f0eaff; }
        .green { background: #e5f8ee; }
        .orange { background: #fff1df; }
        .pink { background: #ffeaf1; }
        .cyan { background: #e2f8fb; }

        .stat-label {
          color: #758197;
          font-size: 12px;
          margin: 0 0 7px;
        }

        .stat-value {
          display: block;
          font-size: 26px;
          letter-spacing: -0.6px;
          overflow-wrap: anywhere;
        }

        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
          gap: 18px;
        }

        .panel {
          min-width: 0;
          padding: 22px;
          background: #fff;
          border: 1px solid #e7ebf2;
          border-radius: 15px;
          box-shadow: 0 3px 12px rgba(20, 36, 60, 0.03);
        }

        .panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .panel-heading h2 {
          font-size: 16px;
          margin: 0 0 6px;
        }

        .panel-heading p {
          color: #7a8699;
          font-size: 12px;
          line-height: 1.5;
          margin: 0;
        }

        .panel-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          background: #f0f4fa;
          border-radius: 11px;
          flex-shrink: 0;
        }

        .chart {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 10px;
          align-items: end;
        }

        .chart-day {
          min-width: 0;
          display: grid;
          grid-template-rows: auto 130px auto;
          gap: 8px;
          text-align: center;
          align-items: end;
        }

        .chart-number {
          font-size: 11px;
          color: #64748b;
        }

        .bar-area {
          height: 130px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          background: #f3f6fb;
          border-radius: 8px;
        }

        .bar {
          width: 100%;
          min-height: 3px;
          border-radius: 6px 6px 0 0;
          background: linear-gradient(180deg, #7b93ff, #4c68df);
        }

        .day-label {
          font-size: 10px;
          color: #748094;
        }

        .legend {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #718096;
          font-size: 11px;
          margin-top: 15px;
        }

        .legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 3px;
          background: #5878e9;
        }

        .performance {
          display: grid;
          gap: 23px;
        }

        .performance-row {
          display: grid;
          gap: 10px;
        }

        .performance-labels {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          font-size: 12px;
          color: #69778c;
        }

        .performance-labels strong {
          color: #172033;
          font-size: 18px;
        }

        .progress {
          height: 9px;
          background: #edf1f7;
          border-radius: 20px;
          overflow: hidden;
        }

        .progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #16a36a;
        }

        .progress .purple-bar {
          background: #8062e8;
        }

        .metric {
          border-top: 1px solid #edf0f5;
          padding-top: 13px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #69778c;
          font-size: 12px;
        }

        .metric strong {
          color: #172033;
          font-size: 15px;
        }

        .text-link {
          font-size: 12px;
          font-weight: 700;
          color: #4568df;
          text-decoration: none;
          white-space: nowrap;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        th {
          padding: 12px;
          background: #f7f9fc;
          color: #7a8699;
          font-size: 10px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        td {
          padding: 14px 12px;
          border-bottom: 1px solid #edf0f5;
          font-size: 12px;
        }

        td:last-child,
        th:last-child {
          text-align: right;
        }

        .rank {
          display: inline-grid;
          place-items: center;
          width: 27px;
          height: 27px;
          margin-right: 9px;
          border-radius: 8px;
          background: #eef2ff;
          color: #4568df;
          font-weight: 800;
        }

        .quiz-title {
          overflow-wrap: anywhere;
        }

        .empty,
        .loading {
          padding: 18px 0;
          color: #7a8699;
          font-size: 13px;
        }

        .actions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .action {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 16px;
          border: 1px solid #e7ebf2;
          border-radius: 12px;
          color: inherit;
          text-decoration: none;
          transition: border-color 0.2s, transform 0.2s;
        }

        .action:hover {
          border-color: #aabcf9;
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 22px;
        }

        .action-text {
          flex: 1;
          min-width: 0;
          display: grid;
          gap: 5px;
        }

        .action-text strong {
          font-size: 12px;
        }

        .action-text small {
          color: #7a8699;
          font-size: 11px;
          line-height: 1.5;
        }

        .action-arrow {
          color: #6076d8;
        }

        @media (max-width: 1000px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .content-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .actions {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 520px) {
          .reasa-dashboard {
            gap: 15px;
          }

          .stat-card {
            padding: 13px;
            gap: 9px;
          }

          .stat-icon {
            width: 35px;
            height: 35px;
            flex-basis: 35px;
            font-size: 17px;
            border-radius: 10px;
          }

          .stat-label {
            font-size: 11px;
          }

          .stat-value {
            font-size: 21px;
          }

          .panel {
            padding: 15px;
          }

          .chart {
            gap: 6px;
          }

          .chart-day {
            grid-template-rows: auto 105px auto;
            gap: 6px;
          }

          .bar-area {
            height: 105px;
          }

          .panel-heading {
            align-items: flex-start;
          }
        }
      `}</style>

      <header className="dashboard-heading">
        <div>
          <span className="eyebrow">REASA ADMINISTRATION</span>
          <h1>Dashboard</h1>
          <p className="subtitle">
            Overview of users, quizzes and website activity.
          </p>
        </div>

        <button
          type="button"
          className="refresh"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div className="error" role="alert">
          <strong>Dashboard data could not be loaded.</strong>
          <p>{error}</p>
          <button
            type="button"
            className="refresh"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}

      <section className="stats-grid">
        {cards.map((card) => (
          <article className="stat-card" key={card.key}>
            <div className={`stat-icon ${card.color}`}>{card.icon}</div>
            <div>
              <p className="stat-label">{card.label}</p>
              <strong className="stat-value">
                {loading ? "—" : number(stats[card.key])}
              </strong>
            </div>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Quiz Activity</h2>
              <p>Attempts during the last 7 days</p>
            </div>
            <span className="panel-icon">📈</span>
          </div>

          {loading ? (
            <p className="loading">Loading activity...</p>
          ) : activity.length === 0 ? (
            <p className="empty">No activity data is available yet.</p>
          ) : (
            <>
              <div className="chart">
                {activity.map((day, index) => {
                  const attempts = Number(day.attempts) || 0;
                  const height = Math.max(
                    attempts > 0 ? 8 : 3,
                    (attempts / maxAttempts) * 100
                  );

                  const date = new Date(`${day.date}T12:00:00`);
                  const label =
                    day.label ||
                    date.toLocaleDateString("en-US", { weekday: "short" });

                  return (
                    <div
                      className="chart-day"
                      key={`${day.date}-${index}`}
                      title={`${day.date}: ${attempts} attempts, ${day.completed} completed`}
                    >
                      <strong className="chart-number">{attempts}</strong>
                      <div className="bar-area">
                        <div
                          className="bar"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="day-label">{label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="legend">
                <span className="legend-dot" />
                Quiz attempts
              </div>
            </>
          )}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>Performance</h2>
              <p>Overall quiz engagement</p>
            </div>
            <span className="panel-icon">🎯</span>
          </div>

          <div className="performance">
            <div className="performance-row">
              <div className="performance-labels">
                <span>Completion rate</span>
                <strong>
                  {loading ? "—" : `${Number(stats.completionRate) || 0}%`}
                </strong>
              </div>
              <div className="progress">
                <span
                  style={{
                    width: `${Math.min(100, Math.max(0, Number(stats.completionRate) || 0))}%`,
                  }}
                />
              </div>
            </div>

            <div className="performance-row">
              <div className="performance-labels">
                <span>Average score</span>
                <strong>
                  {loading ? "—" : `${Number(stats.averageScore) || 0}%`}
                </strong>
              </div>
              <div className="progress">
                <span
                  className="purple-bar"
                  style={{
                    width: `${Math.min(100, Math.max(0, Number(stats.averageScore) || 0))}%`,
                  }}
                />
              </div>
            </div>

            <div className="metric">
              <span>Total quiz attempts</span>
              <strong>{loading ? "—" : number(stats.totalAttempts)}</strong>
            </div>

            <div className="metric">
              <span>Completed attempts</span>
              <strong>{loading ? "—" : number(stats.completedAttempts)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Popular Quizzes</h2>
            <p>Quizzes ranked by number of attempts</p>
          </div>
          <Link className="text-link" href="/admin/puzzles">
            Manage quizzes →
          </Link>
        </div>

        {loading ? (
          <p className="loading">Loading quizzes...</p>
        ) : popularPuzzles.length === 0 ? (
          <p className="empty">No quiz attempt data is available yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {popularPuzzles.map((puzzle, index) => (
                  <tr key={puzzle.id}>
                    <td>
                      <span className="rank">{index + 1}</span>
                      <strong className="quiz-title">{puzzle.title}</strong>
                    </td>
                    <td>{number(puzzle.attempts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Quick Actions</h2>
            <p>Go directly to common management tasks</p>
          </div>
        </div>

        <div className="actions">
          <Link href="/admin/puzzles" className="action">
            <span className="action-icon">🧩</span>
            <span className="action-text">
              <strong>Manage Quizzes</strong>
              <small>Create, edit and publish quizzes</small>
            </span>
            <b className="action-arrow">→</b>
          </Link>

          <Link href="/admin/categories" className="action">
            <span className="action-icon">📂</span>
            <span className="action-text">
              <strong>Manage Categories</strong>
              <small>Organize your quiz categories</small>
            </span>
            <b className="action-arrow">→</b>
          </Link>

          <Link href="/admin/users" className="action">
            <span className="action-icon">👥</span>
            <span className="action-text">
              <strong>Manage Users</strong>
              <small>View registered users</small>
            </span>
            <b className="action-arrow">→</b>
          </Link>
        </div>
      </section>
    </div>
  );
}
