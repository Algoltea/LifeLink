"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { Button } from "@lifelink/ui/components/button";
import { useMutation, useQuery } from "convex/react";
import { XIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { toast } from "sonner";

import { ModePill, ReadAloudButton } from "@/components/app/bits";
import { OneAtATime } from "@/components/app/one-at-a-time";
import type { Step } from "@/components/app/one-at-a-time";
import { usePreferences } from "@/components/app/preferences";
import { usePresentationDemo } from "@/components/app/presentation-demo";
import { LoadingRows } from "@/components/app/states";
import { useLocale, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { messageOf } from "@/lib/errors";
import { formatWhen } from "@/lib/format";

type Recap = Doc<"conversationRecaps">;

type Words = Messages["recap"];

const methodWords = (
  recap: Recap,
  t: Words,
  presentationDemo: boolean
): string => {
  if (recap.method === "cloud") {
    return t.cloud;
  }

  if (presentationDemo && recap.localReason === "practice") {
    return t.local.chosen;
  }

  return t.local[recap.localReason ?? "chosen"];
};

/** Local recaps are written by LifeLink in English; cloud recaps already use the person's language. */
const recapText = (
  recap: Recap,
  text: string,
  locale: InterfaceLocale
): string =>
  recap.method === "local" ? translateServerMessage(text, locale) : text;

const Part = ({ children, title }: { children: ReactNode; title: string }) => {
  const id = useId();

  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h3 className="text-xl font-semibold" id={id}>
        {title}
      </h3>
      {children}
    </section>
  );
};

const Said = ({
  contactName,
  from,
  quote,
}: {
  contactName: string;
  from: "them" | "you";
  quote: string;
}) => {
  const t = useMessages().recap;

  return (
    <blockquote className="text-muted-foreground text-base italic">
      {from === "them" ? contactName : t.you}: “{quote}”
    </blockquote>
  );
};

const PrepareStep = ({ index, recap }: { index: number; recap: Recap }) => {
  const prepare = useMutation(api.recaps.prepareStep);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const t = useMessages().recap;
  const step = recap.proposedSteps[index];

  if (step === undefined) {
    return null;
  }

  if (step.taskId !== null) {
    return (
      <Link
        className="text-lg font-semibold underline"
        // SAFETY: a stored task id, and /tasks/[taskId] is a real route.
        href={`/tasks/${step.taskId}` as Route}
      >
        {t.prepared}
      </Link>
    );
  }

  return (
    <Button
      aria-busy={busy}
      className="self-start whitespace-normal"
      disabled={busy}
      onClick={async () => {
        setBusy(true);

        try {
          const taskId = await prepare({ index, recapId: recap._id });

          // SAFETY: the mutation just returned this task id, and /tasks/[taskId] is a real route.
          router.push(`/tasks/${taskId}` as Route);
        } catch (error) {
          toast.error(messageOf(error instanceof Error ? error : null));
          setBusy(false);
        }
      }}
      variant="outline"
    >
      {t.prepare}
    </Button>
  );
};

const sectionsOf = (
  recap: Recap,
  contactName: string,
  done: {
    id: Id<"tasks">;
    mode: "live" | "simulated";
    title: string;
    updatedAt: number;
  }[],
  timeZone: string,
  t: Words,
  locale: InterfaceLocale
): Step[] => {
  const steps: Step[] = [
    {
      content: (
        <Part title={t.inShort}>
          <p className="text-lg leading-relaxed">
            {recapText(recap, recap.summary, locale)}
          </p>
        </Part>
      ),
      key: "summary",
    },
  ];

  if (recap.agreements.length > 0) {
    steps.push({
      content: (
        <Part title={t.agreed}>
          <ul className="flex flex-col gap-3">
            {recap.agreements.map((item) => (
              <li
                className="flex flex-col gap-1"
                key={`${item.offer.quote}-${item.acceptance.quote}`}
              >
                <span className="text-lg">
                  {recapText(recap, item.text, locale)}
                </span>
                <Said contactName={contactName} {...item.offer} />
                <Said contactName={contactName} {...item.acceptance} />
              </li>
            ))}
          </ul>
        </Part>
      ),
      key: "agreed",
    });
  }

  if (recap.offers.length > 0) {
    steps.push({
      content: (
        <Part title={t.offered}>
          <p className="text-muted-foreground text-base">{t.offerNote}</p>
          <ul className="flex flex-col gap-3">
            {recap.offers.map((item) => (
              <li className="flex flex-col gap-1" key={item.offer.quote}>
                <span className="text-lg">
                  {recapText(recap, item.text, locale)}
                </span>
                <Said contactName={contactName} {...item.offer} />
              </li>
            ))}
          </ul>
        </Part>
      ),
      key: "offered",
    });
  }

  if (recap.unclear.length > 0) {
    steps.push({
      content: (
        <Part title={t.stillUnclear}>
          <ul className="flex list-disc flex-col gap-1 pl-6 text-lg">
            {recap.unclear.map((item) => (
              <li key={item}>{recapText(recap, item, locale)}</li>
            ))}
          </ul>
        </Part>
      ),
      key: "unclear",
    });
  }

  steps.push({
    content: (
      <Part title={t.done}>
        {done.length === 0 ? (
          <p className="text-lg">{t.noFinishedTasks(contactName)}</p>
        ) : (
          <>
            <p className="text-muted-foreground text-base">
              {t.doneFromRecords}
            </p>
            <ul className="flex flex-col gap-2 text-lg">
              {done.map((task) => (
                <li className="flex flex-wrap items-center gap-2" key={task.id}>
                  <Link
                    className="underline"
                    // SAFETY: a stored task id, and /tasks/[taskId] is a real route.
                    href={`/tasks/${task.id}` as Route}
                  >
                    {task.title}
                  </Link>
                  <span className="text-muted-foreground text-base">
                    {formatWhen(task.updatedAt, timeZone, locale)}
                  </span>
                  <ModePill mode={task.mode} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Part>
    ),
    key: "done",
  });

  if (recap.proposedSteps.length > 0) {
    steps.push({
      content: (
        <Part title={t.nextSteps}>
          <p className="text-muted-foreground text-base">{t.nextStepsHint}</p>
          <ul className="flex flex-col gap-4">
            {recap.proposedSteps.map((step, index) => (
              <li
                className="border-rule flex flex-col gap-2 border-b pb-4"
                // Steps never reorder once saved.
                key={`${step.kind}-${index}`}
              >
                <span className="text-lg font-bold">
                  {step.kind === "send_message"
                    ? t.messageTo(contactName)
                    : t.reminderForYou}
                </span>
                <span className="text-base">
                  {recapText(recap, step.why, locale)}
                </span>
                {step.messageDraft ? (
                  <p className="text-lg leading-7 whitespace-pre-wrap">
                    {step.messageDraft}
                  </p>
                ) : null}
                {step.reminderTitle && step.remindAt !== null ? (
                  <p className="text-lg">
                    {step.reminderTitle},{" "}
                    {formatWhen(step.remindAt, timeZone, locale)}
                  </p>
                ) : null}
                <PrepareStep index={index} recap={recap} />
              </li>
            ))}
          </ul>
        </Part>
      ),
      key: "next",
    });
  }

  return steps;
};

const spokenText = (recap: Recap, t: Words, locale: InterfaceLocale): string =>
  [
    recapText(recap, recap.summary, locale),
    ...recap.agreements.map((item) =>
      t.agreedSpoken(recapText(recap, item.text, locale))
    ),
    ...recap.offers.map((item) =>
      t.offeredSpoken(recapText(recap, item.text, locale))
    ),
    ...recap.unclear.map((item) =>
      t.unclearSpoken(recapText(recap, item, locale))
    ),
  ].join(" ");

const RequestForm = ({
  contactId,
  practice,
  upgrade,
}: {
  contactId: Id<"contacts">;
  practice: boolean;
  upgrade: boolean;
}) => {
  const request = useMutation(api.recaps.request);
  const presentationDemo = usePresentationDemo();
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const [busy, setBusy] = useState(false);
  const consentId = useId();
  const t = useMessages().recap;

  if (upgrade && practice) {
    return null;
  }

  let label = upgrade ? t.recapAgain : t.recapThis;

  if (allowCloudAnalysis) {
    label = t.recapWithCloud;
  }

  return (
    <div className="flex flex-col gap-3">
      {practice ? (
        <p className="text-base">
          {presentationDemo ? t.local.chosen : t.practiceNote}
        </p>
      ) : (
        <label
          className="hover:text-accent-foreground flex min-h-12 cursor-pointer items-start gap-3 text-base leading-relaxed transition-colors"
          htmlFor={consentId}
        >
          <input
            checked={allowCloudAnalysis}
            className="accent-primary mt-1 size-5 shrink-0"
            id={consentId}
            onChange={(event) => setAllowCloudAnalysis(event.target.checked)}
            type="checkbox"
          />
          <span>{t.cloudConsent}</span>
        </label>
      )}
      <Button
        aria-busy={busy}
        className="self-start whitespace-normal"
        disabled={busy || (upgrade && !allowCloudAnalysis)}
        onClick={async () => {
          setBusy(true);

          try {
            await request({ allowCloudAnalysis, contactId });
          } catch (error) {
            toast.error(messageOf(error instanceof Error ? error : null));
          }

          setBusy(false);
        }}
        variant={upgrade ? "outline" : "default"}
      >
        {label}
      </Button>
    </div>
  );
};

/**
 * A private recap of the recent conversation with one contact: what was
 * agreed, what was only offered, what is unclear, and what LifeLink's records
 * show as done. Proposed steps go through the usual review and approval.
 */
const RecapPanel = ({
  contactId,
  contactName,
  onClose,
  returnFocusRef,
}: {
  contactId: Id<"contacts">;
  contactName: string;
  onClose: () => void;
  returnFocusRef?: RefObject<HTMLButtonElement | null>;
}) => {
  const view = useQuery(api.recaps.forContact, { contactId });
  const presentationDemo = usePresentationDemo();
  const { me, preferences } = usePreferences();
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const locale = useLocale();
  const t = useMessages().recap;
  const timeZone = me?.profile?.timeZone ?? "America/New_York";

  // Move focus to the panel when it opens.
  useEffect(() => {
    sectionRef.current?.focus();
  }, []);

  const practice =
    me?.profile?.demoMode === true || view?.recap.mode === "simulated";

  let body: ReactNode = (
    <LoadingRows layout="recap-body" label={t.loading} rows={2} />
  );

  if (view === null) {
    body = (
      <>
        <p className="text-lg">{t.intro(contactName)}</p>
        <RequestForm
          contactId={contactId}
          practice={practice}
          upgrade={false}
        />
      </>
    );
  } else if (view?.recap.status === "recapping") {
    body = <p className="text-lg">{t.reading}</p>;
  } else if (view !== undefined) {
    const steps = sectionsOf(
      view.recap,
      contactName,
      view.done,
      timeZone,
      t,
      locale
    );

    body = (
      <>
        <p className="text-base font-semibold">
          {methodWords(view.recap, t, presentationDemo)}
        </p>
        {view.recap.droppedCount > 0 ? (
          <p className="text-base font-semibold">{t.changedNote}</p>
        ) : null}
        <ReadAloudButton
          className="self-start"
          label={t.readAloud}
          text={spokenText(view.recap, t, locale)}
        />
        {preferences.stepByStep ? (
          <OneAtATime noun={t.part} steps={steps} />
        ) : (
          steps.map((step) => <div key={step.key}>{step.content}</div>)
        )}
        <RequestForm
          contactId={contactId}
          practice={practice}
          upgrade={view.recap.method === "local"}
        />
      </>
    );
  }

  return (
    <section
      aria-labelledby={headingId}
      aria-live="polite"
      className="bg-surface text-foreground flex min-w-0 scroll-mt-24 flex-col gap-4 rounded-xl px-5 py-6"
      id="recap-panel"
      ref={sectionRef}
      tabIndex={-1}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl leading-8 font-semibold" id={headingId}>
          {t.title(contactName)}
        </h2>
        <Button
          aria-label={t.close}
          onClick={() => {
            if (returnFocusRef?.current?.isConnected) {
              returnFocusRef.current.focus();
            }

            onClose?.();
          }}
          size="icon"
          type="button"
          variant="ghost"
        >
          <XIcon />
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {view ? <ModePill mode={view.recap.mode} /> : null}
        <p className="text-muted-foreground text-base">{t.onlyYou}</p>
      </div>
      {body}
    </section>
  );
};

export { RecapPanel };
