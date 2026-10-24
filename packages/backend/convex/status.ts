import { developerIntegrations } from "@lifelink/contracts/integrations";

import { query } from "./_generated/server";
import { developerConfigured } from "./lib/capabilities";
import { demoModeAllowed } from "./lib/env";

/** Which developer integrations this deployment has configured. Never returns values. */
export const integrations = query({
  args: {},
  handler: () => ({
    demoModeAllowed: demoModeAllowed(),
    integrations: developerIntegrations.map((integration) => ({
      configured: developerConfigured(integration.id),
      id: integration.id,
      label: integration.label,
      purpose: integration.purpose,
    })),
  }),
});
