"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Pill } from "@lifelink/ui/components/pill";
import { Textarea } from "@lifelink/ui/components/textarea";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { SimulatedPill } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { ENV } from "@/env";
import { useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { authClient } from "@/lib/auth-client";
import { messageOf } from "@/lib/errors";
import { ago, formatDay, formatWhen, money } from "@/lib/format";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const JoinForm = () => {
  const accept = useMutation(api.sharing.acceptInvite);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const inputId = useId();
  const hintId = useId();
  const t = useMessages().family;

  return (
    <form
      className="bg-parchment flex max-w-prose flex-col gap-4 rounded-xl p-5 sm:p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);

        try {
          await accept({ code });
          setCode("");
          toast.success(t.connected);
        } catch (error) {
          toast.error(errorText(error));
        }

        setBusy(false);
      }}
    >
      <h2 className="text-2xl leading-8 font-semibold">{t.haveCode}</h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>{t.invitationCode}</Label>
        <Input
          aria-describedby={hintId}
          autoCapitalize="characters"
          autoComplete="off"
          className="max-w-sm text-xl tracking-wider"
          id={inputId}
          onChange={(event) => setCode(event.target.value)}
          value={code}
        />
        <p className="text-muted-foreground text-lg leading-7" id={hintId}>
          {t.codeHint}
        </p>
      </div>
      <Button
        aria-busy={busy}
        className="self-start"
        disabled={busy || code.trim().length < 4}
        type="submit"
      >
        {t.connect}
      </Button>
    </form>
  );
};

/** Photos are fetched with the viewer's own sign-in, so the server checks their grant on every download. */
const SharedPhoto = ({
  caption,
  photoId,
}: {
  caption: string | null;
  photoId: Id<"photos">;
}) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const t = useMessages().family;

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    const fetchPhoto = async (): Promise<void> => {
      const { data } = await authClient.convex.token({
        fetchOptions: { throw: false },
      });

      if (!data?.token) {
        setFailed(true);

        return;
      }

      const response = await fetch(
        `${ENV.NEXT_PUBLIC_CONVEX_SITE_URL}/files/photo?id=${encodeURIComponent(photoId)}`,
        {
          cache: "no-store",
          headers: { Authorization: `Bearer ${data.token}` },
        }
      );

      if (!response.ok) {
        setFailed(true);

        return;
      }

      objectUrl = URL.createObjectURL(await response.blob());

      if (cancelled) {
        URL.revokeObjectURL(objectUrl);
      } else {
        setUrl(objectUrl);
      }
    };

    const load = async (): Promise<void> => {
      try {
        await fetchPhoto();
      } catch {
        setFailed(true);
      }
    };

    void load();

    return () => {
      cancelled = true;

      if (objectUrl !== null) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [photoId]);

  return (
    <figure className="flex flex-col gap-2">
      <div className="bg-surface aspect-square overflow-hidden rounded-lg">
        {url === null ? (
          <p className="text-muted-foreground flex size-full items-center justify-center p-3 text-center text-lg leading-7">
            {failed ? t.photoUnavailable : t.loadingPhoto}
          </p>
        ) : (
          // oxlint-disable-next-line nextjs/no-img-element -- a private blob URL; next/image can't optimise it.
          <img
            alt={caption ?? t.sharedPhoto}
            className="size-full object-cover"
            src={url}
          />
        )}
      </div>
      {caption ? (
        <figcaption className="text-base">{caption}</figcaption>
      ) : null}
    </figure>
  );
};

