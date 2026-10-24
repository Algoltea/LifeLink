import { api } from "@lifelink/backend/convex/_generated/api";

import { fetchAuthQuery } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

/** Only the role needed by public Solitaire's navigation; never cache account data. */
export const GET = async (): Promise<Response> => {
  try {
    const me = await fetchAuthQuery(api.profiles.me, {});

    return Response.json(
      { role: me?.profile?.role ?? null },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return Response.json(
      { role: null },
      { headers: { "Cache-Control": "private, no-store" }, status: 503 }
    );
  }
};
