"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import type { Doc, Id } from "@lifelink/backend/convex/_generated/dataModel";
import { sharingScopes } from "@lifelink/contracts/sharing";
import type { SharingScope } from "@lifelink/contracts/sharing";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Dialog } from "@lifelink/ui/components/dialog";
import { Label } from "@lifelink/ui/components/label";
import { Pill } from "@lifelink/ui/components/pill";
import { Segmented } from "@lifelink/ui/components/segmented";
import { useMutation, useQuery } from "convex/react";
import { CopyIcon, PencilIcon, UserPlusIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { Avatar, ReadAloudButton } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { CHANNEL_WORDS, formatAddress } from "@/components/tasks/details-view";
import { messageOf } from "@/lib/errors";
import { formatDay } from "@/lib/format";

import { ContactForm } from "./contact-form";
import { ContactIMessageSetup } from "./contact-imessage-setup";
import type {
  IMessageContact,
  IMessageContext,
} from "./contact-imessage-setup";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

const EXPIRY_OPTIONS = [
  { label: "No end date", value: "none" },
  { label: "30 days", value: "30" },
  { label: "7 days", value: "7" },
] as const;

type Expiry = (typeof EXPIRY_OPTIONS)[number]["value"];

const ScopePicker = ({
  onChange,
  value,
}: {
  onChange: (scopes: SharingScope[]) => void;
  value: SharingScope[];
}) => {
  const baseId = useId();

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="pb-2 text-lg font-semibold">What they can see</legend>
      {sharingScopes.map((scope) => (
        <div className="flex items-start gap-4" key={scope.id}>
          <Checkbox
            checked={value.includes(scope.id)}
            id={`${baseId}-${scope.id}`}
            onCheckedChange={(checked) =>
              onChange(
                checked
                  ? [...value, scope.id]
                  : value.filter((item) => item !== scope.id)
              )
            }
          />
          <div className="flex flex-col">
            <Label htmlFor={`${baseId}-${scope.id}`}>{scope.label}</Label>
            <span className="text-muted-foreground text-lg leading-7">
              {scope.description}
            </span>
          </div>
        </div>
      ))}
    </fieldset>
  );
};

/** Invite someone to see specific things. The code is shown once; LifeLink keeps only a fingerprint of it. */
const InviteForm = ({
  contacts,
  onDone,
}: {
  contacts: Doc<"contacts">[];
  onDone: () => void;
}) => {
  const createInvite = useMutation(api.sharing.createInvite);

  const [contactId, setContactId] = useState<Id<"contacts"> | "">(
    contacts[0]?._id ?? ""
  );

  const [scopes, setScopes] = useState<SharingScope[]>([
    "appointments.view",
    "rides.view",
  ]);

  const [expiry, setExpiry] = useState<Expiry>("none");
  const [code, setCode] = useState<string | null>(null);
  const selectId = useId();
  const person = contacts.find((contact) => contact._id === contactId);

  if (code !== null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg">
          Give {person?.name.split(" ")[0] ?? "them"} this code. They create a
          LifeLink account, choose “I’m joining a family member”, and type it
          in. It works once, for 14 days.
        </p>
        <p
          className="num border-border bg-raised rounded-xl border px-4 py-5 text-center text-2xl leading-8 font-semibold tracking-wider break-all"
          aria-label={`Invitation code ${code.split("").join(" ")}`}
        >
          {code}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(code);
              toast.success("Code copied.");
            }}
            variant="outline"
          >
            <CopyIcon />
            Copy the code
          </Button>
          <ReadAloudButton
            label="Read the code aloud"
            text={`The code is ${code.replaceAll("-", ", dash, ").split("").join(" ")}`}
          />
          <Button onClick={onDone}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();

        if (contactId === "") {
          return;
        }

        try {
          const result = await createInvite({
            contactId,
            expiresInDays: expiry === "none" ? null : Number(expiry),
            scopes,
          });

          setCode(result.code);
        } catch (error) {
          toast.error(errorText(error));
        }
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={selectId}>Who</Label>
        <select
          className="border-control bg-raised min-h-12 rounded-md border px-4 text-base"
          id={selectId}
          onChange={(event) =>
            setContactId(
              contacts.find((contact) => contact._id === event.target.value)
                ?._id ?? ""
            )
          }
          value={contactId}
        >
          {contacts.map((contact) => (
            <option key={contact._id} value={contact._id}>
              {contact.name} ({contact.relationship})
            </option>
          ))}
        </select>
      </div>
      <ScopePicker onChange={setScopes} value={scopes} />
      <div className="flex flex-col gap-2">
        <span className="text-lg font-semibold">For how long</span>
        <Segmented
          label="For how long"
          onValueChange={setExpiry}
          options={EXPIRY_OPTIONS}
          value={expiry}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={scopes.length === 0 || contactId === ""}
          type="submit"
        >
          Make an invitation code
        </Button>
        <Button onClick={onDone} type="button" variant="ghost">
          Cancel
        </Button>
      </div>
    </form>
  );
};

