/**
 * Terminal input and output for `bun run dev:setup`. Dependency-free: setup
 * runs before `bun install`. Secrets are read with masked input and are never
 * echoed, logged, or written to the state file.
 */
import { on } from "node:events";
import { createInterface } from "node:readline/promises";

const interactive =
  process.stdin.isTTY === true && process.stdout.isTTY === true;

const color =
  process.stdout.isTTY === true && process.env.NO_COLOR === undefined;

const paint =
  (code: string) =>
  (text: string): string =>
    color ? `\u001B[${code}m${text}\u001B[0m` : text;

const bold = paint("1");
const dim = paint("2");
const green = paint("32");
const yellow = paint("33");
const red = paint("31");
const cyan = paint("36");

const write = (text: string): void => {
  process.stdout.write(`${text}\n`);
};

const heading = (text: string): void => {
  write("");
  write(bold(cyan(`── ${text} `.padEnd(64, "─"))));
};

const info = (text: string): void => write(`  ${text}`);
const note = (text: string): void => write(dim(`  ${text}`));
const success = (text: string): void => write(`  ${green("✓")} ${text}`);
const warn = (text: string): void => write(`  ${yellow("!")} ${text}`);
const failure = (text: string): void => write(`  ${red("✗")} ${text}`);

/** The last four characters only, so a person can tell which key is stored. */
const masked = (secret: string): string =>
  secret.length > 8 ? `••••${secret.slice(-4)}` : "••••";

const ask = async (question: string, defaultValue = ""): Promise<string> => {
  if (!interactive) {
    return defaultValue;
  }

  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const suffix = defaultValue ? dim(` (${defaultValue})`) : "";

  try {
    const answer = await prompt.question(`  ${question}${suffix}: `);

    return answer.trim() || defaultValue;
  } finally {
    prompt.close();
  }
};

const confirm = async (
  question: string,
  defaultYes: boolean
): Promise<boolean> => {
  if (!interactive) {
    return defaultYes;
  }

  const answer = await ask(
    `${question} ${dim(defaultYes ? "[Y/n]" : "[y/N]")}`
  );

  const normalized = answer.toLowerCase();

  if (normalized === "") {
    return defaultYes;
  }

  return normalized === "y" || normalized === "yes";
};

const ENTER = new Set(["\n", "\r", "\u0004"]);
const BACKSPACE = new Set(["\b", "\u007F"]);
const CTRL_C = "\u0003";

// Arrow keys and similar arrive as ANSI escape sequences; they are ignored, not typed.
// oxlint-disable-next-line eslint/no-control-regex -- matching the ESC control character is the point.
const ESCAPE_SEQUENCE = /^\u001B\[[\d;]*[A-Za-z~]/u;

interface Typed {
  cancelled: boolean;
  done: boolean;
  echo: string;
  value: string;
}

/** Applies one chunk of raw keyboard input (or a paste) to the secret being typed. */
const typeKeys = (start: string, input: string): Typed => {
  let value = start;
  let echo = "";
  let rest = input;

  while (rest.length > 0) {
    const sequence = ESCAPE_SEQUENCE.exec(rest);

    if (sequence !== null) {
      rest = rest.slice(sequence[0].length);
      continue;
    }

    const character = rest.slice(0, 1);

    rest = rest.slice(1);

    if (character === CTRL_C) {
      return { cancelled: true, done: true, echo, value };
    }

    if (ENTER.has(character)) {
      return { cancelled: false, done: true, echo, value };
    }

    if (BACKSPACE.has(character)) {
      if (value.length > 0) {
        value = value.slice(0, -1);
        echo += "\b \b";
      }
    } else if (character >= " ") {
      value += character;
      echo += "•";
    }
  }

  return { cancelled: false, done: false, echo, value };
};

/**
 * Reads a secret without echoing it: each character shows as a dot. Pasting
 * works. Ctrl-C stops setup without saving anything for this value.
 */
const askSecret = async (question: string): Promise<string> => {
  if (!interactive) {
    return "";
  }

  const { stdin, stdout } = process;
  let typed: Typed = { cancelled: false, done: false, echo: "", value: "" };

  stdout.write(`  ${question}: `);
  stdin.setRawMode(true);
  stdin.resume();

  try {
    for await (const [chunk] of on(stdin, "data")) {
      typed = typeKeys(typed.value, String(chunk));
      stdout.write(typed.echo);

      if (typed.done) {
        break;
      }
    }
  } finally {
    stdin.setRawMode(false);
    stdin.pause();
    stdout.write("\n");
  }

  if (typed.cancelled) {
    process.exit(130);
  }

  return typed.value.trim();
};

export {
  ask,
  askSecret,
  bold,
  confirm,
  cyan,
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
  typeKeys,
  warn,
  write,
  yellow,
};
