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

  useEffect(() => {
    const d = loadDraft();
    if (!d) {
      router.replace("/new");
      return;
    }
    setDraft(d);
  }, [router]);

  const preview = useMemo(() => {
    if (!draft) return "";

    const lines: string[] = [];
    lines.push(draft.title?.trim() ? draft.title.trim() : "(Untitled)");
    lines.push("");
    lines.push("People present:");
    lines.push(`- ${draft.personA || "Person A"}`);
    lines.push(`- ${draft.personB || "Person B"}`);
    lines.push("");
    lines.push(draft.agreementText || "");

    if (draft.includeNotary && draft.notary?.certificateText) {
      lines.push("");
      lines.push("Notary:");
      lines.push("Venue-based: notary completes certificate per the law where notarization occurs.");
      if (draft.notary.mode) lines.push(`Mode: ${draft.notary.mode}`);
      if (draft.notary.state || draft.notary.parish) {
        lines.push(
          `Venue: ${draft.notary.state || ""}${draft.notary.parish ? " — Parish of " + draft.notary.parish : ""}`
        );
      }
      lines.push("");
      lines.push(draft.notary.certificateText);
    }

    return lines.join("\n");
  }, [draft]);

  async function copyPreview() {
    await navigator.clipboard.writeText(preview);
  }

  if (!draft) return null;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-purple-600 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
          <div className="text-white/85 text-sm font-semibold">Mutual Acknowledgment</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-white">Review</div>
          <div className="mt-3 text-white/90 text-lg">Read it together. If it’s true, proceed.</div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-white/70 text-sm font-semibold">
              <span>Create</span>
              <span className="text-white font-semibold">Review</span>
              <span>Ack</span>
              <span>Receipt</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/20">
              <div className="h-2 w-[50%] rounded-full bg-white/85" />
            </div>
          </div>
        </div>

        <section className="ui-surface p-6">
          <div className="ui-paper p-6">
            <div className="text-sm text-slate-500">Preview</div>
            <div className="mt-3 whitespace-pre-wrap text-slate-800 leading-6">{preview}</div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <button className="ui-btn-ghost" onClick={() => router.push("/new")}>
              Back
            </button>
            <button className="ui-btn-ghost" onClick={copyPreview}>
              Copy
            </button>
            <button className="ui-btn-primary" onClick={() => router.push("/ack")}>
              Proceed to Acknowledge
            </button>
          </div>
        </section>

        <footer className="text-white/55 text-sm leading-6">
          Not legal advice. This is a clean record of what both people agreed to.
        </footer>
      </div>
    </main>
  );
}
