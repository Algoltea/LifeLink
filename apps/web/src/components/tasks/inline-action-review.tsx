"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { useId } from "react";

import { LoadingRows } from "@/components/app/states";
import { useLocale, useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";

import { ActionReview } from "./action-review";

/** Tool output supplies identity only; the server supplies the current version. */
const InlineActionReview = ({ actionId }: { actionId: string }) => {
  const review = useQuery(api.assistant.actionReview, { actionId });
  const headingId = useId();
  const t = useMessages().tasks;
  const locale = useLocale();

  if (review === undefined) {
    return <LoadingRows layout="review" label={t.loadingLatest} rows={2} />;
  }

  if (review === null) {
    return <p className="text-muted-foreground text-lg">{t.detailsGone}</p>;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="border-border bg-raised overflow-hidden rounded-2xl border"
    >
      <h3
        className="border-border bg-parchment border-b px-5 py-3.5 text-lg font-semibold"
        id={headingId}
      >
        {translateServerMessage(review.title, locale)}
      </h3>
      <div className="p-5">
        <ActionReview
          hue={review.hue}
          timeZone={review.timeZone}
          view={review.view}
        />
      </div>
    </section>
  );
};

/** Older replies stored a task ID. Resolve its actions without leaving chat. */
const InlineTaskReview = ({ taskId }: { taskId: string }) => {
  const actionIds = useQuery(api.assistant.taskActionIds, { taskId });
  const t = useMessages().tasks;

  if (actionIds === undefined) {
    return <LoadingRows layout="review" label={t.loadingLatest} rows={2} />;
  }

  if (actionIds.length === 0) {
    return (
      <p className="text-muted-foreground text-lg">
        {t.nothingToApproveRequest}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {actionIds.map((actionId) => (
        <InlineActionReview actionId={actionId} key={actionId} />
      ))}
    </div>
  );
};

export { InlineActionReview, InlineTaskReview };
