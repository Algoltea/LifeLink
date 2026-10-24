/**
 * Files the person already keeps in their own Google Drive, a page at a time.
 * Live listings are fetched on request and never stored; LifeLink reads only
 * names, types, and links. Previews of real files use Google's own viewer in
 * the person's browser, so file contents never pass through LifeLink.
 * Practice mode shows a sample Drive, plus any notes saved there in practice.
 */
import { ConvexError, v } from "convex/values";
import type { Infer } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { action, internalQuery } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { listFiles } from "./integrations/drive";
import type { DriveFile } from "./integrations/drive";
import {
  DOCUMENT,
  FOLDER,
  practiceDriveFiles,
  SPREADSHEET,
} from "./lib/sampledrive";
import type { PracticeFile } from "./lib/sampledrive";

const MAX_SEARCH_LENGTH = 100;
const PAGE_SIZE = 12;
const PRACTICE_NOTE_LIMIT = 20;
const PRACTICE_CURSOR = /^practice:(?<offset>\d+)$/u;
const PRESENTATION = "application/vnd.google-apps.presentation";

const KIND_BY_MIME_TYPE = new Map([
  ["application/pdf", "PDF"],
  [PRESENTATION, "Slides"],
  [DOCUMENT, "Document"],
  [FOLDER, "Folder"],
  [SPREADSHEET, "Spreadsheet"],
]);

const kindOf = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) {
    return "Picture";
  }

  return KIND_BY_MIME_TYPE.get(mimeType) ?? "File";
};

const previewValidator = v.union(
  v.object({ text: v.string(), type: v.literal("text") }),
  v.object({ alt: v.string(), src: v.string(), type: v.literal("image") }),
  v.object({ src: v.string(), type: v.literal("embed") }),
  v.object({ type: v.literal("none") })
);

type Preview = Infer<typeof previewValidator>;

const fileValidator = v.object({
  id: v.string(),
  kind: v.string(),
  modifiedAt: v.union(v.number(), v.null()),
  name: v.string(),
  preview: previewValidator,
  url: v.union(v.string(), v.null()),
});

type ListedFile = Infer<typeof fileValidator>;

const sortValidator = v.union(
  v.literal("recent"),
  v.literal("oldest"),
  v.literal("name_asc"),
  v.literal("name_desc"),
  v.literal("folders_first")
);

type Sort = Infer<typeof sortValidator>;

/** Drive's `orderBy` for each sort; folders-first keeps names in order within each group. */
const DRIVE_ORDER: Record<Sort, string> = {
  folders_first: "folder,name_natural",
  name_asc: "name_natural",
  name_desc: "name_natural desc",
  oldest: "modifiedTime",
  recent: "modifiedTime desc",
};

const byName = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const PRACTICE_ORDER: Record<
  Sort,
  (first: PracticeFile, second: PracticeFile) => number
> = {
  folders_first: (first, second) =>
    Number(second.mimeType === FOLDER) - Number(first.mimeType === FOLDER) ||
    byName.compare(first.name, second.name),
  name_asc: (first, second) => byName.compare(first.name, second.name),
  name_desc: (first, second) => byName.compare(second.name, first.name),
  oldest: (first, second) => first.modifiedAt - second.modifiedAt,
  recent: (first, second) => second.modifiedAt - first.modifiedAt,
};

interface Page {
  files: ListedFile[];
  mode: "live" | "simulated";
  nextCursor: string | null;
}

const EDITOR_PATH_BY_MIME_TYPE = new Map([
  [DOCUMENT, "document"],
  [PRESENTATION, "presentation"],
  [SPREADSHEET, "spreadsheets"],
]);

/** Google's own preview page for a file, framed in the person's browser. */
const previewOf = (file: DriveFile): Preview => {
  if (file.mimeType === FOLDER) {
    return { type: "none" };
  }

  const id = encodeURIComponent(file.id);
  const editorPath = EDITOR_PATH_BY_MIME_TYPE.get(file.mimeType);

  return {
    src:
      editorPath === undefined
        ? `https://drive.google.com/file/d/${id}/preview`
        : `https://docs.google.com/${editorPath}/d/${id}/preview`,
    type: "embed",
  };
};

/** Notes the person approved saving to Drive while in practice mode. */
const practiceNotes = async (
  ctx: QueryCtx,
  owner: Doc<"profiles">
): Promise<PracticeFile[]> => {
  const saved = await ctx.db
    .query("actions")
    .withIndex("by_owner_status", (index) =>
      index.eq("ownerId", owner._id).eq("status", "succeeded")
    )
    .filter((row) =>
      row.and(
        row.eq(row.field("kind"), "drive_note"),
        row.eq(row.field("mode"), "simulated")
      )
    )
    .order("desc")
    .take(PRACTICE_NOTE_LIMIT);

  const notes = await Promise.all(
    saved.map(async (row) => {
      const version = await ctx.db
        .query("actionVersions")
        .withIndex("by_action_version", (index) =>
          index.eq("actionId", row._id).eq("version", row.currentVersion)
        )
        .unique();

      return version?.details.kind === "drive_note"
        ? {
            content: { text: version.details.body, type: "text" as const },
            mimeType: DOCUMENT,
            modifiedAt: row.updatedAt,
            name: version.details.title,
          }
        : null;
    })
  );

  return notes.filter((note) => note !== null);
};

