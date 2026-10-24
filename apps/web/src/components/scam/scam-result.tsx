"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Label } from "@lifelink/ui/components/label";
import { useMutation, useQuery } from "convex/react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { ModePill, ReadAloudButton } from "@/components/app/bits";
import { ErrorNote } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { ago } from "@/lib/format";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type Verdict = Doc<"scamReviews">["verdict"];

const VERDICT_WORDS: Record<
  Verdict,
  { label: string; tone: "negative" | "neutral" | "positive" | "warning" }
> = {
  likely_safe: { label: "No clear warning signs", tone: "neutral" },
  likely_scam: { label: "Likely a scam", tone: "negative" },
  suspicious: { label: "Suspicious", tone: "warning" },
  unsure: { label: "Not verified", tone: "neutral" },
};

const CONFIDENCE_WORDS: Record<Doc<"scamReviews">["confidence"], string> = {
  high: "High confidence in this assessment. This still cannot verify the sender.",
  low: "Limited confidence. A second opinion can help.",
  medium: "Some warning signs are present. Verify the request independently.",
};

const KIND_WORDS: Record<Doc<"scamReviews">["inputKind"], string> = {
  email: "An email",
  screenshot: "A screenshot",
  text: "A message",
};

const checkMethod = (review: Doc<"scamReviews">): string => {
  if (!review.model.startsWith("rules")) {
    return review.cloudAnalysisConsent === true
      ? "Cloud AI assessment, requested with your permission."
      : "Cloud AI assessment from an earlier check.";
  }

  if (review.cloudAnalysisConsent === undefined) {
    return "Local rules result. This older record does not include cloud-processing history.";
  }

  if (review.cloudAnalysisConsent) {
    return "Local rules result. You requested cloud analysis, but it was unavailable or did not finish; it may already have received this content.";
  }

  return "Checked locally with common warning rules. No content was sent to an AI provider for this result.";
};

/** Ask someone trusted to double-check. The suspicious message itself is never forwarded. */
const AskSomeone = ({ review }: { review: Doc<"scamReviews"> }) => {
  const contacts = useQuery(api.contacts.list);
  const ask = useMutation(api.scam.askTrustedContact);
  const router = useRouter();

  const trusted =
    contacts?.filter(
      (contact) => contact.trusted && contact.channels.length > 0
    ) ?? [];

  const [contactId, setContactId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const selectId = useId();

  const chosen =
    trusted.find((contact) => contact._id === contactId) ?? trusted[0];

  if (review.verificationTaskId !== null) {
    return (
      <p className="text-lg">
        A request for help has been prepared.{" "}
        <Link
          className="font-semibold underline"
          // SAFETY: a stored task id, and /tasks/[taskId] is a real route.
          href={`/tasks/${review.verificationTaskId}` as Route}
        >
          Review its status
        </Link>
      </p>
    );
  }

  if (contacts === undefined) {
    return null;
  }

  if (trusted.length === 0) {
    return (
      <p className="text-lg">
        To ask someone to double-check, first mark a person as trusted in your{" "}
        <Link className="font-semibold underline" href="/circle">
          Trusted circle
        </Link>
        .
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault();

        if (chosen === undefined) {
          return;
        }

        setBusy(true);

        try {
          const taskId = await ask({
            contactId: chosen._id,
            reviewId: review._id,
          });

          // SAFETY: the mutation just returned this task id, and /tasks/[taskId] is a real route.
          router.push(`/tasks/${taskId}` as Route);
        } catch (error) {
          toast.error(errorText(error));
          setBusy(false);
        }
      }}
    >
      <Label htmlFor={selectId}>Ask someone you trust to check it</Label>
      <div className="flex flex-wrap gap-3">
        <select
          className="border-control bg-raised text-foreground min-h-12 max-w-full rounded-md border px-4 text-base"
          id={selectId}
          onChange={(event) => setContactId(event.target.value)}
          value={chosen?._id ?? ""}
        >
          {trusted.map((contact) => (
            <option key={contact._id} value={contact._id}>
              {contact.name} ({contact.relationship || "Trusted"})
            </option>
          ))}
        </select>
        <Button
          aria-busy={busy}
          className="hover:text-primary-foreground rounded-md whitespace-normal"
          disabled={busy}
          type="submit"
        >
          Prepare a message to {chosen?.name.split(" ")[0] ?? "them"}
        </Button>
      </div>
      <p className="text-muted-foreground text-base">
        You’ll see the exact words before anything is sent. The suspicious
        message and its links are not forwarded.
      </p>
    </form>
  );
};

