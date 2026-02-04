// app/receipt/page.tsx
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
    mode?: string; // e.g. "In-person"
    state?: string;
    parish?: string;
    certificateText?: string;
  };

  acknowledgments?: {
    personA?: { typedName: string; timestamp: number };
    personB?: { typedName: string; timestamp: number };
  };
};

const STORAGE_KEY = "draftAgreement";

// Minimal “paid” flag (no backend). Later you can flip this when payment succeeds.
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

export default function ReceiptPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftAgreement | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    setDraft(d);
    setIsPaid(sessionStorage.getItem(PAID_KEY) === "true");
    setCheckedStorage(true);
  }, []);

  const createdAtLabel = useMemo(() => {
    if (!draft) return "";
    const ts =
      draft.acknowledgments?.personA?.timestamp ??
      draft.acknowledgments?.personB?.timestamp ??
      Date.now();
    return new Date(ts).toLocaleString();
  }, [draft]);

  const hasNotary = !!(draft?.includeNotary && draft?.notary?.certificateText);

  function newAgreement() {
    sessionStorage.removeItem(STORAGE_KEY);
    router.push("/new");
  }

  if (checkedStorage && !draft) {
    return (
      <main className="min-h-screen app-bg-bright px-4 py-8 text-white">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="ui-surface p-6">
            <div className="text-white font-semibold text-xl">Receipt not found</div>
            <div className="mt-2 text-white/70">
              Your draft wasn’t found in this tab’s session storage. This can happen if storage was cleared or the page
              was opened in a new tab/window.
            </div>

            <div className="mt-6 space-y-3">
              <button className="ui-btn-primary" onClick={() => router.push("/ack")}>
                Back to Acknowledge
              </button>
              <button className="ui-btn-ghost" onClick={() => router.push("/new")}>
                Back to Create
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
        {/* Hero */}
        <div className="ui-hero p-6 no-print">
          <div className="text-white/90 text-sm font-semibold">Mutual Acknowledgment</div>
          <div className="mt-2 text-3xl font-semibold text-white">Receipt</div>
          <div className="mt-2 text-white/90">Preview free, then unlock the final.</div>
        </div>

        {/* Document (screen + print) */}
        <section className="ui-paper p-6 print-paper relative overflow-hidden">
          {!isPaid && (
            <div className="preview-watermark">
              DRAFT – UNFINALIZED AGREEMENT
              <span className="wm-sub">Generated via Terms App (Preview Mode)</span>
              <span className="wm-small">Finalization requires unlock.</span>
            </div>
          )}

          {/* ========= PAGE 1: AGREEMENT ========= */}
          <div className="receipt-block">
            <div className="print-logo">TERMS APP</div>
            <div className="print-title">Record of Mutual Acknowledgment</div>

            <div className="print-section-title">Agreement</div>

            <div className="print-body">
              On this date, <strong>{draft.personA || "Person A"}</strong> (“Seller”) agrees to sell, and{" "}
              <strong>{draft.personB || "Person B"}</strong> (“Buyer”) agrees to purchase, the following:
            </div>

            <div className="print-body print-pre">{draft.agreementText || ""}</div>

            <div className="print-section-title">Acknowledgment</div>
            <div className="print-body">
              This record reflects our mutual understanding at the time of agreement.
              <div className="mt-2">
                <strong>Created:</strong> {createdAtLabel}
              </div>
            </div>

            <div className="print-section-title">Signatures</div>
            <div className="print-body">
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.6fr", gap: "16px" }}>
                <div>
                  <div>
                    <strong>Person A:</strong> ________________________________ ({draft.personA || "Person A"})
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <strong>Person B:</strong> ________________________________ ({draft.personB || "Person B"})
                  </div>
                </div>
                <div>
                  <div>
                    <strong>Date:</strong> ____________________
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <strong>Date:</strong> ____________________
                  </div>
                </div>
              </div>
            </div>

            <div className="print-footer">
              Not legal advice. This is a plain-language record of what both people agreed to.
            </div>
          </div>

          {/* ========= PAGE 2: NOTARY (only if included) ========= */}
          {hasNotary ? (
            <div className="notary-page notary-block">
              <div className="print-logo">TERMS APP</div>
              <div className="print-title">Notary Certificate</div>

              <div className="print-body print-small">
                This certificate may be completed, modified, or replaced by the notary as required by applicable state law.
                <br />
                <strong>Parties to be notarized:</strong> {draft.personA || "Person A"} and {draft.personB || "Person B"}.
                <br />
                Venue-based: the notary completes the certificate per the law where notarization occurs.
                {draft.notary?.mode ? `  Mode: ${draft.notary.mode}.` : ""}
                {draft.notary?.state ? `  Venue: ${draft.notary.state}` : ""}
                {draft.notary?.parish ? ` — County/Parish of ${draft.notary.parish}` : ""}
              </div>

              <div className="print-notary-box print-mono print-pre">{draft.notary?.certificateText || ""}</div>
            </div>
          ) : null}
        </section>

        {/* Controls */}
        <div className="space-y-3 no-print">
          <button className="ui-btn-ghost" onClick={() => router.push("/review")}>
            Preview (Free)
          </button>

          <button className="ui-btn-primary" onClick={() => alert("Unlock Final – $1.99 (coming next)")}>
            Unlock Final – $1.99
          </button>

          <button className="ui-btn-ghost" onClick={() => alert("Go Pro – $9.99 / month (coming next)")}>
            Go Pro – $9.99 / month
          </button>

          <button className="ui-btn-ghost" onClick={newAgreement}>
            New Agreement
          </button>
        </div>

        <footer className="text-white/55 text-sm leading-6 no-print">
          Not legal advice. This is a clean record of what both people agreed to.
        </footer>
      </div>
    </main>
  );
}
