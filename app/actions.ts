'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  addItemToList,
  createList,
  ensureParticipant,
  getStore,
  renameList,
  saveStore,
  updateItemStatus,
  type ItemStatus,
} from "@/lib/store";

const SESSION_COOKIE = "listamercado_session";
const LAST_LIST_COOKIE = "listamercado_last_list";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function touchSession(shareCode?: string) {
  const cookieStore = await cookies();
  const store = getStore();
  const existingParticipantId = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  const participant = ensureParticipant(store, existingParticipantId);
  saveStore(store);

  cookieStore.set(SESSION_COOKIE, participant.id, COOKIE_OPTIONS);

  if (shareCode) {
    cookieStore.set(LAST_LIST_COOKIE, shareCode, COOKIE_OPTIONS);
  }

  return {
    participantId: participant.id,
    label: participant.label,
  };
}

export async function createShoppingList(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  const list = createList(title);
  const participant = await touchSession(list.shareCode);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, participant.participantId, COOKIE_OPTIONS);
  cookieStore.set(LAST_LIST_COOKIE, list.shareCode, COOKIE_OPTIONS);

  redirect(`/l/${list.shareCode}`);
}

export async function renameShoppingList(
  shareCode: string,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "");
  const renamed = renameList(shareCode, title);

  if (renamed) {
    revalidatePath(`/l/${shareCode}`);
  }
}

export async function addShoppingItem(shareCode: string, formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const participant = await touchSession(shareCode);
  const item = addItemToList(shareCode, name, participant.participantId);

  if (item) {
    revalidatePath(`/l/${shareCode}`);
  }
}

export async function updateShoppingItemStatus(
  shareCode: string,
  formData: FormData,
) {
  const itemId = String(formData.get("itemId") ?? "");
  const status = String(formData.get("status") ?? "") as ItemStatus;

  if (
    !itemId ||
    (status !== "pendiente" && status !== "agregado" && status !== "resuelto")
  ) {
    return;
  }

  const participant = await touchSession(shareCode);
  const updated = updateItemStatus(
    shareCode,
    itemId,
    status,
    participant.participantId,
  );

  if (updated) {
    revalidatePath(`/l/${shareCode}`);
  }
}
