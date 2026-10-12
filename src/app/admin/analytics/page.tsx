
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AnalyticsData = {
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
    averageScore: number;
  };
  activity: {
    date: string;
    label: string;
    attempts: number;
    completed: number;
  }[];
  popularPuzzles: {
    id: string;
    title: string;
    published: boolean;
    attempts: number;
    questions: number;
  }[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/analytics", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load analytics.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const stats = data?.stats;
  const maxAttempts = Math.max(
    1,
    ...(data?.activity.map((day) => day.attempts) ?? [0])
  );

  return (
    <main className="analytics-page">
      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow">REASA ADMIN</span>
          <h1>Analytics Dashboard</h1>
          <p>Website performance and quiz activity.</p>
        </div>

        <Link href="/admin" className="analytics-back">
          ← Admin Dashboard
        </Link>
      </header>

      {loading && (
        <div className="analytics-message">Loading analytics...</div>
      )}

      {!loading && error && (
        <div className="analytics-message analytics-error">
          <h3>Analytics could not load</h3>
          <p>{error}</p>
          <button onClick={() => void loadAnalytics()}>
            Try Again
          </button>
        </div>
      )}

      {!loading && data && (
        <>
          <section className="analytics-stats">
            <Stat title="Total Users" value={stats!.totalUsers} />
            <Stat title="Total Puzzles" value={stats!.totalPuzzles} />
            <Stat title="Quiz Attempts" value={stats!.totalAttempts} />
            <Stat
              title="Completion Rate"
              value={`${stats!.completionRate}%`}
            />
            <Stat title="Categories" value={stats!.totalCategories} />
            <Stat title="Total Questions" value={stats!.totalQuestions} />
            <Stat
              title="Average Score"
              value={`${stats!.averageScore}%`}
            />
            <Stat
              title="Published Puzzles"
              value={stats!.publishedPuzzles}
            />
          </section>

          <section className="analytics-panel">
            <h2>Quiz Activity — Last 7 Days</h2>
            <p className="analytics-subtitle">
              Number of quiz attempts per day.
            </p>

            <div className="analytics-chart">
              {data.activity.map((day) => (
                <div className="analytics-chart-day" key={day.date}>
                  <div className="analytics-bars">
                    <div
                      className="analytics-bar"
                      title={`${day.attempts} attempts`}
                      style={{
                        height: `${
                          (day.attempts / maxAttempts) * 100
                        }%`,
                      }}
                    />
                    <div
                      className="analytics-bar analytics-bar-completed"
                      title={`${day.completed} completed`}
                      style={{
                        height: `${
                          (day.completed / maxAttempts) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span>{day.label}</span>
                  <small>{day.attempts} attempts</small>
                </div>
              ))}
            </div>
            <div className="analytics-legend">
              <span>■ Total attempts</span>
              <span>■ Completed attempts</span>
            </div>
          </section>

          <section className="analytics-panel">
            <h2>Most Played Puzzles</h2>
            <p className="analytics-subtitle">
              Ranked by recorded attempts.
            </p>

            {data.popularPuzzles.length === 0 ? (
              <p>No puzzle data available yet.</p>
            ) : (
              <div className="analytics-table-wrap">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>Puzzle</th>
                      <th>Status</th>
                      <th>Questions</th>
                      <th>Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.popularPuzzles.map((puzzle, index) => (
                      <tr key={puzzle.id}>
                        <td>
                          <span className="analytics-rank">
                            {index + 1}
                          </span>
                          {puzzle.title}
                        </td>
                        <td>
                          {puzzle.published ? "Published" : "Draft"}
                        </td>
                        <td>{puzzle.questions}</td>
                        <td>{puzzle.attempts.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <style jsx>{`
        .analytics-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 36px 24px 70px;
          color: #f5f3ff;
          min-height: 80vh;
        }
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
        }
        .analytics-eyebrow {
          color: #c4a3ff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }
        .analytics-header h1 {
          font-size: clamp(28px, 4vw, 42px);
          margin: 10px 0;
          font-weight: 900;
        }
        .analytics-header p,
        .analytics-subtitle {
          color: #a8b0d1;
          font-size: 13px;
        }
        .analytics-back {
          color: #d8c2ff;
          text-decoration: none;
          border: 1px solid #34375b;
          padding: 11px 15px;
          border-radius: 10px;
          white-space: nowrap;
        }
        .analytics-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
        }
        .analytics-card,
        .analytics-panel,
        .analytics-message {
          background: #10142b;
          border: 1px solid #282d50;
          border-radius: 16px;
          padding: 21px;
        }
        .analytics-card span {
          color: #a8b0d1;
          font-size: 12px;
        }
        .analytics-card strong {
          display: block;
          font-size: 30px;
          margin-top: 12px;
          overflow-wrap: anywhere;
        }
        .analytics-panel {
          margin-top: 20px;
        }
        .analytics-panel h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }
        .analytics-chart {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 12px;
          margin-top: 25px;
        }
        .analytics-chart-day {
          min-width: 0;
          text-align: center;
          color: #b8c0e1;
          font-size: 11px;
        }
        .analytics-bars {
          height: 150px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 5px;
          border-bottom: 1px solid #303454;
          margin-bottom: 10px;
        }
        .analytics-bar {
          width: 20px;
          max-width: 40%;
          min-height: 2px;
          background: #b05cff;
          border-radius: 5px 5px 0 0;
        }
        .analytics-bar-completed {
          background: #45d8f5;
        }
        .analytics-chart-day span,
        .analytics-chart-day small {
          display: block;
          margin-top: 5px;
        }
        .analytics-legend {
          display: flex;
          gap: 18px;
          font-size: 11px;
          color: #a8b0d1;
          margin-top: 18px;
        }
        .analytics-table-wrap {
          overflow-x: auto;
        }
        .analytics-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 13px;
        }
        .analytics-table th,
        .analytics-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #282d50;
        }
        .analytics-table th {
          color: #a8b0d1;
        }
        .analytics-rank {
          display: inline-grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border-radius: 7px;
          background: #27203f;
          color: #d6b8ff;
          margin-right: 10px;
        }
        .analytics-message {
          margin: 20px 0;
        }
        .analytics-error {
          border-color: #873d54;
        }
        .analytics-error button {
          background: #8b5cf6;
          color: white;
          border: 0;
          border-radius: 8px;
          padding: 10px 16px;
          cursor: pointer;
        }
        @media (max-width: 850px) {
          .analytics-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 550px) {
          .analytics-page {
            padding: 24px 14px 50px;
          }
          .analytics-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .analytics-stats {
            gap: 9px;
          }
          .analytics-card {
            padding: 14px;
          }
          .analytics-card strong {
            font-size: 24px;
          }
          .analytics-panel {
            padding: 14px;
          }
          .analytics-chart {
            gap: 4px;
          }
          .analytics-bars {
            gap: 2px;
          }
          .analytics-chart-day {
            font-size: 9px;
          }
        }
      `}</style>
    </main>
  );
}

function Stat({ title, value }: { title: string; value: number | string }) {
  return (
    <article className="analytics-card">
      <span>{title}</span>
      <strong>{typeof value === "number" ? value.toLocaleString() : value}</strong>
    </article>
  );
}
