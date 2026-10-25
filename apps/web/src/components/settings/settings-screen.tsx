"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import {
  MAX_NOTES_LENGTH,
  cleanNotes,
  helpStyleOf,
  supportLanguages,
} from "@lifelink/contracts/help-style";
import { interfaceLocaleOf } from "@lifelink/contracts/locale";
import { SPEECH_VOICES, isSpeechVoice } from "@lifelink/contracts/speech";
import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Segmented } from "@lifelink/ui/components/segmented";
import { Switch } from "@lifelink/ui/components/switch";
import { Textarea } from "@lifelink/ui/components/textarea";
import { cn } from "@lifelink/ui/lib/utils";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { ReadAloudButton, SimulatedPill } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import {
  useLanguagePreference,
  usePreferences,
} from "@/components/app/preferences";
import { usePresentationDemo } from "@/components/app/presentation-demo";
import { LoadingRows } from "@/components/app/states";
import { TimeZoneSelect } from "@/components/app/time-zone-select";
import { currentMessages, useLocale, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { saveDisplay } from "@/lib/display";
import { messageOf } from "@/lib/errors";

/** "LS1 4AP" and "ls1  4ap" are the same code, so the saved town still fits. */
const samePostalCode = (left: string | null, right: string | null): boolean =>
  (left ?? "").replaceAll(/\s+/gu, "").toUpperCase() ===
  (right ?? "").replaceAll(/\s+/gu, "").toUpperCase();

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type SaveState = "idle" | "pending" | "saved" | "failed";

const saveWords = (t: Messages): Record<SaveState, string> => ({
  failed: "",
  idle: "",
  pending: t.common.saving,
  saved: t.settings.saved,
});

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
  const t = useMessages();

  if (failure) {
    return (
      <p className="text-destructive text-base" role="alert">
        {failure}
      </p>
    );
  }

  return (
    <output className="text-muted-foreground text-base">
      {saveWords(t)[state]}
    </output>
  );
};

/** Keep attempted choices visible, including when the account save fails. */
const usePreferenceSave = (
  stored: Doc<"preferences">,
  applyDisplay = false
) => {
  const update = useMutation(api.profiles.updatePreferences);

  // Language has its own shared save/retry state and must never enter this draft.
  type PreferenceDraft = Omit<Parameters<typeof update>[0], "supportLanguage">;

  const [draft, setDraft] = useState<PreferenceDraft>({});
  const [state, setState] = useState<SaveState>("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const pending = useRef(false);
  const value = { ...stored, ...draft };

  const save = async (patch: PreferenceDraft): Promise<void> => {
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
      setFailure(currentMessages().settings.choicesNotSaved(errorText(error)));
    }

    pending.current = false;
  };

  return { failure, save, state, value };
};

type Words = Messages["settings"];

const textSizes = (t: Words) =>
  [
    { label: t.textSizeStandard, value: "1" },
    { label: t.textSizeLarge, value: "1.15" },
    { label: t.textSizeLarger, value: "1.3" },
    { label: t.textSizeLargest, value: "1.5" },
  ] as const;

const speechRates = (t: Words) =>
  [
    { label: t.speechSlower, value: "0.75" },
    { label: t.speechUsual, value: "0.9" },
    { label: t.speechQuicker, value: "1.1" },
  ] as const;

const themes = (t: Words) =>
  [
    { label: t.themeLight, value: "light" },
    { label: t.themeDark, value: "dark" },
    { label: t.themeSystem, value: "system" },
  ] as const;

const details = (t: Words) =>
  [
    { label: t.detailShort, value: "short" },
    { label: t.detailDetailed, value: "detailed" },
  ] as const;

const contrasts = (t: Words) =>
  [
    { label: t.contrastStandard, value: "standard" },
    { label: t.contrastMore, value: "more" },
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

// Both words share one grid cell so the label is as wide as the longer one
// in every language, and the switch never shifts when it flips.
const SwitchState = ({ checked }: { checked: boolean }) => {
  const t = useMessages();

  return (
    <span
      aria-hidden="true"
      className="inline-grid text-base font-semibold whitespace-nowrap"
    >
      <span className={cn("[grid-area:1/1]", !checked && "invisible")}>
        {t.common.on}
      </span>
      <span className={cn("[grid-area:1/1]", checked && "invisible")}>
        {t.common.off}
      </span>
    </span>
  );
};

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
        <SwitchState checked={checked} />
        <Switch checked={checked} id={id} onCheckedChange={onChange} />
      </div>
    </div>
  );
};

