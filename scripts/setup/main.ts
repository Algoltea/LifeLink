/**
 * `bun run dev:setup`: everything a fresh checkout needs before `bun run dev`.
 *
 * Safe to run again at any time: existing values are kept, generated secrets
 * are generated once, provider resources are reused, and declined optional
 * integrations are simply asked about next time. Required steps that fail make
 * the command exit non-zero; skipped optional integrations do not.
 *
 *   --yes            no questions; keep existing values, skip new integrations
 *   --reconfigure    ask again about integrations that are already set up
 *   --only=<id>      only this integration (openrouter, gemini_live, composio,
 *                    photon, discord, instacart)
 *   --agent=<name>   agent to install skills for (default: detected)
 *   --skip-install   don't run `bun install`
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  coreEnvVars,
  developerIntegrations,
} from "../../packages/contracts/src/integrations";
import type {
  DeveloperIntegration,
  DeveloperIntegrationId,
  EnvVarDefinition,
} from "../../packages/contracts/src/integrations";
import {
  configureDeployment,
  listEnv,
  pushFunctions,
  readDeployment,
  setEnv,
} from "./convex";
import type { Deployment } from "./convex";
import { readState, updateEnvFile, writeState } from "./files";
import type { SetupState, StepStatus } from "./files";
import {
  checkComposio,
  checkDiscord,
  checkGemini,
  checkInstacart,
  checkOpenRouter,
  checkPhoton,
  createPhotonWebhook,
  discordInstallUrl,
  ensureAuthConfigs,
  ensureComposioWebhook,
  isLocalUrl,
} from "./providers";
import type { CheckResult } from "./providers";
import { lastLines, run } from "./run";
import {
  ask,
  askSecret,
  bold,
  confirm,
  dim,
  failure,
  green,
  heading,
  info,
  interactive,
  masked,
  note,
  red,
  success,
  warn,
  write,
  yellow,
} from "./ui";
import {
  meetsMinimumVersion,
  MIN_BUN_VERSION,
  MIN_NODE_VERSION,
} from "./versions";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const STATE_PATH = path.join(ROOT, ".lifelink", "setup-state.json");

const argv = process.argv.slice(2);

const flag = (name: string): boolean =>
  argv.includes(`--${name}`) || (name === "yes" && argv.includes("-y"));

const option = (name: string): string | null =>
  argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ??
  null;

const askQuestions = interactive && !flag("yes");
const reconfigure = flag("reconfigure");
const only = option("only");

// ── Report ─────────────────────────────────────────────────────────────────

type Group = "optional" | "required";

interface ReportLine {
  detail: string;
  group: Group;
  label: string;
  status: StepStatus;
}

const report: ReportLine[] = [];
const previous: SetupState = readState(STATE_PATH);

const state: SetupState = {
  lastRun: new Date().toISOString(),
  steps: { ...previous.steps },
};

const record = (id: string, line: ReportLine): void => {
  report.push(line);
  state.steps[id] = {
    at: new Date().toISOString(),
    detail: line.detail,
    status: line.status,
  };

  const text = `${line.label}: ${line.detail}`;

  if (line.status === "ok") {
    success(text);
  } else if (line.status === "failed") {
    failure(text);
  } else if (line.status === "warning") {
    warn(text);
  } else {
    note(`– ${text}`);
  }
};

const fromCheck = (check: CheckResult): StepStatus => {
  if (check.status === "ok") {
    return "ok";
  }

  return check.status === "rejected" ? "failed" : "warning";
};

// ── 1. Tools ───────────────────────────────────────────────────────────────

const checkTools = async (): Promise<boolean> => {
  heading("Tools");

  const bunVersion = process.versions.bun;
  const bunOk = meetsMinimumVersion(bunVersion ?? "", MIN_BUN_VERSION);

  const nodeResult = await run(["node", "--version"], { cwd: ROOT });

  const nodeOk =
    nodeResult.code === 0 &&
    meetsMinimumVersion(nodeResult.output, MIN_NODE_VERSION);

  record("tools", {
    detail: [
      bunOk
        ? `Bun ${bunVersion}`
        : `Bun ${bunVersion ?? "?"} is too old; install ${MIN_BUN_VERSION.join(".")} or newer from bun.sh`,
      nodeOk
        ? `Node ${nodeResult.output}`
        : `Node ${MIN_NODE_VERSION.join(".")}+ is needed for Ultracite and the Convex and skills CLIs (nodejs.org)`,
    ].join(", "),
    group: "required",
    label: "Tools",
    status: bunOk && nodeOk ? "ok" : "failed",
  });

  return bunOk && nodeOk;
};

// ── 2. Dependencies ────────────────────────────────────────────────────────

const installDependencies = async (): Promise<boolean> => {
  heading("Dependencies");

  if (flag("skip-install")) {
    record("install", {
      detail: "skipped (--skip-install)",
      group: "required",
      label: "Dependencies",
      status: "skipped",
    });

    return true;
  }

  info("Running bun install…");

  const result = await run(["bun", "install"], { cwd: ROOT });

  record("install", {
    detail:
      result.code === 0
        ? "installed"
        : `bun install failed:\n${lastLines(result.output)}`,
    group: "required",
    label: "Dependencies",
    status: result.code === 0 ? "ok" : "failed",
  });

  return result.code === 0;
};

// ── 3. Agent skills ────────────────────────────────────────────────────────

const SKILLS = [
  { extra: [], name: "impeccable", source: "pbakaus/impeccable" },
  { extra: [], name: "design-taste-frontend", source: "Leonxlnx/taste-skill" },
  {
    extra: ["--skill", "install-anti-slop"],
    name: "install-anti-slop",
    source: "dmmulroy/anti-slop",
  },
] as const;

const detectAgent = (): string => {
  const chosen = option("agent");

  if (chosen !== null) {
    return chosen;
  }

  if (
    process.env.CODEX_HOME !== undefined ||
    process.env.CODEX_SANDBOX !== undefined
  ) {
    return "codex";
  }

  if (process.env.CURSOR_TRACE_ID !== undefined) {
    return "cursor";
  }

  return "claude-code";
};

const skillDirectory = (agent: string): string =>
  path.join(ROOT, agent === "claude-code" ? ".claude" : ".agents", "skills");

const installSkills = async (): Promise<void> => {
  heading("Agent skills");

  const agent = detectAgent();
  const directory = skillDirectory(agent);

  const present = (name: string): boolean =>
    existsSync(path.join(directory, name, "SKILL.md"));

  const missing = SKILLS.filter((skill) => !present(skill.name));

  note(
    `Installing project-local skills for ${agent} (choose another with --agent=<name>).`
  );

  for (const skill of missing) {
    info(
      `npx skills add ${skill.source}${skill.extra.length > 0 ? ` ${skill.extra.join(" ")}` : ""}`
    );

    // oxlint-disable-next-line eslint/no-await-in-loop -- the skills CLI edits one lock file; installs must not overlap.
    const result = await run(
      [
        "npx",
        "-y",
        "skills",
        "add",
        skill.source,
        ...skill.extra,
        "-a",
        agent,
        "-y",
      ],
      { cwd: ROOT }
    );

    if (result.code !== 0) {
      note(lastLines(result.output, 4));
    }
  }

  const stillMissing = SKILLS.flatMap((skill) =>
    present(skill.name) ? [] : [skill.name]
  );

  record("skills", {
    detail:
      stillMissing.length === 0
        ? `${SKILLS.map((skill) => skill.name).join(", ")} in ${directory.replace(ROOT, "")}`
        : `missing ${stillMissing.join(", ")}; run the npx skills add commands above and check your network`,
    group: "required",
    label: "Agent skills",
    status: stillMissing.length === 0 ? "ok" : "failed",
  });
};

// ── 4. Lint, format, and hooks ─────────────────────────────────────────────

const ANTI_SLOP_FILES = ["index.ts", "LICENSE", "UPSTREAM.md"];

const checkTooling = async (): Promise<void> => {
  heading("Lint, format, and git hooks");

  const vendored = ANTI_SLOP_FILES.every((file) =>
    existsSync(path.join(ROOT, "tools", "oxlint", "anti-slop", file))
  );

  const registered = readFileSync(
    path.join(ROOT, "oxlint.config.ts"),
    "utf-8"
  ).includes("./tools/oxlint/anti-slop/index.ts");

  record("anti-slop", {
    detail:
      vendored && registered
        ? "vendored plugin present with its license and provenance, registered in oxlint.config.ts"
        : "vendored plugin missing or not registered; ask your agent to run the install-anti-slop skill",
    group: "required",
    label: "Anti-slop",
    status: vendored && registered ? "ok" : "failed",
  });

  const lint = await run(
    ["bun", "x", "oxlint", "-c", "oxlint.config.ts", "packages/contracts/src"],
    { cwd: ROOT }
  );

  const doctor = await run(["bun", "x", "ultracite", "doctor"], { cwd: ROOT });

  record("lint-config", {
    detail:
      lint.code === 0 && doctor.code === 0
        ? "Ultracite (Oxlint + Oxfmt) and the anti-slop rules load cleanly"
        : `lint configuration problem:\n${lastLines(lint.code === 0 ? doctor.output : lint.output)}`,
    group: "required",
    label: "Lint config",
    status: lint.code === 0 && doctor.code === 0 ? "ok" : "failed",
  });

  const gitCheck = await run(["git", "rev-parse", "--is-inside-work-tree"], {
    cwd: ROOT,
  });

  const isRepository = gitCheck.code === 0;

  if (!isRepository) {
    record("hooks", {
      detail:
        "not a git repository yet; run setup again after `git init` to install the Lefthook hooks",
      group: "optional",
      label: "Git hooks",
      status: "skipped",
    });

    return;
  }

  const hooks = await run(["bun", "x", "lefthook", "install"], { cwd: ROOT });

  record("hooks", {
    detail:
      hooks.code === 0
        ? "Lefthook installed (format on commit; typecheck and tests on push)"
        : `lefthook install failed:\n${lastLines(hooks.output)}`,
    group: "optional",
    label: "Git hooks",
    status: hooks.code === 0 ? "ok" : "warning",
  });
};

// ── 5. Convex ──────────────────────────────────────────────────────────────

const connectConvex = async (): Promise<Deployment | null> => {
  heading("Convex");

  let deployment = readDeployment(ROOT);

  if (deployment.kind === "anonymous" || deployment.kind === "local") {
    warn(
      `This checkout uses a ${deployment.kind} Convex deployment that runs only on this computer.`
    );
    note(
      "It works for Practice mode, but Gmail, Outlook, and Photon can't deliver webhooks to it."
    );

    if (
      askQuestions &&
      (await confirm(
        "Connect a free Convex cloud development deployment instead?",
        true
      ))
    ) {
      await configureDeployment(ROOT);
      deployment = readDeployment(ROOT);
    }
  }

  if (deployment.kind === "missing") {
    if (!askQuestions) {
      record("convex", {
        detail:
          "no deployment configured; run `bun run dev:setup` in a terminal to sign in to Convex",
        group: "required",
        label: "Convex",
        status: "failed",
      });

      return null;
    }

    info(
      "Convex will open your browser to sign in (or create a free account), then ask which project to use."
    );
    note(
      "Choose a new project named lifelink, or an existing one. Development deployments are free."
    );
    await configureDeployment(ROOT);
    deployment = readDeployment(ROOT);
  }

  if (deployment.kind === "missing" || deployment.url === null) {
    record("convex", {
      detail: "no deployment was configured",
      group: "required",
      label: "Convex",
      status: "failed",
    });

    return null;
  }

  record("convex", {
    detail: `${deployment.kind === "cloud" ? "cloud" : deployment.kind} deployment ${deployment.name ?? ""} (${deployment.url})`,
    group: "required",
    label: "Convex",
    status: deployment.kind === "cloud" ? "ok" : "warning",
  });

  return deployment;
};

// ── 6. Environment ─────────────────────────────────────────────────────────

const secretValue = (): string => randomBytes(32).toString("base64");

const storeConvexValues = async (
  current: Map<string, string>,
  values: Map<string, string>
): Promise<string[]> => {
  const failed: string[] = [];

  for (const [name, value] of values) {
    if (current.get(name) === value) {
      continue;
    }

    // oxlint-disable-next-line eslint/no-await-in-loop -- one CLI call per variable, in order, so a failure names its variable.
    if (await setEnv(ROOT, name, value)) {
      current.set(name, value);
    } else {
      failed.push(name);
    }
  }

  return failed;
};

const configureCore = async (
  convexEnv: Map<string, string>,
  deployment: Deployment
): Promise<string> => {
  heading("Auth and app URLs");

  const values = new Map<string, string>();

  for (const variable of coreEnvVars) {
    const existing = convexEnv.get(variable.name);

    if (existing !== undefined && existing !== "") {
      values.set(variable.name, existing);
    } else if (variable.secret) {
      values.set(variable.name, secretValue());
    } else if (variable.name === "SITE_URL" && askQuestions) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- questions are asked one at a time.
      const answer = await ask(variable.label, variable.defaultValue ?? "");

      values.set(variable.name, answer);
    } else {
      values.set(variable.name, variable.defaultValue ?? "");
    }
  }

  const failed = await storeConvexValues(convexEnv, values);
  const siteUrl = values.get("SITE_URL") ?? "http://localhost:3001";

  record("auth", {
    detail:
      failed.length === 0
        ? `Better Auth secret and bridge secret set; SITE_URL ${siteUrl}`
        : `couldn't set ${failed.join(", ")} in Convex`,
    group: "required",
    label: "Auth",
    status: failed.length === 0 ? "ok" : "failed",
  });

  const webChanged = updateEnvFile(
    path.join(ROOT, "apps", "web", ".env.local"),
    new Map([
      ["NEXT_PUBLIC_CONVEX_URL", deployment.url ?? ""],
      ["NEXT_PUBLIC_CONVEX_SITE_URL", deployment.siteUrl ?? ""],
      ["NEXT_PUBLIC_SITE_URL", siteUrl],
    ]),
    "# Written by `bun run dev:setup`. Public values only; secrets live in the Convex deployment."
  );

  record("web-env", {
    detail:
      webChanged.length === 0
        ? "apps/web/.env.local up to date"
        : `apps/web/.env.local updated (${webChanged.join(", ")})`,
    group: "required",
    label: "Web env",
    status: "ok",
  });

  return siteUrl;
};

// ── 7. Integrations ────────────────────────────────────────────────────────

/** Values that setup provisions itself instead of asking for. */
const PROVISIONED = new Set([
  "COMPOSIO_AUTH_CONFIGS",
  "COMPOSIO_WEBHOOK_SECRET",
  "SPECTRUM_WEBHOOK_SECRET",
]);

