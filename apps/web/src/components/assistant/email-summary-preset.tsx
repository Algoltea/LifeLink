"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { useAction } from "convex/react";
import { MailIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { useOffline } from "@/components/app/offline-queue";
import { usePreferences } from "@/components/app/preferences";
import { useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";

const EmailSummaryPreset = ({
  disabled,
  onSubmitted,
  threadId,
}: {
  disabled: boolean;
  onSubmitted: () => void;
  threadId: string | null;
}) => {
  const summarize = useAction(api.assistant.summarizeInbox);
  const { online } = useOffline();
  const { me } = usePreferences();
  const [allowCloudAnalysis, setAllowCloudAnalysis] = useState(false);
  const [busy, setBusy] = useState(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const pending = useRef(false);
  const consentId = useId();
  const practice = me?.profile?.demoMode === true;
  const t = useMessages().ask.emailSummary;

  return (
    <div className="flex max-w-prose flex-col items-start gap-2">
      <button
        aria-busy={busy}
        className="border-border text-label hover:bg-parchment min-h-control inline-flex items-center gap-2 rounded-full border px-5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || !online || !threadId || busy}
        onClick={async () => {
          if (!threadId || pending.current || !online) {
            return;
          }

          pending.current = true;
          setBusy(true);
          setOperationError(null);
          onSubmitted();

          try {
            await summarize({
              allowCloudAnalysis: !practice && allowCloudAnalysis,
              threadId,
            });
          } catch (error) {
            setOperationError(messageOf(error instanceof Error ? error : null));
          }

          pending.current = false;
          setBusy(false);
        }}
        type="button"
      >
        <MailIcon aria-hidden="true" className="text-primary size-5" />
        {busy ? t.summarizing : t.summarize}
      </button>
      {practice ? null : (
        <details className="text-label max-w-prose">
          <summary className="text-muted-foreground min-h-control flex cursor-pointer items-center px-2 underline underline-offset-4">
            {t.options}
          </summary>
          <label
            className="min-h-control flex cursor-pointer items-start gap-3 py-2"
            htmlFor={consentId}
          >
            <input
              checked={allowCloudAnalysis}
              className="accent-primary mt-1 size-5 shrink-0"
              disabled={busy}
              id={consentId}
              onChange={(event) => setAllowCloudAnalysis(event.target.checked)}
              type="checkbox"
            />
            <span>{t.cloudConsent}</span>
          </label>
        </details>
      )}
      {busy ? (
        <output className="text-muted-foreground text-label">
          {t.working}
        </output>
      ) : null}
      {online ? null : (
        <p className="text-muted-foreground text-label">{t.offline}</p>
      )}
      {operationError ? (
        <p className="text-negative text-label" role="alert">
          {operationError}
        </p>
      ) : null}
    </div>
  );
};

export { EmailSummaryPreset };