interface PracticeRequest {
  cursor: string | null;
  search: string | null;
  sort: Sort;
}

const practicePage = (
  notes: PracticeFile[],
  { cursor, search, sort }: PracticeRequest
): Page => {
  const offset = Number(
    PRACTICE_CURSOR.exec(cursor ?? "")?.groups?.offset ?? 0
  );

  const needle = search?.toLowerCase() ?? null;

  const matching = [...notes, ...practiceDriveFiles(Date.now())]
    .filter(
      (file) => needle === null || file.name.toLowerCase().includes(needle)
    )
    .toSorted(PRACTICE_ORDER[sort]);

  const end = offset + PAGE_SIZE;

  return {
    files: matching.slice(offset, end).map((file) => ({
      id: `practice-${file.modifiedAt}-${file.name}`,
      kind: kindOf(file.mimeType),
      modifiedAt: file.modifiedAt,
      name: file.name,
      preview: file.content,
      url: null,
    })),
    mode: "simulated",
    nextCursor: end < matching.length ? `practice:${end}` : null,
  };
};

interface DriveContext {
  connection: Pick<
    Doc<"connections">,
    "externalAccountId" | "mode" | "status"
  > | null;
  demoMode: boolean;
  ownerId: Id<"profiles">;
  practiceNotes: PracticeFile[];
}

export const driveContext = internalQuery({
  args: {},
  handler: async (ctx): Promise<DriveContext> => {
    const identity = await ctx.auth.getUserIdentity();

    const owner =
      identity === null
        ? null
        : await ctx.db
            .query("profiles")
            .withIndex("by_auth_user", (index) =>
              index.eq("authUserId", identity.subject)
            )
            .unique();

    if (owner?.role !== "owner") {
      throw new ConvexError({
        code: "not_signed_in",
        message: "Please sign in again.",
      });
    }

    const connection = await ctx.db
      .query("connections")
      .withIndex("by_owner_provider", (index) =>
        index.eq("ownerId", owner._id).eq("provider", "google_drive")
      )
      .first();

    return {
      connection:
        connection === null
          ? null
          : {
              externalAccountId: connection.externalAccountId,
              mode: connection.mode,
              status: connection.status,
            },
      demoMode: owner.demoMode,
      ownerId: owner._id,
      practiceNotes: owner.demoMode ? await practiceNotes(ctx, owner) : [],
    };
  },
});

/** One page of the person's Drive in the chosen order, optionally only names containing `search`. */
export const files = action({
  args: {
    cursor: v.union(v.string(), v.null()),
    search: v.union(v.string(), v.null()),
    sort: sortValidator,
  },
  handler: async (ctx, args): Promise<Page> => {
    const context: DriveContext = await ctx.runQuery(
      internal.drive.driveContext,
      {}
    );

    const search = args.search?.trim().slice(0, MAX_SEARCH_LENGTH) || null;
    const { connection } = context;

    if (connection === null || connection.status !== "active") {
      throw new ConvexError({
        code: "not_connected",
        message:
          connection === null
            ? "Google Drive is not connected. Connect it on the Connections screen."
            : "Google Drive needs attention. Reconnect it on the Connections screen.",
      });
    }

    if (context.demoMode) {
      return practicePage(context.practiceNotes, {
        cursor: args.cursor,
        search,
        sort: args.sort,
      });
    }

    if (connection.mode !== "live" || connection.externalAccountId === null) {
      throw new ConvexError({
        code: "not_connected",
        message:
          "This is a practice Google Drive. Connect your real Drive on the Connections screen.",
      });
    }

    const result = await listFiles(
      {
        connectedAccountId: connection.externalAccountId,
        userId: context.ownerId,
      },
      {
        orderBy: DRIVE_ORDER[args.sort],
        pageSize: PAGE_SIZE,
        pageToken: args.cursor,
        search,
      }
    );

    if (!result.ok) {
      throw new ConvexError({
        code: "provider_error",
        message: `Google Drive did not answer: ${result.error}`,
      });
    }

    return {
      files: result.files.map((file) => ({
        id: file.id,
        kind: kindOf(file.mimeType),
        modifiedAt: file.modifiedAt,
        name: file.name,
        preview: previewOf(file),
        url: file.url,
      })),
      mode: "live",
      nextCursor: result.nextPageToken,
    };
  },
  returns: v.object({
    files: v.array(fileValidator),
    mode: v.union(v.literal("live"), v.literal("simulated")),
    nextCursor: v.union(v.string(), v.null()),
  }),
});
