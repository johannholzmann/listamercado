import Link from "next/link";
import { cookies } from "next/headers";

import { BrandMark } from "@/app/components/brand-mark";
import { PaginatedListSection } from "@/app/components/paginated-list-section";
import { SessionBootstrap } from "@/app/components/session-bootstrap";
import { SiteNavbar } from "@/app/components/site-navbar";
import {
  getLatestListByShareCode,
  getParticipantById,
  getOwnedListsPageByParticipantId,
} from "@/lib/store";

export default async function MyListsPage() {
  const cookieStore = await cookies();
  const lastShareCode = cookieStore.get("quecompramos_last_list")?.value ?? null;
  const participantId = cookieStore.get("quecompramos_session")?.value ?? null;

  const [lastList, ownedListsPage, participant] = await Promise.all([
    getLatestListByShareCode(lastShareCode),
    getOwnedListsPageByParticipantId(participantId),
    participantId ? getParticipantById(participantId) : Promise.resolve(null),
  ]);

  const currentListHref = lastList ? `/l/${lastList.list.shareCode}` : null;
  const currentListLabel = lastList?.list.title ?? null;

  return (
    <>
      <SessionBootstrap />
      <SiteNavbar
        currentListHref={currentListHref}
        currentListLabel={currentListLabel}
        sessionLabel={participant?.label ?? null}
      />

      <section className="rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <BrandMark
              size="sm"
              subtitle="Volver a tus listas guardadas sin buscar enlaces viejos."
            />
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Mis listas
            </p>
            <h1 className="mt-2 font-display text-4xl leading-none text-[color:var(--foreground)] sm:text-5xl">
              Todo lo que creaste con tu sesion
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

      <PaginatedListSection
        title="Lista de tus compras guardadas"
        helperText="Se muestran primero las mas recientes. Si tenes muchas, podes ir trayendo mas de a poco."
        emptyTitle="Aun no tenes listas propias"
        emptyText="Cuando crees la primera, va a aparecer aca y vas a poder volver a ella sin buscar el enlace."
        totalCount={ownedListsPage.totalCount}
        initialPage={ownedListsPage}
        emptyActionHref="/"
        emptyActionLabel="Crear una nueva lista"
      />
    </>
  );
}