const DisplaySettings = ({ stored }: { stored: Doc<"preferences"> }) => {
  const { failure, save, state, value } = usePreferenceSave(stored, true);
  const language = useLanguagePreference();
  const locale = useLocale();
  const t = useMessages().settings;

  const languageFailure = language.error
    ? t.choicesNotSaved(currentMessages().common.genericError)
    : null;

  const voiceId = useId();
  const voiceHintId = useId();

  return (
    <section
      aria-labelledby="display-heading"
      className="border-rule flex min-w-0 flex-col border-t pt-6"
    >
      <h2
        className="pb-2 text-2xl leading-8 font-semibold"
        id="display-heading"
      >
        {t.seeingAndHearing}
      </h2>
      <p className="text-muted-foreground pb-6 text-lg leading-7">
        {t.savesAsYouChange}
      </p>
      <fieldset disabled={language.pending} className="min-w-0">
        <Row description={t.languageDescription} label={t.language}>
          <select
            aria-label={t.language}
            className="border-control bg-raised text-foreground min-h-12 max-w-full self-start rounded-md border px-4 text-base"
            onChange={(event) =>
              language.changeLanguage(interfaceLocaleOf(event.target.value))
            }
            value={locale}
          >
            {supportLanguages.map((option) => (
              <option key={option.id} lang={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Row>
      </fieldset>
      <SaveFeedback
        failure={languageFailure}
        state={language.pending ? "pending" : "idle"}
      />
      {language.error ? (
        <Button
          className="self-start"
          onClick={() => language.retry()}
          variant="outline"
        >
          {t.trySavingAgain}
        </Button>
      ) : null}
      <fieldset disabled={state === "pending"} className="min-w-0">
        <Row description={t.textSizeDescription} label={t.textSize}>
          <Segmented
            label={t.textSize}
            onValueChange={(scale) => save({ textScale: Number(scale) })}
            options={textSizes(t)}
            value={nearest(textSizes(t), value.textScale)}
          />
        </Row>
        <Row description={t.contrastDescription} label={t.contrast}>
          <Segmented
            label={t.contrast}
            onValueChange={(contrast) => save({ contrast })}
            options={contrasts(t)}
            value={value.contrast}
          />
        </Row>
        <Row label={t.theme}>
          <Segmented
            label={t.theme}
            onValueChange={(theme) => save({ theme })}
            options={themes(t)}
            value={value.theme}
          />
        </Row>
        <Toggle
          checked={value.reducedMotion}
          description={t.lessMovementDescription}
          label={t.lessMovement}
          onChange={(reducedMotion) => save({ reducedMotion })}
        />
        <Toggle
          checked={value.showNews ?? true}
          description={t.newsOnTodayDescription}
          label={t.newsOnToday}
          onChange={(showNews) => save({ showNews })}
        />
        <Toggle
          checked={value.readAloud}
          description={t.readAloudAutoDescription}
          label={t.readAloudAuto}
          onChange={(readAloud) => save({ readAloud })}
        />
        <Toggle
          checked={value.captions}
          description={t.captionsDescription}
          label={t.captions}
          onChange={(captions) => save({ captions })}
        />
        <div className="border-rule flex flex-col gap-3 border-t py-5">
          <Label htmlFor={voiceId}>{t.readAloudVoice}</Label>
          <p
            className="text-muted-foreground max-w-prose text-lg leading-7"
            id={voiceHintId}
          >
            {t.readAloudVoiceDescription}
          </p>
          <select
            aria-describedby={voiceHintId}
            className="border-control bg-raised text-foreground hover:border-foreground min-h-12 max-w-full self-start rounded-md border px-4 py-2 text-base transition-colors"
            id={voiceId}
            onChange={async (event) => {
              const selected = event.target.value;

              if (selected === "" || isSpeechVoice(selected)) {
                await save({ speechVoice: selected === "" ? null : selected });
              }
            }}
            value={value.speechVoice ?? ""}
          >
            <option value="">{t.defaultVoice}</option>
            {SPEECH_VOICES.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>
        <Row description={t.speakingSpeedDescription} label={t.speakingSpeed}>
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label={t.speakingSpeed}
              onValueChange={(rate) => save({ speechRate: Number(rate) })}
              options={speechRates(t)}
              value={nearest(speechRates(t), value.speechRate)}
            />
            <ReadAloudButton
              label={t.hearSample}
              rate={value.speechRate}
              text={t.speechSample}
              voice={value.speechVoice ?? null}
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
          {t.trySavingAgain}
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
  const t = useMessages().settings;

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
          toast.success(t.notesSaved);
        } catch (error) {
          setFailure(t.notesNotSaved(errorText(error)));
        }

        setBusy(false);
      }}
    >
      <Label htmlFor={notesId}>{t.notes}</Label>
      <span
        className="text-muted-foreground max-w-prose text-lg leading-7"
        id={hintId}
      >
        {t.notesHint}
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
        {t.characterCount(notes.length, MAX_NOTES_LENGTH)}
      </span>
      <p className="text-muted-foreground text-base">{t.notesSaveHint}</p>
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
        {t.saveNotes}
      </Button>
    </form>
  );
};

/** How LifeLink explains messages, scam checks, briefings, and practice. */
const HelpSettings = ({ stored }: { stored: Doc<"preferences"> }) => {
  const { failure, save, state, value } = usePreferenceSave(stored);
  const presentation = usePresentationDemo();
  const style = helpStyleOf(value);
  const t = useMessages().settings;

  return (
    <section
      aria-labelledby="help-heading"
      className="border-rule flex min-w-0 flex-col border-t pt-6"
      id="help"
    >
      <h2 className="pb-2 text-2xl leading-8 font-semibold" id="help-heading">
        {t.helpTitle}
      </h2>
      <p className="text-muted-foreground pb-6 text-lg leading-7">
        {t.helpDescription}
      </p>
      <fieldset disabled={state === "pending"} className="min-w-0">
        <Row description={t.explanationsDescription} label={t.explanations}>
          <Segmented
            label={t.explanations}
            onValueChange={(explanationDetail) => save({ explanationDetail })}
            options={details(t)}
            value={style.detail}
          />
        </Row>
        <Toggle
          checked={style.stepByStep}
          description={t.oneStepDescription}
          label={t.oneStep}
          onChange={(stepByStep) => save({ stepByStep })}
        />
        {presentation ? null : (
          <Toggle
            checked={value.aiEmailChecks ?? true}
            description={t.aiEmailChecksDescription}
            label={t.aiEmailChecks}
            onChange={(aiEmailChecks) => save({ aiEmailChecks })}
          />
        )}
      </fieldset>
      <SaveFeedback failure={failure} state={state} />
      {failure ? (
        <Button
          className="self-start"
          variant="outline"
          onClick={() => save({})}
        >
          {t.trySavingAgain}
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
  const t = useMessages().settings;

  const ids = {
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
      id="profile"
    >
      <h2 className="text-2xl leading-8 font-semibold" id="profile-heading">
        {t.profileTitle}
      </h2>
      <p className="text-muted-foreground text-lg">{t.profileSaveHint}</p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (busy) {
            return;
          }

          const form = new FormData(event.currentTarget);

          const text = (key: string): string =>
            String(form.get(key) ?? "").trim();

          const postalCode = text("zip") || null;

          setBusy(true);
          setFailure(null);
          setSaved(false);

          try {
            await update({
              // Onboarding saves the town that matches the code; a new code makes it stale.
              city: samePostalCode(postalCode, profile.postalCode)
                ? profile.city
                : null,
              displayName: text("name"),
              postalCode,
              preferredName: text("preferred"),
              signOffName:
                profile.role === "owner"
                  ? text("signOff") || null
                  : profile.signOffName,
              timeZone: text("timeZone"),
            });
            setSaved(true);
            toast.success(t.saved);
          } catch (error) {
            setFailure(t.profileNotSaved(errorText(error)));
          }

          setBusy(false);
        }}
        onChange={() => setSaved(false)}
        className="flex flex-col gap-5"
      >
        <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.name}>{t.fullName}</Label>
            <Input
              autoComplete="name"
              defaultValue={profile.displayName}
              id={ids.name}
              name="name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.preferred}>{t.preferredName}</Label>
            <Input
              defaultValue={profile.preferredName}
              id={ids.preferred}
              name="preferred"
              required
            />
          </div>
          {profile.role === "owner" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor={ids.signOff}>{t.signOff}</Label>
              <Input
                defaultValue={profile.signOffName ?? ""}
                id={ids.signOff}
                name="signOff"
                placeholder={t.signOffPlaceholder}
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.timeZone}>{t.timeZone}</Label>
            <TimeZoneSelect
              current={profile.timeZone}
              defaultValue={profile.timeZone}
              id={ids.timeZone}
              name="timeZone"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.zip}>{t.postalCode}</Label>
            <Input
              autoComplete="postal-code"
              defaultValue={profile.postalCode ?? ""}
              id={ids.zip}
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
          {t.saveProfile}
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
  const t = useMessages();

  return (
    <section
      aria-labelledby="demo-heading"
      className="bg-surface flex scroll-mt-24 flex-col gap-4 rounded-xl p-5 sm:p-6"
      id="demo"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl leading-8 font-semibold" id="demo-heading">
          {t.settings.demoTitle}
        </h2>
        {profile.demoMode ? <SimulatedPill /> : null}
      </div>
      <p className="max-w-prose text-lg leading-7">
        {t.settings.demoDescription}
      </p>
      {allowed ? (
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <Label className={busy ? undefined : "cursor-pointer"} htmlFor={id}>
            {t.settings.demoUse}
          </Label>
          <div className="flex items-center gap-3">
            <SwitchState checked={profile.demoMode} />
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
                    enabled ? t.settings.demoOn : t.settings.demoOff
                  );
                } catch (error) {
                  setFailure(t.settings.demoFailed(errorText(error)));
                }

                setBusy(false);
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-lg leading-7">
          {t.settings.demoTurnedOff}
        </p>
      )}
      {allowed ? (
        <p className="text-muted-foreground text-base">
          {t.settings.demoAllowedHint}
        </p>
      ) : null}
      <SaveFeedback failure={failure} state={busy ? "pending" : "idle"} />
      <p className="text-muted-foreground text-lg leading-7">
        {t.settings.demoBetweenModes}
      </p>
    </section>
  );
};

