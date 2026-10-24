"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import {
  MAX_NOTES_LENGTH,
  cleanNotes,
  helpStyleOf,
  supportLanguages,
} from "@lifelink/contracts/help-style";
import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Segmented } from "@lifelink/ui/components/segmented";
import { Switch } from "@lifelink/ui/components/switch";
import { Textarea } from "@lifelink/ui/components/textarea";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { ReadAloudButton, SimulatedPill } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { LoadingRows } from "@/components/app/states";
import { TimeZoneSelect } from "@/components/app/time-zone-select";
import { saveDisplay } from "@/lib/display";
import { messageOf } from "@/lib/errors";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type SaveState = "idle" | "pending" | "saved" | "failed";

const SAVE_WORDS: Record<SaveState, string> = {
  failed: "",
  idle: "",
  pending: "Saving…",
  saved: "Saved.",
};

const submissionState = (busy: boolean, saved: boolean): SaveState => {
  if (busy) {
    return "pending";
  }

  return saved ? "saved" : "idle";
};

const SaveFeedback = ({
  state,
  failure,
}: {
  state: SaveState;
  failure: string | null;
}) => {
  if (failure) {
    return (
      <p className="text-destructive text-base" role="alert">
        {failure}
      </p>
    );
  }

  return (
    <output className="text-muted-foreground text-base">
      {SAVE_WORDS[state]}
    </output>
  );
};

/** Keep attempted choices visible, including when the account save fails. */
const usePreferenceSave = (
  stored: Doc<"preferences">,
  applyDisplay = false
) => {
  const update = useMutation(api.profiles.updatePreferences);
  const [draft, setDraft] = useState<Parameters<typeof update>[0]>({});
  const [state, setState] = useState<SaveState>("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const pending = useRef(false);
  const value = { ...stored, ...draft };

  const save = async (patch: Parameters<typeof update>[0]): Promise<void> => {
    if (pending.current) {
      return;
    }

    pending.current = true;
    const next = { ...draft, ...patch };
    setDraft(next);
    setState("pending");
    setFailure(null);

    if (applyDisplay) {
      saveDisplay({
        contrast: next.contrast ?? stored.contrast,
        reducedMotion: next.reducedMotion ?? stored.reducedMotion,
        textScale: next.textScale ?? stored.textScale,
      });
    }

    try {
      await update(next);
      setState("saved");
    } catch (error) {
      setState("failed");
      setFailure(
        `Your choices haven’t been saved to your account. ${errorText(error)} Try again below.`
      );
    }

    pending.current = false;
  };

  return { failure, save, state, value };
};

const TEXT_SIZES = [
  { label: "Standard", value: "1" },
  { label: "Large", value: "1.15" },
  { label: "Larger", value: "1.3" },
  { label: "Largest", value: "1.5" },
] as const;

const SPEECH_RATES = [
  { label: "Slower", value: "0.75" },
  { label: "Usual", value: "0.9" },
  { label: "Quicker", value: "1.1" },
] as const;

const THEMES = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Match my device", value: "system" },
] as const;

const DETAILS = [
  { label: "Short", value: "short" },
  { label: "Detailed", value: "detailed" },
] as const;

const CONTRASTS = [
  { label: "Standard", value: "standard" },
  { label: "More contrast", value: "more" },
] as const;

/** The closest offered option, so a stored value between steps still shows as selected. */
const nearest = <Value extends string>(
  options: readonly { value: Value }[],
  stored: number
): Value => {
  const [first, ...rest] = options;

  if (first === undefined) {
    throw new Error("nearest needs at least one option.");
  }

  let best = first;

  for (const option of rest) {
    if (
      Math.abs(Number(option.value) - stored) <
      Math.abs(Number(best.value) - stored)
    ) {
      best = option;
    }
  }

  return best.value;
};

const Row = ({
  children,
  description,
  label,
}: {
  children: ReactNode;
  description?: string;
  label: string;
}) => (
  <div className="border-rule flex flex-col gap-3 border-t py-5 first:border-t-0 first:pt-0">
    <div className="flex flex-col gap-1">
      <span className="text-lg font-semibold">{label}</span>
      {description ? (
        <span className="text-muted-foreground max-w-prose text-lg leading-7">
          {description}
        </span>
      ) : null}
    </div>
    {children}
  </div>
);

const Toggle = ({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: (value: boolean) => void;
}) => {
  const id = useId();

  return (
    <div className="border-rule flex flex-col items-start gap-4 border-t py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-col gap-1">
        <Label className="cursor-pointer" htmlFor={id}>
          {label}
        </Label>
        <span className="text-muted-foreground max-w-prose text-lg leading-7">
          {description}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span aria-hidden="true" className="w-8 text-base font-semibold">
          {checked ? "On" : "Off"}
        </span>
        <Switch checked={checked} id={id} onCheckedChange={onChange} />
      </div>
    </div>
  );
};

