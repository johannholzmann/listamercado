import { cookies } from "next/headers";

import { getOwnedListsPageByParticipantId } from "@/lib/store";
import { LIST_PAGE_SIZE } from "@/lib/list-types";

function normalizeLimit(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return LIST_PAGE_SIZE;
  }

  return Math.min(Math.trunc(parsed), 24);
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const participantId = cookieStore.get("quecompramos_session")?.value ?? null;
  const searchParams = new URL(request.url).searchParams;
  const cursor = searchParams.get("cursor");
  const limit = normalizeLimit(searchParams.get("limit"));

  const page = await getOwnedListsPageByParticipantId(participantId, {
    cursor,
    limit,
  });

  return Response.json(page);
}
