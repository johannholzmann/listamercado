import Link from "next/link";
import { cookies } from "next/headers";

import { SessionBootstrap } from "@/app/components/session-bootstrap";
import { SiteNavbar } from "@/app/components/site-navbar";
import {
  getLatestListByShareCode,
  getParticipantById,
  getOwnedListsByParticipantId,
} from "@/lib/store";

function prettyDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function MyListsPage() {
  const cookieStore = await cookies();
  const lastShareCode = cookieStore.get("listamercado_last_list")?.value ?? null;
  const participantId = cookieStore.get("listamercado_session")?.value ?? null;

  const [lastList, ownedLists, participant] = await Promise.all([
    getLatestListByShareCode(lastShareCode),
    getOwnedListsByParticipantId(participantId),
    participantId ? getParticipantById(participantId) : Promise.resolve(null),
  ]);

  const currentListHref = lastList ? `/l/${lastList.list.shareCode}` : null;
  const currentListLabel = lastList?.list.title ?? null;

  return (
    <main className="relative min-h-screen overflow-visible px-4 py-6 sm:px-6 lg:px-8">
      <SessionBootstrap />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(73,105,76,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(232,140,65,0.16),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.32),_rgba(255,255,255,0))]" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <SiteNavbar
          currentListHref={currentListHref}
          currentListLabel={currentListLabel}
          sessionLabel={participant?.label ?? null}
        />

        <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Mis listas
              </p>
              <h1 className="mt-2 font-display text-4xl leading-none text-[color:var(--foreground)] sm:text-5xl">
                Todo lo que creaste con tu sesión
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
                Este es el panel para volver a cualquier lista propia sin buscar
                enlaces viejos ni depender del historial del navegador.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:-translate-y-0.5"
            >
              Crear una nueva lista
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ownedLists.length > 0 ? (
            ownedLists.map((list) => (
              <article
                key={list.id}
                className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)]"
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
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
                  >
                    Abrir
                  </Link>
                </div>
                <p className="mt-4 text-xs text-[color:var(--muted)]">
                  Actualizada {prettyDate(list.updatedAt)}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-sm leading-6 text-[color:var(--muted)]">
              Aun no tenes listas propias. Cuando crees la primera, va a aparecer
              aca.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