const DisplaySettings = ({ stored }: { stored: Doc<"preferences"> }) => {
  const { failure, save, state, value } = usePreferenceSave(stored, true);

  return (
    <section
      aria-labelledby="display-heading"
      className="border-rule flex min-w-0 flex-col border-t pt-6"
    >
      <h2
        className="pb-2 text-2xl leading-8 font-semibold"
        id="display-heading"
      >
        Seeing and hearing
      </h2>
      <p className="text-muted-foreground pb-6 text-lg leading-7">
        These preferences save as you change them.
      </p>
      <fieldset disabled={state === "pending"} className="min-w-0">
        <Row
          description="Changes every page. Your choice is remembered on this device."
          label="Text size"
        >
          <Segmented
            label="Text size"
            onValueChange={(scale) => save({ textScale: Number(scale) })}
            options={TEXT_SIZES}
            value={nearest(TEXT_SIZES, value.textScale)}
          />
        </Row>
        <Row
          description="More contrast makes text darker and borders stronger."
          label="Contrast"
        >
          <Segmented
            label="Contrast"
            onValueChange={(contrast) => save({ contrast })}
            options={CONTRASTS}
            value={value.contrast}
          />
        </Row>
        <Row label="Light or dark">
          <Segmented
            label="Light or dark"
            onValueChange={(theme) => save({ theme })}
            options={THEMES}
            value={value.theme}
          />
        </Row>
        <Toggle
          checked={value.reducedMotion}
          description="Turns off sliding and fading."
          label="Less movement"
          onChange={(reducedMotion) => save({ reducedMotion })}
        />
        <Toggle
          checked={value.readAloud}
          description="LifeLink reads new briefings and replies out loud."
          label="Read aloud automatically"
          onChange={(readAloud) => save({ readAloud })}
        />
        <Toggle
          checked={value.captions}
          description="Shows the words while you talk with LifeLink."
          label="Captions when speaking"
          onChange={(captions) => save({ captions })}
        />
        <Row
          description="How fast LifeLink speaks when it reads aloud."
          label="Speaking speed"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Speaking speed"
              onValueChange={(rate) => save({ speechRate: Number(rate) })}
              options={SPEECH_RATES}
              value={nearest(SPEECH_RATES, value.speechRate)}
            />
            <ReadAloudButton
              label="Hear a sample"
              rate={value.speechRate}
              text="This is how LifeLink sounds when it reads to you."
            />
          </div>
        </Row>
      </fieldset>
      <SaveFeedback state={state} failure={failure} />
      {failure ? (
        <Button
          className="self-start"
          variant="outline"
          onClick={() => save({})}
        >
          Try saving again
        </Button>
      ) : null}
    </section>
  );
};

/** The person's own words about how they like help. Private, and never put in anything sent to others. */
const NotesSetting = ({ saved }: { saved: string }) => {
  const update = useMutation(api.profiles.updatePreferences);
  const [notes, setNotes] = useState(saved);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState(saved);
  const notesId = useId();
  const hintId = useId();

  return (
    <form
      className="border-rule flex flex-col gap-3 border-t py-5"
      onSubmit={async (event) => {
        event.preventDefault();

        if (busy) {
          return;
        }

        setBusy(true);
        setFailure(null);

        try {
          await update({ communicationNotes: notes });
          setSavedNotes(cleanNotes(notes));
          toast.success("Your notes are saved.");
        } catch (error) {
          setFailure(
            `Your notes weren’t saved. ${errorText(error)} Your text is still here. Choose Save notes to try again.`
          );
        }

        setBusy(false);
      }}
    >
      <Label htmlFor={notesId}>Notes about how I like help</Label>
      <span
        className="text-muted-foreground max-w-prose text-lg leading-7"
        id={hintId}
      >
        For example, “Give me one step at a time.” Only LifeLink’s explanations
        to you use these. They are never shown to family or put in a message. If
        you allow a cloud explanation, these notes go to the AI provider with
        the message.
      </span>
      <Textarea
        aria-describedby={hintId}
        className="bg-raised"
        id={notesId}
        maxLength={MAX_NOTES_LENGTH}
        onChange={(event) => setNotes(event.target.value)}
        disabled={busy}
        rows={3}
        value={notes}
      />
      <span className="text-muted-foreground text-base">
        {notes.length} of {MAX_NOTES_LENGTH} characters
      </span>
      <p className="text-muted-foreground text-base">
        Choose Save notes to keep changes to this text.
      </p>
      <SaveFeedback
        failure={failure}
        state={submissionState(busy, cleanNotes(notes) === savedNotes)}
      />
      <Button
        aria-busy={busy}
        className="self-start"
        disabled={busy || (!failure && cleanNotes(notes) === savedNotes)}
        type="submit"
        variant="outline"
      >
        Save notes
      </Button>
    </form>
  );
};

