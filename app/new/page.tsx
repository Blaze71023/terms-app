// app/new/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type DraftAgreement = {
  title: string;
  personA: string;
  personB: string;
  agreementText: string;

  // Optional extras (safe to store; other pages can ignore)
  presetType?: PresetType;
  presetFields?: Record<string, string>;
  manualEdit?: boolean;

  includeNotary?: boolean;
  notary?: {
    mode?: string;
    state?: string;
    parish?: string;

    // If you want to let user paste their own certificate
    useCustomText?: boolean;
    certificateText?: string;

    // Optional notary meta
    notaryName?: string;
    commissionId?: string;
    commissionInfo?: string;
  };
};

type PresetType = "property" | "vehicle" | "loan" | "work" | "blank";

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

function clean(v?: string) {
  return (v || "").trim();
}

function v(fields: Record<string, string>, key: string, fallback = "__________") {
  return clean(fields[key]) || fallback;
}

/**
 * Notary wording: NOT truly “universal”.
 * States vary. This is a common acknowledgement-style template,
 * but you should treat it as a starting point and allow custom paste.
 */
function defaultNotaryCertificate(opts: { state?: string; parish?: string }) {
  const state = clean(opts.state) || "__________";
  const parish = clean(opts.parish) || "__________";

  return [
    `State of ${state}`,
    `County/Parish of ${parish}`,
    ``,
    `On this ____ day of __________, 20____, before me personally appeared __________________________,`,
    `who proved to me through satisfactory evidence of identity to be the person(s) who executed the foregoing`,
    `instrument and acknowledged that they executed the same for the purposes therein contained.`,
    ``,
    `Notary Public: ________________________________`,
    `My commission/ID: _____________________________`,
    `(Seal/Stamp)`,
  ].join("\n");
}

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

type PresetDef = {
  label: string;
  defaultTitle: string;
  fields: FieldDef[];
  buildText: (fields: Record<string, string>) => string;
};

