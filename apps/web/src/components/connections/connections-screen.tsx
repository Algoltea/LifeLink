"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type {
  Capability,
  CapabilityStatus,
} from "@lifelink/contracts/integrations";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { Pill } from "@lifelink/ui/components/pill";
import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { CheckIcon, ChevronDownIcon, MinusIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type ConnectionsData = FunctionReturnType<typeof api.connections.list>;

type ProviderRow = ConnectionsData["providers"][number];

const CAPABILITY_WORDS: Record<
  CapabilityStatus,
  { icon: typeof CheckIcon; text: string }
> = {
  available: { icon: CheckIcon, text: "Works in LifeLink" },
  not_offered: { icon: XIcon, text: "Not possible with this service" },
  not_wired: {
    icon: MinusIcon,
    text: "The service allows it, but LifeLink doesn't use it yet",
  },
};

const NOT_SET_UP =
  "This service isn't set up for this app yet. Whoever runs LifeLink needs to finish the app setup.";

const StatusPill = ({
  demoMode,
  row,
}: {
  demoMode: boolean;
  row: ProviderRow;
}) => {
  if (row.status === "active") {
    return (
      <Pill>{row.mode === "simulated" ? "Practice account" : "Connected"}</Pill>
    );
  }

  if (row.status === "pending") {
    return <Pill tone="warning">Waiting to finish</Pill>;
  }

  if (row.status === "error") {
    return <Pill tone="negative">Didn’t finish</Pill>;
  }

  if (
    !row.definition.capabilities.some(
      (capability) => capability.status === "available"
    )
  ) {
    return <Pill>No actions available yet</Pill>;
  }

  if (demoMode && row.hasSavedRealConnection) {
    return <Pill>Real connection saved</Pill>;
  }

  if (demoMode) {
    return (
      <Pill>
        {row.definition.connectStyle === "oauth"
          ? "Practice available"
          : "Practice messages"}
      </Pill>
    );
  }

  if (!row.developerReady) {
    return <Pill tone="warning">App setup needed</Pill>;
  }

  return (
    <Pill>
      {row.definition.connectStyle === "oauth"
        ? "Ready to connect"
        : "Available"}
    </Pill>
  );
};

const CapabilityList = ({
  capabilities,
  developerReady,
}: {
  capabilities: readonly Capability[];
  developerReady: boolean;
}) => (
  <ul className="flex max-w-prose flex-col gap-4">
    {capabilities.map((capability) => {
      const words = CAPABILITY_WORDS[capability.status];
      const Icon = words.icon;

      const availability =
        capability.status === "available" && !developerReady
          ? "Available after app setup"
          : words.text;

      return (
        <li className="flex gap-3" key={capability.id}>
          <Icon
            aria-hidden="true"
            className={
              capability.status === "available"
                ? "text-accent-foreground mt-1 size-5 shrink-0"
                : "text-muted-foreground mt-1 size-5 shrink-0"
            }
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span
              className={
                capability.status === "available"
                  ? "text-body"
                  : "text-muted-foreground text-body"
              }
            >
              {capability.label}
            </span>
            <span className="text-muted-foreground text-label">
              {availability}
              {capability.note ? `. ${capability.note}` : "."}
            </span>
          </div>
        </li>
      );
    })}
  </ul>
);

const oauthOptionsFor = (demoMode: boolean, row: ProviderRow) => {
  const hasAvailableActions = row.definition.capabilities.some(
    (capability) => capability.status === "available"
  );

  const practiceBlocked =
    demoMode &&
    (row.hasSavedRealConnection ||
      (row.connectionId !== null && row.mode !== "simulated"));

  const canConnect =
    hasAvailableActions &&
    !practiceBlocked &&
    row.status !== "active" &&
    (demoMode || row.developerReady);

  const canDisconnect =
    row.connectionId !== null &&
    !practiceBlocked &&
    (!demoMode || hasAvailableActions);

  let connectLabel = `Connect ${row.definition.label}`;

  if (demoMode) {
    connectLabel = "Use a practice account";
  } else if (row.status === "error" || row.status === "pending") {
    connectLabel = "Try connecting again";
  }

  return {
    canConnect,
    canDisconnect,
    connectLabel,
    needsSetup: hasAvailableActions && !row.developerReady && !demoMode,
    practiceBlocked,
  };
};

const OAuthActions = ({
  demoMode,
  row,
}: {
  demoMode: boolean;
  row: ProviderRow;
}) => {
  const start = useAction(api.connections.start);
  const disconnect = useAction(api.connections.disconnect);
  const connectPractice = useMutation(api.connections.connectPractice);
  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const { definition } = row;

  const {
    canConnect,
    canDisconnect,
    connectLabel,
    needsSetup,
    practiceBlocked,
  } = oauthOptionsFor(demoMode, row);

  const visibleError =
    operationError ?? (row.status === "error" ? row.lastError : null);

  const errorId = `connection-${definition.id}-error`;

  const run = async (work: () => Promise<void>): Promise<void> => {
    setBusy(true);
    setOperationError(null);

    try {
      await work();
    } catch (error) {
      setOperationError(errorText(error));
    }

    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {canConnect || canDisconnect ? (
        <div className="flex flex-wrap gap-3">
          {canConnect ? (
            <Button
              aria-busy={busy}
              aria-describedby={visibleError ? errorId : undefined}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  if (demoMode) {
                    await connectPractice({ provider: definition.id });
                    toast.success(
                      `A practice ${definition.label} account is connected. It never reaches the real service.`
                    );

                    return;
                  }

                  const { redirectUrl } = await start({
                    provider: definition.id,
                  });

                  globalThis.location.assign(redirectUrl);
                })
              }
            >
              {connectLabel}
            </Button>
          ) : null}
          {canDisconnect ? (
            <Button
              aria-busy={busy}
              aria-describedby={visibleError ? errorId : undefined}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  if (row.connectionId === null) {
                    return;
                  }

                  await disconnect({ connectionId: row.connectionId });
                  toast.success(
                    row.mode === "simulated"
                      ? `The practice ${definition.label} account is disconnected.`
                      : `${definition.label} is disconnected. Nothing will use it from now on.`
                  );
                })
              }
              variant="destructive"
            >
              {row.mode === "simulated"
                ? "Disconnect practice account"
                : `Disconnect ${definition.label}`}
            </Button>
          ) : null}
        </div>
      ) : null}
      {visibleError ? (
        <p
          className="text-negative text-body max-w-prose break-words"
          id={errorId}
          role="alert"
        >
          {visibleError}
        </p>
      ) : null}
      {practiceBlocked ? (
        <p className="bg-parchment text-body max-w-prose rounded-lg p-5">
          Your real {definition.label} connection is saved. Practice accounts
          cannot replace it. Turn off Practice mode in Settings to manage it.
        </p>
      ) : null}
      {needsSetup ? (
        <p className="text-muted-foreground text-label max-w-prose">
          {NOT_SET_UP}
        </p>
      ) : null}
      {canConnect ? (
        <p className="text-muted-foreground text-label">
          {demoMode
            ? "This practice account never connects to the real service."
            : `You’ll sign in on ${definition.label}’s own page. LifeLink never sees your password.`}
        </p>
      ) : null}
    </div>
  );
};