/** How LifeLink explains messages, scam checks, briefings, and practice. */
const HelpSettings = ({ stored }: { stored: Doc<"preferences"> }) => {
  const { failure, save, state, value } = usePreferenceSave(stored);
  const style = helpStyleOf(value);

  return (
    <section
      aria-labelledby="help-heading"
      className="border-rule flex min-w-0 flex-col border-t pt-6"
      id="help"
    >
      <h2 className="pb-2 text-2xl leading-8 font-semibold" id="help-heading">
        How I like help
      </h2>
      <p className="text-muted-foreground pb-6 text-lg leading-7">
        Used when LifeLink explains a message, a scam check, a conversation
        recap, or your morning briefing. Only you see these. The choices below
        save as you change them; notes have their own Save notes button.
      </p>
      <fieldset disabled={state === "pending"} className="min-w-0">
        <Row
          description="Short gives the main points. Detailed explains a little more."
          label="Explanations"
        >
          <Segmented
            label="Explanations"
            onValueChange={(explanationDetail) => save({ explanationDetail })}
            options={DETAILS}
            value={style.detail}
          />
        </Row>
        <Toggle
          checked={style.stepByStep}
          description="Shows explanations and next steps one at a time, with a Next button."
          label="One step at a time"
          onChange={(stepByStep) => save({ stepByStep })}
        />
        <Row
          description="LifeLink’s cloud explanations and scam checks are written in this language. Quotes stay in the message’s own words, local readings stay in English, and suggested replies follow the message’s language. Read-aloud and voice typing stay in English for now."
          label="Language for help"
        >
          <select
            aria-label="Language for help"
            className="border-control bg-raised text-foreground min-h-12 max-w-full self-start rounded-md border px-4 text-base"
            onChange={(event) => save({ supportLanguage: event.target.value })}
            value={style.language}
          >
            {supportLanguages.map((language) => (
              <option key={language.id} lang={language.id} value={language.id}>
                {language.label}
              </option>
            ))}
          </select>
        </Row>
      </fieldset>
      <SaveFeedback failure={failure} state={state} />
      {failure ? (
        <Button
          className="self-start"
          variant="outline"
          onClick={() => save({})}
        >
          Try saving again
        </Button>
      ) : null}
      <NotesSetting saved={style.notes} />
    </section>
  );
};

const ProfileSettings = ({ profile }: { profile: Doc<"profiles"> }) => {
  const update = useMutation(api.profiles.updateProfile);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const ids = {
    city: useId(),
    name: useId(),
    preferred: useId(),
    signOff: useId(),
    timeZone: useId(),
    zip: useId(),
  };

  return (
    <section
      aria-labelledby="profile-heading"
      className="border-rule flex min-w-0 flex-col gap-5 border-t pt-6"
    >
      <h2 className="text-2xl leading-8 font-semibold" id="profile-heading">
        About you
      </h2>
      <p className="text-muted-foreground text-lg">
        Choose Save profile to keep changes in this section.
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (busy) {
            return;
          }

          const form = new FormData(event.currentTarget);

          const text = (key: string): string =>
            String(form.get(key) ?? "").trim();

          setBusy(true);
          setFailure(null);
          setSaved(false);

          try {
            await update({
              city: text("city") || null,
              displayName: text("name"),
              postalCode: text("zip") || null,
              preferredName: text("preferred"),
              signOffName:
                profile.role === "owner"
                  ? text("signOff") || null
                  : profile.signOffName,
              timeZone: text("timeZone"),
            });
            setSaved(true);
            toast.success("Saved.");
          } catch (error) {
            setFailure(
              `Your profile wasn’t saved. ${errorText(error)} Your entries are still here. Choose Save profile to try again.`
            );
          }

          setBusy(false);
        }}
        onChange={() => setSaved(false)}
        className="flex flex-col gap-5"
      >
        <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.name}>Full name</Label>
            <Input
              autoComplete="name"
              defaultValue={profile.displayName}
              id={ids.name}
              name="name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.preferred}>What LifeLink calls you</Label>
            <Input
              defaultValue={profile.preferredName}
              id={ids.preferred}
              name="preferred"
              required
            />
          </div>
          {profile.role === "owner" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor={ids.signOff}>How you sign messages</Label>
              <Input
                defaultValue={profile.signOffName ?? ""}
                id={ids.signOff}
                name="signOff"
                placeholder="For example, Mom"
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.timeZone}>Time zone</Label>
            <TimeZoneSelect
              current={profile.timeZone}
              defaultValue={profile.timeZone}
              id={ids.timeZone}
              name="timeZone"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.city}>City</Label>
            <Input
              autoComplete="address-level2"
              defaultValue={profile.city ?? ""}
              id={ids.city}
              name="city"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.zip}>ZIP code</Label>
            <Input
              autoComplete="postal-code"
              defaultValue={profile.postalCode ?? ""}
              id={ids.zip}
              inputMode="numeric"
              name="zip"
            />
          </div>
        </fieldset>
        <SaveFeedback failure={failure} state={submissionState(busy, saved)} />
        <Button
          aria-busy={busy}
          className="self-start"
          disabled={busy}
          type="submit"
        >
          Save profile
        </Button>
      </form>
    </section>
  );
};

