interface ServerCatalog {
  exact: Record<string, string>;
  patterns: [RegExp, (...parts: string[]) => string][];
}

const SCAM_SIGNS = [
  ["pressure to act fast", "Druck, schnell zu handeln"],
  ["mentions private details", "erwähnt private Daten"],
  ["mentions a payment method", "erwähnt eine Zahlungsmethode"],
  ["contains a link", "enthält einen Link"],
  ["threats", "Drohungen"],
  ["prize or windfall", "Gewinn oder unerwarteter Geldsegen"],
] as const;

/** Only the combinations emitted by scam.ts; arbitrary lists are not translated. */
const scamSummaries = (): ServerCatalog["exact"] => {
  const combinations: (typeof SCAM_SIGNS)[number][][] = [[]];

  for (const sign of SCAM_SIGNS) {
    const previousCombinations = [...combinations];

    for (const previous of previousCombinations) {
      combinations.push([...previous, sign]);
    }
  }

  const translations: Record<string, string> = {};

  for (const signs of combinations) {
    if (signs.length === 0) {
      continue;
    }

    const english = signs.map(([label]) => label).join(", ");
    const german = signs.map(([, label]) => label).join(", ");
    translations[
      `This message shows ${signs.length} common warning ${signs.length === 1 ? "sign" : "signs"}: ${english}.`
    ] =
      `Diese Nachricht zeigt ${signs.length} ${signs.length === 1 ? "häufiges Warnzeichen" : "häufige Warnzeichen"}: ${german}.`;
  }

  return translations;
};

const SPEECH_ERRORS: ServerCatalog["exact"] = {
  "Audio playback stopped responding. Please try again.":
    "Die Audiowiedergabe reagiert nicht mehr. Bitte versuchen Sie es erneut.",
  "Choose between 1 and 600 characters to read.":
    "Wählen Sie einen Text mit 1 bis 600 Zeichen zum Vorlesen.",
  "Please choose a shorter section to read aloud.":
    "Bitte wählen Sie einen kürzeren Abschnitt zum Vorlesen.",
  "Please read a shorter passage at a time.":
    "Bitte lassen Sie jeweils einen kürzeren Abschnitt vorlesen.",
  "Please sign in again to use read-aloud.":
    "Bitte melden Sie sich erneut an, um die Vorlesefunktion zu nutzen.",
  "Read-aloud is not set up yet.":
    "Die Vorlesefunktion ist noch nicht eingerichtet.",
  "Read-aloud is not set up yet. An OpenRouter key is needed.":
    "Die Vorlesefunktion ist noch nicht eingerichtet. Ein OpenRouter-Schlüssel wird benötigt.",
  "Read-aloud is unavailable. Please try again.":
    "Vorlesen ist nicht verfügbar. Bitte versuchen Sie es erneut.",
  "Read-aloud needs a short pause. Please try again in a minute.":
    "Die Vorlesefunktion braucht eine kurze Pause. Bitte versuchen Sie es in einer Minute erneut.",
  "Read-aloud returned an unexpected audio format. Please try again later.":
    "Die Vorlesefunktion hat ein unerwartetes Audioformat geliefert. Bitte versuchen Sie es später erneut.",
  "Read-aloud returned no audio. Please try again.":
    "Die Vorlesefunktion hat kein Audio geliefert. Bitte versuchen Sie es erneut.",
  "Read-aloud took too long. Please try again.":
    "Die Vorlesefunktion hat zu lange gebraucht. Bitte versuchen Sie es erneut.",
  "That audio was too large. Please read a shorter section.":
    "Diese Audiodatei war zu groß. Bitte lassen Sie einen kürzeren Abschnitt vorlesen.",
  "That passage is too long to read at once. Please choose a shorter section.":
    "Dieser Text ist zu lang, um ihn auf einmal vorzulesen. Bitte wählen Sie einen kürzeren Abschnitt.",
  "The audio could not be loaded. Please try again.":
    "Das Audio konnte nicht geladen werden. Bitte versuchen Sie es erneut.",
  "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.":
    "Das eingestellte Vorlesemodell ist kein auf OpenRouter bestätigtes ElevenLabs-Modell.",
  "The configured read-aloud voice is not supported. Please check the speech settings.":
    "Die eingestellte Vorlesestimme wird nicht unterstützt. Bitte prüfen Sie die Spracheinstellungen.",
  "This audio could not be played. Please try again.":
    "Dieses Audio konnte nicht abgespielt werden. Bitte versuchen Sie es erneut.",
  "This browser cannot play audio. You can still read the text here.":
    "Dieser Browser kann kein Audio abspielen. Sie können den Text weiterhin hier lesen.",
  "Today’s read-aloud limit has been reached. Please try again tomorrow.":
    "Die heutige Grenze für das Vorlesen ist erreicht. Bitte versuchen Sie es morgen erneut.",
};

