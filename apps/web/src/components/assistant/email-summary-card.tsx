"use client";

import { GROUPS } from "@lifelink/contracts/inbox-chat";
import type { InboxChatSummary } from "@lifelink/contracts/inbox-chat";
import { ChevronDownIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { useId } from "react";

const EmailSummaryCard = ({ summary }: { summary: InboxChatSummary }) => {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="border-border bg-raised overflow-hidden rounded-2xl border"
    >
      <header className="border-border bg-parchment flex items-start gap-3 border-b px-5 py-4">
        <MailIcon
          aria-hidden="true"
          className="text-primary mt-1 size-5 shrink-0"
        />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold" id={headingId}>
            Recent email summary
          </h3>
          <p className="text-muted-foreground text-label">
            {summary.practice ? "Practice · " : ""}
            {summary.items.length} recent imported emails ·{" "}
            {summary.method === "cloud" ? "Cloud summary" : "LifeLink summary"}
          </p>
        </div>
      </header>
      {summary.summary ? (
        <p className="border-border border-b px-5 py-4 text-lg wrap-anywhere">
          {summary.summary}
        </p>
      ) : null}
      {summary.items.length === 0 ? (
        <p className="px-5 py-4">
          No imported emails yet. Check for new email on the Email page, then
          summarize again.
        </p>
      ) : (
        <div className="divide-border divide-y">
          {GROUPS.map((group) => {
            const items = summary.items.filter(
              (item) => item.category === group.category
            );

            return (
              <details className="group" key={group.category}>
                <summary className="hover:bg-parchment min-h-control flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1 font-semibold">
                    {group.title}
                  </span>
                  <span className="bg-neutral-wash text-label min-w-8 rounded-full px-2 py-1 text-center tabular-nums">
                    {items.length}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                {items.length === 0 ? (
                  <p className="text-muted-foreground px-5 pb-4">
                    No emails in this category.
                  </p>
                ) : (
                  <ul className="border-border divide-border divide-y border-t">
                    {items.map((item) => (
                      <li
                        className="grid min-w-0 gap-3 px-5 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
                        key={item.id}
                      >
                        <div className="min-w-0">
                          <Link
                            className="text-primary min-h-control inline-flex items-center font-semibold wrap-anywhere underline underline-offset-4"
                            href={{
                              pathname: "/email",
                              query: { id: item.id },
                            }}
                          >
                            {item.subject || "(No subject)"}
                          </Link>
                          <p className="text-muted-foreground text-label wrap-anywhere">
                            {item.sender}
                          </p>
                        </div>
                        <div className="min-w-0 space-y-2 wrap-anywhere">
                          {item.summary ? <p>{item.summary}</p> : null}
                          <p className="text-muted-foreground text-label">
                            {item.reason}
                          </p>
                          {item.quote ? (
                            <blockquote className="border-border text-muted-foreground text-label border-l-2 pl-3">
                              {item.quote}
                            </blockquote>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            );
          })}
        </div>
      )}
      <footer className="border-border space-y-3 border-t px-5 py-4">
        <details className="text-muted-foreground text-label">
          <summary className="min-h-control cursor-pointer content-center">
            How this summary was made
          </summary>
          <p className="pb-3 wrap-anywhere">{summary.note}</p>
        </details>
        <p className="text-muted-foreground text-label">
          Suggestions only. Review original messages before acting. Nothing was
          sent or changed in your mailbox.
        </p>
        <Link
          className="text-primary min-h-control inline-flex items-center font-semibold underline underline-offset-4"
          href="/email"
        >
          Open Email
        </Link>
      </footer>
    </section>
  );
};

export { EmailSummaryCard };
