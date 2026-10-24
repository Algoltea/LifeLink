/**
 * Google Drive through Composio. Notes are saved as Google Docs. The create
 * tool cannot attach custom properties, so an uncertain create is looked up by
 * its exact name among files created since the attempt began. Listing returns
 * names and links only; file contents are never read.
 */
import { z } from "zod";

import { MINUTE } from "../lib/time";
import { executeTool } from "./composio";
import type { ToolOutcome } from "./composio";
import type { JsonObject } from "./http";
import type { Reconciled } from "./mail";

interface DriveAccount {
  connectedAccountId: string;
  userId: string;
}

interface NewNote {
  body: string;
  title: string;
}

const GOOGLE_DOC = "application/vnd.google-apps.document";

/** Allowance for clock differences between Convex and Google. */
const CLOCK_SKEW_MS = 5 * MINUTE;

const createdFileSchema = z
  .object({
    id: z.string(),
    webViewLink: z.string().optional(),
  })
  .loose();

interface SavedNote {
  outcome: ToolOutcome;
  /** Where the person can open the document, when Google returned it. */
  url: string | null;
}

const saveNote = async (
  account: DriveAccount,
  note: NewNote
): Promise<SavedNote> => {
  const outcome = await executeTool(
    "GOOGLEDRIVE_CREATE_FILE_FROM_TEXT",
    account.userId,
    account.connectedAccountId,
    { file_name: note.title, mime_type: GOOGLE_DOC, text_content: note.body }
  );

  const created =
    outcome.kind === "ok" ? createdFileSchema.safeParse(outcome.data) : null;

  if (!created?.success) {
    return { outcome, url: null };
  }

  return {
    outcome,
    url:
      created.data.webViewLink ??
      `https://docs.google.com/document/d/${encodeURIComponent(created.data.id)}/edit`,
  };
};

/** Drive query strings quote with single quotes and escape with backslashes. */
const quoted = (value: string): string =>
  `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;

const filesSchema = z
  .object({ files: z.array(z.object({ id: z.string() }).loose()).optional() })
  .loose();

const findNote = async (
  account: DriveAccount,
  title: string,
  sinceMs: number
): Promise<Reconciled> => {
  const outcome = await executeTool(
    "GOOGLEDRIVE_FIND_FILE",
    account.userId,
    account.connectedAccountId,
    {
      pageSize: 1,
      q: `name = ${quoted(title)} and createdTime >= ${quoted(new Date(sinceMs - CLOCK_SKEW_MS).toISOString())} and trashed = false`,
    }
  );

  if (outcome.kind !== "ok") {
    return "cannot_tell";
  }

  const parsed = filesSchema.safeParse(outcome.data);

  if (!parsed.success) {
    return "cannot_tell";
  }

  return (parsed.data.files ?? []).length > 0 ? "found" : "not_found";
};

const listedFilesSchema = z
  .object({
    files: z
      .array(
        z
          .object({
            id: z.string(),
            mimeType: z.string().optional(),
            modifiedTime: z.string().optional(),
            name: z.string().optional(),
            webViewLink: z.string().optional(),
          })
          .loose()
      )
      .optional(),
    nextPageToken: z.string().optional(),
  })
  .loose();

interface DriveFile {
  id: string;
  mimeType: string;
  modifiedAt: number | null;
  name: string;
  url: string | null;
}

interface ListRequest {
  /** A Drive `orderBy` value, such as "modifiedTime desc". */
  orderBy: string;
  pageSize: number;
  pageToken: string | null;
  search: string | null;
}

type ListResult =
  | { error: string; ok: false }
  | { files: DriveFile[]; nextPageToken: string | null; ok: true };

/** One page of files in the requested order, optionally only names containing `search`. */
const listFiles = async (
  account: DriveAccount,
  listing: ListRequest
): Promise<ListResult> => {
  const nameFilter =
    listing.search === null
      ? ""
      : ` and name contains ${quoted(listing.search)}`;

  const query: JsonObject = {
    fields: "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink)",
    orderBy: listing.orderBy,
    pageSize: listing.pageSize,
    q: `trashed = false${nameFilter}`,
  };

  if (listing.pageToken !== null) {
    query.pageToken = listing.pageToken;
  }

  const outcome = await executeTool(
    "GOOGLEDRIVE_FIND_FILE",
    account.userId,
    account.connectedAccountId,
    query
  );

  if (outcome.kind !== "ok") {
    return { error: outcome.error, ok: false };
  }

  const parsed = listedFilesSchema.safeParse(outcome.data);

  if (!parsed.success) {
    return { error: "Google Drive's answer could not be read.", ok: false };
  }

  return {
    files: (parsed.data.files ?? []).map((file) => {
      const modifiedAt = Date.parse(file.modifiedTime ?? "");

      return {
        id: file.id,
        mimeType: file.mimeType ?? "",
        modifiedAt: Number.isNaN(modifiedAt) ? null : modifiedAt,
        name: file.name ?? "Untitled",
        url: file.webViewLink ?? null,
      };
    }),
    nextPageToken: parsed.data.nextPageToken ?? null,
    ok: true,
  };
};

export { findNote, listFiles, saveNote };

export type {
  DriveAccount,
  DriveFile,
  ListRequest,
  ListResult,
  NewNote,
  SavedNote,
};
