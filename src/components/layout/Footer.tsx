import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
        <p>&copy; 2026 OGong. Tous droits reserv&eacute;s.</p>
        <nav aria-label="Liens juridiques" className="flex items-center gap-4">
          <Link
            href="/cgu"
            className="hover:text-foreground transition-colors"
          >
            CGU
          </Link>
          <Link
            href="/confidentialite"
            className="hover:text-foreground transition-colors"
          >
            Confidentialit&eacute;
          </Link>
          <Link
            href="/mentions-legales"
            className="hover:text-foreground transition-colors"
          >
            Mentions l&eacute;gales
          </Link>
        </nav>
      </div>
    </footer>
  );
}
