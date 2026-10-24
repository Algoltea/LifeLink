/** Child processes for setup: captured for checks, inherited for steps that need the terminal or a browser. */
import { spawn } from "node:child_process";
import { once } from "node:events";

interface RunResult {
  code: number;
  output: string;
}

interface RunOptions {
  cwd: string;
  input?: string;
  interactiveTerminal?: boolean;
}

/**
 * Convex's anonymous agent mode must never leak into setup: setup's job is to
 * connect a real deployment.
 */
const childEnvironment = (): NodeJS.ProcessEnv => {
  const environment: NodeJS.ProcessEnv = { ...process.env };

  delete environment.CONVEX_AGENT_MODE;

  return environment;
};

const run = async (
  command: readonly string[],
  options: RunOptions
): Promise<RunResult> => {
  const [program, ...args] = command;

  if (program === undefined) {
    return { code: 127, output: "No command given." };
  }

  const chunks: Buffer[] = [];

  const child = spawn(program, args, {
    cwd: options.cwd,
    env: childEnvironment(),
    stdio:
      options.interactiveTerminal === true
        ? "inherit"
        : [options.input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
  });

  child.stdout?.on("data", (chunk: Buffer) => chunks.push(chunk));
  child.stderr?.on("data", (chunk: Buffer) => chunks.push(chunk));

  if (options.input !== undefined) {
    child.stdin?.end(options.input);
  }

  try {
    const [code]: (number | null)[] = await once(child, "close");

    return {
      code: code ?? 1,
      output: Buffer.concat(chunks).toString("utf-8").trim(),
    };
  } catch (error) {
    // `once` rejects when the program can't be started at all (for example, not installed).
    return {
      code: 127,
      output:
        error instanceof Error ? error.message : `Could not run ${program}.`,
    };
  }
};

const lastLines = (output: string, count = 6): string =>
  output.split("\n").slice(-count).join("\n");

export { lastLines, run };

export type { RunResult };
