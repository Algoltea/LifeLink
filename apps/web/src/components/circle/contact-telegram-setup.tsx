"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { intlLocaleOf } from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { CopyIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { messagesFor, useLocale, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
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
  const locale = useLocale();
  const t = useMessages().telegramSetup;

  const expires =
    expiresAt === null
      ? ""
      : t.expires(
          new Intl.DateTimeFormat(intlLocaleOf(locale), {
            day: "numeric",
            month: "long",
            weekday: "long",
          }).format(expiresAt)
        );

  return (
    <div className="bg-surface flex flex-col gap-3 rounded-lg px-4 py-4">
      <p className="text-lg leading-7">
        {t.sendLink(contactName)}
        {expires}
      </p>
      <p className="num text-lg font-semibold break-all">{url}</p>
      <Button
        className="max-w-full self-start whitespace-normal"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          } catch {
            toast.error(t.copyLinkFailed);
          }
        }}
        size="sm"
        variant="outline"
      >
        <CopyIcon aria-hidden="true" />
        {t.copyLink}
      </Button>
      <output aria-live="polite" className="text-base">
        {copied ? t.copiedLink(contactName) : null}
      </output>
    </div>
  );
};

/** A username is saved: they only need to start the bot, from that account. */
const WaitingForStart = ({
  botUrl,
  contactLocale,
  contactName,
  username,
}: {
  botUrl: string;
  contactLocale: InterfaceLocale;
  contactName: string;
  username: string;
}) => {
  const [copied, setCopied] = useState(false);
  const t = useMessages().telegramSetup;

  // Sent by the owner to the contact, so in the contact's language.
  const invite = messagesFor(contactLocale).telegramSetup.invite(
    contactName,
    botUrl
  );

  return (
    <div className="bg-surface flex flex-col gap-3 rounded-lg px-4 py-4">
      <p aria-live="polite" className="text-lg leading-7">
        {t.waitingFor(username)}
        {t.waitingAsk(contactName)}
        <span className="font-semibold break-all">{botUrl}</span>
        {t.waitingRest}
      </p>
      <Button
        className="max-w-full self-start whitespace-normal"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(invite);
            setCopied(true);
          } catch {
            toast.error(t.copyInvitationFailed);
          }
        }}
        size="sm"
        variant="outline"
      >
        <CopyIcon aria-hidden="true" />
        {t.copyInvitation}
      </Button>
      <output aria-live="polite" className="text-base">
        {copied ? t.copiedInvitation(contactName) : null}
      </output>
    </div>
  );
};

type TelegramStatus = NonNullable<
  FunctionReturnType<typeof api.telegram.status>
>;

type Words = Messages["telegramSetup"];

const linkedName = (
  linked: NonNullable<TelegramStatus["linked"]>,
  t: Words
): string => {
  if (linked.username) {
    return `@${linked.username}`;
  }

  return linked.firstName ?? t.theirAccount;
};

const unavailableReason = (
  canManage: boolean,
  status: TelegramStatus | undefined,
  t: Words
): string | null => {
  if (!canManage) {
    return t.ownerOnly;
  }

  if (status === undefined) {
    return t.loading;
  }

  return status.configured ? null : t.notConfigured;
};

/** What a ready setup shows: the linked account, any open link, and the actions. */
const TelegramLinking = ({
  contactId,
  contactLocale,
  contactName,
  status,
}: {
  contactId: Id<"contacts">;
  contactLocale: InterfaceLocale;
  contactName: string;
  status: TelegramStatus;
}) => {
  const t = useMessages().telegramSetup;
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
          {t.linked(linkedName(linked, t), contactName)}
        </p>
      ) : null}
      {!linked && status.expectedUsername && status.botUrl ? (
        <WaitingForStart
          botUrl={status.botUrl}
          contactLocale={contactLocale}
          contactName={contactName}
          username={status.expectedUsername}
        />
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
          {linked || status.pending ? t.newLink : t.link}
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
            {t.unlink}
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
  contactLocale,
  contactName,
}: {
  canManage: boolean;
  contactId: Id<"contacts">;
  contactLocale: InterfaceLocale;
  contactName: string;
}) => {
  const headingId = useId();
  const t = useMessages().telegramSetup;

  const status = useQuery(
    api.telegram.status,
    canManage ? { contactId } : "skip"
  );

  const unavailable = unavailableReason(canManage, status, t);

  return (
    <section
      aria-labelledby={headingId}
      className="border-rule flex min-w-0 flex-col gap-3 border-t pt-5"
    >
      <h3 className="text-lg leading-7 font-semibold" id={headingId}>
        {t.heading}
      </h3>
      {unavailable === null && status !== undefined ? (
        <TelegramLinking
          contactId={contactId}
          contactLocale={contactLocale}
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
