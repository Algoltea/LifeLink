"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Segmented } from "@lifelink/ui/components/segmented";
import { useAction, useMutation } from "convex/react";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { useLocale, useMessages } from "@/i18n/locale";
import { authClient } from "@/lib/auth-client";
import { messageOf } from "@/lib/errors";

import { BrandName } from "./brand";
import { TimeZoneSelect } from "./time-zone-select";

type Role = "family" | "owner";

/** A lookup answers for one postal code in one time zone; either changing makes it stale. */
type Lookup =
  | { city: string; code: string; kind: "found"; place: string; zone: string }
  | { code: string; kind: "checking" | "missing"; zone: string }
  | { kind: "idle" };

const lookupKey = (code: string, zone: string): string => `${zone}|${code}`;

const Onboarding = ({ demoModeAllowed }: { demoModeAllowed: boolean }) => {
  const t = useMessages().onboarding;
  const locale = useLocale();

  const roles = [
    { label: t.owner, value: "owner" },
    { label: t.family, value: "family" },
  ] as const;

  const complete = useMutation(api.profiles.completeOnboarding);
  const lookupPlace = useAction(api.weather.lookupPlace);
  const [lookup, setLookup] = useState<Lookup>({ kind: "idle" });
  // Only the latest lookup may show its answer; an edit cancels the ones before it.
  const latest = useRef<{ key: string; answer: Promise<Lookup> } | null>(null);
  const { data: session, isPending: sessionPending } = authClient.useSession();
  // The name given when creating the account; setup doesn't ask for it twice.
  const accountName = session?.user.name.trim() ?? "";
  const router = useRouter();
  const [role, setRole] = useState<Role>("owner");
  // Practice is on by default so a first approval never reaches a real person.
  const [demo, setDemo] = useState(true);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Onboarding renders only in the browser (after the profile query), so the device's zone is safe to read here.
  const [timeZone, setTimeZone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const ids = {
    demo: useId(),
    name: useId(),
    postal: useId(),
    postalHint: useId(),
    preferred: useId(),
    signOff: useId(),
    signOffHint: useId(),
    timeZone: useId(),
  };

  const forget = (): void => {
    latest.current = null;
    setLookup({ kind: "idle" });
  };

  const ask = async (code: string, zone: string): Promise<Lookup> => {
    try {
      const found = await lookupPlace({ postalCode: code, timeZone: zone });

      return found === null
        ? { code, kind: "missing", zone }
        : { city: found.city, code, kind: "found", place: found.place, zone };
    } catch {
      return { code, kind: "missing", zone };
    }
  };

  /** Confirm the code by showing its town, so a typo is caught now. */
  const check = async (value: string, zone: string): Promise<Lookup> => {
    const code = value.trim();

    if (code === "") {
      forget();

      return { kind: "idle" };
    }

    const key = lookupKey(code, zone);

    // The same code and zone share one request, so Continue can wait for the blur's lookup.
    if (latest.current?.key !== key) {
      latest.current = { answer: ask(code, zone), key };
      setLookup({ code, kind: "checking", zone });
    }

    const run = latest.current;
    const answer = await run.answer;

    if (latest.current === run) {
      setLookup(answer);

      // A miss may be a passing outage, so the next blur or Continue asks again.
      if (answer.kind === "missing") {
        latest.current = null;
      }
    }

    return answer;
  };

  const submit = async (form: FormData): Promise<void> => {
    setBusy(true);
    setProblem(null);

    const text = (key: string): string => String(form.get(key) ?? "").trim();
    const postalCode = role === "owner" ? text("postal") : "";
    const zone = text("timeZone") || timeZone;

    // The town comes from the confirmed code, so nobody types it twice.
    const confirmed = postalCode ? await check(postalCode, zone) : null;
    const city = confirmed?.kind === "found" ? confirmed.city : null;

    try {
      await complete({
        city,
        displayName: accountName || text("name"),
        postalCode: postalCode || null,
        preferredName: text("preferred"),
        role,
        signOffName: text("signOff") || null,
        startInDemoMode: role === "owner" && demo,
        supportLanguage: locale,
        timeZone: text("timeZone") || timeZone,
      });
      router.replace(role === "family" ? "/family" : "/");
    } catch (error) {
      setProblem(messageOf(error instanceof Error ? error : null));
      setBusy(false);
    }
  };

  return (
    <main
      className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-8"
      id="main"
    >
      <div className="border-border border-b pb-5">
        <BrandName />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-mobile-title sm:text-page-title font-semibold tracking-tight">
          {t.title}
        </h1>
        <p className="text-muted-foreground text-body">{t.intro}</p>
      </div>
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(new FormData(event.currentTarget));
        }}
      >
        {/* Locked while saving, so an edit made while Continue waits cannot be lost. */}
        <fieldset className="contents" disabled={busy}>
          <fieldset className="flex flex-col gap-3">
            <legend className="text-section pb-2 font-semibold">
              {t.whoFor}
            </legend>
            <Segmented
              disabled={busy}
              label={t.whoFor}
              onValueChange={setRole}
              options={roles}
              value={role}
            />
            <p className="text-muted-foreground text-base">
              {role === "owner" ? t.ownerHint : t.familyHint}
            </p>
          </fieldset>
          <fieldset
            className="border-border grid gap-5 border-t pt-6 sm:grid-cols-2"
            key={accountName}
          >
            <legend className="text-section pr-3 font-semibold">
              {t.aboutYou}
            </legend>
            {accountName || sessionPending ? null : (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor={ids.name}>{t.fullName}</Label>
                <Input autoComplete="name" id={ids.name} name="name" required />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor={ids.preferred}>{t.preferredName}</Label>
              <Input
                autoComplete="given-name"
                defaultValue={accountName.split(" ")[0]}
                id={ids.preferred}
                name="preferred"
                required
              />
            </div>
            {role === "owner" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor={ids.signOff}>{t.signOff}</Label>
                <Input
                  aria-describedby={ids.signOffHint}
                  id={ids.signOff}
                  name="signOff"
                />
                <p
                  className="text-muted-foreground text-label"
                  id={ids.signOffHint}
                >
                  {t.signOffHint}
                </p>
              </div>
            ) : null}
            {role === "owner" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor={ids.postal}>{t.postalCode}</Label>
                <Input
                  aria-describedby={ids.postalHint}
                  autoComplete="postal-code"
                  id={ids.postal}
                  maxLength={16}
                  name="postal"
                  onBlur={async (event) => {
                    await check(event.currentTarget.value, timeZone);
                  }}
                  onChange={forget}
                />
                <p
                  aria-live="polite"
                  className="text-muted-foreground text-label flex items-center gap-1.5"
                  id={ids.postalHint}
                >
                  {lookup.kind === "found" ? (
                    <>
                      <CheckIcon
                        aria-hidden="true"
                        className="text-foreground size-4"
                      />
                      <span className="text-foreground font-medium">
                        {lookup.place}
                      </span>
                    </>
                  ) : (
                    t.lookup[lookup.kind]
                  )}
                </p>
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor={ids.timeZone}>{t.timeZone}</Label>
              <TimeZoneSelect
                current={timeZone}
                id={ids.timeZone}
                name="timeZone"
                onChange={(event) => {
                  setTimeZone(event.target.value);
                  // The town was found for the old zone.
                  forget();
                }}
                required
                value={timeZone}
              />
            </div>
          </fieldset>
          {role === "owner" && demoModeAllowed ? (
            <section className="border-border bg-parchment rounded-lg border p-5">
              <div className="flex items-start gap-4 pt-1">
                <Checkbox
                  checked={demo}
                  disabled={busy}
                  id={ids.demo}
                  onCheckedChange={(checked) => setDemo(checked)}
                />
                <div className="flex flex-col gap-1">
                  <Label className="cursor-pointer" htmlFor={ids.demo}>
                    {t.practice}
                  </Label>
                  <p className="text-muted-foreground text-label">
                    {t.practiceHint}
                  </p>
                </div>
              </div>
            </section>
          ) : null}
        </fieldset>
        {problem ? (
          <p
            className="bg-negative-wash text-negative rounded-lg px-4 py-3 text-base"
            role="alert"
          >
            {problem}
          </p>
        ) : null}
        <Button
          aria-busy={busy}
          className="self-start"
          disabled={busy}
          size="lg"
          type="submit"
        >
          {busy ? t.settingUp : t.continue}
        </Button>
      </form>
    </main>
  );
};

export { Onboarding };
