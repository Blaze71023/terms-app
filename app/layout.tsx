import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TERMS",
  description: "Create a clean agreement in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        {children}

        <footer className="mt-16 border-t border-white/10 px-6 py-8 text-center text-xs text-white/50">
          <div className="mb-3">
            Not legal advice. TERMS provides a plain-language mutual acknowledgment record only.
          </div>

          <div className="mb-4">
            © {new Date().getFullYear()} ZeroHour Systems
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="/terms" className="hover:text-white transition">
              Terms
            </a>

            <span className="text-white/20">|</span>

            <a href="/privacy" className="hover:text-white transition">
              Privacy
            </a>

            <span className="text-white/20">|</span>

            <a href="/disclaimer" className="hover:text-white transition">
              Disclaimer
            </a>

            <span className="text-white/20">|</span>

            <a href="/contact" className="hover:text-white transition">
              Contact
            </a>

            <span className="text-white/20">|</span>

            <a href="/feedback" className="hover:text-white transition">
              Feedback
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}