/**
 * .env files and the setup state file. Updates keep every existing line,
 * comment, and value; only the named keys are added or changed.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ENV_LINE =
  /^\s*(?:export\s+)?(?<key>[A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?<value>.*)$/u;

const QUOTED = /^(?<quote>["'])(?<inner>.*)\k<quote>$/u;

const unquote = (raw: string): string => {
  const trimmed = raw.trim();
  const match = QUOTED.exec(trimmed);

  return match?.groups?.inner ?? trimmed;
};

const parseEnv = (text: string): Map<string, string> => {
  const values = new Map<string, string>();

  for (const line of text.split("\n")) {
    const match = ENV_LINE.exec(line);

    if (match?.groups?.key !== undefined) {
      values.set(match.groups.key, unquote(match.groups.value ?? ""));
    }
  }

  return values;
};

const readEnvFile = (filePath: string): Map<string, string> =>
  existsSync(filePath) ? parseEnv(readFileSync(filePath, "utf-8")) : new Map();

const SAFE_VALUE = /^[\w./:@+-]*$/u;

const formatValue = (value: string): string =>
  SAFE_VALUE.test(value) ? value : JSON.stringify(value);

/**
 * Sets the given keys in a .env file, creating it with `header` if needed.
 * Returns the keys whose value actually changed.
 */
const updateEnvFile = (
  filePath: string,
  updates: Map<string, string>,
  header: string
): string[] => {
  const exists = existsSync(filePath);

  const lines = exists
    ? readFileSync(filePath, "utf-8").split("\n")
    : [header, ""];

  const pending = new Map(updates);
  const changed: string[] = [];

  const next = lines.map((line) => {
    const key = ENV_LINE.exec(line)?.groups?.key;
    const value = key === undefined ? undefined : pending.get(key);

    if (key === undefined || value === undefined) {
      return line;
    }

    pending.delete(key);

    if (unquote(ENV_LINE.exec(line)?.groups?.value ?? "") !== value) {
      changed.push(key);
    }

    return `${key}=${formatValue(value)}`;
  });

  while (next.length > 0 && next.at(-1) === "") {
    next.pop();
  }

  for (const [key, value] of pending) {
    next.push(`${key}=${formatValue(value)}`);
    changed.push(key);
  }

  if (changed.length > 0 || !exists) {
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, `${next.join("\n")}\n`, { mode: 0o600 });
  }

  return changed;
};

type StepStatus = "failed" | "ok" | "skipped" | "warning";

interface StepRecord {
  at: string;
  detail: string;
  status: StepStatus;
}

interface SetupState {
  lastRun: string | null;
  steps: Record<string, StepRecord>;
}

type JsonValue =
  | boolean
  | number
  | string
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const isRecord = (
  value: JsonValue | undefined
): value is { [key: string]: JsonValue } =>
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- setup runs before dependencies (zod) are installed, so it decodes JSON by hand.
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: JsonValue | undefined): value is string =>
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- as above: no schema library is available before install.
  typeof value === "string";

const parseJson = (text: string): JsonValue | undefined => {
  try {
    const parsed: JsonValue = JSON.parse(text);

    return parsed;
  } catch {
    return undefined;
  }
};

/** Reads a string at a path of object keys, or null when any part is missing. */
const stringAt = (
  value: JsonValue | undefined,
  ...keys: string[]
): string | null => {
  let current = value;

  for (const key of keys) {
    current = isRecord(current) ? current[key] : undefined;
  }

  return isString(current) ? current : null;
};

const STEP_STATUSES = new Set<string>(["failed", "ok", "skipped", "warning"]);

const isStepStatus = (value: string): value is StepStatus =>
  STEP_STATUSES.has(value);

const readState = (filePath: string): SetupState => {
  const parsed = existsSync(filePath)
    ? parseJson(readFileSync(filePath, "utf-8"))
    : undefined;

  const steps: Record<string, StepRecord> = {};
  const storedSteps = isRecord(parsed) ? parsed.steps : undefined;

  if (isRecord(storedSteps)) {
    for (const [id, step] of Object.entries(storedSteps)) {
      const status = stringAt(step, "status") ?? "";

      if (isStepStatus(status)) {
        steps[id] = {
          at: stringAt(step, "at") ?? "",
          detail: stringAt(step, "detail") ?? "",
          status,
        };
      }
    }
  }

  return { lastRun: stringAt(parsed, "lastRun"), steps };
};

const writeState = (filePath: string, state: SetupState): void => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`);
};

export {
  isRecord,
  isString,
  parseEnv,
  parseJson,
  readEnvFile,
  readState,
  stringAt,
  updateEnvFile,
  writeState,
};

export type { JsonValue, SetupState, StepRecord, StepStatus };