type GrantRow = NonNullable<
  ReturnType<typeof useQuery<typeof api.sharing.listGrants>>
>[number];

const STATE_WORDS: Record<
  GrantRow["state"],
  { label: string; tone: "accent" | "negative" | "neutral" | "warning" }
> = {
  active: { label: "Sharing", tone: "accent" },
  expired: { label: "Ended (expired)", tone: "neutral" },
  invited: { label: "Invitation not used yet", tone: "warning" },
  revoked: { label: "Stopped", tone: "neutral" },
};

const GrantCard = ({
  grant,
  timeZone,
}: {
  grant: GrantRow;
  timeZone: string;
}) => {
  const updateScopes = useMutation(api.sharing.updateScopes);
  const revoke = useMutation(api.sharing.revoke);
  const [editing, setEditing] = useState(false);
  const [scopes, setScopes] = useState<SharingScope[]>(grant.scopes);
  const [confirming, setConfirming] = useState(false);
  const live = grant.state === "active" || grant.state === "invited";
  const state = STATE_WORDS[grant.state];

  return (
    <li className="border-rule flex flex-col gap-4 border-t py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xl font-semibold">{grant.contactName}</span>
          <span className="text-muted-foreground text-base">
            {grant.expiresAt === null
              ? "No end date"
              : `Until ${formatDay(grant.expiresAt, timeZone)}`}
          </span>
        </div>
        <Pill tone={state.tone}>{state.label}</Pill>
      </div>
      {editing ? (
        <div className="flex flex-col gap-4">
          <ScopePicker onChange={setScopes} value={scopes} />
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={async () => {
                try {
                  await updateScopes({ grantId: grant.id, scopes });
                  setEditing(false);
                  toast.success("Sharing updated. It applies right away.");
                } catch (error) {
                  toast.error(errorText(error));
                }
              }}
            >
              Save
            </Button>
            <Button onClick={() => setEditing(false)} variant="ghost">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {grant.scopes.map((scope) => (
            <li key={scope}>
              <Pill>
                {sharingScopes.find((item) => item.id === scope)?.label ??
                  scope}
              </Pill>
            </li>
          ))}
        </ul>
      )}
      {live && !editing ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setEditing(true)} size="sm" variant="outline">
            <PencilIcon />
            Change what they see
          </Button>
          <Button
            onClick={() => setConfirming(true)}
            size="sm"
            variant="destructive"
          >
            Stop sharing
          </Button>
        </div>
      ) : null}
      <Dialog
        description={`${grant.contactName} will immediately stop seeing anything you shared. You can invite them again later.`}
        onOpenChange={setConfirming}
        open={confirming}
        title={`Stop sharing with ${grant.contactName}?`}
      >
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={async () => {
              await revoke({ grantId: grant.id });
              setConfirming(false);
              toast.success(`Stopped sharing with ${grant.contactName}.`);
            }}
            variant="destructive"
          >
            Stop sharing with {grant.contactName.split(" ")[0]}
          </Button>
          <Button onClick={() => setConfirming(false)} variant="ghost">
            Keep sharing
          </Button>
        </div>
      </Dialog>
    </li>
  );
};

const ContactRow = ({
  canManage,
  contact,
  imessageContext,
  imessageRow,
  onEdit,
  onRemove,
}: {
  canManage: boolean;
  contact: Doc<"contacts">;
  imessageContext: IMessageContext | undefined;
  imessageRow: IMessageContact | undefined;
  onEdit: () => void;
  onRemove: () => void;
}) => (
  <li className="border-rule grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-t py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
    <Avatar hue={contact.hue} name={contact.name} />
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex flex-wrap items-center gap-2 text-xl font-semibold">
        {contact.name}
        {contact.sample ? <Pill tone="simulated">Sample</Pill> : null}
      </span>
      <span className="text-muted-foreground text-base">
        {contact.relationship || "Contact"}
        {contact.trusted ? " · Trusted" : ""}
      </span>
      {contact.channels.map((channel) => (
        <span className="text-base break-words" key={channel.channel}>
          {CHANNEL_WORDS[channel.channel]}: {formatAddress(channel.address)}
          {channel.preferred ? " (first choice)" : ""}
        </span>
      ))}
    </div>
    <div className="col-start-2 flex flex-wrap gap-2 sm:col-start-3 sm:row-start-1 sm:self-center">
      <Button onClick={onEdit} size="sm" variant="outline">
        Edit
      </Button>
      <Button onClick={onRemove} size="sm" variant="ghost">
        Remove
      </Button>
    </div>
    {contact.channels.some((channel) => channel.channel === "imessage") ? (
      <ContactIMessageSetup
        canManage={canManage}
        contactName={contact.name}
        context={imessageContext}
        row={imessageRow}
      />
    ) : null}
  </li>
);

