import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

export const metadata: Metadata = {
  title: {
    template: "%s | OGong",
    default: "Informations juridiques | OGong",
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <Logo size={32} />
            <span className="text-lg font-bold text-foreground tracking-tight">
              ogong
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            &larr; Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>

      <footer className="border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p>&copy; 2026 OGong. Tous droits r&eacute;serv&eacute;s.</p>
          <nav aria-label="Liens juridiques" className="flex items-center gap-4">
            <Link href="/cgu" className="hover:text-foreground transition-colors">
              CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-foreground transition-colors">
              Confidentialit&eacute;
            </Link>
            <Link href="/mentions-legales" className="hover:text-foreground transition-colors">
              Mentions l&eacute;gales
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
