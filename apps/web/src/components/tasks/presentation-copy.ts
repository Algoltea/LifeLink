import type { Doc } from "@lifelink/backend/convex/_generated/dataModel";
import type { InterfaceLocale } from "@lifelink/contracts/locale";

import { translateServerMessage } from "@/i18n/server-messages";

/** Describe local outcomes without changing the stored receipt or claiming provider delivery. */
const taskOutcomeText = (
  summary: string,
  kind: Doc<"taskSteps">["kind"],
  mode: Doc<"actions">["mode"],
  presentationDemo: boolean,
  locale: InterfaceLocale
): string => {
  if (!presentationDemo || mode !== "simulated") {
    return translateServerMessage(summary, locale);
  }

  switch (kind) {
    case "send_message": {
      return "Message prepared in LifeLink. Nothing was sent outside LifeLink.";
    }

    case "email_reply": {
      return "Reply prepared in LifeLink. Nothing was sent outside LifeLink.";
    }

    case "email_draft": {
      return "Draft prepared in LifeLink. Nothing was saved to a connected mailbox.";
    }

    case "calendar_event": {
      return "Event prepared in LifeLink. No change was made to a connected calendar.";
    }

    case "drive_note": {
      return "Note prepared in LifeLink. Nothing was saved to a connected Google Drive.";
    }

    case "grocery_handoff": {
      return "Completed in LifeLink. No change was made to a connected account.";
    }

    default: {
      return translateServerMessage(summary, locale);
    }
  }
};

const taskBlockerText = (
  blocker: string,
  presentationDemo: boolean,
  locale: InterfaceLocale
): string => {
  if (
    presentationDemo &&
    (blocker ===
      "Practice mode is on. Turn it off and review this again to do it for real." ||
      blocker ===
        "This was prepared in practice mode. Please prepare it again now that practice mode is off.")
  ) {
    return "This action is unavailable for this account. Prepare a new request.";
  }

  return translateServerMessage(blocker, locale);
};

export { taskBlockerText, taskOutcomeText };