const HandleNote = ({
  demoMode,
  row,
}: {
  demoMode: boolean;
  row: ProviderRow;
}) => {
  if (row.definition.id === "imessage") {
    return (
      <div className="bg-parchment flex max-w-prose flex-col gap-4 rounded-lg p-5">
        {demoMode || row.developerReady ? (
          <Link
            className={buttonVariants({ className: "self-start" })}
            href="/circle"
          >
            Open Trusted circle
          </Link>
        ) : null}
        {demoMode ? (
          <p className="text-body">
            Practice iMessages are simulated. No messages reach your contacts.
            When you use real iMessage, follow these steps.
          </p>
        ) : null}
        {!row.developerReady && !demoMode ? (
          <p className="text-muted-foreground text-label">{NOT_SET_UP}</p>
        ) : null}
        <p className="text-body">
          Link each person in Trusted circle to their existing Photon contact.
          LifeLink does not register new contacts.
        </p>
        <ol className="text-body flex list-decimal flex-col gap-3 pl-6">
          <li>
            Save the exact phone number or Apple ID email address they send
            iMessages from. A phone number and an email address are separate
            identities, even for the same person.
          </li>
          <li>
            Make sure this exact address is already registered in the Photon
            dashboard. If it is missing, add the contact there first. Then
            choose Link iMessage in Trusted circle and use the assigned number
            shown for that contact.
          </li>
          <li>
            Ask them to send the first iMessage to their assigned number from
            that exact saved address. LifeLink can message them after their
            first message arrives.
          </li>
        </ol>
      </div>
    );
  }

  if (demoMode) {
    return (
      <p className="text-body">
        Practice Discord messages are simulated. No messages reach your
        contacts.
      </p>
    );
  }

  if (!row.developerReady) {
    return <p className="text-muted-foreground text-label">{NOT_SET_UP}</p>;
  }

  return (
    <p className="text-body">
      Ready. Add each person’s Discord user ID in Trusted circle.
    </p>
  );
};

