import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

// An attempt that never finished (for example, the action crashed) becomes
// "unknown" so it is reconciled before anyone retries it.
crons.interval(
  "mark stalled attempts unknown",
  { minutes: 10 },
  internal.maintenance.markStalledAttempts,
  {}
);

export default crons;
