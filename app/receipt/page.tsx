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

  useEffect(() => {
    const d = loadDraft();
    setDraft(d);
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

  // ✅ Copy text = plain / complete / no layout quirks
  const receiptTextForCopy = useMemo(() => {
    if (!draft) return "";

    const lines: string[] = [];
    lines.push("Record of Mutual Acknowledgment");
    lines.push(`Created: ${createdAtLabel}`);
    if (draft.title) lines.push(`Title: ${draft.title}`);
    lines.push("");
    lines.push("People:");
    lines.push(`- ${draft.personA || "Person A"}`);
    lines.push(`- ${draft.personB || "Person B"}`);
    lines.push("");
    lines.push("Agreement:");
    lines.push(draft.agreementText || "");
    lines.push("");
    lines.push("This record reflects our mutual understanding at the time of agreement.");

    if (hasNotary) {
      lines.push("");
      lines.push("Notary Certificate:");
      lines.push(
        "This certificate may be completed, modified, or replaced by the notary as required by applicable state law."
      );
      lines.push(`Parties to be notarized: ${draft.personA || "Person A"} and ${draft.personB || "Person B"}.`);
      lines.push(
        "Venue-based: the notary completes the certificate per the law where notarization occurs."
      );
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

    lines.push("");
    lines.push("Not legal advice.");

    return lines.join("\n");
  }, [draft, createdAtLabel, hasNotary]);

  function newAgreement() {
    sessionStorage.removeItem(STORAGE_KEY);
    router.push("/new");
  }

  async function copyText() {
    if (!draft) return;
    await navigator.clipboard.writeText(receiptTextForCopy);
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
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* ✅ Screen hero (bright gradient like /ack) */}
        <div className="ui-hero p-6 no-print">
          <div className="text-white/90 text-sm font-semibold">Mutual Acknowledgment</div>
          <div className="mt-2 text-3xl font-semibold text-white">Receipt</div>
          <div className="mt-2 text-white/90">Print it or copy it.</div>
        </div>

        {/* Document (screen + print) */}
        <section className="ui-paper p-6 print-paper">
          {/* ========= PAGE 1: AGREEMENT ========= */}
          <div className="receipt-block">
            <div className="print-logo">TERMS APP</div>
            <div className="print-title">Record of Mutual Acknowledgment</div>

            <div className="print-section-title">Agreement</div>

            <div className="print-body">
              On this date, <strong>{draft.personA || "Person A"}</strong> (“Seller”) agrees to sell, and{" "}
              <strong>{draft.personB || "Person B"}</strong> (“Buyer”) agrees to purchase, the following:
            </div>

            {/* Agreement text itself */}
            <div className="print-body print-pre">{draft.agreementText || ""}</div>

            {/* One (1) acknowledgment sentence only */}
            <div className="print-section-title">Acknowledgment</div>
            <div className="print-body">
              This record reflects our mutual understanding at the time of agreement.
              <div className="mt-2">
                <strong>Created:</strong> {createdAtLabel}
              </div>
            </div>

            {/* Signatures */}
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

            {/* Keep disclaimer on agreement page only */}
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

              <div className="print-notary-box print-mono print-pre">
                {draft.notary?.certificateText || ""}
              </div>
            </div>
          ) : null}
        </section>

        {/* Controls */}
        <div className="space-y-3 no-print">
          <button className="ui-btn-ghost" onClick={() => window.print()}>
            Print
          </button>
          <button className="ui-btn-ghost" onClick={copyText}>
            Copy Text
          </button>
          <button className="ui-btn-primary" onClick={newAgreement}>
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
