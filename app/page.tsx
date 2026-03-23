"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "draftAgreement";

function shellClass() {
  return [
    "relative overflow-hidden rounded-[30px] border border-white/12",
    "bg-gradient-to-br from-white/[0.075] via-white/[0.04] to-white/[0.02]",
    "shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_50px_rgba(16,185,129,0.07)]",
    "backdrop-blur",
  ].join(" ");
}

function panelClass() {
  return [
    "relative overflow-hidden rounded-[28px] border border-white/12",
    "bg-gradient-to-br from-white/[0.07] via-white/[0.04] to-white/[0.022]",
    "shadow-[0_12px_36px_rgba(0,0,0,0.34)]",
    "backdrop-blur",
  ].join(" ");
}

function accentLineClass() {
  return "h-[3px] w-16 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.55)]";
}

export default function HomePage() {
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      setHasDraft(!!raw);
    } catch {
      setHasDraft(false);
    }
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03060b] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,32,49,0.55),transparent_40%),radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.14),transparent_26%),linear-gradient(180deg,#02050a_0%,#030812_45%,#02050a_100%)]" />
        <div className="absolute left-1/2 top-0 h-[340px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute left-[8%] top-[28%] h-[260px] w-[260px] rounded-full bg-cyan-400/7 blur-3xl" />
        <div className="absolute right-[6%] top-[16%] h-[320px] w-[320px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-1/2 h-[240px] w-[780px] -translate-x-1/2 rounded-full bg-emerald-500/6 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6 md:py-10">

        {/* HERO */}
        <section className={shellClass() + " p-7 md:p-9"}>
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          <div className="absolute left-1/2 top-0 h-20 w-80 -translate-x-1/2 bg-emerald-400/12 blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-[38%] bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.10),transparent_48%),radial-gradient(circle_at_60%_40%,rgba(59,130,246,0.08),transparent_42%)]" />

          <div className="relative flex items-start justify-between gap-5">
            <div className="max-w-3xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/50">
                ZeroHour Systems
              </div>

              <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white md:text-6xl">
                TERMS
              </h1>

              <div className="mt-5">
                <div className={accentLineClass()} />
              </div>

              <h2 className="mt-7 max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-[2.4rem] md:leading-[1.1]">
                Lock in what was <span className="text-emerald-300">agreed</span>.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
                Create a simple shared record in seconds, so nobody can later say,
                “that’s not what we said.”
              </p>
            </div>

            <div className="hidden shrink-0 md:block">
              <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/14 to-emerald-500/7 px-5 py-4 text-sm font-semibold text-emerald-200 shadow-[0_0_28px_rgba(16,185,129,0.14)]">
                Ready
                <br />
                fast
              </div>
            </div>
          </div>

          <div className="relative mt-10">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-white/42">
              <span className="text-white/94">Create</span>
              <span>Review</span>
              <span>Acknowledge</span>
              <span>Record</span>
            </div>

            <div className="mt-4 h-[5px] rounded-full bg-white/8">
              <div className="h-[5px] w-[22%] rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.45)]" />
            </div>
          </div>
        </section>

        {/* WHAT IT DOES */}
        <section className={panelClass() + " p-6 md:p-7"}>
          <div className="absolute inset-y-0 left-0 w-[34%] bg-[radial-gradient(circle_at_left_center,rgba(16,185,129,0.08),transparent_62%)]" />

          <div className="relative">
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              What this does
            </h3>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/72">
              TERMS creates a simple, time-stamped record of what two people agreed
              to in plain language.
            </p>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/66">
              It is not legal advice. It is clarity, acknowledgment, and a clean
              record you can come back to later.
            </p>
          </div>
        </section>

        {/* START */}
        <section className={panelClass() + " p-6 md:p-7"}>
          <div className="absolute inset-y-0 right-0 w-[32%] bg-[radial-gradient(circle_at_right_center,rgba(59,130,246,0.09),transparent_60%)]" />

          <div className="relative">
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              Start here
            </h3>

            <p className="mt-4 text-lg leading-8 text-white/68">
              Create a new agreement now, or continue where you left off.
            </p>

            <div className="mt-7 space-y-4">
              <Link
                href={hasDraft ? "/review" : "/new"}
                className="inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-base font-semibold bg-emerald-400 text-black shadow-[0_0_34px_rgba(16,185,129,0.26),0_12px_30px_rgba(0,0,0,0.28)] hover:bg-emerald-300 transition"
              >
                {hasDraft ? "Continue Agreement" : "Create Agreement"}
              </Link>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.025] px-5 py-4 text-base text-white/62">
                Most agreements should take less than 30 seconds.
              </div>
            </div>

            <p className="mt-5 text-base leading-7 text-white/54">
              After creation, you can review it together, confirm it, and save a
              clean record.
            </p>
          </div>
        </section>

        {/* FOOTER (FIXED) */}
        <footer className="mt-10 pt-6 border-t border-white/10 text-center text-sm text-white/40 space-y-2">
          <div>
            <a href="/terms" className="mx-2 hover:text-white transition">Terms</a>
            <span className="text-white/20">|</span>
            <a href="/privacy" className="mx-2 hover:text-white transition">Privacy</a>
            <span className="text-white/20">|</span>
            <a href="/disclaimer" className="mx-2 hover:text-white transition">Disclaimer</a>
          </div>

          <div className="text-white/30">
            Not legal advice. A ZeroHour Systems product.
          </div>
        </footer>

      </div>
    </main>
  );
}