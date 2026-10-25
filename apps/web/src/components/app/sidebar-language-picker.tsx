"use client";

import { Select } from "@base-ui/react/select";
import {
  interfaceLocaleOf,
  interfaceLocales,
} from "@lifelink/contracts/locale";
import { CheckIcon, ChevronDownIcon, LanguagesIcon } from "lucide-react";
import { useId } from "react";

import { useLocale, useMessages } from "@/i18n/locale";

import { useLanguagePreference } from "./preferences";

const LANGUAGE_ITEMS = interfaceLocales.map(({ id, label }) => ({
  label,
  value: id,
}));

/** The same visible control for guests, account holders, and the mobile menu. */
const SidebarLanguagePicker = () => {
  const locale = useLocale();
  const t = useMessages();
  const labelId = useId();
  const valueId = useId();
  const { changeLanguage, error, pending, retry } = useLanguagePreference();

  return (
    <div className="flex min-w-0 flex-col">
      <Select.Root
        items={LANGUAGE_ITEMS}
        onValueChange={(value) => {
          if (value !== null) {
            changeLanguage(interfaceLocaleOf(value));
          }
        }}
        value={locale}
      >
        <Select.Trigger
          aria-labelledby={`${labelId} ${valueId}`}
          className="text-foreground hover:bg-neutral-wash data-[popup-open]:bg-neutral-wash flex min-h-[3.111rem] w-full items-center gap-3 rounded-md px-4 py-1.5 text-left transition-colors"
        >
          <LanguagesIcon
            aria-hidden="true"
            className="text-muted-foreground size-5 shrink-0"
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-label" id={labelId}>
              {t.settings.language}
            </span>
            <Select.Value
              className="text-muted-foreground text-[0.778rem] leading-[1.111rem] break-words"
              id={valueId}
            />
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0"
          />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            align="start"
            alignItemWithTrigger={false}
            className="z-50"
            side="top"
            sideOffset={8}
          >
            <Select.Popup
              aria-label={t.settings.language}
              className="motion-pop bg-raised text-foreground max-h-[var(--available-height)] w-[15.556rem] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-xl p-2 shadow-[0_8px_24px_rgb(45_33_24/0.12)] outline-none"
            >
              <div
                aria-hidden="true"
                className="text-label px-3 py-2 font-semibold"
              >
                {t.settings.language}
              </div>
              <Select.List>
                {interfaceLocales.map(({ id, label }) => (
                  <Select.Item
                    className="text-label data-[selected]:bg-neutral-wash data-[highlighted]:bg-neutral-wash flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 outline-none data-[selected]:font-semibold"
                    key={id}
                    value={id}
                  >
                    <Select.ItemText
                      className="min-w-0 flex-1 break-words"
                      lang={id}
                    >
                      {label}
                    </Select.ItemText>
                    <span className="size-5 shrink-0">
                      <Select.ItemIndicator>
                        <CheckIcon
                          aria-hidden="true"
                          className="text-accent-foreground size-5"
                        />
                      </Select.ItemIndicator>
                    </span>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      {pending ? (
        <output className="text-muted-foreground text-label px-4">
          {t.common.saving}
        </output>
      ) : null}
      {error ? (
        <div className="text-negative text-label px-4">
          <p role="alert">
            {t.settings.choicesNotSaved(t.common.genericErrorShort)}
          </p>
          <button
            className="min-h-control font-semibold underline"
            onClick={retry}
            type="button"
          >
            {t.common.tryAgain}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export { SidebarLanguagePicker };
