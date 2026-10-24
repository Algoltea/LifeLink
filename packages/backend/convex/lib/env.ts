/** Read a Convex deployment environment variable; blank counts as unset. */
const readEnv = (name: string): string | null => {
  const value = process.env[name]?.trim();

  return value === undefined || value === "" ? null : value;
};

const readEnvOr = (name: string, fallback: string): string =>
  readEnv(name) ?? fallback;

const demoModeAllowed = (): boolean =>
  readEnvOr("DEMO_MODE_ALLOWED", "true") === "true";

export { demoModeAllowed, readEnv, readEnvOr };