const DemoSettings = ({
  allowed,
  profile,
}: {
  allowed: boolean;
  profile: Doc<"profiles">;
}) => {
  const setDemoMode = useMutation(api.profiles.setDemoMode);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const id = useId();

  return (
    <section
      aria-labelledby="demo-heading"
      className="bg-surface flex scroll-mt-24 flex-col gap-4 rounded-xl p-5 sm:p-6"
      id="demo"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl leading-8 font-semibold" id="demo-heading">
          Practice mode
        </h2>
        {profile.demoMode ? <SimulatedPill /> : null}
      </div>
      <p className="max-w-prose text-lg leading-7">
        In practice mode nothing real is sent, saved elsewhere, or bought.
        Everything that would happen is simulated and marked “Practice”, and
        sample people and messages are added so you can try things safely.
      </p>
      {allowed ? (
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <Label className="cursor-pointer" htmlFor={id}>
            Use practice mode
          </Label>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="w-8 text-base font-semibold">
              {profile.demoMode ? "On" : "Off"}
            </span>
            <Switch
              disabled={busy}
              checked={profile.demoMode}
              id={id}
              onCheckedChange={async (enabled) => {
                if (busy) {
                  return;
                }

                setBusy(true);
                setFailure(null);

                try {
                  await setDemoMode({ enabled });
                  toast.success(
                    enabled
                      ? "Practice mode is on."
                      : "Practice mode is off. Anything you approve now really happens."
                  );
                } catch (error) {
                  setFailure(
                    `Practice mode couldn’t be changed. ${errorText(error)} Try the switch again.`
                  );
                }

                setBusy(false);
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-lg leading-7">
          Practice mode has been turned off for this app.
        </p>
      )}
      {allowed ? (
        <p className="text-muted-foreground text-base">
          This switch saves automatically.
        </p>
      ) : null}
      <SaveFeedback failure={failure} state={busy ? "pending" : "idle"} />
      <p className="text-muted-foreground text-lg leading-7">
        Anything prepared in one mode has to be reviewed again before it runs in
        the other.
      </p>
    </section>
  );
};

const SettingsScreen = () => {
  const { me } = usePreferences();

  if (!me?.profile || !me.preferences) {
    return (
      <>
        <PageHeader
          subline="Make LifeLink comfortable to read and listen to."
          title="Settings"
        />
        <LoadingRows layout="settings" label="Loading settings" rows={4} />
      </>
    );
  }

  const isOwner = me.profile.role === "owner";

  return (
    <>
      <PageHeader
        subline="Make LifeLink comfortable to read and listen to."
        title="Settings"
      />
      <div className="grid items-start gap-8 xl:grid-cols-2">
        <DisplaySettings stored={me.preferences} />
        <div className="flex flex-col gap-8">
          <ProfileSettings profile={me.profile} />
          {isOwner ? <HelpSettings stored={me.preferences} /> : null}
          {isOwner ? (
            <DemoSettings allowed={me.demoModeAllowed} profile={me.profile} />
          ) : null}
          {isOwner ? (
            <section
              aria-labelledby="more-heading"
              className="border-rule flex flex-col gap-3 border-t pt-6"
            >
              <h2
                className="text-2xl leading-8 font-semibold"
                id="more-heading"
              >
                Accounts and permissions
              </h2>
              <ul className="flex flex-col gap-2 text-lg">
                <li>
                  <Link
                    className="inline-flex min-h-12 items-center underline underline-offset-4"
                    href="/connections"
                  >
                    Accounts LifeLink can use
                  </Link>
                </li>
                <li>
                  <Link
                    className="inline-flex min-h-12 items-center underline underline-offset-4"
                    href="/groceries#budget"
                  >
                    Grocery lists and budgets
                  </Link>
                </li>
                <li>
                  <Link
                    className="inline-flex min-h-12 items-center underline underline-offset-4"
                    href="/circle"
                  >
                    Who can see what
                  </Link>
                </li>
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
};

export { SettingsScreen };
