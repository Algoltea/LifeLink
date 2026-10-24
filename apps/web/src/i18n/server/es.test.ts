import { localInboxInsight } from "@lifelink/contracts/inbox";
import { localRecap } from "@lifelink/contracts/recap";
import { describe, expect, it } from "vitest";

import { translateServerMessage } from "../server-messages";

describe("Spanish fixed server messages", () => {
  it.each([
    "I'll be there at 4.",
    "Bob said: “Wait for an answer”",
    "She said: “Sam said: “Please sign in again.””\nKeep this line.  ",
    "\nWait for an answer\n",
    "",
  ])("preserves the complete original quoted reply: %j", (body) => {
    expect(translateServerMessage(`Ana said: “${body}”`, "es")).toBe(
      `Ana dijo: “${body}”`
    );
    expect(
      translateServerMessage(
        `Ana replied, but it is not clear yet: “${body}”`,
        "es"
      )
    ).toBe(`Ana respondió, pero todavía no está claro: “${body}”`);
  });

  it.each([
    "“Ana said: “Wait for an answer””",
    '"Ana said: “Wait for an answer”"',
    "She wrote “Ana said: “Wait for an answer”",
    "Provider error: “Waiting for Ana to answer.”",
    "Unknown error\nAna said: “Wait for an answer”",
    "Ana said: “Wait for an answer” (provider detail)",
    'Ana said: "Wait for an answer"',
    "  Unknown provider error.\nPlease sign in again.  ",
    "Error: Please sign in again.",
    "toString",
    "constructor",
    "__proto__",
  ])("leaves quoted text and unknown errors intact: %j", (message) => {
    expect(translateServerMessage(message, "es")).toBe(message);
  });

  it("preserves names, appointment titles and the original English display", () => {
    const message = "D'Arcy said: “Wait for an answer”";

    expect(translateServerMessage(message, "en")).toBe(message);
    expect(translateServerMessage(message, "es")).toBe(
      "D'Arcy dijo: “Wait for an answer”"
    );
    expect(
      translateServerMessage("Ride to Please sign in again. “clinic”", "es")
    ).toBe("Viaje a Please sign in again. “clinic”");
  });

  it("translates deterministic scam explanations without translating arbitrary labels", () => {
    expect(
      translateServerMessage(
        "This message shows 1 common warning sign: contains a link.",
        "es"
      )
    ).toBe(
      "Este mensaje presenta 1 señal de alerta común: contiene un enlace."
    );
    expect(
      translateServerMessage(
        "This message shows 3 common warning signs: pressure to act fast, mentions a payment method, contains a link.",
        "es"
      )
    ).toBe(
      "Este mensaje presenta 3 señales de alerta comunes: presión para actuar rápido, menciona una forma de pago, contiene un enlace."
    );

    for (const message of [
      "This message shows 1 common warning sign: quoted user words.",
      "This message shows 2 common warning signs: contains a link.",
      "This message shows 1 common warning sign: contains a link. Extra provider details.",
      "This message shows 2 common warning signs: threats, pressure to act fast.",
    ]) {
      expect(translateServerMessage(message, "es")).toBe(message);
    }
  });

  it("keeps practice, privacy and delivery uncertainty explicit", () => {
    expect(
      translateServerMessage(
        "Practice: the message to Ana was not really sent. A practice reply will arrive shortly.",
        "es"
      )
    ).toBe(
      "Práctica: el mensaje para Ana no se envió de verdad. Pronto llegará una respuesta de práctica."
    );
    expect(
      translateServerMessage(
        "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.",
        "es"
      )
    ).toBe(
      "El resumen en la nube no se completó. Se muestra el resumen local; es posible que el proveedor haya recibido estos correos."
    );
    expect(
      translateServerMessage(
        "Photon accepted the iMessage to Ana for delivery.",
        "es"
      )
    ).toBe("Photon aceptó el iMessage para Ana para su entrega.");
    expect(
      translateServerMessage(
        "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.",
        "es"
      )
    ).toBe(
      "Spectrum no ha confirmado si se envió este mensaje. Revise de nuevo o confirme cuando llegue; no se puede marcar con seguridad como no enviado."
    );
  });

  it("translates a real local inbox reason while retaining its evidence", () => {
    const insight = localInboxInsight({
      bodyText: "Could you please reply by Friday?",
      checked: true,
      fromAddress: "ana@example.com",
      fromName: "Ana",
      id: "email-1",
      subject: "Plans",
      summary: null,
      suspicious: false,
    });

    expect(translateServerMessage(insight.reason, "es")).toBe(
      "El asunto o mensaje actual pide una respuesta o confirmación. Revise los detalles antes de responder."
    );
    expect(insight.quote).toBe("please reply");
    expect(insight.summary).toBe("Could you please reply by Friday?");
  });

  it("translates local recap templates without rewriting quotes or proposed drafts", () => {
    const recap = localRecap(
      [{ body: "I can drive you tomorrow.", from: "them", ref: "m1" }],
      { contactName: "Ana", signOff: "Maria" }
    );

    expect(translateServerMessage(recap.summary, "es")).toBe(
      "En su último mensaje con Ana, LifeLink encontró 0 acuerdos y 1 oferta o solicitud sin una respuesta clara."
    );
    expect(translateServerMessage(recap.offers[0]?.text ?? "", "es")).toBe(
      "Ana hizo una oferta o una solicitud. Todavía no hay respuesta."
    );
    expect(recap.offers[0]?.offer.quote).toBe("I can drive you tomorrow.");
    expect(
      translateServerMessage(recap.proposedSteps[0]?.why ?? "", "es")
    ).toBe("Responda a la oferta de Ana si desea aceptarla.");
    expect(recap.proposedSteps[0]?.messageDraft).toBe(
      "Yes please, that would be wonderful. Thank you!\nMaria"
    );
  });

  it("uses usted for the owner's local recap and handles plural counts", () => {
    const recap = localRecap(
      [
        { body: "I can drive you tomorrow.", from: "you", ref: "m1" },
        { body: "Yes please, that would be great.", from: "them", ref: "m2" },
      ],
      { contactName: "Ana", signOff: "Maria" }
    );

    expect(translateServerMessage(recap.summary, "es")).toBe(
      "En sus últimos 2 mensajes con Ana, LifeLink encontró 1 acuerdo y 0 ofertas o solicitudes sin una respuesta clara."
    );
    expect(translateServerMessage(recap.agreements[0]?.text ?? "", "es")).toBe(
      "Usted hizo una oferta o una solicitud y recibió una respuesta afirmativa."
    );
    expect(recap.agreements[0]?.acceptance.quote).toBe(
      "Yes please, that would be great."
    );
  });
});
