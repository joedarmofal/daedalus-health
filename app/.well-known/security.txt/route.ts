import { customerMailFromAddress } from "@/lib/mail";
import { publicAppUrl } from "@/lib/public-url";

export function GET() {
  const body = [
    `Contact: mailto:${customerMailFromAddress()}`,
    `Policy: ${publicAppUrl()}/trust`,
    "Preferred-Languages: en",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
