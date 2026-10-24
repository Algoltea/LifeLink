import type { Metadata } from "next";

import { ConnectionCallback } from "@/components/connections/connection-callback";

export const metadata: Metadata = { title: "Finishing the connection" };

const first = (value: string | string[] | undefined): string | null =>
  Array.isArray(value) ? (value[0] ?? null) : (value ?? null);

/** Composio returns here with the account it created; the backend re-checks it before trusting anything. */
const CallbackPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) => {
  const params = await searchParams;

  return (
    <ConnectionCallback
      connectedAccountId={
        first(params.connected_account_id) ?? first(params.connectedAccountId)
      }
      provider={first(params.provider)}
      status={first(params.status)}
    />
  );
};

export default CallbackPage;
