import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Data model. Gemini proposes; these tables hold what Convex validated,
 * what the person approved, and what actually happened.
 *
 * Every row that represents an outcome carries `mode`: "live" when a real
 * provider was called, "simulated" when the owner explicitly chose demo mode.
 */

const mode = v.union(v.literal("live"), v.literal("simulated"));

const messageChannel = v.union(
  v.literal("imessage"),
  v.literal("discord"),
  v.literal("email"),
  v.literal("in_app")
);

const sharingScope = v.union(
  v.literal("appointments.view"),
  v.literal("reminders.view"),
  v.literal("rides.view"),
  v.literal("photos.view"),
  v.literal("scam_alerts.view"),
  v.literal("groceries.view")
);

const quotedItem = v.object({ quote: v.string(), text: v.string() });

const suggestedReply = v.object({
  draft: v.string(),
  kind: v.union(
    v.literal("accept"),
    v.literal("clarify"),
    v.literal("decline")
  ),
  label: v.string(),
});

const quotedFrom = v.object({
  from: v.union(v.literal("them"), v.literal("you")),
  quote: v.string(),
});

// Why a reading was local rather than from the cloud assistant.
const localReason = v.union(
  v.literal("chosen"),
  v.literal("practice"),
  v.literal("unavailable"),
  v.literal("limit"),
  v.literal("failed"),
  v.null()
);

const groceryItem = v.object({
  name: v.string(),
  quantity: v.union(v.number(), v.null()),
  unit: v.union(v.string(), v.null()),
});

/** Action details, mirroring `@lifelink/contracts/actions`. */
const actionDetails = v.union(
  v.object({
    address: v.string(),
    body: v.string(),
    channel: messageChannel,
    contactId: v.string(),
    contactName: v.string(),
    kind: v.literal("send_message"),
    photoIds: v.array(v.string()),
  }),
  v.object({
    appointmentId: v.union(v.string(), v.null()),
    contactId: v.string(),
    contactName: v.string(),
    kind: v.literal("confirm_arrangement"),
    pickupAt: v.number(),
    summary: v.string(),
  }),
  v.object({
    kind: v.literal("create_reminder"),
    remindAt: v.number(),
    shareWithCircle: v.boolean(),
    title: v.string(),
  }),
  v.object({
    granteeIds: v.array(v.string()),
    kind: v.literal("family_update"),
    scope: sharingScope,
    text: v.string(),
  }),
  v.object({
    budgetCents: v.union(v.number(), v.null()),
    estimatedCents: v.union(v.number(), v.null()),
    items: v.array(groceryItem),
    kind: v.literal("grocery_handoff"),
    listId: v.string(),
    listName: v.string(),
  }),
  v.object({
    body: v.string(),
    connectionId: v.string(),
    kind: v.literal("email_draft"),
    provider: v.union(v.literal("gmail"), v.literal("outlook")),
    replyToMessageId: v.union(v.string(), v.null()),
    subject: v.string(),
    to: v.string(),
  }),
  v.object({
    connectionId: v.string(),
    endsAt: v.number(),
    kind: v.literal("calendar_event"),
    location: v.union(v.string(), v.null()),
    provider: v.union(v.literal("google_calendar"), v.literal("outlook")),
    startsAt: v.number(),
    title: v.string(),
  }),
  v.object({
    body: v.string(),
    connectionId: v.string(),
    kind: v.literal("drive_note"),
    title: v.string(),
  })
);

const ambiguity = v.object({
  field: v.string(),
  options: v.array(v.object({ label: v.string(), value: v.string() })),
  question: v.string(),
  resolvedValue: v.union(v.string(), v.null()),
});

