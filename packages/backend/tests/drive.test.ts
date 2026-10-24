import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import { formatWhen } from "../convex/lib/time";
import { DAY, newBackend, onlyAction, signUp } from "./harness";
import type { Backend, Person } from "./harness";

const connectionOf = async (
  backend: Backend,
  ownerId: Id<"profiles">,
  provider: string
): Promise<Id<"connections">> => {
  const connection = await backend.run(
    async (ctx) =>
      await ctx.db
        .query("connections")
        .withIndex("by_owner_provider", (index) =>
          index.eq("ownerId", ownerId).eq("provider", provider)
        )
        .first()
  );

  if (connection === null) {
    throw new Error(`Expected a ${provider} connection.`);
  }

  return connection._id;
};

const practiceOwnerWithAppointment = async (backend: Backend) => {
  const { id, person } = await signUp(backend, {
    demo: true,
    name: "Ruth Alvarez",
    role: "owner",
    subject: "owner-1",
  });

  const startsAt = Date.now() + 2 * DAY;

  const appointmentId = await person.mutation(api.appointments.create, {
    location: "12 Main Street",
    notes: "Bring the medication list.",
    startsAt,
    title: "Eye doctor",
  });

  return { appointmentId, owner: person, ownerId: id, startsAt };
};

const listPage = async (
  owner: Person,
  cursor: string | null,
  sort:
    | "folders_first"
    | "name_asc"
    | "name_desc"
    | "oldest"
    | "recent" = "recent"
) => await owner.action(api.drive.files, { cursor, search: null, sort });

const connectPracticeDrive = async (owner: Person): Promise<void> => {
  await owner.mutation(api.connections.connectPractice, {
    provider: "google_drive",
  });
};

type Page = Awaited<ReturnType<typeof listPage>>;

/** Follow cursors until the last page; each request depends on the one before. */
type Sort = Parameters<typeof listPage>[2];

const allPages = async (
  owner: Person,
  sort: Sort = "recent",
  cursor: string | null = null
): Promise<Page[]> => {
  const page = await listPage(owner, cursor, sort);

  return page.nextCursor === null
    ? [page]
    : [page, ...(await allPages(owner, sort, page.nextCursor))];
};

const byName = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const inOrder = <Item>(
  items: Item[],
  compare: (first: Item, second: Item) => number
): boolean =>
  items.slice(1).every((item, index) => {
    const previous = items[index];

    return previous === undefined || compare(previous, item) <= 0;
  });

const propose = async (
  owner: Person,
  appointmentId: Id<"appointments">,
  connectionId: Id<"connections">
) =>
  await owner.mutation(api.appointments.proposeDriveNote, {
    appointmentId,
    connectionId,
  });

