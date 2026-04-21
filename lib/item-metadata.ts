export const QUANTITY_UNITS = [
  "unidad",
  "paquete",
  "gramo",
  "kilogramo",
  "mililitro",
  "litro",
] as const;

export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

export const QUANTITY_UNIT_LABELS: Record<
  QuantityUnit,
  { optionLabel: string; singular: string; plural: string }
> = {
  unidad: {
    optionLabel: "Unidad",
    singular: "unidad",
    plural: "unidades",
  },
  paquete: {
    optionLabel: "Paquete",
    singular: "paquete",
    plural: "paquetes",
  },
  gramo: {
    optionLabel: "Gramo",
    singular: "gramo",
    plural: "gramos",
  },
  kilogramo: {
    optionLabel: "Kilogramo",
    singular: "kilo",
    plural: "kilos",
  },
  mililitro: {
    optionLabel: "Mililitro",
    singular: "mililitro",
    plural: "mililitros",
  },
  litro: {
    optionLabel: "Litro",
    singular: "litro",
    plural: "litros",
  },
};

export function isQuantityUnit(value: string): value is QuantityUnit {
  return (QUANTITY_UNITS as readonly string[]).includes(value);
}

export function formatQuantity(
  quantityAmount: string | null,
  quantityUnit: QuantityUnit | null,
) {
  const cleanedAmount = quantityAmount?.trim();

  if (!cleanedAmount) {
    return null;
  }

  const unit = quantityUnit ?? "unidad";
  const labels = QUANTITY_UNIT_LABELS[unit];
  const normalizedAmount = Number(cleanedAmount.replace(",", "."));
  const usePlural = Number.isFinite(normalizedAmount)
    ? normalizedAmount !== 1
    : cleanedAmount !== "1";

  return `${cleanedAmount} ${usePlural ? labels.plural : labels.singular}`;
}

export function normalizeQuantityInput(
  quantityAmount: string,
  quantityUnit: string,
) {
  const cleanedAmount = quantityAmount.trim();

  if (!cleanedAmount) {
    return {
      quantityAmount: null,
      quantityUnit: null,
    };
  }

  return {
    quantityAmount: cleanedAmount,
    quantityUnit: isQuantityUnit(quantityUnit) ? quantityUnit : "unidad",
  };
}
