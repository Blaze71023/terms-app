"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const APP_META = {
  product: "TERMS",
  company: "ZeroHour Systems",
  internalCredits: ["SubZero", "Phantom Nemesis"],
  supportEmail: "support@zerohour.systems",
};

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

function shellClass() {
  return [
    "relative overflow-hidden rounded-[28px] border border-white/12",
    "bg-gradient-to-br from-white/[0.075] via-white/[0.045] to-white/[0.022]",
    "shadow-[0_18px_52px_rgba(0,0,0,0.44),0_0_38px_rgba(16,185,129,0.06)]",
    "backdrop-blur",
  ].join(" ");
}

function inputClass(valid?: boolean, invalid?: boolean) {
  return [
    "mt-3 w-full rounded-2xl border bg-gradient-to-br from-white/[0.06] to-white/[0.03]",
    "px-4 py-3 text-white placeholder:text-white/35 outline-none transition",
    valid
      ? "border-emerald-400/45 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-500/30"
      : invalid
        ? "border-rose-400/45 focus:border-rose-400/50 focus:ring-2 focus:ring-rose-500/25"
        : "border-white/10 focus:border-emerald-400/35 focus:ring-2 focus:ring-emerald-500/30",
  ].join(" ");
}

function sectionAccent() {
  return (
    <div className="mb-4 h-[2px] w-12 rounded-full bg-emerald-400/85 shadow-[0_0_16px_rgba(16,185,129,0.5)]" />
  );
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

  const okA = useMemo(
    () => !!draft && exactMatch(typedA, draft.personA),
    [typedA, draft]
  );

  const okB = useMemo(
    () => !!draft && exactMatch(typedB, draft.personB),
    [typedB, draft]
  );

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

    saveDraft(next);

    const check = loadDraft();
    if (!check) {
      alert("Could not save record. Please try again.");
      return;
    }

    router.push("/receipt");
  }

  if (!draft) return null;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,32,49,0.45),transparent_38%),radial-gradient(circle_at_18%_26%,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(37,99,235,0.10),transparent_24%),linear-gradient(180deg,rgba(2,5,10,0.96)_0%,rgba(2,7,13,0.98)_50%,rgba(2,5,10,0.98)_100%)]" />
        <div className="absolute left-1/2 top-0 h-[340px] w-[860px] -translate-x-1/2 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute left-[6%] top-[30%] h-[220px] w-[220px] rounded-full bg-cyan-400/6 blur-3xl" />
        <div className="absolute right-[7%] top-[14%] h-[280px] w-[280px] rounded-full bg-blue-500/8 blur-3xl" />
        <div className="absolute bottom-[8%] left-1/2 h-[240px] w-[760px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-3xl space-y-6">
        <section className={shellClass() + " p-7 md:p-8"}>
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/55 to-transparent" />
          <div className="absolute left-1/2 top-0 h-16 w-72 -translate-x-1/2 bg-emerald-400/10 blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-[34%] bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_48%),radial-gradient(circle_at_60%_40%,rgba(59,130,246,0.08),transparent_42%)]" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                {APP_META.product} · Acknowledge
              </div>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                Confirm <span className="text-emerald-300">Agreement</span>
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-white/72">
                Both people must type their full name exactly as entered, then
                confirm acknowledgment before the record is finalized.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/14 to-emerald-500/7 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.12)] md:block">
              {APP_META.company}
            </div>
          </div>

          <div className="relative mt-7">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">
              <span>Create</span>
              <span>Review</span>
              <span className="text-white/90">Acknowledge</span>
              <span>Record</span>
            </div>

            <div className="mt-3 h-[4px] rounded-full bg-white/8">
              <div className="h-[4px] w-[74%] rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.45)]" />
            </div>
          </div>
        </section>

        <section className={shellClass() + " p-6"}>
          <div className="absolute inset-y-0 left-0 w-[26%] bg-[radial-gradient(circle_at_left_center,rgba(16,185,129,0.07),transparent_62%)]" />

          <div className="relative">
            {sectionAccent()}
            <div className="text-xl font-semibold text-white">Identity confirmation</div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
              Each person must type their full name exactly as it was entered in
              the agreement. Then both people must confirm acknowledgment.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-5">
                <div className="text-sm font-semibold text-white">Person A</div>
                <div className="mt-1 text-sm leading-6 text-white/60">
                  Expected: {draft.personA || "(missing)"}
                </div>

                <input
                  className={inputClass(okA, !!typedA.trim() && !okA)}
                  value={typedA}
                  onChange={(e) => setTypedA(e.target.value)}
                  placeholder="Type full name exactly"
                />

                {typedA.trim() ? (
                  okA ? (
                    <div className="mt-2 text-sm font-semibold text-emerald-300">
                      Name matched.
                    </div>
                  ) : (
                    <div className="mt-2 text-sm font-semibold text-rose-300">
                      Name must match exactly.
                    </div>
                  )
                ) : null}

                <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-white/88">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-emerald-500"
                    checked={ackA}
                    onChange={(e) => setAckA(e.target.checked)}
                  />
                  I acknowledge this agreement.
                </label>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-5">
                <div className="text-sm font-semibold text-white">Person B</div>
                <div className="mt-1 text-sm leading-6 text-white/60">
                  Expected: {draft.personB || "(missing)"}
                </div>

                <input
                  className={inputClass(okB, !!typedB.trim() && !okB)}
                  value={typedB}
                  onChange={(e) => setTypedB(e.target.value)}
                  placeholder="Type full name exactly"
                />

                {typedB.trim() ? (
                  okB ? (
                    <div className="mt-2 text-sm font-semibold text-emerald-300">
                      Name matched.
                    </div>
                  ) : (
                    <div className="mt-2 text-sm font-semibold text-rose-300">
                      Name must match exactly.
                    </div>
                  )
                ) : null}

                <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-white/88">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-emerald-500"
                    checked={ackB}
                    onChange={(e) => setAckB(e.target.checked)}
                  />
                  I acknowledge this agreement.
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className={shellClass() + " p-6"}>
          <div className="absolute inset-y-0 right-0 w-[30%] bg-[radial-gradient(circle_at_right_center,rgba(16,185,129,0.08),transparent_60%)]" />

          <div className="relative">
            {sectionAccent()}
            <div className="flex flex-col gap-3">
              <button
                className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_0_28px_rgba(16,185,129,0.24),0_12px_28px_rgba(0,0,0,0.24)] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canFinalize}
                onClick={finalize}
              >
                Finalize Record
              </button>

              <button
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
                onClick={() => router.push("/review")}
              >
                Back to Review
              </button>

              {!canFinalize ? (
                <div className="text-sm leading-6 text-white/62">
                  To continue, both names must match exactly and both acknowledgment
                  boxes must be checked.
                </div>
              ) : (
                <div className="text-sm font-semibold text-emerald-300">
                  Ready to record and time-stamp.
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center text-sm leading-6 text-white/42">
          This step confirms identity and acknowledgment. A {APP_META.company} product.
        </footer>
      </div>
    </main>
  );
}