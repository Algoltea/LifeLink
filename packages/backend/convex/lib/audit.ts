import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type AuditActor = "family" | "model" | "person" | "provider" | "system";

interface AuditEntry {
  actor: AuditActor;
  detail: string;
  event: string;
  ownerId: Id<"profiles">;
  taskId?: Id<"tasks"> | null;
}

const audit = async (ctx: MutationCtx, entry: AuditEntry): Promise<void> => {
  await ctx.db.insert("auditLog", {
    actor: entry.actor,
    at: Date.now(),
    detail: entry.detail,
    event: entry.event,
    ownerId: entry.ownerId,
    taskId: entry.taskId ?? null,
  });
};

export { audit };

export type { AuditActor };