const PRESETS: Record<PresetType, PresetDef> = {
  property: {
    label: "Personal Property",
    defaultTitle: "Personal property agreement",
    fields: [
      { key: "seller", label: "Seller full name", placeholder: "e.g., John Smith" },
      { key: "buyer", label: "Buyer full name", placeholder: "e.g., Jane Smith" },
      { key: "item", label: "Item(s)", placeholder: "e.g., toolbox, phone, couch" },
      { key: "description", label: "Description", multiline: true, placeholder: "Condition, serial #, included accessories…" },
      { key: "price", label: "Sale price", placeholder: "e.g., $1,000" },
      { key: "payment", label: "Payment terms", placeholder: "Cash, Venmo, due date, etc." },
      { key: "asIs", label: "Condition / as-is wording", placeholder: "e.g., Sold as-is, no warranties implied" },
      { key: "notes", label: "Other terms (optional)", multiline: true, placeholder: "Any additional terms…" },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "seller")} (“Seller”) agrees to sell, and ${v(f, "buyer")} (“Buyer”) agrees to purchase, the following personal property:`,
        ``,
        `Item(s): ${v(f, "item")}`,
        `Description: ${v(f, "description")}`,
        ``,
        `Price/payment terms:`,
        `- Price: ${v(f, "price")}`,
        `- Payment: ${v(f, "payment")}`,
        ``,
        `Condition / as-is:`,
        `- ${v(f, "asIs")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  vehicle: {
    label: "Vehicle Sale/Purchase",
    defaultTitle: "Vehicle sale/purchase",
    fields: [
      { key: "seller", label: "Seller full name" },
      { key: "buyer", label: "Buyer full name" },
      { key: "year", label: "Year", placeholder: "e.g., 2018" },
      { key: "make", label: "Make", placeholder: "e.g., Toyota" },
      { key: "model", label: "Model", placeholder: "e.g., Camry" },
      { key: "vin", label: "VIN", placeholder: "17 characters" },
      { key: "mileage", label: "Mileage (optional)", placeholder: "e.g., 120,450" },
      { key: "price", label: "Sale price", placeholder: "e.g., $9,500" },
      { key: "payment", label: "Payment terms", placeholder: "Cash, paid in full today, etc." },
      { key: "asIs", label: "Condition / as-is wording", placeholder: "Sold as-is, no warranties implied" },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "seller")} (“Seller”) agrees to sell and ${v(f, "buyer")} (“Buyer”) agrees to purchase the following vehicle:`,
        ``,
        `Vehicle:`,
        `- Year/Make/Model: ${v(f, "year")} ${v(f, "make")} ${v(f, "model")}`,
        `- VIN: ${v(f, "vin")}`,
        `- Mileage (if known): ${clean(f.mileage) || "__________"}`,
        ``,
        `Price/payment terms:`,
        `- Price: ${v(f, "price")}`,
        `- Payment: ${v(f, "payment")}`,
        ``,
        `Condition / as-is:`,
        `- ${v(f, "asIs")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  loan: {
    label: "Personal Loan",
    defaultTitle: "Personal loan",
    fields: [
      { key: "lender", label: "Lender full name" },
      { key: "borrower", label: "Borrower full name" },
      { key: "amount", label: "Loan amount", placeholder: "e.g., $500" },
      { key: "repayment", label: "Repayment expectation", multiline: true, placeholder: "Due date, installments, interest, etc." },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "lender")} (“Lender”) agrees to provide a loan to ${v(f, "borrower")} (“Borrower”).`,
        ``,
        `Amount: ${v(f, "amount")}`,
        ``,
        `Repayment expectation:`,
        `${v(f, "repayment")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  work: {
    label: "Work Agreement",
    defaultTitle: "Work agreement",
    fields: [
      { key: "worker", label: "Worker full name" },
      { key: "client", label: "Client full name" },
      { key: "task", label: "Task / scope", multiline: true },
      { key: "compensation", label: "Compensation", placeholder: "e.g., $200 cash" },
      { key: "expectation", label: "Completion expectation", placeholder: "e.g., By Friday 5pm" },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "worker")} (“Worker”) agrees to perform the following work for ${v(f, "client")} (“Client”):`,
        ``,
        `Task / scope:`,
        `${v(f, "task")}`,
        ``,
        `Compensation: ${v(f, "compensation")}`,
        `Completion expectation: ${v(f, "expectation")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  blank: {
    label: "Start Blank",
    defaultTitle: "",
    fields: [],
    buildText: () => "",
  },
};

export default function NewPage() {
  const router = useRouter();

  const [preset, setPreset] = useState<PresetType>("property");

  const [title, setTitle] = useState("");
  const [personA, setPersonA] = useState("");
  const [personB, setPersonB] = useState("");

  const [fields, setFields] = useState<Record<string, string>>({});
  const [manualEdit, setManualEdit] = useState(false);
  const [manualText, setManualText] = useState("");

  // Notary controls (restored)
  const [includeNotary, setIncludeNotary] = useState(false);
  const [notaryMode, setNotaryMode] = useState("In-person notarization");
  const [notaryState, setNotaryState] = useState("Louisiana");
  const [notaryParish, setNotaryParish] = useState("");
  const [useCustomNotaryText, setUseCustomNotaryText] = useState(false);
  const [customNotaryText, setCustomNotaryText] = useState("");
  const [notaryName, setNotaryName] = useState("");
  const [commissionId, setCommissionId] = useState("");
  const [commissionInfo, setCommissionInfo] = useState("");

  // Load existing draft if present
  useEffect(() => {
    const d = loadDraft();
    if (!d) {
      // initialize with preset default title
      setTitle(PRESETS[preset].defaultTitle);
      return;
    }

    setPreset((d.presetType as PresetType) || "property");
    setTitle(d.title || "");
    setPersonA(d.personA || "");
    setPersonB(d.personB || "");
    setFields(d.presetFields || {});
    setManualEdit(!!d.manualEdit);
    setManualText(d.manualEdit ? d.agreementText || "" : "");

    setIncludeNotary(!!d.includeNotary);
    setNotaryMode(d.notary?.mode || "In-person notarization");
    setNotaryState(d.notary?.state || "Louisiana");
    setNotaryParish(d.notary?.parish || "");
    setUseCustomNotaryText(!!d.notary?.useCustomText);
    setCustomNotaryText(d.notary?.certificateText || "");
    setNotaryName(d.notary?.notaryName || "");
    setCommissionId(d.notary?.commissionId || "");
    setCommissionInfo(d.notary?.commissionInfo || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const presetDef = PRESETS[preset];

  function setField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function choosePreset(p: PresetType) {
    setPreset(p);
    setFields({});
    setManualEdit(p === "blank");
    setManualText("");
    setTitle((prev) => clean(prev) ? prev : PRESETS[p].defaultTitle);
  }

  const generatedText = useMemo(() => {
    if (preset === "blank") return manualText;
    return presetDef.buildText(fields);
  }, [preset, presetDef, fields, manualText]);

  const finalAgreementText =
    preset === "blank" ? manualText : manualEdit ? manualText : generatedText;

  const computedNotaryTemplate = useMemo(() => {
    return defaultNotaryCertificate({ state: notaryState, parish: notaryParish });
  }, [notaryState, notaryParish]);

  function toggleManualEdit() {
    if (preset === "blank") return;
    setManualEdit((prev) => {
      const next = !prev;
      if (next) setManualText(generatedText); // seed edit with generated
      return next;
    });
  }

  const canContinue = useMemo(() => {
    const hasNames = !!(clean(personA) && clean(personB));
    const hasTitle = !!clean(title);
    const hasText = !!clean(finalAgreementText);
    return hasNames && (hasTitle || hasText);
  }, [personA, personB, title, finalAgreementText]);

  function continueToReview() {
    const certificateTextToStore = includeNotary
      ? (useCustomNotaryText ? (clean(customNotaryText) || computedNotaryTemplate) : computedNotaryTemplate)
      : undefined;

    const next: DraftAgreement = {
      title: clean(title),
      personA: clean(personA),
      personB: clean(personB),
      agreementText: clean(finalAgreementText),

      presetType: preset,
      presetFields: fields,
      manualEdit,

      includeNotary,
      notary: includeNotary
        ? {
            mode: notaryMode,
            state: clean(notaryState),
            parish: clean(notaryParish),
            useCustomText: useCustomNotaryText,
            certificateText: certificateTextToStore,
            notaryName: clean(notaryName),
            commissionId: clean(commissionId),
            commissionInfo: clean(commissionInfo),
          }
        : undefined,
    };

    saveDraft(next);
    router.push("/review");
  }

  return (
    <main className="min-h-screen px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-2xl space-y-6">

        {/* HERO (kept as-is) */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-purple-600 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
          <div className="text-white/85 text-sm font-semibold">Mutual Acknowledgment</div>
          <div className="mt-2 text-4xl font-semibold tracking-tight text-white">Create Agreement</div>
          <div className="mt-3 text-white/90 text-lg">Fill in the blanks. Keep it short and true.</div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-white/70 text-sm font-semibold">
              <span className="text-white font-semibold">Create</span>
              <span>Review</span>
              <span>Sign</span>
              <span>Receipt</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/20">
              <div className="h-2 w-[25%] rounded-full bg-white/85" />
            </div>
          </div>
        </div>

        <section className="ui-surface p-6">

          {/* Presets */}
          <div className="text-white font-semibold text-lg">Start with a preset (optional)</div>
          <div className="mt-4 flex flex-wrap gap-3">
            {(Object.keys(PRESETS) as PresetType[]).map((p) => (
              <button
                key={p}
                type="button"
                className={preset === p ? "ui-chip ui-chip-active" : "ui-chip"}
                onClick={() => choosePreset(p)}
              >
                {PRESETS[p].label}
              </button>
            ))}
          </div>

          <div className="mt-3 text-white/70 text-sm">
            Presets are optional. Fields generate the text automatically. You can still edit the full text if needed.
          </div>

          {/* Notary (RESTORED) */}
          <div className="mt-6 ui-paper p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="ui-label">Notary (optional, prints on receipt)</div>
                <div className="ui-help mt-1 leading-6">
                  Notary wording varies by venue. Use this when notarization is required; the notary should use the wording required by the venue.
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  className="h-5 w-5"
                  checked={includeNotary}
                  onChange={(e) => setIncludeNotary(e.target.checked)}
                />
                Include
              </label>
            </div>

            {includeNotary ? (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select
                    className="ui-input-light"
                    value={notaryMode}
                    onChange={(e) => setNotaryMode(e.target.value)}
                  >
                    <option>In-person notarization</option>
                    <option>Remote online notarization</option>
                  </select>

                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:justify-end">
                    <input
                      type="checkbox"
                      className="h-5 w-5"
                      checked={useCustomNotaryText}
                      onChange={(e) => setUseCustomNotaryText(e.target.checked)}
                    />
                    Use notary’s own certificate text
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    className="ui-input-light"
                    value={notaryState}
                    onChange={(e) => setNotaryState(e.target.value)}
                    placeholder="State"
                  />
                  <input
                    className="ui-input-light"
                    value={notaryParish}
                    onChange={(e) => setNotaryParish(e.target.value)}
                    placeholder="County/Parish"
                  />
                </div>

                <textarea
                  className="ui-textarea-light min-h-[220px] font-mono leading-6"
                  readOnly={!useCustomNotaryText}
                  value={useCustomNotaryText ? customNotaryText : computedNotaryTemplate}
                  onChange={(e) => setCustomNotaryText(e.target.value)}
                  placeholder="Paste the notary's required certificate text here…"
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    className="ui-input-light"
                    value={notaryName}
                    onChange={(e) => setNotaryName(e.target.value)}
                    placeholder="Notary printed name (optional)"
                  />
                  <input
                    className="ui-input-light"
                    value={commissionId}
                    onChange={(e) => setCommissionId(e.target.value)}
                    placeholder="Commission/ID/Bar # (optional)"
                  />
                </div>

                <input
                  className="ui-input-light"
                  value={commissionInfo}
                  onChange={(e) => setCommissionInfo(e.target.value)}
                  placeholder="Commission info (optional)"
                />
              </div>
            ) : null}
          </div>

          {/* Title */}
          <div className="mt-6">
            <div className="text-white font-semibold">Title</div>
            <input
              className="ui-input-light mt-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Vehicle purchase, Personal loan, Work agreement"
            />
          </div>

          {/* People */}
          <div className="mt-6">
            <div className="text-white font-semibold">People present</div>
            <div className="mt-2 text-white/70 text-sm">
              These names must match on the Ack page.
            </div>
            <div className="mt-3 space-y-3">
              <input
                className="ui-input-light"
                value={personA}
                onChange={(e) => setPersonA(e.target.value)}
                placeholder="Person A full name"
              />
              <input
                className="ui-input-light"
                value={personB}
                onChange={(e) => setPersonB(e.target.value)}
                placeholder="Person B full name"
              />
            </div>
          </div>

          {/* Fill-in-the-blank fields for presets */}
          {preset !== "blank" ? (
            <div className="mt-6 ui-paper p-6">
              <div className="ui-label">Fill in the blanks</div>
              <div className="ui-help mt-1">
                These fields generate the agreement text automatically.
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {presetDef.fields.map((f) => (
                  <div key={f.key}>
                    <div className="text-sm font-semibold text-slate-800">{f.label}</div>

                    {f.multiline ? (
                      <textarea
                        className="ui-textarea-light mt-2 min-h-[110px]"
                        value={fields[f.key] || ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        placeholder={f.placeholder || ""}
                      />
                    ) : (
                      <input
                        className="ui-input-light mt-2"
                        value={fields[f.key] || ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        placeholder={f.placeholder || ""}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <button type="button" className="ui-btn-ghost" onClick={toggleManualEdit}>
                  {manualEdit ? "Stop editing full text" : "Edit full text (optional)"}
                </button>
              </div>
            </div>
          ) : null}

          {/* Agreement text: generated unless manualEdit/blank */}
          <div className="mt-6">
            <div className="text-white font-semibold">Agreement text</div>
            <div className="mt-2 text-white/70 text-sm">
              {preset === "blank"
                ? "Freeform text."
                : manualEdit
                ? "Editing full text."
                : "Generated from the fields above (read-only)."}
            </div>

            <textarea
              className="ui-textarea-light mt-2 min-h-[260px]"
              value={preset === "blank" || manualEdit ? manualText : generatedText}
              readOnly={preset !== "blank" && !manualEdit}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Write what both sides agreed to, in plain language…"
            />
          </div>

          <div className="mt-6">
            <button className="ui-btn-primary" disabled={!canContinue} onClick={continueToReview}>
              Continue to Review
            </button>

            {!canContinue ? (
              <div className="mt-3 text-white/70 text-sm">
                To continue: add both names, and a title or agreement text.
              </div>
            ) : null}
          </div>
        </section>

        <footer className="text-white/55 text-sm leading-6">
          Not legal advice. This app records a shared understanding in plain language.
        </footer>
      </div>
    </main>
  );
}