const ScamResult = ({
  review,
  timeZone,
}: {
  review: Doc<"scamReviews">;
  timeZone: string;
}) => {
  const resultRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (review.status !== "reviewing") {
      resultRef.current?.focus();
    }
  }, [review.status]);

  if (review.status === "reviewing") {
    return (
      <section
        aria-live="polite"
        className="bg-surface text-foreground flex flex-col gap-2 rounded-xl px-5 py-6"
        ref={resultRef}
        tabIndex={-1}
      >
        <h2 className="text-2xl font-semibold">Checking…</h2>
        <p className="text-lg">
          This usually takes a few seconds. Until then, please don’t click
          links, call numbers in it, or pay anyone.
        </p>
      </section>
    );
  }

  if (review.status === "failed") {
    return (
      <section aria-live="polite" ref={resultRef} tabIndex={-1}>
        <ErrorNote>
          The check didn’t finish. Treat the message with care, and ask someone
          you trust if you’re unsure.
        </ErrorNote>
        <div className="pt-4">
          <AskSomeone review={review} />
        </div>
      </section>
    );
  }

  const verdict = VERDICT_WORDS[review.verdict];

  const spoken = [
    `${verdict.label}.`,
    review.explanation,
    ...review.nextSteps,
  ].join(" ");

  return (
    <article
      aria-labelledby={`review-${review._id}`}
      aria-live="polite"
      className="border-border bg-raised text-foreground flex min-w-0 flex-col gap-6 rounded-xl border px-5 py-6 wrap-anywhere sm:px-7"
      ref={resultRef}
      tabIndex={-1}
    >
      <header className="border-rule flex flex-col gap-3 border-b pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <ModePill mode={review.mode} />
          <span className="text-muted-foreground text-base">
            {KIND_WORDS[review.inputKind]} · {ago(review.createdAt, timeZone)}
          </span>
        </div>
        <h2
          className="text-2xl leading-tight font-semibold"
          id={`review-${review._id}`}
        >
          {verdict.label}
        </h2>
        <p className="max-w-prose text-lg leading-relaxed">
          {review.explanation}
        </p>
        <p className="text-base font-semibold">{checkMethod(review)}</p>
        <p className="text-muted-foreground text-base">
          This result cannot prove that a message is genuine. Confirm unexpected
          requests through a contact you already know.
        </p>
        <p className="text-muted-foreground text-base">
          {CONFIDENCE_WORDS[review.confidence]}
        </p>
        <ReadAloudButton
          className="self-start"
          label="Read the result aloud"
          text={spoken}
        />
      </header>

      {review.signals.length > 0 ? (
        <section
          aria-labelledby={`signals-${review._id}`}
          className="flex flex-col gap-3"
        >
          <h3 className="text-xl font-semibold" id={`signals-${review._id}`}>
            What stood out
          </h3>
          <ul className="flex flex-col gap-4">
            {review.signals.map((signal) => (
              <li
                className="border-rule flex flex-col gap-1 border-b pb-4"
                key={signal.label}
              >
                <span className="text-lg font-bold">{signal.label}</span>
                <span className="text-lg">{signal.detail}</span>
                {signal.quote ? (
                  <blockquote className="text-muted-foreground text-base italic">
                    “{signal.quote}”
                  </blockquote>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {review.nextSteps.length > 0 ? (
        <section
          aria-labelledby={`steps-${review._id}`}
          className="flex flex-col gap-3"
        >
          <h3 className="text-xl font-semibold" id={`steps-${review._id}`}>
            What to do now
          </h3>
          <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
            {review.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="border-rule border-t pt-5">
        <AskSomeone review={review} />
      </section>
    </article>
  );
};

export { KIND_WORDS, ScamResult, VERDICT_WORDS };
