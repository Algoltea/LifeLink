"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Label } from "@lifelink/ui/components/label";
import { Textarea } from "@lifelink/ui/components/textarea";
import { useMutation, useQuery } from "convex/react";
import {
  ImagePlusIcon,
  LightbulbIcon,
  ListChecksIcon,
  XIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Avatar, ModePill } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { ExplanationPanel } from "@/components/explain/explanation-panel";
import { RecapPanel } from "@/components/messages/recap-panel";
import { CHANNEL_WORDS, formatAddress } from "@/components/tasks/details-view";
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

const STATUS_WORDS: Record<Doc<"messages">["status"], string> = {
  delivered: "Delivered",
  draft: "Draft, not sent",
  failed: "Not sent",
  read: "Read",
  received: "Received",
  sending: "Sending…",
  sent: "Sent",
  unknown: "Not sure it was sent",
};

const MAX_PHOTOS = 4;

const uploadResultSchema = z.object({ storageId: z.string() });

interface PendingPhoto {
  id: Id<"photos">;
  name: string;
}

const MessageGuidance = ({
  firstName,
  hasChannel,
  photoCount,
  practice,
}: {
  firstName: string;
  hasChannel: boolean;
  photoCount: number;
  practice: boolean;
}) => (
  <>
    <p className="text-muted-foreground text-lg leading-7">
      {practice
        ? `This is a practice message. Nothing will be sent to ${firstName}.`
        : `You’ll see exactly what ${firstName} will get, then approve it.`}
    </p>
    {hasChannel ? null : (
      <Link
        className="text-lg leading-7 underline underline-offset-4"
        href="/circle"
      >
        Add a way to reach {firstName} in Trusted circle.
      </Link>
    )}
    {photoCount >= MAX_PHOTOS ? (
      <p className="text-muted-foreground text-base">
        You can attach up to {MAX_PHOTOS} photos. Remove one to add another.
      </p>
    ) : null}
  </>
);