const Conversation = ({
  ownerId,
  ownerName,
  timeZone,
}: {
  ownerId: Id<"profiles">;
  ownerName: string;
  timeZone: string;
}) => {
  const thread = useQuery(api.messages.inAppThreadWith, { ownerId });
  const reply = useMutation(api.messages.replyInApp);
  const [body, setBody] = useState("");
  const inputId = useId();
  const t = useMessages().family;

  if (thread === null) {
    return null;
  }

  return (
    <section
      aria-labelledby={`${inputId}-heading`}
      className="flex flex-col gap-4"
    >
      <h3 className="text-xl font-semibold" id={`${inputId}-heading`}>
        {t.messagesWith(ownerName)}
      </h3>
      {thread === undefined ? (
        <LoadingRows layout="conversation" label={t.loadingMessages} rows={2} />
      ) : null}
      {thread !== undefined && thread.length === 0 ? (
        <EmptyNote>{t.noMessages}</EmptyNote>
      ) : null}
      {thread !== undefined && thread.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {thread.map((message) => (
            <li
              className={
                message.fromMe
                  ? "bg-surface border-border max-w-prose self-end rounded-xl border px-5 py-4"
                  : "bg-raised border-border max-w-prose self-start rounded-xl border px-5 py-4"
              }
              key={message.id}
            >
              <span className="sr-only">
                {message.fromMe ? t.youWrote : t.theyWrote(ownerName)}
              </span>
              <p className="text-lg leading-7 break-words whitespace-pre-wrap">
                {message.body}
              </p>
              <span className="text-muted-foreground text-sm">
                {message.fromMe ? t.you : ownerName} ·{" "}
                {ago(message.createdAt, timeZone)}
                {message.hasPhotos ? t.withPhotos : ""}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
      <form
        className="flex flex-col gap-3"
        onSubmit={async (event) => {
          event.preventDefault();

          try {
            await reply({ body, ownerId });
            setBody("");
          } catch (error) {
            toast.error(errorText(error));
          }
        }}
      >
        <Label htmlFor={inputId}>{t.replyTo(ownerName)}</Label>
        <Textarea
          id={inputId}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          value={body}
        />
        <Button
          className="self-start"
          disabled={body.trim().length === 0}
          type="submit"
        >
          {t.sendReply}
        </Button>
      </form>
    </section>
  );
};

const OwnerView = ({ ownerId }: { ownerId: Id<"profiles"> }) => {
  const overview = useQuery(api.family.overview, { ownerId });
  const messages = useMessages();
  const t = messages.family;

  if (overview === undefined) {
    return (
      <LoadingRows layout="family" label={t.loadingWhatWasShared} rows={4} />
    );
  }

  if (overview === null) {
    return <EmptyNote>{t.notSharing}</EmptyNote>;
  }

  const { ownerName, timeZone } = overview;

  return (
    <article
      aria-labelledby={`owner-${ownerId}`}
      className="border-border bg-raised flex max-w-prose flex-col gap-8 rounded-xl border p-5 sm:p-6"
    >
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            className="text-2xl leading-8 font-semibold"
            id={`owner-${ownerId}`}
          >
            {ownerName}
          </h2>
          {overview.demoMode ? <SimulatedPill /> : null}
        </div>
        <p className="text-muted-foreground text-lg leading-7">
          {t.shares(
            ownerName,
            overview.scopes
              .map((scope) =>
                messages.sharing.scopes[scope].label.toLowerCase()
              )
              .join(", ")
          )}
        </p>
      </header>

      {overview.updates.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">{t.updates}</h3>
          <ul className="flex flex-col gap-3">
            {overview.updates.map((update) => (
              <li className="border-rule border-t pt-4" key={update.id}>
                <p className="text-lg">{translateServerMessage(update.text)}</p>
                <span className="text-muted-foreground text-base">
                  {ago(update.createdAt, timeZone)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {overview.appointments === null ? null : (
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">{t.appointments}</h3>
          {overview.appointments.length === 0 ? (
            <EmptyNote>{t.nothingSoon}</EmptyNote>
          ) : (
            <ul>
              {overview.appointments.map((appointment) => {
                const ride =
                  appointment.rideStatus === null ||
                  appointment.rideStatus === "none"
                    ? null
                    : t.ride[appointment.rideStatus];

                return (
                  <li
                    className="border-rule flex flex-col gap-1 border-t py-4"
                    key={appointment.id}
                  >
                    <span className="text-lg font-semibold">
                      {appointment.title}
                    </span>
                    <span className="text-base">
                      {formatWhen(appointment.startsAt, timeZone)}
                      {appointment.location ? ` · ${appointment.location}` : ""}
                    </span>
                    {ride ? (
                      <span className="text-muted-foreground text-base">
                        {ride}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {overview.reminders === null ? null : (
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">{t.sharedReminders}</h3>
          {overview.reminders.length === 0 ? (
            <EmptyNote>{t.noSharedReminders}</EmptyNote>
          ) : (
            <ul>
              {overview.reminders.map((reminder) => (
                <li
                  className="border-rule flex flex-wrap justify-between gap-2 border-t py-3 text-lg"
                  key={reminder.id}
                >
                  <span>{reminder.title}</span>
                  <span className="text-muted-foreground">
                    {formatWhen(reminder.remindAt, timeZone)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {overview.scamAlerts === null ||
      overview.scamAlerts.length === 0 ? null : (
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">{t.scamChecks}</h3>
          <p className="text-muted-foreground text-lg leading-7">
            {t.onlyResult}
          </p>
          <ul>
            {overview.scamAlerts.map((alert) => (
              <li
                className="border-rule flex flex-wrap items-center gap-3 border-t py-3"
                key={alert.id}
              >
                <Pill
                  tone={
                    alert.verdict === "likely_scam" ? "negative" : "warning"
                  }
                >
                  {alert.verdict === "likely_scam"
                    ? t.likelyScam
                    : t.suspicious}
                </Pill>
                <span className="text-lg">
                  {t.checked(
                    t.kinds[alert.kind] ?? alert.kind,
                    formatDay(alert.createdAt, timeZone)
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {overview.groceries === null || overview.groceries.length === 0 ? null : (
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">{t.groceries}</h3>
          {overview.groceries.map((list) => (
            <div
              className="border-rule flex flex-col gap-1 border-t py-3"
              key={list.id}
            >
              <span className="text-lg font-semibold">
                {list.name}
                {list.budgetCents === null
                  ? ""
                  : t.budget(money(list.budgetCents))}
              </span>
              <span className="text-base">
                {list.items.length > 0 ? list.items.join(", ") : t.nothingLeft}
              </span>
            </div>
          ))}
        </section>
      )}

      {overview.photos === null || overview.photos.length === 0 ? null : (
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">{t.photos}</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {overview.photos.map((photo) => (
              <SharedPhoto
                caption={photo.caption}
                key={photo.id}
                photoId={photo.id}
              />
            ))}
          </div>
        </section>
      )}

      <Conversation
        ownerId={ownerId}
        ownerName={ownerName}
        timeZone={timeZone}
      />
    </article>
  );
};

const FamilyScreen = () => {
  const shared = useQuery(api.sharing.sharedWithMe);
  const t = useMessages().family;

  const owners =
    shared === undefined
      ? []
      : [...new Map(shared.map((grant) => [grant.ownerId, grant])).values()];

  return (
    <>
      <PageHeader subline={t.subline} title={t.title} />
      {shared === undefined ? (
        <LoadingRows layout="note" label={t.loadingShared} rows={3} />
      ) : null}
      {shared !== undefined && owners.length === 0 ? (
        <EmptyNote>{t.empty}</EmptyNote>
      ) : null}
      <div className="flex flex-col gap-8">
        {owners.map((grant) => (
          <OwnerView key={grant.ownerId} ownerId={grant.ownerId} />
        ))}
      </div>
      <JoinForm />
    </>
  );
};

export { FamilyScreen };
