"use client";

import { usePathname } from "next/navigation";

function HomeOpeningLoader() {
  return (
    <main className="reasa-home-opening-loader" role="status" aria-label="Opening REASA">
      <img src="/reasa-loading-logo.webp" alt="REASA" width="112" height="112" fetchPriority="high" />
      <span className="reasa-home-splash-track" aria-hidden="true"><i /></span>
    </main>
  );
}

function RouteSkeleton() {
  return (
    <main className="reasa-route-skeleton" role="status" aria-label="Loading page">
      <div className="reasa-skeleton-header">
        <span className="reasa-skeleton reasa-skeleton-brand" />
        <span className="reasa-skeleton reasa-skeleton-nav" />
      </div>
      <section className="reasa-skeleton-hero">
        <span className="reasa-skeleton reasa-skeleton-badge" />
        <span className="reasa-skeleton reasa-skeleton-title" />
        <span className="reasa-skeleton reasa-skeleton-copy" />
        <span className="reasa-skeleton reasa-skeleton-copy reasa-skeleton-copy-short" />
        <span className="reasa-skeleton reasa-skeleton-button" />
      </section>
      <section className="reasa-skeleton-content">
        <span className="reasa-skeleton reasa-skeleton-heading" />
        <div className="reasa-skeleton-grid">
          {Array.from({ length: 6 }, (_, index) => (
            <article className="reasa-loading-card" key={index}>
              <span className="reasa-skeleton reasa-skeleton-image" />
              <div className="reasa-loading-card-body">
                <span className="reasa-skeleton reasa-skeleton-badge" />
                <span className="reasa-skeleton reasa-skeleton-card-title" />
                <span className="reasa-skeleton reasa-skeleton-copy" />
              </div>
            </article>
          ))}
        </div>
      </section>
      <span className="reasa-skeleton-live">Loading REASA…</span>
    </main>
  );
}

export default function GlobalLoading() {
  const pathname = usePathname();
  return pathname === "/" ? <HomeOpeningLoader /> : <RouteSkeleton />;
}
