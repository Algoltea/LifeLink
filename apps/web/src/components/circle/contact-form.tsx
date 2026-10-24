"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Id } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { useAction, useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ImagePlusIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar } from "@/components/app/bits";
import {
  PhoneNumberField,
  defaultRegion,
  joinPhone,
  splitPhone,
} from "@/components/app/phone-number-field";
import { prepareAvatar } from "@/lib/avatar-image";
import { messageOf } from "@/lib/errors";

type CircleContact = FunctionReturnType<typeof api.contacts.list>[number];

/** What saving does to the picture: keep it, replace it with a prepared one, or clear it. */
type PictureChange =
  | { kind: "keep" }
  | { blob: Blob; kind: "replace"; previewUrl: string }
  | { kind: "remove" };

type Channel = "discord" | "email" | "imessage";

type Way =
  | "discord"
  | "email"
  | "imessage_email"
  | "imessage_phone"
  | "whatsapp";

interface WayDetails {
  /** Ways in the same group are the same identity; a person has at most one. */
  group: string;
  help: string;
  label: string;
  phone: boolean;
  /** Where messages go; WhatsApp has none and is kept on file only. */
  channel: Channel | null;
  valueLabel: string;
}

const WAYS: Record<Way, WayDetails> = {
  discord: {
    channel: "discord",
    group: "discord",
    help: "Their Discord user ID, a long number. In Discord: Settings, Advanced, Developer Mode, then Copy User ID.",
    label: "Discord",
    phone: false,
    valueLabel: "Discord user ID",
  },
  email: {
    channel: "email",
    group: "email",
    help: "Their email address.",
    label: "Email (Gmail, Outlook, and others)",
    phone: false,
    valueLabel: "Email address",
  },
  imessage_email: {
    channel: "imessage",
    group: "imessage",
    help: "The Apple ID email they use for iMessage. It is a different identity from their phone number. For live iMessage, they must already be registered in the Photon dashboard; after saving, choose Link iMessage on their contact below.",
    label: "iMessage (Apple ID email)",
    phone: false,
    valueLabel: "Apple ID email",
  },
  imessage_phone: {
    channel: "imessage",
    group: "imessage",
    help: "Their iPhone number. For live iMessage, they must already be registered in the Photon dashboard; after saving, choose Link iMessage on their contact below.",
    label: "iMessage (phone number)",
    phone: true,
    valueLabel: "Phone number",
  },
  whatsapp: {
    channel: null,
    group: "whatsapp",
    help: "Kept on file for you. LifeLink can’t send WhatsApp messages yet.",
    label: "WhatsApp (saved only)",
    phone: true,
    valueLabel: "WhatsApp number",
  },
};

const WAY_ORDER: readonly Way[] = [
  "imessage_phone",
  "imessage_email",
  "email",
  "discord",
  "whatsapp",
];

