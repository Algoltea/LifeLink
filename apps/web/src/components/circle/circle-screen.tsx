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
import {
  CopyIcon,
  EyeIcon,
  InfoIcon,
  PencilIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { ReadAloudButton } from "@/components/app/bits";
import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { formatDay } from "@/lib/format";

import { ContactEditor } from "./contact-editor";
import type { CircleContact } from "./contact-form";
import { ContactRow } from "./contact-row";

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
            <Label className="cursor-pointer" htmlFor={`${baseId}-${scope.id}`}>
              {scope.label}
            </Label>
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
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const selectId = useId();
  const person = contacts.find((contact) => contact._id === contactId);

  if (code !== null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg">
          Give {person?.name.split(" ")[0] ?? "them"} this code. They create a
          LifeLink account, choose “A family member invited me”, and type it in.
          It works once, for 14 days.
        </p>
        <p
          className="num border-border bg-raised rounded-xl border px-4 py-5 text-center text-2xl leading-8 font-semibold tracking-wider break-all"
          aria-label={`Invitation code ${code.split("").join(" ")}`}
        >
          {code}
        </p>
        {failure ? (
          <p className="text-destructive text-base" role="alert">
            {failure}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={busy}
            aria-busy={busy}
            onClick={async () => {
              if (busy) {
                return;
              }

              setBusy(true);
              setFailure(null);

              try {
                await navigator.clipboard.writeText(code);
                toast.success("Code copied.");
              } catch {
                setFailure(
                  "The code couldn’t be copied. Try Copy the code again, or write down the code shown above."
                );
              }

              setBusy(false);
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

        if (busy || contactId === "") {
          return;
        }

        setBusy(true);
        setFailure(null);

        try {
          const result = await createInvite({
            contactId,
            expiresInDays: expiry === "none" ? null : Number(expiry),
            scopes,
          });

          setCode(result.code);
        } catch (error) {
          setFailure(
            `The invitation couldn’t be created. ${errorText(error)} Your choices are still here. Try making the code again.`
          );
        }

        setBusy(false);
      }}
    >
      <fieldset disabled={busy} className="flex min-w-0 flex-col gap-5">
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
      </fieldset>
      {failure ? (
        <p className="text-destructive text-base" role="alert">
          {failure}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          aria-busy={busy}
          disabled={busy || scopes.length === 0 || contactId === ""}
          type="submit"
        >
          {busy ? "Making the code…" : "Make an invitation code"}
        </Button>
        <Button disabled={busy} onClick={onDone} type="button" variant="ghost">
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
  expired: { label: "Ended", tone: "neutral" },
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
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
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
          <fieldset disabled={busy} className="min-w-0">
            <ScopePicker onChange={setScopes} value={scopes} />
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <Button
              disabled={busy}
              aria-busy={busy}
              onClick={async () => {
                if (busy) {
                  return;
                }

                setBusy(true);
                setFailure(null);

                try {
                  await updateScopes({ grantId: grant.id, scopes });
                  setEditing(false);
                  toast.success("Sharing updated. It applies right away.");
                } catch (error) {
                  setFailure(
                    `Sharing couldn’t be updated. ${errorText(error)} Your choices are still here. Choose Save to try again.`
                  );
                }

                setBusy(false);
              }}
            >
              {busy ? "Saving…" : "Save"}
            </Button>
            <Button
              disabled={busy}
              onClick={() => {
                setEditing(false);
                setFailure(null);
              }}
              variant="ghost"
            >
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
      {!confirming && failure ? (
        <p className="text-destructive text-base" role="alert">
          {failure}
        </p>
      ) : null}
      {live && !editing ? (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setEditing(true);
              setFailure(null);
            }}
            size="sm"
            variant="outline"
          >
            <PencilIcon />
            Change what they see
          </Button>
          <Button
            onClick={() => {
              setConfirming(true);
              setFailure(null);
            }}
            size="sm"
            variant="destructive"
          >
            Stop sharing
          </Button>
        </div>
      ) : null}
      <Dialog
        description={`${grant.contactName} will immediately stop seeing anything you shared. You can invite them again later.`}
        onOpenChange={(open) => {
          if (!busy) {
            setConfirming(open);
            setFailure(null);
          }
        }}
        open={confirming}
        title={`Stop sharing with ${grant.contactName}?`}
      >
        {failure ? (
          <p className="text-destructive text-base" role="alert">
            {failure}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={busy}
            aria-busy={busy}
            onClick={async () => {
              if (busy) {
                return;
              }

              setBusy(true);
              setFailure(null);

              try {
                await revoke({ grantId: grant.id });
                setConfirming(false);
                toast.success(`Stopped sharing with ${grant.contactName}.`);
              } catch (error) {
                setFailure(
                  `Sharing couldn’t be stopped. ${errorText(error)} Try Stop sharing again.`
                );
              }

              setBusy(false);
            }}
            variant="destructive"
          >
            {busy
              ? "Stopping sharing…"
              : `Stop sharing with ${grant.contactName.split(" ")[0]}`}
          </Button>
          <Button
            disabled={busy}
            onClick={() => {
              setConfirming(false);
              setFailure(null);
            }}
            variant="ghost"
          >
            Keep sharing
          </Button>
        </div>
      </Dialog>
    </li>
  );
};

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
      className="bg-parchment flex min-w-0 flex-col gap-4 rounded-xl p-5 sm:p-6"
    >
      <h2 className="text-section font-semibold" id="sharing-heading">
        Sharing
      </h2>
      <p className="flex items-start gap-3">
        <ShieldCheckIcon
          aria-hidden="true"
          className="text-accent-foreground mt-0.5 size-6 shrink-0"
        />
        <span>
          <strong className="font-semibold">Family can only look.</strong> They
          can never send, approve, or spend anything for you.
        </span>
      </p>
      <div className="border-rule flex flex-col gap-4 border-t pt-4">
        {grants === undefined ? (
          <LoadingRows layout="note" label="Loading sharing" rows={2} />
        ) : null}
        {grants !== undefined && grants.length === 0 ? (
          <p className="text-muted-foreground">
            You aren’t sharing anything with anyone.
          </p>
        ) : null}
        {grants !== undefined && grants.length > 0 ? (
          <ul className="[&>li:first-child]:border-t-0 [&>li:first-child]:pt-0">
            {grants
              .toSorted((left, right) => right.createdAt - left.createdAt)
              .map((grant) => (
                <GrantCard grant={grant} key={grant.id} timeZone={timeZone} />
              ))}
          </ul>
        ) : null}
        {contacts?.length === 0 ? (
          <p className="text-muted-foreground">
            Add a person to your circle before choosing what to share with them.
          </p>
        ) : null}
        {inviting && contacts ? (
          <InviteForm contacts={contacts} onDone={() => setInviting(false)} />
        ) : (
          <Button
            className="self-start"
            disabled={!contacts?.length}
            onClick={() => setInviting(true)}
            variant="outline"
          >
            <EyeIcon aria-hidden="true" />
            Share with someone
          </Button>
        )}
      </div>
    </section>
  );
};

/** Says once, above the list, which people are samples to practice with. */
const SampleNotice = ({ contacts }: { contacts: CircleContact[] }) => {
  const samples = contacts.filter((contact) => contact.sample);

  if (samples.length === 0) {
    return null;
  }

  const names = new Intl.ListFormat("en", { type: "conjunction" }).format(
    samples.map((contact) => contact.name.split(" ")[0] ?? contact.name)
  );

  let text = "These are sample people, so you can practice safely.";

  if (samples.length < contacts.length) {
    text =
      samples.length === 1
        ? `${names} is a sample person, so you can practice safely.`
        : `${names} are sample people, so you can practice safely.`;
  }

  return (
    <p className="bg-parchment flex items-start gap-3 rounded-xl px-5 py-3">
      <InfoIcon
        aria-hidden="true"
        className="text-muted-foreground mt-1 size-5 shrink-0"
      />
      {text}
    </p>
  );
};

/** Removing someone always asks first; the person stays until it's confirmed. */
const RemovePersonDialog = ({
  onClose,
  onRemoved,
  person: removing,
}: {
  onClose: () => void;
  onRemoved: () => void;
  person: CircleContact | null;
}) => {
  const remove = useMutation(api.contacts.remove);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [shownFor, setShownFor] = useState<CircleContact | null>(removing);

  // A new confirmation starts without the last one's error.
  if (shownFor !== removing) {
    setShownFor(removing);
    setFailure(null);
  }

  return (
    <Dialog
      description={
        removing
          ? `${removing.name} will be removed, and anything you share with them stops right away.`
          : undefined
      }
      onOpenChange={(open) => {
        if (!open && !busy) {
          onClose();
        }
      }}
      open={removing !== null}
      title={removing ? `Remove ${removing.name}?` : "Remove"}
    >
      {failure ? (
        <p className="text-destructive text-base" role="alert">
          {failure}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={busy}
          aria-busy={busy}
          onClick={async () => {
            if (busy || removing === null) {
              return;
            }

            setBusy(true);
            setFailure(null);

            try {
              await remove({ contactId: removing._id });
              toast.success(`${removing.name} was removed.`);
              onRemoved();
            } catch (error) {
              setFailure(
                `The person couldn’t be removed. ${errorText(error)} Try Remove again.`
              );
            }

            setBusy(false);
          }}
          variant="destructive"
        >
          {busy ? "Removing…" : `Remove ${removing?.name.split(" ")[0] ?? ""}`}
        </Button>
        <Button disabled={busy} onClick={onClose} variant="ghost">
          Keep
        </Button>
      </div>
    </Dialog>
  );
};

const CircleScreen = () => {
  const contacts = useQuery(api.contacts.list);
  const imessage = useQuery(api.imessage.list, {});
  const grants = useQuery(api.sharing.listGrants);
  const { me } = usePreferences();
  const [editing, setEditing] = useState<CircleContact | "new" | null>(null);
  const [removing, setRemoving] = useState<CircleContact | null>(null);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";
  const canManage = me?.profile?.role === "owner";
  const addButton = useRef<HTMLButtonElement>(null);
  const peopleHeading = useRef<HTMLHeadingElement>(null);
  const editButtons = useRef(new Map<string, HTMLButtonElement>());

  // Where focus goes once the editor closes: the control that opened it.
  const focusAfterClose = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (editing === null && focusAfterClose.current) {
      focusAfterClose.current();
      focusAfterClose.current = null;
    }
  }, [editing]);

  const closeEditor = (focusTarget: () => void) => {
    focusAfterClose.current = focusTarget;
    setEditing(null);
  };

  const rowFor = (contactId: string) =>
    imessage?.contacts.find((row) => row.contactId === contactId);

  return (
    <>
      <PageHeader
        actions={
          <Button onClick={() => setEditing("new")} ref={addButton} size="lg">
            <UserPlusIcon />
            Add a person
          </Button>
        }
        subline="The people you trust, how to reach them, and exactly what each one can see."
        title="Trusted circle"
      />
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,20.5rem)]">
        <section
          aria-labelledby="people-heading"
          className="flex max-w-3xl min-w-0 flex-col gap-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              className="text-section font-semibold outline-none"
              id="people-heading"
              ref={peopleHeading}
              tabIndex={-1}
            >
              People
            </h2>
            {contacts !== undefined && contacts.length > 0 ? (
              <span className="text-muted-foreground text-label">
                {contacts.length === 1
                  ? "1 person"
                  : `${contacts.length} people`}
              </span>
            ) : null}
          </div>
          {contacts === undefined ? (
            <LoadingRows layout="contacts" label="Loading people" rows={3} />
          ) : null}
          {contacts === undefined ? null : <SampleNotice contacts={contacts} />}
          {editing === "new" ? (
            <ContactEditor
              canManage={canManage}
              contact={null}
              imessageContext={imessage}
              imessageRow={undefined}
              onDone={() => closeEditor(() => addButton.current?.focus())}
            />
          ) : null}
          {contacts !== undefined &&
          contacts.length === 0 &&
          editing === null ? (
            <EmptyNote>
              No one yet. Add the people you’d like LifeLink to help you reach.
            </EmptyNote>
          ) : null}
          {contacts !== undefined && contacts.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {contacts.map((contact) =>
                editing !== null &&
                editing !== "new" &&
                editing._id === contact._id ? (
                  <li key={contact._id}>
                    <ContactEditor
                      canManage={canManage}
                      contact={contact}
                      imessageContext={imessage}
                      imessageRow={rowFor(contact._id)}
                      onDone={() =>
                        closeEditor(() =>
                          editButtons.current.get(contact._id)?.focus()
                        )
                      }
                      onRemove={() => setRemoving(contact)}
                    />
                  </li>
                ) : (
                  <ContactRow
                    contact={contact}
                    editRef={(node) => {
                      if (node) {
                        editButtons.current.set(contact._id, node);
                      } else {
                        editButtons.current.delete(contact._id);
                      }
                    }}
                    imessageContext={imessage}
                    imessageRow={rowFor(contact._id)}
                    key={contact._id}
                    onEdit={() => setEditing(contact)}
                  />
                )
              )}
            </ul>
          ) : null}
        </section>
        <SharingSection
          contacts={contacts}
          grants={grants}
          timeZone={timeZone}
        />
      </div>
      <RemovePersonDialog
        onClose={() => setRemoving(null)}
        onRemoved={() => {
          setRemoving(null);
          closeEditor(() => peopleHeading.current?.focus());
        }}
        person={removing}
      />
    </>
  );
};

export { CircleScreen };
