// app/ack/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DraftAgreement = {
  title: string;
  personA: string;
  personB: string;
  agreementText: string;

  includeNotary?: boolean;
  notary?: any;

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

function saveDraft(d: DraftAgreement) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

function exactMatch(a: string, b: string) {
  return a.trim() !== "" && a.trim() === b.trim();
}

export default function AckPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftAgreement | null>(null);

  const [typedA, setTypedA] = useState("");
  const [typedB, setTypedB] = useState("");
  const [ackA, setAckA] = useState(false);
  const [ackB, setAckB] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    if (!d) {
      router.replace("/new");
      return;
    }
    setDraft(d);
  }, [router]);

  const okA = useMemo(() => !!draft && exactMatch(typedA, draft.personA), [typedA, draft]);
  const okB = useMemo(() => !!draft && exactMatch(typedB, draft.personB), [typedB, draft]);

  const canFinalize = okA && okB && ackA && ackB;

  function finalize() {
    if (!draft) return;

    const now = Date.now();

    const next: DraftAgreement = {
      ...draft,
      acknowledgments: {
        personA: { typedName: draft.personA, timestamp: now },
        personB: { typedName: draft.personB, timestamp: now },
      },
    };

    // ✅ ensure we write before navigating
    saveDraft(next);

    // ✅ verify the write (prevents “saved nothing” mystery)
    const check = loadDraft();
    if (!check) {
      // If something is clearing sessionStorage, at least stay here.
      alert("Could not save receipt. Please try again.");
      return;
    }

    router.push("/receipt");
  }

  if (!draft) return null;

  return (
    <main className="min-h-screen px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-purple-600 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
          <div className="text-white/85 text-sm font-semibold">Mutual Acknowledgment</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-white">Acknowledge</div>
          <div className="mt-3 text-white/90 text-lg">
            Both people type their full name exactly as entered and acknowledge the agreement.
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-white/70 text-sm font-semibold">
              <span>Create</span>
              <span>Review</span>
              <span className="text-white font-semibold">Ack</span>
              <span>Receipt</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/20">
              <div className="h-2 w-[75%] rounded-full bg-white/85" />
            </div>
          </div>
        </div>

        <section className="ui-surface p-6">
          <div className="mt-1 space-y-4">
            <div className="ui-paper p-6">
              <div className="ui-label">Person A</div>
              <div className="ui-help mt-1">Expected: {draft.personA || "(missing)"}</div>

              <input
                className="ui-input-light mt-3"
                value={typedA}
                onChange={(e) => setTypedA(e.target.value)}
                placeholder="Type full name exactly"
              />

              <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={ackA}
                  onChange={(e) => setAckA(e.target.checked)}
                />
                I acknowledge this agreement.
              </label>

              {!okA && typedA.trim() ? (
                <div className="mt-2 text-sm text-rose-600 font-semibold">Name must match exactly.</div>
              ) : null}
            </div>

            <div className="ui-paper p-6">
              <div className="ui-label">Person B</div>
              <div className="ui-help mt-1">Expected: {draft.personB || "(missing)"}</div>

              <input
                className="ui-input-light mt-3"
                value={typedB}
                onChange={(e) => setTypedB(e.target.value)}
                placeholder="Type full name exactly"
              />

              <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={ackB}
                  onChange={(e) => setAckB(e.target.checked)}
                />
                I acknowledge this agreement.
              </label>

              {!okB && typedB.trim() ? (
                <div className="mt-2 text-sm text-rose-600 font-semibold">Name must match exactly.</div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button className="ui-btn-primary" disabled={!canFinalize} onClick={finalize}>
              Finalize Receipt
            </button>

            <button className="ui-btn-ghost" onClick={() => router.push("/review")}>
              Back to Review
            </button>

            {!canFinalize ? (
              <div className="text-white/70 text-sm">
                To continue: both names must match exactly and both boxes must be checked.
              </div>
            ) : null}
          </div>
        </section>

        <footer className="text-white/55 text-sm leading-6">
          Not legal advice. This is a clean record of what both people agreed to.
        </footer>
      </div>
    </main>
  );
}
