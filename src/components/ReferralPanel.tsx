"use client";
import { useEffect, useState } from "react";
import { Copy, Share2, Users, LogOut, LoaderCircle } from "lucide-react";
export default function ReferralPanel() {
 const [user,setUser]=useState<{name:string|null;email:string|null;referralCode:string|null}|null>(null); const [loading,setLoading]=useState(true); const [message,setMessage]=useState("");
 useEffect(()=>{fetch("/api/auth/me",{cache:"no-store"}).then(async r=>{if(!r.ok){window.location.replace("/login?next=/referral");return null}return r.json()}).then(d=>{if(d?.user)setUser(d.user)}).catch(()=>setMessage("Could not load account details.")).finally(()=>setLoading(false))},[]);
 const link = typeof window !== "undefined" && user?.referralCode ? `${window.location.origin}/signup?ref=${user.referralCode}` : "";
 async function copy(){try{await navigator.clipboard.writeText(link);setMessage("Referral link copied.")}catch{window.prompt("Copy your referral link",link)}}
 async function share(){const text="Try a quick brain challenge on REASA!";if(navigator.share){try{await navigator.share({title:"Join REASA",text,url:link});return}catch{}}copy()}
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});window.location.assign("/")}
 if(loading)return <div className="reasa-auth-card"><LoaderCircle className="reasa-spinner" /> Loading account…</div>;
 if(!user)return <div className="reasa-auth-card"><h1>Log in required</h1><p>Create an account or log in to get your personal referral link.</p></div>;
 return <section className="reasa-auth-card reasa-referral-card"><div className="reasa-auth-icon"><Users size={23}/></div><span className="reasa-eyebrow">Your REASA account</span><h1>Invite a curious friend</h1><p className="reasa-auth-copy">Hi {user.name || user.email}. Share your personal link so friends can join REASA. We do not display invented referral counts.</p><label className="reasa-referral-label">Your referral link<input readOnly value={link}/></label><div className="reasa-auth-actions"><button onClick={copy} className="reasa-button reasa-button-ghost"><Copy size={16}/> Copy link</button><button onClick={share} className="reasa-button reasa-button-primary"><Share2 size={16}/> Share invite</button></div>{message&&<p role="status" className="reasa-auth-status">{message}</p>}<button onClick={logout} className="reasa-logout"><LogOut size={15}/> Log out</button></section>;
}
