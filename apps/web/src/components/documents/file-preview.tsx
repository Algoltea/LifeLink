"use client";

import type { api } from "@lifelink/backend/convex/_generated/api";
import { Button, buttonVariants } from "@lifelink/ui/components/button";
import type { FunctionReturnType } from "convex/server";
import { ExternalLinkIcon } from "lucide-react";
import Image from "next/image";

import { SimulatedPill } from "@/components/app/bits";
import { formatWhen } from "@/lib/format";

type Listing = FunctionReturnType<typeof api.drive.files>;

type DriveFile = Listing["files"][number];

const PREVIEW_IMAGE_WIDTH = 900;
const PREVIEW_IMAGE_HEIGHT = 640;

const PreviewWindow = ({ file }: { file: DriveFile }) => {
  const { preview } = file;

  switch (preview.type) {
    case "text": {
      return (
        <section
          aria-label={`What ${file.name} says`}
          className="bg-background max-h-[32rem] overflow-y-auto rounded-md px-5 py-4 text-lg leading-relaxed wrap-anywhere whitespace-pre-wrap"
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
            className="bg-background h-auto w-full rounded-md"
            height={PREVIEW_IMAGE_HEIGHT}
            src={preview.src}
            unoptimized
            width={PREVIEW_IMAGE_WIDTH}
          />
          <figcaption className="text-muted-foreground text-base">
            {preview.alt}
          </figcaption>
        </figure>
      );
    }

    case "embed": {
      return (
        <div className="flex flex-col gap-2">
          <iframe
            allow="fullscreen"
            className="bg-background h-[32rem] w-full rounded-md border-0"
            loading="lazy"
            referrerPolicy="no-referrer"
            // oxlint-disable-next-line react/iframe-missing-sandbox -- Google's viewer needs scripts and its own cookies; the frame is cross-origin, so it still cannot reach LifeLink.
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            src={preview.src}
            title={`Preview of ${file.name} from Google Drive`}
          />
          <p className="text-muted-foreground text-base">
            Google shows this preview directly. If it asks you to sign in, use
            the same Google account you connected, or open the file in Google
            Drive.
          </p>
        </div>
      );
    }

    case "none": {
      return (
        <p className="bg-background rounded-md px-5 py-4 text-lg">
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

const OpenInDrive = ({
  file,
  isPractice,
}: {
  file: DriveFile;
  isPractice: boolean;
}) => {
  if (file.url !== null) {
    return (
      <a
        className={buttonVariants({ className: "self-start rounded-md" })}
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
    <div className="flex flex-col gap-2">
      <Button className="self-start rounded-md" disabled>
        Open in Google Drive
        <ExternalLinkIcon aria-hidden="true" />
      </Button>
      <p className="text-muted-foreground text-base">
        {isPractice
          ? "Practice files live only in LifeLink, so they cannot be opened in Google Drive. With your real Drive connected, this button opens the file there."
          : "Google Drive did not share a link for this file. Open Google Drive and search for it by name."}
      </p>
    </div>
  );
};

const FilePreview = ({
  file,
  isPractice,
  timeZone,
}: {
  file: DriveFile;
  isPractice: boolean;
  timeZone: string;
}) => (
  <article
    aria-labelledby="preview-heading"
    className="bg-surface text-foreground flex min-w-0 flex-col gap-4 rounded-xl px-5 py-5 lg:sticky lg:top-6"
  >
    <header className="flex flex-col gap-1">
      <p className="text-muted-foreground text-base">Preview</p>
      <h2 className="text-2xl font-semibold wrap-anywhere" id="preview-heading">
        {file.name}
      </h2>
      <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-base">
        <span>
          {file.kind}
          {file.modifiedAt === null
            ? ""
            : ` · Last changed ${formatWhen(file.modifiedAt, timeZone)}`}
        </span>
        {isPractice ? <SimulatedPill /> : null}
      </p>
    </header>
    <PreviewWindow file={file} />
    <OpenInDrive file={file} isPractice={isPractice} />
  </article>
);

export { FilePreview };

export type { DriveFile, Listing };
