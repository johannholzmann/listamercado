import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const ITEM_STATUSES = ["pendiente", "agregado", "resuelto"] as const;

export type ItemStatus = (typeof ITEM_STATUSES)[number];

export interface ShoppingList {
  id: string;
  shareCode: string;
  title: string;
  createdAt: string;
  updatedAt: string;
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

export interface StoreData {
  lists: ShoppingList[];
  participants: Participant[];
  items: ShoppingItem[];
}

export interface ListDetails {
  list: ShoppingList;
  items: ShoppingItem[];
}

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(STORE_DIR, "listamercado-store.json");

function defaultStore(): StoreData {
  return {
    lists: [],
    participants: [],
    items: [],
  };
}

function now() {
  return new Date().toISOString();
}

function randomId(bytes = 9) {
  return randomBytes(bytes).toString("base64url");
}

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function readStoreFile(): StoreData {
  if (!fs.existsSync(STORE_FILE)) {
    return defaultStore();
  }

  const raw = fs.readFileSync(STORE_FILE, "utf8").trim();
  if (!raw) {
    return defaultStore();
  }

  const parsed = JSON.parse(raw) as Partial<StoreData>;
  return {
    lists: Array.isArray(parsed.lists) ? parsed.lists : [],
    participants: Array.isArray(parsed.participants) ? parsed.participants : [],
    items: Array.isArray(parsed.items) ? parsed.items : [],
  };
}

function writeStoreFile(store: StoreData) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  const tmpFile = `${STORE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(store, null, 2), "utf8");
  fs.renameSync(tmpFile, STORE_FILE);
}

export function getStore() {
  return readStoreFile();
}

export function saveStore(store: StoreData) {
  writeStoreFile(store);
}

export function getListByShareCode(shareCode: string) {
  const store = getStore();
  const list = store.lists.find((entry) => entry.shareCode === shareCode);

  if (!list) {
    return null;
  }

  const items = store.items
    .filter((item) => item.listId === list.id)
    .sort((left, right) => {
      const statusOrder: Record<ItemStatus, number> = {
        pendiente: 0,
        agregado: 1,
        resuelto: 2,
      };

      const orderDiff =
        statusOrder[left.status] - statusOrder[right.status];

      if (orderDiff !== 0) {
        return orderDiff;
      }

      return right.updatedAt.localeCompare(left.updatedAt);
    });

  return { list, items } satisfies ListDetails;
}

export function getParticipantById(participantId: string) {
  const store = getStore();
  return store.participants.find((entry) => entry.id === participantId) ?? null;
}

export function getLatestListByShareCode(shareCode: string | null) {
  if (!shareCode) {
    return null;
  }

  return getListByShareCode(shareCode);
}

export function createParticipant(store: StoreData) {
  const createdAt = now();
  const participant: Participant = {
    id: randomId(),
    label: `Invitado ${randomBytes(2).toString("hex").toUpperCase()}`,
    createdAt,
    lastSeenAt: createdAt,
  };

  store.participants.push(participant);
  return participant;
}

export function touchParticipant(store: StoreData, participantId: string) {
  const participant = store.participants.find((entry) => entry.id === participantId);

  if (!participant) {
    return null;
  }

  participant.lastSeenAt = now();
  return participant;
}

export function ensureParticipant(store: StoreData, participantId: string | null) {
  if (participantId) {
    const existing = touchParticipant(store, participantId);
    if (existing) {
      return existing;
    }
  }

  return createParticipant(store);
}

export function createList(title: string) {
  const store = getStore();
  const createdAt = now();
  const list: ShoppingList = {
    id: randomId(),
    shareCode: randomId(12),
    title: title.trim() || "Lista del mercado",
    createdAt,
    updatedAt: createdAt,
  };

  store.lists.push(list);
  saveStore(store);
  return list;
}

export function renameList(shareCode: string, title: string) {
  const store = getStore();
  const list = store.lists.find((entry) => entry.shareCode === shareCode);

  if (!list) {
    return null;
  }

  const cleanedTitle = title.trim();
  if (cleanedTitle) {
    list.title = cleanedTitle;
    list.updatedAt = now();
    saveStore(store);
  }

  return list;
}

export function addItemToList(
  shareCode: string,
  name: string,
  participantId: string | null,
) {
  const store = getStore();
  const list = store.lists.find((entry) => entry.shareCode === shareCode);

  if (!list) {
    return null;
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return null;
  }

  const timestamp = now();
  const item: ShoppingItem = {
    id: randomId(),
    listId: list.id,
    name: trimmedName,
    normalizedName: normalizeName(trimmedName),
    status: "pendiente",
    createdAt: timestamp,
    updatedAt: timestamp,
    updatedByParticipantId: participantId,
  };

  store.items.push(item);
  list.updatedAt = timestamp;
  saveStore(store);
  return item;
}

export function updateItemStatus(
  shareCode: string,
  itemId: string,
  status: ItemStatus,
  participantId: string | null,
) {
  const store = getStore();
  const list = store.lists.find((entry) => entry.shareCode === shareCode);

  if (!list) {
    return null;
  }

  const item = store.items.find(
    (entry) => entry.id === itemId && entry.listId === list.id,
  );

  if (!item) {
    return null;
  }

  item.status = status;
  item.updatedAt = now();
  item.updatedByParticipantId = participantId;
  list.updatedAt = item.updatedAt;
  saveStore(store);
  return item;
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

