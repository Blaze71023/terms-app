// app/review/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DraftAgreement = {
  title: string;
  personA: string;
  personB: string;
  agreementText: string;

  includeNotary?: boolean;
  notary?: {
    mode?: string;
    state?: string;
    parish?: string;
    certificateText?: string;
  };
};

const STORAGE_KEY = "draftAgreement";
const PAID_KEY = "terms_isPaid"; // set to "true" to remove watermark

function loadDraft(): DraftAgreement | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftAgreement;
  } catch {
    return null;
  }
}

export default function ReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftAgreement | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    if (!d) {
      router.replace("/new");
      return;
    }
    setDraft(d);
    setIsPaid(sessionStorage.getItem(PAID_KEY) === "true");
  }, [router]);

  const hasNotary = !!(draft?.includeNotary && draft?.notary?.certificateText);

  const preview = useMemo(() => {
    if (!draft) return "";

    const lines: string[] = [];
    lines.push(draft.title?.trim() ? draft.title.trim() : "(Untitled)");
    lines.push("");
    lines.push("People:");
    lines.push(`- ${draft.personA || "Person A"}`);
    lines.push(`- ${draft.personB || "Person B"}`);
    lines.push("");
    lines.push("Agreement:");
    lines.push(draft.agreementText || "");

    if (hasNotary) {
      lines.push("");
      lines.push("Notary Certificate:");
      lines.push("Venue-based: notary completes certificate per the law where notarization occurs.");
      if (draft.notary?.mode) lines.push(`Mode: ${draft.notary.mode}`);
      if (draft.notary?.state || draft.notary?.parish) {
        lines.push(
          `Venue: ${draft.notary?.state || ""}${
            draft.notary?.parish ? " — County/Parish of " + draft.notary.parish : ""
          }`
        );
      }
      lines.push("");
      lines.push(draft.notary?.certificateText || "");
    }

    return lines.join("\n");
  }, [draft, hasNotary]);

  if (!draft) return null;

  return (
    <main className="min-h-screen px-4 py-8 text-white">
      <style jsx global>{`
        .preview-watermark {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-20deg);
          font-size: 2.5rem;
          font-weight: 800;
          color: rgba(0, 0, 0, 0.08);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          text-align: center;
          letter-spacing: 0.02em;
        }
        .preview-watermark .wm-sub {
          display: block;
          margin-top: 0.35rem;
          font-size: 1.05rem;
          font-weight: 700;
        }
        .preview-watermark .wm-small {
          display: block;
          margin-top: 0.25rem;
          font-size: 0.95rem;
          font-weight: 600;
        }
      `}</style>

      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Match Receipt hero */}
        <div className="ui-hero p-6">
          <div className="text-white/90 text-sm font-semibold">Mutual Acknowledgment</div>
          <div className="mt-2 text-3xl font-semibold text-white">Review</div>
          <div className="mt-2 text-white/90">Read it together. If it’s true, proceed.</div>
        </div>

        {/* Document */}
        <section className="ui-paper p-6 relative overflow-hidden">
          {!isPaid && (
            <div className="preview-watermark">
              DRAFT – UNFINALIZED AGREEMENT
              <span className="wm-sub">Generated via Terms App (Preview Mode)</span>
              <span className="wm-small">Finalization requires unlock.</span>
            </div>
          )}

          <div className="receipt-block">
            <div className="print-logo">TERMS APP</div>
            <div className="print-title">Preview</div>

            <div className="print-section-title">Agreement</div>
            <div className="print-body print-pre">{preview}</div>

            <div className="print-footer">
              Not legal advice. This is a plain-language record of what both people agreed to.
            </div>
          </div>
        </section>

        {/* Controls (no Copy) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button className="ui-btn-ghost" onClick={() => router.push("/new")}>
            Back
          </button>
          <button className="ui-btn-primary" onClick={() => router.push("/ack")}>
            Proceed to Acknowledge
          </button>
        </div>

        <footer className="text-white/55 text-sm leading-6">
          Not legal advice. This is a clean record of what both people agreed to.
        </footer>
      </div>
    </main>
  );
}
