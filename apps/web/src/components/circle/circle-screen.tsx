"use client";

import { api } from "@lifelink/backend/convex/_generated/api";
import { Button } from "@lifelink/ui/components/button";
import { Dialog } from "@lifelink/ui/components/dialog";
import { useMutation, useQuery } from "convex/react";
import { UserPlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/page-header";
import { usePreferences } from "@/components/app/preferences";
import { EmptyNote, LoadingRows } from "@/components/app/states";
import { useMessages } from "@/i18n/locale";
import { messageOf } from "@/lib/errors";

import { ContactEditor } from "./contact-editor";
import type { CircleContact } from "./contact-form";
import { ContactPermissions, sharingSummary } from "./contact-permissions";
import { ContactRow } from "./contact-row";

const errorText = (cause: unknown): string =>
  messageOf(cause instanceof Error ? cause : null);

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
  const messages = useMessages();
  const t = messages.circle;

  // A new confirmation starts without the last one's error.
  if (shownFor !== removing) {
    setShownFor(removing);
    setFailure(null);
  }

  return (
    <Dialog
      description={removing ? t.removeDescription(removing.name) : undefined}
      onOpenChange={(open) => {
        if (!open && !busy) {
          onClose();
        }
      }}
      open={removing !== null}
      title={removing ? t.removeTitle(removing.name) : t.removeFallback}
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
              toast.success(t.removed(removing.name));
              onRemoved();
            } catch (error) {
              setFailure(t.removeFailed(errorText(error)));
            }

            setBusy(false);
          }}
          variant="destructive"
        >
          {busy
            ? t.removing
            : t.removeConfirm(removing?.name.split(" ")[0] ?? "")}
        </Button>
        <Button disabled={busy} onClick={onClose} variant="ghost">
          {t.keep}
        </Button>
      </div>
    </Dialog>
  );
};

const CircleScreen = ({
  initiallyAdding = false,
}: {
  initiallyAdding?: boolean;
}) => {
  const savedContacts = useQuery(api.contacts.list);
  const imessage = useQuery(api.imessage.list, {});
  const grants = useQuery(api.sharing.listGrants);
  const { me } = usePreferences();

  // Outside Practice, keep samples with access the owner may need to revoke.
  const contacts =
    me === undefined || grants === undefined
      ? undefined
      : savedContacts?.filter(
          (contact) =>
            me?.profile?.demoMode === true ||
            !contact.sample ||
            grants.some(
              (grant) =>
                grant.contactId === contact._id &&
                (grant.state === "active" || grant.state === "invited")
            )
        );

  const messages = useMessages();
  const t = messages.circle;

  const [editing, setEditing] = useState<CircleContact | "new" | null>(() =>
    initiallyAdding ? "new" : null
  );

  const [permissionsFor, setPermissionsFor] = useState<string | null>(null);
  const [removing, setRemoving] = useState<CircleContact | null>(null);
  const timeZone = me?.profile?.timeZone ?? "America/New_York";
  const canManage = me?.profile?.role === "owner";
  const addButton = useRef<HTMLButtonElement>(null);
  const peopleHeading = useRef<HTMLHeadingElement>(null);
  const editButtons = useRef(new Map<string, HTMLButtonElement>());
  const permissionButtons = useRef(new Map<string, HTMLButtonElement>());

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
          editing === "new" ? null : (
            <Button onClick={() => setEditing("new")} ref={addButton} size="lg">
              <UserPlusIcon />
              {t.addPerson}
            </Button>
          )
        }
        subline={t.subline}
        title={t.title}
      />
      <div className="flex min-w-0 flex-col gap-8">
        <section
          aria-labelledby="people-heading"
          className="flex min-w-0 flex-col gap-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              className="text-section font-semibold outline-none"
              id="people-heading"
              ref={peopleHeading}
              tabIndex={-1}
            >
              {t.people}
            </h2>
            {contacts !== undefined && contacts.length > 0 ? (
              <span className="text-muted-foreground text-label">
                {t.peopleCount(contacts.length)}
              </span>
            ) : null}
          </div>
          {contacts === undefined ? (
            <LoadingRows layout="contacts" label={t.loadingPeople} rows={3} />
          ) : null}
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
            <EmptyNote>{t.empty}</EmptyNote>
          ) : null}
          {contacts !== undefined && contacts.length > 0 ? (
            <ul className="flex flex-col gap-4">
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
                    onPermissions={() =>
                      setPermissionsFor((current) =>
                        current === contact._id ? null : contact._id
                      )
                    }
                    permissionsOpen={permissionsFor === contact._id}
                    sharingSummary={sharingSummary(
                      grants?.filter(
                        (grant) => grant.contactId === contact._id
                      ),
                      messages.sharing
                    )}
                    permissions={
                      <ContactPermissions
                        contact={contact}
                        grants={grants?.filter(
                          (grant) => grant.contactId === contact._id
                        )}
                        onClose={() => {
                          setPermissionsFor(null);
                          // The panel unmounts first, then focus returns to its button.
                          requestAnimationFrame(() =>
                            permissionButtons.current.get(contact._id)?.focus()
                          );
                        }}
                        timeZone={timeZone}
                      />
                    }
                    permissionsRef={(node) => {
                      if (node) {
                        permissionButtons.current.set(contact._id, node);
                      } else {
                        permissionButtons.current.delete(contact._id);
                      }
                    }}
                  />
                )
              )}
            </ul>
          ) : null}
        </section>
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
