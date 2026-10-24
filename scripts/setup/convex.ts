/**
 * Convex deployment helpers. All commands run in packages/backend through the
 * project's own Convex CLI. Values are passed to `convex env set` on stdin so
 * secrets never appear in process arguments or shell history.
 */
import path from "node:path";

import { parseEnv, readEnvFile } from "./files";
import { lastLines, run } from "./run";

type DeploymentKind = "anonymous" | "cloud" | "local" | "missing";

interface Deployment {
  kind: DeploymentKind;
  name: string | null;
  siteUrl: string | null;
  url: string | null;
}

const CLOUD_URL = /\.convex\.cloud\/?$/u;

const backendDirectory = (root: string): string =>
  path.join(root, "packages", "backend");

const convexCommand = (...args: string[]): string[] => [
  "bun",
  "x",
  "convex",
  ...args,
];

const readDeployment = (root: string): Deployment => {
  const values = readEnvFile(path.join(backendDirectory(root), ".env.local"));
  const selector = values.get("CONVEX_DEPLOYMENT") ?? "";
  const url = values.get("CONVEX_URL") ?? null;

  const siteUrl =
    values.get("CONVEX_SITE_URL") ??
    (url === null ? null : url.replace(CLOUD_URL, ".convex.site"));

  const [prefix = "", name = null] = selector.split(":");

  if (selector === "") {
    return { kind: "missing", name: null, siteUrl: null, url: null };
  }

  if (prefix === "anonymous") {
    return { kind: "anonymous", name, siteUrl, url };
  }

  return {
    kind: prefix === "local" ? "local" : "cloud",
    name: name ?? selector,
    siteUrl,
    url,
  };
};

/** Login, team, and project choice happen in the Convex CLI's own prompts and browser flow. */
const configureDeployment = async (root: string): Promise<boolean> => {
  const result = await run(
    convexCommand("dev", "--configure", "--once", "--typecheck", "disable"),
    {
      cwd: backendDirectory(root),
      interactiveTerminal: true,
    }
  );

  return result.code === 0;
};

/** Pushes functions and regenerates convex/_generated. */
const pushFunctions = async (
  root: string
): Promise<{ ok: boolean; output: string }> => {
  const result = await run(
    convexCommand("dev", "--once", "--typecheck", "disable"),
    { cwd: backendDirectory(root) }
  );

  return { ok: result.code === 0, output: lastLines(result.output, 12) };
};

const listEnv = async (root: string): Promise<Map<string, string> | null> => {
  const result = await run(convexCommand("env", "list", "--include-values"), {
    cwd: backendDirectory(root),
  });

  return result.code === 0 ? parseEnv(result.output) : null;
};

const setEnv = async (
  root: string,
  name: string,
  value: string
): Promise<boolean> => {
  const result = await run(convexCommand("env", "set", name), {
    cwd: backendDirectory(root),
    input: value,
  });

  return result.code === 0;
};

export {
  backendDirectory,
  configureDeployment,
  listEnv,
  pushFunctions,
  readDeployment,
  setEnv,
};

export type { Deployment, DeploymentKind };
