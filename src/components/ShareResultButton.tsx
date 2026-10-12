"use client";
import { Share2, Check } from "lucide-react";
import { useState } from "react";
export default function ShareResultButton({ title, percentage, score, total }: { title: string; percentage: number; score: number; total: number }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const text = `I scored ${score}/${total} (${percentage}%) on “${title}” at REASA. Can you beat my score?`;
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: "My REASA result", text, url }); return; } catch {} }
    try { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true); window.setTimeout(() => setCopied(false), 2200); } catch { window.prompt("Copy your result link", `${text} ${url}`); }
  }
  return <button type="button" className="reasa-button reasa-button-ghost" onClick={share}>{copied ? <Check size={15} /> : <Share2 size={15} />}{copied ? "Copied!" : "Share result"}</button>;
}
