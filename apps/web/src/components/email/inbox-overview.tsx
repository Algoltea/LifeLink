"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { InboxCategory } from "@lifelink/contracts/inbox";
import { Button } from "@lifelink/ui/components/button";
import { useAction, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";

import { messageOf } from "@/lib/errors";

const CATEGORIES: { value: InboxCategory; label: string }[] = [
  { label: "Check before acting", value: "check_first" },
  { label: "May need a reply", value: "reply" },
  { label: "Worth a look", value: "review" },
  { label: "Lower priority", value: "low_priority" },
];

const InboxOverview = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const recent = useQuery(api.inbox.recent);
  const summarize = useAction(api.inbox.summarize);

  const [cloud, setCloud] = useState<FunctionReturnType<
    typeof api.inbox.summarize
  > | null>(null);

  const [category, setCategory] = useState<InboxCategory | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const consentId = useId();
  const panelId = useId();

  if (!recent || recent.items.length === 0) {
    return null;
  }

  const result = cloud?.key === recent.key ? cloud : null;

  const items = recent.items.map((item) => {
    const suggestion = result?.items.find(
      (candidate) => candidate.id === item.id
    );

    return suggestion?.category === item.category
      ? { ...item, ...suggestion }
      : item;
  });

  const activeCategory =
    category ??
    CATEGORIES.find((group) =>
      items.some((item) => item.category === group.value)
    )?.value ??
    "review";

  const visible = items.filter((item) => item.category === activeCategory);

  return (
    <details className="group/overview border-rule bg-surface rounded-xl border p-5">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-col gap-1">
          <span className="text-body font-semibold">Recent email overview</span>
          <span className="text-muted-foreground text-label">
            Your newest {recent.items.length} imported emails
            {recent.practice ? " · Practice" : ""}
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className="size-5 shrink-0 transition-transform group-open/overview:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="flex min-w-0 flex-col gap-4 pt-4">
        <p className="text-label">
          {result?.summary ??
            `${items.filter((item) => item.category === "reply").length} may need a reply; ${items.filter((item) => item.category === "check_first").length} have warning signs. Browse the groups to see why each email was highlighted.`}
        </p>
        <p className="text-muted-foreground text-label">
          {result?.note ??
            "Made in LifeLink from available text and saved summaries. These are suggestions, not a guarantee of safety or a complete mailbox review."}
        </p>
        <div aria-label="Email priorities" className="flex flex-wrap gap-2">
          {CATEGORIES.map((group) => (
            <Button
              aria-controls={panelId}
              aria-pressed={activeCategory === group.value}
              key={group.value}
              onClick={() => setCategory(group.value)}
              size="sm"
              variant={activeCategory === group.value ? "secondary" : "outline"}
            >
              {group.label} (
              {items.filter((item) => item.category === group.value).length})
            </Button>
          ))}
        </div>
        <div
          className="max-h-80 overflow-y-auto overscroll-contain"
          id={panelId}
        >
          {visible.length === 0 ? (
            <p className="text-muted-foreground p-3">
              No emails in this group.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map((item) => (
                <li
                  className="border-rule flex min-w-0 flex-col gap-1 border-b px-1 pb-3 wrap-anywhere"
                  key={item.id}
                >
                  <button
                    className="text-foreground min-h-control text-left font-semibold underline underline-offset-4"
                    onClick={() => onSelect(item.id)}
                    type="button"
                  >
                    {item.subject || "(No subject)"}
                  </button>
                  <p className="text-muted-foreground text-label">
                    {item.sender}
                  </p>
                  <p className="text-label">
                    {item.summary || "Open this email to read its text."}
                  </p>
                  <p className="text-label font-medium">{item.reason}</p>
                  {item.quote ? (
                    <p className="text-muted-foreground text-label">
                      In the email: “{item.quote}”
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
        {recent.practice ? (
          <p className="text-muted-foreground text-label">
            Practice emails stay in LifeLink.
          </p>
        ) : (
          <div className="border-rule flex flex-col gap-3 border-t pt-4">
            <label
              className="min-h-control text-label flex cursor-pointer items-start gap-3"
              htmlFor={consentId}
            >
              <input
                checked={consent}
                className="accent-primary mt-1 size-5 shrink-0"
                id={consentId}
                onChange={(event) => setConsent(event.target.checked)}
                type="checkbox"
              />
              <span>
                Send the available text and saved summaries of these{" "}
                {recent.items.length} emails to cloud AI for a fuller overview.
              </span>
            </label>
            <Button
              aria-busy={busy}
              className="self-start"
              disabled={!consent || busy}
              onClick={async () => {
                setBusy(true);
                setOperationError(null);

                try {
                  setCloud(await summarize({ allowCloudAnalysis: true }));
                } catch (error) {
                  setOperationError(
                    messageOf(error instanceof Error ? error : null)
                  );
                }

                setBusy(false);
              }}
              variant="outline"
            >
              {busy
                ? "Reviewing recent emails…"
                : "Summarize recent emails with cloud AI"}
            </Button>
            {operationError ? (
              <p className="text-negative text-label" role="alert">
                {operationError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </details>
  );
};

export { InboxOverview };
