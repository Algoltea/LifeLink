import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { readDeployment } from "./convex";
import { readEnvFile, updateEnvFile } from "./files";
import { checkPhoton } from "./providers";
import { typeKeys } from "./ui";
import {
  meetsMinimumVersion,
  MIN_BUN_VERSION,
  MIN_NODE_VERSION,
} from "./versions";

const scratch = (): string =>
  mkdtempSync(path.join(tmpdir(), "lifelink-setup-"));

const withBackendEnv = (contents: string): string => {
  const root = scratch();

  updateEnvFile(
    path.join(root, "packages", "backend", ".env.local"),
    new Map(),
    contents
  );

  return root;
};

describe("tool version requirements", () => {
  it("requires Bun 1.4 and accepts newer releases", () => {
    expect(meetsMinimumVersion("1.3.99", MIN_BUN_VERSION)).toBeFalsy();
    expect(meetsMinimumVersion("1.4.0", MIN_BUN_VERSION)).toBeTruthy();
    expect(meetsMinimumVersion("1.4.4", MIN_BUN_VERSION)).toBeTruthy();
    expect(meetsMinimumVersion("2.0.0", MIN_BUN_VERSION)).toBeTruthy();
  });

  it("requires the Node minor version needed by Ultracite", () => {
    expect(meetsMinimumVersion("v20.19.0", MIN_NODE_VERSION)).toBeFalsy();
    expect(meetsMinimumVersion("v22.17.99", MIN_NODE_VERSION)).toBeFalsy();
    expect(meetsMinimumVersion("v22.18.0", MIN_NODE_VERSION)).toBeTruthy();
    expect(meetsMinimumVersion("v22.18.1", MIN_NODE_VERSION)).toBeTruthy();
    expect(meetsMinimumVersion("v24.0.0", MIN_NODE_VERSION)).toBeTruthy();
  });

  it("rejects missing or malformed version output", () => {
    expect(meetsMinimumVersion("", MIN_NODE_VERSION)).toBeFalsy();
    expect(
      meetsMinimumVersion("command not found", MIN_NODE_VERSION)
    ).toBeFalsy();
    expect(meetsMinimumVersion("v22.18", MIN_NODE_VERSION)).toBeFalsy();
    expect(meetsMinimumVersion("v22.18.0-rc.1", MIN_NODE_VERSION)).toBeFalsy();
  });
});

describe("masked secret input", () => {
  it("collects a pasted value and stops at Enter", () => {
    expect(typeKeys("", "sk-or-abc\rignored")).toStrictEqual({
      cancelled: false,
      done: true,
      echo: "•••••••••",
      value: "sk-or-abc",
    });
  });

  it("handles backspace and ignores arrow keys", () => {
    const typed = typeKeys("ab", "c\u007F\u001B[Dd");

    expect(typed.value).toBe("abd");
    expect(typed.done).toBeFalsy();
  });

  it("reports Ctrl-C as a cancel", () => {
    expect(typeKeys("secret", "\u0003").cancelled).toBeTruthy();
  });
});

describe(".env updates", () => {
  it("keeps comments and other keys, and quotes values that need it", () => {
    const file = path.join(scratch(), ".env.local");

    writeFileSync(file, "# keep me\nOTHER=1\nNEXT_PUBLIC_CONVEX_URL=old\n");

    const changed = updateEnvFile(
      file,
      new Map([
        ["NEXT_PUBLIC_CONVEX_URL", "https://a.convex.cloud"],
        ["NOTE", "two words"],
      ]),
      "# header"
    );

    expect(changed).toStrictEqual(["NEXT_PUBLIC_CONVEX_URL", "NOTE"]);
    expect(readFileSync(file, "utf-8")).toBe(
      '# keep me\nOTHER=1\nNEXT_PUBLIC_CONVEX_URL=https://a.convex.cloud\nNOTE="two words"\n'
    );
    expect(readEnvFile(file).get("NOTE")).toBe("two words");
  });

  it("changes nothing on a rerun with the same values", () => {
    const file = path.join(scratch(), ".env.local");
    const values = new Map([["A", "1"]]);

    updateEnvFile(file, values, "# header");

    expect(updateEnvFile(file, values, "# header")).toStrictEqual([]);
  });
});

describe("Convex deployment detection", () => {
  it("recognises cloud, anonymous, and missing deployments", () => {
    const cloud = readDeployment(
      withBackendEnv(
        "CONVEX_DEPLOYMENT=dev:happy-otter-123\nCONVEX_URL=https://happy-otter-123.convex.cloud"
      )
    );

    expect(cloud).toStrictEqual({
      kind: "cloud",
      name: "happy-otter-123",
      siteUrl: "https://happy-otter-123.convex.site",
      url: "https://happy-otter-123.convex.cloud",
    });
    expect(
      readDeployment(
        withBackendEnv("CONVEX_DEPLOYMENT=anonymous:anonymous-agent")
      ).kind
    ).toBe("anonymous");
    expect(readDeployment(withBackendEnv("# nothing yet")).kind).toBe(
      "missing"
    );
  });
});

describe("Photon project validation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("checks project access with one read-only request and no line identity", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ data: [], succeed: true }));

    vi.stubGlobal("fetch", fetchMock);

    const result = await checkPhoton(
      "test-photon-key",
      "pho_prj_test/space here"
    );

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      "https://spectrum.photon.codes/projects/pho_prj_test%2Fspace%20here/webhooks/",
      {
        body: undefined,
        headers: {
          Authorization: `Basic ${Buffer.from("pho_prj_test/space here:test-photon-key").toString("base64")}`,
        },
        method: "GET",
        signal: expect.any(AbortSignal),
      }
    );
    expect(result).toStrictEqual({
      detail: "Spectrum Stable project credentials accepted",
      status: "ok",
    });
  });

  it.each([401, 403])(
    "reports HTTP %s without echoing provider response details",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(
            Response.json({ message: "rejected test-photon-key" }, { status })
          )
      );

      await expect(
        checkPhoton("test-photon-key", "pho_prj_test")
      ).resolves.toStrictEqual({
        detail: `Spectrum Stable rejected the key (HTTP ${status})`,
        status: "rejected",
      });
    }
  );

  it("leaves project access unverified when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("network unavailable"))
    );

    await expect(
      checkPhoton("test-photon-key", "pho_prj_test")
    ).resolves.toStrictEqual({
      detail:
        "couldn't reach Spectrum Stable; the value was kept but not verified",
      status: "unreachable",
    });
  });
});
