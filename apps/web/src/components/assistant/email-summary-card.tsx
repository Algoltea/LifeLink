"use client";

import { GROUPS } from "@lifelink/contracts/inbox-chat";
import type { InboxChatSummary } from "@lifelink/contracts/inbox-chat";
import { ChevronDownIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";

import { useLocale, useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";

const DISCLOSURE_MOTION_MS = 180;

const SummaryDisclosure = ({
  children,
  className,
  name,
}: {
  children: ReactNode;
  className: string;
  name: string;
}) => {
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (scrollTimer.current !== null) {
        clearTimeout(scrollTimer.current);
      }
    },
    []
  );

  return (
    <details
      className={`email-summary-disclosure ${className}`}
      name={name}
      onToggle={(event) => {
        const disclosure = event.currentTarget;

        if (event.target !== disclosure) {
          return;
        }

        if (scrollTimer.current !== null) {
          clearTimeout(scrollTimer.current);
        }

        if (!disclosure.open) {
          return;
        }

        // Older mobile browsers may not enforce the native details name group.
        const siblings = disclosure
          .closest("[data-email-summary-card]")
          ?.querySelectorAll<HTMLDetailsElement>("details");

        for (const sibling of siblings ?? []) {
          if (sibling !== disclosure && sibling.getAttribute("name") === name) {
            sibling.open = false;
          }
        }

        const reducedMotion =
          document.documentElement.dataset.motion === "reduced" ||
          globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // Align after the previous category has collapsed, so the target stays put.
        scrollTimer.current = setTimeout(
          () => {
            if (disclosure.open && disclosure.isConnected) {
              disclosure.querySelector("summary")?.scrollIntoView({
                behavior: reducedMotion ? "instant" : "smooth",
                block: "start",
              });
            }
          },
          reducedMotion ? 0 : DISCLOSURE_MOTION_MS
        );
      }}
    >
      {children}
    </details>
  );
};

const EmailSummaryCard = ({ summary }: { summary: InboxChatSummary }) => {
  const locale = useLocale();
  const headingId = useId();
  const disclosureName = useId();
  const t = useMessages().ask.emailSummary;

  // Local reasons are fixed rules; item summaries can contain original email text.
  const reasonFor = (text: string): string =>
    summary.method === "cloud" ? text : translateServerMessage(text, locale);

  return (
    <section
      aria-labelledby={headingId}
      className="border-border bg-raised overflow-hidden rounded-2xl border"
      data-email-summary-card=""
    >
      <header className="border-border bg-parchment flex items-start gap-3 border-b px-5 py-4">
        <MailIcon
          aria-hidden="true"
          className="text-primary mt-1 size-5 shrink-0"
        />
        <div className="min-w-0">
          <h3 className="text-lg font-semibold" id={headingId}>
            {t.title}
          </h3>
          <p className="text-muted-foreground text-label">
            {summary.practice ? t.practicePrefix : ""}
            {t.count(summary.items.length)}
            {summary.method === "cloud" ? t.cloud : t.local}
          </p>
        </div>
      </header>
      {summary.summary ? (
        <p className="border-border border-b px-5 py-4 text-lg wrap-anywhere">
          {summary.summary}
        </p>
      ) : null}
      {summary.items.length === 0 ? (
        <p className="px-5 py-4">{t.empty}</p>
      ) : (
        <div className="divide-border divide-y">
          {GROUPS.map((group) => {
            const items = summary.items.filter(
              (item) => item.category === group.category
            );

            return (
              <SummaryDisclosure
                className="group scroll-mt-20"
                key={group.category}
                name={disclosureName}
              >
                <summary className="hover:bg-parchment min-h-control flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1 font-semibold">
                    {t.groups[group.category]}
                  </span>
                  <span className="bg-neutral-wash text-label min-w-8 shrink-0 rounded-full px-2 py-1 text-center tabular-nums">
                    {items.length}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="size-5 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                {items.length === 0 ? (
                  <p className="text-muted-foreground px-5 pb-4">
                    {t.emptyGroup}
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
                            {item.subject || t.noSubject}
                          </Link>
                          <p className="text-muted-foreground text-label wrap-anywhere">
                            {item.sender}
                          </p>
                        </div>
                        <div className="min-w-0 space-y-2 wrap-anywhere">
                          {item.summary ? <p>{item.summary}</p> : null}
                          <p className="text-muted-foreground text-label">
                            {reasonFor(item.reason)}
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
              </SummaryDisclosure>
            );
          })}
        </div>
      )}
      <footer className="border-border space-y-3 border-t px-5 py-4">
        <SummaryDisclosure
          className="text-muted-foreground text-label scroll-mt-20"
          name={disclosureName}
        >
          <summary className="min-h-control cursor-pointer content-center">
            {t.howMade}
          </summary>
          <p className="pb-3 wrap-anywhere">
            {translateServerMessage(summary.note, locale)}
          </p>
        </SummaryDisclosure>
        <p className="text-muted-foreground text-label">{t.suggestionsOnly}</p>
        <Link
          className="text-primary min-h-control inline-flex items-center font-semibold underline underline-offset-4"
          href="/email"
        >
          {t.openEmail}
        </Link>
      </footer>
    </section>
  );
};

export { EmailSummaryCard };
