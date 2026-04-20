'use client';

import { useState } from "react";

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:text-[color:var(--accent-strong)]"
    >
      {copied ? "Enlace copiado" : "Copiar enlace"}
    </button>
  );
}

