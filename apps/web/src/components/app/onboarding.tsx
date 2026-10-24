"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Segmented } from "@lifelink/ui/components/segmented";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { messageOf } from "@/lib/errors";

import { BrandName } from "./brand";
import { TimeZoneSelect } from "./time-zone-select";

type Role = "family" | "owner";

const ROLES = [
  { label: "It's for me", value: "owner" },
  { label: "A family member invited me", value: "family" },
] as const;

const Onboarding = ({ demoModeAllowed }: { demoModeAllowed: boolean }) => {
  const complete = useMutation(api.profiles.completeOnboarding);
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
    preferred: useId(),
    signOff: useId(),
    signOffHint: useId(),
    timeZone: useId(),
  };

  const submit = async (form: FormData): Promise<void> => {
    setBusy(true);
    setProblem(null);

    const text = (key: string): string => String(form.get(key) ?? "").trim();

    try {
      await complete({
        city: null,
        displayName: accountName || text("name"),
        postalCode: null,
        preferredName: text("preferred"),
        role,
        signOffName: text("signOff") || null,
        startInDemoMode: role === "owner" && demo,
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
          Let’s get you set up
        </h1>
        <p className="text-muted-foreground text-body">
          A few details so messages sound like you and times are right. You can
          change any of this later in Settings.
        </p>
      </div>
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(new FormData(event.currentTarget));
        }}
      >
        <fieldset className="flex flex-col gap-3">
          <legend className="text-section pb-2 font-semibold">
            Who is LifeLink for?
          </legend>
          <Segmented
            label="Who is LifeLink for?"
            onValueChange={setRole}
            options={ROLES}
            value={role}
          />
          <p className="text-muted-foreground text-base">
            {role === "owner"
              ? "You'll use LifeLink every day. Family members see only what you choose to share."
              : "You'll see only what your family member shares with you. You'll enter the invitation code they give you on the next screen."}
          </p>
        </fieldset>
        <fieldset
          className="border-border grid gap-5 border-t pt-6 sm:grid-cols-2"
          key={accountName}
        >
          <legend className="text-section pr-3 font-semibold">About you</legend>
          {accountName || sessionPending ? null : (
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor={ids.name}>Your full name</Label>
              <Input autoComplete="name" id={ids.name} name="name" required />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.preferred}>
              What should LifeLink call you?
            </Label>
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
              <Label htmlFor={ids.signOff}>
                How you sign your messages (optional)
              </Label>
              <Input
                aria-describedby={ids.signOffHint}
                id={ids.signOff}
                name="signOff"
              />
              <p
                className="text-muted-foreground text-label"
                id={ids.signOffHint}
              >
                For example, Mom or Grandma Ruth. If you leave it blank,
                messages end with the name above.
              </p>
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.timeZone}>Time zone</Label>
            <TimeZoneSelect
              current={timeZone}
              id={ids.timeZone}
              name="timeZone"
              onChange={(event) => setTimeZone(event.target.value)}
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
                id={ids.demo}
                onCheckedChange={(checked) => setDemo(checked)}
              />
              <div className="flex flex-col gap-1">
                <Label className="cursor-pointer" htmlFor={ids.demo}>
                  Start in practice mode
                </Label>
                <p className="text-muted-foreground text-label">
                  Adds sample family members, an appointment email, and practice
                  replies. Nothing is really sent. Every practice result is
                  marked Practice. You can turn it off in Settings.
                </p>
              </div>
            </div>
          </section>
        ) : null}
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
          {busy ? "Setting up…" : "Continue"}
        </Button>
      </form>
    </main>
  );
};

export { Onboarding };
