"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Input } from "@lifelink/ui/components/input";
import { Label } from "@lifelink/ui/components/label";
import { useMutation } from "convex/react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { messageOf } from "@/lib/errors";

type Channel = "discord" | "email" | "imessage" | "in_app";

const CHANNEL_FIELDS: {
  channel: Exclude<Channel, "in_app">;
  help: string;
  label: string;
}[] = [
  {
    channel: "imessage",
    help: "Their exact iMessage phone number (with country code, like +1 555 555 0142) or Apple ID email. These are different identities. For live iMessage, this person must already be registered in the Photon dashboard. After saving, choose Link iMessage on their contact below.",
    label: "iMessage",
  },
  { channel: "email", help: "Their email address.", label: "Email" },
  {
    channel: "discord",
    help: "Their Discord user ID (a long number).",
    label: "Discord",
  },
];

/** Add or edit a person. Each way to reach them is exact, and one is preferred. */
const ContactForm = ({
  contact,
  onDone,
}: {
  contact: Doc<"contacts"> | null;
  onDone: () => void;
}) => {
  const create = useMutation(api.contacts.create);
  const update = useMutation(api.contacts.update);
  const [name, setName] = useState(contact?.name ?? "");
  const [relationship, setRelationship] = useState(contact?.relationship ?? "");
  const [trusted, setTrusted] = useState(contact?.trusted ?? true);

  const [addresses, setAddresses] = useState<
    Record<Exclude<Channel, "in_app">, string>
  >({
    discord:
      contact?.channels.find((item) => item.channel === "discord")?.address ??
      "",
    email:
      contact?.channels.find((item) => item.channel === "email")?.address ?? "",
    imessage:
      contact?.channels.find((item) => item.channel === "imessage")?.address ??
      "",
  });

  const [preferred, setPreferred] = useState<Channel>(
    contact?.channels.find((item) => item.preferred)?.channel ?? "imessage"
  );

  const [busy, setBusy] = useState(false);

  const ids = {
    discord: useId(),
    email: useId(),
    imessage: useId(),
    name: useId(),
    relationship: useId(),
    trusted: useId(),
  };

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);

        const channels = CHANNEL_FIELDS.flatMap((field) => {
          const address = addresses[field.channel].trim();

          return address
            ? [
                {
                  address,
                  channel: field.channel,
                  preferred: preferred === field.channel,
                },
              ]
            : [];
        });

        if (
          channels.length > 0 &&
          !channels.some((item) => item.preferred) &&
          channels[0]
        ) {
          channels[0].preferred = true;
        }

        try {
          await (contact === null
            ? create({ channels, name, relationship, trusted })
            : update({
                channels,
                contactId: contact._id,
                name,
                relationship,
                trusted,
              }));
          toast.success(contact === null ? `${name} was added.` : "Saved.");
          onDone();
        } catch (error) {
          toast.error(messageOf(error instanceof Error ? error : null));
        }

        setBusy(false);
      }}
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
      <fieldset className="flex flex-col gap-4">
        <legend className="pb-2 text-lg font-semibold">
          How to reach them
        </legend>
        {CHANNEL_FIELDS.map((field) => (
          <div className="flex flex-col gap-2" key={field.channel}>
            <Label htmlFor={ids[field.channel]}>{field.label}</Label>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                aria-describedby={`${ids[field.channel]}-help`}
                className="min-w-0 flex-1"
                id={ids[field.channel]}
                onChange={(event) =>
                  setAddresses({
                    ...addresses,
                    [field.channel]: event.target.value,
                  })
                }
                value={addresses[field.channel]}
              />
              <label className="flex min-h-12 items-center gap-2 text-base">
                <input
                  checked={preferred === field.channel}
                  className="size-5 accent-[var(--accent-ink)]"
                  disabled={addresses[field.channel].trim().length === 0}
                  name="preferred"
                  onChange={() => setPreferred(field.channel)}
                  type="radio"
                />
                Use this first
              </label>
            </div>
            <p
              className="text-muted-foreground text-lg leading-7"
              id={`${ids[field.channel]}-help`}
            >
              {field.help}
            </p>
          </div>
        ))}
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
      <div className="flex flex-wrap gap-3">
        <Button aria-busy={busy} disabled={busy} type="submit">
          {contact === null ? "Add this person" : "Save changes"}
        </Button>
        <Button onClick={onDone} type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export { ContactForm };
