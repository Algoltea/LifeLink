/**
 * Shared test harness: the Convex modules map, a fresh test backend, and
 * helpers that create people through the same public functions the app uses.
 */
import { convexTest } from "convex-test";

import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import schema from "../convex/schema";

const modules = import.meta.glob([
  "../convex/**/*.ts",
  "../convex/_generated/*.js",
  "!../convex/**/*.d.ts",
]);

const newBackend = () => convexTest(schema, modules);

type Backend = ReturnType<typeof newBackend>;

type Person = ReturnType<Backend["withIdentity"]>;

const DAY = 86_400_000;

interface Signup {
  demo: boolean;
  name: string;
  role: "family" | "owner";
  subject: string;
}

const signUp = async (
  backend: Backend,
  signup: Signup
): Promise<{ id: Id<"profiles">; person: Person }> => {
  const person = backend.withIdentity({ subject: signup.subject });

  const id = await person.mutation(api.profiles.completeOnboarding, {
    city: null,
    displayName: signup.name,
    postalCode: null,
    preferredName: signup.name.split(" ")[0] ?? signup.name,
    role: signup.role,
    signOffName: null,
    startInDemoMode: signup.demo,
    timeZone: "America/New_York",
  });

  return { id, person };
};

/** An owner with a trusted contact reachable by iMessage. */
const ownerWithContact = async (
  backend: Backend,
  demo: boolean
): Promise<{
  contactId: Id<"contacts">;
  ownerId: Id<"profiles">;
  owner: Person;
}> => {
  const { id, person } = await signUp(backend, {
    demo,
    name: "Ruth Alvarez",
    role: "owner",
    subject: "owner-1",
  });

  const contactId = await person.mutation(api.contacts.create, {
    channels: [
      { address: "+1 (555) 555-0142", channel: "imessage", preferred: true },
    ],
    name: "Sam Alvarez",
    relationship: "Son",
    trusted: true,
  });

  return { contactId, owner: person, ownerId: id };
};

/** Invite a family member with the given scopes and accept as them. */
const connectFamily = async (
  backend: Backend,
  owner: Person,
  scopes: (
    | "appointments.view"
    | "groceries.view"
    | "photos.view"
    | "reminders.view"
    | "rides.view"
    | "scam_alerts.view"
  )[]
): Promise<{
  family: Person;
  familyId: Id<"profiles">;
  grantId: Id<"sharingGrants">;
}> => {
  const contactId = await owner.mutation(api.contacts.create, {
    channels: [
      { address: "linda@example.com", channel: "email", preferred: true },
    ],
    name: "Linda Alvarez",
    relationship: "Daughter",
    trusted: true,
  });

  const invite = await owner.mutation(api.sharing.createInvite, {
    contactId,
    expiresInDays: null,
    scopes,
  });

  const { id, person } = await signUp(backend, {
    demo: false,
    name: "Linda Alvarez",
    role: "family",
    subject: "family-1",
  });

  await person.mutation(api.sharing.acceptInvite, { code: invite.code });

  return { family: person, familyId: id, grantId: invite.grantId };
};

/** The single action of a task, with its current version. */
const onlyAction = async (owner: Person, taskId: Id<"tasks">) => {
  const detail = await owner.query(api.tasks.detail, { taskId });
  const [view] = detail.actions;

  if (view === undefined || view.current === null) {
    throw new Error("Expected the task to have an action.");
  }

  return { current: view.current, detail, view };
};

export { DAY, connectFamily, newBackend, onlyAction, ownerWithContact, signUp };

export type { Backend, Person };
