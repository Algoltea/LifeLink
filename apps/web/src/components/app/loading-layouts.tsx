import { Skeleton } from "@lifelink/ui/components/skeleton";
import { cn } from "@lifelink/ui/lib/utils";

import { CHAT_READING_COLUMN } from "@/components/assistant/chat-layout";
import { InboxSkeleton, ReaderSkeleton } from "@/components/email/email-bits";

import {
  CircleLoadingRows,
  SharingLoadingBody,
} from "./circle-loading-layouts";
import {
  DocumentsLoadingContent,
  DocumentsLoadingNotice,
  DocumentsLoadingPanes,
  DocumentsLoadingRows,
} from "./documents-loading-layouts";
import { EmailLoadingPanes } from "./email-loading-layouts";
import {
  MessagesLoadingRows,
  MessagesLoadingTranscript,
  RecapLoadingBody,
} from "./messages-loading-layouts";
import {
  TodayLoadingHeader,
  TodayLoadingSideLists,
} from "./today-loading-layouts";

/** Geometry measured against the Practice UI at 1440, 768, and 390 CSS pixels.
 * Keep dimensions in rem so placeholders follow the person's text-size setting.
 * Variable content uses representative rows, rather than promising a result count.
 */
type LoadingLayout =
  | "text"
  | "messages"
  | "contacts"
  | "email"
  | "email-selected"
  | "email-list"
  | "email-reader"
  | "files"
  | "documents"
  | "documents-page"
  | "documents-notice"
  | "connections"
  | "settings"
  | "today"
  | "briefing"
  | "task"
  | "task-panel"
  | "review"
  | "composer"
  | "thread"
  | "conversation"
  | "assistant-conversation"
  | "ask"
  | "history"
  | "groceries"
  | "checks"
  | "check-form"
  | "note"
  | "panel"
  | "sharing-body"
  | "recap-body"
  | "family";

const Line = ({ className }: { className?: string }) => (
  <div className={cn("flex h-7 max-w-full min-w-0 items-center", className)}>
    <Skeleton className="h-4 w-full" />
  </div>
);

const Lines = ({
  rows = 3,
  lineClassName,
  collapseLast = false,
}: {
  rows?: number;
  lineClassName?: string;
  collapseLast?: boolean;
}) => (
  <div className="flex min-w-0 flex-col">
    {Array.from({ length: rows }, (_unused, index) => (
      <Line
        className={cn(
          index === rows - 1 && "w-3/4",
          index === rows - 1 &&
            collapseLast &&
            "@min-[34rem]/task-panel:hidden",
          lineClassName
        )}
        key={index}
      />
    ))}
  </div>
);

const Heading = () => <Line className="h-8 w-2/3 max-w-80" />;

const Controls = () => (
  <div className="flex flex-wrap gap-3">
    <Skeleton className="h-12 w-40 max-w-full" />
    <Skeleton className="h-12 w-32 max-w-full" />
  </div>
);

const ComposerLayout = () => (
  <div
    data-loading-part="composer"
    className="@container/composer flex flex-col gap-4"
  >
    <div className="border-border bg-raised flex flex-col gap-2 rounded-3xl border p-3 pl-5">
      <Line className="h-12 w-full" />
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-control -ml-2 w-[6.389rem] rounded-full" />
        <Skeleton className="size-control rounded-full" />
      </div>
    </div>
    <div className="-mt-2 text-center">
      <Line className="mx-auto h-[1.333rem] w-11/12" />
      <Line className="mx-auto h-[1.333rem] w-2/3 sm:hidden" />
    </div>
  </div>
);

const AssistantConversationLayout = () => (
  <div className={cn(CHAT_READING_COLUMN, "flex flex-col gap-8")}>
    <div className="flex justify-end pl-10 sm:pl-16">
      <div className="bg-neutral-wash w-4/5 rounded-3xl px-5 py-3.5">
        <Lines rows={2} />
      </div>
    </div>
    <div className="flex gap-4">
      <Skeleton className="hidden size-9 shrink-0 rounded-full sm:block" />
      <div className="flex min-w-0 flex-1 flex-col gap-4 sm:pt-0.5">
        <Lines rows={4} />
        <div className="-ml-4 flex gap-1">
          <Skeleton className="h-control w-32" />
          <Skeleton className="h-control w-24" />
        </div>
      </div>
    </div>
  </div>
);

