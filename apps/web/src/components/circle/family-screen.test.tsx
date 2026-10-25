// @vitest-environment happy-dom

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { getFunctionName } from "convex/server";
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { messagesFor, setLocale } from "@/i18n/locale";

import { FamilyScreen } from "./family-screen";

describe("family invitation entry", () => {
  let client: ConvexReactClient;
  let container: HTMLDivElement;
  let root: Root;

  const input = (): HTMLInputElement => {
    const found = container.querySelector("input");

    if (found === null) {
      throw new Error("Invitation input is missing");
    }

    return found;
  };

  const connect = (): HTMLButtonElement => {
    const found = container.querySelector("button[type=submit]");

    if (!(found instanceof HTMLButtonElement)) {
      throw new Error("Connect button is missing");
    }

    return found;
  };

  const enter = (code: string): void => {
    act(() => {
      const field = input();

      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set;

      setter?.call(field, code);
      field.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  const submit = async (): Promise<void> => {
    await act(async () => {
      connect().click();
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    setLocale("en");
    client = new ConvexReactClient("http://127.0.0.1:3210");
    vi.spyOn(client, "watchQuery").mockImplementation((...args) => {
      const [query] = args;

      if (getFunctionName(query) !== "sharing:sharedWithMe") {
        throw new Error(`Unexpected query ${getFunctionName(query)}`);
      }

      return {
        journal: () => {},
        localQueryLogs: () => [],
        localQueryResult: () => [],
        onUpdate: () => () => {},
      };
    });
    vi.spyOn(toast, "success").mockReturnValue("success");
    vi.spyOn(toast, "error").mockReturnValue("error");
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    act(() =>
      root.render(
        <ConvexProvider client={client}>
          <FamilyScreen />
        </ConvexProvider>
      )
    );
  });

  afterEach(async () => {
    act(() => root.unmount());
    await client.close();
    container.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("labels the code input and prevents empty submissions", async () => {
    const mutate = vi.spyOn(client, "mutation").mockResolvedValue(null);
    const field = input();

    expect(
      container.querySelector(`label[for="${field.id}"]`)?.textContent
    ).toBe(messagesFor("en").family.invitationCode);
    expect(
      container.querySelector(
        `[id="${field.getAttribute("aria-describedby")}"]`
      )?.textContent
    ).toBe(messagesFor("en").family.codeHint);
    expect(connect().disabled).toBeTruthy();
    enter("   ");
    await submit();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("sends the entered code and clears it only after successful redemption", async () => {
    const mutate = vi.spyOn(client, "mutation").mockResolvedValue(null);
    enter("abcde-f2345");
    await submit();

    expect(mutate).toHaveBeenCalledOnce();
    const [reference, args] = mutate.mock.calls[0] ?? [];
    expect(reference && getFunctionName(reference)).toBe(
      "sharing:acceptInvite"
    );
    expect(args).toStrictEqual({ code: "abcde-f2345" });
    expect({ code: input().value, disabled: connect().disabled }).toStrictEqual(
      {
        code: "",
        disabled: true,
      }
    );
    expect(toast.success).toHaveBeenCalledWith(
      messagesFor("en").family.connected
    );
  });

  it("keeps a rejected code available to correct and retry", async () => {
    const mutate = vi
      .spyOn(client, "mutation")
      .mockRejectedValueOnce(new Error("That code did not work."))
      .mockResolvedValueOnce(null);

    enter("WRONG-CODE2");
    await submit();

    expect({ code: input().value, disabled: connect().disabled }).toStrictEqual(
      {
        code: "WRONG-CODE2",
        disabled: false,
      }
    );
    expect(toast.error).toHaveBeenCalledOnce();
    expect(toast.success).not.toHaveBeenCalled();

    enter("ABCDE-F2345");
    await submit();
    expect({
      calls: mutate.mock.calls.length,
      code: input().value,
    }).toStrictEqual({
      calls: 2,
      code: "",
    });
    expect(toast.success).toHaveBeenCalledOnce();
  });
});
