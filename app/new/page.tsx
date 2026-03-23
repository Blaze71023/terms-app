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

  presetType?: PresetType;
  presetFields?: Record<string, string>;
  manualEdit?: boolean;

  includeNotary?: boolean;
  notary?: {
    mode?: string;
    state?: string;
    parish?: string;
    useCustomText?: boolean;
    certificateText?: string;
    notaryName?: string;
    commissionId?: string;
    commissionInfo?: string;
  };
};

type PresetType =
  | "property"
  | "vehicle"
  | "loan"
  | "work"
  | "borrowedItem"
  | "installment"
  | "depositHold"
  | "roommate"
  | "service"
  | "equipmentRental"
  | "gift"
  | "blank";

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
      {
        key: "description",
        label: "Description",
        multiline: true,
        placeholder: "Condition, serial number, included accessories…",
      },
      { key: "price", label: "Sale price", placeholder: "e.g., $1,000" },
      { key: "payment", label: "Payment terms", placeholder: "Cash, due date, transfer, etc." },
      {
        key: "asIs",
        label: "Condition / as-is wording",
        placeholder: "e.g., Sold as-is, no warranties implied",
      },
      {
        key: "notes",
        label: "Other terms (optional)",
        multiline: true,
        placeholder: "Any additional terms…",
      },
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
    label: "Vehicle Sale / Purchase",
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
      {
        key: "payment",
        label: "Payment terms",
        placeholder: "Cash, paid in full, transfer terms, etc.",
      },
      {
        key: "asIs",
        label: "Condition / as-is wording",
        placeholder: "Sold as-is, no warranties implied",
      },
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
      {
        key: "repayment",
        label: "Repayment expectation",
        multiline: true,
        placeholder: "Due date, installments, interest, etc.",
      },
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

  borrowedItem: {
    label: "Borrowed Item",
    defaultTitle: "Borrowed item agreement",
    fields: [
      { key: "owner", label: "Owner full name" },
      { key: "borrower", label: "Borrower full name" },
      { key: "item", label: "Item being borrowed", placeholder: "e.g., trailer, tool set, laptop" },
      {
        key: "condition",
        label: "Current condition",
        multiline: true,
        placeholder: "Condition before handoff, included parts, visible wear…",
      },
      { key: "returnBy", label: "Return expectation", placeholder: "e.g., Return by April 5" },
      {
        key: "responsibility",
        label: "Responsibility if lost or damaged",
        multiline: true,
        placeholder:
          "e.g., Borrower will repair or replace if damaged while in their care",
      },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "owner")} (“Owner”) agrees to let ${v(f, "borrower")} (“Borrower”) use the following item:`,
        ``,
        `Item: ${v(f, "item")}`,
        `Current condition: ${v(f, "condition")}`,
        `Return expectation: ${v(f, "returnBy")}`,
        ``,
        `Responsibility if lost or damaged:`,
        `${v(f, "responsibility")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  installment: {
    label: "Installment Payment",
    defaultTitle: "Installment payment agreement",
    fields: [
      { key: "seller", label: "Seller / creditor full name" },
      { key: "buyer", label: "Buyer / payer full name" },
      { key: "item", label: "Item or obligation", placeholder: "e.g., couch, repair bill, phone" },
      { key: "total", label: "Total amount owed", placeholder: "e.g., $800" },
      { key: "downPayment", label: "Down payment (optional)", placeholder: "e.g., $100" },
      {
        key: "schedule",
        label: "Payment schedule",
        multiline: true,
        placeholder: "e.g., $100 every Friday until paid",
      },
      {
        key: "missedPayment",
        label: "Missed payment understanding",
        multiline: true,
        placeholder: "What happens if a payment is late or missed",
      },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "buyer")} (“Buyer/Payer”) agrees to pay ${v(f, "seller")} (“Seller/Creditor”) for the following:`,
        ``,
        `Item / obligation: ${v(f, "item")}`,
        `Total amount owed: ${v(f, "total")}`,
        `Down payment: ${clean(f.downPayment) || "__________"}`,
        ``,
        `Payment schedule:`,
        `${v(f, "schedule")}`,
        ``,
        `Missed payment understanding:`,
        `${v(f, "missedPayment")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  depositHold: {
    label: "Deposit / Hold",
    defaultTitle: "Deposit and hold agreement",
    fields: [
      { key: "seller", label: "Seller full name" },
      { key: "buyer", label: "Buyer full name" },
      { key: "item", label: "Item being held", placeholder: "e.g., dirt bike, toolbox, furniture set" },
      { key: "deposit", label: "Deposit amount", placeholder: "e.g., $200" },
      { key: "total", label: "Total price", placeholder: "e.g., $1,000" },
      { key: "holdUntil", label: "Held until", placeholder: "e.g., April 10, 2026" },
      {
        key: "depositTerms",
        label: "Deposit terms",
        multiline: true,
        placeholder: "Refundable or not, and under what conditions",
      },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "buyer")} (“Buyer”) gives ${v(f, "seller")} (“Seller”) a deposit to hold the following item:`,
        ``,
        `Item: ${v(f, "item")}`,
        `Deposit amount: ${v(f, "deposit")}`,
        `Total price: ${v(f, "total")}`,
        `Held until: ${v(f, "holdUntil")}`,
        ``,
        `Deposit terms:`,
        `${v(f, "depositTerms")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  roommate: {
    label: "Roommate / Shared Expense",
    defaultTitle: "Shared expense agreement",
    fields: [
      { key: "personOne", label: "Person one full name" },
      { key: "personTwo", label: "Person two full name" },
      { key: "expense", label: "Expense or bill", placeholder: "e.g., rent, electric bill, internet" },
      { key: "amount", label: "Total amount", placeholder: "e.g., $1,200" },
      {
        key: "split",
        label: "How it is being split",
        placeholder: "e.g., 50/50 or Person one pays 70%, person two pays 30%",
      },
      { key: "due", label: "Due date / payment expectation", placeholder: "e.g., Due by the 1st of each month" },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "personOne")} and ${v(f, "personTwo")} agree to share the following expense:`,
        ``,
        `Expense / bill: ${v(f, "expense")}`,
        `Total amount: ${v(f, "amount")}`,
        `Split: ${v(f, "split")}`,
        `Due / payment expectation: ${v(f, "due")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  service: {
    label: "Service Appointment",
    defaultTitle: "Service appointment agreement",
    fields: [
      { key: "provider", label: "Service provider full name" },
      { key: "customer", label: "Customer full name" },
      { key: "service", label: "Service to be provided", multiline: true },
      { key: "date", label: "Date / time expectation", placeholder: "e.g., Saturday at 2:00 PM" },
      { key: "location", label: "Location", placeholder: "e.g., 123 Main St." },
      { key: "price", label: "Price / payment expectation", placeholder: "e.g., $150 due after completion" },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "provider")} (“Service Provider”) agrees to provide the following service for ${v(f, "customer")} (“Customer”):`,
        ``,
        `Service:`,
        `${v(f, "service")}`,
        ``,
        `Date / time expectation: ${v(f, "date")}`,
        `Location: ${v(f, "location")}`,
        `Price / payment expectation: ${v(f, "price")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  equipmentRental: {
    label: "Equipment Rental",
    defaultTitle: "Equipment rental agreement",
    fields: [
      { key: "owner", label: "Owner full name" },
      { key: "renter", label: "Renter full name" },
      { key: "equipment", label: "Equipment", placeholder: "e.g., trailer, pressure washer, generator" },
      {
        key: "condition",
        label: "Condition at handoff",
        multiline: true,
        placeholder: "Working condition, damage, included accessories…",
      },
      { key: "rentalPeriod", label: "Rental period", placeholder: "e.g., March 25 to March 27" },
      { key: "rentalPrice", label: "Rental price", placeholder: "e.g., $75 per day" },
      {
        key: "returnCondition",
        label: "Return condition expectation",
        multiline: true,
        placeholder: "Fuel level, cleanliness, working order, etc.",
      },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "owner")} (“Owner”) agrees to rent the following equipment to ${v(f, "renter")} (“Renter”):`,
        ``,
        `Equipment: ${v(f, "equipment")}`,
        `Condition at handoff: ${v(f, "condition")}`,
        `Rental period: ${v(f, "rentalPeriod")}`,
        `Rental price: ${v(f, "rentalPrice")}`,
        ``,
        `Return condition expectation:`,
        `${v(f, "returnCondition")}`,
        ``,
        `Other terms:`,
        `- ${clean(f.notes) || "__________"}`,
        ``,
        `This record reflects our mutual understanding at the time of agreement.`,
      ].join("\n"),
  },

  gift: {
    label: "Gift Acknowledgment",
    defaultTitle: "Gift acknowledgment",
    fields: [
      { key: "giver", label: "Giver full name" },
      { key: "receiver", label: "Receiver full name" },
      { key: "item", label: "Gift item", placeholder: "e.g., furniture, laptop, money" },
      {
        key: "description",
        label: "Description (optional)",
        multiline: true,
        placeholder: "Details about the gift, condition, serial number, etc.",
      },
      {
        key: "understanding",
        label: "Gift understanding",
        multiline: true,
        placeholder: "e.g., This is a gift and not a loan or sale",
      },
      { key: "notes", label: "Other terms (optional)", multiline: true },
    ],
    buildText: (f) =>
      [
        `On this date, ${v(f, "giver")} (“Giver”) acknowledges giving the following item to ${v(f, "receiver")} (“Receiver”):`,
        ``,
        `Gift item: ${v(f, "item")}`,
        `Description: ${clean(f.description) || "__________"}`,
        ``,
        `Gift understanding:`,
        `${v(f, "understanding")}`,
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

function shellClass() {
  return [
    "relative overflow-hidden rounded-[28px] border border-white/12",
    "bg-gradient-to-br from-white/[0.075] via-white/[0.045] to-white/[0.022]",
    "shadow-[0_18px_52px_rgba(0,0,0,0.44),0_0_38px_rgba(16,185,129,0.06)]",
    "backdrop-blur",
  ].join(" ");
}

function inputClass() {
  return [
    "mt-2 w-full rounded-2xl border border-white/10",
    "bg-gradient-to-br from-white/[0.06] to-white/[0.03]",
    "px-4 py-3 text-white placeholder:text-white/35 outline-none transition",
    "focus:border-emerald-400/35 focus:ring-2 focus:ring-emerald-500/30",
  ].join(" ");
}

function textAreaClass() {
  return [
    "mt-2 w-full rounded-2xl border border-white/10",
    "bg-gradient-to-br from-white/[0.06] to-white/[0.03]",
    "px-4 py-3 text-white placeholder:text-white/35 outline-none transition",
    "focus:border-emerald-400/35 focus:ring-2 focus:ring-emerald-500/30",
  ].join(" ");
}

function sectionAccent() {
  return (
    <div className="mb-4 h-[2px] w-12 rounded-full bg-emerald-400/85 shadow-[0_0_16px_rgba(16,185,129,0.5)]" />
  );
}

export default function NewPage() {
  const router = useRouter();

  const [preset, setPreset] = useState<PresetType>("property");

  const [title, setTitle] = useState("");
  const [personA, setPersonA] = useState("");
  const [personB, setPersonB] = useState("");

  const [fields, setFields] = useState<Record<string, string>>({});
  const [manualEdit, setManualEdit] = useState(false);
  const [manualText, setManualText] = useState("");

  const [includeNotary, setIncludeNotary] = useState(false);
  const [notaryMode, setNotaryMode] = useState("In-person notarization");
  const [notaryState, setNotaryState] = useState("Louisiana");
  const [notaryParish, setNotaryParish] = useState("");
  const [useCustomNotaryText, setUseCustomNotaryText] = useState(false);
  const [customNotaryText, setCustomNotaryText] = useState("");
  const [notaryName, setNotaryName] = useState("");
  const [commissionId, setCommissionId] = useState("");
  const [commissionInfo, setCommissionInfo] = useState("");

  useEffect(() => {
    const d = loadDraft();
    if (!d) {
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
    setTitle(PRESETS[p].defaultTitle);
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
      if (next) setManualText(generatedText);
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
      ? useCustomNotaryText
        ? clean(customNotaryText) || computedNotaryTemplate
        : computedNotaryTemplate
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
                {APP_META.product} · Create
              </div>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
                Create <span className="text-emerald-300">Agreement</span>
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-white/72">
                Create a clean shared record of what was agreed. Keep it short,
                specific, and honest.
              </p>
            </div>

            <div className="hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/14 to-emerald-500/7 px-3 py-2 text-xs font-semibold text-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.12)] md:block">
              {APP_META.company}
            </div>
          </div>

          <div className="relative mt-7">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45">
              <span className="text-white/90">Create</span>
              <span>Review</span>
              <span>Acknowledge</span>
              <span>Record</span>
            </div>

            <div className="mt-3 h-[4px] rounded-full bg-white/8">
              <div className="h-[4px] w-[24%] rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.45)]" />
            </div>
          </div>
        </section>

        <section className={shellClass() + " p-6"}>
          <div className="absolute inset-y-0 left-0 w-[28%] bg-[radial-gradient(circle_at_left_center,rgba(16,185,129,0.08),transparent_62%)]" />
          <div className="relative">
            {sectionAccent()}
            <div className="text-xl font-semibold text-white">Choose a starting point</div>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Pick the type that fits best, or start blank and write your own.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {(Object.keys(PRESETS) as PresetType[]).map((p) => {
                const active = preset === p;

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => choosePreset(p)}
                    className={[
                      "px-4 py-2.5 text-sm font-semibold transition",
                      "rounded-xl border",
                      active
                        ? [
                            "border-emerald-400/30",
                            "bg-emerald-500/15",
                            "text-emerald-200",
                            "shadow-[0_10px_30px_rgba(16,185,129,0.18),0_0_18px_rgba(16,185,129,0.08)]",
                          ].join(" ")
                        : [
                            "border-white/10",
                            "bg-white/[0.04]",
                            "text-white/72",
                            "hover:bg-white/[0.07]",
                            "hover:text-white",
                          ].join(" "),
                    ].join(" ")}
                  >
                    {PRESETS[p].label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-6">
          <div className={shellClass() + " p-6"}>
            <div className="absolute inset-y-0 right-0 w-[24%] bg-[radial-gradient(circle_at_right_center,rgba(59,130,246,0.08),transparent_60%)]" />

            <div className="relative">
              {sectionAccent()}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold text-white">Notary</div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
                    Optional. Use this only if notarization is actually needed.
                    The notary should use the wording required where the notarization occurs.
                  </p>
                </div>

                <label
                  className={[
                    "inline-flex items-center gap-3 rounded-xl border px-4 py-2 text-sm font-semibold transition",
                    includeNotary
                      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.08)]"
                      : "border-white/10 bg-white/[0.04] text-white",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-500"
                    checked={includeNotary}
                    onChange={(e) => setIncludeNotary(e.target.checked)}
                  />
                  Include
                </label>
              </div>

              {includeNotary ? (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <select
                      className="w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/35 focus:ring-2 focus:ring-emerald-500/30"
                      value={notaryMode}
                      onChange={(e) => setNotaryMode(e.target.value)}
                    >
                      <option className="bg-[#0f1218] text-white">In-person notarization</option>
                      <option className="bg-[#0f1218] text-white">Remote online notarization</option>
                    </select>

                    <label
                      className={[
                        "inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                        useCustomNotaryText
                          ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.08)]"
                          : "border-white/10 bg-white/[0.04] text-white",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-emerald-500"
                        checked={useCustomNotaryText}
                        onChange={(e) => setUseCustomNotaryText(e.target.checked)}
                      />
                      Use custom certificate text
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      className={inputClass()}
                      value={notaryState}
                      onChange={(e) => setNotaryState(e.target.value)}
                      placeholder="State"
                    />
                    <input
                      className={inputClass()}
                      value={notaryParish}
                      onChange={(e) => setNotaryParish(e.target.value)}
                      placeholder="County / Parish"
                    />
                  </div>

                  <textarea
                    className={textAreaClass() + " min-h-[220px] font-mono leading-6"}
                    readOnly={!useCustomNotaryText}
                    value={useCustomNotaryText ? customNotaryText : computedNotaryTemplate}
                    onChange={(e) => setCustomNotaryText(e.target.value)}
                    placeholder="Paste the notary certificate text here…"
                  />

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      className={inputClass()}
                      value={notaryName}
                      onChange={(e) => setNotaryName(e.target.value)}
                      placeholder="Notary printed name (optional)"
                    />
                    <input
                      className={inputClass()}
                      value={commissionId}
                      onChange={(e) => setCommissionId(e.target.value)}
                      placeholder="Commission / ID / Bar # (optional)"
                    />
                  </div>

                  <input
                    className={inputClass()}
                    value={commissionInfo}
                    onChange={(e) => setCommissionInfo(e.target.value)}
                    placeholder="Commission info (optional)"
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className={shellClass() + " p-6"}>
            <div className="absolute inset-y-0 left-0 w-[26%] bg-[radial-gradient(circle_at_left_center,rgba(16,185,129,0.07),transparent_62%)]" />

            <div className="relative">
              {sectionAccent()}
              <div className="text-xl font-semibold text-white">Agreement basics</div>
              <p className="mt-2 text-sm leading-6 text-white/62">
                Add the agreement title and the two people involved. These names
                must match exactly during acknowledgment.
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-white/88">Title</label>
                  <input
                    className={inputClass()}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Vehicle purchase, Personal loan, Work agreement"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-white/88">Person A</label>
                    <input
                      className={inputClass()}
                      value={personA}
                      onChange={(e) => setPersonA(e.target.value)}
                      placeholder="Person A full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/88">Person B</label>
                    <input
                      className={inputClass()}
                      value={personB}
                      onChange={(e) => setPersonB(e.target.value)}
                      placeholder="Person B full name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {preset !== "blank" ? (
            <div className={shellClass() + " p-6"}>
              <div className="absolute inset-y-0 right-0 w-[24%] bg-[radial-gradient(circle_at_right_center,rgba(59,130,246,0.08),transparent_60%)]" />

              <div className="relative">
                {sectionAccent()}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xl font-semibold text-white">Agreement details</div>
                    <p className="mt-2 text-sm leading-6 text-white/62">
                      These fields generate the agreement text automatically.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={toggleManualEdit}
                    className={[
                      "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                      manualEdit
                        ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.08)]"
                        : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]",
                    ].join(" ")}
                  >
                    {manualEdit ? "Stop Editing Full Text" : "Edit Full Text"}
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4">
                  {presetDef.fields.map((f) => (
                    <div key={f.key}>
                      <label className="block text-sm font-semibold text-white/88">
                        {f.label}
                      </label>

                      {f.multiline ? (
                        <textarea
                          className={textAreaClass() + " min-h-[110px]"}
                          value={fields[f.key] || ""}
                          onChange={(e) => setField(f.key, e.target.value)}
                          placeholder={f.placeholder || ""}
                        />
                      ) : (
                        <input
                          className={inputClass()}
                          value={fields[f.key] || ""}
                          onChange={(e) => setField(f.key, e.target.value)}
                          placeholder={f.placeholder || ""}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className={shellClass() + " p-6"}>
            <div className="absolute inset-y-0 left-0 w-[28%] bg-[radial-gradient(circle_at_left_center,rgba(16,185,129,0.07),transparent_62%)]" />

            <div className="relative">
              {sectionAccent()}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold text-white">Agreement text</div>
                  <p className="mt-2 text-sm leading-6 text-white/62">
                    {preset === "blank"
                      ? "Write the agreement in plain language."
                      : manualEdit
                        ? "You are editing the full text directly."
                        : "This text is generated from the fields above."}
                  </p>
                </div>

                <div className="hidden rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.08)] md:block">
                  Record first. Debate later.
                </div>
              </div>

              <textarea
                className={textAreaClass() + " mt-5 min-h-[280px] border-emerald-400/12"}
                value={preset === "blank" || manualEdit ? manualText : generatedText}
                readOnly={preset !== "blank" && !manualEdit}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Write what both sides agreed to, in plain language…"
              />
            </div>
          </div>
        </section>

        <section className={shellClass() + " p-6"}>
          <div className="absolute inset-y-0 right-0 w-[30%] bg-[radial-gradient(circle_at_right_center,rgba(16,185,129,0.08),transparent_60%)]" />

          <div className="relative">
            {sectionAccent()}
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xl font-semibold text-white">Ready to review</div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
                  Continue when both names are entered and the agreement reads clearly enough
                  to review together.
                </p>
              </div>

              <div className="w-full md:w-auto">
                <button
                  className="inline-flex w-full min-w-[240px] items-center justify-center rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black shadow-[0_0_28px_rgba(16,185,129,0.24),0_12px_28px_rgba(0,0,0,0.24)] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!canContinue}
                  onClick={continueToReview}
                >
                  Continue to Review
                </button>
              </div>
            </div>

            {!canContinue ? (
              <div className="mt-4 text-sm text-white/55">
                To continue, add both names and a title or agreement text.
              </div>
            ) : null}
          </div>
        </section>

        <footer className="pb-2 text-center text-sm leading-6 text-white/42">
          Not legal advice. A {APP_META.company} product.
        </footer>
      </div>
    </main>
  );
}