
"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("REASA Page Error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#0b1020",
        color: "#ffffff",
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "460px" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>
          ⚠️
        </div>

        <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>
          Something went wrong
        </h1>

        <p style={{ color: "#b8c0d9", lineHeight: 1.7 }}>
          We couldn't load this page. Please try again.
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
  );
}
