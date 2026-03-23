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
  notary?: {
    mode?: string;
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
const PAID_KEY = "terms_isPaid";

function loadDraft(): DraftAgreement | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftAgreement;
  } catch {
    return null;
  }
}

function shellClass() {
  return [
    "relative overflow-hidden rounded-[28px] border border-white/12",
    "bg-gradient-to-br from-white/[0.075] via-white/[0.045] to-white/[0.022]",
    "shadow-[0_18px_52px_rgba(0,0,0,0.44),0_0_38px_rgba(16,185,129,0.06)]",
    "backdrop-blur",
  ].join(" ");
}

function sectionAccent() {
  return (
    <div className="mb-4 h-[2px] w-12 rounded-full bg-emerald-400/85 shadow-[0_0_16px_rgba(16,185,129,0.5)]" />
  );
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

  function shareRecord() {
    if (typeof window === "undefined") return;

    if (navigator.share) {
      navigator
        .share({
          title: "TERMS Record",
          text: "A shared agreement record was created in TERMS.",
          url: window.location.href,
        })
        .catch(() => {});
      return;
    }

    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("Link copied."))
      .catch(() => {});
  }

  if (checkedStorage && !draft) {
    return (
      <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,32,49,0.45),transparent_38%),radial-gradient(circle_at_18%_26%,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(37,99,235,0.10),transparent_24%),linear-gradient(180deg,rgba(2,5,10,0.96)_0%,rgba(2,7,13,0.98)_50%,rgba(2,5,10,0.98)_100%)]" />
          <div className="absolute left-1/2 top-0 h-[340px] w-[860px] -translate-x-1/2 rounded-full bg-emerald-400/8 blur-3xl" />
          <div className="absolute left-[6%] top-[30%] h-[220px] w-[220px] rounded-full bg-cyan-400/6 blur-3xl" />
          <div className="absolute right-[7%] top-[14%] h-[280px] w-[280px] rounded-full bg-blue-500/8 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-3xl space-y-6">
          <section className={shellClass() + " p-6"}>
            {sectionAccent()}
            <div className="text-xl font-semibold text-white">Record not found</div>
            <div className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
              Your draft was not found in this tab’s session storage. This can happen
              if storage was cleared or the page was opened in a new tab or window.
            </div>

            <div className="mt-6 space-y-3">
              <button
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_0_28px_rgba(16,185,129,0.24),0_12px_28px_rgba(0,0,0,0.24)] transition hover:bg-emerald-300"
                onClick={() => router.push("/ack")}
              >
                Back to Acknowledge
              </button>

              <button
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
                onClick={() => router.push("/new")}
              >
                Back to Create
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!draft) return null;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-white">
      <style jsx global>{`
        .preview-watermark {
          position: absolute;
          top: 42%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-18deg);
          font-size: 2.35rem;
          font-weight: 800;
          color: rgba(0, 0, 0, 0.08);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          text-align: center;
          letter-spacing: 0.03em;
          z-index: 2;
        }

        .preview-watermark .wm-sub {
          display: block;
          margin-top: 0.35rem;
          font-size: 0.98rem;
          font-weight: 700;
        }

        .preview-watermark .wm-small {
          display: block;
          margin-top: 0.2rem;
          font-size: 0.86rem;
          font-weight: 600;
        }
      `}</style>

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
                {APP_META.product} · Record
              </div>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                Record <span className="text-emerald-300">Finalized</span>
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-white/72">
                This is the completed shared record of what was agreed and
                acknowledged.
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
              <span>Acknowledge</span>
              <span className="text-white/90">Record</span>
            </div>

            <div className="mt-3 h-[4px] rounded-full bg-white/8">
              <div className="h-[4px] w-full rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.45)]" />
            </div>
          </div>
        </section>

        <section className={shellClass() + " p-4 sm:p-6"}>
          <div className="absolute inset-y-0 left-0 w-[26%] bg-[radial-gradient(circle_at_left_center,rgba(16,185,129,0.07),transparent_62%)]" />

          <div className="relative">
            {sectionAccent()}

            <div className="rounded-[28px] bg-white text-black shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
              <div className="relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-8 sm:py-10">
                {!isPaid && (
                  <div className="preview-watermark">
                    DRAFT – UNFINALIZED AGREEMENT
                    <span className="wm-sub">Generated via TERMS (Preview Mode)</span>
                    <span className="wm-small">Finalization requires unlock.</span>
                  </div>
                )}

                <div className="relative z-[1]">
                  <div className="text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/45">
                      {APP_META.product}
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                      {draft.title?.trim() || "Untitled Agreement"}
                    </h2>
                    <div className="mt-3 text-sm leading-6 text-black/60">
                      Record of mutual acknowledgment
                    </div>
                  </div>

                  <div className="mt-8 border-t border-black/10 pt-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                      Parties
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">
                          Person A
                        </div>
                        <div className="mt-1 text-sm font-medium leading-6 text-black">
                          {draft.acknowledgments?.personA?.typedName || draft.personA || "Person A"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">
                          Person B
                        </div>
                        <div className="mt-1 text-sm font-medium leading-6 text-black">
                          {draft.acknowledgments?.personB?.typedName || draft.personB || "Person B"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-black/10 pt-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                      Agreement
                    </div>

                    <div className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-black/88">
                      {draft.agreementText?.trim() || ""}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-black/10 pt-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                      Acknowledgment Record
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3 text-sm leading-6 text-black/80">
                        <div>
                          <span className="font-semibold text-black/72">Created:</span>{" "}
                          {createdAtLabel}
                        </div>
                        <div className="mt-1">
                          <span className="font-semibold text-black/72">Status:</span>{" "}
                          {isPaid ? "Finalized" : "Preview / Draft"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3 text-sm leading-6 text-black/80">
                        <div>
                          <span className="font-semibold text-black/72">Acknowledged by:</span>
                        </div>
                        <div className="mt-1">
                          {draft.acknowledgments?.personA?.typedName || draft.personA}
                        </div>
                        <div>
                          {draft.acknowledgments?.personB?.typedName || draft.personB}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-black/10 pt-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                      Signature Lines
                    </div>

                    <div className="mt-4 grid gap-5 sm:grid-cols-2">
                      <div className="space-y-5">
                        <div>
                          <div className="border-b border-black/20 pb-2 text-sm text-black/75">
                            {draft.personA || "Person A"}
                          </div>
                          <div className="mt-2 text-xs uppercase tracking-[0.14em] text-black/40">
                            Person A Signature
                          </div>
                        </div>

                        <div>
                          <div className="border-b border-black/20 pb-2 text-sm text-black/75">
                            {draft.personB || "Person B"}
                          </div>
                          <div className="mt-2 text-xs uppercase tracking-[0.14em] text-black/40">
                            Person B Signature
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <div className="border-b border-black/20 pb-2 text-sm text-black/75">
                            {createdAtLabel}
                          </div>
                          <div className="mt-2 text-xs uppercase tracking-[0.14em] text-black/40">
                            Date
                          </div>
                        </div>

                        <div>
                          <div className="border-b border-black/20 pb-2 text-sm text-black/75">
                            {createdAtLabel}
                          </div>
                          <div className="mt-2 text-xs uppercase tracking-[0.14em] text-black/40">
                            Date
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {hasNotary ? (
                    <div className="mt-8 border-t border-black/10 pt-5">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                        Notary Certificate
                      </div>

                      <div className="mt-3 text-xs leading-6 text-black/55">
                        This certificate may be completed, modified, or replaced by the
                        notary as required by applicable law.
                      </div>

                      {(draft.notary?.mode || draft.notary?.state || draft.notary?.parish) && (
                        <div className="mt-4 rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3 text-sm leading-6 text-black/78">
                          {draft.notary?.mode ? (
                            <div>
                              <span className="font-semibold text-black/72">Mode:</span>{" "}
                              {draft.notary.mode}
                            </div>
                          ) : null}

                          {draft.notary?.state || draft.notary?.parish ? (
                            <div>
                              <span className="font-semibold text-black/72">Venue:</span>{" "}
                              {draft.notary?.state || ""}
                              {draft.notary?.parish
                                ? ` — County/Parish of ${draft.notary.parish}`
                                : ""}
                            </div>
                          ) : null}
                        </div>
                      )}

                      <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-black/8 bg-black/[0.015] px-4 py-4 text-[15px] leading-8 text-black/82">
                        {draft.notary?.certificateText}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-8 border-t border-black/10 pt-5 text-xs leading-6 text-black/50">
                    Generated via {APP_META.product}. A {APP_META.company} product.
                    Not legal advice.
                  </div>
                </div>
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
                className="inline-flex items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_0_28px_rgba(16,185,129,0.24),0_12px_28px_rgba(0,0,0,0.24)] transition hover:bg-emerald-300"
                onClick={shareRecord}
              >
                Send to Other Person
              </button>

              <button
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
                onClick={() => alert("Add photos for protection (coming next)")}
              >
                Add Photos for Protection
              </button>

              {!isPaid ? (
                <button
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
                  onClick={() => alert("Unlock Final – $1.99 (coming next)")}
                >
                  Unlock Final – $1.99
                </button>
              ) : null}

              <button
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
                onClick={newAgreement}
              >
                New Agreement
              </button>
            </div>
          </div>
        </section>

        <footer className="text-center text-sm leading-6 text-white/42">
          A clean record of what both people agreed to.
        </footer>
      </div>
    </main>
  );
}