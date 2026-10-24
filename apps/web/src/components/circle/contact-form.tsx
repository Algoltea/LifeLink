"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import {
  interfaceLocaleOf,
  interfaceLocales,
  isInterfaceLocale,
} from "@lifelink/contracts/locale";
import type { InterfaceLocale } from "@lifelink/contracts/locale";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { cn } from "@lifelink/ui/lib/utils";
import { useAction, useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ImagePlusIcon, PlusIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/app/bits";
import { IsoIcon } from "@/components/app/iso-icon";
import {
  PhoneNumberField,
  defaultRegion,
  joinPhone,
  splitPhone,
} from "@/components/app/phone-number-field";
import { usePreferences } from "@/components/app/preferences";
import { currentMessages, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { prepareAvatar } from "@/lib/avatar-image";
import { messageOf } from "@/lib/errors";

type CircleContact = FunctionReturnType<typeof api.contacts.list>[number];

const languageLabel = (language: string | null | undefined): string =>
  interfaceLocaleOf(language) === "es" ? "Español" : "English";

const contactFormValues = (contact: CircleContact | null) => ({
  language: contact?.language ?? null,
  name: contact?.name ?? "",
  relationship: contact?.relationship ?? "",
  trusted: contact?.trusted ?? true,
});

/** What saving does to the picture: keep it, replace it with a prepared one, or clear it. */
type PictureChange =
  | { kind: "keep" }
  | { blob: Blob; kind: "replace"; previewUrl: string }
  | { kind: "remove" };

type Channel = "discord" | "email" | "imessage" | "telegram";

type Way =
  | "discord"
  | "email"
  | "imessage_email"
  | "imessage_phone"
  | "telegram"
  | "whatsapp";

interface WayDetails {
  /** Ways in the same group are the same identity; a person has at most one. */
  group: string;
  phone: boolean;
  /** Where messages go; WhatsApp has none and is kept on file only. */
  channel: Channel | null;
  /** Its key in the contact form's words. */
  words: keyof Messages["contactForm"]["ways"];
}

const WAYS: Record<Way, WayDetails> = {
  discord: {
    channel: "discord",
    group: "discord",
    phone: false,
    words: "discord",
  },
  email: {
    channel: "email",
    group: "email",
    phone: false,
    words: "email",
  },
  imessage_email: {
    channel: "imessage",
    group: "imessage",
    phone: false,
    words: "imessageEmail",
  },
  imessage_phone: {
    channel: "imessage",
    group: "imessage",
    phone: true,
    words: "imessagePhone",
  },
  telegram: {
    channel: "telegram",
    group: "telegram",
    phone: false,
    words: "telegram",
  },
  whatsapp: {
    channel: null,
    group: "whatsapp",
    phone: true,
    words: "whatsapp",
  },
};

const WAY_ORDER: readonly Way[] = [
  "imessage_phone",
  "imessage_email",
  "email",
  "discord",
  "telegram",
  "whatsapp",
];

const EMAIL_LIKE = /@/u;

/** Keyboard and autofill hints for the ways typed into a plain text box. */
const TEXT_INPUT = {
  autoComplete: "off",
  inputMode: "text",
  type: "text",
} as const;

const EMAIL_INPUT = {
  autoComplete: "email",
  inputMode: "email",
  type: "email",
} as const;

const INPUT_STYLE: Record<
  Way,
  {
    autoComplete: "email" | "off";
    inputMode: "email" | "numeric" | "text";
    type: "email" | "text";
  }
> = {
  discord: { ...TEXT_INPUT, inputMode: "numeric" },
  email: EMAIL_INPUT,
  imessage_email: EMAIL_INPUT,
  imessage_phone: TEXT_INPUT,
  telegram: TEXT_INPUT,
  whatsapp: TEXT_INPUT,
};

/** Each group of the form starts on a quiet rule, so the form scans as three short steps. */
const SECTION = "border-rule border-t pt-5";
const LEGEND = "pb-3 text-lg leading-7 font-semibold";

interface Row {
  key: string;
  region: string;
  value: string;
  way: Way | "";
}

const rowFor = (way: Way | "", address: string, region: string): Row => {
  const phone = way !== "" && WAYS[way].phone;
  const split = phone ? splitPhone(address, region) : null;

  return {
    key: crypto.randomUUID(),
    region: split?.region ?? region,
    value: split?.number ?? address,
    way,
  };
};

/** Preferred way first, then the other sendable ways, then numbers kept on file. */
const initialRows = (contact: CircleContact | null): Row[] => {
  const region = defaultRegion();

  if (contact === null) {
    return [rowFor("imessage_phone", "", region)];
  }

  const sendable = contact.channels
    .toSorted((a, b) => Number(b.preferred) - Number(a.preferred))
    .flatMap((item) => {
      // Telegram comes from its link record below, which also covers a username not yet linked.
      if (item.channel === "in_app" || item.channel === "telegram") {
        return [];
      }

      const imessageWay = EMAIL_LIKE.test(item.address)
        ? "imessage_email"
        : "imessage_phone";

      const way: Way = item.channel === "imessage" ? imessageWay : item.channel;

      return [rowFor(way, item.address, region)];
    });

  const saved = (contact.savedHandles ?? []).map((handle) =>
    rowFor(handle.service, handle.address, region)
  );

  const telegramRow =
    contact.telegram === null
      ? []
      : [rowFor("telegram", contact.telegram.username ?? "", region)];

  const telegramFirst =
    contact.telegram?.preferred === true ||
    contact.channels.some(
      (item) => item.channel === "telegram" && item.preferred
    );

  const rows = telegramFirst
    ? [...telegramRow, ...sendable, ...saved]
    : [...sendable, ...telegramRow, ...saved];

  if (rows[0] === undefined || rows[0].way === "whatsapp") {
    return [rowFor("", "", region), ...rows];
  }

  return rows;
};

/** Telegram as the form chose it: a username to wait for (blank links by one-time link), or none. */
const telegramChoiceOf = (
  rows: Row[]
): { preferred: boolean; username: string | null } | null => {
  const index = rows.findIndex((row) => row.way === "telegram");
  const row = rows[index];

  if (row === undefined) {
    return null;
  }

  return { preferred: index === 0, username: row.value.trim() || null };
};

const addressOf = (row: Row): string => {
  if (row.way === "") {
    return "";
  }

  return WAYS[row.way].phone
    ? joinPhone(row.region, row.value)
    : row.value.trim();
};

const WayRow = ({
  onChange,
  onRemove,
  preferred,
  row,
  usedGroups,
}: {
  onChange: (next: Row) => void;
  onRemove: (() => void) | null;
  preferred: boolean;
  row: Row;
  usedGroups: Set<string>;
}) => {
  const selectId = useId();
  const valueId = useId();
  const helpId = useId();
  const messages = useMessages();
  const t = messages.contactForm;
  const details = row.way === "" ? null : WAYS[row.way];
  const words = details === null ? null : t.ways[details.words];
  const input = row.way === "" ? TEXT_INPUT : INPUT_STYLE[row.way];

  // WhatsApp can't be preferred: LifeLink has nothing to send it with.
  const choices = WAY_ORDER.filter(
    (way) =>
      !(preferred && WAYS[way].channel === null) &&
      (way === row.way || !usedGroups.has(WAYS[way].group))
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        !preferred && "border-border bg-raised rounded-lg border p-4"
      )}
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
          <Label htmlFor={selectId}>
            {preferred ? t.preferredWay : t.anotherWay}
          </Label>
          <select
            className="border-control bg-raised text-foreground hover:border-foreground min-h-control w-full min-w-0 rounded-md border px-4 py-2 text-base transition-colors"
            id={selectId}
            onChange={(event) => {
              const way =
                WAY_ORDER.find((option) => option === event.target.value) ?? "";

              onChange({ ...row, way });
            }}
            value={row.way}
          >
            {preferred ? <option value="">{t.notSetYet}</option> : null}
            {choices.map((way) => (
              <option key={way} value={way}>
                {t.ways[WAYS[way].words].label}
              </option>
            ))}
          </select>
        </div>
        {onRemove ? (
          <Button onClick={onRemove} type="button" variant="ghost">
            {messages.common.remove}
          </Button>
        ) : null}
      </div>
      {details && words ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor={valueId}>{words.valueLabel}</Label>
          {details.phone ? (
            <PhoneNumberField
              describedBy={helpId}
              id={valueId}
              number={row.value}
              onChange={(next) =>
                onChange({ ...row, region: next.region, value: next.number })
              }
              region={row.region}
            />
          ) : (
            <Input
              aria-describedby={helpId}
              autoComplete={input.autoComplete}
              id={valueId}
              inputMode={input.inputMode}
              onChange={(event) =>
                onChange({ ...row, value: event.target.value })
              }
              placeholder={row.way === "telegram" ? "@username" : undefined}
              type={input.type}
              value={row.value}
            />
          )}
          <p className="text-muted-foreground text-label" id={helpId}>
            {words.help}
          </p>
        </div>
      ) : null}
    </div>
  );
};

