"use client";

import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { Button } from "@lifelink/ui/components/button";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { Segmented } from "@lifelink/ui/components/segmented";
import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";

import { HIDE_ON_PHONES } from "@/features/mahjong/screen";
import { useLocale, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { translateServerMessage } from "@/i18n/server-messages";
import { authClient } from "@/lib/auth-client";

import { BrandMark } from "./brand";

const MIN_PASSWORD_LENGTH = 10;

type Mode = "sign-in" | "sign-up";

type SignInFailure =
  | { code: "passwordMinimum" | "mismatch" | "createError" | "connectionError" }
  | { code: "server"; message: string };

const failureMessage = (
  failure: SignInFailure | null,
  words: Messages["appExtras"]["signIn"],
  locale: InterfaceLocale
): string | null => {
  if (failure === null) {
    return null;
  }

  if (failure.code === "server") {
    return translateServerMessage(failure.message, locale);
  }

  if (failure.code === "passwordMinimum") {
    return words.passwordMinimum(MIN_PASSWORD_LENGTH);
  }

  return words[failure.code];
};

/** Each mode has its own painting, credited on the picture like the landing page. */
const PAINTINGS: Record<
  Mode,
  { caption: string; position: string; src: string }
> = {
  "sign-in": {
    caption: "Claude Monet, Woman with a Parasol, 1875.",
    position: "object-center",
    src: "/landing/monet-woman-with-a-parasol.jpg",
  },
  "sign-up": {
    caption:
      "Georges Seurat, A Sunday Afternoon on the Island of La Grande Jatte, 1884–\u206086.",
    position: "object-right",
    src: "/landing/seurat-sunday-on-la-grande-jatte.jpg",
  },
};

const SignInForm = ({ initialMode = "sign-in" }: { initialMode?: Mode }) => {
  const locale = useLocale();
  const { signIn: words } = useMessages().appExtras;

  const modes = [
    { label: words.signIn, value: "sign-in" },
    { label: words.createOption, value: "sign-up" },
  ] as const;

  const [mode, setMode] = useState<Mode>(initialMode);
  const [failure, setFailure] = useState<SignInFailure | null>(null);
  const error = failureMessage(failure, words, locale);
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

    setFailure(null);

    if (mode === "sign-up" && password.length < MIN_PASSWORD_LENGTH) {
      setFailure({ code: "passwordMinimum" });

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
        let nextFailure: SignInFailure = { code: "createError" };

        if (mode === "sign-in") {
          nextFailure = { code: "mismatch" };
        } else if (result.error.message) {
          nextFailure = { code: "server", message: result.error.message };
        }

        setFailure(nextFailure);
        setBusy(false);

        return;
      }
    } catch {
      setFailure({ code: "connectionError" });
      setBusy(false);

      return;
    }

    // A full navigation so the new session cookie is used for the server-rendered app shell.
    globalThis.location.assign("/");
  };

  const painting = PAINTINGS[mode];
  const title = mode === "sign-in" ? words.welcome : words.createTitle;
  const intro = mode === "sign-in" ? words.body : words.createBody;
  const submitLabel = mode === "sign-in" ? words.signIn : words.createAccount;

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
              {words.backHome}
            </Link>
          </nav>

          <div className="flex flex-col gap-[1.444rem]">
            <div className="flex flex-col gap-[0.889rem]">
              <h1 className="text-[2.444rem] leading-[1.09] font-semibold tracking-[-0.04em] sm:text-[3.111rem] sm:leading-[1.07]">
                {title}
              </h1>
              <p className="text-muted-foreground text-[1.056rem] leading-[1.58]">
                {intro}
              </p>
            </div>
            <Segmented
              label={words.modeLabel}
              onValueChange={(nextMode) => {
                setMode(nextMode);
                setFailure(null);
              }}
              options={modes}
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
                      {words.name}
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
                    {words.email}
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
                    {words.password}
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
                        showPassword ? words.hidePassword : words.showPassword
                      }
                      aria-pressed={showPassword}
                      className="min-h-control-lg min-w-[4.667rem] shrink-0 whitespace-nowrap"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                      variant="outline"
                    >
                      {showPassword ? words.hide : words.show}
                    </Button>
                  </div>
                  {mode === "sign-up" ? (
                    <p className="text-muted-foreground text-[0.889rem]">
                      {words.passwordHint(MIN_PASSWORD_LENGTH)}
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
                {busy ? words.busy : submitLabel}
              </Button>
            </form>
          </div>

          <p className="border-border text-muted-foreground border-t pt-[1.111rem] text-[0.889rem] leading-[1.5]">
            {words.breakPrompt}
            <br />
            <Link
              className="text-accent-foreground inline-flex min-h-12 items-center text-[0.944rem] font-medium underline underline-offset-[0.222rem]"
              href="/solitaire"
            >
              {words.play}
            </Link>
            <span className={HIDE_ON_PHONES}>
              {words.or}
              <Link
                className="text-accent-foreground inline-flex min-h-12 items-center text-[0.944rem] font-medium underline underline-offset-[0.222rem]"
                href="/mahjong"
              >
                {words.playMahjong}
              </Link>
            </span>
          </p>
        </div>
      </main>

      {/* Like the landing page: a painting beside the form, credited on the picture itself. */}
      <figure className="bg-neutral-wash sticky top-0 hidden h-svh self-start overflow-hidden lg:block">
        <div className="relative h-full">
          <Image
            alt={words.paintingAlt[mode]}
            className={`object-cover ${painting.position}`}
            fill
            key={painting.src}
            loading="eager"
            sizes="50vw"
            src={painting.src}
          />
        </div>
        <figcaption className="bg-raised text-foreground absolute right-0 bottom-0 max-w-[calc(100%-1.111rem)] px-[0.889rem] py-[0.556rem] text-[0.889rem] leading-[1.5] text-balance">
          {painting.caption}
        </figcaption>
      </figure>
    </div>
  );
};

export { SignInForm };
