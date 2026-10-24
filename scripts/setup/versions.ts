const MIN_BUN_VERSION = [1, 4, 0] as const;
const MIN_NODE_VERSION = [22, 18, 0] as const;

const VERSION_PATTERN = /^v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/u;

const meetsMinimumVersion = (
  version: string,
  minimum: readonly [number, number, number]
): boolean => {
  const parts = VERSION_PATTERN.exec(version.trim())?.groups;

  if (parts === undefined) {
    return false;
  }

  const major = Number(parts.major);
  const minor = Number(parts.minor);
  const patch = Number(parts.patch);
  const [minimumMajor, minimumMinor, minimumPatch] = minimum;

  if (major !== minimumMajor) {
    return major > minimumMajor;
  }

  if (minor !== minimumMinor) {
    return minor > minimumMinor;
  }

  return patch >= minimumPatch;
};

export { meetsMinimumVersion, MIN_BUN_VERSION, MIN_NODE_VERSION };
