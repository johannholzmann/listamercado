import Link from "next/link";
import { cookies } from "next/headers";

import { createShoppingList } from "@/app/actions";
import { ParticipantCard } from "@/app/components/participant-card";
import { SessionBootstrap } from "@/app/components/session-bootstrap";
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

export default async function Home() {
  const cookieStore = await cookies();
  const lastShareCode = cookieStore.get("listamercado_last_list")?.value ?? null;
  const participantId = cookieStore.get("listamercado_session")?.value ?? null;
  const [lastList, ownedLists, participant] = await Promise.all([
    getLatestListByShareCode(lastShareCode),
    getOwnedListsByParticipantId(participantId),
    participantId ? getParticipantById(participantId) : Promise.resolve(null),
  ]);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <SessionBootstrap />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(73,105,76,0.16),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(232,140,65,0.16),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.32),_rgba(255,255,255,0))]" />
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)]">
              ListaMercado
            </p>
            <h1 className="font-display text-4xl leading-none text-[color:var(--foreground)] sm:text-5xl">
              Una lista compartida, simple y persistente
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              Pensada para varias personas, sin cuentas complejas. Un enlace
              secreto abre la misma lista para todos, y cada producto se guarda
              con texto libre.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <ParticipantCard
              label={participant?.label ?? "Se crea automaticamente al usar la app"}
              heading="Sesion temporal"
              helperText="Edita el nombre para que tus listas y el grupo te identifiquen mejor."
            />
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Crear lista
              </p>
              <h2 className="mt-2 font-display text-3xl text-[color:var(--foreground)]">
                Arranca una lista nueva y compartila al instante
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--muted)]">
                El enlace que se genera queda como entrada unica a esa lista. No
                hay login ni pasos pesados.
              </p>

              <form action={createShoppingList} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  name="title"
                  maxLength={80}
                  className="min-w-0 flex-1 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-base text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
                  placeholder="Lista del mercado"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-strong)]"
                >
                  Crear lista
                </button>
              </form>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
              {[
                [
                  "Compartir",
                  "Un enlace secreto lleva a la misma lista para todos.",
                ],
                [
                  "Texto libre",
                  "Cualquier persona puede escribir cualquier producto.",
                ],
                [
                  "Estados simples",
                  "Por comprar, comprado y ya no hace falta para colaborar rapido.",
                ],
              ].map(([title, text]) => (
                <article
                  key={title}
                  className="rounded-[1.5rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow)]"
                >
                  <p className="font-display text-2xl text-[color:var(--foreground)]">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                    {text}
                  </p>
                </article>
              ))}
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Tus listas
              </p>
              <h2 className="mt-2 font-display text-3xl text-[color:var(--foreground)]">
                Todo lo que creaste con tu nombre
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[color:var(--muted)]">
                Estas son las listas que quedaron asociadas a tu participante
                temporal. Desde aca podes volver a cualquiera sin buscar el
                enlace.
              </p>

              <div className="mt-5 space-y-3">
                {ownedLists.length > 0 ? (
                  ownedLists.map((list) => (
                    <Link
                      key={list.id}
                      href={`/l/${list.shareCode}`}
                      className="block rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 transition hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
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
                        <span className="rounded-full border border-[color:var(--border)] px-3 py-1 text-xs font-semibold text-[color:var(--muted)]">
                          Abrir
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-[color:var(--muted)]">
                        Actualizada {prettyDate(list.updatedAt)}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-8 text-sm leading-6 text-[color:var(--muted)]">
                    Aun no tenes listas propias. Cuando crees una, va a aparecer
                    aca.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--foreground)] p-6 text-[color:var(--background)] shadow-[var(--shadow)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:rgba(255,255,255,0.68)]">
                Ultima lista abierta
              </p>
              {lastList ? (
                <div className="mt-4 space-y-4">
                  <h2 className="font-display text-3xl leading-tight">
                    {lastList.list.title}
                  </h2>
                  <p className="text-sm leading-6 text-[color:rgba(255,255,255,0.78)]">
                    Quedo registrada en tu navegador. Podes volver directo a esa
                    lista si queres seguir sumando cosas.
                  </p>
                  <Link
                    href={`/l/${lastList.list.shareCode}`}
                    className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5"
                  >
                    Abrir mi ultima lista
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <h2 className="font-display text-3xl leading-tight">
                    Todo empieza con una lista nueva
                  </h2>
                  <p className="text-sm leading-6 text-[color:rgba(255,255,255,0.78)]">
                    Cuando crees tu primera lista, este panel te sirve para volver
                    rapido a ella despues.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[var(--shadow)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Como funciona
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
                <p>
                  1. Se crea una lista persistente con un enlace secreto.
                </p>
                <p>
                  2. Cualquier persona con ese enlace entra a la misma lista.
                </p>
                <p>
                  3. Cada participante puede agregar y cambiar estados sin login.
                </p>
                <p>
                  4. Los productos se guardan como texto libre para no frenar el
                  flujo.
                </p>
              </div>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
