export default function CategoryLoading() {
  return (
    <main className="reasa-route-skeleton" role="status" aria-label="Loading category">
      <div className="reasa-skeleton-header">
        <span className="reasa-skeleton reasa-skeleton-brand" />
        <span className="reasa-skeleton reasa-skeleton-nav" />
      </div>
      <section className="reasa-skeleton-hero compact">
        <span className="reasa-skeleton reasa-skeleton-badge" />
        <span className="reasa-skeleton reasa-skeleton-title" />
        <span className="reasa-skeleton reasa-skeleton-copy" />
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
      <span className="reasa-skeleton-live">Loading challenges…</span>
    </main>
  );
}
