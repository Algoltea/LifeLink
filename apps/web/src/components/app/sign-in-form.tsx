"use client";

import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Segmented } from "@lifelink/ui/components/segmented";
import Link from "next/link";
import { useId, useState } from "react";

import { HIDE_ON_PHONES } from "@/features/mahjong/screen";
import { useMessages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { authClient } from "@/lib/auth-client";

import { BrandName } from "./brand";

const MIN_PASSWORD_LENGTH = 10;

type Mode = "sign-in" | "sign-up";

const SignInForm = ({ initialMode = "sign-in" }: { initialMode?: Mode }) => {
  const { signIn: words } = useMessages().appExtras;

  const modes = [
    { label: words.signIn, value: "sign-in" },
    { label: words.createOption, value: "sign-up" },
  ] as const;

  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const submitLabel = mode === "sign-in" ? words.signIn : words.createAccount;

  const submit = async (form: FormData): Promise<void> => {
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    setError(null);

    if (mode === "sign-up" && password.length < MIN_PASSWORD_LENGTH) {
      setError(words.passwordMinimum(MIN_PASSWORD_LENGTH));

      return;
    }

    setBusy(true);

    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({
              email,
              name: name || email.split("@")[0] || words.friend,
              password,
            });

      if (result.error) {
        const createError = result.error.message
          ? translateServerMessage(result.error.message)
          : words.createError;

        setError(mode === "sign-in" ? words.mismatch : createError);
        setBusy(false);

        return;
      }
    } catch {
      setError(words.connectionError);
      setBusy(false);

      return;
    }

    // A full navigation so the new session cookie is used for the server-rendered app shell.
    globalThis.location.assign("/");
  };

  return (
    <main
      className="mx-auto flex min-h-svh w-full max-w-[32rem] flex-col justify-center gap-6 px-5 py-10"
      id="main"
    >
      <div className="border-border border-b pb-5">
        <BrandName />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-mobile-title sm:text-page-title font-semibold tracking-tight">
          {mode === "sign-in" ? words.welcome : words.createTitle}
        </h1>
        <p className="text-muted-foreground text-body">{words.body}</p>
      </div>
      <Segmented
        label={words.modeLabel}
        onValueChange={(nextMode) => {
          setMode(nextMode);
          setError(null);
        }}
        options={modes}
        value={mode}
      />
      <form
        aria-describedby={error ? errorId : undefined}
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(new FormData(event.currentTarget));
        }}
      >
        {mode === "sign-up" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor={nameId}>{words.name}</Label>
            <Input autoComplete="name" id={nameId} name="name" required />
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor={emailId}>{words.email}</Label>
          <Input
            autoComplete="email"
            id={emailId}
            inputMode="email"
            name="email"
            required
            type="email"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={passwordId}>{words.password}</Label>
          <div className="flex gap-2">
            <Input
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              id={passwordId}
              minLength={mode === "sign-up" ? MIN_PASSWORD_LENGTH : undefined}
              name="password"
              required
              type={showPassword ? "text" : "password"}
            />
            <Button
              aria-label={
                showPassword ? words.hidePassword : words.showPassword
              }
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              variant="outline"
            >
              {showPassword ? words.hide : words.show}
            </Button>
          </div>
          {mode === "sign-up" ? (
            <p className="text-muted-foreground text-base">
              {words.passwordHint(MIN_PASSWORD_LENGTH)}
            </p>
          ) : null}
        </div>
        {error ? (
          <p
            className="bg-negative-wash text-negative rounded-lg px-4 py-3 text-base"
            id={errorId}
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <Button aria-busy={busy} disabled={busy} size="lg" type="submit">
          {busy ? words.busy : submitLabel}
        </Button>
      </form>
      <p className="border-border text-muted-foreground text-label border-t pt-4">
        {words.breakPrompt}{" "}
        <Link
          className="text-accent-foreground inline-flex min-h-12 items-center font-medium underline"
          href="/solitaire"
        >
          {words.play}
        </Link>
        <span className={HIDE_ON_PHONES}>
          {words.or}
          <Link
            className="text-accent-foreground inline-flex min-h-12 items-center font-medium underline"
            href="/mahjong"
          >
            {words.playMahjong}
          </Link>
        </span>
      </p>
    </main>
  );
};

export { SignInForm };