/** Release a picture preview once it is replaced or the form closes. */
const useRevokeOnChange = (url: string | null): void => {
  useEffect(
    () => () => {
      if (url !== null) {
        URL.revokeObjectURL(url);
      }
    },
    [url]
  );
};

const PicturePicker = ({
  change,
  contact,
  hue,
  name,
  onChange,
  preparing,
  onPreparingChange,
}: {
  change: PictureChange;
  contact: CircleContact | null;
  hue: number;
  name: string;
  onChange: (next: PictureChange) => void;
  preparing: boolean;
  onPreparingChange: (value: boolean) => void;
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const helpId = useId();
  const t = useMessages().contactForm;
  const preview = change.kind === "replace" ? change.previewUrl : null;

  useRevokeOnChange(preview);
  const current = change.kind === "keep" ? (contact?.avatarUrl ?? null) : null;
  const shown = preview ?? current;

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="text-label pb-2 font-medium">{t.picture}</legend>
      <div className="flex flex-wrap items-start gap-4">
        <Avatar hue={hue} name={name || "?"} size="lg" src={shown} />
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              accept="image/*"
              aria-describedby={helpId}
              className="sr-only"
              onChange={async (event) => {
                const [file] = event.target.files ?? [];

                event.target.value = "";

                if (file === undefined) {
                  return;
                }

                if (preparing) {
                  return;
                }

                onPreparingChange(true);
                setFailure(null);

                try {
                  const blob = await prepareAvatar(file);

                  onChange({
                    blob,
                    kind: "replace",
                    previewUrl: URL.createObjectURL(blob),
                  });
                } catch (error) {
                  setFailure(
                    t.pictureFailed(
                      messageOf(error instanceof Error ? error : null)
                    )
                  );
                }

                onPreparingChange(false);
              }}
              ref={fileInput}
              tabIndex={-1}
              type="file"
            />
            <Button
              aria-busy={preparing}
              disabled={preparing}
              onClick={() => fileInput.current?.click()}
              type="button"
              variant="outline"
            >
              <ImagePlusIcon />
              {shown ? t.chooseDifferentPicture : t.choosePicture}
            </Button>
            {shown ? (
              <Button
                onClick={() =>
                  onChange(
                    contact?.avatarUrl ? { kind: "remove" } : { kind: "keep" }
                  )
                }
                type="button"
                variant="ghost"
              >
                {t.removePicture}
              </Button>
            ) : null}
          </div>
          {failure ? (
            <p className="text-destructive text-base" role="alert">
              {failure}
            </p>
          ) : null}
          <p className="text-muted-foreground text-label" id={helpId}>
            {t.pictureHelp}
          </p>
        </div>
      </div>
    </fieldset>
  );
};

