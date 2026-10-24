"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { api } from "@lifelink/backend/convex/_generated/api";
import type {
  Capability,
  CapabilityStatus,
} from "@lifelink/contracts/integrations";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import { Pill } from "@lifelink/ui/components/pill";
import { cn } from "@lifelink/ui/lib/utils";
import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronDownIcon, ChevronRightIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";

import { PermissionIcon, permissionIconFor } from "./permission-icon";
import type { PermissionIconKind } from "./permission-icon";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type ConnectionsData = FunctionReturnType<typeof api.connections.list>;

type ProviderRow = ConnectionsData["providers"][number];

type ProviderId = ProviderRow["definition"]["id"];

const CAPABILITY_WORDS: Record<CapabilityStatus, string> = {
  available: "Works in LifeLink",
  not_offered: "Not possible with this service",
  not_wired: "The service allows it, but LifeLink doesn't use it yet",
};

const NOT_SET_UP =
  "This service isn't set up for this app yet. Whoever runs LifeLink needs to finish the app setup.";

const GROUPS = [
  { ids: ["imessage", "discord"], title: "Message family and friends" },
  { ids: ["gmail", "outlook"], title: "Read and write email" },
  { ids: ["google_calendar"], title: "Manage appointments" },
] as const;

const ADDITIONAL_IDS = new Set(["paypal", "facebook", "instagram", "ebay"]);

const ADDITIONAL_TITLE = "Other services";

const groupTitleFor = (id: ProviderId): string =>
  GROUPS.find((group) => group.ids.some((groupId) => groupId === id))?.title ??
  ADDITIONAL_TITLE;

const isAvailable = (capability: Capability): boolean =>
  capability.status === "available";

interface StatusWords {
  text: string;
  tone: "negative" | "neutral" | "warning";
}

const statusFor = (demoMode: boolean, row: ProviderRow): StatusWords => {
  if (row.status === "active") {
    return {
      text: row.mode === "simulated" ? "Practice account" : "Connected",
      tone: "neutral",
    };
  }

  if (row.status === "pending") {
    return { text: "Waiting to finish", tone: "warning" };
  }

  if (row.status === "error") {
    return { text: "Didn’t finish", tone: "negative" };
  }

  if (!row.definition.capabilities.some(isAvailable)) {
    return { text: "No actions available yet", tone: "neutral" };
  }

  if (demoMode && row.hasSavedRealConnection) {
    return { text: "Real connection saved", tone: "neutral" };
  }

  if (demoMode) {
    return {
      text:
        row.definition.connectStyle === "oauth"
          ? "Practice available"
          : "Practice messages",
      tone: "neutral",
    };
  }

  if (!row.developerReady) {
    return { text: "App setup needed", tone: "warning" };
  }

  return {
    text:
      row.definition.connectStyle === "oauth"
        ? "Ready to connect"
        : "Available",
    tone: "neutral",
  };
};

