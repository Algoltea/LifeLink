"use client";

import { Button } from "@lifelink/ui/components/button";
import { Pill } from "@lifelink/ui/components/pill";
import { cn } from "@lifelink/ui/lib/utils";
import { Volume2Icon, VolumeXIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { currentMessages, useMessages } from "@/i18n/locale";
import { useSpeech } from "@/lib/speech";

import { usePreferences } from "./preferences";

/** Every simulated outcome carries this mark, so practice is never mistaken for the real thing. */
const SimulatedPill = ({ className }: { className?: string }) => {
  const t = useMessages();

  return (
    <Pill className={className} title={t.common.practiceTitle} tone="simulated">
      {t.common.practice}
    </Pill>
  );
};

const ModePill = ({ mode }: { mode: "live" | "simulated" }) =>
  mode === "simulated" ? <SimulatedPill /> : null;

const AVATAR_PIXELS = { lg: 64, md: 48, sm: 36 } as const;

/** The person's picture, or a stable initial on a pale tint of their own hue: identity, not data. */
const Avatar = ({
  className,
  hue,
  name,
  size = "md",
  src,
}: {
  className?: string;
  hue: number;
  name: string;
  size?: "lg" | "md" | "sm";
  src?: string | null;
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPicture = Boolean(src) && src !== failedSrc;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "text-foreground inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
        size === "sm" && "size-9 text-sm",
        size === "md" && "size-12 text-lg",
        size === "lg" && "size-16 text-2xl",
        className
      )}
      style={{
        backgroundColor: `hsl(${hue} 55% 88%)`,
        color: `hsl(${hue} 45% 22%)`,
      }}
    >
      {showPicture && src ? (
        <Image
          alt=""
          className="size-full object-cover"
          height={AVATAR_PIXELS[size]}
          onError={() => setFailedSrc(src)}
          src={src}
          unoptimized
          width={AVATAR_PIXELS[size]}
        />
      ) : (
        name.trim().charAt(0).toUpperCase()
      )}
    </span>
  );
};

/** Read text aloud at the person's chosen speed; press again to stop. */
const ReadAloudButton = ({
  className,
  label,
  rate,
  text,
  variant = "outline",
}: {
  className?: string;
  label?: string;
  rate?: number;
  text: string;
  variant?: "ghost" | "outline";
}) => {
  const { preferences } = usePreferences();
  const t = useMessages();
  const { error, read, status, stop } = useSpeech();
  const errorId = useId();
  const speaking = status !== "idle";

  const activeLabel =
    status === "loading" ? t.common.readAloudPreparing : t.common.readAloudStop;

  const playbackLabel =
    status === "ready" ? t.common.readAloudPlay : activeLabel;

  return (
    <>
      <Button
        aria-describedby={error ? errorId : undefined}
        aria-pressed={speaking}
        className={className}
        disabled={text.trim().length === 0}
        onClick={async () => {
          if (speaking && status !== "ready") {
            stop();

            return;
          }

          await read(text, rate ?? preferences.speechRate);
        }}
        size="sm"
        variant={variant}
      >
        {speaking ? <VolumeXIcon /> : <Volume2Icon />}
        {speaking ? playbackLabel : (label ?? t.common.readAloud)}
      </Button>
      {status === "ready" ? (
        <Button onClick={stop} size="sm" variant={variant}>
          {t.common.readAloudStop}
        </Button>
      ) : null}
      {error ? (
        <output className="text-negative text-base" id={errorId}>
          {error}
        </output>
      ) : null}
    </>
  );
};

/** Reads new text aloud automatically when the person turned that on in Settings. */
const useAutoReadAloud = (text: string | null): void => {
  const { preferences } = usePreferences();
  const { error, read, status, stop } = useSpeech();

  useEffect(() => {
    if (text !== null && preferences.readAloud) {
      read(text, preferences.speechRate);
    }

    return stop;
  }, [text, preferences.readAloud, preferences.speechRate, read, stop]);

  useEffect(() => {
    if (error !== null) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (status === "ready") {
      toast.info(currentMessages().common.readAloudReady);
    }
  }, [status]);
};

export { Avatar, ModePill, ReadAloudButton, SimulatedPill, useAutoReadAloud };
