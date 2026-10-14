
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserRound,
  Mail,
  LogOut,
  Copy,
  Share2,
  CheckCircle2,
  Brain,
  Trophy,
  Zap,
  Target,
  Flame,
  Award,
  Clock,
  ArrowRight,
  LoaderCircle,
} from "lucide-react";

type BadgeItem = {
  id: string;
  name: string;
  description: string;
  earned: boolean;
};

type HistoryItem = {
  id: string;
  title: string;
  slug: string;
  category: string;
  score: number;
  totalPoints: number;
  percentage: number;
  completedAt: string | null;
  durationSeconds: number | null;
};

type ProfileStats = {
  completed: number;
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  accuracy: number;
  streak: number;
  totalScore: number;
  badges: BadgeItem[];
  recentActivity: HistoryItem[];
};

type ProfileUser = {
  id?: string;
  name?: string | null;
  email?: string;
  role?: string;
  referralCode?: string | null;
};

export default function ProfilePanel() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const userResponse = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const userData = await userResponse.json();

        if (!userResponse.ok || !userData.user) {
          window.location.replace("/login?next=/profile");
          return;
        }

        if (!active) return;

        setUser(userData.user);

        const statsResponse = await fetch("/api/profile/stats", {
          cache: "no-store",
        });

        if (!statsResponse.ok) {
          if (active) {
            setMessage("Quiz statistics could not be loaded.");
          }
          return;
        }

        const statsData = await statsResponse.json();

        if (active) {
          setStats(statsData);
        }
      } catch {
        if (active) {
          setMessage("Unable to load your profile. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const referralLink =
    typeof window !== "undefined" && user?.referralCode
      ? `${window.location.origin}/signup?ref=${encodeURIComponent(
          user.referralCode
        )}`
      : "";

  const completed = stats?.completed ?? 0;
  const xp = stats?.xp ?? 0;
  const level = stats?.level ?? 1;
  const currentLevelXP = stats?.xpIntoLevel ?? 0;
  const nextLevelXP = 1000;

  const progress = Math.min(
    100,
    Math.max(0, (currentLevelXP / nextLevelXP) * 100)
  );

  const accuracy = stats?.accuracy ?? 0;
  const streak = stats?.streak ?? 0;
  const badges = stats?.badges ?? [];
  const history = stats?.recentActivity ?? [];
  const earnedBadges = badges.filter((badge) => badge.earned).length;

  async function copyReferralLink() {
    if (!referralLink) return;

    try {
      setCopying(true);
      await navigator.clipboard.writeText(referralLink);
      setMessage("Referral link copied successfully!");
    } catch {
      setMessage("Could not copy the link. Please copy it manually.");
    } finally {
      setCopying(false);
    }
  }

  async function shareReferralLink() {
    if (!referralLink) {
      setMessage("Referral link is not available.");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join REASA",
          text: "Challenge yourself with fun quizzes and brain puzzles!",
          url: referralLink,
        });
      } else {
        await copyReferralLink();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setMessage("Unable to share the referral link.");
      }
    }
  }

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setMessage("Logout failed. Please try again.");
        return;
      }

      window.location.assign("/");
    } catch {
      setMessage("Unable to log out. Please try again.");
    }
  }

  function formatDate(value: string | null) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatDuration(seconds: number | null) {
    if (seconds === null || seconds === undefined || seconds < 0) {
      return "—";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  }


if (loading) {
  return (
    <section className="reasa-auth-card reasa-profile-card">
      <LoaderCircle
        size={28}
        className="animate-spin"
        aria-hidden="true"
      />
      <p>Loading your REASA profile...</p>
    </section>
  );
} 


  if (!user) {
    return (
      <section className="reasa-auth-card reasa-profile-card">
        <h1>Login required</h1>
        <p>Please log in to view your profile.</p>
        <Link href="/login" className="reasa-button reasa-button-primary">
          Log in
        </Link>
      </section>
    );
  }

  return (
    <section className="reasa-auth-card reasa-profile-card">
      {typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("welcome") ===
          "1" && (
          <div className="reasa-profile-success">
            <CheckCircle2 size={19} />
            Account created successfully. Welcome to REASA!
          </div>
        )}

      <div className="reasa-auth-icon">
        <UserRound size={26} />
      </div>

      <span className="reasa-eyebrow">YOUR ACCOUNT</span>

      <h1>My Profile</h1>

      <p className="reasa-auth-copy">
        Welcome, {user.name || "REASA member"}!
      </p>

      <div className="reasa-profile-details">
        <div className="reasa-profile-row">
          <UserRound size={21} />
          <div>
            <small>Full name</small>
            <strong>{user.name || "Not provided"}</strong>
          </div>
        </div>

        <div className="reasa-profile-row">
          <Mail size={21} />
          <div>
            <small>Email address</small>
            <strong>{user.email || "Not provided"}</strong>
          </div>
        </div>

        <div className="reasa-profile-row">
          <CheckCircle2 size={21} />
          <div>
            <small>Account</small>
            <strong className="reasa-profile-active">
              Logged in
            </strong>
          </div>
        </div>
      </div>

      <div className="reasa-profile-level">
        <div className="reasa-profile-level-heading">
          <div>
            <span className="reasa-eyebrow">YOUR PROGRESS</span>
            <h2>Level {level}</h2>
          </div>

          <div className="reasa-profile-level-icon">
            <Trophy size={25} />
          </div>
        </div>

        <div className="reasa-profile-xp-row">
          <span>
            <Zap size={16} />
            {xp.toLocaleString()} XP earned
          </span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div
          className="reasa-profile-progress-track"
          role="progressbar"
          aria-label="Progress toward next level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="reasa-profile-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="reasa-profile-level-note">
          {Math.max(0, nextLevelXP - currentLevelXP)} XP to the next level
        </p>
      </div>

      <h2>Your quiz activity</h2>

      <div className="reasa-profile-stats">
        <div>
          <Brain size={22} />
          <strong>{completed.toLocaleString()}</strong>
          <span>Quizzes completed</span>
        </div>

        <div>
          <Zap size={22} />
          <strong>{xp.toLocaleString()}</strong>
          <span>XP earned</span>
        </div>

        <div>
          <Target size={22} />
          <strong>{accuracy}%</strong>
          <span>Accuracy</span>
        </div>

        <div>
          <Flame size={22} />
          <strong>{streak}</strong>
          <span>Day streak</span>
        </div>
      </div>

      <div className="reasa-profile-section-heading">
        <div>
          <h2>Your achievements</h2>
          <p>Keep solving challenges to unlock badges.</p>
        </div>

        <span className="reasa-profile-badge-count">
          {earnedBadges}/{badges.length}
        </span>
      </div>

      {badges.length > 0 ? (
        <div className="reasa-profile-badges">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`reasa-profile-badge ${
                badge.earned ? "is-earned" : "is-locked"
              }`}
              key-value={badge.id}
            >
              <div className="reasa-profile-badge-icon">
                {badge.earned ? (
                  <Award size={24} />
                ) : (
                  <Trophy size={24} />
                )}
              </div>

              <div>
                <strong>{badge.name}</strong>
                <p>{badge.description}</p>
                <small>
                  {badge.earned ? "Unlocked" : "Not unlocked yet"}
                </small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="reasa-profile-empty">
          Your achievements will appear here when available.
        </p>
      )}

      <div className="reasa-profile-section-heading">
        <div>
          <h2>Recent quizzes</h2>
          <p>Your latest completed challenges.</p>
        </div>
      </div>

      {history.length > 0 ? (
        <div className="reasa-profile-history">
          {history.map((item) => (
            <div className="reasa-profile-history-item" key={item.id}>
              <div className="reasa-profile-history-icon">
                <Brain size={27} />
              </div>

              <div className="reasa-profile-history-content">
                <strong>{item.title}</strong>

                <span>
                  {item.category} · {formatDate(item.completedAt)}
                </span>

                <span>
                  Score: {item.score}/{item.totalPoints} ·{" "}
                  {item.percentage}% ·{" "}
                  <Clock
                    size={13}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                    }}
                  />{" "}
                  {formatDuration(item.durationSeconds)}
                </span>
              </div>

              <Link
                href={`/play/${encodeURIComponent(item.slug)}`}
                className="reasa-profile-history-link"
                aria-label={`Play ${item.title} again`}
                title="Play again"
              >
                <ArrowRight size={19} />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="reasa-profile-empty">
          <Brain size={30} />
          <p>No completed quizzes yet.</p>
          <p>Complete your first quiz to see your activity here.</p>
        </div>
      )}

      <div className="reasa-profile-invite">
        <h2>Invite friends</h2>
        <p>
          Share your referral link and invite friends to discover REASA.
        </p>

        {referralLink ? (
          <>
            <input
              type="text"
              readOnly
              value={referralLink}
              aria-label="Your referral link"
              onFocus={(event) => event.currentTarget.select()}
            />

            <div className="reasa-auth-actions">
              <button
                type="button"
                className="reasa-button reasa-button-ghost"
                onClick={copyReferralLink}
                disabled={copying}
              >
                <Copy size={16} />
                {copying ? "Copying..." : "Copy link"}
              </button>

              <button
                type="button"
                className="reasa-button reasa-button-primary"
                onClick={shareReferralLink}
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
          </>
        ) : (
          <p>Your referral link is not available for this account.</p>
        )}
      </div>

      {message && (
        <p className="reasa-profile-message" role="status">
          {message}
        </p>
      )}

      <div className="reasa-profile-actions">
        <Link
          href="/categories"
          className="reasa-button reasa-button-primary reasa-profile-explore"
        >
          Explore quizzes
        </Link>

        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="reasa-button reasa-button-ghost reasa-profile-explore"
          >
            Open Admin Panel
          </Link>
        )}

        <button
          type="button"
          onClick={logout}
          className="reasa-logout"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </section>
  );
}
