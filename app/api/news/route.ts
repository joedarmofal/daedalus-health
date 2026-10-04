import { fetchHealthcareAiNews } from "@/lib/healthcare-news";

export const revalidate = 3600;

export async function GET() {
  try {
    const items = await fetchHealthcareAiNews();
    return Response.json(
      { items },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return Response.json(
      { items: [] },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    );
  }
}
