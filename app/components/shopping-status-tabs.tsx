'use client';

import { useState } from "react";

import { formatQuantity, type QuantityUnit } from "@/lib/item-metadata";
import { ShoppingItemDetailsForm } from "@/app/components/shopping-item-details-form";

type ItemStatus = "pendiente" | "agregado" | "resuelto";

type ShoppingItemView = {
  id: string;
  name: string;
  brand: string | null;
  quantityAmount: string | null;
  quantityUnit: QuantityUnit | null;
  notes: string | null;
  status: ItemStatus;
  createdAt: string;
};

type StatusTab = {
  status: ItemStatus;
  title: string;
  badgeClass: string;
  items: ShoppingItemView[];
};

type ShoppingStatusTabsProps = {
  editItemAction: (formData: FormData) => void | Promise<void>;
  statusAction: (formData: FormData) => void | Promise<void>;
  tabs: StatusTab[];
};

function prettyDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ShoppingStatusTabs({
  editItemAction,
  statusAction,
  tabs,
}: ShoppingStatusTabsProps) {
  const [activeStatus, setActiveStatus] = useState<ItemStatus>(
    tabs[0]?.status ?? "pendiente",
  );
  const activeTab = tabs.find((tab) => tab.status === activeStatus) ?? tabs[0];

  if (!activeTab) {
    return null;
  }

  return (
    <section className="rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="mt-1 font-display text-2xl text-[color:var(--foreground)]">
              Productos
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-2">
            {tabs.map((tab) => {
              const isActive = tab.status === activeStatus;

              return (
                <button
                  key={tab.status}
                  type="button"
                  onClick={() => setActiveStatus(tab.status)}
                  aria-pressed={isActive}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[color:var(--foreground)] text-[color:var(--background)] shadow-[0_10px_24px_rgba(20,16,12,0.12)]"
                      : "text-[color:var(--foreground)] hover:bg-[color:var(--surface)]"
                  }`}
                >
                  {tab.title}
                  <span
                    className={`ml-2 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${tab.badgeClass}`}
                  >
                    {tab.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 rounded-[1.4rem] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">
              {activeTab.title}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${activeTab.badgeClass}`}
          >
            {activeTab.items.length}
          </span>
        </div>

        <div className="space-y-3">
          {activeTab.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-10 text-center text-sm text-[color:var(--muted)]">
              Nada por ahora.
            </div>
          ) : (
            activeTab.items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4"
                >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-base font-semibold text-[color:var(--foreground)]">
                      {item.name}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
                      {item.brand ? (
                        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1">
                          Marca: {item.brand}
                        </span>
                      ) : null}
                      {formatQuantity(item.quantityAmount, item.quantityUnit) ? (
                        <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-2.5 py-1">
                          Cantidad:{" "}
                          {formatQuantity(item.quantityAmount, item.quantityUnit)}
                        </span>
                      ) : null}
                    </div>
                    {item.notes ? (
                      <p className="text-sm leading-6 text-[color:var(--muted)]">
                        {item.notes}
                      </p>
                    ) : null}
                    <p className="text-xs text-[color:var(--muted)]">
                      Guardado {prettyDate(item.createdAt)}
                    </p>
                  </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${activeTab.badgeClass}`}
                      >
                        {activeTab.title}
                      </span>
                    </div>

                <form action={statusAction} className="mt-4">
                  <input type="hidden" name="itemId" value={item.id} />
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="submit"
                      name="status"
                      value="pendiente"
                      className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] leading-tight text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
                    >
                      Por comprar
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="agregado"
                      className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] leading-tight text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
                    >
                      Comprado
                    </button>
                    <button
                      type="submit"
                      name="status"
                      value="resuelto"
                      className="rounded-xl border border-[color:var(--border)] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] leading-tight text-[color:var(--foreground)] transition hover:border-[color:var(--accent)]"
                    >
                      No hace falta
                    </button>
                  </div>
                </form>

                <ShoppingItemDetailsForm
                  action={editItemAction}
                  item={{
                    id: item.id,
                    name: item.name,
                    brand: item.brand,
                    quantityAmount: item.quantityAmount,
                    quantityUnit: item.quantityUnit,
                    notes: item.notes,
                  }}
                />
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
