"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { findConnectionDefinition } from "@lifelink/contracts/integrations";
import { buttonVariants } from "@lifelink/ui/components/button";
import { useAction } from "convex/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/app/page-header";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";

type Outcome = { message: string; ok: boolean } | null;

const FAILED_STATUSES = new Set(["failed", "error", "cancelled"]);

/** Finishes a connection after the provider's sign-in page sends the person back. */
const ConnectionCallback = ({
  connectedAccountId,
  provider,
  status,
}: {
  connectedAccountId: string | null;
  provider: string | null;
  status: string | null;
}) => {
  const complete = useAction(api.connections.complete);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const started = useRef(false);

  const label =
    (provider === null
      ? undefined
      : findConnectionDefinition(provider)?.label) ?? "The service";

  const declined = status !== null && FAILED_STATUSES.has(status.toLowerCase());

  useEffect(() => {
    if (
      started.current ||
      declined ||
      provider === null ||
      connectedAccountId === null
    ) {
      return;
    }

    started.current = true;

    const finish = async (): Promise<void> => {
      try {
        setOutcome(await complete({ connectedAccountId, provider }));
      } catch (error) {
        setOutcome({
          message: messageOf(error instanceof Error ? error : null),
          ok: false,
        });
      }
    };

    void finish();
  }, [complete, connectedAccountId, declined, provider]);

  const missing = provider === null || connectedAccountId === null;

  let body = (
    <LoadingRows label={`Checking the ${label} connection`} rows={1} />
  );

  if (declined) {
    body = (
      <ErrorNote>
        {label} didn’t finish connecting. Nothing was changed. You can try
        again.
      </ErrorNote>
    );
  } else if (missing) {
    body = (
      <ErrorNote>
        This page was opened without a connection to finish. Please start again
        from Connections.
      </ErrorNote>
    );
  } else if (outcome !== null) {
    body = outcome.ok ? (
      <p className="bg-surface rounded-xl px-5 py-4 text-lg leading-7">
        {outcome.message}
      </p>
    ) : (
      <ErrorNote>{outcome.message}</ErrorNote>
    );
  }

  return (
    <>
      <PageHeader
        title={outcome?.ok ? `${label} connected` : "Connection status"}
        subline="Return to Connections to review your services or start again."
      />
      <div aria-live="polite" className="max-w-prose">
        {body}
      </div>
      <Link
        className={buttonVariants({ className: "self-start", size: "lg" })}
        href="/connections"
      >
        Back to Connections
      </Link>
    </>
  );
};

export { ConnectionCallback };
