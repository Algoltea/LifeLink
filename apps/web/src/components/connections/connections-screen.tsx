"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { api } from "@lifelink/backend/convex/_generated/api";
import { findDeveloperIntegration } from "@lifelink/contracts/integrations";
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

import {
  IsoIcon,
  permissionIconFor,
  permissionLabelFor,
} from "@/components/app/iso-icon";
import type { PermissionIconKind } from "@/components/app/iso-icon";
import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type ConnectionsData = FunctionReturnType<typeof api.connections.list>;

type ProviderRow = ConnectionsData["providers"][number];

type ProviderId = ProviderRow["definition"]["id"];

const LIMIT_TAGS: Record<Exclude<CapabilityStatus, "available">, string> = {
  not_offered: "Not possible",
  not_wired: "Coming later",
};

const NOT_SET_UP =
  "This is not turned on yet. Ask the person who set up LifeLink to turn it on.";

const GROUPS = [
  { ids: ["imessage", "discord"], title: "Message family and friends" },
  { ids: ["gmail", "outlook"], title: "Read and write email" },
  { ids: ["google_calendar", "google_drive"], title: "Manage appointments" },
] as const;

const ADDITIONAL_IDS = new Set(["paypal", "facebook", "instagram", "ebay"]);

const ADDITIONAL_TITLE = "Coming later";

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
    return { text: "Not finished", tone: "warning" };
  }

  if (row.status === "error") {
    return { text: "Did not connect", tone: "negative" };
  }

  if (!row.definition.capabilities.some(isAvailable)) {
    return { text: "Coming later", tone: "neutral" };
  }

  if (demoMode && row.hasSavedRealConnection) {
    return { text: "Real account saved", tone: "neutral" };
  }

  if (demoMode) {
    return { text: "Practice", tone: "neutral" };
  }

  if (!row.developerReady) {
    return { text: "Not turned on", tone: "warning" };
  }

  return {
    text: row.definition.connectStyle === "oauth" ? "Not connected" : "Ready",
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

/** The card's call to action names only what the window lets the person do. */
const cardActionFor = (demoMode: boolean, row: ProviderRow): string => {
  if (row.definition.connectStyle === "oauth") {
    const { canConnect, canDisconnect } = oauthOptionsFor(demoMode, row);

    if (canConnect) {
      return "Connect";
    }

    return canDisconnect ? "Manage" : "Details";
  }

  // Practice messages need no setup, and Trusted circle holds it back.
  return row.definition.connectStyle === "handle" &&
    row.developerReady &&
    !demoMode
    ? "Set up"
    : "Details";
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
  const icons = cardIconsFor(row);

  const waitingForSetup =
    !row.developerReady && !demoMode && row.status !== "active";

  const canDo = icons.map((kind) => permissionLabelFor(kind)).join(", ");

  return (
    <li className="flex">
      <button
        aria-label={`${definition.label}. ${status.text}. ${canDo}. ${cardActionFor(demoMode, row)}.`}
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
        {/* Visible words, not tooltips: touch has no hover, and the button holds the focus. */}
        <span className="flex flex-wrap gap-x-2 gap-y-3">
          {icons.map((kind) => (
            <span
              className="flex w-[4.5rem] flex-col items-center gap-1 sm:w-20"
              key={kind}
            >
              <IsoIcon
                className={cn(
                  "size-[52px] sm:size-[64px]",
                  // Only the drawing dims; the word keeps full contrast.
                  waitingForSetup ? "opacity-55" : null
                )}
                kind={kind}
                size={64}
              />
              <span className="text-label text-center font-medium">
                {permissionLabelFor(kind)}
              </span>
            </span>
          ))}
        </span>
        <span className="border-border mt-auto flex w-full items-center justify-end gap-3 border-t pt-4">
          <span className="text-accent-foreground text-label flex items-center gap-1 font-medium">
            {cardActionFor(demoMode, row)}
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

const CanDoSection = ({
  capabilities,
}: {
  capabilities: readonly Capability[];
}) =>
  capabilities.length === 0 ? null : (
    <section className="flex flex-col gap-3">
      <h3 className="text-body font-semibold">Can do</h3>
      <ul className="flex flex-col gap-4">
        {capabilities.map((capability) => (
          <li className="flex items-center gap-4" key={capability.id}>
            <IsoIcon kind={permissionIconFor(capability.id)} />
            <span className="flex min-w-0 flex-col">
              <span className="text-body font-medium">{capability.label}</span>
              {capability.note ? (
                <span className="text-body">{capability.note}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );

const IMessageSteps = () => (
  <div className="flex flex-col gap-4">
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
  const service =
    row.definition.id === "imessage" ? "iMessages" : "Discord messages";

  return (
    <>
      {demoMode ? (
        <p className="text-body">
          Practice {service} are simulated. No messages reach your contacts.
        </p>
      ) : null}
      {!row.developerReady && !demoMode ? (
        <p className="text-body">{NOT_SET_UP}</p>
      ) : null}
    </>
  );
};

const introFor = (row: ProviderRow): string =>
  row.definition.capabilities.some(isAvailable)
    ? `LifeLink can do these things with ${row.definition.label}. Nothing is sent until you approve it.`
    : `LifeLink can’t do anything with ${row.definition.label} yet.`;

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

/** A closed section under a rule; the title stays at row size. */
const Fold = ({ children, title }: { children: ReactNode; title: string }) => (
  <ConnectionDisclosure className="group/fold border-border border-t pt-2">
    <summary className="text-body flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
      {title}
      <ChevronDownIcon
        aria-hidden="true"
        className="text-muted-foreground size-5 shrink-0 transition-transform group-open/fold:rotate-180 motion-reduce:transition-none"
      />
    </summary>
    <div className="pt-2 pb-2">{children}</div>
  </ConnectionDisclosure>
);

const LIMITS_TITLE = "What LifeLink can’t do yet";

const LimitRows = ({
  capabilities,
}: {
  capabilities: readonly Capability[];
}) => (
  <ul className="flex flex-col gap-4">
    {capabilities.map((capability) => (
      <li
        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
        key={capability.id}
      >
        <span className="flex min-w-0 flex-1 basis-56 flex-col">
          <span className="text-body font-medium">{capability.label}</span>
          {capability.note ? (
            <span className="text-body">{capability.note}</span>
          ) : null}
        </span>
        <span className="text-muted-foreground text-label shrink-0">
          {capability.status === "available"
            ? null
            : LIMIT_TAGS[capability.status]}
        </span>
      </li>
    ))}
  </ul>
);

/**
 * Limits stay one tap away so the window leads with what works. A service
 * with nothing available shows them openly, since they are all there is.
 */
const Limits = ({
  capabilities,
  collapsed,
}: {
  capabilities: readonly Capability[];
  collapsed: boolean;
}) => {
  if (capabilities.length === 0) {
    return null;
  }

  if (!collapsed) {
    return (
      <section className="flex flex-col gap-3">
        <h3 className="text-body font-semibold">{LIMITS_TITLE}</h3>
        <LimitRows capabilities={capabilities} />
      </section>
    );
  }

  return (
    <Fold title={`${LIMITS_TITLE} (${capabilities.length})`}>
      <LimitRows capabilities={capabilities} />
    </Fold>
  );
};

const HELPER_TITLE = "Setting this up for someone?";

const OAuthSteps = ({
  connectLabel,
  label,
}: {
  connectLabel: string;
  label: string;
}) => (
  <div className="flex flex-col gap-4">
    <ol className="text-body flex list-decimal flex-col gap-3 pl-6">
      <li>Press {connectLabel} below.</li>
      <li>Sign in with their account, not yours.</li>
      <li>Choose Allow on {label}’s page.</li>
      <li>You come back here and it says Connected.</li>
    </ol>
    <p className="text-body">
      Tip: they can disconnect {label} from this window at any time.
    </p>
  </div>
);

/** What a helper does next, or null when there is nothing to set up. */
const helperStepsFor = (demoMode: boolean, row: ProviderRow): ReactNode => {
  const { definition } = row;

  if (!definition.capabilities.some(isAvailable)) {
    return null;
  }

  if (!(row.developerReady || demoMode)) {
    const integration = findDeveloperIntegration(
      definition.developerIntegration
    );

    return (
      <p className="text-body">
        For whoever runs LifeLink: run <code>bun run dev:setup</code> and choose{" "}
        {integration?.label ?? definition.label}.
      </p>
    );
  }

  // Practice mode simulates messages, so the real steps say when they apply.
  if (definition.id === "imessage") {
    return (
      <div className="flex flex-col gap-4">
        {demoMode ? (
          <p className="text-body">
            When you use real iMessage, follow these steps.
          </p>
        ) : null}
        <IMessageSteps />
      </div>
    );
  }

  if (definition.id === "discord") {
    return (
      <p className="text-body">
        {demoMode ? "When you use real Discord, add" : "Add"} each person’s
        Discord user ID in Trusted circle.
      </p>
    );
  }

  if (definition.connectStyle !== "oauth" || demoMode) {
    // A practice account needs no sign-in, so the real steps would mislead.
    return null;
  }

  const { canConnect, connectLabel } = oauthOptionsFor(demoMode, row);

  return canConnect ? (
    <OAuthSteps connectLabel={connectLabel} label={definition.label} />
  ) : null;
};

/** Closed at first: most people set up their own account. */
const HelperSection = ({
  demoMode,
  row,
}: {
  demoMode: boolean;
  row: ProviderRow;
}) => {
  const steps = helperStepsFor(demoMode, row);

  return steps === null ? null : <Fold title={HELPER_TITLE}>{steps}</Fold>;
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
    <div className="flex flex-col gap-7 overflow-y-auto px-5 pb-6 sm:px-8">
      {isOAuth && practiceBlocked ? (
        <p className="bg-parchment text-body rounded-lg p-5">
          Your real {definition.label} connection is saved. Practice accounts
          cannot replace it. Turn off Practice mode in Settings to manage it.
        </p>
      ) : null}
      {isOAuth && needsSetup ? <p className="text-body">{NOT_SET_UP}</p> : null}
      {definition.connectStyle === "handle" ? (
        <HandleNote demoMode={demoMode} row={row} />
      ) : null}
      {row.accountLabel && row.status === "active" ? (
        <p className="text-body break-words">Account: {row.accountLabel}</p>
      ) : null}
      <CanDoSection capabilities={available} />
      <div className="bg-parchment flex flex-col gap-2 rounded-lg px-5 py-4">
        <h3 className="text-body font-semibold">What you need</h3>
        <p className="text-body">{requirementFor(row)}</p>
        {isOAuth && canConnect ? (
          <p className="text-body">
            {demoMode
              ? "This practice account never connects to the real service."
              : `You’ll sign in on ${definition.label}’s own page. LifeLink never sees your password.`}
          </p>
        ) : null}
        {definition.connectStyle === "developer_only" &&
        available.length > 0 ? (
          <p className="text-body">
            {row.developerReady
              ? "This works through the app's own account, so there's nothing for you to sign in to."
              : NOT_SET_UP}
          </p>
        ) : null}
      </div>
      <Limits capabilities={notYet} collapsed={available.length > 0} />
      <HelperSection demoMode={demoMode} row={row} />
    </div>
  );
};

/** The row stays until the closing fade ends, so the window fades out whole. */
const ConnectionDialog = ({
  demoMode,
  onClose,
  onClosed,
  open,
  row,
}: {
  demoMode: boolean;
  onClose: () => void;
  onClosed: () => void;
  open: boolean;
  row: ProviderRow | null;
}) => {
  const status = row ? statusFor(demoMode, row) : null;

  return (
    <DialogPrimitive.Root
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      onOpenChangeComplete={(next) => {
        if (!next) {
          onClosed();
        }
      }}
      open={open && row !== null}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="motion-fade fixed inset-0 z-50 bg-black/40" />
        <DialogPrimitive.Popup className="motion-pop border-border bg-raised text-foreground fixed top-1/2 left-1/2 z-50 flex max-h-[90svh] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border shadow-[0_24px_48px_rgb(45_33_24/0.18)]">
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
                  <DialogPrimitive.Description className="text-body">
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
  const [open, setOpen] = useState(false);

  const openService = (id: ProviderId): void => {
    setOpenId(id);
    setOpen(true);
  };

  const openRow =
    data?.providers.find((row) => row.definition.id === openId) ?? null;

  const additionalRows =
    data?.providers.filter((row) => ADDITIONAL_IDS.has(row.definition.id)) ??
    [];

  return (
    <>
      <PageHeader
        subline="Connect the services you already use. Open one to see what LifeLink can do with it."
        title="Connections"
      />
      {data === undefined ? (
        <LoadingRows
          layout="connections"
          label="Loading connections"
          rows={5}
        />
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
                  onOpen={openService}
                  rows={rows}
                />
              </section>
            );
          })}
      {data !== undefined && additionalRows.length > 0 ? (
        <ConnectionDisclosure className="group/limitations border-border bg-parchment rounded-xl border">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-4 rounded-xl px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
            <IsoIcon kind="unavailable" size={48} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body font-semibold">Coming later</span>
              <span className="text-muted-foreground text-label">
                {additionalRows.map((row) => row.definition.label).join(", ")}
              </span>
            </span>
            <ChevronDownIcon
              aria-hidden="true"
              className="text-muted-foreground size-5 shrink-0 transition-transform group-open/limitations:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <ul className="border-border mx-5 mb-4 border-t sm:mx-6">
            {additionalRows.map((row) => (
              <li
                className="border-border border-b last:border-b-0"
                key={row.definition.id}
              >
                <button
                  aria-label={`${row.definition.label}. ${row.definition.summary} Details.`}
                  className="hover:text-accent-foreground flex min-h-14 w-full items-center gap-4 py-3 text-left transition-colors duration-150 motion-reduce:transition-none"
                  onClick={() => openService(row.definition.id)}
                  type="button"
                >
                  <span className="text-body w-28 shrink-0 font-semibold sm:w-36">
                    {row.definition.label}
                  </span>
                  <span className="text-muted-foreground text-label min-w-0 flex-1">
                    {row.definition.summary}
                  </span>
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="text-muted-foreground size-5 shrink-0"
                  />
                </button>
              </li>
            ))}
          </ul>
        </ConnectionDisclosure>
      ) : null}
      <ConnectionDialog
        demoMode={data?.demoMode ?? false}
        onClose={() => setOpen(false)}
        onClosed={() => setOpenId(null)}
        open={open}
        row={openRow}
      />
    </>
  );
};

export { ConnectionsScreen };
