"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { sharingScopeIds } from "@lifelink/contracts/sharing";
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
import { useLocale, useMessages } from "@/i18n/locale";
import type { Messages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";
import { formatDay } from "@/lib/format";

import type { CircleContact } from "./contact-form";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

type Words = Messages["sharing"];

const expiryOptions = (t: Words) =>
  [
    { label: t.expiry.none, value: "none" },
    { label: t.expiry.thirty, value: "30" },
    { label: t.expiry.seven, value: "7" },
  ] as const;

type Expiry = ReturnType<typeof expiryOptions>[number]["value"];

const ScopePicker = ({
  onChange,
  value,
}: {
  onChange: (scopes: SharingScope[]) => void;
  value: SharingScope[];
}) => {
  const baseId = useId();
  const t = useMessages().sharing;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="pb-2 text-lg font-semibold">{t.whatTheyCanSee}</legend>
      {sharingScopeIds.map((scope) => (
        <div className="flex items-start gap-4" key={scope}>
          <Checkbox
            checked={value.includes(scope)}
            id={`${baseId}-${scope}`}
            onCheckedChange={(checked) =>
              onChange(
                checked
                  ? [...value, scope]
                  : value.filter((item) => item !== scope)
              )
            }
          />
          <div className="flex flex-col">
            <Label className="cursor-pointer" htmlFor={`${baseId}-${scope}`}>
              {t.scopes[scope].label}
            </Label>
            <span className="text-muted-foreground text-lg leading-7">
              {t.scopes[scope].description}
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
  const messages = useMessages();
  const t = messages.sharing;
  const person = contact;

  if (code !== null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-lg">
          {t.giveCode(person?.name.split(" ")[0] ?? t.them)}
        </p>
        <p
          className="num border-border bg-raised rounded-xl border px-4 py-5 text-center text-2xl leading-8 font-semibold tracking-wider break-all"
          aria-label={t.codeAriaLabel(code.split("").join(" "))}
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
                toast.success(t.codeCopied);
              } catch {
                setFailure(t.codeCopyFailed);
              }

              setBusy(false);
            }}
            variant="outline"
          >
            <CopyIcon />
            {t.copyCode}
          </Button>
          <ReadAloudButton
            label={t.readCode}
            text={t.codeSpoken(
              code
                .split("-")
                .map((part) => part.split("").join(" "))
                .join(t.codeSpokenDash)
            )}
          />
          <Button onClick={onDone}>{messages.common.done}</Button>
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
          setFailure(t.inviteFailed(errorText(error)));
        }

        setBusy(false);
      }}
    >
      <fieldset disabled={busy} className="flex min-w-0 flex-col gap-5">
        <ScopePicker onChange={setScopes} value={scopes} />
        {scopes.length === 0 ? (
          <p className="text-muted-foreground text-lg">{t.chooseAtLeastOne}</p>
        ) : null}
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">{t.forHowLong}</span>
          <Segmented
            label={t.forHowLong}
            onValueChange={setExpiry}
            options={expiryOptions(t)}
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
          {busy ? t.makingCode : t.createCode}
        </Button>
        <Button disabled={busy} onClick={onDone} type="button" variant="ghost">
          {messages.common.cancel}
        </Button>
      </div>
    </form>
  );
};

type GrantRow = NonNullable<
  ReturnType<typeof useQuery<typeof api.sharing.listGrants>>
>[number];

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
  const locale = useLocale();
  const messages = useMessages();
  const t = messages.sharing;
  const state = t.state[grant.state];

  return (
    <li className="border-rule flex flex-col gap-4 border-t py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold">{state}</span>
          <span className="text-muted-foreground text-base">
            {grant.expiresAt === null
              ? t.expiry.none
              : t.until(formatDay(grant.expiresAt, timeZone, locale))}
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
                  toast.success(t.updated);
                } catch (error) {
                  setFailure(t.updateFailed(errorText(error)));
                }

                setBusy(false);
              }}
            >
              {busy ? messages.common.saving : t.savePermissions}
            </Button>
            <Button
              disabled={busy}
              onClick={() => {
                setEditing(false);
                setFailure(null);
              }}
              variant="ghost"
            >
              {messages.common.cancel}
            </Button>
          </div>
        </div>
      ) : (
        <ul aria-label={t.sharedInformation} className="flex flex-wrap gap-2">
          {grant.scopes.map((scope) => (
            <li key={scope}>
              <Pill>{t.scopes[scope].label}</Pill>
            </li>
          ))}
        </ul>
      )}
      {!editing && grant.scopes.length === 0 ? (
        <p className="text-lg">{t.noInformationSelected}</p>
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
            {t.changePermissions}
          </Button>
          <Button
            onClick={() => {
              setConfirming(true);
              setFailure(null);
            }}
            variant="destructive"
          >
            {t.stopSharing}
          </Button>
        </div>
      ) : null}
      <Dialog
        description={t.stopDescription(grant.contactName)}
        onOpenChange={(open) => {
          if (!busy) {
            setConfirming(open);
            setFailure(null);
          }
        }}
        open={confirming}
        title={t.stopTitle(grant.contactName)}
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
                toast.success(t.stopped(grant.contactName));
              } catch (error) {
                setFailure(t.stopFailed(errorText(error)));
              }

              setBusy(false);
            }}
            variant="destructive"
          >
            {busy
              ? t.stopping
              : t.stopSharingWith(grant.contactName.split(" ")[0] ?? "")}
          </Button>
          <Button
            disabled={busy}
            onClick={() => {
              setConfirming(false);
              setFailure(null);
            }}
            variant="ghost"
          >
            {t.keepSharing}
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
  const t = useMessages().sharing;
  const firstName = contact.name.split(" ")[0] ?? contact.name;

  const live = grants?.some(
    (grant) => grant.state === "active" || grant.state === "invited"
  );

  return (
    <section
      aria-label={t.permissionsFor(contact.name)}
      className="bg-parchment flex min-w-0 flex-col gap-5 rounded-xl p-5 sm:p-6"
    >
      <div className="flex max-w-prose flex-col gap-2">
        <h3 className="text-section font-semibold">
          {t.whatNameCanSee(firstName)}
        </h3>
        <p className="text-lg">{t.viewOnly}</p>
      </div>
      {grants === undefined ? (
        <LoadingRows layout="note" label={t.loadingPermissions} rows={2} />
      ) : null}
      {grants?.length === 0 ? (
        <p className="text-lg">{t.notSharing(firstName)}</p>
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
          <p className="text-lg">{t.startSharing}</p>
          <Button onClick={() => setInviting(true)}>
            {t.chooseWhatToShare}
          </Button>
        </div>
      ) : null}
    </section>
  );
};

const sharingSummary = (grants: GrantRow[] | undefined, t: Words): string => {
  if (grants === undefined) {
    return t.loadingPermissionsShort;
  }

  const active = grants.filter((grant) => grant.state === "active");
  const scopes = new Set(active.flatMap((grant) => grant.scopes));

  if (scopes.size > 0) {
    return t.canSee(
      sharingScopeIds
        .filter((scope) => scopes.has(scope))
        .map((scope) => t.scopes[scope].label.toLowerCase())
        .join(", ")
    );
  }

  if (grants.some((grant) => grant.state === "invited")) {
    return t.invitationWaiting;
  }

  return t.noInformationShared;
};

export { ContactPermissions, sharingSummary };

export type { GrantRow };
