
import Link from "next/link";
import {
  ArrowDownToLine,
  BrainCircuit,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Header from "@/components/Header";

export const metadata = {
  title: "Download REASA App",
  description:
    "Download the REASA Android app and enjoy quizzes and brain challenges on your phone.",
};

export default function DownloadAppPage() {
  return (
    <>
      <Header />

      <main className="reasa-download-page">
        <section className="reasa-download-hero">
          <div className="reasa-download-glow" />

          <div className="reasa-download-icon">
            <BrainCircuit size={48} strokeWidth={1.6} />
          </div>

          <span className="reasa-download-eyebrow">
            YOUR BRAIN. YOUR CHALLENGE.
          </span>

          <h1>
            Take REASA
            <br />
            <span>Anywhere.</span>
          </h1>

          <p className="reasa-download-description">
            Enjoy brain teasers, knowledge quizzes and daily challenges
            with the REASA Android app.
          </p>

          <a
            href="/reasa.apk"
            download="REASA.apk"
            className="reasa-download-button"
          >
            <ArrowDownToLine size={21} />
            Download Android App
          </a>

          <p className="reasa-download-note">
            Android app · APK download
          </p>

          <div className="reasa-download-benefits">
            <div>
              <CheckCircle2 size={19} />
              <span>Easy to install</span>
            </div>
            <div>
              <Smartphone size={19} />
              <span>Made for Android</span>
            </div>
            <div>
              <ShieldCheck size={19} />
              <span>Official REASA download</span>
            </div>
          </div>
        </section>

        <section className="reasa-install-section">
          <span className="reasa-download-eyebrow">GET STARTED</span>
          <h2>Install REASA in 3 steps</h2>

          <div className="reasa-install-grid">
            <article className="reasa-install-card">
              <span>01</span>
              <h3>Download</h3>
              <p>
                Tap the Download Android App button and wait for the APK
                file to finish downloading.
              </p>
            </article>

            <article className="reasa-install-card">
              <span>02</span>
              <h3>Open the file</h3>
              <p>
                Open the downloaded REASA APK from your phone&apos;s
                Downloads folder.
              </p>
            </article>

            <article className="reasa-install-card">
              <span>03</span>
              <h3>Install and play</h3>
              <p>
                If Android asks for permission to install this file,
                review the source and allow it only if you trust it.
                Then open REASA and start playing.
              </p>
            </article>
          </div>

          <p className="reasa-download-disclaimer">
            Install only the APK downloaded from the official REASA website.
            Android may display a security warning for apps installed outside
            Google Play. Review it carefully before continuing.
          </p>

          <Link href="/" className="reasa-download-back">
            ← Back to REASA
          </Link>
        </section>
      </main>
    </>
  );
}
