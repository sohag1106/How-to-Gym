import { eq } from "drizzle-orm";
import { db } from "@/db";
import { equipment, equipmentTemplates } from "@/db/schema";

/**
 * Serves equipment/template photos from their own tiny URL instead of
 * embedding the ~50-100KB base64 blob inline in every page that lists
 * equipment. Inlining them was blowing up page payload size and — on the
 * Cloudflare Workers runtime — occasionally truncated mid-response,
 * corrupting the HTML around the cut-off attribute.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  const { kind, id } = await params;

  let imageData: string | undefined;
  if (kind === "equipment") {
    const [row] = await db
      .select({ imageData: equipment.imageData })
      .from(equipment)
      .where(eq(equipment.id, id));
    imageData = row?.imageData;
  } else if (kind === "template") {
    const [row] = await db
      .select({ imageData: equipmentTemplates.imageData })
      .from(equipmentTemplates)
      .where(eq(equipmentTemplates.id, id));
    imageData = row?.imageData;
  }

  if (!imageData) return new Response("Not found", { status: 404 });

  const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return new Response("Not found", { status: 404 });
  const [, mime, base64] = match;

  return new Response(Buffer.from(base64, "base64"), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
