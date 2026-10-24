import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const showWelcome = (request: NextRequest) =>
  NextResponse.rewrite(new URL("/welcome", request.url));

/** Asks Better Auth whether the session cookie still belongs to a live session. */
const hasLiveSession = async (request: NextRequest) => {
  try {
    const response = await fetch(
      new URL("/api/auth/get-session", request.url),
      {
        cache: "no-store",
        headers: { cookie: request.headers.get("cookie") ?? "" },
      }
    );

    if (!response.ok) {
      // Unknown: let Today's own check decide, as it did before.
      return true;
    }

    return (await response.json()) !== null;
  } catch {
    return true;
  }
};

/**
 * "/" is Today for signed-in people and the public landing page for everyone
 * else, including people whose saved session has expired. Today's layout still
 * verifies the session itself; this only chooses which page "/" shows.
 */
const proxy = async (request: NextRequest) => {
  if (!getSessionCookie(request)) {
    return showWelcome(request);
  }

  if (await hasLiveSession(request)) {
    return NextResponse.next();
  }

  return showWelcome(request);
};

export const config = { matcher: "/" };

export default proxy;
