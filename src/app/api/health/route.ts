import { query } from "@/db/client";

export async function GET() {
  try {
    await query("SELECT 1");
    return Response.json({ status: "ok", db: "ok" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return Response.json(
      { status: "degraded", db: "error", error: message },
      { status: 503 },
    );
  }
}
