import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms App",
  description: "Create a clean agreement in minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        <footer className="mt-12 border-t border-white/10 px-6 py-6 text-center text-xs text-white/50">
          <div className="mb-2">
            Not legal advice. TERMS provides a plain-language mutual acknowledgment record only.
          </div>

          <div className="mb-2">© {new Date().getFullYear()} ZeroHour Systems</div>

          <div className="flex items-center justify-center gap-3">
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
          </div>
        </footer>
      </body>
    </html>
  );
}