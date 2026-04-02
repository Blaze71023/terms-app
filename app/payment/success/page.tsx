"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      sessionStorage.setItem("isPaid", "true");
    } catch (error) {
      console.error("Failed to store paid state:", error);
    }

    const timer = setTimeout(() => {
      router.replace("/receipt");
    }, 1200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(245,245,245,1)_46%,rgba(240,240,240,1)_100%)] px-4 py-8 text-neutral-900">
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-emerald-200 bg-white p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)] sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
            ✓
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Payment successful
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            Finalizing your clean record
          </h1>

          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Your payment was received. We’re returning you to your receipt now.
          </p>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-neutral-200">
            <div className="h-full w-full animate-pulse rounded-full bg-emerald-500" />
          </div>

          <p className="mt-6 text-xs text-neutral-500">
            Not legal advice · Built by ZeroHour Systems
          </p>
        </div>
      </div>
    </main>
  );
}