const FALLBACKS: Record<DeveloperIntegrationId, string> = {
  composio:
    "email, calendar, and social accounts stay unavailable; Practice mode still shows sample email",
  discord: "Discord stays unavailable; iMessage and email still work",
  gemini_live:
    "voice uses the browser's dictation where available; typing always works",
  instacart: "grocery lists can still be printed or copied",
  openrouter:
    "LifeLink uses its built-in rules planner (fine for Practice mode; no free-form help)",
  photon: "iMessage stays unavailable; email and Discord still work",
};

const askValue = async (
  variable: EnvVarDefinition,
  existing: string | undefined
): Promise<string> => {
  note(variable.hint);

  if (variable.secret) {
    const entered = await askSecret(
      existing
        ? `${variable.label} (Enter keeps ${masked(existing)})`
        : variable.label
    );

    return entered || existing || "";
  }

  return await ask(variable.label, existing || variable.defaultValue || "");
};

const valuesOf = (
  integration: DeveloperIntegration,
  source: Map<string, string>
): Map<string, string> => {
  const values = new Map<string, string>();

  for (const variable of integration.envVars) {
    values.set(
      variable.name,
      source.get(variable.name) ?? variable.defaultValue ?? ""
    );
  }

  return values;
};

const validate = async (
  id: DeveloperIntegrationId,
  values: Map<string, string>
): Promise<CheckResult> => {
  const value = (name: string): string => values.get(name) ?? "";

  switch (id) {
    case "openrouter": {
      return await checkOpenRouter(value("OPENROUTER_API_KEY"), [
        value("OPENROUTER_MODEL"),
        value("OPENROUTER_FAST_MODEL"),
        value("OPENROUTER_TTS_MODEL"),
      ]);
    }

    case "gemini_live": {
      return await checkGemini(
        value("GEMINI_API_KEY"),
        value("GEMINI_LIVE_MODEL")
      );
    }

    case "composio": {
      return await checkComposio(value("COMPOSIO_API_KEY"));
    }

    case "photon": {
      return await checkPhoton(
        value("SPECTRUM_PROJECT_SECRET"),
        value("SPECTRUM_PROJECT_ID")
      );
    }

    case "discord": {
      return await checkDiscord(
        value("DISCORD_BOT_TOKEN"),
        value("DISCORD_APPLICATION_ID")
      );
    }

    case "instacart": {
      return await checkInstacart(
        value("INSTACART_API_KEY"),
        value("INSTACART_ENVIRONMENT")
      );
    }

    default: {
      return id satisfies never;
    }
  }
};

