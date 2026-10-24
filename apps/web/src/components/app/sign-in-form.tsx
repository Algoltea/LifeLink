"use client";

import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Segmented } from "@lifelink/ui/components/segmented";
import Link from "next/link";
import { useId, useState } from "react";

import { HIDE_ON_PHONES } from "@/features/mahjong/screen";
import { authClient } from "@/lib/auth-client";

import { BrandName } from "./brand";

const MIN_PASSWORD_LENGTH = 10;

type Mode = "sign-in" | "sign-up";

const SUBMIT_WORDS: Record<Mode, string> = {
  "sign-in": "Sign in",
  "sign-up": "Create account",
};

const MODES = [
  { label: "Sign in", value: "sign-in" },
  { label: "Create an account", value: "sign-up" },
] as const;

const SignInForm = ({ initialMode = "sign-in" }: { initialMode?: Mode }) => {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const submit = async (form: FormData): Promise<void> => {
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    setError(null);

    if (mode === "sign-up" && password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Please choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`
      );

      return;
    }

    setBusy(true);

    try {
      const result =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({
              email,
              name: name || email.split("@")[0] || "Friend",
              password,
            });

      if (result.error) {
        setError(
          mode === "sign-in"
            ? "That email and password did not match. Please check them and try again."
            : (result.error.message ??
                "We could not create the account. Please try again.")
        );
        setBusy(false);

        return;
      }
    } catch {
      setError(
        "We couldn’t connect. Check your internet connection and try again."
      );
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
          {mode === "sign-in" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-muted-foreground text-body">
          LifeLink helps you keep in touch with family and keep track of your
          day. Nothing is sent without your say-so.
        </p>
      </div>
      <Segmented
        label="Sign in or create an account"
        onValueChange={(nextMode) => {
          setMode(nextMode);
          setError(null);
        }}
        options={MODES}
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
            <Label htmlFor={nameId}>Your full name</Label>
            <Input autoComplete="name" id={nameId} name="name" required />
          </div>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor={emailId}>Email</Label>
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
          <Label htmlFor={passwordId}>Password</Label>
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
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              variant="outline"
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          </div>
          {mode === "sign-up" ? (
            <p className="text-muted-foreground text-base">
              At least {MIN_PASSWORD_LENGTH} characters.
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
          {busy ? "One moment…" : SUBMIT_WORDS[mode]}
        </Button>
      </form>
      <p className="border-border text-muted-foreground text-label border-t pt-4">
        Just taking a break?{" "}
        <Link
          className="text-accent-foreground inline-flex min-h-12 items-center font-medium underline"
          href="/solitaire"
        >
          Play Solitaire without signing in
        </Link>
        <span className={HIDE_ON_PHONES}>
          {", or "}
          <Link
            className="text-accent-foreground inline-flex min-h-12 items-center font-medium underline"
            href="/mahjong"
          >
            play Mahjong
          </Link>
        </span>
      </p>
    </main>
  );
};

export { SignInForm };
