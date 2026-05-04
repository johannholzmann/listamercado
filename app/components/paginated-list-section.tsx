"use client";

import Link from "next/link";
import { useState } from "react";

import {
  LIST_PAGE_SIZE,
  type ListSummary,
  type PaginatedListPage,
} from "@/lib/list-types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function mergeById(current: ListSummary[], incoming: ListSummary[]) {
  const seen = new Set(current.map((item) => item.id));
  return [...current, ...incoming.filter((item) => !seen.has(item.id))];
}

type PaginatedListSectionProps = {
  title: string;
  helperText: string;
  emptyTitle: string;
  emptyText: string;
  totalCount: number;
  initialPage: PaginatedListPage;
  emptyActionHref?: string;
  emptyActionLabel?: string;
};

export function PaginatedListSection({
  title,
  helperText,
  emptyTitle,
  emptyText,
  totalCount,
  initialPage,
  emptyActionHref,
  emptyActionLabel,
}: PaginatedListSectionProps) {
  const [items, setItems] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasItems = items.length > 0;
  const hasMore = Boolean(nextCursor);

  async function loadMore() {
    if (!nextCursor || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL("/api/me/lists", window.location.origin);
      url.searchParams.set("cursor", nextCursor);
      url.searchParams.set("limit", String(LIST_PAGE_SIZE));

      const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar mas listas.");
      }

      const payload = (await response.json()) as PaginatedListPage;

      setItems((current) => mergeById(current, payload.items));
      setNextCursor(payload.nextCursor);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar mas listas.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
      <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Creadas por mi
          </p>
          <h2 className="font-display text-3xl text-[color:var(--foreground)]">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
            {helperText}
          </p>
        </div>

        <p className="text-sm font-semibold text-[color:var(--foreground)]">
          {totalCount} listas
        </p>
      </div>

      {hasItems ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((list) => (
              <article
                key={list.id}
                className="rounded-[1.6rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-5 shadow-[var(--shadow)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-display text-2xl text-[color:var(--foreground)]">
                      {list.title}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {list.itemCount} productos
                    </p>
                  </div>

                  <Link
                    href={`/l/${list.shareCode}`}
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--background)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
                  >
                    Abrir
                  </Link>
                </div>

                <p className="mt-4 text-xs text-[color:var(--muted)]">
                  Actualizada {formatDate(list.updatedAt)}
                </p>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {error ? (
              <p className="text-sm text-[color:var(--danger,#b42318)]">
                {error}
              </p>
            ) : null}

            {hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={isLoading}
                className="inline-flex w-fit rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Cargando..." : "Cargar mas"}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-[1.6rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface-strong)] p-6">
          <p className="font-display text-2xl text-[color:var(--foreground)]">
            {emptyTitle}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[color:var(--muted)]">
            {emptyText}
          </p>
          {emptyActionHref && emptyActionLabel ? (
            <Link
              href={emptyActionHref}
              className="mt-4 inline-flex rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:-translate-y-0.5"
            >
              {emptyActionLabel}
            </Link>
          ) : null}
        </div>
      )}
    </section>
  );
}
