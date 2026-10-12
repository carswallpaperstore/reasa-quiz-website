"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BrainCircuit, Menu, Search, X, Trophy, LayoutGrid, House, CalendarDays, Info, UserRound, ChevronRight, Share2 } from "lucide-react";
const links = [
  { name: "Home", href: "/", icon: House }, { name: "Categories", href: "/categories", icon: LayoutGrid },
  { name: "Daily Challenge", href: "/daily-challenge", icon: CalendarDays }, { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "About REASA", href: "/about", icon: Info }, { name: "Invite friends", href: "/referral", icon: Share2 },
];
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{name:string|null; role?:string}|null>(null);
  const [checked, setChecked] = useState(false);
  async function refreshAuth() {
    try { const r = await fetch("/api/auth/me", {cache:"no-store"}); const d = await r.json(); setUser(r.ok ? d.user : null); }
    catch { setUser(null); } finally { setChecked(true); }
  }
  useEffect(() => { void refreshAuth(); const onFocus = () => void refreshAuth(); const onAuth = () => void refreshAuth(); window.addEventListener("focus", onFocus); window.addEventListener("reasa-auth-changed", onAuth); return () => { window.removeEventListener("focus", onFocus); window.removeEventListener("reasa-auth-changed", onAuth); }; }, []);
  useEffect(() => { document.body.style.overflow = menuOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [menuOpen]);
  const profileHref = "/profile";
  const authLinks = checked && (user ? <Link href={profileHref} className="reasa-button reasa-button-primary" aria-label="Open profile"><UserRound size={17}/><span className="reasa-profile-nav-label">Profile</span></Link> : <><Link href="/login" className="reasa-button reasa-button-ghost">Log in</Link><Link href="/signup" className="reasa-button reasa-button-primary">Create account</Link></>);
  return <>
    <header className="reasa-header"><div className="reasa-header-inner">
      <Link href="/" className="reasa-logo" aria-label="REASA home"><span className="reasa-logo-mark"><BrainCircuit size={20} strokeWidth={2}/></span><span>REASA</span></Link>
      <nav className="reasa-nav" aria-label="Main navigation">{links.map(({name,href})=><Link key={href} href={href}>{name}</Link>)}</nav>
      <div className="reasa-header-actions"><Link href="/search" className="reasa-icon-button" aria-label="Search quizzes"><Search size={17}/></Link>{authLinks}</div>
      <button className="reasa-icon-button reasa-mobile-toggle" aria-label="Open navigation" onClick={()=>setMenuOpen(true)}><Menu size={21}/></button>
    </div></header>
    <div className={`reasa-drawer-backdrop ${menuOpen?"is-open":""}`} onClick={()=>setMenuOpen(false)} aria-hidden="true"/>
    <aside className={`reasa-drawer ${menuOpen?"is-open":""}`} aria-label="Site navigation" aria-hidden={!menuOpen}>
      <div className="reasa-drawer-head"><Link href="/" className="reasa-logo" onClick={()=>setMenuOpen(false)}><span className="reasa-logo-mark"><BrainCircuit size={19}/></span>REASA</Link><button className="reasa-icon-button" onClick={()=>setMenuOpen(false)} aria-label="Close navigation"><X size={19}/></button></div>
      <p className="reasa-drawer-label">EXPLORE</p>
      <nav className="reasa-drawer-links">{links.map(({name,href,icon:Icon})=><Link key={href} href={href} onClick={()=>setMenuOpen(false)}><Icon size={19}/><span>{name}</span><ChevronRight size={15} className="reasa-drawer-chevron"/></Link>)}</nav>
      <Link href="/search" className="reasa-drawer-search" onClick={()=>setMenuOpen(false)}><Search size={17}/> Search challenges</Link>
      <div className="reasa-drawer-bottom">{checked && (user ? <Link href={profileHref} onClick={()=>setMenuOpen(false)}><UserRound size={17}/>Profile</Link> : <><Link href="/login" onClick={()=>setMenuOpen(false)}><UserRound size={17}/>Log in</Link><Link href="/signup" className="reasa-button reasa-button-primary" onClick={()=>setMenuOpen(false)}>Create free account</Link></>)}</div>
    </aside>
  </>;
}
