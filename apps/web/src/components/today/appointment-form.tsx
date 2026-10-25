"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Textarea } from "@lifelink/ui/components/textarea";
import { useMutation } from "convex/react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/messages/en";
import { messageOf } from "@/lib/errors";
import { fromLocalInputValue, toLocalInputValue } from "@/lib/format";

/** What the person typed, kept as text until it is saved. */
interface AppointmentDraft {
  date: string;
  location: string;
  notes: string;
  time: string;
  title: string;
}

interface AppointmentValues {
  location: string;
  notes: string;
  startsAt: number;
  title: string;
}

type FormWords = Messages["today"]["appointmentForm"];

/** A stored time as the date and time boxes show it, in the person's zone. */
const draftOf = (
  values: {
    location: string | null;
    notes: string | null;
    startsAt: number | null;
    title: string;
  },
  timeZone: string
): AppointmentDraft => {
  const [date = "", time = ""] =
    values.startsAt === null
      ? [toLocalInputValue(Date.now(), timeZone).slice(0, 10)]
      : toLocalInputValue(values.startsAt, timeZone).split("T");

  return {
    date,
    location: values.location ?? "",
    notes: values.notes ?? "",
    time,
    title: values.title,
  };
};

/** Check the draft before it reaches the server, in words the person can act on. */
const readDraft = (
  draft: AppointmentDraft,
  timeZone: string,
  words: FormWords
): { error: string } | { values: AppointmentValues } => {
  const title = draft.title.trim();

  if (title.length === 0) {
    return { error: words.missingTitle };
  }

  const startsAt =
    draft.date && draft.time
      ? fromLocalInputValue(`${draft.date}T${draft.time}`, timeZone)
      : null;

  if (startsAt === null) {
    return { error: words.missingWhen };
  }

  if (startsAt < Date.now()) {
    return { error: words.pastWhen };
  }

  return {
    values: {
      location: draft.location.trim(),
      notes: draft.notes.trim(),
      startsAt,
      title,
    },
  };
};

const OptionalLabel = ({
  children,
  htmlFor,
}: {
  children: string;
  htmlFor: string;
}) => {
  const words = useMessages().today.appointmentForm;

  return (
    <Label htmlFor={htmlFor}>
      {children}
      <span className="text-muted-foreground font-normal">
        {" "}
        · {words.optional}
      </span>
    </Label>
  );
};

/** The boxes for one appointment, shared by Today and the review in a conversation. */
const AppointmentFields = ({
  disabled,
  draft,
  onChange,
}: {
  disabled: boolean;
  draft: AppointmentDraft;
  onChange: (draft: AppointmentDraft) => void;
}) => {
  const words = useMessages().today.appointmentForm;

  const ids = {
    date: useId(),
    hint: useId(),
    location: useId(),
    notes: useId(),
    time: useId(),
    title: useId(),
  };

  const titleInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInput.current?.focus();
  }, []);

  return (
    // Date and time sit side by side only when the form itself has room.
    <div className="@container flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={ids.title}>{words.title}</Label>
        <Input
          aria-describedby={ids.hint}
          disabled={disabled}
          id={ids.title}
          maxLength={120}
          onChange={(event) =>
            onChange({ ...draft, title: event.target.value })
          }
          ref={titleInput}
          required
          value={draft.title}
        />
        <p className="text-muted-foreground text-label" id={ids.hint}>
          {words.titleHint}
        </p>
      </div>
      <div className="grid gap-4 @min-[22rem]:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor={ids.date}>{words.date}</Label>
          <Input
            disabled={disabled}
            id={ids.date}
            onChange={(event) =>
              onChange({ ...draft, date: event.target.value })
            }
            required
            type="date"
            value={draft.date}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor={ids.time}>{words.time}</Label>
          <Input
            disabled={disabled}
            id={ids.time}
            onChange={(event) =>
              onChange({ ...draft, time: event.target.value })
            }
            required
            step={300}
            type="time"
            value={draft.time}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <OptionalLabel htmlFor={ids.location}>{words.location}</OptionalLabel>
        <Input
          autoComplete="street-address"
          disabled={disabled}
          id={ids.location}
          maxLength={200}
          onChange={(event) =>
            onChange({ ...draft, location: event.target.value })
          }
          value={draft.location}
        />
      </div>
      <div className="flex flex-col gap-2">
        <OptionalLabel htmlFor={ids.notes}>{words.notes}</OptionalLabel>
        <Textarea
          className="text-body min-h-24"
          disabled={disabled}
          id={ids.notes}
          maxLength={1000}
          onChange={(event) =>
            onChange({ ...draft, notes: event.target.value })
          }
          rows={3}
          value={draft.notes}
        />
      </div>
    </div>
  );
};

/** Today's own add form: the person typed it, so saving needs no further approval. */
const AddAppointmentForm = ({
  onDone,
  timeZone,
}: {
  onDone: () => void;
  timeZone: string;
}) => {
  const create = useMutation(api.appointments.create);
  const t = useMessages();
  const words = t.today.appointmentForm;
  const headingId = useId();

  const [draft, setDraft] = useState(() =>
    draftOf(
      { location: null, notes: null, startsAt: null, title: "" },
      timeZone
    )
  );

  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  return (
    <form
      aria-labelledby={headingId}
      className="bg-parchment flex min-w-0 flex-col gap-5 rounded-xl p-5"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();

        const read = readDraft(draft, timeZone, words);

        if ("error" in read) {
          setFailure(read.error);

          return;
        }

        setSaving(true);
        setFailure(null);

        try {
          await create({
            location: read.values.location || null,
            notes: read.values.notes || null,
            startsAt: read.values.startsAt,
            title: read.values.title,
          });
          toast.success(words.saved(read.values.title));
          onDone();
        } catch (error) {
          setFailure(messageOf(error instanceof Error ? error : null));
          setSaving(false);
        }
      }}
    >
      <h3 className="text-section font-semibold" id={headingId}>
        {words.heading}
      </h3>
      <AppointmentFields
        disabled={saving}
        draft={draft}
        onChange={(next) => {
          setDraft(next);
          setFailure(null);
        }}
      />
      {failure ? (
        <p className="text-negative text-base" role="alert">
          {failure}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button aria-busy={saving} disabled={saving} type="submit">
          {saving ? t.common.saving : words.save}
        </Button>
        <Button
          disabled={saving}
          onClick={onDone}
          type="button"
          variant="ghost"
        >
          {t.common.cancel}
        </Button>
      </div>
    </form>
  );
};

export { AddAppointmentForm, AppointmentFields, draftOf, readDraft };

export type { AppointmentDraft };
