export default function QuizLoading() {
  return (
    <main className="reasa-quiz-loading" role="status" aria-label="Loading quiz">
      <div className="reasa-quiz-loading-wrap">
        <div className="reasa-quiz-loading-top">
          <span className="reasa-skeleton reasa-skeleton-brand" />
          <span className="reasa-skeleton reasa-skeleton-small" />
          <span className="reasa-skeleton reasa-skeleton-back" />
        </div>
        <div className="reasa-quiz-loading-progress">
          <span className="reasa-skeleton reasa-skeleton-small" />
          <span className="reasa-skeleton reasa-skeleton-progress" />
          <span className="reasa-skeleton reasa-skeleton-small" />
        </div>
        <section className="reasa-quiz-loading-card">
          <span className="reasa-skeleton reasa-quiz-loading-image" />
          <div className="reasa-quiz-loading-body">
            <span className="reasa-skeleton reasa-skeleton-badge" />
            <span className="reasa-skeleton reasa-quiz-loading-question" />
            <span className="reasa-skeleton reasa-quiz-loading-question short" />
            <div className="reasa-quiz-loading-options">
              {Array.from({ length: 4 }, (_, index) => (
                <span className="reasa-skeleton reasa-quiz-loading-option" key={index} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <span className="reasa-skeleton-live">Getting your question ready…</span>
    </main>
  );
}
