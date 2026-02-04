"use client";

import React from "react";

type Step = "create" | "review" | "sign" | "receipt";

export default function FlowHeader({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "create", label: "Create" },
    { key: "review", label: "Review" },
    { key: "sign", label: "Sign" },
    { key: "receipt", label: "Receipt" },
  ];

  return (
    <div className="mb-6">
      <div className="text-xs text-gray-500 mb-2">Mutual Acknowledgment</div>
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((s, idx) => {
          const active = s.key === step;
          return (
            <React.Fragment key={s.key}>
              <span
                className={[
                  "text-sm rounded-full border px-3 py-1",
                  active ? "bg-black text-white border-black" : "bg-white text-gray-700",
                ].join(" ")}
              >
                {s.label}
              </span>
              {idx < steps.length - 1 && <span className="text-gray-300">→</span>}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
