import { getProductSuggestions } from "@/lib/store";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareCode: string }> },
) {
  const { shareCode } = await params;
  const cookieStore = await cookies();
  const participantId = cookieStore.get("quecompramos_session")?.value ?? null;
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const suggestions = await getProductSuggestions(
    shareCode,
    participantId,
    query,
  );

  return Response.json({ suggestions });
}
