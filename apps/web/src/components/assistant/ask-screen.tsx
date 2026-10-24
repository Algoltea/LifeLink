"use client";

import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useOffline } from "@/components/app/offline-queue";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { ErrorNote, LoadingRows } from "@/components/app/states";
import { Composer } from "@/components/voice/composer";
import { messageOf } from "@/lib/errors";

import { HistoryDrawer } from "./history-drawer";
import { AssistantThread } from "./thread";

const SCROLL_END_THRESHOLD = 80;

/** Keep the bottom in view while replying, without pulling away from older messages. */
const Conversation = ({
  disabled,
  draft,
  onDraftChange,
  threadId,
}: {
  disabled: boolean;
  draft: string;
  onDraftChange: (text: string) => void;
  threadId: string | null;
}) => {
  const { loadMore, results, status } = useUIMessages(
    api.assistant.listThreadMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 30, stream: true }
  );

  const viewport = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const { queue } = useOffline();

  const queuedRequests = queue.filter(
    (item) => item.kind === "request" && item.threadId === threadId
  );

  const hasMessages = results.length > 0 || queuedRequests.length > 0;
  const loading = threadId !== null && status === "LoadingFirstPage";

  useEffect(() => {
    const panel = viewport.current;
    const transcript = content.current;

    if (!panel || !transcript) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (followLatest.current) {
        panel.scrollTop = panel.scrollHeight;
      }
    });

    observer.observe(transcript);
    observer.observe(panel);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-5">
      <section
        aria-label="Conversation with LifeLink"
        className={cn(
          "flex-1 px-1",
          hasMessages || loading
            ? "min-h-40 overflow-y-auto overscroll-contain"
            : "flex min-h-max items-end justify-center"
        )}
        onScroll={() => {
          const panel = viewport.current;

          if (panel) {
            followLatest.current =
              panel.scrollHeight - panel.scrollTop - panel.clientHeight <
              SCROLL_END_THRESHOLD;
          }
        }}
        ref={viewport}
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users must be able to scroll the transcript independently of the composer.
        tabIndex={hasMessages ? 0 : undefined}
      >
        <div className="mx-auto w-full max-w-4xl pb-2" ref={content}>
          <h2 className="sr-only">Your conversation</h2>
          {loading ? (
            <LoadingRows label="Loading your conversation" rows={2} />
          ) : null}
          {!loading && !hasMessages ? (
            <div className="mx-auto flex max-w-xl flex-col gap-3 pb-2 text-center">
              <h3 className="text-2xl font-semibold">What can I help with?</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Ask for a ride, write to family, or set a reminder. You’ll
                review the details before anything happens.
              </p>
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
              aria-label="Messages waiting for connection"
              className="mt-6 flex flex-col gap-4"
            >
              {queuedRequests.map((item) =>
                item.kind === "request" ? (
                  <li
                    className="bg-surface ml-auto max-w-xl rounded-xl px-5 py-4"
                    key={item.id}
                  >
                    <p className="text-lg wrap-anywhere whitespace-pre-wrap">
                      {item.text}
                    </p>
                    <p className="text-muted-foreground mt-2 text-base">
                      Waiting for a connection. Nothing has been sent.
                    </p>
                  </li>
                ) : null
              )}
            </ol>
          ) : null}
        </div>
      </section>
      <fieldset
        aria-label="Write or speak to LifeLink"
        className="mx-auto w-full max-w-4xl min-w-0 shrink-0 pb-[env(safe-area-inset-bottom)]"
        disabled={disabled || loading}
      >
        <Composer
          draft={draft}
          onDraftChange={onDraftChange}
          onSubmitted={() => {
            followLatest.current = true;
            const panel = viewport.current;

            if (panel) {
              panel.scrollTop = panel.scrollHeight;
            }
          }}
          threadId={threadId ?? undefined}
        />
      </fieldset>
      {!hasMessages && !loading ? <div className="min-h-0 flex-1" /> : null}
    </div>
  );
};

const AskWorkspace = () => {
  const threadId = useQuery(api.assistant.myThread);

  const history = usePaginatedQuery(
    api.assistant.listConversationHistory,
    {},
    { initialNumItems: 20 }
  );

  const newConversation = useMutation(api.assistant.newConversation);
  const selectConversation = useMutation(api.assistant.selectConversation);
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const workspace = useRef<HTMLDivElement>(null);

  const [conversationError, setConversationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    const element = workspace.current;
    const parent = element?.parentElement;

    if (!element || !parent) {
      return;
    }

    const fitViewport = (): void => {
      const top = element.getBoundingClientRect().top + globalThis.scrollY;

      // oxlint-disable-next-line unicorn/prefer-number-coercion -- Computed CSS lengths include the px suffix, which Number cannot parse.
      const bottomPadding = Number.parseFloat(
        getComputedStyle(parent).paddingBottom
      );

      const viewportHeight =
        globalThis.visualViewport?.height ?? globalThis.innerHeight;

      element.style.height = `${Math.max(0, viewportHeight - top - bottomPadding)}px`;
    };

    fitViewport();
    const observer = new ResizeObserver(fitViewport);
    observer.observe(parent);

    if (parent.parentElement) {
      observer.observe(parent.parentElement);
    }

    globalThis.addEventListener("resize", fitViewport);
    globalThis.visualViewport?.addEventListener("resize", fitViewport);

    return () => {
      observer.disconnect();
      globalThis.removeEventListener("resize", fitViewport);
      globalThis.visualViewport?.removeEventListener("resize", fitViewport);
    };
  }, []);

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
    <div
      className="flex h-[calc(100dvh-10rem)] min-h-[28rem] flex-col gap-4 sm:gap-6"
      ref={workspace}
    >
      <PageHeader
        className="shrink-0"
        actions={
          <>
            <Button
              aria-busy={busy}
              disabled={busy || threadId === undefined}
              onClick={() => switchConversation()}
              variant="ghost"
            >
              <PlusIcon aria-hidden="true" />
              New chat
            </Button>
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
            />
          </>
        }
        title="Ask LifeLink"
      />
      {conversationError ? <ErrorNote>{conversationError}</ErrorNote> : null}
      {threadId === undefined ? (
        <LoadingRows label="Opening your conversation" rows={2} />
      ) : (
        <Conversation
          disabled={busy}
          draft={threadId ? (drafts[threadId] ?? "") : ""}
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
    <LoadingRows label="Opening your conversation" rows={2} />
  );
};

export { AskScreen };
