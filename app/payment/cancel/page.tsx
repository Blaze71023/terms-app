"use client";

import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(245,245,245,1)_46%,rgba(240,240,240,1)_100%)] px-4 py-8 text-neutral-900">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-amber-200 bg-white p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-700">
            !
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            Payment canceled
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            Your receipt is still in draft mode
          </h1>

          <p className="mt-4 text-sm leading-6 text-neutral-600">
            No payment was completed. You can return to your receipt and finalize
            it whenever you’re ready.
          </p>

          <div className="mt-6">
            <Link
              href="/receipt"
              className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              Return to receipt
            </Link>
          </div>

          <p className="mt-6 text-xs text-neutral-500">
            Not legal advice · Built by ZeroHour Systems
          </p>
        </div>
      </div>
    </main>
  );
}