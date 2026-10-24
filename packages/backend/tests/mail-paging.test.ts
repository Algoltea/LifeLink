import { afterEach, describe, expect, it, vi } from "vitest";

import type { executeTool } from "../convex/integrations/composio";
import { listRecentMail } from "../convex/integrations/mail";

const execute = vi.fn<typeof executeTool>();

const fetchPage = async (
  account: Parameters<typeof listRecentMail>[0],
  cursor: string | null = null
) => await listRecentMail(account, cursor, execute);

const account = {
  connectedAccountId: "mail-account",
  provider: "gmail" as const,
  userId: "owner",
};

describe("provider email pages", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("loads only 15 Gmail messages and follows its continuation token across all inbox dates", async () => {
    execute.mockResolvedValue({
      data: { messages: [{ messageId: "g1" }], nextPageToken: "next-page" },
      kind: "ok",
      logId: null,
    });
    const first = await fetchPage(account);
    await fetchPage(account, "next-page");
    expect(first).toMatchObject({ nextCursor: "next-page", ok: true });
    expect(execute).toHaveBeenNthCalledWith(
      1,
      "GMAIL_FETCH_EMAILS",
      "owner",
      "mail-account",
      {
        include_payload: false,
        max_results: 15,
        query: "in:inbox",
        verbose: true,
      }
    );
    expect(execute).toHaveBeenNthCalledWith(
      2,
      "GMAIL_FETCH_EMAILS",
      "owner",
      "mail-account",
      expect.objectContaining({ page_token: "next-page" })
    );
  });

  it("stops Gmail pagination at an empty token", async () => {
    execute.mockResolvedValue({
      data: { messages: [], nextPageToken: "" },
      kind: "ok",
      logId: null,
    });
    await expect(fetchPage(account, "last-page")).resolves.toMatchObject({
      messages: [],
      nextCursor: null,
    });
  });

  it("rejects a repeated continuation token instead of looping on the same batch", async () => {
    execute.mockResolvedValue({
      data: { messages: [], nextPageToken: "same-page" },
      kind: "ok",
      logId: null,
    });
    await expect(fetchPage(account, "same-page")).resolves.toMatchObject({
      ok: false,
    });
  });

  it("loads Outlook in ordered pages of 15 and stops on a short page", async () => {
    execute.mockResolvedValueOnce({
      data: {
        value: Array.from({ length: 15 }, (_, index) => ({
          id: `outlook-${index}`,
        })),
      },
      kind: "ok",
      logId: null,
    });
    const first = await fetchPage({ ...account, provider: "outlook" });
    execute.mockResolvedValueOnce({
      data: { value: [{ id: "last" }] },
      kind: "ok",
      logId: null,
    });

    const last = await fetchPage({ ...account, provider: "outlook" }, "15");

    expect(first).toMatchObject({ nextCursor: "15" });
    expect(last).toMatchObject({ nextCursor: null });
    expect(execute).toHaveBeenLastCalledWith(
      "OUTLOOK_LIST_MESSAGES",
      "owner",
      "mail-account",
      expect.objectContaining({
        orderby: ["receivedDateTime desc"],
        skip: 15,
        top: 15,
      })
    );
  });

  it("reports malformed pages and provider failures instead of claiming the inbox is empty", async () => {
    execute.mockResolvedValueOnce({
      data: { unexpected: "shape" },
      kind: "ok",
      logId: null,
    });
    await expect(fetchPage(account)).resolves.toMatchObject({ ok: false });
    execute.mockResolvedValueOnce({
      error: "Try reconnecting",
      kind: "rejected",
    });
    await expect(fetchPage(account)).resolves.toStrictEqual({
      error: "Try reconnecting",
      ok: false,
    });
  });
});
