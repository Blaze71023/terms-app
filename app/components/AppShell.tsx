"use client";

import { ReactNode } from "react";

type Step = "start" | "create" | "review" | "ack" | "receipt";

function stepIndex(step: Step) {
  const order: Step[] = ["start", "create", "review", "ack", "receipt"];
  return order.indexOf(step);
}

export default function AppShell(props: {
  step: Step;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const idx = stepIndex(props.step);

  const steps: { key: Step; label: string }[] = [
    { key: "create", label: "Create" },
    { key: "review", label: "Review" },
    { key: "ack", label: "Sign" },
    { key: "receipt", label: "Receipt" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-purple-600 p-5 shadow-xl">
          <div className="text-xs/5 tracking-wide text-white/90">
            Mutual Acknowledgment
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-white">
            {props.title}
          </h1>
          {props.subtitle ? (
            <p className="mt-2 text-sm text-white/90">{props.subtitle}</p>
          ) : null}

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-white/90">
              {steps.map((s) => {
                const active = stepIndex(s.key) <= idx && idx !== 0;
                return (
                  <span
                    key={s.key}
                    className={active ? "font-semibold" : "opacity-70"}
                  >
                    {s.label}
                  </span>
                );
              })}
            </div>

            <div className="mt-2 h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/90 transition-all"
                style={{
                  width:
                    idx <= 0 ? "0%" : `${Math.min(100, (idx / 4) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Body Card */}
        <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-900/40 p-5 shadow-lg">
          {props.children}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Not legal advice. This is a clean record of what both people agreed to.
          If notarization is required, the notary must witness and complete the
          certificate per the law where notarization occurs.
        </p>
      </div>
    </main>
  );
}
