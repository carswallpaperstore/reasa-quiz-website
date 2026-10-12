
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Puzzle,
    PlusCircle,
    FolderOpen,
    Users,
    BarChart3,
    Settings,
    ExternalLink,
    LogOut,
    Menu,
    X,
    ListChecks,
} from "lucide-react";
import { useState } from "react";

const menu = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "All Puzzles", href: "/admin/puzzles", icon: Puzzle },
    { label: "Add Puzzle", href: "/admin/puzzles/new", icon: PlusCircle },
    { label: "Categories", href: "/admin/categories", icon: FolderOpen },
    { label: "Questions", href: "/admin/questions", icon: ListChecks },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
];

import type { ReactNode } from "react";

export default function AdminNav({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    async function logout() {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
        } catch {
            setLoggingOut(false);
            alert("Logout failed. Please try again.");
        }
    }

    return (
        <div className="reasa-admin-shell">
            <header className="reasa-admin-topbar">
                <Link href="/admin" className="reasa-admin-brand">
                    <span className="reasa-admin-brand-icon">R</span>
                    <span>
                        REASA
                        <small>ADMIN PANEL</small>
                    </span>
                </Link>

                <div className="reasa-admin-top-actions">
                    <Link href="/" target="_blank" className="reasa-admin-view-site">
                        <ExternalLink size={16} />
                        View Website
                    </Link>

                    <button
                        type="button"
                        className="reasa-admin-mobile-toggle"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle admin menu"
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            <div className="reasa-admin-body">
                <aside className={`reasa-admin-sidebar ${open ? "is-open" : ""}`}>
                    <p className="reasa-admin-menu-label">WORKSPACE</p>

                    <nav className="reasa-admin-menu">
                        {menu.map(({ label, href, icon: Icon }) => {
                            const active =
                                href === "/admin"
                                    ? pathname === "/admin"
                                    : pathname === href ||
                                    pathname.startsWith(href + "/");

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`reasa-admin-menu-link ${active ? "active" : ""
                                        }`}
                                    onClick={() => setOpen(false)}
                                >
                                    <Icon size={18} />
                                    <span>{label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="reasa-admin-sidebar-bottom">
                        <button
                            type="button"
                            className="reasa-admin-logout"
                            onClick={logout}
                            disabled={loggingOut}
                        >
                            <LogOut size={18} />
                            {loggingOut ? "Logging out..." : "Log out"}
                        </button>
                    </div>
                </aside>

                {open && (
                    <button
                        type="button"
                        className="reasa-admin-mobile-overlay"
                        aria-label="Close menu"
                        onClick={() => setOpen(false)}
                    />
                )}

                <main className="reasa-admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
