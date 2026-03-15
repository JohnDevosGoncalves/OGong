"use client";

import { useState } from "react";

interface ShareLinkProps {
  eventId: string;
  isOpen: boolean;
}

export default function ShareLink({ eventId, isOpen }: ShareLinkProps) {
  const [linkCopied, setLinkCopied] = useState(false);

  if (!isOpen) return null;

  async function handleCopyLink() {
    const link = `${window.location.origin}/${eventId}/inscription`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-5 mb-8">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground mb-1">Lien d&apos;inscription public</p>
          <p className="text-xs text-muted truncate font-mono">
            {typeof window !== "undefined" ? `${window.location.origin}/${eventId}/inscription` : `/${eventId}/inscription`}
          </p>
        </div>
        <button
          onClick={handleCopyLink}
          className="flex-shrink-0 py-2 px-4 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface-hover transition-colors flex items-center gap-2"
        >
          {linkCopied ? (
            <>
              <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              <span className="text-success">Copié !</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
              </svg>
              Copier le lien
            </>
          )}
        </button>
      </div>
    </div>
  );
}
