"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AgreementRecord = {
  title?: string;
  agreementType?: string;
  createdAt?: string;
  acknowledgedAt?: string;
  isPaid?: boolean;
  fields?: Record<string, string>;
  [key: string]: unknown;
};

const STORAGE_KEYS = ["receiptAgreement", "finalAgreement", "draftAgreement"];
const FREE_FLAG_KEY = "terms_free_used";

function readAgreementFromSession(): AgreementRecord | null {
  if (typeof window === "undefined") return null;

  for (const key of STORAGE_KEYS) {
    const raw = sessionStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed as AgreementRecord;
      }
    } catch {
      // Ignore bad session data and continue checking the next key.
    }
  }

  return null;
}

function evaluateCleanStatus(isPaid: boolean): boolean {
  if (typeof window === "undefined") return false;

  if (isPaid) return true;

  const hasUsedFree = localStorage.getItem(FREE_FLAG_KEY) === "true";

  if (!hasUsedFree) {
    localStorage.setItem(FREE_FLAG_KEY, "true");
    return true;
  }

  return false;
}

function toTitleCase(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDateTime(value?: string) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function extractDisplayFields(record: AgreementRecord): Array<[string, unknown]> {
  const internalKeys = new Set([
    "title",
    "agreementType",
    "createdAt",
    "acknowledgedAt",
    "isPaid",
    "fields",
  ]);

  const fieldEntries =
    record.fields && typeof record.fields === "object"
      ? Object.entries(record.fields)
      : [];

  const directEntries = Object.entries(record).filter(
    ([key]) => !internalKeys.has(key)
  );

  const combined = [...fieldEntries, ...directEntries];

  return combined.filter(([, value]) => {
    return value !== null && value !== undefined && String(value).trim() !== "";
  });
}

export default function ReceiptPage() {
  const [agreement, setAgreement] = useState<AgreementRecord | null>(null);
  const [isClean, setIsClean] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [usedFreeThisTime, setUsedFreeThisTime] = useState(false);
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);

  useEffect(() => {
    const record = readAgreementFromSession();
    setAgreement(record);

    if (record) {
      const sessionPaid =
        typeof window !== "undefined" &&
        sessionStorage.getItem("isPaid") === "true";

      const paid = record.isPaid === true || sessionPaid;

      const alreadyUsedFree =
        typeof window !== "undefined" &&
        localStorage.getItem(FREE_FLAG_KEY) === "true";

      const clean = evaluateCleanStatus(paid);

      setIsClean(clean);
      setUsedFreeThisTime(!paid && !alreadyUsedFree && clean);
    }

    setIsReady(true);
  }, []);

  const displayFields = useMemo(() => {
    if (!agreement) return [];
    return extractDisplayFields(agreement);
  }, [agreement]);

  const agreementTitle =
    agreement?.title ||
    agreement?.agreementType ||
    "Mutual Acknowledgment Record";

  const createdAt = formatDateTime(agreement?.createdAt);
  const acknowledgedAt = formatDateTime(agreement?.acknowledgedAt);

  async function handleShare() {
    if (!agreement) return;

    const shareText = `${agreementTitle}\nCreated: ${createdAt}\nAcknowledged: ${acknowledgedAt}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: agreementTitle,
          text: shareText,
        });
      } catch {
        // User cancelled or share unavailable.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareText);
      alert("Record details copied to clipboard.");
    } catch {
      alert("Unable to share or copy from this device.");
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleCheckout() {
    if (isStartingCheckout) return;

    try {
      setIsStartingCheckout(true);

      console.log("[TERMS] Finalize button clicked");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("[TERMS] /api/checkout status:", res.status);

      let data: { url?: string; error?: string } = {};

      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("[TERMS] Failed to parse checkout response JSON:", jsonError);
        throw new Error("Checkout route returned invalid JSON.");
      }

      console.log("[TERMS] /api/checkout response:", data);

      if (!res.ok) {
        throw new Error(data?.error || `Checkout request failed with status ${res.status}`);
      }

      if (!data?.url || typeof data.url !== "string") {
        throw new Error("No checkout URL returned from /api/checkout.");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("[TERMS] Checkout start failed:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong starting checkout.";

      alert(message);
    } finally {
      setIsStartingCheckout(false);
    }
  }

  if (!isReady) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(245,245,245,1)_46%,rgba(240,240,240,1)_100%)] px-4 py-8 text-neutral-900">
        <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <p className="text-sm text-neutral-500">Loading receipt...</p>
        </div>
      </main>
    );
  }

  if (!agreement) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(245,245,245,1)_46%,rgba(240,240,240,1)_100%)] px-4 py-8 text-neutral-900">
        <div className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-semibold">No agreement found</h1>
            <p className="text-sm text-neutral-600">
              There is no finalized agreement in session storage to display.
            </p>
            <div className="pt-2">
              <Link
                href="/new"
                className="inline-flex items-center justify-center rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              >
                Start a new agreement
              </Link>
            </div>
            <div className="pt-6 text-xs text-neutral-500">
              Not legal advice · Built by ZeroHour Systems
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(245,245,245,1)_46%,rgba(240,240,240,1)_100%)] px-4 py-8 text-neutral-900 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/new"
            className="inline-flex items-center rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
          >
            New agreement
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {typeof navigator !== "undefined" && (
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50"
              >
                Share
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            >
              Print / Save PDF
            </button>
          </div>
        </div>

        {usedFreeThisTime && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm print:hidden">
            Your first finalized agreement is free.
          </div>
        )}

        {!isClean && (
          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 shadow-sm print:hidden">
            <div>Lock this agreement as a clean, shareable record.</div>

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isStartingCheckout}
              className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isStartingCheckout ? "Starting checkout..." : "Finalize – $1.99"}
            </button>
          </div>
        )}

        <section className="relative overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)] print:rounded-none print:border-0 print:shadow-none">
          {!isClean && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
              <div className="select-none text-center text-[2rem] font-extrabold uppercase tracking-[0.22em] text-neutral-300/60 sm:text-[3rem]">
                <div className="-rotate-24 whitespace-pre-line">
                  DRAFT – UNFINALIZED AGREEMENT
                  {"\n"}
                  Generated via Terms App (Preview Mode)
                </div>
              </div>
            </div>
          )}

          <div className="relative z-10 p-6 sm:p-10">
            <header className="border-b border-neutral-200 pb-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    Terms
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
                    {agreementTitle}
                  </h1>
                  <p className="mt-2 text-sm text-neutral-600">
                    Mutual acknowledgment record
                  </p>
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                    isClean
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="opacity-80">Status:</span>
                    <span>{isClean ? "Finalized" : "Draft / Unfinalized"}</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="grid gap-4 border-b border-neutral-200 py-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Created
                </div>
                <div className="mt-2 text-sm font-medium text-neutral-900">
                  {createdAt}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Acknowledged
                </div>
                <div className="mt-2 text-sm font-medium text-neutral-900">
                  {acknowledgedAt}
                </div>
              </div>
            </div>

            <section className="py-6">
              <h2 className="text-lg font-semibold text-neutral-950">
                Agreement details
              </h2>

              <div className="mt-4 overflow-hidden rounded-3xl border border-neutral-200">
                {displayFields.length > 0 ? (
                  <div className="divide-y divide-neutral-200">
                    {displayFields.map(([key, value]) => (
                      <div
                        key={key}
                        className="grid gap-2 px-4 py-4 sm:grid-cols-[220px_1fr] sm:gap-4"
                      >
                        <div className="text-sm font-medium text-neutral-500">
                          {toTitleCase(key)}
                        </div>
                        <div className="text-sm text-neutral-900">
                          {formatValue(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-sm text-neutral-500">
                    No agreement fields were found for this record.
                  </div>
                )}
              </div>
            </section>

            <section className="border-t border-neutral-200 py-6">
              <h2 className="text-lg font-semibold text-neutral-950">
                Acknowledgment
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-700">
                This record reflects the information entered and acknowledged by
                the parties at the time shown above. TERMS provides a plain-language
                mutual acknowledgment record only.
              </p>
            </section>

            <footer className="border-t border-neutral-200 pt-6">
              <div className="flex flex-col gap-2 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
                <span>Not legal advice · Built by ZeroHour Systems</span>
                <span>{isClean ? "Clean record" : "Draft preview"}</span>
              </div>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}