const MAX_ATTEMPTS = 3;

/** Asks for the integration's values, re-asking when the provider rejects them. Returns null if the person stops. */
const collectValues = async (
  integration: DeveloperIntegration,
  convexEnv: Map<string, string>
): Promise<{ check: CheckResult; values: Map<string, string> } | null> => {
  const values = valuesOf(integration, convexEnv);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    for (const variable of integration.envVars) {
      if (!PROVISIONED.has(variable.name)) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- questions are asked one at a time.
        const answer = await askValue(variable, values.get(variable.name));

        values.set(variable.name, answer);
      }
    }

    const missing = integration.envVars.filter(
      (variable) => variable.required && !values.get(variable.name)
    );

    if (missing.length > 0) {
      warn(`Missing ${missing.map((variable) => variable.label).join(", ")}.`);
    } else {
      info("Checking with the provider…");

      // oxlint-disable-next-line eslint/no-await-in-loop -- each attempt depends on the previous answer.
      const check = await validate(integration.id, values);

      if (check.status !== "rejected") {
        return { check, values };
      }

      warn(check.detail);
    }

    if (attempt === MAX_ATTEMPTS) {
      return null;
    }

    // oxlint-disable-next-line eslint/no-await-in-loop -- each attempt depends on the previous answer.
    const again = await confirm("Try entering it again?", true);

    if (!again) {
      return null;
    }
  }

  return null;
};

