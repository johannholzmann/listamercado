import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import {
  getListByShareCode,
  getParticipantById,
  getStatusCounts,
  groupItemsByStatus,
  ITEM_STATUSES,
} from "@/lib/store";
import {
  addShoppingItem,
  renameShoppingList,
  updateShoppingItemDetails,
  updateShoppingItemStatus,
} from "@/app/actions";
import { ParticipantCard } from "@/app/components/participant-card";
import { CopyLinkButton } from "@/app/components/copy-link-button";
import { SiteNavbar } from "@/app/components/site-navbar";
import { SessionBootstrap } from "@/app/components/session-bootstrap";
import { ShoppingItemForm } from "@/app/components/shopping-item-form";
import { ShoppingStatusTabs } from "@/app/components/shopping-status-tabs";

const STATUS_TITLES: Record<(typeof ITEM_STATUSES)[number], string> = {
  pendiente: "Por comprar",
  agregado: "Comprados",
  resuelto: "Ya no hace falta",
};

const STATUS_BADGES: Record<(typeof ITEM_STATUSES)[number], string> = {
  pendiente: "border-amber-300 bg-amber-100 text-amber-950",
  agregado: "border-emerald-300 bg-emerald-100 text-emerald-950",
  resuelto: "border-slate-300 bg-slate-100 text-slate-950",
};

export default async function ListPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;
  const cookieStore = await cookies();
  const participantId = cookieStore.get("quecompramos_session")?.value ?? null;
  const [details, participant] = await Promise.all([
    getListByShareCode(shareCode),
    participantId ? getParticipantById(participantId) : Promise.resolve(null),
  ]);

  if (!details) {
    notFound();
  }

  const { list, items } = details;
  const counts = getStatusCounts(items);
  const groupedItems = groupItemsByStatus(items);

  const renameAction = renameShoppingList.bind(null, shareCode);
  const addItemAction = addShoppingItem.bind(null, shareCode);
  const editItemAction = updateShoppingItemDetails.bind(null, shareCode);
  const statusAction = updateShoppingItemStatus.bind(null, shareCode);
  const sharePath = `/l/${shareCode}`;

  return (
    <main className="relative min-h-screen overflow-visible px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <SessionBootstrap shareCode={shareCode} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(73,105,76,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(232,140,65,0.16),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.32),_rgba(255,255,255,0))]" />

      <div className="relative mx-auto flex w-full max-w-[88rem] flex-col gap-4">
        <SiteNavbar
          currentListHref={`/l/${shareCode}`}
          currentListLabel={list.title}
          sessionLabel={participant?.label ?? null}
        />

        <section
          id="resumen"
          className="scroll-mt-24 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
                Lista
              </p>
              <h1 className="max-w-3xl font-display text-4xl leading-none text-[color:var(--foreground)] sm:text-5xl">
                {list.title}
              </h1>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
              {[
                ["pendiente", "Por comprar", counts.pendiente],
                ["agregado", "Comprados", counts.agregado],
                ["resuelto", "Resueltos", counts.resuelto],
              ].map(([key, label, value]) => (
                <article
                  key={key}
                  className="rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    {label}
                  </p>
                  <p className="mt-3 font-display text-3xl leading-none text-[color:var(--foreground)]">
                    {value.toString().padStart(2, "0")}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="compartir"
          className="scroll-mt-24 rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-4 shadow-[var(--shadow)]"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Compartir
              </p>
              <h2 className="font-display text-2xl text-[color:var(--foreground)]">
                Copiar enlace
              </h2>
            </div>

            <CopyLinkButton path={sharePath} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <div className="space-y-4">
            <section
              id="productos"
              className="scroll-mt-24 rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)]"
            >
              <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    Agregar producto
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-[color:var(--foreground)]">
                    Agregar producto
                  </h2>
                </div>
              </div>

              <ShoppingItemForm action={addItemAction} shareCode={shareCode} />
            </section>

            <ShoppingStatusTabs
              editItemAction={editItemAction}
              statusAction={statusAction}
              tabs={ITEM_STATUSES.map((status) => ({
                status,
                title: STATUS_TITLES[status],
                badgeClass: STATUS_BADGES[status],
                items: groupedItems[status],
              }))}
            />
          </div>

          <aside className="space-y-4">
            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Renombrar
              </p>
              <h2 className="mt-2 font-display text-2xl text-[color:var(--foreground)]">
                Cambiar nombre
              </h2>

              <form action={renameAction} className="mt-4 flex flex-col gap-3">
                <input
                  type="text"
                  name="title"
                  defaultValue={list.title}
                  className="min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
                  placeholder="Lista del mercado"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-strong)]"
                >
                  Guardar titulo
                </button>
              </form>
            </section>

            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Listas
              </p>
              <h2 className="mt-2 font-display text-2xl text-[color:var(--foreground)]">
                Abrir guardadas
              </h2>
              <Link
                href="/mis-listas"
                className="mt-4 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
              >
                Abrir mis listas
              </Link>
            </section>

            <ParticipantCard
              id="sesion"
              compact
              label={participant?.label ?? "Sesion temporal activa"}
              shareCode={shareCode}
              heading="Sesion"
              helperText="Nombre visible."
            />
          </aside>
        </section>
      </div>
    </main>
  );
}
