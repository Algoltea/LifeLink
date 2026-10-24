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
  const savedContacts = useQuery(api.contacts.list);
  const imessage = useQuery(api.imessage.list, {});
  const grants = useQuery(api.sharing.listGrants);

  // Keep a sample visible if it still has access that the owner may need to revoke.
  const contacts =
    grants === undefined
      ? undefined
      : savedContacts?.filter(
          (contact) =>
            !contact.sample ||
            grants.some(
              (grant) =>
                grant.contactId === contact._id &&
                (grant.state === "active" || grant.state === "invited")
            )
        );

  const { me } = usePreferences();
  const [editing, setEditing] = useState<CircleContact | "new" | null>(null);
  const [permissionsFor, setPermissionsFor] = useState<string | null>(null);
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
              Add someone you trust. You can message them and choose what they
              can see in LifeLink. Nothing is shared just by adding a person.
            </EmptyNote>
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
                      grants?.filter((grant) => grant.contactId === contact._id)
                    )}
                    permissions={
                      <ContactPermissions
                        contact={contact}
                        grants={grants?.filter(
                          (grant) => grant.contactId === contact._id
                        )}
                        timeZone={timeZone}
                      />
                    }
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
