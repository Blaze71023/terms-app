export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 text-white">
      <h1 className="text-3xl font-semibold mb-6">Terms of Service</h1>

      <p className="mb-4">
        TERMS is a tool provided by ZeroHour Systems that allows users to create
        plain-language records of mutual agreements.
      </p>

      <p className="mb-4">
        TERMS is not a law firm and does not provide legal advice. Documents
        created are user-generated and not legally verified.
      </p>

      <p className="mb-4">
        You are responsible for the accuracy of all information entered. TERMS is
        not responsible for disputes, losses, or outcomes related to agreements
        created using this app.
      </p>

      <p>
        Use of this app is at your own discretion and risk. ZeroHour Systems
        reserves the right to update or modify the service at any time.
      </p>
      <div className="mt-12 pt-6 border-t border-white/10 text-center text-sm text-white/40">
  <a href="/terms" className="mx-2 hover:text-white transition">
    Terms
  </a>
  <span className="text-white/20">|</span>
  <a href="/privacy" className="mx-2 hover:text-white transition">
    Privacy
  </a>
  <span className="text-white/20">|</span>
  <a href="/disclaimer" className="mx-2 hover:text-white transition">
    Disclaimer
  </a>
</div>
    </main>
  );
}