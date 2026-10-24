"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Segmented } from "@lifelink/ui/components/segmented";
import { Switch } from "@lifelink/ui/components/switch";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { ReadAloudButton, SimulatedPill } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { LoadingRows } from "@/components/app/states";
import { saveDisplay } from "@/lib/display";
import { messageOf } from "@/lib/errors";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

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
        <Label htmlFor={id}>{label}</Label>
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
  const update = useMutation(api.profiles.updatePreferences);

  const save = async (patch: Parameters<typeof update>[0]): Promise<void> => {
    const display = {
      contrast: patch.contrast ?? stored.contrast,
      reducedMotion: patch.reducedMotion ?? stored.reducedMotion,
      textScale: patch.textScale ?? stored.textScale,
    };

    // Applied at once, so the change is visible before the save round-trips.
    saveDisplay(display);

    try {
      await update(patch);
    } catch (error) {
      saveDisplay({
        contrast: stored.contrast,
        reducedMotion: stored.reducedMotion,
        textScale: stored.textScale,
      });
      toast.error(errorText(error));
    }
  };

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
      <Row
        description="Changes every page. Your choice is remembered on this device."
        label="Text size"
      >
        <Segmented
          label="Text size"
          onValueChange={(value) => save({ textScale: Number(value) })}
          options={TEXT_SIZES}
          value={nearest(TEXT_SIZES, stored.textScale)}
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
          value={stored.contrast}
        />
      </Row>
      <Row label="Light or dark">
        <Segmented
          label="Light or dark"
          onValueChange={(theme) => save({ theme })}
          options={THEMES}
          value={stored.theme}
        />
      </Row>
      <Toggle
        checked={stored.reducedMotion}
        description="Turns off sliding and fading."
        label="Less movement"
        onChange={(reducedMotion) => save({ reducedMotion })}
      />
      <Toggle
        checked={stored.readAloud}
        description="LifeLink reads new briefings and replies out loud."
        label="Read aloud automatically"
        onChange={(readAloud) => save({ readAloud })}
      />
      <Toggle
        checked={stored.captions}
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
            onValueChange={(value) => save({ speechRate: Number(value) })}
            options={SPEECH_RATES}
            value={nearest(SPEECH_RATES, stored.speechRate)}
          />
          <ReadAloudButton
            label="Hear a sample"
            rate={stored.speechRate}
            text="This is how LifeLink sounds when it reads to you."
          />
        </div>
      </Row>
    </section>
  );
};

const ProfileSettings = ({ profile }: { profile: Doc<"profiles"> }) => {
  const update = useMutation(api.profiles.updateProfile);
  const [busy, setBusy] = useState(false);

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
      <form
        action={async (form) => {
          const text = (key: string): string =>
            String(form.get(key) ?? "").trim();

          setBusy(true);

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
            toast.success("Saved.");
          } catch (error) {
            toast.error(errorText(error));
          }

          setBusy(false);
        }}
        className="grid gap-5 sm:grid-cols-2"
      >
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
          <Input
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
          <Label htmlFor={id}>Use practice mode</Label>
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="w-8 text-base font-semibold">
              {profile.demoMode ? "On" : "Off"}
            </span>
            <Switch
              checked={profile.demoMode}
              id={id}
              onCheckedChange={async (enabled) => {
                try {
                  await setDemoMode({ enabled });
                  toast.success(
                    enabled
                      ? "Practice mode is on."
                      : "Practice mode is off. Anything you approve now really happens."
                  );
                } catch (error) {
                  toast.error(errorText(error));
                }
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-lg leading-7">
          Practice mode has been turned off for this app.
        </p>
      )}
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
        <PageHeader title="Settings" />
        <LoadingRows label="Loading settings" rows={4} />
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
