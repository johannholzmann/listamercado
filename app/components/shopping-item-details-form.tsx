'use client';

import { useState } from "react";

import {
  QUANTITY_UNIT_LABELS,
  QUANTITY_UNITS,
  type QuantityUnit,
} from "@/lib/item-metadata";

type ShoppingItemDetailsFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  item: {
    id: string;
    name: string;
    brand: string | null;
    quantityAmount: string | null;
    quantityUnit: QuantityUnit | null;
    notes: string | null;
  };
};

export function ShoppingItemDetailsForm({
  action,
  item,
}: ShoppingItemDetailsFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [brand, setBrand] = useState(item.brand ?? "");
  const [quantityAmount, setQuantityAmount] = useState(
    item.quantityAmount ?? "",
  );
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>(
    item.quantityUnit ?? "unidad",
  );
  const [notes, setNotes] = useState(item.notes ?? "");

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="mt-4 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2"
    >
      <summary className="cursor-pointer list-none text-sm font-semibold text-[color:var(--foreground)]">
        Editar detalles
      </summary>

      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="itemId" value={item.id} />
        <label className="block space-y-2">
          <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Producto
          </span>
          <input
            type="text"
            name="name"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Marca
            </span>
            <input
              type="text"
              name="brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
              placeholder="Opcional"
            />
          </label>

          <div className="grid grid-cols-[minmax(0,1fr)_160px] gap-3">
            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Cantidad
              </span>
              <input
                type="number"
                name="quantityAmount"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={quantityAmount}
                onChange={(event) => setQuantityAmount(event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
                placeholder="1"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Unidad
              </span>
              <select
                name="quantityUnit"
                value={quantityUnit}
                onChange={(event) =>
                  setQuantityUnit(event.target.value as QuantityUnit)
                }
                className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition focus:border-[color:var(--accent)]"
              >
                {QUANTITY_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {QUANTITY_UNIT_LABELS[unit].optionLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-2 sm:col-span-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Aspectos relevantes
            </span>
            <textarea
              name="notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--accent)]"
              placeholder="Opcional"
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-2xl bg-[color:var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[color:var(--accent-strong)]"
        >
          Guardar detalles
        </button>
      </form>
    </details>
  );
}
