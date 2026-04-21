'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  addItemToList,
  createList,
  ensureParticipant,
  updateParticipantLabel,
  renameList,
  updateItemDetails,
  updateItemStatus,
  type ItemStatus,
} from "@/lib/store";

const SESSION_COOKIE = "quecompramos_session";
const LAST_LIST_COOKIE = "quecompramos_last_list";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function touchSession(shareCode?: string) {
  const cookieStore = await cookies();
  const existingParticipantId = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  const participant = await ensureParticipant(existingParticipantId);

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
  const participant = await touchSession();
  const createdList = await createList(title, participant.participantId);
  await touchSession(createdList.shareCode);

  redirect(`/l/${createdList.shareCode}`);
}

export async function updateParticipantName(formData: FormData) {
  const label = String(formData.get("label") ?? "");
  const shareCode = String(formData.get("shareCode") ?? "").trim() || null;
  const participant = await touchSession(shareCode ?? undefined);
  const updated = await updateParticipantLabel(participant.participantId, label);

  if (updated) {
    revalidatePath("/");

    if (shareCode) {
      revalidatePath(`/l/${shareCode}`);
    }
  }
}

export async function renameShoppingList(
  shareCode: string,
  formData: FormData,
) {
  const title = String(formData.get("title") ?? "");
  const renamed = await renameList(shareCode, title);

  if (renamed) {
    revalidatePath(`/l/${shareCode}`);
  }
}

export async function addShoppingItem(shareCode: string, formData: FormData) {
  const itemData = {
    name: String(formData.get("name") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    quantityAmount: String(formData.get("quantityAmount") ?? ""),
    quantityUnit: String(formData.get("quantityUnit") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
  const participant = await touchSession(shareCode);
  const item = await addItemToList(
    shareCode,
    itemData,
    participant.participantId,
  );

  if (item) {
    revalidatePath(`/l/${shareCode}`);
  }
}

export async function updateShoppingItemDetails(
  shareCode: string,
  formData: FormData,
) {
  const itemId = String(formData.get("itemId") ?? "");
  const itemData = {
    name: String(formData.get("name") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    quantityAmount: String(formData.get("quantityAmount") ?? ""),
    quantityUnit: String(formData.get("quantityUnit") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  if (!itemId) {
    return;
  }

  const participant = await touchSession(shareCode);
  const item = await updateItemDetails(
    shareCode,
    itemId,
    itemData,
    participant.participantId,
  );

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
  const updated = await updateItemStatus(
    shareCode,
    itemId,
    status,
    participant.participantId,
  );

  if (updated) {
    revalidatePath(`/l/${shareCode}`);
  }
}
