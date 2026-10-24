"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { sharingScopes } from "@lifelink/contracts/sharing";
import type { SharingScope } from "@lifelink/contracts/sharing";
import { Button } from "@lifelink/ui/components/button";
import { Checkbox } from "@lifelink/ui/components/checkbox";
import { Dialog } from "@lifelink/ui/components/dialog";
import { Label } from "@lifelink/ui/components/label";
import { Pill } from "@lifelink/ui/components/pill";
import { Segmented } from "@lifelink/ui/components/segmented";
import type { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { CopyIcon, PencilIcon } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { ReadAloudButton } from "@/components/app/bits";
import { LoadingRows } from "@/components/app/states";
import { messageOf } from "@/lib/errors";
import { formatDay } from "@/lib/format";

import type { CircleContact } from "./contact-form";

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
  contact,
  onDone,
}: {
  contact: CircleContact;
  onDone: () => void;
}) => {
  const createInvite = useMutation(api.sharing.createInvite);

  const [scopes, setScopes] = useState<SharingScope[]>([]);

  const [expiry, setExpiry] = useState<Expiry>("none");
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const person = contact;

  if (code !== null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg">
          Give {person?.name.split(" ")[0] ?? "them"} this code. They create a
          LifeLink account, choose “A family member invited me”, and type it in.
          It works once, for 14 days. Copy it now; it’s only shown here once.
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

        if (busy) {
          return;
        }

        setBusy(true);
        setFailure(null);

        try {
          const result = await createInvite({
            contactId: contact._id,
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
        <ScopePicker onChange={setScopes} value={scopes} />
        {scopes.length === 0 ? (
          <p className="text-muted-foreground text-lg">
            Choose at least one thing to share to create a code.
          </p>
        ) : null}
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
          disabled={busy || scopes.length === 0}
          type="submit"
        >
          {busy ? "Making the code…" : "Create invitation code"}
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

const STATE_WORDS: Record<GrantRow["state"], string> = {
  active: "Can see shared information",
  expired: "Sharing ended",
  invited: "Invitation not used yet",
  revoked: "Sharing stopped",
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
    <li className="border-rule flex flex-col gap-4 border-t py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold">{state}</span>
          <span className="text-muted-foreground text-base">
            {grant.expiresAt === null
              ? "No end date"
              : `Until ${formatDay(grant.expiresAt, timeZone)}`}
          </span>
        </div>
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
                    `Sharing couldn’t be updated. ${errorText(error)} Your choices are still here. Choose Save permissions to try again.`
                  );
                }

                setBusy(false);
              }}
            >
              {busy ? "Saving…" : "Save permissions"}
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
        <ul aria-label="Shared information" className="flex flex-wrap gap-2">
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
      {!editing && grant.scopes.length === 0 ? (
        <p className="text-lg">No information is selected to share.</p>
      ) : null}
      {!confirming && failure ? (
        <p className="text-destructive text-base" role="alert">
          {failure}
        </p>
      ) : null}
      {live && !editing ? (
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              setScopes(grant.scopes);
              setEditing(true);
              setFailure(null);
            }}
            variant="outline"
          >
            <PencilIcon />
            Change permissions
          </Button>
          <Button
            onClick={() => {
              setConfirming(true);
              setFailure(null);
            }}
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

/** Permissions belong to the saved person, matched by id rather than their name. */
const ContactPermissions = ({
  contact,
  grants,
  timeZone,
}: {
  contact: CircleContact;
  grants: GrantRow[] | undefined;
  timeZone: string;
}) => {
  const [inviting, setInviting] = useState(false);

  const live = grants?.some(
    (grant) => grant.state === "active" || grant.state === "invited"
  );

  return (
    <section
      aria-label={`Permissions for ${contact.name}`}
      className="bg-parchment flex min-w-0 flex-col gap-5 rounded-xl p-5 sm:p-6"
    >
      <div className="flex max-w-prose flex-col gap-2">
        <h3 className="text-section font-semibold">
          What {contact.name.split(" ")[0]} can see
        </h3>
        <p className="text-lg">
          Choose which information to share in LifeLink. They can only view it;
          they can’t send messages, approve actions, or spend for you.
        </p>
      </div>
      {grants === undefined ? (
        <LoadingRows layout="note" label="Loading permissions" rows={2} />
      ) : null}
      {grants?.length === 0 ? (
        <p className="text-lg">
          You aren’t sharing any information with {contact.name.split(" ")[0]}.
        </p>
      ) : null}
      {grants && grants.length > 0 ? (
        <ul>
          {grants
            .toSorted((left, right) => right.createdAt - left.createdAt)
            .map((grant) => (
              <GrantCard grant={grant} key={grant.id} timeZone={timeZone} />
            ))}
        </ul>
      ) : null}
      {inviting ? (
        <InviteForm contact={contact} onDone={() => setInviting(false)} />
      ) : null}
      {grants !== undefined && !live && !inviting ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-lg">
            To start sharing, choose what they can see and give them an
            invitation code. They enter it in their own LifeLink account.
          </p>
          <Button onClick={() => setInviting(true)}>
            Choose what to share
          </Button>
        </div>
      ) : null}
    </section>
  );
};

const sharingSummary = (grants: GrantRow[] | undefined): string => {
  if (grants === undefined) {
    return "Loading permissions…";
  }

  const active = grants.filter((grant) => grant.state === "active");
  const scopes = new Set(active.flatMap((grant) => grant.scopes));

  if (scopes.size > 0) {
    return `Can see: ${sharingScopes
      .filter((scope) => scopes.has(scope.id))
      .map((scope) => scope.label.toLowerCase())
      .join(", ")}`;
  }

  if (grants.some((grant) => grant.state === "invited")) {
    return "Invitation waiting to be accepted";
  }

  return "No information shared";
};

export { ContactPermissions, sharingSummary };

export type { GrantRow };
