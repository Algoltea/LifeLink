/**
 * Sharing scopes for the trusted circle. Each grant names specific scopes,
 * can expire, and can be revoked at any time. Scopes are view-only: nobody in
 * the circle can send, approve, or spend on the owner's behalf.
 */

const sharingScopes = [
  {
    description: "Upcoming appointments, with the time and place.",
    id: "appointments.view",
    label: "Appointments",
  },
  {
    description: "Reminders you have saved and chosen to share.",
    id: "reminders.view",
    label: "Reminders",
  },
  {
    description: "How a ride or errand is going: asked, answered, confirmed.",
    id: "rides.view",
    label: "Ride arrangements",
  },
  {
    description: "Photos you have shared in your family conversations.",
    id: "photos.view",
    label: "Shared photos",
  },
  {
    description: "A note when you check a message that looks like a scam.",
    id: "scam_alerts.view",
    label: "Scam alerts",
  },
  {
    description: "Your saved grocery lists and their budgets.",
    id: "groceries.view",
    label: "Grocery lists",
  },
] as const;

type SharingScope = (typeof sharingScopes)[number]["id"];

const sharingScopeIds: readonly SharingScope[] = sharingScopes.map(
  (scope) => scope.id
);

const isSharingScope = (candidate: string): candidate is SharingScope =>
  sharingScopeIds.some((scope) => scope === candidate);

export { isSharingScope, sharingScopeIds, sharingScopes };

export type { SharingScope };