describe("saving appointment notes to Google Drive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("proposes the appointment's details and runs as practice after approval", async () => {
    const backend = newBackend();

    const { appointmentId, owner, ownerId, startsAt } =
      await practiceOwnerWithAppointment(backend);

    await owner.mutation(api.connections.connectPractice, {
      provider: "google_drive",
    });

    const taskId = await propose(
      owner,
      appointmentId,
      await connectionOf(backend, ownerId, "google_drive")
    );

    const { current, view } = await onlyAction(owner, taskId);

    const when = formatWhen(startsAt, "America/New_York");

    expect(current.details).toMatchObject({
      body: [
        "Eye doctor",
        `When: ${when}`,
        "Where: 12 Main Street",
        "Notes: Bring the medication list.",
      ].join("\n"),
      kind: "drive_note",
      title: `Eye doctor (${when})`,
    });

    await owner.mutation(api.actions.approve, {
      actionId: view.action._id,
      fingerprint: current.fingerprint,
      method: "tap",
      version: current.version,
    });
    await backend.finishAllScheduledFunctions(vi.runAllTimers);

    const done = await onlyAction(owner, taskId);

    expect(done.view.action.status).toBe("succeeded");
    expect(done.detail.task.status).toBe("completed");

    const drive = await owner.action(api.drive.files, {
      cursor: null,
      search: "eye doctor",
      sort: "recent",
    });

    expect(drive.files).toMatchObject([
      { kind: "Document", name: `Eye doctor (${when})`, url: null },
    ]);
  });

  it("refuses a connection that is not Google Drive", async () => {
    const backend = newBackend();

    const { appointmentId, owner, ownerId } =
      await practiceOwnerWithAppointment(backend);

    await owner.mutation(api.connections.connectPractice, {
      provider: "google_calendar",
    });

    await expect(
      propose(
        owner,
        appointmentId,
        await connectionOf(backend, ownerId, "google_calendar")
      )
    ).rejects.toThrow("Choose a Google Drive connection.");
  });

  it("pages through the whole practice Drive once it is connected", async () => {
    const backend = newBackend();
    const { owner } = await practiceOwnerWithAppointment(backend);

    await expect(listPage(owner, null)).rejects.toThrow(
      "Google Drive is not connected."
    );

    await connectPracticeDrive(owner);

    const pages = await allPages(owner);
    const files = pages.flatMap((page) => page.files);

    expect(files).toHaveLength(116);
    expect(
      pages.every(
        (page, index) =>
          page.files.length === (index === pages.length - 1 ? 8 : 12)
      )
    ).toBeTruthy();
    expect(new Set(files.map((file) => file.id)).size).toBe(files.length);
    expect(
      files.every((file) => file.url === null && pages[0]?.mode === "simulated")
    ).toBeTruthy();
  });

  it("previews long documents, pictures, and folders, and searches by name", async () => {
    const backend = newBackend();
    const { owner } = await practiceOwnerWithAppointment(backend);

    await connectPracticeDrive(owner);

    const pages = await allPages(owner);
    const files = pages.flatMap((page) => page.files);

    const longest = Math.max(
      ...files.map((file) =>
        file.preview.type === "text" ? file.preview.text.length : 0
      )
    );

    expect(longest).toBeGreaterThan(2000);
    expect(
      files.find((file) => file.kind === "Picture")?.preview
    ).toMatchObject({
      src: expect.stringMatching(/^\/practice\/.+\.svg$/u),
      type: "image",
    });
    expect(files.find((file) => file.kind === "Folder")?.preview.type).toBe(
      "text"
    );

    const found = await owner.action(api.drive.files, {
      cursor: null,
      search: "  MEDIC ",
      sort: "recent",
    });

    expect(found.files.map((file) => file.name)).toStrictEqual([
      "Medication list",
      "Medicare summary notice, July to September.pdf",
    ]);
    expect(found.nextCursor).toBeNull();
  });

  it("sorts the whole practice Drive by time, by name, and with folders first", async () => {
    const backend = newBackend();
    const { owner } = await practiceOwnerWithAppointment(backend);

    await connectPracticeDrive(owner);

    const filesIn = async (sort: Sort) => {
      const pages = await allPages(owner, sort);

      return pages.flatMap((page) => page.files);
    };

    const [byNameAsc, byNameDesc, oldest, foldersFirst] = await Promise.all([
      filesIn("name_asc"),
      filesIn("name_desc"),
      filesIn("oldest"),
      filesIn("folders_first"),
    ]);

    expect(
      inOrder(byNameAsc, (first, second) =>
        byName.compare(first.name, second.name)
      )
    ).toBeTruthy();
    expect(byNameDesc.map((file) => file.name)).toStrictEqual(
      byNameAsc.map((file) => file.name).toReversed()
    );
    expect(
      inOrder(
        oldest,
        (first, second) => (first.modifiedAt ?? 0) - (second.modifiedAt ?? 0)
      )
    ).toBeTruthy();
    expect(
      inOrder(
        foldersFirst,
        (first, second) =>
          Number(second.kind === "Folder") - Number(first.kind === "Folder") ||
          byName.compare(first.name, second.name)
      ) && foldersFirst[0]?.kind === "Folder"
    ).toBeTruthy();
  });
});
