"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { findConnectionDefinition } from "@lifelink/contracts/integrations";
import { buttonVariants } from "@lifelink/ui/components/button";
import { useAction } from "convex/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";

type Outcome = { message: string; ok: boolean } | null;

const FAILED_STATUSES = new Set(["failed", "error", "cancelled"]);

const CallbackResult = ({
  available,
  declined,
  demoMode,
  label,
  missing,
  outcome,
}: {
  available: boolean;
  declined: boolean;
  demoMode: boolean | undefined;
  label: string;
  missing: boolean;
  outcome: Outcome;
}) => {
  if (declined) {
    return (
      <ErrorNote>
        {label} didn’t finish connecting. Nothing was changed. You can try
        again.
      </ErrorNote>
    );
  }

  if (missing) {
    return (
      <ErrorNote>
        This page was opened without a connection to finish. Please start again
        from Connections.
      </ErrorNote>
    );
  }

  if (demoMode) {
    return (
      <p className="bg-parchment text-body rounded-xl px-5 py-4">
        Practice mode is on. Turn it off in Settings before finishing a real
        connection.
      </p>
    );
  }

  if (!available) {
    return (
      <ErrorNote>
        This service has no connection available in LifeLink. Return to
        Connections to review its limitations.
      </ErrorNote>
    );
  }

  if (outcome !== null) {
    return outcome.ok ? (
      <p className="bg-parchment text-body rounded-xl px-5 py-4">
        {outcome.message}
      </p>
    ) : (
      <ErrorNote>{outcome.message}</ErrorNote>
    );
  }

  return <LoadingRows label={`Checking the ${label} connection`} rows={1} />;
};

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
  const { me } = usePreferences();
  const [outcome, setOutcome] = useState<Outcome>(null);
  const started = useRef(false);

  const definition =
    provider === null ? undefined : findConnectionDefinition(provider);

  const label = definition?.label ?? "The service";
  const demoMode = me?.profile?.demoMode;
  const canComplete = me?.profile?.role === "owner" && demoMode === false;

  const available =
    definition?.connectStyle === "oauth" &&
    definition.capabilities.some(
      (capability) => capability.status === "available"
    );

  const declined = status !== null && FAILED_STATUSES.has(status.toLowerCase());

  useEffect(() => {
    if (
      started.current ||
      !canComplete ||
      !available ||
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
  }, [
    available,
    canComplete,
    complete,
    connectedAccountId,
    declined,
    provider,
  ]);

  const missing = provider === null || connectedAccountId === null;

  return (
    <>
      <PageHeader
        title={outcome?.ok ? `${label} connected` : "Connection status"}
        subline="Return to Connections to review your services or start again."
      />
      <div aria-live="polite" className="max-w-prose">
        <CallbackResult
          available={available}
          declined={declined}
          demoMode={demoMode}
          label={label}
          missing={missing}
          outcome={outcome}
        />
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
