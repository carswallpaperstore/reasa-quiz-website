import type { Metadata } from "next";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://reasa.in"),
  applicationName: "REASA",
  openGraph: { title: "REASA | Brain Puzzles & Multiple-Choice Quizzes", description: "Play topic-focused multiple-choice challenges for curious minds.", siteName: "REASA", type: "website" },
  twitter: { card: "summary_large_image", title: "REASA | Brain Puzzles & Quizzes", description: "Challenge your mind with topic-focused MCQs." },
  title: { default: "REASA | Brain Puzzles & Multiple-Choice Quizzes", template: "%s | REASA" },
  description:
    "Play topic-focused multiple-choice quizzes across brain puzzles, world geography, science, space, history, technology, wildlife and mathematics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   
<html lang="en">
  <head>
    <link
      rel="preconnect"
      href="https://images.unsplash.com"
      crossOrigin="anonymous"
    />
    <link
      rel="dns-prefetch"
      href="//images.unsplash.com"
    />
    <link
      rel="preload"
      as="image"
      href="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2000&q=80"
      media="(min-width: 761px)"
    />
    <link
      rel="preload"
      as="image"
      href="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1000&q=75"
      media="(max-width: 760px)"
    />
  </head>
  <body>
    {children}
    <SiteFooter />
  </body>
</html>

  );
}