const provisionComposio = async (
  values: Map<string, string>,
  siteUrl: string
): Promise<string[]> => {
  const notes: string[] = [];
  const key = values.get("COMPOSIO_API_KEY") ?? "";
  let existing: Record<string, string> = {};

  try {
    const stored: Record<string, string> = JSON.parse(
      values.get("COMPOSIO_AUTH_CONFIGS") || "{}"
    );

    existing = stored;
  } catch {
    existing = {};
  }

  const auth = await ensureAuthConfigs(key, existing);

  values.set("COMPOSIO_AUTH_CONFIGS", JSON.stringify(auth.configs));
  notes.push(
    `auth configs: ${Object.keys(auth.configs).join(", ") || "none"}`,
    ...auth.problems
  );

  if (isLocalUrl(siteUrl)) {
    notes.push(
      "webhook skipped: a local deployment can't receive webhooks, so new mail is found when the person presses Check for new email"
    );

    return notes;
  }

  const webhook = await ensureComposioWebhook(
    key,
    siteUrl,
    Boolean(values.get("COMPOSIO_WEBHOOK_SECRET"))
  );

  if (webhook.secret !== null) {
    values.set("COMPOSIO_WEBHOOK_SECRET", webhook.secret);
  }

  notes.push(webhook.detail);

  return notes;
};

