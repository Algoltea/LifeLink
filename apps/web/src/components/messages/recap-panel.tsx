"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
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
import { LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { formatWhen } from "@/lib/format";

type Recap = Doc<"conversationRecaps">;

const LOCAL_WORDS: Record<NonNullable<Recap["localReason"]>, string> = {
  chosen:
    "Local recap: found by patterns, not full understanding. Nothing was sent to an AI provider.",
  failed:
    "Local recap. You asked for a cloud recap, but it didn’t finish. The provider may already have received these messages.",
  limit:
    "Local recap. Today’s limit for cloud recaps has been reached, so nothing more was sent.",
  practice:
    "Practice: a local recap. Practice messages are never sent to an AI provider.",
  unavailable:
    "Local recap. The cloud assistant isn’t set up, so nothing was sent to an AI provider.",
};

const methodWords = (recap: Recap): string =>
  recap.method === "cloud"
    ? "Cloud AI recap, requested with your permission. Every quote was checked against the messages."
    : LOCAL_WORDS[recap.localReason ?? "chosen"];

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
}) => (
  <blockquote className="text-muted-foreground text-base italic">
    {from === "them" ? contactName : "You"}: “{quote}”
  </blockquote>
);

const PrepareStep = ({ index, recap }: { index: number; recap: Recap }) => {
  const prepare = useMutation(api.recaps.prepareStep);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
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
        Prepared. Review it
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
      Prepare for review
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
  timeZone: string
): Step[] => {
  const steps: Step[] = [
    {
      content: (
        <Part title="In short">
          <p className="text-lg leading-relaxed">{recap.summary}</p>
        </Part>
      ),
      key: "summary",
    },
  ];

  if (recap.agreements.length > 0) {
    steps.push({
      content: (
        <Part title="Agreed">
          <ul className="flex flex-col gap-3">
            {recap.agreements.map((item) => (
              <li
                className="flex flex-col gap-1"
                key={`${item.offer.quote}-${item.acceptance.quote}`}
              >
                <span className="text-lg">{item.text}</span>
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
        <Part title="Offered, not yet agreed">
          <p className="text-muted-foreground text-base">
            An offer is not an agreement until the other person says yes.
          </p>
          <ul className="flex flex-col gap-3">
            {recap.offers.map((item) => (
              <li className="flex flex-col gap-1" key={item.offer.quote}>
                <span className="text-lg">{item.text}</span>
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
        <Part title="Still unclear">
          <ul className="flex list-disc flex-col gap-1 pl-6 text-lg">
            {recap.unclear.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Part>
      ),
      key: "unclear",
    });
  }

  steps.push({
    content: (
      <Part title="Done">
        {done.length === 0 ? (
          <p className="text-lg">
            LifeLink has no finished tasks with {contactName} from this time.
            What a message says is not counted as done.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground text-base">
              From LifeLink’s own records, not from what the messages say.
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
                    {formatWhen(task.updatedAt, timeZone)}
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
        <Part title="Possible next steps">
          <p className="text-muted-foreground text-base">
            Nothing happens until you prepare a step, review it, and approve it.
          </p>
          <ul className="flex flex-col gap-4">
            {recap.proposedSteps.map((step, index) => (
              <li
                className="border-rule flex flex-col gap-2 border-b pb-4"
                // Steps never reorder once saved.
                key={`${step.kind}-${index}`}
              >
                <span className="text-lg font-bold">
                  {step.kind === "send_message"
                    ? `Message to ${contactName}`
                    : "A reminder for you"}
                </span>
                <span className="text-base">{step.why}</span>
                {step.messageDraft ? (
                  <p className="text-lg leading-7 whitespace-pre-wrap">
                    {step.messageDraft}
                  </p>
                ) : null}
                {step.reminderTitle && step.remindAt !== null ? (
                  <p className="text-lg">
                    {step.reminderTitle}, {formatWhen(step.remindAt, timeZone)}
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

const spokenText = (recap: Recap): string =>
  [
    recap.summary,
    ...recap.agreements.map((item) => `Agreed: ${item.text}`),
    ...recap.offers.map((item) => `Offered, not yet agreed: ${item.text}`),
    ...recap.unclear.map((item) => `Still unclear: ${item}`),
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
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const [busy, setBusy] = useState(false);
  const consentId = useId();

  if (upgrade && practice) {
    return null;
  }

  let label = upgrade ? "Recap again" : "Recap this conversation";

  if (allowCloudAnalysis) {
    label = "Recap with cloud AI";
  }

  return (
    <div className="flex flex-col gap-3">
      {practice ? (
        <p className="text-base">
          In Practice mode, LifeLink recaps locally. Practice messages are never
          sent to an AI provider.
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
          <span>
            Use the cloud assistant for a fuller recap. Your recent messages
            with this person are sent to the AI provider. Leave unchecked for a
            local recap.
          </span>
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
  const { me, preferences } = usePreferences();
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";

  // Move focus to the panel when it opens.
  useEffect(() => {
    sectionRef.current?.focus();
  }, []);

  const practice =
    me?.profile?.demoMode === true || view?.recap.mode === "simulated";

  let body: ReactNode = <LoadingRows label="Loading the recap" rows={2} />;

  if (view === null) {
    body = (
      <>
        <p className="text-lg">
          LifeLink can sum up what you and {contactName} agreed, what was only
          offered, and what is still open.
        </p>
        <RequestForm
          contactId={contactId}
          practice={practice}
          upgrade={false}
        />
      </>
    );
  } else if (view?.recap.status === "recapping") {
    body = <p className="text-lg">Reading the conversation…</p>;
  } else if (view !== undefined) {
    const steps = sectionsOf(view.recap, contactName, view.done, timeZone);

    body = (
      <>
        <p className="text-base font-semibold">{methodWords(view.recap)}</p>
        {view.recap.droppedCount > 0 ? (
          <p className="text-base font-semibold">
            Some details the assistant gave were not in the messages word for
            word, or were offers rather than agreements, so they were changed or
            left out.
          </p>
        ) : null}
        <ReadAloudButton
          className="self-start"
          label="Read the recap aloud"
          text={spokenText(view.recap)}
        />
        {preferences.stepByStep ? (
          <OneAtATime noun="Part" steps={steps} />
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
          Recap with {contactName}
        </h2>
        <Button
          aria-label="Close the recap"
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
        <p className="text-muted-foreground text-base">
          Only you can see this. It is never sent or shared with family.
        </p>
      </div>
      {body}
    </section>
  );
};

export { RecapPanel };
