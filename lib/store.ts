import "server-only";

import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import {
  normalizeQuantityInput,
  type QuantityUnit,
} from "@/lib/item-metadata";
import {
  LIST_PAGE_SIZE,
  type ListSummary,
  type PaginatedListPage,
} from "@/lib/list-types";

export const ITEM_STATUSES = ["pendiente", "agregado", "resuelto"] as const;

export type ItemStatus = (typeof ITEM_STATUSES)[number];

export interface ShoppingList {
  id: string;
  shareCode: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  ownerParticipantId: string | null;
}

export interface Participant {
  id: string;
  label: string;
  createdAt: string;
  lastSeenAt: string;
}

export interface ShoppingItem {
  id: string;
  listId: string;
  name: string;
  normalizedName: string;
  brand: string | null;
  quantityAmount: string | null;
  quantityUnit: QuantityUnit | null;
  notes: string | null;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  updatedByParticipantId: string | null;
}

export interface ProductSuggestion {
  id: string;
  name: string;
  normalizedName: string;
  updatedAt: string;
}

export interface ListDetails {
  list: ShoppingList;
  items: ShoppingItem[];
}

function randomId(bytes = 9) {
  return randomBytes(bytes).toString("base64url");
}

export function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function mapList(record: {
  id: string;
  shareCode: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  ownerParticipantId: string | null;
}): ShoppingList {
  return {
    id: record.id,
    shareCode: record.shareCode,
    title: record.title,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    ownerParticipantId: record.ownerParticipantId,
  };
}

function mapListSummary(record: {
  id: string;
  shareCode: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    items: number;
  };
}): ListSummary {
  return {
    id: record.id,
    shareCode: record.shareCode,
    title: record.title,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    itemCount: record._count?.items ?? 0,
  };
}

function mapParticipant(record: {
  id: string;
  label: string;
  createdAt: Date;
  lastSeenAt: Date;
}): Participant {
  return {
    id: record.id,
    label: record.label,
    createdAt: record.createdAt.toISOString(),
    lastSeenAt: record.lastSeenAt.toISOString(),
  };
}

function mapItem(record: {
  id: string;
  listId: string;
  name: string;
  normalizedName: string;
  brand: string | null;
  quantityAmount: string | null;
  quantityUnit: QuantityUnit | null;
  notes: string | null;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
  updatedByParticipantId: string | null;
}): ShoppingItem {
  return {
    id: record.id,
    listId: record.listId,
    name: record.name,
    normalizedName: record.normalizedName,
    brand: record.brand,
    quantityAmount: record.quantityAmount,
    quantityUnit: record.quantityUnit,
    notes: record.notes,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    updatedByParticipantId: record.updatedByParticipantId,
  };
}