const provisionPhoton = async (
  values: Map<string, string>,
  siteUrl: string
): Promise<string[]> => {
  if (values.get("SPECTRUM_WEBHOOK_SECRET")) {
    return ["webhook signing secret already stored"];
  }

  if (isLocalUrl(siteUrl)) {
    return [
      "webhook skipped: a local deployment can't receive iMessage replies; use a cloud deployment",
    ];
  }

  const webhook = await createPhotonWebhook(
    values.get("SPECTRUM_PROJECT_SECRET") ?? "",
    values.get("SPECTRUM_PROJECT_ID") ?? "",
    siteUrl
  );

  if (webhook.secret !== null) {
    values.set("SPECTRUM_WEBHOOK_SECRET", webhook.secret);

    return [webhook.detail];
  }

  warn(`${webhook.detail}.`);
  info(
    `In the Photon Spectrum dashboard, add a webhook for ${siteUrl}/webhooks/photon and paste its signing secret.`
  );

  const pasted = await askSecret(
    "Spectrum webhook signing secret (Enter to skip)"
  );

  if (pasted) {
    values.set("SPECTRUM_WEBHOOK_SECRET", pasted);

    return ["webhook signing secret stored"];
  }

  return ["no webhook yet, so replies won't arrive; run setup again to add it"];
};

