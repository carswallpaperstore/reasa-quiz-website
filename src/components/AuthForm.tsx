"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, LockKeyhole, UserRound, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { const code = new URLSearchParams(window.location.search).get("ref"); if (code) setReferralCode(code); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const response = await fetch(`/api/auth/${mode === "signup" ? "signup" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password, referralCode }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
      window.dispatchEvent(new Event("reasa-auth-changed")); window.location.assign(signup ? "/profile?welcome=1" : "/profile");
    } catch (err) { setError(err instanceof Error ? err.message : "Connection error. Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="reasa-auth-card">
    <div className="reasa-auth-icon">{signup ? <UserRound size={23} /> : <LockKeyhole size={23} />}</div>
    <span className="reasa-eyebrow">{signup ? "Join the community" : "Welcome back"}</span>
    <h1>{signup ? "Create your account" : "Log in to REASA"}</h1>
    <p className="reasa-auth-copy">{signup ? "Save your progress and share your brain challenges with friends." : "Continue your challenges and share your results."}</p>
    <form onSubmit={submit} className="reasa-auth-form">
      {signup && <label>Your name<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" required maxLength={80} /></label>}
      <label>Email address<span className="reasa-auth-input-icon"><Mail size={16} /><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></span></label>
      <label>Password<input type="password" autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder={signup ? "At least 8 characters" : "Your password"} minLength={signup ? 8 : 1} required /></label>
      {signup && referralCode && <p className="reasa-referral-note">Referral code applied: <strong>{referralCode}</strong></p>}
      {error && <div className="reasa-auth-error" role="alert"><AlertCircle size={16} />{error}</div>}
      <button className="reasa-button reasa-button-primary reasa-auth-submit" type="submit" disabled={busy}>{busy ? "Please wait…" : signup ? "Create free account" : "Log in"}<ArrowRight size={16} /></button>
    </form>
    <p className="reasa-auth-switch">{signup ? "Already have an account?" : "New to REASA?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create account"}</Link></p>
    <p className="reasa-auth-legal"><CheckCircle2 size={13} /> Free to join. Your password is stored as a secure hash.</p>
  </section>;
}
