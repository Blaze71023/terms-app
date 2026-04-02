"use client";

import { useState } from "react";

export default function FeedbackPage() {
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    window.location.href = `mailto:termssupport@gmail.com?subject=TERMS Feedback&body=${encodeURIComponent(
      message
    )}`;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-semibold mb-6">Feedback</h1>

      <p className="mb-4 text-white/70">
        We’re actively improving TERMS. Tell us what worked, what didn’t, or what you’d like to see next.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your feedback..."
          className="w-full rounded-xl p-4 bg-slate-800 border border-slate-700 text-white"
          rows={6}
          required
        />

        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-white text-black font-semibold hover:opacity-90 transition"
        >
          Send Feedback
        </button>
      </form>
    </main>
  );
}