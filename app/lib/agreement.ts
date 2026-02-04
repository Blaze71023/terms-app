// app/lib/draft.ts
export type DraftAgreement = {
  title: string;
  personA: string;
  personB: string;
  agreementText: string;

  includeNotary?: boolean;
  notary?: {
    mode?: string; // "In-person notarization" | "Remote online notarization"
    state?: string;
    parish?: string;

    // NEW: template locked unless "useCustomText" is true
    useCustomText?: boolean;
    certificateText?: string;

    signerNames?: string; // optional override
    dateText?: string; // optional override (otherwise receipt timestamp)

    notaryName?: string;
    commissionId?: string;
    commissionInfo?: string;
  };

  acknowledgments?: {
    personA?: { typedName: string; timestamp: number };
    personB?: { typedName: string; timestamp: number };
  };
};

export const STORAGE_KEY = "draftAgreement";

export function loadDraft(): DraftAgreement | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftAgreement;
  } catch {
    return null;
  }
}

export function saveDraft(d: DraftAgreement) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

export function exactMatch(a: string, b: string) {
  return a.trim() !== "" && a.trim() === b.trim();
}

export function formatDateTime(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
}

/**
 * Tight, venue-friendly “reference template” certificate.
 * This is intentionally generic and is NOT claiming to be statutory language everywhere.
 */
export function buildNotaryCertificate(opts: {
  state?: string;
  parish?: string;
  dateText?: string;
  signerNames?: string;
  notaryName?: string;
  commissionId?: string;
  commissionInfo?: string;
}) {
  const state = (opts.state || "").trim() || "__________";
  const parish = (opts.parish || "").trim() || "__________";
  const dateText = (opts.dateText || "").trim() || "__________";
  const signerNames = (opts.signerNames || "").trim() || "____________________________";

  const notaryName = (opts.notaryName || "").trim();
  const commissionId = (opts.commissionId || "").trim();
  const commissionInfo = (opts.commissionInfo || "").trim();

  return [
    `REFERENCE TEMPLATE ONLY. Notaries must use wording required by the state/venue.`,
    ``,
    `State of ${state}`,
    `County/Parish of ${parish}`,
    ``,
    `On ${dateText}, before me, the undersigned notary, personally appeared ${signerNames},`,
    `who acknowledged executing the foregoing instrument for the purposes stated therein.`,
    ``,
    `Notary Public: __________________________`,
    `Printed name (optional): ${notaryName || "__________________________"}`,
    `Commission/ID (optional): ${commissionId || "__________________________"}`,
    `Commission info (optional): ${commissionInfo || "__________________________"}`,
    `(Seal/Stamp)`,
  ].join("\n");
}

export function buildReviewText(draft: DraftAgreement) {
  const lines: string[] = [];

  lines.push(draft.title?.trim() ? draft.title.trim() : "(Untitled)");
  lines.push("");
  lines.push("People present:");
  lines.push(`- ${draft.personA || "Person A"}`);
  lines.push(`- ${draft.personB || "Person B"}`);
  lines.push("");
  lines.push(draft.agreementText || "");

  if (draft.includeNotary && draft.notary) {
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
    if (draft.notary.certificateText) lines.push(draft.notary.certificateText);
  }

  return lines.join("\n");
}

export function buildReceiptText(draft: DraftAgreement, createdAt: string) {
  const lines: string[] = [];
  lines.push(`Created: ${createdAt}`);
  lines.push(`Title: ${draft.title || "(untitled)"}`);
  lines.push("");
  lines.push("People:");
  lines.push(`- ${draft.personA || "Person A"}`);
  lines.push(`- ${draft.personB || "Person B"}`);
  lines.push("");
  lines.push("Agreement text:");
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
}
