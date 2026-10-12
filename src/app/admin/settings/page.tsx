
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Save, RefreshCw, Settings2 } from "lucide-react";

type Settings = {
  siteName: string;
  tagline: string;
  contactEmail: string;
  supportUrl: string;
  maintenanceMode: string;
  quizzesPerCategory: string;
  allowGuestPlay: string;
};

const initialSettings: Settings = {
  siteName: "REASA",
  tagline: "Challenge your mind.",
  contactEmail: "",
  supportUrl: "",
  maintenanceMode: "false",
  quizzesPerCategory: "10",
  allowGuestPlay: "true",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load settings.");
      }

      setSettings({ ...initialSettings, ...data.settings });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  function change<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save settings.");
      }

      setSettings({ ...initialSettings, ...data.settings });
      setMessage("Settings saved successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rs-page"><div className="rs-panel">Loading settings…</div></div>;
  }

  return (
    <main className="rs-page">
      <header className="rs-header">
        <div>
          <span className="rs-eyebrow">REASA ADMIN</span>
          <h1><Settings2 size={28} /> Website Settings</h1>
          <p>Manage the website configuration stored in your database.</p>
        </div>
        <Link href="/admin" className="rs-back">← Dashboard</Link>
      </header>

      {error && <div className="rs-alert rs-error">{error}</div>}
      {message && <div className="rs-alert rs-success">{message}</div>}

      <form className="rs-panel" onSubmit={saveSettings}>
        <h2>General</h2>

        <div className="rs-grid">
          <label>
            Website name
            <input
              required
              maxLength={100}
              value={settings.siteName}
              onChange={(e) => change("siteName", e.target.value)}
            />
          </label>

          <label>
            Tagline
            <input
              maxLength={200}
              value={settings.tagline}
              onChange={(e) => change("tagline", e.target.value)}
            />
          </label>

          <label>
            Contact email
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => change("contactEmail", e.target.value)}
              placeholder="support@example.com"
            />
          </label>

          <label>
            Support URL
            <input
              type="url"
              value={settings.supportUrl}
              onChange={(e) => change("supportUrl", e.target.value)}
              placeholder="https://example.com/contact"
            />
          </label>

          <label>
            Quizzes per category
            <input
              type="number"
              min={1}
              max={100}
              required
              value={settings.quizzesPerCategory}
              onChange={(e) => change("quizzesPerCategory", e.target.value)}
            />
            <small>Saved to the database; public quiz listing must read this setting to apply it.</small>
          </label>
        </div>

        <div className="rs-option">
          <div>
            <strong>Maintenance mode</strong>
            <p>Stores the maintenance setting. It does not block public pages until maintenance middleware/page logic reads it.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.maintenanceMode === "true"}
            onChange={(e) => change("maintenanceMode", String(e.target.checked))}
            aria-label="Maintenance mode"
          />
        </div>

        <div className="rs-option">
          <div>
            <strong>Allow guest play</strong>
            <p>Stores whether guest play is intended to be allowed. Quiz access code must read this setting for enforcement.</p>
          </div>
          <input
            type="checkbox"
            checked={settings.allowGuestPlay === "true"}
            onChange={(e) => change("allowGuestPlay", String(e.target.checked))}
            aria-label="Allow guest play"
          />
        </div>

        <div className="rs-actions">
          <button type="button" className="rs-secondary" onClick={() => void loadSettings()} disabled={saving}>
            <RefreshCw size={16} /> Reload
          </button>
          <button type="submit" className="rs-primary" disabled={saving}>
            <Save size={16} /> {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .rs-page { max-width:1100px; margin:0 auto; padding:clamp(18px,3vw,32px); color:#f5f3ff; }
        .rs-header { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:24px; }
        .rs-eyebrow { color:#c4a3ff; font-size:11px; font-weight:800; letter-spacing:2px; }
        .rs-header h1 { display:flex; align-items:center; gap:10px; font-size:clamp(26px,4vw,38px); margin:9px 0; }
        .rs-header p { color:#a8b0d1; font-size:13px; }
        .rs-back { color:#e4d7ff; text-decoration:none; border:1px solid #34375b; border-radius:10px; padding:10px 13px; white-space:nowrap; }
        .rs-panel { background:#10142b; border:1px solid #282d50; border-radius:16px; padding:clamp(16px,3vw,26px); }
        .rs-panel h2 { margin:0 0 22px; font-size:20px; }
        .rs-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
        .rs-grid label { display:flex; flex-direction:column; gap:8px; color:#d8dcf5; font-size:13px; font-weight:600; min-width:0; }
        .rs-grid input { width:100%; min-width:0; padding:12px; border:1px solid #34375b; border-radius:10px; background:#080d22; color:#fff; outline:none; }
        .rs-grid input:focus { border-color:#a78bfa; }
        .rs-grid small { color:#a8b0d1; font-weight:400; line-height:1.5; }
        .rs-option { display:flex; justify-content:space-between; align-items:center; gap:18px; padding:18px 0; margin-top:10px; border-bottom:1px solid #282d50; }
        .rs-option strong { font-size:14px; }
        .rs-option p { color:#a8b0d1; font-size:12px; line-height:1.6; margin:6px 0 0; }
        .rs-option input { width:20px; height:20px; accent-color:#a78bfa; flex-shrink:0; }
        .rs-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:10px; margin-top:24px; }
        .rs-actions button { display:flex; align-items:center; justify-content:center; gap:8px; padding:12px 16px; border-radius:10px; border:1px solid #34375b; cursor:pointer; }
        .rs-primary { background:#8b5cf6; color:#fff; border-color:#8b5cf6!important; }
        .rs-secondary { background:#1a1f3d; color:#eee8ff; }
        .rs-actions button:disabled { opacity:.6; cursor:not-allowed; }
        .rs-alert { margin-bottom:16px; padding:13px 15px; border-radius:10px; font-size:13px; }
        .rs-error { background:#321622; border:1px solid #873d54; color:#ffc1d0; }
        .rs-success { background:#102b27; border:1px solid #27665c; color:#9bf2d9; }
        @media(max-width:600px) { .rs-header { align-items:flex-start; flex-direction:column; } .rs-grid { grid-template-columns:1fr; gap:14px; } .rs-actions { flex-direction:column-reverse; } .rs-actions button { width:100%; } }
      `}</style>
    </main>
  );
}
