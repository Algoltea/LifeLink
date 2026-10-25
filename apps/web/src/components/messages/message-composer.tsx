"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { useMutation } from "convex/react";
import {
  ArrowUpIcon,
  ImageIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import type { RefObject } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { currentMessages, useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";

const MAX_PHOTOS = 4;

const uploadResultSchema = z.object({ storageId: z.string() });

interface PendingPhoto {
  id: Id<"photos">;
  name: string;
}

interface MessageDraft {
  body: string;
  fromSuggestion: boolean;
  notice: "reply_added" | null;
}

const EMPTY_DRAFT: MessageDraft = {
  body: "",
  fromSuggestion: false,
  notice: null,
};

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

/**
 * Write in the same rounded composer as Ask. The Review button never sends:
 * it prepares the message and opens the review step, where the person sees
 * exactly what goes out and approves it.
 */
const MessageComposer = ({
  canReach,
  contactId,
  draft,
  firstName,
  inputRef,
  onDraftChange,
  practice,
}: {
  canReach: boolean;
  contactId: Id<"contacts">;
  draft: MessageDraft;
  firstName: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onDraftChange: (draft: MessageDraft) => void;
  practice: boolean;
}) => {
  const uploadUrl = useMutation(api.messages.generatePhotoUploadUrl);
  const registerPhoto = useMutation(api.messages.registerPhoto);
  const prepare = useMutation(api.messages.draft);
  const router = useRouter();
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const hintId = useId();
  const t = useMessages().threads;

  const addPhotos = async (files: FileList | null): Promise<void> => {
    if (files === null) {
      return;
    }

    setUploading(true);

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
          contactId,
          storageId: uploaded.storageId as Id<"_storage">,
        });

        if (photoId === null) {
          toast.error(currentMessages().threads.photoInvalid(file.name));
        } else {
          setPhotos((existing) => [
            ...existing,
            { id: photoId, name: file.name },
          ]);
        }
      } catch (error) {
        toast.error(`${file.name}: ${errorText(error)}`);
      }
    }

    setUploading(false);

    if (fileInput.current) {
      fileInput.current.value = "";
    }
  };

  const empty = draft.body.trim().length === 0 && photos.length === 0;

  return (
    <form
      aria-label={t.writeTo(firstName)}
      className="@container/composer flex shrink-0 flex-col gap-2.5"
      data-chat-composer=""
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);

        try {
          const taskId = await prepare({
            body: draft.body,
            contactId,
            photoIds: photos.map((photo) => photo.id),
            startedFrom: draft.fromSuggestion ? "suggestion" : undefined,
          });

          onDraftChange(EMPTY_DRAFT);
          setPhotos([]);
          // SAFETY: the mutation just returned this task id, and /tasks/[taskId] is a real route.
          router.push(`/tasks/${taskId}` as Route);
        } catch (error) {
          toast.error(errorText(error));
        }

        setBusy(false);
      }}
    >
      <div className="border-border bg-raised focus-within:outline-ring contrast:border-control flex flex-col gap-1.5 rounded-[1.333rem] border py-2.5 pr-2.5 pl-4 shadow-[0_1px_2px_rgb(45_33_24/0.04),0_8px_24px_rgb(45_33_24/0.06)] focus-within:outline-3 focus-within:outline-offset-3 sm:gap-2 sm:py-3 sm:pr-3 sm:pl-5">
        <label className="sr-only" htmlFor={inputId}>
          {t.messageTo(firstName)}
        </label>
        <textarea
          aria-describedby={hintId}
          className="placeholder:text-muted-foreground field-sizing-content max-h-32 min-h-[1.778rem] w-full resize-none overflow-y-auto bg-transparent pt-0.5 text-lg leading-relaxed outline-none sm:max-h-48"
          id={inputId}
          onChange={(event) =>
            onDraftChange({
              body: event.target.value,
              fromSuggestion:
                draft.fromSuggestion && event.target.value.trim().length > 0,
              notice: draft.notice,
            })
          }
          placeholder={t.writeToPlaceholder(firstName)}
          ref={inputRef}
          rows={1}
          value={draft.body}
        />
        {photos.length > 0 ? (
          <ul aria-label={t.photosToSend} className="flex flex-wrap gap-2">
            {photos.map((photo) => (
              <li
                className="bg-parchment flex max-w-full min-w-0 items-center gap-2 rounded-full py-0 pr-0 pl-4 text-base"
                key={photo.id}
              >
                <ImageIcon
                  aria-hidden="true"
                  className="text-muted-foreground size-[1.125rem] shrink-0"
                />
                <span className="truncate">{photo.name}</span>
                <Button
                  aria-label={t.removePhoto(photo.name)}
                  className="rounded-full"
                  onClick={() =>
                    setPhotos((existing) =>
                      existing.filter((item) => item.id !== photo.id)
                    )
                  }
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <XIcon aria-hidden="true" />
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            aria-busy={uploading}
            className="border-border text-label hover:bg-parchment min-h-control -ml-2 inline-flex items-center gap-2 rounded-full border pr-4 pl-3 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
            disabled={uploading || photos.length >= MAX_PHOTOS}
            onClick={() => fileInput.current?.click()}
            type="button"
          >
            {uploading ? (
              <LoaderCircleIcon
                aria-hidden="true"
                className="size-5 motion-safe:animate-spin"
              />
            ) : (
              <ImagePlusIcon aria-hidden="true" className="size-5" />
            )}
            {uploading ? t.addingPhoto : t.addPhoto}
          </button>
          <Button
            aria-busy={busy}
            aria-label={busy ? t.preparingMessage : t.reviewBeforeSending}
            className="ml-auto rounded-full py-1 pr-1.5 pl-4 text-[0.889rem] disabled:border-transparent sm:pl-5"
            disabled={busy || uploading || empty || !canReach}
            type="submit"
          >
            {busy ? (
              t.preparing
            ) : (
              <span>
                {t.review}
                <span className="hidden @md/composer:inline">
                  {t.reviewBeforeSendingTail}
                </span>
              </span>
            )}
            <span
              aria-hidden="true"
              className="bg-primary-foreground/20 flex size-8 items-center justify-center rounded-full"
            >
              {busy ? (
                <LoaderCircleIcon className="size-[1.125rem] motion-safe:animate-spin" />
              ) : (
                <ArrowUpIcon className="size-[1.125rem]" />
              )}
            </span>
          </Button>
        </div>
      </div>
      <output aria-live="polite" className="text-label empty:hidden">
        {draft.notice === "reply_added" ? t.replyAdded : null}
      </output>
      <div
        className="text-muted-foreground text-label flex flex-col items-center gap-1 text-center"
        id={hintId}
      >
        <p>
          {practice
            ? t.practiceNothingSent(firstName)
            : t.nothingSentUntilApproved}
        </p>
        {canReach ? null : (
          <Link
            className="text-foreground min-h-control inline-flex items-center underline underline-offset-4"
            href="/circle"
          >
            {t.addWayToReach(firstName)}
          </Link>
        )}
        {photos.length >= MAX_PHOTOS ? <p>{t.maxPhotos(MAX_PHOTOS)}</p> : null}
      </div>
    </form>
  );
};

export { EMPTY_DRAFT, MessageComposer };

export type { MessageDraft };