const ThreadScreen = ({ contactId }: { contactId: string }) => {
  // SAFETY: the id comes from a LifeLink link; the query checks ownership and rejects anything else.
  const thread = useQuery(api.messages.thread, {
    contactId: contactId as Id<"contacts">,
  });

  const uploadUrl = useMutation(api.messages.generatePhotoUploadUrl);
  const registerPhoto = useMutation(api.messages.registerPhoto);
  const draft = useMutation(api.messages.draft);
  const { me } = usePreferences();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [busy, setBusy] = useState(false);
  const [explaining, setExplaining] = useState<Id<"messages"> | null>(null);
  const [recapOpen, setRecapOpen] = useState(false);
  const [fromSuggestion, setFromSuggestion] = useState(false);
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const bodyId = useId();
  const timeZone = me?.profile?.timeZone ?? "America/New_York";

  if (thread === undefined) {
    return (
      <>
        <PageHeader title="Conversation" />
        <LoadingRows label="Loading conversation" rows={4} />
      </>
    );
  }

  const { contact } = thread;

  const preferred =
    contact.channels.find((channel) => channel.preferred) ??
    contact.channels[0];

  const firstName = contact.name.split(" ")[0] ?? contact.name;

  const addPhotos = async (files: FileList | null): Promise<void> => {
    if (files === null) {
      return;
    }

    for (const file of [...files].slice(0, MAX_PHOTOS - photos.length)) {
      try {
        // oxlint-disable-next-line eslint/no-await-in-loop -- photos upload one at a time so a failure names the right file.
        const url = await uploadUrl({});

        // oxlint-disable-next-line eslint/no-await-in-loop -- see above.
        const response = await fetch(url, {
          body: file,
          headers: { "Content-Type": file.type },
          method: "POST",
        });

        // oxlint-disable-next-line eslint/no-await-in-loop -- see above.
        const uploaded = uploadResultSchema.parse(await response.json());

        // SAFETY: Convex storage returned this id for the file just uploaded; the mutation re-checks it.
        // oxlint-disable-next-line eslint/no-await-in-loop -- see above.
        const photoId = await registerPhoto({
          caption: null,
          contactId: contact._id,
          storageId: uploaded.storageId as Id<"_storage">,
        });

        if (photoId === null) {
          toast.error(
            `${file.name}: Please choose a photo (JPEG, PNG, WebP, or HEIC).`
          );
        } else {
          setPhotos((existing) => [
            ...existing,
            { id: photoId, name: file.name },
          ]);
        }
      } catch (error) {
        toast.error(
          `${file.name}: ${messageOf(error instanceof Error ? error : null)}`
        );
      }
    }
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="text-muted-foreground flex flex-wrap items-center gap-x-2 text-lg"
      >
        <Link
          className="inline-flex min-h-12 items-center hover:underline"
          href="/messages"
        >
          Messages
        </Link>
        <span aria-hidden="true"> › </span>
        {contact.name}
      </nav>
      <PageHeader
        subline={
          preferred
            ? `${contact.relationship} · ${CHANNEL_WORDS[preferred.channel]}${preferred.channel === "in_app" ? "" : ` to ${formatAddress(preferred.address)}`}`
            : `${contact.relationship} · Add a way to reach ${firstName} under Trusted circle.`
        }
        title={contact.name}
      />
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <section
          aria-labelledby="history-heading"
          className="flex min-w-0 flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              className="text-2xl leading-8 font-semibold"
              id="history-heading"
            >
              Conversation
            </h2>
            {thread.messages.length > 0 ? (
              <Button
                aria-controls="recap-panel"
                aria-expanded={recapOpen}
                onClick={() => setRecapOpen(true)}
                size="sm"
                variant="outline"
              >
                <ListChecksIcon aria-hidden="true" />
                Recap this conversation
              </Button>
            ) : null}
          </div>
          {thread.messages.length === 0 ? (
            <EmptyNote>No messages with {firstName} yet.</EmptyNote>
          ) : (
            <ol className="flex flex-col gap-3" aria-live="polite">
              {thread.messages.map((message) => (
                <li
                  className={
                    message.direction === "incoming"
                      ? "flex justify-start"
                      : "flex justify-end"
                  }
                  key={message._id}
                >
                  <div
                    className={
                      message.direction === "incoming"
                        ? "border-border bg-raised flex max-w-prose min-w-0 flex-col gap-3 rounded-xl border px-5 py-4"
                        : "bg-surface flex max-w-prose min-w-0 flex-col gap-3 rounded-xl px-5 py-4"
                    }
                  >
                    <p className="text-lg leading-7 break-words whitespace-pre-wrap">
                      {message.body}
                    </p>
                    {message.photoIds.length > 0 ? (
                      <p className="text-muted-foreground text-lg leading-7">
                        {message.photoIds.length}{" "}
                        {message.photoIds.length === 1 ? "photo" : "photos"}
                      </p>
                    ) : null}
                    <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-lg leading-7">
                      <Avatar
                        hue={contact.hue}
                        name={
                          message.direction === "incoming"
                            ? contact.name
                            : (me?.profile?.preferredName ?? "Me")
                        }
                        size="sm"
                      />
                      {message.direction === "incoming" ? firstName : "You"} ·{" "}
                      {ago(message.createdAt, timeZone)}
                      {message.direction === "outgoing"
                        ? ` · ${STATUS_WORDS[message.status]}`
                        : ""}
                      <ModePill mode={message.mode} />
                    </p>
                    {message.direction === "incoming" &&
                    message.body.trim().length > 0 ? (
                      <Button
                        aria-controls="explanation-panel"
                        aria-expanded={explaining === message._id}
                        className="self-start whitespace-normal"
                        onClick={() => setExplaining(message._id)}
                        size="sm"
                        variant="outline"
                      >
                        <LightbulbIcon aria-hidden="true" />
                        Help me understand
                      </Button>
                    ) : null}
                    {message.taskId &&
                    message.direction === "outgoing" &&
                    (message.status === "unknown" ||
                      message.status === "failed") ? (
                      <Link
                        className="text-base font-semibold underline"
                        // SAFETY: a stored task id, and /tasks/[taskId] is a real route.
                        href={`/tasks/${message.taskId}` as Route}
                      >
                        See what happened
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
        <div className="flex min-w-0 flex-col gap-6">
          {recapOpen ? (
            <RecapPanel
              contactId={contact._id}
              contactName={contact.name}
              onClose={() => setRecapOpen(false)}
            />
          ) : null}
          {explaining === null ? null : (
            <ExplanationPanel
              key={explaining}
              onClose={() => setExplaining(null)}
              onUseReply={(suggestion) => {
                setBody(suggestion);
                setFromSuggestion(true);
                setNotice(
                  "Reply added to your message. You can change it before reviewing."
                );
                bodyRef.current?.focus();
              }}
              source={{ messageId: explaining }}
            />
          )}
          <section
            aria-labelledby="write-heading"
            className="bg-surface flex min-w-0 flex-col gap-4 rounded-xl px-5 py-6"
          >
            <h2 className="text-2xl leading-8 font-semibold" id="write-heading">
              Write to {firstName}
            </h2>
            <form
              className="flex flex-col gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);

                try {
                  const taskId = await draft({
                    body,
                    contactId: contact._id,
                    photoIds: photos.map((photo) => photo.id),
                    startedFrom: fromSuggestion ? "suggestion" : undefined,
                  });

                  setBody("");
                  setPhotos([]);
                  setFromSuggestion(false);
                  setNotice("");
                  // SAFETY: the mutation just returned this task id, and /tasks/[taskId] is a real route.
                  router.push(`/tasks/${taskId}` as Route);
                } catch (error) {
                  toast.error(messageOf(error instanceof Error ? error : null));
                }

                setBusy(false);
              }}
            >
              <Label htmlFor={bodyId}>Your message</Label>
              <Textarea
                className="bg-raised"
                id={bodyId}
                onChange={(event) => {
                  setBody(event.target.value);

                  if (event.target.value.trim().length === 0) {
                    setFromSuggestion(false);
                  }
                }}
                ref={bodyRef}
                rows={5}
                value={body}
              />
              <output aria-live="polite" className="text-base">
                {notice}
              </output>
              {photos.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {photos.map((photo) => (
                    <li
                      className="bg-raised flex items-center justify-between gap-2 rounded-lg px-4 py-2 text-base"
                      key={photo.id}
                    >
                      <span className="truncate">{photo.name}</span>
                      <Button
                        aria-label={`Remove ${photo.name}`}
                        onClick={() =>
                          setPhotos((existing) =>
                            existing.filter((item) => item.id !== photo.id)
                          )
                        }
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <XIcon />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <input
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="sr-only"
                multiple
                onChange={(event) => {
                  void addPhotos(event.target.files);
                }}
                ref={fileInput}
                tabIndex={-1}
                type="file"
              />
              <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  className="max-w-full py-3 whitespace-normal"
                  disabled={photos.length >= MAX_PHOTOS}
                  onClick={() => fileInput.current?.click()}
                  type="button"
                  variant="outline"
                >
                  <ImagePlusIcon />
                  Add a photo
                </Button>
                <Button
                  aria-busy={busy}
                  className="max-w-full py-3 whitespace-normal"
                  disabled={
                    busy ||
                    (body.trim().length === 0 && photos.length === 0) ||
                    !preferred
                  }
                  type="submit"
                >
                  Review before sending
                </Button>
              </div>
              <MessageGuidance
                firstName={firstName}
                hasChannel={Boolean(preferred)}
                photoCount={photos.length}
                practice={Boolean(me?.profile?.demoMode)}
              />
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export { ThreadScreen };