const AskLayout = () => (
  <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-5">
    <div
      data-chat-transcript=""
      className="flex min-h-max flex-1 items-end justify-center px-1"
    >
      <div className={cn(CHAT_READING_COLUMN, "pt-2 pb-4")}>
        <div className="flex flex-col items-center gap-2 pb-4">
          <Line className="h-[2.223rem] w-3/4 max-w-96 sm:h-[2.778rem]" />
          <Line className="h-[1.556rem] w-2/3 max-w-80" />
        </div>
      </div>
    </div>
    <div
      data-chat-composer=""
      className={cn(
        CHAT_READING_COLUMN,
        "min-w-0 shrink-0 pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <ComposerLayout />
    </div>
    <div className="min-h-0 flex-1">
      <div
        className={cn(
          CHAT_READING_COLUMN,
          "flex flex-wrap justify-center gap-3"
        )}
      >
        <Skeleton className="h-control w-[9.726rem] rounded-full" />
        <Skeleton className="h-control w-[10.318rem] rounded-full" />
        <Skeleton className="h-control w-[10.342rem] rounded-full" />
      </div>
    </div>
  </div>
);

const ReviewLayout = () => (
  <div className="flex min-w-0 flex-col gap-4">
    <Line className="w-2/3" />
    <Skeleton className="h-6 w-20 rounded-full" />
    <Lines collapseLast rows={2} />
    <div className="border-border flex flex-col gap-3 rounded-xl border p-6">
      <Line className="w-1/3" />
      <Lines collapseLast rows={3} />
    </div>
    <Controls />
    <Lines collapseLast rows={2} />
  </div>
);

const TaskPanelLayout = () => (
  <div
    data-loading-part="task-panel"
    className="bg-surface @container/task-panel flex min-h-[54.875rem] flex-col gap-6 rounded-xl px-5 py-6 sm:min-h-[39.25rem] sm:px-7 sm:py-7"
  >
    <div className="flex flex-wrap justify-between gap-4">
      <div className="min-w-0 flex-1">
        <Line className="h-12 w-3/4" />
        <Lines collapseLast rows={2} />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <ReviewLayout />
    <Line className="mt-auto h-12" />
  </div>
);

const ConversationLayout = () => (
  <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <div className="bg-surface ml-auto w-4/5 max-w-xl rounded-xl px-5 py-4">
      <Lines rows={2} />
    </div>
    <div className="flex w-full flex-col gap-3 px-1">
      <Lines rows={4} />
    </div>
  </div>
);

const FileRows = ({ rows }: { rows: number }) => (
  <div>
    {Array.from({ length: rows }, (_unused, index) => (
      <div
        className={cn(
          "border-rule flex items-center gap-4 border-t py-4",
          index > 0 && "min-h-[8.417rem] sm:min-h-0"
        )}
        key={index}
      >
        <Skeleton className="size-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <Line />
          <Line className="h-6 w-3/4" />
        </div>
        <Skeleton className="size-5 shrink-0" />
      </div>
    ))}
  </div>
);

const CONNECTION_LINES = [
  [4, 2],
  [3, 3],
  [2, 3],
] as const;

const ConnectionsLayout = () => (
  <div className="flex flex-col gap-7">
    {Array.from({ length: 3 }, (_unused, group) => (
      <div
        data-loading-part="connection-group"
        className="flex flex-col gap-4"
        key={group}
      >
        <Line className="h-[1.778rem] w-2/3 max-w-80" />
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }, (_empty, index) => (
            <div
              className="border-border bg-surface flex flex-col gap-5 rounded-xl border p-5 sm:p-6"
              data-loading-part="connection-card"
              key={index}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
                  <Line className="h-[1.556rem] w-3/4" />
                  <Lines
                    lineClassName="h-[1.556rem]"
                    rows={CONNECTION_LINES[group]?.[index] ?? 2}
                  />
                  {group === 0 && index === 0 ? (
                    <Line className="hidden h-[1.556rem] md:flex xl:hidden" />
                  ) : null}
                </div>
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <div className="flex flex-wrap gap-1">
                {Array.from(
                  { length: group === 1 ? 5 : 2 },
                  (_unusedIcon, icon) => (
                    <Skeleton
                      className="size-[52px] sm:size-[64px]"
                      key={icon}
                    />
                  )
                )}
              </div>
              <div className="border-border mt-auto flex justify-between gap-3 border-t pt-4">
                <Line className="h-[1.333rem] w-1/2" />
                <Line className="h-[1.333rem] w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
    <div className="border-border bg-parchment flex items-center gap-4 rounded-xl border px-5 py-4 sm:px-6">
      <Skeleton className="size-12 shrink-0" />
      <div className="min-w-0 flex-1">
        <Line />
        <Line className="h-6" />
      </div>
    </div>
  </div>
);

const SettingField = () => (
  <div className="flex min-w-0 flex-col gap-2">
    <Line className="h-[1.333rem] w-3/4" />
    <Skeleton className="h-control w-full" />
  </div>
);

const HelpSettingsLayout = () => (
  <div
    data-loading-part="help"
    className="border-rule flex min-h-[90.444rem] min-w-0 flex-col border-t pt-6 sm:min-h-[70.194rem] xl:min-h-[73.694rem]"
  >
    <Heading />
    <div className="py-6">
      <Lines rows={2} />
    </div>
    <div className="flex flex-col gap-3 pb-5">
      <Line className="w-1/2" />
      <Lines rows={2} />
      <Controls />
    </div>
    <div className="border-rule flex items-center gap-6 border-t py-5">
      <div className="min-w-0 flex-1">
        <Line />
        <Lines rows={2} />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
    <div className="border-rule flex flex-col gap-3 border-t py-5">
      <Line className="w-1/2" />
      <Lines rows={4} />
      <Skeleton className="h-12 w-48" />
    </div>
    <div className="border-rule flex flex-1 flex-col gap-3 border-t py-5">
      <Line />
      <Lines rows={3} />
      <Skeleton className="h-28 w-full" />
      <Line className="w-1/2" />
      <Lines rows={2} />
      <Skeleton className="h-12 w-40" />
    </div>
  </div>
);

const DisplaySettingsLayout = () => (
  <div
    data-loading-part="display"
    className="border-rule flex min-h-[86.14rem] min-w-0 flex-col border-t pt-6 sm:min-h-[62.222rem]"
  >
    <Line className="h-8 w-2/3" />
    <div className="pb-6">
      <Line className="h-6" />
      <Line className="sm:hidden" />
    </div>
    {[0, 1, 2].map((index) => (
      <div
        className={cn(
          "border-rule flex flex-col gap-3 border-t py-5",
          index === 0 && "border-t-0 pt-0"
        )}
        key={index}
      >
        <div>
          <Line className="h-6 w-1/3" />
          {index < 2 ? <Lines rows={1} /> : null}
        </div>
        <Skeleton className="h-12 w-80 max-w-full" />
      </div>
    ))}
    {[0, 1, 2].map((index) => (
      <div
        className="border-rule flex flex-col items-start gap-4 border-t py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
        key={index}
      >
        <div className="min-w-0 flex-1">
          <Line className="h-6 w-3/4" />
          <Lines rows={1} />
        </div>
        <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
      </div>
    ))}
    <div className="border-rule flex flex-col gap-3 border-t py-5">
      <Line className="h-6 w-1/3" />
      <Line className="h-6" />
      <Skeleton className="h-12 w-80 max-w-full" />
    </div>
    <Skeleton className="mt-auto h-10 w-40" />
  </div>
);

const ProfileSettingsLayout = () => (
  <div
    data-loading-part="profile"
    className="border-rule flex min-h-[47.583rem] min-w-0 flex-col gap-5 border-t pt-6 sm:min-h-[28.778rem]"
  >
    <Heading />
    <Line className="h-[1.556rem]" />
    <Line className="h-[1.556rem] sm:hidden" />
    <div className="grid gap-5 sm:grid-cols-2">
      {[0, 1, 2, 3, 4, 5].map((key) => (
        <SettingField key={key} />
      ))}
    </div>
    <Skeleton className="h-control w-40" />
  </div>
);

const SettingsLayout = () => (
  <div className="grid items-start gap-8 xl:grid-cols-2">
    <DisplaySettingsLayout />
    <div className="flex min-w-0 flex-col gap-8">
      <ProfileSettingsLayout />
      <HelpSettingsLayout />
      <div
        data-loading-part="practice"
        className="bg-surface flex min-h-[31.083rem] flex-col gap-4 rounded-xl p-5 sm:min-h-[22.25rem] sm:p-6 xl:min-h-96"
      >
        <Heading />
        <Lines rows={5} />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Lines rows={3} />
      </div>
      <div
        data-loading-part="accounts"
        className="border-rule flex min-h-[14.306rem] flex-col gap-3 border-t pt-6"
      >
        <Heading />
        <div className="flex flex-col gap-2">
          <Line className="h-12" />
          <Line className="h-12" />
          <Line className="h-12" />
        </div>
      </div>
    </div>
  </div>
);

const CONTACT_HEIGHTS = [
  "min-h-[13rem] sm:min-h-[7.833rem]",
  "min-h-[14.5rem] sm:min-h-[9.333rem]",
  "min-h-[18.5rem] sm:min-h-[13.333rem]",
];

const ContactRows = ({ rows }: { rows: number }) => (
  <div>
    {Array.from({ length: rows }, (_unused, index) => (
      <div
        className={cn(
          "border-rule grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-t py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]",
          CONTACT_HEIGHTS[index % CONTACT_HEIGHTS.length]
        )}
        key={index}
      >
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-col gap-1">
          <Line className="w-3/4" />
          <Line className="h-6" />
          <Line className="h-6" />
          {index > 0 ? <Line className="h-6" /> : null}
          {index > 1 ? <Skeleton className="mt-3 h-16 w-full" /> : null}
        </div>
        <div className="col-start-2 flex gap-2 sm:col-start-auto">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
        </div>
      </div>
    ))}
  </div>
);

const TodayLayout = () => (
  <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
    <div className="flex min-w-0 flex-col gap-6">
      <Heading />
      <TaskPanelLayout />
      <ComposerLayout />
    </div>
    <TodayLoadingSideLists />
  </div>
);

const TaskLayout = () => (
  <div className="flex flex-col gap-7">
    <Line className="h-[1.556rem] w-1/2" />
    <div className="flex flex-col gap-2">
      <Line className="h-[2.223rem] w-3/4" />
      <Line className="h-[1.556rem]" />
    </div>
    <div className="grid items-start gap-9 @min-[56rem]/content:grid-cols-[minmax(0,1fr)_22.5rem]">
      <div className="flex min-w-0 flex-col gap-8">
        <div className="@container/task-panel min-h-[24.75rem]">
          <ReviewLayout />
        </div>
        <Heading />
        <ConversationLayout />
      </div>
      <div className="flex min-w-0 flex-col gap-8">
        <div className="bg-surface flex flex-col gap-3 rounded-xl p-6">
          <Heading />
          <Lines rows={4} />
        </div>
        <Heading />
        <ContactRows rows={3} />
      </div>
    </div>
  </div>
);

const GroceryRows = () => (
  <div>
    {[0, 1, 2, 3, 4].map((key) => (
      <div
        className="border-rule flex items-center gap-4 border-t py-3"
        key={key}
      >
        <Skeleton className="size-6 shrink-0" />
        <div className="min-w-0 flex-1">
          <Line className="h-[1.556rem]" />
          <Line className="h-[1.333rem] w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const GroceriesLayout = () => (
  <div className="flex flex-col gap-6">
    <Skeleton className="h-12 w-48" />
    <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div
        data-loading-part="grocery-workspace"
        className="flex min-h-[68.028rem] min-w-0 flex-col gap-5 sm:min-h-[60.111rem]"
      >
        <div>
          <Heading />
          <Line className="w-32" />
        </div>
        <div className="flex flex-col">
          {[0, 1, 2].map((key) => (
            <div className="flex justify-between gap-4" key={key}>
              <Line className="w-40" />
              <Line className="w-20" />
            </div>
          ))}
        </div>
        <Controls />
        <Line className="h-12 w-40" />
        <GroceryRows />
        <Lines rows={2} />
        <Lines rows={2} />
        <Line className="h-12 w-48" />
        <Controls />
      </div>
      <div
        data-loading-part="receipt"
        className="border-border bg-parchment flex min-h-[34.555rem] min-w-0 flex-col gap-4 rounded-xl border p-6 sm:min-h-[31.055rem] xl:min-h-[32.805rem]"
      >
        <Heading />
        <Line className="w-3/4" />
        <div>
          {[0, 1, 2, 3, 4].map((key) => (
            <div className="flex gap-3" key={key}>
              <Line className="min-w-0 flex-1" />
              <Line className="w-14" />
            </div>
          ))}
        </div>
        <Lines rows={4} />
      </div>
    </div>
  </div>
);

const OtherLayout = ({
  layout,
  rows,
}: {
  layout: LoadingLayout;
  rows: number;
}) => {
  switch (layout) {
    case "documents-page": {
      return <DocumentsLoadingContent rows={rows} />;
    }

    case "documents-notice": {
      return <DocumentsLoadingNotice />;
    }

    case "email": {
      return <EmailLoadingPanes />;
    }

    case "email-selected": {
      return <EmailLoadingPanes selected />;
    }

    case "history": {
      return (
        <div className="-mx-3 -mt-3" data-loading-part="history">
          {Array.from({ length: Math.ceil(rows / 2) }, (_unused, group) => (
            <div key={group}>
              <div className="px-3 pt-5 pb-1">
                <Line className="h-[1.333rem] w-20" />
              </div>
              <div className="flex flex-col gap-0.5">
                {Array.from(
                  { length: Math.min(2, rows - group * 2) },
                  (_row, index) => (
                    <div
                      className="min-h-control flex w-full items-center gap-3 rounded-lg px-3 py-2.5"
                      key={index}
                    >
                      <div className="min-w-0 flex-1">
                        <Line className="h-[1.333rem]" />
                        {index === 1 ? (
                          <Line className="h-[1.333rem] w-2/3" />
                        ) : null}
                      </div>
                      <Skeleton className="h-3 w-14 shrink-0" />
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "groceries": {
      return <GroceriesLayout />;
    }

    case "checks": {
      return (
        <div>
          {Array.from({ length: rows }, (_unused, index) => (
            <div
              className="border-rule flex flex-col gap-3 border-t px-3 py-4"
              key={index}
            >
              <Lines rows={2} />
              <Line className="w-1/2" />
              <Line className="h-6 w-32" />
            </div>
          ))}
        </div>
      );
    }

    case "check-form": {
      return (
        <div className="bg-surface flex flex-col gap-4 rounded-xl p-5 sm:p-7">
          <Heading />
          <Lines rows={2} />
          <Skeleton className="h-28 w-full" />
          <Controls />
          <Lines rows={3} />
          <Controls />
        </div>
      );
    }

    case "note": {
      return (
        <div className="border-border bg-parchment rounded-lg border px-5 py-4">
          <Lines rows={2} />
        </div>
      );
    }

    case "recap-body": {
      return <RecapLoadingBody />;
    }

    case "panel": {
      return (
        <div className="flex flex-col gap-4">
          <Lines rows={3} />
          <Controls />
          <Lines rows={2} />
        </div>
      );
    }

    case "family": {
      return (
        <div className="border-border bg-raised flex max-w-prose flex-col gap-8 rounded-xl border p-5 sm:p-6">
          <Heading />
          <Lines rows={3} />
          <Heading />
          <FileRows rows={2} />
        </div>
      );
    }

    default: {
      return <Lines rows={rows} />;
    }
  }
};

const LoadingLayoutBody = ({
  layout,
  rows,
}: {
  layout: LoadingLayout;
  rows: number;
}) => {
  switch (layout) {
    case "messages": {
      return <MessagesLoadingRows rows={rows} />;
    }

    case "sharing-body": {
      return <SharingLoadingBody />;
    }

    case "contacts": {
      return <CircleLoadingRows rows={rows} />;
    }

    case "email-list": {
      return <InboxSkeleton label="Loading emails" rows={rows} />;
    }

    case "email-reader": {
      return (
        <div className="min-w-0 [&_div]:min-w-0">
          <ReaderSkeleton label="Loading email" />
        </div>
      );
    }

    case "files": {
      return <DocumentsLoadingRows rows={rows} />;
    }

    case "documents": {
      return <DocumentsLoadingPanes rows={rows} />;
    }

    case "connections": {
      return <ConnectionsLayout />;
    }

    case "settings": {
      return <SettingsLayout />;
    }

    case "briefing": {
      return <TodayLoadingHeader />;
    }

    case "today": {
      return <TodayLayout />;
    }

    case "task": {
      return <TaskLayout />;
    }

    case "task-panel": {
      return <TaskPanelLayout />;
    }

    case "review": {
      return (
        <div className="flex flex-col gap-4">
          <Heading />
          <ReviewLayout />
        </div>
      );
    }

    case "composer": {
      return <ComposerLayout />;
    }

    case "thread": {
      return <MessagesLoadingTranscript />;
    }

    case "conversation": {
      return <ConversationLayout />;
    }

    case "assistant-conversation": {
      return <AssistantConversationLayout />;
    }

    case "ask": {
      return <AskLayout />;
    }

    default: {
      return <OtherLayout layout={layout} rows={rows} />;
    }
  }
};

export { LoadingLayoutBody };

export type { LoadingLayout };