const SharingSection = ({
  contacts,
  grants,
  timeZone,
}: {
  contacts: Doc<"contacts">[] | undefined;
  grants: GrantRow[] | undefined;
  timeZone: string;
}) => {
  const [inviting, setInviting] = useState(false);

  return (
    <section
      aria-labelledby="sharing-heading"
      className="bg-surface flex min-w-0 flex-col gap-4 rounded-xl p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl leading-8 font-semibold" id="sharing-heading">
          Sharing
        </h2>
        {inviting ? null : (
          <Button
            disabled={!contacts?.length}
            onClick={() => setInviting(true)}
            variant="outline"
          >
            Share with someone
          </Button>
        )}
      </div>
      <p className="text-lg">
        Family can only look. They can never send, approve, or spend anything
        for you.
      </p>
      {contacts?.length === 0 ? (
        <p className="text-muted-foreground text-lg leading-7">
          Add a person to your circle before choosing what to share with them.
        </p>
      ) : null}
      {inviting && contacts ? (
        <InviteForm contacts={contacts} onDone={() => setInviting(false)} />
      ) : null}
      {grants === undefined ? (
        <LoadingRows label="Loading sharing" rows={2} />
      ) : null}
      {grants !== undefined && grants.length === 0 ? (
        <EmptyNote>You aren’t sharing anything with anyone.</EmptyNote>
      ) : null}
      {grants !== undefined && grants.length > 0 ? (
        <ul>
          {grants
            .toSorted((left, right) => right.createdAt - left.createdAt)
            .map((grant) => (
              <GrantCard grant={grant} key={grant.id} timeZone={timeZone} />
            ))}
        </ul>
      ) : null}
    </section>
  );
};

const CircleScreen = () => {
  const contacts = useQuery(api.contacts.list);
  const imessage = useQuery(api.imessage.list, {});
  const grants = useQuery(api.sharing.listGrants);
  const remove = useMutation(api.contacts.remove);
  const { me } = usePreferences();
  const [editing, setEditing] = useState<Doc<"contacts"> | "new" | null>(null);
  const [removing, setRemoving] = useState<Doc<"contacts"> | null>(null);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";

  return (
    <>
      <PageHeader
        actions={
          <Button onClick={() => setEditing("new")} size="lg">
            <UserPlusIcon />
            Add a person
          </Button>
        }
        subline="The people you trust, how to reach them, and exactly what each one can see."
        title="Trusted circle"
      />
      {editing === null ? null : (
        <section
          aria-label={
            editing === "new" ? "Add a person" : `Edit ${editing.name}`
          }
          className="bg-surface max-w-prose rounded-xl p-5 sm:p-6"
        >
          <h2 className="pb-5 text-2xl leading-8 font-semibold">
            {editing === "new" ? "Add a person" : `Edit ${editing.name}`}
          </h2>
          <ContactForm
            contact={editing === "new" ? null : editing}
            key={editing === "new" ? "new" : editing._id}
            onDone={() => setEditing(null)}
          />
        </section>
      )}
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section
          aria-labelledby="people-heading"
          className="flex min-w-0 flex-col"
        >
          <h2
            className="pb-3 text-2xl leading-8 font-semibold"
            id="people-heading"
          >
            People
          </h2>
          {contacts === undefined ? (
            <LoadingRows label="Loading people" rows={3} />
          ) : null}
          {contacts !== undefined && contacts.length === 0 ? (
            <EmptyNote>
              No one yet. Add the people you’d like LifeLink to help you reach.
            </EmptyNote>
          ) : null}
          {contacts !== undefined && contacts.length > 0 ? (
            <ul>
              {contacts.map((contact) => (
                <ContactRow
                  canManage={me?.profile?.role === "owner"}
                  contact={contact}
                  imessageContext={imessage}
                  imessageRow={imessage?.contacts.find(
                    (row) => row.contactId === contact._id
                  )}
                  key={contact._id}
                  onEdit={() => setEditing(contact)}
                  onRemove={() => setRemoving(contact)}
                />
              ))}
            </ul>
          ) : null}
        </section>
        <SharingSection
          contacts={contacts}
          grants={grants}
          timeZone={timeZone}
        />
      </div>
      <Dialog
        description={
          removing
            ? `${removing.name} will be removed, and anything you share with them stops right away.`
            : undefined
        }
        onOpenChange={(open) => {
          if (!open) {
            setRemoving(null);
          }
        }}
        open={removing !== null}
        title={removing ? `Remove ${removing.name}?` : "Remove"}
      >
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={async () => {
              if (removing === null) {
                return;
              }

              try {
                await remove({ contactId: removing._id });
                toast.success(`${removing.name} was removed.`);
              } catch (error) {
                toast.error(errorText(error));
              }

              setRemoving(null);
            }}
            variant="destructive"
          >
            Remove {removing?.name.split(" ")[0]}
          </Button>
          <Button onClick={() => setRemoving(null)} variant="ghost">
            Keep
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export { CircleScreen };