/** Add or edit a person. Each way to reach them is exact, and one is preferred. */
const ContactForm = ({
  contact,
  onDone,
}: {
  contact: CircleContact | null;
  onDone: () => void;
}) => {
  const create = useMutation(api.contacts.create);
  const update = useMutation(api.contacts.update);
  const saveAvatar = useAction(api.avatars.save);
  const removeAvatar = useMutation(api.contacts.removeAvatar);
  const [picture, setPicture] = useState<PictureChange>({ kind: "keep" });
  const initial = contactFormValues(contact);
  const [name, setName] = useState(initial.name);
  const [relationship, setRelationship] = useState(initial.relationship);
  const [trusted, setTrusted] = useState(initial.trusted);

  const [language, setLanguage] = useState<InterfaceLocale | null>(
    initial.language
  );

  const { me } = usePreferences();
  const messages = useMessages();
  const t = messages.contactForm;

  const ownLanguage = languageLabel(me?.preferences?.supportLanguage);
  const [rows, setRows] = useState<Row[]>(() => initialRows(contact));

  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<Id<"contacts"> | null>(null);
  const saving = useRef(false);

  const ids = {
    language: useId(),
    languageHelp: useId(),
    name: useId(),
    relationship: useId(),
    trusted: useId(),
  };

  const groupsExcept = (key: string): Set<string> =>
    new Set(
      rows.flatMap((row) =>
        row.key === key || row.way === "" ? [] : [WAYS[row.way].group]
      )
    );

  const remaining = WAY_ORDER.filter(
    (way) => !groupsExcept("").has(WAYS[way].group)
  );

  const replaceRow = (next: Row) =>
    setRows(rows.map((row) => (row.key === next.key ? next : row)));

  const savePicture = async (contactId: Id<"contacts">): Promise<void> => {
    if (picture.kind === "remove") {
      await removeAvatar({ contactId });

      return;
    }

    if (picture.kind === "keep") {
      return;
    }

    const { saved } = await saveAvatar({
      contactId,
      image: await picture.blob.arrayBuffer(),
    });

    if (!saved) {
      throw new Error(currentMessages().contactForm.pictureUnusable);
    }
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();

        if (saving.current || preparing) {
          return;
        }

        saving.current = true;
        setBusy(true);
        setFailure(null);

        const channels = rows.flatMap((row, index) => {
          const channel = row.way === "" ? null : WAYS[row.way].channel;
          const address = addressOf(row);

          // Telegram is saved as a username to wait for, never as an address.
          return channel && channel !== "telegram" && address
            ? [{ address, channel, preferred: index === 0 }]
            : [];
        });

        const [firstChannel] = channels;

        if (firstChannel && !channels.some((item) => item.preferred)) {
          firstChannel.preferred = true;
        }

        // A joined family member's in-app thread isn't edited here, so keep it.
        const inApp = (contact?.channels ?? [])
          .filter((item) => item.channel === "in_app")
          .map((item) => ({
            ...item,
            preferred: channels.length === 0 && item.preferred,
          }));

        const savedHandles = rows.flatMap((row) => {
          const address = addressOf(row);

          return row.way === "whatsapp" && address
            ? [{ address, service: "whatsapp" as const }]
            : [];
        });

        let detailsSaved = false;

        try {
          let savedId: Id<"contacts">;

          const existingId = contact?._id ?? createdId;

          if (existingId === null) {
            savedId = await create({
              channels: [...channels, ...inApp],
              language,
              name,
              relationship,
              savedHandles,
              telegram: telegramChoiceOf(rows),
              trusted,
            });
            setCreatedId(savedId);
          } else {
            await update({
              channels: [...channels, ...inApp],
              contactId: existingId,
              language,
              name,
              relationship,
              savedHandles,
              telegram: telegramChoiceOf(rows),
              trusted,
            });
            savedId = existingId;
          }

          detailsSaved = true;
          await savePicture(savedId);
          toast.success(contact === null ? t.added(name) : t.saved);
          onDone();
        } catch (error) {
          const message = messageOf(error instanceof Error ? error : null);

          setFailure(
            detailsSaved
              ? t.pictureNotSaved(message)
              : t.detailsNotSaved(message)
          );
        }

        saving.current = false;
        setBusy(false);
      }}
    >
      <fieldset
        disabled={busy || preparing}
        className="flex min-w-0 flex-col gap-6"
      >
        <div className={SECTION}>
          <fieldset className="flex min-w-0 flex-col gap-4">
            <legend className={LEGEND}>{t.whoTheyAre}</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor={ids.name}>{t.name}</Label>
                <Input
                  id={ids.name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  value={name}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={ids.relationship}>{t.relationship}</Label>
                <Input
                  id={ids.relationship}
                  onChange={(event) => setRelationship(event.target.value)}
                  placeholder={t.relationshipPlaceholder}
                  value={relationship}
                />
              </div>
            </div>
            <PicturePicker
              change={picture}
              contact={contact}
              hue={contact?.hue ?? 30}
              name={name}
              onChange={setPicture}
              preparing={preparing}
              onPreparingChange={setPreparing}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor={ids.language}>{t.language}</Label>
              <select
                aria-describedby={ids.languageHelp}
                className="border-control bg-raised text-foreground hover:border-foreground min-h-control w-full max-w-sm min-w-0 rounded-md border px-4 py-2 text-base transition-colors"
                id={ids.language}
                onChange={(event) =>
                  setLanguage(
                    isInterfaceLocale(event.target.value)
                      ? event.target.value
                      : null
                  )
                }
                value={language ?? ""}
              >
                <option value="">{t.languageSameAsMine(ownLanguage)}</option>
                {interfaceLocales.map((locale) => (
                  <option key={locale.id} lang={locale.id} value={locale.id}>
                    {locale.label}
                  </option>
                ))}
              </select>
              <p
                className="text-muted-foreground text-label"
                id={ids.languageHelp}
              >
                {t.languageHelp}
              </p>
            </div>
          </fieldset>
        </div>
        <div className={SECTION}>
          <fieldset className="flex min-w-0 flex-col gap-4">
            <legend className={LEGEND}>{t.howToReach}</legend>
            {rows.map((row, index) => (
              <WayRow
                key={row.key}
                onChange={replaceRow}
                onRemove={
                  index === 0
                    ? null
                    : () =>
                        setRows(rows.filter((other) => other.key !== row.key))
                }
                preferred={index === 0}
                row={row}
                usedGroups={groupsExcept(row.key)}
              />
            ))}
            {remaining.length > 0 ? (
              <Button
                className="self-start"
                onClick={() => {
                  const [way] = remaining;

                  if (way) {
                    setRows([...rows, rowFor(way, "", defaultRegion())]);
                  }
                }}
                type="button"
                variant="outline"
              >
                <PlusIcon />
                {t.addWay}
              </Button>
            ) : null}
          </fieldset>
        </div>
        <div className={SECTION}>
          <fieldset className="flex min-w-0 flex-col gap-3">
            <legend className={LEGEND}>{t.askingForHelp}</legend>
            <div className="flex items-center gap-3">
              <Checkbox
                checked={trusted}
                id={ids.trusted}
                onCheckedChange={(checked) => setTrusted(checked)}
              />
              <IsoIcon kind="trusted" size={40} />
              <Label className="cursor-pointer" htmlFor={ids.trusted}>
                {t.trusted}
              </Label>
            </div>
          </fieldset>
        </div>
      </fieldset>
      {failure ? (
        <p className="text-destructive text-base" role="alert">
          {failure}
        </p>
      ) : null}
      {busy ? (
        <output className="text-muted-foreground text-base">
          {t.savingPersonAndPicture}
        </output>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          aria-busy={busy || preparing}
          disabled={busy || preparing}
          type="submit"
        >
          {contact === null && createdId === null ? t.add : t.saveChanges}
        </Button>
        <Button
          disabled={busy || preparing}
          onClick={onDone}
          type="button"
          variant="ghost"
        >
          {messages.common.cancel}
        </Button>
      </div>
    </form>
  );
};

export type { CircleContact };

export { ContactForm };
