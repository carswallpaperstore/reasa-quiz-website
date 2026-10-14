
import Header from "@/components/Header";

function SkeletonBlock({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`reasa-skeleton ${className}`} />;
}

export default function GlobalLoading() {
  return (
    <>
      {/* Navbar remains visible while the destination page loads */}
      <Header />

      <main className="reasa-loading-page" aria-busy="true">
        <section className="reasa-loading-hero">
          <div className="reasa-shell">
            <SkeletonBlock className="reasa-skeleton-badge" />
            <SkeletonBlock className="reasa-skeleton-title" />
            <SkeletonBlock className="reasa-skeleton-copy" />
            <SkeletonBlock className="reasa-skeleton-copy reasa-skeleton-copy-short" />
          </div>
        </section>

        <section className="reasa-shell reasa-loading-content">
          <div className="reasa-loading-heading">
            <SkeletonBlock className="reasa-skeleton-heading" />
            <SkeletonBlock className="reasa-skeleton-small" />
          </div>

          <div className="reasa-loading-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <article className="reasa-loading-card" key={index}>
                <SkeletonBlock className="reasa-skeleton-image" />
                <div className="reasa-loading-card-body">
                  <SkeletonBlock className="reasa-skeleton-badge" />
                  <SkeletonBlock className="reasa-skeleton-card-title" />
                  <SkeletonBlock className="reasa-skeleton-copy" />
                  <SkeletonBlock className="reasa-skeleton-copy-short" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