function sortItems(items: ShoppingItem[]) {
  const statusOrder: Record<ItemStatus, number> = {
    pendiente: 0,
    agregado: 1,
    resuelto: 2,
  };

  return items.sort((left, right) => {
    const orderDiff = statusOrder[left.status] - statusOrder[right.status];

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export async function getListByShareCode(
  shareCode: string,
): Promise<ListDetails | null> {
  const list = await prisma.shoppingList.findUnique({
    where: { shareCode },
    include: { items: true },
  });

  if (!list) {
    return null;
  }

  return {
    list: mapList(list),
    items: sortItems(list.items.map(mapItem)),
  };
}

export async function getListTitleByShareCode(shareCode: string) {
  const list = await prisma.shoppingList.findUnique({
    where: { shareCode },
    select: { title: true },
  });

  return list?.title ?? null;
}

function cleanOptionalText(value: string) {
  const cleaned = value.trim();
  return cleaned.length ? cleaned : null;
}

function normalizeItemPayload(input: {
  name: string;
  brand: string;
  quantityAmount: string;
  quantityUnit: string;
  notes: string;
}) {
  const cleanedName = input.name.trim();
  const cleanedBrand = cleanOptionalText(input.brand);
  const cleanedNotes = cleanOptionalText(input.notes);
  const quantity = normalizeQuantityInput(
    input.quantityAmount,
    input.quantityUnit,
  );

  return {
    name: cleanedName,
    normalizedName: normalizeName(cleanedName),
    brand: cleanedBrand,
    quantityAmount: quantity.quantityAmount,
    quantityUnit: quantity.quantityUnit,
    notes: cleanedNotes,
  };
}

export async function getParticipantById(
  participantId: string,
): Promise<Participant | null> {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  return participant ? mapParticipant(participant) : null;
}

export async function getLatestListByShareCode(
  shareCode: string | null,
): Promise<ListDetails | null> {
  if (!shareCode) {
    return null;
  }

  return getListByShareCode(shareCode);
}

function normalizePageLimit(limit?: number) {
  return Math.max(1, Math.min(limit ?? LIST_PAGE_SIZE, 24));
}

export async function getOwnedListsCountByParticipantId(
  participantId: string | null,
) {
  if (!participantId) {
    return 0;
  }

  return prisma.shoppingList.count({
    where: { ownerParticipantId: participantId },
  });
}

export async function getOwnedListsPageByParticipantId(
  participantId: string | null,
  options?: {
    cursor?: string | null;
    limit?: number;
  },
): Promise<PaginatedListPage<ListSummary>> {
  if (!participantId) {
    return {
      items: [],
      nextCursor: null,
      totalCount: 0,
    };
  }

  const limit = normalizePageLimit(options?.limit);
  const baseQuery: Parameters<typeof prisma.shoppingList.findMany>[0] = {
    where: { ownerParticipantId: participantId },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  };

  const lists = options?.cursor
    ? await prisma.shoppingList.findMany({
        ...baseQuery,
        cursor: { id: options.cursor },
        skip: 1,
      })
    : await prisma.shoppingList.findMany(baseQuery);

  const hasMore = lists.length > limit;
  const items = lists.slice(0, limit).map(mapListSummary);

  return {
    items,
    nextCursor: hasMore ? items.at(-1)?.id ?? null : null,
    totalCount: await prisma.shoppingList.count({
      where: { ownerParticipantId: participantId },
    }),
  };
}

export async function ensureParticipant(
  participantId: string | null,
): Promise<Participant> {
  if (participantId) {
    const existing = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (existing) {
      const updated = await prisma.participant.update({
        where: { id: participantId },
        data: { lastSeenAt: new Date() },
      });

      return mapParticipant(updated);
    }
  }

  const createdAt = new Date();
  const participant = await prisma.participant.create({
    data: {
      id: randomId(),
      label: `Invitado ${randomBytes(2).toString("hex").toUpperCase()}`,
      createdAt,
      lastSeenAt: createdAt,
    },
  });

  return mapParticipant(participant);
}

export async function updateParticipantLabel(
  participantId: string,
  label: string,
) {
  const cleanedLabel = label.trim();

  if (!cleanedLabel) {
    return null;
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!participant) {
    return null;
  }

  const updated = await prisma.participant.update({
    where: { id: participantId },
    data: {
      label: cleanedLabel,
      lastSeenAt: new Date(),
    },
  });

  return mapParticipant(updated);
}

export async function createList(title: string, ownerParticipantId: string) {
  const timestamp = new Date();
  const list = await prisma.shoppingList.create({
    data: {
      id: randomId(),
      shareCode: randomId(12),
      title: title.trim() || "Lista del mercado",
      createdAt: timestamp,
      updatedAt: timestamp,
      ownerParticipantId,
    },
  });

  return mapList(list);
}

export async function renameList(shareCode: string, title: string) {
  const cleanedTitle = title.trim();

  if (!cleanedTitle) {
    return null;
  }

  const existing = await prisma.shoppingList.findUnique({
    where: { shareCode },
  });

  if (!existing) {
    return null;
  }

  const list = await prisma.shoppingList.update({
    where: { shareCode },
    data: {
      title: cleanedTitle,
      updatedAt: new Date(),
    },
  });

  return mapList(list);
}

export async function addItemToList(
  shareCode: string,
  input: {
    name: string;
    brand: string;
    quantityAmount: string;
    quantityUnit: string;
    notes: string;
  },
  participantId: string | null,
) {
  const list = await prisma.shoppingList.findUnique({
    where: { shareCode },
    select: { id: true },
  });

  if (!list) {
    return null;
  }

  const itemData = normalizeItemPayload(input);

  if (!itemData.name) {
    return null;
  }

  const timestamp = new Date();
  const [createdItem] = await prisma.$transaction([
    prisma.shoppingItem.create({
      data: {
        id: randomId(),
        listId: list.id,
        name: itemData.name,
        normalizedName: itemData.normalizedName,
        brand: itemData.brand,
        quantityAmount: itemData.quantityAmount,
        quantityUnit: itemData.quantityUnit,
        notes: itemData.notes,
        status: "pendiente",
        createdAt: timestamp,
        updatedAt: timestamp,
        updatedByParticipantId: participantId,
      },
    }),
    prisma.shoppingList.update({
      where: { id: list.id },
      data: {
        updatedAt: timestamp,
      },
    }),
  ]);

  return mapItem(createdItem);
}

export async function updateItemDetails(
  shareCode: string,
  itemId: string,
  input: {
    name: string;
    brand: string;
    quantityAmount: string;
    quantityUnit: string;
    notes: string;
  },
  participantId: string | null,
) {
  const list = await prisma.shoppingList.findUnique({
    where: { shareCode },
    select: { id: true },
  });

  if (!list) {
    return null;
  }

  const existing = await prisma.shoppingItem.findFirst({
    where: {
      id: itemId,
      listId: list.id,
    },
  });

  if (!existing) {
    return null;
  }

  const item = normalizeItemPayload(input);

  if (!item.name) {
    return null;
  }

  const timestamp = new Date();
  const [updatedItem] = await prisma.$transaction([
    prisma.shoppingItem.update({
      where: { id: existing.id },
      data: {
        name: item.name,
        normalizedName: item.normalizedName,
        brand: item.brand,
        quantityAmount: item.quantityAmount,
        quantityUnit: item.quantityUnit,
        notes: item.notes,
        updatedByParticipantId: participantId,
      },
    }),
    prisma.shoppingList.update({
      where: { id: list.id },
      data: {
        updatedAt: timestamp,
      },
    }),
  ]);

  return mapItem(updatedItem);
}

function mapProductSuggestion(record: {
  id: string;
  name: string;
  normalizedName: string;
  updatedAt: Date;
}): ProductSuggestion {
  return {
    id: record.id,
    name: record.name,
    normalizedName: record.normalizedName,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function dedupeByNormalizedName(items: ProductSuggestion[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.normalizedName)) {
      return false;
    }

    seen.add(item.normalizedName);
    return true;
  });
}

export async function getProductSuggestions(
  currentShareCode: string,
  participantId: string | null,
  query: string,
  limit = 3,
): Promise<ProductSuggestion[]> {
  const normalizedQuery = normalizeName(query);

  if (normalizedQuery.length < 2 || limit <= 0) {
    return [];
  }

  if (!participantId) {
    return [];
  }

  const currentList = await prisma.shoppingList.findUnique({
    where: { shareCode: currentShareCode },
    select: { id: true },
  });

  if (!currentList) {
    return [];
  }

  const prefixMatches = await prisma.shoppingItem.findMany({
    where: {
      updatedByParticipantId: participantId,
      listId: { not: currentList.id },
      normalizedName: { startsWith: normalizedQuery },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: Math.max(limit * 4, 12),
    select: {
      id: true,
      name: true,
      normalizedName: true,
      updatedAt: true,
    },
  });

  const rankedPrefixMatches = dedupeByNormalizedName(
    prefixMatches.map(mapProductSuggestion),
  );

  if (rankedPrefixMatches.length >= limit) {
    return rankedPrefixMatches.slice(0, limit);
  }

  const seenNormalizedNames = rankedPrefixMatches.map(
    (item) => item.normalizedName,
  );

  const containsMatches = await prisma.shoppingItem.findMany({
    where: {
      updatedByParticipantId: participantId,
      listId: { not: currentList.id },
      normalizedName: { contains: normalizedQuery },
      ...(seenNormalizedNames.length
        ? {
            NOT: {
              normalizedName: { in: seenNormalizedNames },
            },
          }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: Math.max(limit * 4, 12),
    select: {
      id: true,
      name: true,
      normalizedName: true,
      updatedAt: true,
    },
  });

  return dedupeByNormalizedName([
    ...rankedPrefixMatches,
    ...containsMatches.map(mapProductSuggestion),
  ]).slice(0, limit);
}

export async function updateItemStatus(
  shareCode: string,
  itemId: string,
  status: ItemStatus,
  participantId: string | null,
) {
  const list = await prisma.shoppingList.findUnique({
    where: { shareCode },
    select: { id: true },
  });

  if (!list) {
    return null;
  }

  const item = await prisma.shoppingItem.findFirst({
    where: {
      id: itemId,
      listId: list.id,
    },
  });

  if (!item) {
    return null;
  }

  const timestamp = new Date();
  const [updatedItem] = await prisma.$transaction([
    prisma.shoppingItem.update({
      where: { id: item.id },
      data: {
        status,
        updatedAt: timestamp,
        updatedByParticipantId: participantId,
      },
    }),
    prisma.shoppingList.update({
      where: { id: list.id },
      data: {
        updatedAt: timestamp,
      },
    }),
  ]);

  return mapItem(updatedItem);
}

export function getStatusCounts(items: ShoppingItem[]) {
  return {
    pendiente: items.filter((item) => item.status === "pendiente").length,
    agregado: items.filter((item) => item.status === "agregado").length,
    resuelto: items.filter((item) => item.status === "resuelto").length,
  };
}

export function groupItemsByStatus(items: ShoppingItem[]) {
  return {
    pendiente: items.filter((item) => item.status === "pendiente"),
    agregado: items.filter((item) => item.status === "agregado"),
    resuelto: items.filter((item) => item.status === "resuelto"),
  };
}