const provisionDiscord = (
  values: Map<string, string>,
  convexEnv: Map<string, string>,
  deployment: Deployment
): string[] => {
  const changed = updateEnvFile(
    path.join(ROOT, "apps", "discord-bridge", ".env.local"),
    new Map([
      ["BRIDGE_SHARED_SECRET", convexEnv.get("BRIDGE_SHARED_SECRET") ?? ""],
      ["CONVEX_SITE_URL", deployment.siteUrl ?? ""],
      ["DISCORD_BOT_TOKEN", values.get("DISCORD_BOT_TOKEN") ?? ""],
    ]),
    "# Written by `bun run dev:setup` for the local Discord Gateway bridge. Never commit this file."
  );

  return [
    changed.length === 0
      ? "bridge settings up to date"
      : "bridge settings written to apps/discord-bridge/.env.local",
    `install the bot in a private server you share with family: ${discordInstallUrl(values.get("DISCORD_APPLICATION_ID") ?? "")}`,
  ];
};

const provision = async (
  id: DeveloperIntegrationId,
  values: Map<string, string>,
  context: {
    convexEnv: Map<string, string>;
    deployment: Deployment;
    siteUrl: string;
  }
): Promise<string[]> => {
  if (id === "composio") {
    return await provisionComposio(
      values,
      context.deployment.siteUrl ?? context.siteUrl
    );
  }

  if (id === "photon") {
    return await provisionPhoton(
      values,
      context.deployment.siteUrl ?? context.siteUrl
    );
  }

  if (id === "discord") {
    return provisionDiscord(values, context.convexEnv, context.deployment);
  }

  return [];
};

const configureIntegration = async (
  integration: DeveloperIntegration,
  convexEnv: Map<string, string>,
  deployment: Deployment,
  siteUrl: string
): Promise<void> => {
  heading(integration.label);

  const configured = integration.envVars.every(
    (variable) => !variable.required || Boolean(convexEnv.get(variable.name))
  );

  const context = { convexEnv, deployment, siteUrl };
  let values = valuesOf(integration, convexEnv);
  let check: CheckResult;

  if (configured && !reconfigure && only !== integration.id) {
    check = await validate(integration.id, values);
  } else {
    info(integration.purpose);

    if (!configured && askQuestions) {
      note(`Get credentials: ${integration.consoleUrl}`);

      for (const step of integration.consoleSteps) {
        note(`• ${step}`);
      }
    }

    const wanted =
      askQuestions &&
      (await confirm(
        configured
          ? `Change ${integration.label}?`
          : `Set up ${integration.label} now?`,
        false
      ));

    if (wanted) {
      const collected = await collectValues(integration, convexEnv);

      if (collected === null) {
        record(integration.id, {
          detail: configured
            ? "kept the previous values"
            : `not set up; ${FALLBACKS[integration.id]}`,
          group: "optional",
          label: integration.label,
          status: configured ? "warning" : "skipped",
        });

        return;
      }

      ({ check, values } = collected);
    } else if (configured) {
      check = await validate(integration.id, values);
    } else {
      record(integration.id, {
        detail: `skipped; ${FALLBACKS[integration.id]}`,
        group: "optional",
        label: integration.label,
        status: "skipped",
      });

      return;
    }
  }

  const notes =
    check.status === "rejected"
      ? []
      : await provision(integration.id, values, context);

  const failed =
    check.status === "rejected"
      ? []
      : await storeConvexValues(convexEnv, values);

  const status = failed.length > 0 ? "failed" : fromCheck(check);

  record(integration.id, {
    detail: [
      failed.length > 0
        ? `couldn't store ${failed.join(", ")} in Convex`
        : check.detail,
      ...notes,
    ].join("; "),
    group: "optional",
    label: integration.label,
    status,
  });
};

