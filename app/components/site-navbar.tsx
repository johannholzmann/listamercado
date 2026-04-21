"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SiteNavbarProps = {
  currentListHref?: string | null;
  currentListLabel?: string | null;
  sessionLabel?: string | null;
};

function navClass(isActive: boolean) {
  return [
    "rounded-full px-4 py-2 text-sm font-semibold transition",
    isActive
      ? "bg-[color:var(--foreground)] text-[color:var(--background)] shadow-[0_10px_30px_rgba(20,16,12,0.12)]"
      : "border border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]",
  ].join(" ");
}

export function SiteNavbar({
  currentListHref,
  currentListLabel,
  sessionLabel,
}: SiteNavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isLists = pathname === "/mis-listas";
  const isCurrentList = Boolean(currentListHref && pathname === currentListHref);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--background)]/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold tracking-[0.18em] text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
            >
              LISTAMERCADO
            </Link>
            {sessionLabel ? (
              <span className="hidden rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-xs font-medium text-[color:var(--muted)] sm:inline-flex">
                {sessionLabel}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className={navClass(isHome)}>
              Home
            </Link>

            {currentListHref ? (
              <Link href={currentListHref} className={navClass(isCurrentList)}>
                {currentListLabel ?? "Lista actual"}
              </Link>
            ) : (
              <span className="cursor-default rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--muted)]">
                Lista actual
              </span>
            )}

            <Link href="/mis-listas" className={navClass(isLists)}>
              Mis listas
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