export default defineSchema({
  actionVersions: defineTable({
    actionId: v.id("actions"),
    ambiguities: v.array(ambiguity),
    createdAt: v.number(),
    details: actionDetails,
    fingerprint: v.string(),
    proposedBy: v.union(
      v.literal("model"),
      v.literal("person"),
      v.literal("system")
    ),
    rationale: v.union(v.string(), v.null()),
    version: v.number(),
  }).index("by_action_version", ["actionId", "version"]),

  actions: defineTable({
    createdAt: v.number(),
    currentVersion: v.number(),
    kind: v.union(
      v.literal("send_message"),
      v.literal("confirm_arrangement"),
      v.literal("create_reminder"),
      v.literal("family_update"),
      v.literal("grocery_handoff"),
      v.literal("email_draft"),
      v.literal("calendar_event"),
      v.literal("drive_note")
    ),
    mode,
    ownerId: v.id("profiles"),
    reconciliation: v.optional(
      v.object({
        attemptId: v.id("executionAttempts"),
        expiresAt: v.number(),
        phase: v.union(v.literal("claimed"), v.literal("dispatching")),
        token: v.string(),
      })
    ),
    status: v.union(
      v.literal("awaiting_approval"),
      v.literal("approved"),
      v.literal("executing"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("unknown"),
      v.literal("cancelled")
    ),
    stepId: v.union(v.id("taskSteps"), v.null()),
    taskId: v.id("tasks"),
    updatedAt: v.number(),
  })
    .index("by_task", ["taskId"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_status", ["status"]),

  appointments: defineTable({
    createdAt: v.number(),
    endsAt: v.union(v.number(), v.null()),
    location: v.union(v.string(), v.null()),
    mode,
    notes: v.union(v.string(), v.null()),
    ownerId: v.id("profiles"),
    providerName: v.union(v.string(), v.null()),
    ridePickupAt: v.union(v.number(), v.null()),
    rideStatus: v.union(
      v.literal("none"),
      v.literal("asked"),
      v.literal("confirmed"),
      v.literal("declined")
    ),
    rideWithContactId: v.union(v.id("contacts"), v.null()),
    sourceEmailId: v.union(v.id("emails"), v.null()),
    startsAt: v.number(),
    title: v.string(),
  })
    .index("by_owner_start", ["ownerId", "startsAt"])
    .index("by_source_email", ["sourceEmailId"]),

  approvals: defineTable({
    actionId: v.id("actions"),
    approvedAt: v.number(),
    approvedByProfileId: v.id("profiles"),
    fingerprint: v.string(),
    invalidatedAt: v.union(v.number(), v.null()),
    invalidatedReason: v.union(v.string(), v.null()),
    method: v.union(
      v.literal("tap"),
      v.literal("keyboard"),
      v.literal("offline_queue"),
      v.literal("recurring_authorization")
    ),
    recurringAuthorizationId: v.union(
      v.id("recurringAuthorizations"),
      v.null()
    ),
    version: v.number(),
  }).index("by_action", ["actionId", "version"]),

  assistantConversations: defineTable({
    hasMessages: v.boolean(),
    ownerId: v.id("profiles"),
    threadId: v.string(),
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_ownerId_and_threadId", ["ownerId", "threadId"])
    .index("by_ownerId_and_updatedAt", ["ownerId", "updatedAt"]),

  // Per-person limits on cloud-assistant readings, reserved before each paid call.
  assistantUsage: defineTable({
    dayRequests: v.number(),
    dayStartedAt: v.number(),
    kind: v.union(v.literal("explanation"), v.literal("recap")),
    minuteRequests: v.number(),
    minuteStartedAt: v.number(),
    profileId: v.id("profiles"),
  }).index("by_profile_and_kind", ["profileId", "kind"]),

  auditLog: defineTable({
    actor: v.union(
      v.literal("person"),
      v.literal("family"),
      v.literal("model"),
      v.literal("system"),
      v.literal("provider")
    ),
    at: v.number(),
    detail: v.string(),
    event: v.string(),
    ownerId: v.id("profiles"),
    taskId: v.union(v.id("tasks"), v.null()),
  }).index("by_owner_at", ["ownerId", "at"]),

  briefings: defineTable({
    dateKey: v.string(),
    generatedAt: v.number(),
    greetingFact: v.string(),
    lines: v.array(v.string()),
    mode,
    ownerId: v.id("profiles"),
    source: v.union(v.literal("model"), v.literal("rules")),
  }).index("by_owner_date", ["ownerId", "dateKey"]),

  connections: defineTable({
    accountLabel: v.union(v.string(), v.null()),
    connectedAt: v.union(v.number(), v.null()),
    externalAccountId: v.union(v.string(), v.null()),
    lastError: v.union(v.string(), v.null()),
    mode,
    ownerId: v.id("profiles"),
    pendingAttemptId: v.union(v.string(), v.null()),
    provider: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("expired"),
      v.literal("revoked"),
      v.literal("error")
    ),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_provider", ["ownerId", "provider"])
    .index("by_external_account", ["externalAccountId"]),

  contacts: defineTable({
    channels: v.array(
      v.object({
        address: v.string(),
        channel: messageChannel,
        preferred: v.boolean(),
      })
    ),
    createdAt: v.number(),
    hue: v.number(),
    linkedProfileId: v.union(v.id("profiles"), v.null()),
    name: v.string(),
    ownerId: v.id("profiles"),
    relationship: v.string(),
    sample: v.boolean(),
    // Kept on file only: LifeLink cannot send on these, so they never join `channels`.
    savedHandles: v.optional(
      v.array(
        v.object({
          address: v.string(),
          service: v.literal("whatsapp"),
        })
      )
    ),
    trusted: v.boolean(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_linked_profile", ["linkedProfileId"]),

  // Recaps of text conversations: private to the owner, never read by any family query.
  conversationRecaps: defineTable({
    agreements: v.array(
      v.object({
        acceptance: quotedFrom,
        offer: quotedFrom,
        text: v.string(),
      })
    ),
    cloudRequested: v.boolean(),
    contactId: v.id("contacts"),
    createdAt: v.number(),
    droppedCount: v.number(),
    // The help style this recap was written for. Private notes are never used for recaps.
    helpStyleKey: v.string(),
    // The newest message the recap covers; a newer message means a new recap.
    lastMessageId: v.id("messages"),
    lines: v.array(
      v.object({
        body: v.string(),
        from: v.union(v.literal("them"), v.literal("you")),
        ref: v.string(),
      })
    ),
    localReason,
    method: v.union(v.literal("cloud"), v.literal("local")),
    mode,
    model: v.string(),
    offers: v.array(v.object({ offer: quotedFrom, text: v.string() })),
    ownerId: v.id("profiles"),
    proposedSteps: v.array(
      v.object({
        kind: v.union(v.literal("send_message"), v.literal("create_reminder")),
        messageDraft: v.union(v.string(), v.null()),
        remindAt: v.union(v.number(), v.null()),
        reminderTitle: v.union(v.string(), v.null()),
        // Set once the person prepares this step for review.
        taskId: v.union(v.id("tasks"), v.null()),
        why: v.string(),
      })
    ),
    status: v.union(
      v.literal("recapping"),
      v.literal("done"),
      v.literal("failed")
    ),
    summary: v.string(),
    unclear: v.array(v.string()),
  }).index("by_owner_and_contact", ["ownerId", "contactId"]),

  emails: defineTable({
    actionNeeded: v.union(v.string(), v.null()),
    bodyText: v.string(),
    cloudAnalysisConsent: v.optional(v.boolean()),
    connectionId: v.union(v.id("connections"), v.null()),
    fromAddress: v.string(),
    fromName: v.union(v.string(), v.null()),
    mode,
    ownerId: v.id("profiles"),
    provider: v.union(v.literal("gmail"), v.literal("outlook")),
    providerMessageId: v.string(),
    providerThreadId: v.union(v.string(), v.null()),
    receivedAt: v.number(),
    scamCheck: v.optional(
      v.object({
        checkedAt: v.number(),
        reviewId: v.id("scamReviews"),
        rulesVersion: v.number(),
        verdict: v.union(
          v.literal("likely_scam"),
          v.literal("suspicious"),
          v.literal("unsure")
        ),
        warningCount: v.number(),
      })
    ),
    selectedForReview: v.boolean(),
    subject: v.string(),
    summary: v.union(v.string(), v.null()),
    // A consented cloud summary flagged this email; kept apart from local checks so a rules update can clear only its own flag.
    summaryFlagged: v.optional(v.boolean()),
    suspicious: v.union(v.boolean(), v.null()),
  })
    .index("by_owner_received", ["ownerId", "receivedAt"])
    .index("by_provider_message", ["ownerId", "providerMessageId"]),

  executionAttempts: defineTable({
    actionId: v.id("actions"),
    attemptNumber: v.number(),
    error: v.union(v.string(), v.null()),
    fingerprint: v.string(),
    finishedAt: v.union(v.number(), v.null()),
    idempotencyKey: v.string(),
    mode,
    outcome: v.union(
      v.literal("running"),
      v.literal("succeeded"),
      v.literal("failed_safe"),
      v.literal("unknown"),
      v.literal("reconciled_succeeded"),
      v.literal("reconciled_not_sent")
    ),
    photonReconciliationUncertain: v.optional(v.boolean()),
    photonRoute: v.optional(
      v.object({
        peerUserId: v.string(),
        projectId: v.string(),
        senderId: v.string(),
        spaceId: v.string(),
      })
    ),
    provider: v.string(),
    startedAt: v.number(),
    version: v.number(),
  })
    .index("by_action", ["actionId", "attemptNumber"])
    .index("by_idempotency_key", ["idempotencyKey"]),

  familyUpdates: defineTable({
    createdAt: v.number(),
    granteeIds: v.array(v.id("sharingGrants")),
    mode,
    ownerId: v.id("profiles"),
    scope: sharingScope,
    sourceActionId: v.union(v.id("actions"), v.null()),
    text: v.string(),
  }).index("by_owner_created", ["ownerId", "createdAt"]),

  groceryLists: defineTable({
    budgetCents: v.union(v.number(), v.null()),
    items: v.array(
      v.object({
        checked: v.boolean(),
        estimatedCents: v.union(v.number(), v.null()),
        id: v.string(),
        name: v.string(),
        quantity: v.union(v.number(), v.null()),
        unit: v.union(v.string(), v.null()),
      })
    ),
    lastHandoff: v.union(
      v.object({
        at: v.number(),
        mode,
        url: v.string(),
      }),
      v.null()
    ),
    name: v.string(),
    ownerId: v.id("profiles"),
    preferences: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  imessageEnrollments: defineTable({
    agentUserId: v.union(v.string(), v.null()),
    assignedNumber: v.union(v.string(), v.null()),
    assignmentCreatedAt: v.union(v.number(), v.null()),
    assignmentId: v.union(v.string(), v.null()),
    contactId: v.id("contacts"),
    createdAt: v.number(),
    error: v.union(v.string(), v.null()),
    generation: v.number(),
    handle: v.string(),
    lastIncomingAt: v.union(v.number(), v.null()),
    lastIncomingId: v.union(v.string(), v.null()),
    ownerId: v.id("profiles"),
    peerUserId: v.union(v.string(), v.null()),
    projectId: v.string(),
    protocol: v.optional(v.literal("spectrum")),
    spaceId: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("registering"),
      v.literal("waiting"),
      v.literal("ready"),
      v.literal("failed")
    ),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_project_handle", ["projectId", "handle"])
    .index("by_contact", ["contactId"]),

  incomingEvents: defineTable({
    dedupeKey: v.string(),
    error: v.union(v.string(), v.null()),
    eventType: v.string(),
    mode,
    ownerId: v.union(v.id("profiles"), v.null()),
    payload: v.string(),
    processedAt: v.union(v.number(), v.null()),
    provider: v.string(),
    receivedAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processed"),
      v.literal("ignored"),
      v.literal("failed")
    ),
    verified: v.boolean(),
  }).index("by_dedupe_key", ["provider", "dedupeKey"]),

  // "Help me understand this": private to the owner, never read by any family query.
  messageExplanations: defineTable({
    cloudRequested: v.boolean(),
    createdAt: v.number(),
    dates: v.array(
      v.object({ isoDate: v.union(v.string(), v.null()), quote: v.string() })
    ),
    droppedCount: v.number(),
    emailId: v.union(v.id("emails"), v.null()),
    // The help style this explanation was written for, kept so a scheduled run uses the same one.
    helpStyle: v.optional(
      v.object({
        detail: v.union(v.literal("short"), v.literal("detailed")),
        language: v.string(),
        notes: v.string(),
        stepByStep: v.boolean(),
      })
    ),
    helpStyleKey: v.optional(v.string()),
    interpretations: v.array(v.object({ text: v.string(), why: v.string() })),
    localReason,
    messageId: v.union(v.id("messages"), v.null()),
    method: v.union(v.literal("cloud"), v.literal("local")),
    missingDetails: v.array(v.string()),
    mode,
    model: v.string(),
    ownerId: v.id("profiles"),
    plainSummary: v.string(),
    requests: v.array(quotedItem),
    senderName: v.string(),
    sourceText: v.string(),
    statedFacts: v.array(quotedItem),
    status: v.union(
      v.literal("explaining"),
      v.literal("done"),
      v.literal("failed")
    ),
    suggestedReplies: v.array(suggestedReply),
  })
    .index("by_owner_and_message", ["ownerId", "messageId"])
    .index("by_owner_and_email", ["ownerId", "emailId"]),

  messages: defineTable({
    actionId: v.union(v.id("actions"), v.null()),
    body: v.string(),
    channel: messageChannel,
    contactId: v.id("contacts"),
    createdAt: v.number(),
    direction: v.union(v.literal("outgoing"), v.literal("incoming")),
    mode,
    ownerId: v.id("profiles"),
    photoIds: v.array(v.id("_storage")),
    providerMessageId: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("draft"),
      v.literal("sending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("read"),
      v.literal("failed"),
      v.literal("unknown"),
      v.literal("received")
    ),
    statusUpdatedAt: v.number(),
    taskId: v.union(v.id("tasks"), v.null()),
  })
    .index("by_owner_contact", ["ownerId", "contactId", "createdAt"])
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_provider_message", ["providerMessageId"])
    .index("by_action", ["actionId"]),

  photos: defineTable({
    caption: v.union(v.string(), v.null()),
    contactId: v.union(v.id("contacts"), v.null()),
    contentType: v.string(),
    createdAt: v.number(),
    ownerId: v.id("profiles"),
    sharedWithCircle: v.boolean(),
    storageId: v.id("_storage"),
    uploadedByProfileId: v.id("profiles"),
  })
    .index("by_owner", ["ownerId"])
    .index("by_storage", ["storageId"]),

  preferences: defineTable({
    captions: v.boolean(),
    // The owner's own words about how they like help. Owner-only; used only for explanations written to them.
    communicationNotes: v.optional(v.union(v.string(), v.null())),
    contrast: v.union(v.literal("standard"), v.literal("more")),
    // How LifeLink explains things. Optional so older rows read as the defaults.
    explanationDetail: v.optional(
      v.union(v.literal("short"), v.literal("detailed"))
    ),
    groceryNotes: v.union(v.string(), v.null()),
    profileId: v.id("profiles"),
    readAloud: v.boolean(),
    reducedMotion: v.boolean(),
    speechRate: v.number(),
    stepByStep: v.optional(v.boolean()),
    // One of the offered support languages; checked when saved.
    supportLanguage: v.optional(v.string()),
    textScale: v.number(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    updatedAt: v.number(),
  }).index("by_profile", ["profileId"]),

  profiles: defineTable({
    // Selected conversation; pre-history profiles retain their legacy thread here.
    assistantThreadId: v.union(v.string(), v.null()),
    authUserId: v.string(),
    city: v.union(v.string(), v.null()),
    createdAt: v.number(),
    demoMode: v.boolean(),
    displayName: v.string(),
    postalCode: v.union(v.string(), v.null()),
    preferredName: v.string(),
    role: v.union(v.literal("owner"), v.literal("family")),
    signOffName: v.union(v.string(), v.null()),
    timeZone: v.string(),
  }).index("by_auth_user", ["authUserId"]),

  providerHandles: defineTable({
    conversationId: v.union(v.string(), v.null()),
    externalUserId: v.union(v.string(), v.null()),
    handle: v.string(),
    provider: v.union(v.literal("photon"), v.literal("discord")),
    updatedAt: v.number(),
  })
    .index("by_provider_handle", ["provider", "handle"])
    .index("by_provider_external", ["provider", "externalUserId"]),

  providerReceipts: defineTable({
    actionId: v.id("actions"),
    attemptId: v.id("executionAttempts"),
    mode,
    provider: v.string(),
    providerReference: v.union(v.string(), v.null()),
    receivedAt: v.number(),
    summary: v.string(),
    url: v.union(v.string(), v.null()),
  }).index("by_action", ["actionId"]),

  recurringAuthorizations: defineTable({
    actionKind: v.literal("grocery_handoff"),
    createdAt: v.number(),
    expiresAt: v.number(),
    listId: v.id("groceryLists"),
    maxPerUseCents: v.number(),
    maxUses: v.number(),
    ownerId: v.id("profiles"),
    revokedAt: v.union(v.number(), v.null()),
    usesCount: v.number(),
  }).index("by_owner", ["ownerId"]),

  reminders: defineTable({
    createdAt: v.number(),
    dismissedAt: v.union(v.number(), v.null()),
    firedAt: v.union(v.number(), v.null()),
    mode,
    ownerId: v.id("profiles"),
    remindAt: v.number(),
    scheduledJobId: v.union(v.id("_scheduled_functions"), v.null()),
    shareWithCircle: v.boolean(),
    sourceActionId: v.union(v.id("actions"), v.null()),
    title: v.string(),
  })
    .index("by_owner_time", ["ownerId", "remindAt"])
    .index("by_source_action", ["sourceActionId"]),

  scamReviews: defineTable({
    askTrustedContact: v.boolean(),
    automatic: v.optional(v.boolean()),
    cloudAnalysisConsent: v.optional(v.boolean()),
    confidence: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    createdAt: v.number(),
    emailId: v.union(v.id("emails"), v.null()),
    explanation: v.string(),
    inputKind: v.union(
      v.literal("text"),
      v.literal("email"),
      v.literal("screenshot")
    ),
    inputText: v.union(v.string(), v.null()),
    mode,
    model: v.string(),
    nextSteps: v.array(v.string()),
    ownerId: v.id("profiles"),
    screenshotId: v.union(v.id("_storage"), v.null()),
    signals: v.array(
      v.object({
        detail: v.string(),
        // verified: found word for word in the checked text. image_unverified: read from a screenshot.
        evidence: v.optional(
          v.union(v.literal("verified"), v.literal("image_unverified"))
        ),
        label: v.string(),
        quote: v.union(v.string(), v.null()),
        stance: v.optional(
          v.union(
            v.literal("requests"),
            v.literal("warns_against"),
            v.literal("mentions")
          )
        ),
      })
    ),
    status: v.union(
      v.literal("reviewing"),
      v.literal("done"),
      v.literal("failed")
    ),
    // Quotes the model gave that were not in the text, so they were removed.
    unverifiedQuoteCount: v.optional(v.number()),
    verdict: v.union(
      v.literal("likely_scam"),
      v.literal("suspicious"),
      v.literal("likely_safe"),
      v.literal("unsure")
    ),
    verificationTaskId: v.union(v.id("tasks"), v.null()),
  })
    .index("by_owner_created", ["ownerId", "createdAt"])
    .index("by_email", ["emailId"]),

  sharingGrants: defineTable({
    acceptedAt: v.union(v.number(), v.null()),
    contactId: v.id("contacts"),
    createdAt: v.number(),
    expiresAt: v.union(v.number(), v.null()),
    granteeProfileId: v.union(v.id("profiles"), v.null()),
    inviteCodeHash: v.string(),
    ownerId: v.id("profiles"),
    revokedAt: v.union(v.number(), v.null()),
    scopes: v.array(sharingScope),
    updatedAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_grantee", ["granteeProfileId"])
    .index("by_invite_code", ["inviteCodeHash"])
    .index("by_contact", ["contactId"]),

  speechUsage: defineTable({
    dayCharacters: v.number(),
    dayStartedAt: v.number(),
    minuteRequests: v.number(),
    minuteStartedAt: v.number(),
    profileId: v.id("profiles"),
  }).index("by_profile", ["profileId"]),

  spendingLimits: defineTable({
    category: v.literal("groceries"),
    monthlyCents: v.union(v.number(), v.null()),
    ownerId: v.id("profiles"),
    perOrderCents: v.number(),
    updatedAt: v.number(),
  }).index("by_owner_category", ["ownerId", "category"]),

  taskSteps: defineTable({
    actionId: v.union(v.id("actions"), v.null()),
    detail: v.union(v.string(), v.null()),
    kind: v.union(
      v.literal("send_message"),
      v.literal("await_reply"),
      v.literal("confirm_arrangement"),
      v.literal("create_reminder"),
      v.literal("family_update"),
      v.literal("grocery_handoff"),
      v.literal("email_draft"),
      v.literal("calendar_event"),
      v.literal("drive_note")
    ),
    label: v.string(),
    order: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("awaiting_approval"),
      v.literal("running"),
      v.literal("waiting"),
      v.literal("succeeded"),
      v.literal("failed"),
      v.literal("unknown"),
      v.literal("skipped")
    ),
    taskId: v.id("tasks"),
    updatedAt: v.number(),
  })
    .index("by_task", ["taskId", "order"])
    .index("by_action", ["actionId"]),

  tasks: defineTable({
    appointmentId: v.union(v.id("appointments"), v.null()),
    contactId: v.union(v.id("contacts"), v.null()),
    createdAt: v.number(),
    kind: v.union(
      v.literal("ride_request"),
      v.literal("send_message"),
      v.literal("create_reminder"),
      v.literal("grocery_handoff"),
      v.literal("scam_verification"),
      v.literal("email_draft"),
      v.literal("calendar_event"),
      v.literal("drive_note")
    ),
    mode,
    origin: v.union(
      v.literal("text"),
      v.literal("voice"),
      v.literal("email"),
      v.literal("offline_queue")
    ),
    ownerId: v.id("profiles"),
    request: v.string(),
    status: v.union(
      v.literal("needs_clarification"),
      v.literal("awaiting_approval"),
      v.literal("in_progress"),
      v.literal("waiting_for_reply"),
      v.literal("needs_attention"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_owner_updated", ["ownerId", "updatedAt"])
    .index("by_owner_status", ["ownerId", "status"])
    .index("by_contact_status", ["contactId", "status"]),
});