const oauthOptionsFor = (demoMode: boolean, row: ProviderRow) => {
  const hasAvailableActions = row.definition.capabilities.some(isAvailable);

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

const thingsCount = (count: number): string =>
  count === 1 ? "1 thing" : `${count} things`;

const cardCountFor = (demoMode: boolean, row: ProviderRow): string => {
  const { capabilities } = row.definition;
  const available = capabilities.filter(isAvailable).length;
  const notYet = capabilities.length - available;

  if (available === 0) {
    return "Nothing it can do yet";
  }

  if (!row.developerReady && !demoMode) {
    return `${thingsCount(available)}, after app setup`;
  }

  return notYet > 0
    ? `${thingsCount(available)} it can do · ${notYet} not yet`
    : `${thingsCount(available)} it can do`;
};

const cardIconsFor = (row: ProviderRow): PermissionIconKind[] => {
  const kinds = row.definition.capabilities
    .filter(isAvailable)
    .map((capability) => permissionIconFor(capability.id));

  return kinds.length === 0 ? ["unavailable"] : [...new Set(kinds)];
};

const ProviderCard = ({
  demoMode,
  onOpen,
  row,
}: {
  demoMode: boolean;
  onOpen: (id: ProviderId) => void;
  row: ProviderRow;
}) => {
  const { definition } = row;
  const status = statusFor(demoMode, row);

  const waitingForSetup =
    !row.developerReady && !demoMode && row.status !== "active";

  return (
    <li className="flex">
      <button
        aria-label={`${definition.label}. ${status.text}. Open to see everything it can do.`}
        className="border-border bg-surface hover:border-control hover:bg-parchment flex w-full cursor-pointer flex-col gap-5 rounded-xl border p-5 text-left transition-colors duration-150 motion-reduce:transition-none sm:p-6"
        onClick={() => onOpen(definition.id)}
        type="button"
      >
        <span className="flex w-full flex-wrap items-start justify-between gap-3">
          <span className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
            <span className="text-body font-semibold">{definition.label}</span>
            <span className="text-muted-foreground text-body">
              {definition.summary}
            </span>
          </span>
          <Pill tone={status.tone}>{status.text}</Pill>
        </span>
        <span
          className={cn(
            "flex flex-wrap gap-1",
            waitingForSetup ? "opacity-55" : null
          )}
        >
          {cardIconsFor(row).map((kind) => (
            <PermissionIcon
              className="size-[52px] sm:size-[64px]"
              key={kind}
              kind={kind}
              size={64}
            />
          ))}
        </span>
        <span className="border-border mt-auto flex w-full flex-wrap items-center justify-between gap-3 border-t pt-4">
          <span className="text-muted-foreground text-label">
            {cardCountFor(demoMode, row)}
          </span>
          <span className="text-accent-foreground text-label flex items-center gap-1 font-medium">
            Open
            <ChevronRightIcon aria-hidden="true" className="size-5" />
          </span>
        </span>
      </button>
    </li>
  );
};

const CardGrid = ({
  demoMode,
  onOpen,
  rows,
}: {
  demoMode: boolean;
  onOpen: (id: ProviderId) => void;
  rows: readonly ProviderRow[];
}) => (
  <ul className="grid gap-6 md:grid-cols-2">
    {rows.map((row) => (
      <ProviderCard
        demoMode={demoMode}
        key={row.definition.id}
        onOpen={onOpen}
        row={row}
      />
    ))}
  </ul>
);

const CapabilityRow = ({
  capability,
  developerReady,
}: {
  capability: Capability;
  developerReady: boolean;
}) => {
  const available = isAvailable(capability);

  const availability =
    available && !developerReady
      ? "Available after app setup"
      : CAPABILITY_WORDS[capability.status];

  return (
    <li className="flex items-center gap-4">
      <PermissionIcon
        className={available ? undefined : "opacity-55"}
        kind={permissionIconFor(capability.id)}
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={
            available ? "text-body" : "text-muted-foreground text-body"
          }
        >
          {capability.label}
        </span>
        <span className="text-muted-foreground text-label">
          {availability}
          {capability.note ? `. ${capability.note}` : "."}
        </span>
      </span>
    </li>
  );
};

const CapabilitySection = ({
  capabilities,
  developerReady,
  title,
}: {
  capabilities: readonly Capability[];
  developerReady: boolean;
  title: string;
}) =>
  capabilities.length === 0 ? null : (
    <section className="flex flex-col gap-2">
      <h3 className="text-label font-medium">{title}</h3>
      <ul className="flex flex-col gap-2">
        {capabilities.map((capability) => (
          <CapabilityRow
            capability={capability}
            developerReady={developerReady}
            key={capability.id}
          />
        ))}
      </ul>
    </section>
  );

const IMessageSteps = () => (
  <div className="bg-parchment flex flex-col gap-4 rounded-lg p-5">
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
        dashboard. If it is missing, add the contact there first. Then choose
        Link iMessage in Trusted circle and use the assigned number shown for
        that contact.
      </li>
      <li>
        Ask them to send the first iMessage to their assigned number from that
        exact saved address. LifeLink can message them after their first message
        arrives.
      </li>
    </ol>
  </div>
);

const HandleNote = ({
  demoMode,
  row,
}: {
  demoMode: boolean;
  row: ProviderRow;
}) => {
  const isIMessage = row.definition.id === "imessage";
  const service = isIMessage ? "iMessages" : "Discord messages";

  return (
    <>
      {demoMode ? (
        <p className="text-body">
          Practice {service} are simulated. No messages reach your contacts.
          {isIMessage ? " When you use real iMessage, follow these steps." : ""}
        </p>
      ) : null}
      {!row.developerReady && !demoMode ? (
        <p className="text-muted-foreground text-label">{NOT_SET_UP}</p>
      ) : null}
      {row.developerReady && !demoMode && !isIMessage ? (
        <p className="text-body">
          Ready. Add each person’s Discord user ID in Trusted circle.
        </p>
      ) : null}
      {isIMessage ? <IMessageSteps /> : null}
    </>
  );
};

const introFor = (row: ProviderRow): string =>
  row.definition.capabilities.some(isAvailable)
    ? `Here is everything LifeLink can do with ${row.definition.label}. Nothing is sent until you approve it.`
    : `LifeLink can’t do anything with ${row.definition.label} yet. Here is what stands in the way.`;

const requirementFor = (row: ProviderRow): string =>
  row.definition.id === "imessage"
    ? "Your contacts don't need an invitation, a LifeLink account, or access to the Photon dashboard."
    : row.definition.accountRequirement;

const DialogActions = ({
  demoMode,
  onDone,
  row,
}: {
  demoMode: boolean;
  onDone: () => void;
  row: ProviderRow;
}) => {
  const start = useAction(api.connections.start);
  const disconnect = useAction(api.connections.disconnect);
  const connectPractice = useMutation(api.connections.connectPractice);
  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const { definition } = row;
  const isOAuth = definition.connectStyle === "oauth";
  const options = oauthOptionsFor(demoMode, row);
  const canConnect = isOAuth && options.canConnect;
  const canDisconnect = isOAuth && options.canDisconnect;

  const opensCircle =
    definition.connectStyle === "handle" && (demoMode || row.developerReady);

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

  const connect = () =>
    run(async () => {
      if (demoMode) {
        await connectPractice({ provider: definition.id });
        toast.success(
          `A practice ${definition.label} account is connected. It never reaches the real service.`
        );
        onDone();

        return;
      }

      const { redirectUrl } = await start({ provider: definition.id });

      globalThis.location.assign(redirectUrl);
    });

  const disconnectAccount = () =>
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
      onDone();
    });

  return (
    <footer className="border-border flex flex-col gap-3 border-t px-5 py-5 sm:px-8">
      {visibleError ? (
        <p
          className="text-negative text-body break-words"
          id={errorId}
          role="alert"
        >
          {visibleError}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DialogPrimitive.Close
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          {canConnect ? "Cancel" : "Close"}
        </DialogPrimitive.Close>
        <div className="flex flex-wrap items-center gap-3">
          {canDisconnect ? (
            <Button
              aria-busy={busy}
              aria-describedby={visibleError ? errorId : undefined}
              disabled={busy}
              onClick={disconnectAccount}
              variant="destructive"
            >
              {row.mode === "simulated"
                ? "Disconnect practice account"
                : `Disconnect ${definition.label}`}
            </Button>
          ) : null}
          {canConnect ? (
            <Button
              aria-busy={busy}
              aria-describedby={visibleError ? errorId : undefined}
              disabled={busy}
              onClick={connect}
            >
              {options.connectLabel}
            </Button>
          ) : null}
          {opensCircle ? (
            <Link className={buttonVariants()} href="/circle">
              Open Trusted circle
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
};

const DISCLOSURE_MOTION_MS = 180;

const ConnectionDisclosure = ({
  children,
  className,
  name,
}: {
  children: ReactNode;
  className: string;
  name?: string;
}) => {
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (scrollTimer.current !== null) {
        clearTimeout(scrollTimer.current);
      }
    },
    []
  );

  const followOpening = (event: SyntheticEvent<HTMLDetailsElement>): void => {
    const disclosure = event.currentTarget;

    if (event.target !== disclosure) {
      return;
    }

    if (scrollTimer.current !== null) {
      clearTimeout(scrollTimer.current);
    }

    if (!disclosure.open) {
      return;
    }

    const reducedMotion =
      document.documentElement.dataset.motion === "reduced" ||
      globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Wait for the previous panel to collapse before choosing the scroll destination.
    scrollTimer.current = setTimeout(
      () => {
        if (disclosure.open && disclosure.isConnected) {
          disclosure.querySelector("summary")?.scrollIntoView({
            behavior: reducedMotion ? "instant" : "smooth",
            block: "start",
          });
        }
      },
      reducedMotion ? 0 : DISCLOSURE_MOTION_MS
    );
  };

  return (
    <details
      className={`connection-disclosure ${className}`}
      name={name}
      onToggle={followOpening}
    >
      {children}
    </details>
  );
};

const DialogBody = ({
  demoMode,
  row,
}: {
  demoMode: boolean;
  row: ProviderRow;
}) => {
  const { definition } = row;

  const { canConnect, needsSetup, practiceBlocked } = oauthOptionsFor(
    demoMode,
    row
  );

  const isOAuth = definition.connectStyle === "oauth";
  const available = definition.capabilities.filter(isAvailable);

  const notYet = definition.capabilities.filter(
    (capability) => !isAvailable(capability)
  );

  return (
    <div className="flex flex-col gap-6 overflow-y-auto px-5 pb-6 sm:px-8">
      {isOAuth && practiceBlocked ? (
        <p className="bg-parchment text-body rounded-lg p-5">
          Your real {definition.label} connection is saved. Practice accounts
          cannot replace it. Turn off Practice mode in Settings to manage it.
        </p>
      ) : null}
      {isOAuth && needsSetup ? (
        <p className="text-muted-foreground text-label">{NOT_SET_UP}</p>
      ) : null}
      {definition.connectStyle === "handle" ? (
        <HandleNote demoMode={demoMode} row={row} />
      ) : null}
      {row.accountLabel && row.status === "active" ? (
        <p className="text-body break-words">Account: {row.accountLabel}</p>
      ) : null}
      <CapabilitySection
        capabilities={available}
        developerReady={row.developerReady}
        title={`What ${definition.label} can do`}
      />
      <CapabilitySection
        capabilities={notYet}
        developerReady={row.developerReady}
        title="Not available yet"
      />
      <div className="bg-parchment flex flex-col gap-1 rounded-lg px-5 py-4">
        <p className="text-label font-medium">What you need</p>
        <p className="text-body">{requirementFor(row)}</p>
        {isOAuth && canConnect ? (
          <p className="text-muted-foreground text-label">
            {demoMode
              ? "This practice account never connects to the real service."
              : `You’ll sign in on ${definition.label}’s own page. LifeLink never sees your password.`}
          </p>
        ) : null}
        {definition.connectStyle === "developer_only" &&
        available.length > 0 ? (
          <p className="text-muted-foreground text-label">
            {row.developerReady
              ? "This works through the app's own account, so there's nothing for you to sign in to."
              : NOT_SET_UP}
          </p>
        ) : null}
      </div>
    </div>
  );
};

const ConnectionDialog = ({
  demoMode,
  onClose,
  row,
}: {
  demoMode: boolean;
  onClose: () => void;
  row: ProviderRow | null;
}) => {
  const status = row ? statusFor(demoMode, row) : null;

  return (
    <DialogPrimitive.Root
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={row !== null}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Popup className="border-border bg-raised text-foreground fixed top-1/2 left-1/2 z-50 flex max-h-[90svh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border shadow-[0_24px_48px_rgb(45_33_24/0.18)]">
          {row && status ? (
            <>
              <header className="flex items-start justify-between gap-4 px-5 pt-6 pb-5 sm:px-8 sm:pt-8">
                <div className="flex min-w-0 flex-col gap-2">
                  <p className="text-muted-foreground text-label font-medium">
                    {groupTitleFor(row.definition.id)}
                  </p>
                  <DialogPrimitive.Title className="text-mobile-title sm:text-page-title font-semibold">
                    {row.definition.label}
                  </DialogPrimitive.Title>
                  <Pill className="self-start" tone={status.tone}>
                    {status.text}
                  </Pill>
                  <DialogPrimitive.Description className="text-muted-foreground text-body">
                    {introFor(row)}
                  </DialogPrimitive.Description>
                </div>
                <DialogPrimitive.Close
                  aria-label="Close"
                  className="hover:bg-neutral-wash size-control -m-2 inline-flex shrink-0 items-center justify-center rounded-md"
                >
                  <XIcon aria-hidden="true" className="size-6" />
                </DialogPrimitive.Close>
              </header>
              <DialogBody demoMode={demoMode} row={row} />
              <DialogActions
                demoMode={demoMode}
                key={row.definition.id}
                onDone={onClose}
                row={row}
              />
            </>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

const ConnectionsScreen = () => {
  const data = useQuery(api.connections.list);
  const [openId, setOpenId] = useState<ProviderId | null>(null);

  const openRow =
    data?.providers.find((row) => row.definition.id === openId) ?? null;

  const additionalRows =
    data?.providers.filter((row) => ADDITIONAL_IDS.has(row.definition.id)) ??
    [];

  return (
    <>
      <PageHeader
        subline="Choose what you want help with. Open a card to see everything it can do before you connect."
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
                className="flex flex-col gap-4"
                key={group.title}
              >
                <h2
                  className="text-section font-semibold"
                  id={`group-${group.ids[0]}`}
                >
                  {group.title}
                </h2>
                <CardGrid
                  demoMode={data.demoMode}
                  onOpen={setOpenId}
                  rows={rows}
                />
              </section>
            );
          })}
      {data !== undefined && additionalRows.length > 0 ? (
        <ConnectionDisclosure className="group/limitations border-border bg-parchment rounded-xl border">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-4 rounded-xl px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
            <PermissionIcon kind="unavailable" size={48} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body font-semibold">
                Other services and limitations
              </span>
              <span className="text-muted-foreground text-label">
                {additionalRows.map((row) => row.definition.label).join(", ")}.
                See what isn’t available yet.
              </span>
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              className="text-muted-foreground size-5 shrink-0 transition-transform group-open/limitations:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="flex flex-col gap-4 px-5 pb-6 sm:px-6">
            <p className="text-muted-foreground text-body max-w-prose">
              These services have no actions available in LifeLink yet. Open a
              card to read its limitations.
            </p>
            <CardGrid
              demoMode={data.demoMode}
              onOpen={setOpenId}
              rows={additionalRows}
            />
          </div>
        </ConnectionDisclosure>
      ) : null}
      <ConnectionDialog
        demoMode={data?.demoMode ?? false}
        onClose={() => setOpenId(null)}
        row={openRow}
      />
    </>
  );
};

export { ConnectionsScreen };