// ── 8. Deploy functions and final checks ───────────────────────────────────

const deployFunctions = async (deployment: Deployment): Promise<void> => {
  heading("Backend functions");
  info("Pushing Convex functions and generating types…");

  const pushed = await pushFunctions(ROOT);

  // A running `bun run dev` already owns a local backend and pushes on every change.
  const ownedByDev =
    !pushed.ok && pushed.output.includes("still running on port");

  if (ownedByDev) {
    record("push", {
      detail:
        "the local backend is running under `bun run dev`, which pushes functions as files change",
      group: "required",
      label: "Functions",
      status: "ok",
    });
  } else {
    record("push", {
      detail: pushed.ok
        ? "functions deployed and convex/_generated up to date"
        : `push failed: ${pushed.output.split("\n").findLast((line) => line.trim() !== "") ?? "no output"}\n${pushed.output}`,
      group: "required",
      label: "Functions",
      status: pushed.ok ? "ok" : "failed",
    });
  }

  if (deployment.url === null) {
    return;
  }

  try {
    const response = await fetch(`${deployment.url}/version`, {
      signal: AbortSignal.timeout(10_000),
    });

    record("reachable", {
      detail: response.ok
        ? `${deployment.url} answers`
        : `${deployment.url} answered HTTP ${response.status}`,
      group: "required",
      label: "Reachable",
      status: response.ok ? "ok" : "warning",
    });
  } catch {
    record("reachable", {
      detail: `${deployment.url} didn't answer${deployment.kind === "cloud" ? "" : "; start it with `bun run dev`"}`,
      group: "required",
      label: "Reachable",
      status: "warning",
    });
  }
};

// ── Summary ────────────────────────────────────────────────────────────────

const SYMBOLS: Record<StepStatus, string> = {
  failed: red("✗"),
  ok: green("✓"),
  skipped: dim("–"),
  warning: yellow("!"),
};

const summarize = (): number => {
  heading("Status");

  for (const group of ["required", "optional"] as const) {
    write(bold(group === "required" ? "  Required" : "  Optional"));

    for (const line of report.filter((item) => item.group === group)) {
      write(
        `  ${SYMBOLS[line.status]} ${line.label.padEnd(22)} ${line.detail.split("\n")[0] ?? ""}`
      );
    }
  }

  const failedRequired = report.filter(
    (line) => line.group === "required" && line.status === "failed"
  );

  write("");

  if (failedRequired.length > 0) {
    write(
      red(
        bold(
          `  ${failedRequired.length} required step${failedRequired.length === 1 ? "" : "s"} failed. Fix the items marked ✗ and run bun run dev:setup again.`
        )
      )
    );

    return 1;
  }

  write(green(bold("  Ready. Start everything with:")));
  write(`\n    ${bold("bun run dev")}    ${dim("→ http://localhost:3001")}\n`);
  note(
    "Run setup again any time; it keeps what's set. Use --reconfigure to change a key, or --only=<integration>."
  );

  return 0;
};

const main = async (): Promise<number> => {
  write(bold("\nLifeLink setup"));
  note(
    askQuestions
      ? "Press Enter to accept the value in brackets. Secrets are hidden as you type."
      : "Running without questions (--yes or no terminal)."
  );

  if (!(await checkTools()) || !(await installDependencies())) {
    return summarize();
  }

  await installSkills();
  await checkTooling();

  const deployment = await connectConvex();

  if (deployment === null) {
    return summarize();
  }

  const convexEnv = await listEnv(ROOT);

  if (convexEnv === null) {
    record("convex-env", {
      detail:
        "couldn't read the deployment's environment; run `bunx convex login` in packages/backend, then setup again",
      group: "required",
      label: "Convex env",
      status: "failed",
    });

    return summarize();
  }

  const siteUrl = await configureCore(convexEnv, deployment);

  for (const integration of developerIntegrations) {
    if (only === null || only === integration.id) {
      // oxlint-disable-next-line eslint/no-await-in-loop -- integrations are set up one at a time, each with its own questions.
      await configureIntegration(integration, convexEnv, deployment, siteUrl);
    }
  }

  await deployFunctions(deployment);

  return summarize();
};

const exitCode = await main();

writeState(STATE_PATH, state);

process.exit(exitCode);
