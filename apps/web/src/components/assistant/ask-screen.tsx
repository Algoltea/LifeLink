"use client";

import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import {
  AlarmClockIcon,
  CarIcon,
  MessageSquareIcon,
  SquarePenIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useOffline } from "@/components/app/offline-queue";
import { usePreferences } from "@/components/app/preferences";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import { Composer } from "@/components/voice/composer";
import { useLocale, useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";
import { useGreeting } from "@/lib/greeting";

import {
  CHAT_READING_COLUMN,
  CHAT_TOP_BAR,
  CHAT_WORKSPACE,
} from "./chat-layout";
import { ChatLoadingWorkspace } from "./chat-loading-workspace";
import { conversationTitleFor } from "./conversation-title";
import { EmailSummaryPreset } from "./email-summary-preset";
import { HistoryDrawer } from "./history-drawer";
import { AssistantThread } from "./thread";

const DEFAULT_TIME_ZONE = "America/New_York";

/** Ideas fill the box rather than sending, so the person can finish the sentence. */
const SUGGESTIONS = [
  { Icon: CarIcon, key: "ride" },
  { Icon: MessageSquareIcon, key: "write" },
  { Icon: AlarmClockIcon, key: "reminder" },
] as const;

/**
 * A slim chat bar instead of a page title. The h1 still takes focus after
 * navigation so screen reader and keyboard users land at the top.
 */
const ChatTopBar = ({
  actions,
  title,
}: {
  actions: ReactNode;
  title: string | null;
}) => {
  const heading = useRef<HTMLHeadingElement>(null);
  const t = useMessages().ask;

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  return (
    <header className={CHAT_TOP_BAR}>
      <h1
        className="text-section min-w-0 truncate font-semibold tracking-tight outline-none"
        ref={heading}
        tabIndex={-1}
      >
        {title ? (
          <>
            <span className="sr-only">{t.titlePrefix}</span>
            {title}
          </>
        ) : (
          t.title
        )}
      </h1>
      <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">
        {actions}
      </div>
    </header>
  );
};

/** Let the document grow with the conversation so long replies use page scrolling. */
const Conversation = ({
  disabled,
  draft,
  firstName,
  onDraftChange,
  threadId,
  timeZone,
}: {
  disabled: boolean;
  draft: string;
  firstName: string | null;
  onDraftChange: (text: string) => void;
  threadId: string | null;
  timeZone: string;
}) => {
  const { loadMore, results, status } = useUIMessages(
    api.assistant.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 30, stream: true }
  );

  const composerArea = useRef<HTMLFieldSetElement>(null);

  const greeting = useGreeting(timeZone);
  const t = useMessages().ask;

  const { queue } = useOffline();

  const queuedRequests = queue.filter(
    (item) =>
      item.kind === "request" && item.threadId === threadId && !item.failure
  );

  const hasMessages = results.length > 0 || queuedRequests.length > 0;
  const loading = threadId !== null && status === "LoadingFirstPage";

  const followResponse = (): void => {
    composerArea.current?.scrollIntoView({ block: "end" });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-5">
      <section
        aria-label={t.conversationLabel}
        className={cn(
          "px-1",
          hasMessages || loading
            ? "min-h-48 shrink-0"
            : "flex flex-1 items-end justify-center"
        )}
      >
        <div className={cn(CHAT_READING_COLUMN, "pt-2 pb-4")}>
          <h2 className="sr-only">{t.yourConversation}</h2>
          {loading ? (
            <LoadingRows
              layout="assistant-conversation"
              label={t.loadingConversation}
              rows={2}
            />
          ) : null}
          {!loading && !hasMessages ? (
            <div className="flex flex-col items-center gap-2 pb-4 text-center">
              <p className="text-page-title font-semibold tracking-tight sm:text-[2.222rem] sm:leading-tight">
                {greeting}
                {firstName ? `, ${firstName}` : ""}
              </p>
              <p className="text-muted-foreground text-lg">{t.whatCanIHelp}</p>
            </div>
          ) : null}
          {hasMessages ? (
            <AssistantThread
              loadMore={loadMore}
              messages={results}
              status={status}
            />
          ) : null}
          {queuedRequests.length > 0 ? (
            <ol
              aria-label={t.waitingForConnection}
              className="mt-8 flex flex-col gap-4"
            >
              {queuedRequests.map((item) =>
                item.kind === "request" ? (
                  <li
                    className="bg-neutral-wash ml-auto max-w-[min(36rem,85%)] rounded-3xl px-5 py-3.5"
                    key={item.id}
                  >
                    <p className="text-lg wrap-anywhere whitespace-pre-wrap">
                      {item.text}
                    </p>
                    <p className="text-muted-foreground mt-2 text-base">
                      {t.waitingConnection}
                    </p>
                  </li>
                ) : null
              )}
            </ol>
          ) : null}
        </div>
      </section>
      <fieldset
        aria-label={t.composerLabel}
        className={cn(
          CHAT_READING_COLUMN,
          "min-w-0 shrink-0 pb-[env(safe-area-inset-bottom)]"
        )}
        disabled={disabled || loading}
        ref={composerArea}
      >
        <Composer
          draft={draft}
          onDraftChange={onDraftChange}
          onSubmitted={followResponse}
          threadId={threadId ?? undefined}
        />
      </fieldset>
      {loading ? null : (
        <div className={hasMessages ? "shrink-0" : "min-h-0 flex-1"}>
          <ul
            aria-label={t.quickActions}
            className={cn(
              CHAT_READING_COLUMN,
              "flex flex-wrap justify-center gap-3"
            )}
          >
            {SUGGESTIONS.map(({ Icon, key }) => (
              <li key={key}>
                <button
                  className="border-border text-label hover:bg-parchment min-h-control inline-flex items-center gap-2 rounded-full border px-5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={disabled}
                  onClick={() => {
                    onDraftChange(t.suggestions[key].prompt);
                    composerArea.current?.querySelector("textarea")?.focus();
                  }}
                  type="button"
                >
                  <Icon aria-hidden="true" className="text-primary size-5" />
                  {t.suggestions[key].label}
                </button>
              </li>
            ))}
            <li key="email-summary">
              <EmailSummaryPreset
                disabled={disabled}
                onSubmitted={followResponse}
                threadId={threadId}
              />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const AskWorkspace = () => {
  const locale = useLocale();
  const threadId = useQuery(api.assistant.myThread);

  const history = usePaginatedQuery(
    api.assistant.listConversationHistory,
    {},
    { initialNumItems: 20 }
  );

  const { me } = usePreferences();
  const t = useMessages().ask;

  const activeConversation = history.results.find(
    (conversation) => conversation.threadId === threadId
  );

  const newConversation = useMutation(api.assistant.newConversation);
  const selectConversation = useMutation(api.assistant.selectConversation);
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const [conversationError, setConversationError] = useState<string | null>(
    null
  );

  const switchConversation = async (
    nextThreadId?: string
  ): Promise<boolean> => {
    setBusy(true);
    setConversationError(null);

    try {
      await (nextThreadId
        ? selectConversation({ threadId: nextThreadId })
        : newConversation({}));
      setBusy(false);

      return true;
    } catch (error) {
      setConversationError(messageOf(error instanceof Error ? error : null));
      setBusy(false);

      return false;
    }
  };

  return (
    <div className={CHAT_WORKSPACE}>
      <ChatTopBar
        actions={
          <>
            <HistoryDrawer
              activeThreadId={threadId}
              busy={busy}
              conversations={
                history.status === "LoadingFirstPage"
                  ? undefined
                  : history.results
              }
              error={conversationError}
              onNew={() => switchConversation()}
              onSelect={switchConversation}
              loadMore={() => history.loadMore(20)}
              historyStatus={history.status}
              timeZone={me?.profile?.timeZone ?? DEFAULT_TIME_ZONE}
            />
            <Button
              aria-busy={busy}
              disabled={busy || threadId === undefined}
              onClick={() => switchConversation()}
              variant="outline"
            >
              <SquarePenIcon aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{t.newChat}</span>
            </Button>
          </>
        }
        title={
          activeConversation?.hasMessages
            ? conversationTitleFor(activeConversation, locale)
            : null
        }
      />
      {conversationError ? <ErrorNote>{conversationError}</ErrorNote> : null}
      {threadId === undefined ? (
        <LoadingRows layout="ask" label={t.opening} rows={2} />
      ) : (
        <Conversation
          disabled={busy}
          draft={threadId ? (drafts[threadId] ?? "") : ""}
          firstName={me?.profile?.preferredName ?? null}
          timeZone={me?.profile?.timeZone ?? DEFAULT_TIME_ZONE}
          key={threadId ?? "new-conversation"}
          onDraftChange={(text) => {
            if (threadId) {
              setDrafts((current) => ({ ...current, [threadId]: text }));
            }
          }}
          threadId={threadId}
        />
      )}
    </div>
  );
};

const AskScreen = () => {
  const { me } = usePreferences();

  return me?.profile ? (
    <AskWorkspace key={me.profile._id} />
  ) : (
    <ChatLoadingWorkspace />
  );
};

export { AskScreen };
