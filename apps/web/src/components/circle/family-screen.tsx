"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { sharingScopes } from "@lifelink/contracts/sharing";
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
import { authClient } from "@/lib/auth-client";
import { messageOf } from "@/lib/errors";
import { ago, formatDay, formatWhen, money } from "@/lib/format";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const RIDE_WORDS: Record<
  "asked" | "confirmed" | "declined" | "none",
  string | null
> = {
  asked: "Ride asked for, not confirmed yet",
  confirmed: "Ride confirmed",
  declined: "Ride declined",
  none: null,
};

const JoinForm = () => {
  const accept = useMutation(api.sharing.acceptInvite);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const inputId = useId();
  const hintId = useId();

  return (
    <form
      className="bg-parchment flex max-w-prose flex-col gap-4 rounded-xl p-5 sm:p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);

        try {
          await accept({ code });
          setCode("");
          toast.success(
            "You're connected. You'll see only what they chose to share."
          );
        } catch (error) {
          toast.error(errorText(error));
        }

        setBusy(false);
      }}
    >
      <h2 className="text-2xl leading-8 font-semibold">
        Have an invitation code?
      </h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>Invitation code</Label>
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
          The person who invited you can read it from their Trusted circle page.
        </p>
      </div>
      <Button
        aria-busy={busy}
        className="self-start"
        disabled={busy || code.trim().length < 4}
        type="submit"
      >
        Connect
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
            {failed ? "This photo isn't available." : "Loading photo…"}
          </p>
        ) : (
          // oxlint-disable-next-line nextjs/no-img-element -- a private blob URL; next/image can't optimise it.
          <img
            alt={caption ?? "A shared photo"}
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

  if (thread === null) {
    return null;
  }

  return (
    <section
      aria-labelledby={`${inputId}-heading`}
      className="flex flex-col gap-4"
    >
      <h3 className="text-xl font-semibold" id={`${inputId}-heading`}>
        Messages with {ownerName}
      </h3>
      {thread === undefined ? (
        <LoadingRows layout="conversation" label="Loading messages" rows={2} />
      ) : null}
      {thread !== undefined && thread.length === 0 ? (
        <EmptyNote>No messages in LifeLink yet.</EmptyNote>
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
                {message.fromMe ? "You wrote: " : `${ownerName} wrote: `}
              </span>
              <p className="text-lg leading-7 break-words whitespace-pre-wrap">
                {message.body}
              </p>
              <span className="text-muted-foreground text-sm">
                {message.fromMe ? "You" : ownerName} ·{" "}
                {ago(message.createdAt, timeZone)}
                {message.hasPhotos ? " · with photos" : ""}
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
        <Label htmlFor={inputId}>Reply to {ownerName}</Label>
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
          Send reply
        </Button>
      </form>
    </section>
  );
};

const OwnerView = ({ ownerId }: { ownerId: Id<"profiles"> }) => {
  const overview = useQuery(api.family.overview, { ownerId });

  if (overview === undefined) {
    return (
      <LoadingRows layout="family" label="Loading what was shared" rows={4} />
    );
  }

  if (overview === null) {
    return <EmptyNote>This person isn’t sharing with you right now.</EmptyNote>;
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
          {ownerName} shares:{" "}
          {overview.scopes
            .map(
              (scope) =>
                sharingScopes
                  .find((item) => item.id === scope)
                  ?.label.toLowerCase() ?? scope
            )
            .join(", ")}
          . You can look, but you can’t send, approve, or spend anything for
          them.
        </p>
      </header>

      {overview.updates.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Updates</h3>
          <ul className="flex flex-col gap-3">
            {overview.updates.map((update) => (
              <li className="border-rule border-t pt-4" key={update.id}>
                <p className="text-lg">{update.text}</p>
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
          <h3 className="text-xl font-semibold">Appointments</h3>
          {overview.appointments.length === 0 ? (
            <EmptyNote>Nothing in the next 30 days.</EmptyNote>
          ) : (
            <ul>
              {overview.appointments.map((appointment) => {
                const ride =
                  appointment.rideStatus === null
                    ? null
                    : RIDE_WORDS[appointment.rideStatus];

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
          <h3 className="text-xl font-semibold">Shared reminders</h3>
          {overview.reminders.length === 0 ? (
            <EmptyNote>No shared reminders.</EmptyNote>
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
          <h3 className="text-xl font-semibold">Scam checks</h3>
          <p className="text-muted-foreground text-lg leading-7">
            Only the result is shared, never the message itself.
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
                    ? "Likely a scam"
                    : "Suspicious"}
                </Pill>
                <span className="text-lg">
                  A {alert.kind === "screenshot" ? "screenshot" : alert.kind}{" "}
                  checked {formatDay(alert.createdAt, timeZone)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {overview.groceries === null || overview.groceries.length === 0 ? null : (
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Groceries</h3>
          {overview.groceries.map((list) => (
            <div
              className="border-rule flex flex-col gap-1 border-t py-3"
              key={list.id}
            >
              <span className="text-lg font-semibold">
                {list.name}
                {list.budgetCents === null
                  ? ""
                  : ` · budget ${money(list.budgetCents)}`}
              </span>
              <span className="text-base">
                {list.items.length > 0
                  ? list.items.join(", ")
                  : "Nothing left to buy."}
              </span>
            </div>
          ))}
        </section>
      )}

      {overview.photos === null || overview.photos.length === 0 ? null : (
        <section className="flex flex-col gap-3">
          <h3 className="text-xl font-semibold">Photos</h3>
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

  const owners =
    shared === undefined
      ? []
      : [...new Map(shared.map((grant) => [grant.ownerId, grant])).values()];

  return (
    <>
      <PageHeader
        subline="See only what each person chooses to share. You can look, but never send, approve, or spend anything for them."
        title="Family"
      />
      {shared === undefined ? (
        <LoadingRows
          layout="note"
          label="Loading shared information"
          rows={3}
        />
      ) : null}
      {shared !== undefined && owners.length === 0 ? (
        <EmptyNote>
          No one is sharing with you yet. When someone invites you, type their
          code below.
        </EmptyNote>
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
