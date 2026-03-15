"use client";

import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function DashboardNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="text-center max-w-md w-full">
        {/* Error code */}
        <p
          className="text-[7rem] leading-none font-bold select-none opacity-[0.06]"
          style={{ color: "var(--foreground)" }}
          aria-hidden="true"
        >
          404
        </p>

        {/* Animated logo */}
        <div className="-mt-16 mb-8 flex justify-center">
          <Logo size={64} animate />
        </div>

        {/* Copy */}
        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: "var(--foreground)" }}
        >
          Page introuvable
        </h1>
        <p
          className="mb-8 text-sm leading-relaxed"
          style={{ color: "var(--muted)" }}
        >
          Oups ! Cette page n&apos;existe pas ou a&eacute;t&eacute; d&eacute;plac&eacute;e.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/evenements"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "var(--primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--primary)")
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Retour &agrave; l&apos;accueil
          </Link>

          <a
            href="mailto:support@ogong.fr"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              backgroundColor: "var(--surface)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--surface)")
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
            Contacter le support
          </a>
        </div>
      </div>
    </div>
  );
}
