import { fetchAiComplianceNews } from "@/lib/ai-news";

export const revalidate = 1800;

export async function GET() {
  try {
    const items = await fetchAiComplianceNews();
    return Response.json({
      items,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load news.";
    return Response.json({ items: [], error: message }, { status: 502 });
  }
}
