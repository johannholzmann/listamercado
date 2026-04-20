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
  updateShoppingItemStatus,
} from "@/app/actions";
import { CopyLinkButton } from "@/app/components/copy-link-button";
import { SessionBootstrap } from "@/app/components/session-bootstrap";

const STATUS_TITLES: Record<(typeof ITEM_STATUSES)[number], string> = {
  pendiente: "Por comprar",
  agregado: "Comprados",
  resuelto: "Ya no hace falta",
};

const STATUS_HELPERS: Record<(typeof ITEM_STATUSES)[number], string> = {
  pendiente: "Todavia falta comprarlo.",
  agregado: "Ya se compro o ya no queda pendiente.",
  resuelto: "Ya no hace falta llevarlo.",
};

const STATUS_BADGES: Record<(typeof ITEM_STATUSES)[number], string> = {
  pendiente: "border-amber-300 bg-amber-100 text-amber-950",
  agregado: "border-emerald-300 bg-emerald-100 text-emerald-950",
  resuelto: "border-slate-300 bg-slate-100 text-slate-950",
};

function prettyDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function ListPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;
  const details = getListByShareCode(shareCode);

  if (!details) {
    notFound();
  }

  const { list, items } = details;
  const counts = getStatusCounts(items);
  const groupedItems = groupItemsByStatus(items);
  const cookieStore = await cookies();
  const participantId = cookieStore.get("listamercado_session")?.value ?? null;
  const participant = participantId ? getParticipantById(participantId) : null;

  const renameAction = renameShoppingList.bind(null, shareCode);
  const addItemAction = addShoppingItem.bind(null, shareCode);
  const statusAction = updateShoppingItemStatus.bind(null, shareCode);
  const sharePath = `/l/${shareCode}`;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <SessionBootstrap shareCode={shareCode} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(73,105,76,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(232,140,65,0.16),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.32),_rgba(255,255,255,0))]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]"
            >
              ListaMercado
            </Link>
            <div className="space-y-1">
              <h1 className="font-display text-4xl leading-none text-[color:var(--foreground)] sm:text-5xl">
                {list.title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
                Esta lista queda persistente con un enlace secreto. Cualquiera con
                el link entra a la misma lista y puede seguir agregando o
                completando productos.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm text-[color:var(--muted)]">
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Tu sesion
              </p>
              <p className="mt-1 font-medium text-[color:var(--foreground)]">
                {participant?.label ?? "Sesion temporal activa"}
              </p>
            </div>
            <CopyLinkButton path={sharePath} />
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["pendiente", "Por comprar", counts.pendiente],
                  ["agregado", "Comprados", counts.agregado],
                  ["resuelto", "Ya no hace falta", counts.resuelto],
                ] as const
              ).map(([key, label, value]) => (
                <article
                  key={key}
                  className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow)]"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    {label}
                  </p>
                  <p className="mt-3 font-display text-4xl leading-none text-[color:var(--foreground)]">
                    {value.toString().padStart(2, "0")}
                  </p>
                </article>
              ))}
            </div>

            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    Renombrar lista
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-[color:var(--foreground)]">
                    Guardada para volver cuando quieran
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-6 text-[color:var(--muted)]">
                  El titulo es opcional, pero ayuda a distinguir listas cuando una
                  misma persona administra mas de una.
                </p>
              </div>

              <form action={renameAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
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

            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    Agregar producto
                  </p>
                  <h2 className="mt-1 font-display text-2xl text-[color:var(--foreground)]">
                    Cargar cualquier nombre, sin catalogo cerrado
                  </h2>
                </div>
                <p className="max-w-sm text-sm leading-6 text-[color:var(--muted)]">
                  El texto se guarda tal cual lo escribe cada persona, para que la
                  lista siga siendo rapida y flexible.
                </p>
              </div>

              <form action={addItemAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={120}
                  className="min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
                  placeholder="Leche, arroz, jabon, cafe..."
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-[color:var(--background)] transition hover:-translate-y-0.5"
                >
                  Agregar
                </button>
              </form>
            </section>

            <section className="grid gap-4 xl:grid-cols-3">
              {ITEM_STATUSES.map((status) => {
                const listItems = groupedItems[status];
                return (
                  <article
                    key={status}
                    className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                          {STATUS_TITLES[status]}
                        </p>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">
                          {STATUS_HELPERS[status]}
                        </p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_BADGES[status]}`}>
                        {listItems.length}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {listItems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-8 text-center text-sm text-[color:var(--muted)]">
                          Nada por ahora.
                        </div>
                      ) : (
                        listItems.map((item) => (
                          <article
                            key={item.id}
                            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2">
                                <p className="text-base font-semibold text-[color:var(--foreground)]">
                                  {item.name}
                                </p>
                                <p className="text-xs text-[color:var(--muted)]">
                                  Guardado {prettyDate(item.createdAt)}
                                </p>
                              </div>
                              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${STATUS_BADGES[item.status]}`}>
                          {STATUS_TITLES[item.status]}
                        </span>
                            </div>

                            <form action={statusAction} className="mt-4">
                              <input type="hidden" name="itemId" value={item.id} />
                              <div className="grid grid-cols-3 gap-2">
                                <button
                                  type="submit"
                                  name="status"
                                  value="pendiente"
                                  className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
                                >
                                  Por comprar
                                </button>
                                <button
                                  type="submit"
                                  name="status"
                                  value="agregado"
                                  className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
                                >
                                  Comprado
                                </button>
                                <button
                                  type="submit"
                                  name="status"
                                  value="resuelto"
                                  className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
                                >
                                  Ya no hace falta
                                </button>
                              </div>
                            </form>
                          </article>
                        ))
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-6 text-[color:var(--background)] shadow-[var(--shadow)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:rgba(255,255,255,0.68)]">
                Como se comparte
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight">
                Un enlace secreto alcanza para colaborar.
              </h2>
              <p className="mt-4 text-sm leading-6 text-[color:rgba(255,255,255,0.78)]">
                No hace falta crear cuentas. Quien abre este link entra a la misma
                lista, puede editarla y ve los cambios al instante.
              </p>
              <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white/85">
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                  URL compartible
                </p>
                <p className="mt-2 break-all font-mono text-xs">{sharePath}</p>
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Estados
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    Por comprar:
                  </span>{" "}
                  falta comprarlo.
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    Comprado:
                  </span>{" "}
                  ya se compro o se resolvio en la compra.
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--foreground)]">
                    Ya no hace falta:
                  </span>{" "}
                  se saco de la compra porque ya no hace falta.
                </p>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