const ProviderRowDetails = ({
  data,
  row,
}: {
  data: ConnectionsData;
  row: ProviderRow;
}) => {
  const { definition } = row;

  const available = definition.capabilities.filter(
    (capability) => capability.status === "available"
  );

  const hasAccount = row.connectionId !== null || row.hasSavedRealConnection;

  const summary =
    available.length > 0
      ? available
          .slice(0, 2)
          .map((capability) => capability.label)
          .join(". ")
      : "No actions available in LifeLink yet.";

  return (
    <li className="border-rule border-t">
      <details className="group/provider">
        <summary className="hover:bg-parchment flex min-h-20 cursor-pointer list-none flex-wrap items-center justify-between gap-4 rounded-lg px-4 py-5 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
            <span className="text-body font-semibold">{definition.label}</span>
            <span className="text-muted-foreground text-body max-w-prose">
              {summary}
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-3">
            <StatusPill demoMode={data.demoMode} row={row} />
            <ChevronDownIcon
              aria-hidden="true"
              className="text-muted-foreground size-5 shrink-0 transition-transform group-open/provider:rotate-180 motion-reduce:transition-none"
            />
          </span>
          <span className="sr-only">Capabilities and setup</span>
        </summary>
        <div className="flex flex-col gap-5 px-4 pb-6">
          {definition.connectStyle === "oauth" &&
          (available.length > 0 || hasAccount) ? (
            <OAuthActions demoMode={data.demoMode} row={row} />
          ) : null}
          {definition.connectStyle === "handle" ? (
            <HandleNote demoMode={data.demoMode} row={row} />
          ) : null}
          <p className="text-muted-foreground text-body max-w-prose">
            {definition.id === "imessage"
              ? "Your contacts don't need an invitation, a LifeLink account, or access to the Photon dashboard."
              : definition.accountRequirement}
          </p>
          {row.accountLabel && row.status === "active" ? (
            <p className="text-body break-words">Account: {row.accountLabel}</p>
          ) : null}
          <CapabilityList
            capabilities={definition.capabilities}
            developerReady={row.developerReady}
          />
          {definition.connectStyle === "developer_only" &&
          available.length > 0 ? (
            <p className="text-muted-foreground text-body max-w-prose">
              {row.developerReady
                ? "This works through the app's own account, so there's nothing for you to sign in to."
                : NOT_SET_UP}
            </p>
          ) : null}
        </div>
      </details>
    </li>
  );
};

const GROUPS = [
  { ids: ["imessage", "discord"], title: "Message family and friends" },
  { ids: ["gmail", "outlook"], title: "Read and write email" },
  { ids: ["google_calendar", "google_drive"], title: "Manage appointments" },
] as const;

const ADDITIONAL_IDS = new Set(["paypal", "facebook", "instagram", "ebay"]);

const ConnectionsScreen = () => {
  const data = useQuery(api.connections.list);

  return (
    <>
      <PageHeader
        subline="Choose what you want help with. Open a service to see what it can do and how to set it up."
        title="Connections"
      />
      {data === undefined ? (
        <LoadingRows label="Loading connections" rows={5} />
      ) : null}
      {data !== undefined && data.providers.length === 0 ? (
        <EmptyNote>No services are listed.</EmptyNote>
      ) : null}
      {data === undefined
        ? null
        : GROUPS.map((group) => {
            const rows = data.providers.filter((row) =>
              group.ids.some((id) => id === row.definition.id)
            );

            return rows.length === 0 ? null : (
              <section
                aria-labelledby={`group-${group.ids[0]}`}
                className="flex flex-col gap-2"
                key={group.title}
              >
                <h2
                  className="text-section font-semibold"
                  id={`group-${group.ids[0]}`}
                >
                  {group.title}
                </h2>
                <ul>
                  {rows.map((row) => (
                    <ProviderRowDetails
                      data={data}
                      key={row.definition.id}
                      row={row}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
      {data?.providers.some((row) => ADDITIONAL_IDS.has(row.definition.id)) ? (
        <details className="group/limitations border-rule rounded-xl border p-5">
          <summary className="hover:bg-parchment text-body flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-semibold [&::-webkit-details-marker]:hidden">
            <span>Other services and limitations</span>
            <ChevronDownIcon
              aria-hidden="true"
              className="text-muted-foreground size-5 shrink-0 transition-transform group-open/limitations:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <p className="text-muted-foreground text-body max-w-prose py-4">
            These services have no actions available in LifeLink yet. Open a
            service to read its limitations.
          </p>
          <ul>
            {data.providers
              .filter((row) => ADDITIONAL_IDS.has(row.definition.id))
              .map((row) => (
                <ProviderRowDetails
                  data={data}
                  key={row.definition.id}
                  row={row}
                />
              ))}
          </ul>
        </details>
      ) : null}
    </>
  );
};

export { ConnectionsScreen };
