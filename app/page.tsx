// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DraftAgreement = {
  title: string;
  personA: string;
  personB: string;
  agreementText: string;
  includeNotary?: boolean;
};
<div className="fixed bottom-4 right-4 z-50 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white shadow-lg">
  PREVIEW BUILD – SAFE
</div>

const STORAGE_KEY = "draftAgreement";

function hasDraft(): boolean {
  try {
    return !!sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [resumeAvailable, setResumeAvailable] = useState(false);

  useEffect(() => {
    setResumeAvailable(hasDraft());
  }, []);

  function clearDraft() {
    sessionStorage.removeItem(STORAGE_KEY);
    setResumeAvailable(false);
  }

  return (
    <main className="min-h-screen px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Hero */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-purple-600 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
          <div className="text-white/85 text-sm font-semibold">Mutual Acknowledgment</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-white">Terms App</div>
          <div className="mt-3 text-white/90 text-lg">
            Create an agreement, review it together, sign, and print a receipt.
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-white/70 text-sm font-semibold">
              <span className="text-white font-semibold">Create</span>
              <span>Review</span>
              <span>Sign</span>
              <span>Receipt</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/20">
              <div className="h-2 w-[10%] rounded-full bg-white/85" />
            </div>
          </div>
        </div>

        {/* Body */}
        <section className="ui-surface p-6">
          <div className="ui-paper p-6">
            <div className="text-base font-semibold text-slate-900">What this does</div>
            <p className="mt-2 ui-help leading-6">
              This app records a shared understanding in plain language. It is not legal advice.
            </p>
            <p className="mt-3 ui-help leading-6">
              If notarization is required, the notary must witness the signing and complete the
              certificate per the law where notarization occurs.
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {resumeAvailable ? (
              <>
                <button className="ui-btn-ghost" onClick={() => router.push("/new")}>
                  Resume Draft
                </button>
                <button className="ui-btn-ghost" onClick={clearDraft}>
                  Clear Saved Draft
                </button>
              </>
            ) : null}

            <button className="ui-btn-primary" onClick={() => router.push("/new")}>
              Create Agreement
            </button>
          </div>

          <div className="mt-5 text-white/65 text-sm leading-6">
            Tip: keep it short, clear, and true.
          </div>
        </section>

        <footer className="text-white/55 text-sm leading-6">
          Not legal advice. If notarization is required, the notary must witness and complete the
          certificate per the law where notarization occurs.
        </footer>
      </div>
    </main>
  );
}
