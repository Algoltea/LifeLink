"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { CopyIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { messageOf } from "@/lib/errors";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const PendingLink = ({
  contactName,
  expiresAt,
  url,
}: {
  contactName: string;
  expiresAt: number | null;
  url: string;
}) => {
  const [copied, setCopied] = useState(false);

  const expires =
    expiresAt === null
      ? ""
      : ` It works once and stops working on ${new Intl.DateTimeFormat(
          "en-US",
          { day: "numeric", month: "long", weekday: "long" }
        ).format(expiresAt)}.`;

  return (
    <div className="bg-surface flex flex-col gap-3 rounded-lg px-4 py-4">
      <p className="text-lg leading-7">
        Send this link to {contactName}. When they open it and tap Start,
        Telegram is linked here automatically.{expires}
      </p>
      <p className="num text-lg font-semibold break-all">{url}</p>
      <Button
        className="max-w-full self-start whitespace-normal"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          } catch {
            toast.error("Couldn’t copy the link. Select and copy it above.");
          }
        }}
        size="sm"
        variant="outline"
      >
        <CopyIcon aria-hidden="true" />
        Copy link
      </Button>
      <output aria-live="polite" className="text-base">
        {copied ? `Link copied. Send it to ${contactName} yourself.` : null}
      </output>
    </div>
  );
};

type TelegramStatus = NonNullable<
  FunctionReturnType<typeof api.telegram.status>
>;

const linkedName = (linked: NonNullable<TelegramStatus["linked"]>): string => {
  if (linked.username) {
    return `@${linked.username}`;
  }

  return linked.firstName ?? "their Telegram account";
};

const unavailableReason = (
  canManage: boolean,
  status: TelegramStatus | undefined
): string | null => {
  if (!canManage) {
    return "Only the account owner can link Telegram for their contacts.";
  }

  if (status === undefined) {
    return "Loading Telegram setup…";
  }

  return status.configured
    ? null
    : "App setup needed. Whoever runs LifeLink must connect Telegram before you can link it for this contact.";
};

/** What a ready setup shows: the linked account, any open link, and the actions. */
const TelegramLinking = ({
  contactId,
  contactName,
  status,
}: {
  contactId: Id<"contacts">;
  contactName: string;
  status: TelegramStatus;
}) => {
  const createLink = useMutation(api.telegram.createLink);
  const unlink = useMutation(api.telegram.unlink);
  const [pending, setPending] = useState<"link" | "unlink" | null>(null);

  const run = async (
    kind: "link" | "unlink",
    work: () => Promise<null>
  ): Promise<void> => {
    setPending(kind);

    try {
      await work();
    } catch (error) {
      toast.error(errorText(error));
    }

    setPending(null);
  };

  const { linked } = status;

  return (
    <>
      {linked ? (
        <p aria-live="polite" className="text-lg leading-7">
          Linked to {linkedName(linked)}. Messages you approve for {contactName}{" "}
          can go by Telegram, and their replies arrive in Messages.
        </p>
      ) : null}
      {status.pending ? (
        <PendingLink
          contactName={contactName}
          expiresAt={status.pending.expiresAt}
          url={status.pending.url}
        />
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          aria-busy={pending === "link"}
          disabled={pending !== null}
          onClick={() =>
            run("link", async () => await createLink({ contactId }))
          }
          size="sm"
          variant="outline"
        >
          {linked || status.pending ? "Make a new link" : "Link Telegram"}
        </Button>
        {linked ? (
          <Button
            aria-busy={pending === "unlink"}
            disabled={pending !== null}
            onClick={() =>
              run("unlink", async () => await unlink({ contactId }))
            }
            size="sm"
            variant="ghost"
          >
            Unlink Telegram
          </Button>
        ) : null}
      </div>
    </>
  );
};

/** Link one saved person's Telegram through a one-time Start link. */
const ContactTelegramSetup = ({
  canManage,
  contactId,
  contactName,
}: {
  canManage: boolean;
  contactId: Id<"contacts">;
  contactName: string;
}) => {
  const headingId = useId();

  const status = useQuery(
    api.telegram.status,
    canManage ? { contactId } : "skip"
  );

  const unavailable = unavailableReason(canManage, status);

  return (
    <section
      aria-labelledby={headingId}
      className="border-rule flex min-w-0 flex-col gap-3 border-t pt-5"
    >
      <h3 className="text-lg leading-7 font-semibold" id={headingId}>
        Telegram
      </h3>
      {unavailable === null && status !== undefined ? (
        <TelegramLinking
          contactId={contactId}
          contactName={contactName}
          status={status}
        />
      ) : (
        <p aria-live="polite" className="text-muted-foreground text-label">
          {unavailable}
        </p>
      )}
    </section>
  );
};

export { ContactTelegramSetup };
