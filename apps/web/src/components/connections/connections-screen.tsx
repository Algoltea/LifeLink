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

const StatusPill = ({ row }: { row: ProviderRow }) => {
  if (row.status === "active") {
    return row.mode === "simulated" ? (
      <Pill tone="simulated">Practice account</Pill>
    ) : (
      <Pill tone="positive">Connected</Pill>
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
}: {
  capabilities: readonly Capability[];
}) => (
  <ul className="flex max-w-prose flex-col gap-4">
    {capabilities.map((capability) => {
      const words = CAPABILITY_WORDS[capability.status];
      const Icon = words.icon;

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
                  ? "text-lg"
                  : "text-muted-foreground text-lg"
              }
            >
              {capability.label}
            </span>
            <span className="text-muted-foreground text-base">
              {words.text}
              {capability.note ? `. ${capability.note}` : "."}
            </span>
          </div>
        </li>
      );
    })}
  </ul>
);

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
  const { definition } = row;

  const run = async (work: () => Promise<void>): Promise<void> => {
    setBusy(true);

    try {
      await work();
    } catch (error) {
      toast.error(errorText(error));
    }

    setBusy(false);
  };

  if (row.status === "active" && row.connectionId !== null) {
    const { connectionId } = row;

    return (
      <Button
        aria-busy={busy}
        className="self-start"
        disabled={busy}
        onClick={() =>
          run(async () => {
            await disconnect({ connectionId });
            toast.success(
              `${definition.label} is disconnected. Nothing will use it from now on.`
            );
          })
        }
        variant="destructive"
      >
        Disconnect {definition.label}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {row.developerReady ? null : (
        <p className="text-muted-foreground text-base">{NOT_SET_UP}</p>
      )}
      <div className="flex flex-wrap gap-3">
        {row.developerReady ? (
          <Button
            aria-busy={busy}
            disabled={busy}
            onClick={() =>
              run(async () => {
                const { redirectUrl } = await start({
                  provider: definition.id,
                });

                globalThis.location.assign(redirectUrl);
              })
            }
          >
            {row.status === "error"
              ? "Try connecting again"
              : `Connect ${definition.label}`}
          </Button>
        ) : null}
        {demoMode ? (
          <Button
            aria-busy={busy}
            disabled={busy}
            onClick={() =>
              run(async () => {
                await connectPractice({ provider: definition.id });
                toast.success(
                  `A practice ${definition.label} account is connected. It never reaches the real service.`
                );
              })
            }
            variant="outline"
          >
            Use a practice account
          </Button>
        ) : null}
      </div>
      {row.developerReady ? (
        <p className="text-muted-foreground text-base">
          You’ll sign in on {definition.label}’s own page. LifeLink never sees
          your password.
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
  if (row.definition.id === "imessage" && demoMode) {
    return (
      <p className="text-base">
        Practice mode uses simulated iMessages. No real iMessage setup or
        contact enrollment is needed, and no messages reach your contacts.
      </p>
    );
  }

  if (!row.developerReady) {
    return <p className="text-muted-foreground text-base">{NOT_SET_UP}</p>;
  }

  if (row.definition.id === "imessage") {
    return (
      <div className="bg-surface flex max-w-prose flex-col gap-4 rounded-lg p-5">
        <p className="text-lg">
          Link each person in Trusted circle to their existing Photon contact.
          LifeLink does not register new people or use new seat capacity.
        </p>
        <ol className="flex list-decimal flex-col gap-3 pl-6 text-lg leading-7">
          <li>
            Save the exact phone number or Apple ID email address they send
            iMessages from. A phone number and an email address are separate
            identities, even for the same person.
          </li>
          <li>
            Make sure this exact address is already registered in the Photon
            dashboard. Choose Link iMessage in Trusted circle, then use the
            assigned line shown for that contact.
          </li>
          <li>
            Ask them to send the first iMessage to their assigned line from that
            exact saved address. LifeLink can message them after their first
            message arrives.
          </li>
        </ol>
        <Link
          className={buttonVariants({ className: "self-start" })}
          href="/circle"
        >
          Open Trusted circle
        </Link>
      </div>
    );
  }

  return (
    <p className="text-base">
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

  const summary =
    available.length > 0
      ? available
          .slice(0, 2)
          .map((capability) => capability.label)
          .join(". ")
      : "No actions available in LifeLink yet.";

  return (
    <li className="border-rule border-t">
      <details className="group">
        <summary className="hover:bg-surface flex min-h-20 cursor-pointer list-none flex-wrap items-center justify-between gap-4 rounded-lg px-4 py-5 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 flex-1 basis-64 flex-col gap-1">
            <span className="text-lg font-semibold">{definition.label}</span>
            <span className="text-muted-foreground max-w-prose text-lg leading-7">
              {summary}
            </span>
          </span>
          <span className="flex flex-wrap items-center gap-3">
            <StatusPill row={row} />
            <ChevronDownIcon
              aria-hidden="true"
              className="text-muted-foreground size-5 shrink-0 transition-transform group-open:rotate-180"
            />
          </span>
          <span className="sr-only">Capabilities and setup</span>
        </summary>
        <div className="flex flex-col gap-5 px-4 pb-6">
          <p className="text-muted-foreground max-w-prose text-lg leading-7">
            {definition.id === "imessage"
              ? "Your contacts don't need an invitation, a LifeLink account, or access to the Photon dashboard."
              : `You need: ${definition.accountRequirement}`}
          </p>
          {row.accountLabel && row.status === "active" ? (
            <p className="text-lg break-words">Account: {row.accountLabel}</p>
          ) : null}
          {row.lastError && row.status === "error" ? (
            <p className="text-negative text-lg" role="alert">
              {row.lastError}
            </p>
          ) : null}
          <CapabilityList capabilities={definition.capabilities} />
          {definition.connectStyle === "oauth" ? (
            <OAuthActions demoMode={data.demoMode} row={row} />
          ) : null}
          {definition.connectStyle === "handle" ? (
            <HandleNote demoMode={data.demoMode} row={row} />
          ) : null}
          {definition.connectStyle === "developer_only" ? (
            <p className="text-muted-foreground max-w-prose text-lg leading-7">
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
  { ids: ["google_calendar"], title: "Manage appointments" },
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
      {data?.demoMode ? (
        <p className="bg-surface max-w-prose rounded-xl px-5 py-4 text-lg leading-7">
          Practice mode is on. You can try practice accounts without contacting
          a real service. “App setup needed” refers to the live connection.
        </p>
      ) : null}
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
                  className="text-2xl leading-8 font-semibold"
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
        <details className="border-rule rounded-xl border p-5">
          <summary className="min-h-12 cursor-pointer text-lg font-semibold">
            Other services and limitations
          </summary>
          <p className="text-muted-foreground max-w-prose py-4 text-lg leading-7">
            These services have no actions available in LifeLink yet. Review
            their limitations before connecting an account.
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
