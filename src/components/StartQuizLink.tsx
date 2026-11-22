"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

type Props = {
  href: string;
  puzzleId: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  "aria-label"?: string;
};

/**
 * Every deliberate entry into a quiz starts a clean attempt.
 * Progress is still persisted between question URLs and browser refreshes
 * after the quiz has started.
 */
export default function StartQuizLink({
  href,
  puzzleId,
  className,
  style,
  children,
  "aria-label": ariaLabel,
}: Props) {
  function beginFreshAttempt() {
    try {
      localStorage.removeItem(`reasa-quiz-${puzzleId}`);
    } catch {
      // Storage may be unavailable; the quiz can still be played.
    }
  }

  return (
    <Link
      href={href}
      prefetch={true}
      className={className}
      style={style}
      aria-label={ariaLabel}
      onClick={beginFreshAttempt}
    >
      {children}
    </Link>
  );
}
