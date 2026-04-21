import "server-only";

import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";

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
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
  updatedByParticipantId: string | null;
}

export interface ListDetails {
  list: ShoppingList;
  items: ShoppingItem[];
}

export interface OwnedListSummary {
  id: string;
  shareCode: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

function randomId(bytes = 9) {
  return randomBytes(bytes).toString("base64url");
}

function normalizeName(value: string) {
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

export async function getOwnedListsByParticipantId(
  participantId: string | null,
): Promise<OwnedListSummary[]> {
  if (!participantId) {
    return [];
  }

  const lists = await prisma.shoppingList.findMany({
    where: { ownerParticipantId: participantId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return lists.map((record) => ({
    id: record.id,
    shareCode: record.shareCode,
    title: record.title,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    itemCount: record._count.items,
  }));
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
  name: string,
  participantId: string | null,
) {
  const list = await prisma.shoppingList.findUnique({
    where: { shareCode },
    select: { id: true },
  });

  if (!list) {
    return null;
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return null;
  }

  const timestamp = new Date();
  const [item] = await prisma.$transaction([
    prisma.shoppingItem.create({
      data: {
        id: randomId(),
        listId: list.id,
        name: trimmedName,
        normalizedName: normalizeName(trimmedName),
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

  return mapItem(item);
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