const EMAIL_LIKE = /@/u;

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
      if (item.channel === "in_app") {
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

  const rows = [...sendable, ...saved];

  if (rows[0] === undefined || rows[0].way === "whatsapp") {
    return [rowFor("", "", region), ...rows];
  }

  return rows;
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
  const details = row.way === "" ? null : WAYS[row.way];

  // WhatsApp can't be preferred: LifeLink has nothing to send it with.
  const choices = WAY_ORDER.filter(
    (way) =>
      !(preferred && WAYS[way].channel === null) &&
      (way === row.way || !usedGroups.has(WAYS[way].group))
  );

  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
          <Label htmlFor={selectId}>
            {preferred ? "Preferred way to reach them" : "Another way"}
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
            {preferred ? <option value="">Not set yet</option> : null}
            {choices.map((way) => (
              <option key={way} value={way}>
                {WAYS[way].label}
              </option>
            ))}
          </select>
        </div>
        {onRemove ? (
          <Button onClick={onRemove} type="button" variant="ghost">
            Remove
          </Button>
        ) : null}
      </div>
      {details ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor={valueId}>{details.valueLabel}</Label>
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
              autoComplete={row.way === "discord" ? "off" : "email"}
              id={valueId}
              inputMode={row.way === "discord" ? "numeric" : "email"}
              onChange={(event) =>
                onChange({ ...row, value: event.target.value })
              }
              type={row.way === "discord" ? "text" : "email"}
              value={row.value}
            />
          )}
          <p className="text-muted-foreground text-base" id={helpId}>
            {details.help}
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
  const preview = change.kind === "replace" ? change.previewUrl : null;

  useRevokeOnChange(preview);
  const current = change.kind === "keep" ? (contact?.avatarUrl ?? null) : null;
  const shown = preview ?? current;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="pb-2 text-lg font-semibold">Picture</legend>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar hue={hue} name={name || "?"} size="lg" src={shown} />
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
                `${messageOf(error instanceof Error ? error : null)} Choose a picture to try again.`
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
          {shown ? "Choose a different picture" : "Choose a picture"}
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
            Remove picture
          </Button>
        ) : null}
      </div>
      {failure ? (
        <p className="text-destructive text-base" role="alert">
          {failure}
        </p>
      ) : null}
      <p className="text-muted-foreground text-base" id={helpId}>
        Optional. The photo is made small and square on this device, and
        location and camera details are removed before it is saved.
      </p>
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
  const [name, setName] = useState(contact?.name ?? "");
  const [relationship, setRelationship] = useState(contact?.relationship ?? "");
  const [trusted, setTrusted] = useState(contact?.trusted ?? true);
  const [rows, setRows] = useState<Row[]>(() => initialRows(contact));
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<Id<"contacts"> | null>(null);
  const saving = useRef(false);

  const ids = {
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
      throw new Error(
        "That picture couldn’t be used. Please try another photo."
      );
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

          return channel && address
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
              name,
              relationship,
              savedHandles,
              trusted,
            });
            setCreatedId(savedId);
          } else {
            await update({
              channels: [...channels, ...inApp],
              contactId: existingId,
              name,
              relationship,
              savedHandles,
              trusted,
            });
            savedId = existingId;
          }

          detailsSaved = true;
          await savePicture(savedId);
          toast.success(contact === null ? `${name} was added.` : "Saved.");
          onDone();
        } catch (error) {
          const message = messageOf(error instanceof Error ? error : null);

          setFailure(
            detailsSaved
              ? `The person’s details are saved, but the picture wasn’t saved. ${message} Your choices are still here. Save again to retry, or choose another picture.`
              : `The person’s details couldn’t be saved. ${message} Your entries are still here. Save again to retry.`
          );
        }

        saving.current = false;
        setBusy(false);
      }}
    >
      <p className="text-muted-foreground text-base">
        Choose{" "}
        {contact === null && createdId === null
          ? "Add this person"
          : "Save changes"}{" "}
        to save these details and the picture.
      </p>
      <fieldset
        disabled={busy || preparing}
        className="flex min-w-0 flex-col gap-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.name}>Name</Label>
            <Input
              id={ids.name}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.relationship}>Who they are to you</Label>
            <Input
              id={ids.relationship}
              onChange={(event) => setRelationship(event.target.value)}
              placeholder="Son, neighbour, friend"
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
        <fieldset className="flex flex-col gap-4">
          <legend className="pb-2 text-lg font-semibold">
            How to reach them
          </legend>
          {rows.map((row, index) => (
            <WayRow
              key={row.key}
              onChange={replaceRow}
              onRemove={
                index === 0
                  ? null
                  : () => setRows(rows.filter((other) => other.key !== row.key))
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
              Add another way to reach them
            </Button>
          ) : null}
        </fieldset>
        <div className="flex items-center gap-4">
          <Checkbox
            checked={trusted}
            id={ids.trusted}
            onCheckedChange={(checked) => setTrusted(checked)}
          />
          <Label htmlFor={ids.trusted}>
            In my trusted circle (LifeLink may suggest asking them for help)
          </Label>
        </div>
      </fieldset>
      {failure ? (
        <p className="text-destructive text-base" role="alert">
          {failure}
        </p>
      ) : null}
      {busy ? (
        <output className="text-muted-foreground text-base">
          Saving person and picture…
        </output>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          aria-busy={busy || preparing}
          disabled={busy || preparing}
          type="submit"
        >
          {contact === null && createdId === null
            ? "Add this person"
            : "Save changes"}
        </Button>
        <Button
          disabled={busy || preparing}
          onClick={onDone}
          type="button"
          variant="ghost"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export type { CircleContact };

export { ContactForm };