/** German for the backend's fixed English messages, matched exactly. */
const de: ServerCatalog = {
  exact: {
    ...scamSummaries(),
    ...SPEECH_ERRORS,
    "Action not found.": "Aktion nicht gefunden.",
    "Add the appointment": "Termin hinzufügen",
    "Added to your calendar.": "Zu Ihrem Kalender hinzugefügt.",
    "An action cannot change into a different kind of action.":
      "Eine Aktion kann nicht in eine andere Art von Aktion umgewandelt werden.",
    "An earlier try is still unresolved.":
      "Das Ergebnis eines früheren Versuchs ist noch ungeklärt.",
    "Ask for a ride": "Um eine Fahrt bitten",
    "Ask someone in your trusted circle to take a look.":
      "Bitten Sie jemanden aus Ihrem Vertrauenskreis, es sich anzusehen.",
    "Attempt not found.": "Versuch nicht gefunden.",
    "Check up to 15 emails at a time.":
      "Prüfen Sie bis zu 15 E-Mails auf einmal.",
    "Choose someone from your trusted circle who can be messaged.":
      "Wählen Sie jemanden aus Ihrem Vertrauenskreis, dem Sie eine Nachricht senden können.",
    "Cloud AI is not set up. Your local overview is still available.":
      "Cloud-KI ist nicht eingerichtet. Ihr lokaler Überblick ist weiterhin verfügbar.",
    "Cloud AI suggestions, with supporting quotes checked against each email. Verify details in the original message.":
      "Vorschläge von Cloud-KI mit stützenden Zitaten, die mit jeder E-Mail abgeglichen wurden. Prüfen Sie die Angaben in der ursprünglichen Nachricht.",
    "Confirm the ride": "Fahrt bestätigen",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "Verbinden Sie Gmail oder Outlook unter „Verbindungen“, um E-Mails zu senden.",
    "Contains a link": "Enthält einen Link",
    "Discord is not set up for this app yet.":
      "Discord ist für diese App noch nicht eingerichtet.",
    "Discord is not set up for this app.":
      "Discord ist für diese App nicht eingerichtet.",
    "Don't click links or call numbers in the message.":
      "Öffnen Sie keine Links und rufen Sie keine Nummern aus der Nachricht an.",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "E-Mail-, Kalender- und Drive-Verbindungen sind für diese App noch nicht eingerichtet.",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "Geben Sie einen Betrag von null oder mehr in ganzen Cent ein oder lassen Sie die Schätzung frei.",
    "Enter a quantity greater than 0.":
      "Geben Sie eine Menge größer als 0 ein.",
    "Found it in your mailbox.": "In Ihrem Postfach gefunden.",
    "Found the event on your calendar.":
      "Der Termin wurde in Ihrem Kalender gefunden.",
    "Found the message in the Discord conversation.":
      "Die Nachricht wurde in der Discord-Unterhaltung gefunden.",
    "Found the notes in your Google Drive.":
      "Die Notizen wurden in Ihrem Google Drive gefunden.",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "Wenn die Nachricht angeblich von einem Unternehmen stammt, rufen Sie die Nummer auf Ihrer Karte, Ihrer Rechnung oder der offiziellen Website an.",
    "It is not in your mailbox, so it did not go through.":
      "Die Nachricht ist nicht in Ihrem Postfach. Sie wurde daher nicht gesendet.",
    "Let family know": "Familie informieren",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "Links in unerwarteten Nachrichten können zu gefälschten Anmeldeseiten führen. Rufen Sie die Website stattdessen selbst auf.",
    "Mentions a payment method": "Erwähnt eine Zahlungsmethode",
    "Mentions private details": "Erwähnt private Daten",
    "New conversation": "Neue Unterhaltung",
    "No connected mailbox to send from.":
      "Es ist kein Postfach zum Senden verbunden.",
    "No recent emails to summarize yet.":
      "Noch keine aktuellen E-Mails zum Zusammenfassen.",
    "No subject or readable message text, and no action request found. Any images or attachments have not been assessed.":
      "Es wurden weder ein Betreff noch lesbarer Nachrichtentext oder eine Aufforderung zum Handeln gefunden. Bilder und Anhänge wurden nicht bewertet.",
    "Nobody in your trusted circle can see ride plans, so no update was shared.":
      "Niemand in Ihrem Vertrauenskreis darf Fahrtpläne sehen. Deshalb wurde keine Mitteilung geteilt.",
    "Not needed because the ride was declined.":
      "Nicht nötig, weil die Fahrt abgelehnt wurde.",
    "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found.":
      "Es wurde nur eine kurze beiläufige Notiz oder ein Hinweis auf eine geteilte Datei gefunden, ohne bedeutsamen Betreff, Bitte um Antwort oder zeitkritische Angabe.",
    "Only something that failed can be tried again.":
      "Nur ein fehlgeschlagener Vorgang kann erneut versucht werden.",
    "Only the account owner can do this.":
      "Nur die Person, der das Konto gehört, kann dies tun.",
    "Open emails in pages of 15.": "Öffnen Sie E-Mails in Gruppen von 15.",
    "Paste the message you would like checked.":
      "Fügen Sie die Nachricht ein, die Sie prüfen lassen möchten.",
    "Photon accepted the iMessage for delivery under the same approval.":
      "Photon hat die iMessage unter derselben Zustimmung zur Zustellung angenommen.",
    "Photon confirmed it accepted the earlier iMessage for delivery.":
      "Photon hat bestätigt, die frühere iMessage zur Zustellung angenommen zu haben.",
    "Please answer the open question first.":
      "Bitte beantworten Sie zuerst die offene Frage.",
    "Please check up to 8,000 characters at a time.":
      "Bitte prüfen Sie höchstens 8.000 Zeichen auf einmal.",
    "Please choose a JPG, PNG, or WebP photo under 6 MB.":
      "Bitte wählen Sie ein Foto im Format JPG, PNG oder WebP mit weniger als 6 MB.",
    "Please choose a photo under 6 MB.":
      "Bitte wählen Sie ein Foto mit weniger als 6 MB.",
    "Please choose a time that has not passed yet.":
      "Bitte wählen Sie einen Zeitpunkt, der noch nicht vergangen ist.",
    "Please choose one of the options shown.":
      "Bitte wählen Sie eine der angezeigten Optionen.",
    "Please sign in again to continue.":
      "Bitte melden Sie sich erneut an, um fortzufahren.",
    "Please sign in again.": "Bitte melden Sie sich erneut an.",
    "Please write your reply first.":
      "Bitte schreiben Sie zuerst Ihre Antwort.",
    "Practice emails are reviewed in LifeLink and are never sent to cloud AI.":
      "Übungs-E-Mails werden in LifeLink geprüft und niemals an Cloud-KI gesendet.",
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "Der Übungsmodus ist eingeschaltet. Schalten Sie ihn aus und prüfen Sie dies erneut, um es wirklich auszuführen.",
    "Practice: done.": "Übung: erledigt.",
    "Practice: no draft was saved in your real mailbox.":
      "Übung: In Ihrem echten Postfach wurde kein Entwurf gespeichert.",
    "Practice: nothing was added to your real calendar.":
      "Übung: Zu Ihrem echten Kalender wurde nichts hinzugefügt.",
    "Practice: nothing was saved in your real Google Drive.":
      "Übung: In Ihrem echten Google Drive wurde nichts gespeichert.",
    "Practice: the reply was not really sent.":
      "Übung: Die Antwort wurde nicht wirklich gesendet.",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "Unter Druck kann es schwerer fallen, innezuhalten und zu prüfen. Überprüfen Sie dringende Bitten über einen Kontakt, den Sie bereits kennen.",
    "Pressure to act fast": "Druck, schnell zu handeln",
    "Prize or windfall": "Gewinn oder unerwarteter Geldsegen",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "Bitten um Geschenkkarten, Überweisungen oder Kryptowährungen sollten gesondert geprüft werden. Solche Zahlungen lassen sich oft nur schwer zurückholen.",
    "Save a reminder": "Eine Erinnerung speichern",
    "Save the reminder": "Erinnerung speichern",
    "Saved the notes in your Google Drive.":
      "Die Notizen wurden in Ihrem Google Drive gespeichert.",
    "Sharing changed for someone on this update. Please review who will see it.":
      "Die Freigabe für jemanden, der diese Mitteilung erhalten soll, hat sich geändert. Bitte prüfen Sie, wer sie sehen darf.",
    "Showing the overview made in LifeLink. Nothing was sent to cloud AI.":
      "Der in LifeLink erstellte Überblick wird angezeigt. Es wurde nichts an Cloud-KI gesendet.",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "Spectrum hat nicht bestätigt, ob diese Nachricht gesendet wurde. Prüfen Sie erneut oder bestätigen Sie, wenn sie ankommt. Sie kann nicht mit Sicherheit als nicht gesendet markiert werden.",
    "Surprise winnings that need a fee first are almost always scams.":
      "Unerwartete Gewinne, für die zuerst eine Gebühr verlangt wird, sind fast immer Betrug.",
    "Telegram allows 1024 characters with photos. Shorten the message or send the photos separately.":
      "Telegram erlaubt 1024 Zeichen zusammen mit Fotos. Kürzen Sie die Nachricht oder senden Sie die Fotos getrennt.",
    "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.":
      "Telegram hat LifeLink um eine Pause gebeten. Es wurde nichts gesendet. Versuchen Sie es in einer Minute erneut.",
    "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.":
      "Telegram ist für diese App noch nicht eingerichtet. Bitten Sie die Person, die sie eingerichtet hat, bun run dev:setup --only=telegram auszuführen.",
    "Telegram is not set up for this app.":
      "Telegram ist für diese App nicht eingerichtet.",
    "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.":
      "Telegram hat das Senden abgelehnt: Diese Person hat den Bot blockiert oder noch nie auf Start getippt. Bitten Sie sie, den Link erneut zu öffnen.",
    "That Google Drive is no longer connected.":
      "Dieses Google Drive ist nicht mehr verbunden.",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "Dieses Konto ist nicht mehr verbunden. Verbinden Sie es unter „Verbindungen“ erneut.",
    "That calendar is no longer connected.":
      "Dieser Kalender ist nicht mehr verbunden.",
    "That could not be found.": "Dies konnte nicht gefunden werden.",
    "That email could not be found.":
      "Diese E-Mail konnte nicht gefunden werden.",
    "That mailbox is no longer connected.":
      "Dieses Postfach ist nicht mehr verbunden.",
    "That person has no way to be reached yet.":
      "Für diese Person gibt es noch keine Kontaktmöglichkeit.",
    "That step could not be found.":
      "Dieser Schritt konnte nicht gefunden werden.",
    "That task could not be found.":
      "Diese Aufgabe konnte nicht gefunden werden.",
    "The automatic check has not finished. Review this message before deciding.":
      "Die automatische Prüfung ist noch nicht abgeschlossen. Lesen Sie diese Nachricht, bevor Sie entscheiden.",
    "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.":
      "Der Cloud-Überblick wurde nicht fertiggestellt. Der lokale Überblick wird angezeigt. Der Anbieter hat diese E-Mails möglicherweise erhalten.",
    "The cloud-reading limit has been reached. Your local overview is still available.":
      "Die Grenze für Cloud-Auswertungen ist erreicht. Ihr lokaler Überblick ist weiterhin verfügbar.",
    "The current subject or message asks for a reply or confirmation. Check the details before responding.":
      "Der aktuelle Betreff oder Nachrichtentext bittet um eine Antwort oder Bestätigung. Prüfen Sie die Angaben, bevor Sie antworten.",
    "The details changed since you looked. Please review them again.":
      "Die Angaben haben sich seit Ihrer Prüfung geändert. Bitte prüfen Sie sie erneut.",
    "The event is not on your calendar.":
      "Der Termin steht nicht in Ihrem Kalender.",
    "The message cannot be empty.": "Die Nachricht darf nicht leer sein.",
    "The message contains a concrete event, account action, or timing detail worth reviewing.":
      "Die Nachricht enthält einen konkreten Termin, einen Vorgang zu einem Konto oder eine Zeitangabe, die Sie prüfen sollten.",
    "The message is not in the Discord conversation, so it did not go through.":
      "Die Nachricht ist nicht in der Discord-Unterhaltung. Sie wurde daher nicht gesendet.",
    "The notes are not in your Google Drive.":
      "Die Notizen sind nicht in Ihrem Google Drive.",
    "The person you are writing to is no longer in your contacts.":
      "Die Person, der Sie schreiben, ist nicht mehr in Ihren Kontakten.",
    "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it.":
      "Die Absenderadresse stimmt mit einer Person in Ihrem Vertrauenskreis überein, und die Nachricht enthält Informationen, die Sie prüfen sollten. Eine übereinstimmende Adresse bestätigt nicht, wer die Nachricht gesendet hat.",
    "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified.":
      "Absendername oder -adresse deuten auf eine Nachricht zu Gesundheit, Rechnungen oder einem Kontodienst hin. Prüfen Sie sie. Die Identität des Absenders wurde nicht bestätigt.",
    "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested.":
      "Absender oder Nachricht wirken wie Werbung oder ein Newsletter, ohne konkrete Handlung oder wichtigen Betreff. Wenn Sie kein Interesse haben, kann dies meist warten.",
    "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.":
      "Der Betreff nennt einen Termin, eine Transaktion, einen Kontohinweis oder ein anderes Thema, das Sie prüfen sollten.",
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you.":
      "Es gibt einen Betreff oder eine inhaltliche Nachricht, aber keine eindeutige Bitte um Antwort. Lesen Sie sie, um zu entscheiden, ob sie für Sie wichtig ist.",
    "There is nothing to check for this one.":
      "Hier gibt es nichts zu überprüfen.",
    "These details could not be verified. Please prepare them again.":
      "Diese Angaben konnten nicht überprüft werden. Bitte bereiten Sie sie erneut vor.",
    "This action is missing its details.":
      "Zu dieser Aktion fehlen die Angaben.",
    "This can no longer be changed because it has already started.":
      "Dies wurde bereits gestartet und kann nicht mehr geändert werden.",
    "This changed while you were offline. Please look it over again before approving.":
      "Dies hat sich geändert, während Sie offline waren. Bitte prüfen Sie es erneut, bevor Sie zustimmen.",
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.":
      "Diese Prüfung hat im verfügbaren Text keine häufigen Warnzeichen gefunden. Sie kann den Absender nicht überprüfen oder beweisen, dass eine Nachricht echt ist. Prüfen Sie unerwartete Bitten gemeinsam mit einer vertrauten Person.",
    "This check for common warning signs found only advice not to share details or pay in unusual ways. That advice does not prove the message is genuine. Check unexpected requests with someone you trust.":
      "Diese Prüfung hat nur Ratschläge gefunden, keine Daten weiterzugeben oder auf ungewöhnliche Weise zu bezahlen. Solche Ratschläge beweisen nicht, dass die Nachricht echt ist. Prüfen Sie unerwartete Bitten gemeinsam mit einer vertrauten Person.",
    "This check has expired.": "Diese Prüfung ist abgelaufen.",
    "This email is not from a connected mailbox.":
      "Diese E-Mail stammt nicht aus einem verbundenen Postfach.",
    "This has already started, so it can no longer be cancelled.":
      "Dies wurde bereits gestartet und kann nicht mehr abgebrochen werden.",
    "This is already approved.": "Dies ist bereits genehmigt.",
    "This is not waiting for approval.":
      "Dies wartet nicht auf eine Zustimmung.",
    "This mentions sensitive details. Do not share passwords, codes, or account details in response to an unexpected message.":
      "Hier werden vertrauliche Daten erwähnt. Geben Sie als Antwort auf eine unerwartete Nachricht keine Passwörter, Codes oder Kontodaten weiter.",
    "This message tells you not to do this. Real companies say this, and scammers copy it too, so check any other requests in it.":
      "Diese Nachricht rät Ihnen davon ab, dies zu tun. Echte Unternehmen sagen das, aber Betrüger kopieren es ebenfalls. Prüfen Sie daher auch alle anderen Bitten in der Nachricht.",
    "This was prepared in practice mode. Please prepare it again now that practice mode is off.":
      "Dies wurde im Übungsmodus vorbereitet. Bitte bereiten Sie es erneut vor, da der Übungsmodus jetzt ausgeschaltet ist.",
    Threats: "Drohungen",
    "Threats of arrest or legal trouble are a common scare tactic.":
      "Drohungen mit Verhaftung oder rechtlichen Schwierigkeiten sind eine häufige Einschüchterungstaktik.",
    "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.":
      "Verwenden Sie für einzelne Artikel oder Packungen eine ganze Zahl. Wählen Sie für eine abgemessene Menge ein Gewicht oder Volumen.",
    "Wait for an answer": "Auf eine Antwort warten",
    "Warning signs were found. Check the message before replying, paying, or sharing details.":
      "Warnzeichen wurden gefunden. Prüfen Sie die Nachricht, bevor Sie antworten, zahlen oder Daten weitergeben.",
    "Warns against sharing private details":
      "Warnt davor, private Daten weiterzugeben",
    "Warns against threats": "Warnt vor Drohungen",
    "Warns against unusual payments": "Warnt vor ungewöhnlichen Zahlungen",
    "We are not sure the last try failed. Check whether it went through before trying again.":
      "Wir sind nicht sicher, ob der letzte Versuch fehlgeschlagen ist. Prüfen Sie, ob er ausgeführt wurde, bevor Sie es erneut versuchen.",
    "We are still checking this action. Wait for that check to finish.":
      "Diese Aktion wird noch geprüft. Warten Sie, bis die Prüfung abgeschlossen ist.",
    "What is the appointment for?": "Wofür ist der Termin?",
    "Which appointment is the ride for?": "Für welchen Termin ist die Fahrt?",
    "Who would you like to ask?": "Wen möchten Sie fragen?",
    "Write a few words or add a photo first.":
      "Schreiben Sie zuerst ein paar Worte oder fügen Sie ein Foto hinzu.",
    "Write your reply first.": "Schreiben Sie zuerst Ihre Antwort.",
    "You are not connected with this person.":
      "Sie sind nicht mit dieser Person verbunden.",
    "You cancelled this.": "Sie haben dies abgebrochen.",
    "You offered or asked, and the answer was yes.":
      "Sie haben etwas angeboten oder erbeten, und die Antwort war ja.",
    "You offered or asked. The answer is not clear yet.":
      "Sie haben etwas angeboten oder erbeten. Die Antwort ist noch nicht eindeutig.",
    "You offered or asked. There is no answer yet.":
      "Sie haben etwas angeboten oder erbeten. Es gibt noch keine Antwort.",
    "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.":
      "iMessage ist für diese App noch nicht eingerichtet. Bitten Sie die Person, die sie eingerichtet hat, bun run dev:setup auszuführen.",
    "iMessage is not set up for this app.":
      "iMessage ist für diese App nicht eingerichtet.",
  },
  // Match complete templates only; captured names, titles and quotes stay verbatim.
  patterns: [
    [
      /^Read-aloud is unavailable \((?<status>[1-5]\d{2})\)\. Please try again later\.$/u,
      (status) =>
        `Vorlesen ist nicht verfügbar (${status}). Bitte versuchen Sie es später erneut.`,
    ],
    [/^Appointment: (?<title>.+)$/u, (title) => `Termin: ${title}`],
    [/^Ride to (?<title>.+)$/u, (title) => `Fahrt zu ${title}`],
    [
      /^Waiting for (?<name>[^“”"\r\n]+) to answer\.$/u,
      (name) => `Warten auf die Antwort von ${name}.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) said: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name} sagte: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) can't drive this time\. You could ask someone else\.$/u,
      (name) =>
        `${name} kann Sie diesmal nicht fahren. Sie könnten jemand anderen fragen.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\.$/u,
      (name) => `Für ${name} gibt es noch keine Kontaktmöglichkeit.`,
    ],
    [
      /^Set up iMessage for (?<name>[^“”"\r\n]+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `Richten Sie iMessage für ${name} im Vertrauenskreis ein. Bitten Sie die Person dann, zuerst an ihre zugewiesene Nummer zu schreiben.`,
    ],
    [
      /^Link (?<name>[^“”"\r\n]+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `Verknüpfen Sie zuerst Telegram für ${name} im Vertrauenskreis: Senden Sie der Person ihren Link und bitten Sie sie, auf Start zu tippen.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) replied, but it is not clear yet: “(?<body>[\s\S]*)”$/u,
      (name, body) =>
        `${name} hat geantwortet, aber die Antwort ist noch nicht eindeutig: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\. Add one under Trusted circle\.$/u,
      (name) =>
        `Für ${name} gibt es noch keine Kontaktmöglichkeit. Fügen Sie eine unter „Vertrauenskreis“ hinzu.`,
    ],
    [
      /^Practice: the message to (?<name>[^“”"\r\n]+) was not really sent\. A practice reply will arrive shortly\.$/u,
      (name) =>
        `Übung: Die Nachricht an ${name} wurde nicht wirklich gesendet. Eine Übungsantwort trifft in Kürze ein.`,
    ],
    [
      /^Photon accepted the iMessage to (?<name>[^“”"\r\n]+) for delivery\.$/u,
      (name) => `Photon hat die iMessage an ${name} zur Zustellung angenommen.`,
    ],
    [
      /^Shared with (?<count>\d+) (?:person|people) in your trusted circle\.$/u,
      (count) =>
        `Mit ${count} ${count === "1" ? "Person" : "Personen"} in Ihrem Vertrauenskreis geteilt.`,
    ],
    [
      /^Reply sent to (?<to>[^“”"\r\n]+)\.$/u,
      (to) => `Die Antwort wurde an ${to} gesendet.`,
    ],
    [
      /^Draft saved in your (?<provider>Gmail|Outlook) Drafts folder\. It has not been sent\.$/u,
      (provider) =>
        `Der Entwurf wurde in Ihrem Entwurfsordner in ${provider} gespeichert. Er wurde nicht gesendet.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked, and the answer was yes\.$/u,
      (name) =>
        `${name} hat etwas angeboten oder erbeten, und die Antwort war ja.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. There is no answer yet\.$/u,
      (name) =>
        `${name} hat etwas angeboten oder erbeten. Es gibt noch keine Antwort.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. The answer is not clear yet\.$/u,
      (name) =>
        `${name} hat etwas angeboten oder erbeten. Die Antwort ist noch nicht eindeutig.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) asked a question you haven't answered yet\.$/u,
      (name) =>
        `${name} hat eine Frage gestellt, die Sie noch nicht beantwortet haben.`,
    ],
    [
      /^Answer (?<name>[^“”"\r\n]+)'s offer, if you'd like to accept it\.$/u,
      (name) =>
        `Antworten Sie auf das Angebot von ${name}, wenn Sie es annehmen möchten.`,
    ],
    [
      /^In your last (?<messages>\d+) messages? with (?<name>[^“”"\r\n]+), LifeLink found (?<agreements>\d+) agreements? and (?<offers>\d+) offers? or requests? without a clear answer\.$/u,
      (messages, name, agreements, offers) =>
        `In ${messages === "1" ? "Ihrer letzten Nachricht" : `Ihren letzten ${messages} Nachrichten`} mit ${name} hat LifeLink ${agreements} ${agreements === "1" ? "Vereinbarung" : "Vereinbarungen"} und ${offers} ${offers === "1" ? "Angebot oder Bitte" : "Angebote oder Bitten"} ohne eindeutige Antwort gefunden.`,
    ],
  ],
};

export { de };

export type { ServerCatalog };
