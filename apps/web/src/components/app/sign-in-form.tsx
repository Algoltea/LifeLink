"use client";

import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Segmented } from "@lifelink/ui/components/segmented";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import { HIDE_ON_PHONES } from "@/features/mahjong/screen";
import { authClient } from "@/lib/auth-client";

import { BrandMark } from "./brand";

const MIN_PASSWORD_LENGTH = 10;

type Mode = "sign-in" | "sign-up";

const SUBMIT_WORDS: Record<Mode, string> = {
  "sign-in": "Sign in",
  "sign-up": "Create account",
};

const HEADINGS: Record<Mode, { intro: string; title: string }> = {
  "sign-in": {
    intro:
      "Sign in to see today’s messages and appointments. Nothing is sent until you say so.",
    title: "Welcome back.",
  },
  "sign-up": {
    intro: "It takes about a minute. Family comes later.",
    title: "Get started.",
  },
};

/** Each mode has its own painting, credited on the picture like the landing page. */
const PAINTINGS: Record<
  Mode,
  { alt: string; caption: string; position: string; src: string }
> = {
  "sign-in": {
    alt: "Claude Monet, Woman with a Parasol: a woman holding a green parasol stands on a windy hilltop against a bright sky, her young son in the grass nearby.",
    caption: "Claude Monet, Woman with a Parasol, 1875.",
    position: "object-center",
    src: "/landing/monet-woman-with-a-parasol.jpg",
  },
  "sign-up": {
    alt: "Georges Seurat, A Sunday Afternoon on the Island of La Grande Jatte: people rest on a sunny riverside lawn while a couple under a parasol stands beside a small dog and a pet monkey.",
    caption:
      "Georges Seurat, A Sunday Afternoon on the Island of La Grande Jatte, 1884–\u206086.",
    position: "object-right",
    src: "/landing/seurat-sunday-on-la-grande-jatte.jpg",
  },
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

  const painting = PAINTINGS[mode];
  const heading = HEADINGS[mode];

  return (
    <div className="bg-background text-foreground grid min-h-svh lg:grid-cols-2">
      <main
        className="flex min-h-svh flex-col px-5 pt-[1.556rem] pb-[1.778rem] sm:px-10"
        id="main"
      >
        <div className="mx-auto flex w-full max-w-[24.444rem] grow flex-col justify-between gap-[2.222rem]">
          <nav
            aria-label="LifeLink"
            className="flex min-h-[2.444rem] items-center justify-between gap-4"
          >
            <span className="flex items-center gap-[0.667rem]">
              <BrandMark size={32} />
              <span className="text-[1.333rem] leading-none font-semibold tracking-[-0.02em]">
                LifeLink
              </span>
            </span>
            <Link
              className="inline-flex min-h-12 items-center text-[0.944rem] font-medium underline underline-offset-[0.278rem]"
              href="/"
            >
              Back to home
            </Link>
          </nav>

          <div className="flex flex-col gap-[1.444rem]">
            <div className="flex flex-col gap-[0.889rem]">
              <h1 className="text-[2.444rem] leading-[1.09] font-semibold tracking-[-0.04em] sm:text-[3.111rem] sm:leading-[1.07]">
                {heading.title}
              </h1>
              <p className="text-muted-foreground text-[1.056rem] leading-[1.58]">
                {heading.intro}
              </p>
            </div>
            <Segmented
              label="Sign in or create an account"
              onValueChange={(nextMode) => {
                setMode(nextMode);
                setError(null);
              }}
              options={MODES}
              stretch
              value={mode}
            />
            <form
              aria-describedby={error ? errorId : undefined}
              className="flex flex-col gap-[1.444rem]"
              onSubmit={(event) => {
                event.preventDefault();
                void submit(new FormData(event.currentTarget));
              }}
            >
              <div className="flex flex-col gap-[1.111rem]">
                {mode === "sign-up" ? (
                  <div className="flex flex-col gap-[0.444rem]">
                    <Label
                      className="text-[0.944rem] font-semibold"
                      htmlFor={nameId}
                    >
                      Your full name
                    </Label>
                    <Input
                      autoComplete="name"
                      className="min-h-control-lg"
                      id={nameId}
                      name="name"
                      required
                    />
                  </div>
                ) : null}
                <div className="flex flex-col gap-[0.444rem]">
                  <Label
                    className="text-[0.944rem] font-semibold"
                    htmlFor={emailId}
                  >
                    Email
                  </Label>
                  <Input
                    autoComplete="email"
                    className="min-h-control-lg"
                    id={emailId}
                    inputMode="email"
                    name="email"
                    required
                    type="email"
                  />
                </div>
                <div className="flex flex-col gap-[0.444rem]">
                  <Label
                    className="text-[0.944rem] font-semibold"
                    htmlFor={passwordId}
                  >
                    Password
                  </Label>
                  <div className="flex gap-[0.444rem]">
                    <Input
                      autoComplete={
                        mode === "sign-in" ? "current-password" : "new-password"
                      }
                      className="min-h-control-lg"
                      id={passwordId}
                      minLength={
                        mode === "sign-up" ? MIN_PASSWORD_LENGTH : undefined
                      }
                      name="password"
                      required
                      type={showPassword ? "text" : "password"}
                    />
                    <Button
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="min-h-control-lg w-[4.667rem]"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      variant="outline"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                  {mode === "sign-up" ? (
                    <p className="text-muted-foreground text-[0.889rem]">
                      At least {MIN_PASSWORD_LENGTH} characters.
                    </p>
                  ) : null}
                </div>
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
              <Button
                aria-busy={busy}
                className="w-full text-[1.056rem] font-semibold"
                disabled={busy}
                size="lg"
                type="submit"
              >
                {busy ? "One moment…" : SUBMIT_WORDS[mode]}
              </Button>
            </form>
          </div>

          <p className="border-border text-muted-foreground border-t pt-[1.111rem] text-[0.889rem] leading-[1.5]">
            Just taking a break?
            <br />
            <Link
              className="text-accent-foreground inline-flex min-h-12 items-center text-[0.944rem] font-medium underline underline-offset-[0.222rem]"
              href="/solitaire"
            >
              Play Solitaire without signing in
            </Link>
            <span className={HIDE_ON_PHONES}>
              {", or "}
              <Link
                className="text-accent-foreground inline-flex min-h-12 items-center text-[0.944rem] font-medium underline underline-offset-[0.222rem]"
                href="/mahjong"
              >
                play Mahjong
              </Link>
            </span>
          </p>
        </div>
      </main>

      {/* Like the landing page: a painting beside the form, credited on the picture itself. */}
      <figure className="bg-neutral-wash sticky top-0 hidden h-svh self-start overflow-hidden lg:block">
        <Image
          alt={painting.alt}
          className={`object-cover ${painting.position}`}
          fill
          key={painting.src}
          loading="eager"
          sizes="50vw"
          src={painting.src}
        />
        <figcaption className="bg-raised text-foreground absolute right-0 bottom-0 max-w-[calc(100%-1.111rem)] px-[0.889rem] py-[0.556rem] text-[0.889rem] leading-[1.5] text-balance">
          {painting.caption}
        </figcaption>
      </figure>
    </div>
  );
};

export { SignInForm };
