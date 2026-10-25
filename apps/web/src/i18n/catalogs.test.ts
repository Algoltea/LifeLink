import { interfaceLocales } from "@lifelink/contracts/locale";
import { describe, expect, it } from "vitest";

import { translateGameMessage } from "@/features/solitaire/localization";

import { messagesFor } from "./locale";
import { en } from "./messages/en";
import type { Messages } from "./messages/en";
import { translateServerMessage } from "./server-messages";
import { serverCatalogs } from "./server/catalogs";
import { es as spanishServer } from "./server/es";

const catalogFields = (messages: Messages) =>
  Object.entries(messages)
    .map(([namespace, words]) => [namespace, Object.keys(words).toSorted()])
    .toSorted();

// These maps intentionally accept dynamic provider/status keys, so the type
// checker alone cannot detect a missing translated entry.
const connectionFields = (messages: Messages["connections"]) => ({
  errors: Object.keys(messages.errors).toSorted(),
  providers: Object.entries(messages.providers)
    .map(([provider, words]) => [
      provider,
      Object.keys(words.capabilities).toSorted(),
    ])
    .toSorted(),
  states: Object.keys(messages.connectionStates).toSorted(),
});

const translatedLocales = interfaceLocales.flatMap(({ id }) =>
  id === "en" ? [] : [id]
);

describe("complete interface catalogs", () => {
  it.each(interfaceLocales)(
    "provides all core fields and labels in $id",
    ({ id }) => {
      const messages = messagesFor(id);

      expect(catalogFields(messages)).toStrictEqual(catalogFields(en));
      expect(connectionFields(messages.connections)).toStrictEqual(
        connectionFields(en.connections)
      );
      expect(messages.settings.title.trim()).not.toBe("");
      expect(messages.appExtras.signIn.signIn.trim()).not.toBe("");
      expect(messages.solitaire.table.trim()).not.toBe("");
    }
  );

  it.each(translatedLocales)("uses translated core controls in %s", (id) => {
    const messages = messagesFor(id);

    expect(messages.settings.title).not.toBe(en.settings.title);
    expect(messages.appExtras.signIn.signIn).not.toBe(
      en.appExtras.signIn.signIn
    );
    expect(messages.solitaire.table).not.toBe(en.solitaire.table);
    expect(messages.scamResult.localLanguageNotice).not.toBe(
      en.scamResult.localLanguageNotice
    );
  });

  it.each(translatedLocales)(
    "covers dynamic weather, grocery, document and game vocabulary in %s",
    (id) => {
      const messages = messagesFor(id);
      const spanish = messagesFor("es");

      expect({
        conditions: Object.keys(messages.weather.conditions).toSorted(),
        kinds: Object.keys(messages.documents.kinds).toSorted(),
        units: Object.keys(messages.groceries.units).toSorted(),
      }).toStrictEqual({
        conditions: Object.keys(spanish.weather.conditions).toSorted(),
        kinds: Object.keys(spanish.documents.kinds).toSorted(),
        units: Object.keys(spanish.groceries.units).toSorted(),
      });
      expect(
        Object.keys(messages.solitaire.engineExact).toSorted()
      ).toStrictEqual(Object.keys(spanish.solitaire.engineExact).toSorted());
      expect(
        Object.keys(messages.solitaire.engineWords).toSorted()
      ).toStrictEqual(Object.keys(spanish.solitaire.engineWords).toSorted());
      expect(
        messages.solitaire.enginePatterns.map(([pattern]) => [
          pattern.source,
          pattern.flags,
        ])
      ).toStrictEqual(
        spanish.solitaire.enginePatterns.map(([pattern]) => [
          pattern.source,
          pattern.flags,
        ])
      );
    }
  );

  it("identifies the numbered Chinese board column when that column is empty", () => {
    const words = messagesFor("zh").solitaire;

    expect(words.toColumn(7)).toBe("到第 7 列（空列）");
    expect(
      translateGameMessage("Moved king of hearts to empty column 7.", words)
    ).toContain("第 7 列（空列）");
  });

  it.each(interfaceLocales)(
    "distinguishes sending from saving and preserves reply content in $id",
    ({ id }) => {
      const messages = messagesFor(id);
      const recipient = "Élodie 김 <elodie@example.com>";
      const subject = "“Wait for an answer” — 明天";
      const body = "  Please sign in again.\n한국어: “Do not translate me.”  ";

      const narration = messages.actionDetails.spoken.reply(
        recipient,
        subject,
        body
      );

      expect(messages.tasks.approve.email_reply).not.toBe(
        messages.tasks.approve.email_draft
      );
      expect(messages.email.replyComposer.review).not.toBe(
        messages.email.replyComposer.saveDraft
      );
      expect(narration).toContain(recipient);
      expect(narration).toContain(subject);
      expect(narration).toContain(body);
    }
  );
});

describe("fixed server message coverage and provenance", () => {
  it.each(translatedLocales)("covers the same fixed messages in %s", (id) => {
    const catalog = serverCatalogs[id];

    expect(Object.keys(catalog.exact).toSorted()).toStrictEqual(
      Object.keys(spanishServer.exact).toSorted()
    );
    expect(
      catalog.patterns.map(([pattern]) => [pattern.source, pattern.flags])
    ).toStrictEqual(
      spanishServer.patterns.map(([pattern]) => [pattern.source, pattern.flags])
    );
    expect(translateServerMessage("Wait for an answer", id)).not.toBe(
      "Wait for an answer"
    );
    expect(
      translateServerMessage(
        "This audio could not be played. Please try again.",
        id
      )
    ).not.toBe("This audio could not be played. Please try again.");
  });

  it.each(translatedLocales)(
    "keeps nested quotes, names and titles intact in %s",
    (id) => {
      const name = "Ana 김 王 Élodie";
      const body = "“Wait for an answer”\nShe said: “Please sign in again.”  ";
      const title = "Please sign in again. “診察 / 진료”";

      for (const original of [
        `${name} said: “${body}”`,
        `${name} replied, but it is not clear yet: “${body}”`,
      ]) {
        const translated = translateServerMessage(original, id);

        expect(translated).not.toBe(original);
        expect(translated).toContain(name);
        expect(translated).toContain(body);
      }

      expect(translateServerMessage(`Ride to ${title}`, id)).toContain(title);
    }
  );

  it.each(interfaceLocales)(
    "preserves unrecognized provider and authored text in $id",
    ({ id }) => {
      for (const original of [
        "  Provider detail: timeout [E-492]\nPlease sign in again.  ",
        "“Ana said: “Wait for an answer””",
        'Ana said: "Wait for an answer"',
        "This message shows 1 common warning sign: quoted user words.",
        "This message shows 2 common warning signs: contains a link.",
        "This message shows 2 common warning signs: threats, pressure to act fast.",
        "toString",
        "constructor",
        "__proto__",
      ]) {
        expect(translateServerMessage(original, id)).toBe(original);
      }
    }
  );

  it("keeps English text byte-for-byte, including surrounding whitespace", () => {
    const original = "  Wait for an answer\n";

    expect(translateServerMessage(original, "en")).toBe(original);
  });
});