const SettingsScreen = () => {
  const { me } = usePreferences();
  const presentation = usePresentationDemo();
  const t = useMessages().settings;

  if (!me?.profile || !me.preferences) {
    return (
      <>
        <PageHeader subline={t.subline} title={t.title} />
        <LoadingRows layout="settings" label={t.loading} rows={4} />
      </>
    );
  }

  const isOwner = me.profile.role === "owner";

  return (
    <>
      <PageHeader subline={t.subline} title={t.title} />
      <div className="grid items-start gap-8 @4xl/content:grid-cols-2">
        <DisplaySettings stored={me.preferences} />
        <div className="flex flex-col gap-8">
          <ProfileSettings profile={me.profile} />
          {isOwner ? <HelpSettings stored={me.preferences} /> : null}
          {isOwner && !presentation ? (
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
                {t.accountsAndPermissions}
              </h2>
              <ul className="flex flex-col gap-2 text-lg">
                <li>
                  <Link
                    className="inline-flex min-h-12 items-center underline underline-offset-4"
                    href="/connections"
                  >
                    {t.accountsLink}
                  </Link>
                </li>
                <li>
                  <Link
                    className="inline-flex min-h-12 items-center underline underline-offset-4"
                    href="/groceries#budget"
                  >
                    {t.groceriesLink}
                  </Link>
                </li>
                <li>
                  <Link
                    className="inline-flex min-h-12 items-center underline underline-offset-4"
                    href="/circle"
                  >
                    {t.permissionsLink}
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
