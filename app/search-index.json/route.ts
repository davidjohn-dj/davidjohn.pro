import { searchIndex } from "@/lib/searchIndex";

// Rendered to a static /search-index.json file by `next build` (output: export).
export const dynamic = "force-static";

export async function GET() {
  return Response.json(searchIndex);
}
