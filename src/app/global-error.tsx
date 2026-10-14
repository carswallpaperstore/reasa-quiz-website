
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0b1020",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "460px" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>
              ⚠️
            </div>

            <h1 style={{ fontSize: "28px" }}>
              REASA is temporarily unavailable
            </h1>

            <p style={{ color: "#b8c0d9", lineHeight: 1.7 }}>
              Something went wrong while loading the website.
              Please try again.
            </p>

            {error.digest && (
              <p style={{ color: "#8d98b5", fontSize: "12px" }}>
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={() => reset()}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                border: "none",
                borderRadius: "10px",
                background: "#7c5cff",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
    