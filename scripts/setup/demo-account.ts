/** Creates the presentation account on the configured development deployment. */
import { randomBytes } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { backendDirectory, readDeployment } from "./convex";
import { readEnvFile } from "./files";
import { run } from "./run";

const root = fileURLToPath(new URL("../../", import.meta.url));
const credentialsPath = path.join(root, ".lifelink", "demo-account.json");

const credentialsSchema = z.object({
  deploymentUrl: z.url(),
  email: z.email(),
  password: z.string().min(10),
});

const main = async (): Promise<void> => {
  const deployment = readDeployment(root);

  if (deployment.url === null) {
    throw new Error(
      "Run bun run dev:setup to configure a development deployment first."
    );
  }

  const credentials = existsSync(credentialsPath)
    ? credentialsSchema.parse(
        JSON.parse(readFileSync(credentialsPath, "utf-8"))
      )
    : {
        deploymentUrl: deployment.url,
        email: "demo@lifelink.example",
        password: randomBytes(15).toString("base64url"),
      };

  if (credentials.deploymentUrl !== deployment.url) {
    throw new Error(
      "The saved demo credentials belong to another deployment. Move .lifelink/demo-account.json aside before creating an account here."
    );
  }

  // Save before provisioning so an interrupted run can safely retry with the same password.
  mkdirSync(path.dirname(credentialsPath), { recursive: true });
  writeFileSync(credentialsPath, `${JSON.stringify(credentials, null, 2)}\n`, {
    mode: 0o600,
  });
  chmodSync(credentialsPath, 0o600);

  const result = await run(
    [
      "bun",
      "x",
      "convex",
      "run",
      "--env-file",
      path.join(backendDirectory(root), ".env.local"),
      "demoAccounts:create",
      JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    ],
    { cwd: backendDirectory(root) }
  );

  if (result.code !== 0) {
    const detail = result.output.replaceAll(credentials.password, "[redacted]");

    throw new Error(
      `Demo account setup failed. Sync the backend with bun run --cwd packages/backend dev --once --env-file .env.local, then retry.\n${detail}`
    );
  }

  const webEnvironment = readEnvFile(path.join(root, "apps/web/.env.local"));

  const siteUrl =
    webEnvironment.get("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3001";

  process.stdout.write(
    `Demo account ready.\nSign in: ${new URL("/sign-in", siteUrl).href}\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nCredentials saved locally in .lifelink/demo-account.json (git-ignored).\n`
  );
};

try {
  await main();
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Demo account setup failed."}\n`
  );
  process.exitCode = 1;
}
