"use client";

import type { api } from "@lifelink/backend/convex/_generated/api";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import type { FunctionReturnType } from "convex/server";
import { ExternalLinkIcon, InfoIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useEffectEvent, useId, useRef } from "react";
import type { ReactNode } from "react";

import { ReadAloudButton, SimulatedPill } from "@/components/app/bits";
import { IsoIcon, fileIconFor } from "@/components/app/iso-icon";
import { formatWhen } from "@/lib/format";

type Listing = FunctionReturnType<typeof api.drive.files>;

type DriveFile = Listing["files"][number];

const PREVIEW_IMAGE_WIDTH = 900;
const PREVIEW_IMAGE_HEIGHT = 640;
const HEADER_ICON_SIZE = 56;

/** A quiet aside under an action or a preview, like the email links note. */
const InfoLine = ({ children, id }: { children: ReactNode; id?: string }) => (
  <p
    className="text-muted-foreground text-label flex max-w-prose items-start gap-2.5"
    id={id}
  >
    <InfoIcon aria-hidden="true" className="mt-0.5 size-[1.125rem] shrink-0" />
    <span>{children}</span>
  </p>
);

const PreviewWindow = ({ file }: { file: DriveFile }) => {
  const { preview } = file;

  switch (preview.type) {
    case "text": {
      return (
        <section
          aria-label={`What ${file.name} says`}
          className="border-border bg-raised max-h-[32rem] max-w-prose overflow-y-auto rounded-xl border px-6 py-5 leading-relaxed wrap-anywhere whitespace-pre-wrap"
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users must be able to scroll a long document inside its window.
          tabIndex={0}
        >
          {preview.text}
        </section>
      );
    }

    case "image": {
      return (
        <figure className="flex flex-col gap-2">
          <Image
            alt={preview.alt}
            className="border-border bg-raised h-auto w-full rounded-xl border"
            height={PREVIEW_IMAGE_HEIGHT}
            src={preview.src}
            unoptimized
            width={PREVIEW_IMAGE_WIDTH}
          />
          <figcaption className="text-muted-foreground text-label">
            {preview.alt}
          </figcaption>
        </figure>
      );
    }

    case "embed": {
      return (
        <div className="flex flex-col gap-3">
          <iframe
            allow="fullscreen"
            className="border-border bg-raised h-[32rem] w-full rounded-xl border"
            loading="lazy"
            referrerPolicy="no-referrer"
            // oxlint-disable-next-line react/iframe-missing-sandbox -- Google's viewer needs scripts and its own cookies; the frame is cross-origin, so it still cannot reach LifeLink.
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            src={preview.src}
            title={`Preview of ${file.name} from Google Drive`}
          />
          <InfoLine>
            Google shows this preview directly. If it asks you to sign in, use
            the same Google account you connected, or open the file in Google
            Drive.
          </InfoLine>
        </div>
      );
    }

    case "none": {
      return (
        <p className="bg-parchment max-w-prose rounded-xl px-5 py-4">
          Folders cannot be previewed here. Open it in Google Drive to see what
          is inside.
        </p>
      );
    }

    default: {
      return preview satisfies never;
    }
  }
};

/** Opens the file in Drive, or explains why it can't, without leaving a dead end. */
const OpenInDrive = ({ file, noteId }: { file: DriveFile; noteId: string }) => {
  if (file.url !== null) {
    return (
      <a
        className={buttonVariants({ size: "sm" })}
        href={file.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        Open in Google Drive
        <ExternalLinkIcon aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Button aria-describedby={noteId} disabled size="sm" variant="outline">
      Open in Google Drive
      <ExternalLinkIcon aria-hidden="true" />
    </Button>
  );
};

/** One file, shown like the email reader: what it is, what you can do, then the file itself. */
const FilePreview = ({
  file,
  isPractice,
  listStaysBeside,
  timeZone,
}: {
  file: DriveFile;
  isPractice: boolean;
  /** True when the file list is still showing, so focus stays on its row. */
  listStaysBeside: () => boolean;
  timeZone: string;
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const noteId = useId();
  const { preview } = file;
  const hasLink = file.url !== null;

  // When the preview replaces the list, land on the file's name, so keyboard
  // and screen reader users start here.
  const landOnName = useEffectEvent(() => {
    const heading = headingRef.current;

    if (heading === null || listStaysBeside()) {
      return;
    }

    heading.focus({ preventScroll: true });

    if (heading.getBoundingClientRect().top < 0) {
      heading.scrollIntoView({ block: "start" });
    }
  });

  useEffect(() => {
    landOnName();
  }, []);

  const readAloud =
    preview.type === "text" ? (
      <ReadAloudButton
        label="Read aloud"
        text={`${file.name}. ${preview.text}`}
      />
    ) : null;

  const openInDrive = <OpenInDrive file={file} noteId={noteId} />;

  return (
    <article
      aria-labelledby="preview-heading"
      className="text-foreground flex min-w-0 flex-col gap-5"
    >
      <header className="flex items-start gap-4 sm:items-center">
        <IsoIcon
          className="shrink-0"
          kind={fileIconFor(file.kind)}
          size={HEADER_ICON_SIZE}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <h2
            className="text-section sm:text-mobile-title leading-tight font-semibold tracking-tight wrap-anywhere outline-none"
            id="preview-heading"
            ref={headingRef}
            tabIndex={-1}
          >
            <span className="sr-only">Preview: </span>
            {file.name}
          </h2>
          <p className="text-muted-foreground text-label flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span>
              {file.kind}
              {file.modifiedAt === null
                ? ""
                : ` · Changed ${formatWhen(file.modifiedAt, timeZone)}`}
            </span>
            {isPractice ? <SimulatedPill /> : null}
          </p>
        </div>
      </header>

      <div className="border-rule flex flex-col gap-3 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {hasLink ? openInDrive : readAloud}
          {hasLink ? readAloud : openInDrive}
        </div>
        {hasLink ? null : (
          <InfoLine id={noteId}>
            {isPractice
              ? "Practice files live only in LifeLink, so they can’t be opened in Google Drive. With your real Drive connected, this button opens the file there."
              : "Google Drive did not share a link for this file. Open Google Drive and search for it by name."}
          </InfoLine>
        )}
      </div>

      <PreviewWindow file={file} />
    </article>
  );
};

export { FilePreview };

export type { DriveFile, Listing };
