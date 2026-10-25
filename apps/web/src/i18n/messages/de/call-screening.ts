import type { Messages } from "../en";

const callScreening: Messages["callScreening"] = {
  alertOff: "Warnton ist ausgeschaltet",
  alertPlayed: "Warnung wurde vorgelesen",
  alertPlaying: "Warnung wird vorgelesen",
  alertReady: "Warnung ist bereit",
  alertUnavailable:
    "Der Ton konnte nicht abgespielt werden. Lesen Sie die Warnung auf dem Bildschirm.",
  askTrusted: "Eine vertraute Person fragen",
  bigger: "Größere Schrift",
  callCaptions: "Im Anruf gehört",
  callTime: "nach Beginn des Anrufs",
  callback:
    "Wenn Ihnen etwas seltsam vorkam, legen Sie auf und rufen Sie die Person oder das Unternehmen unter einer Ihnen vertrauten Nummer an.",
  callbackAdvice:
    "Wenn Ihnen etwas seltsam vorkam, legen Sie auf und rufen Sie unter einer Ihnen vertrauten Nummer zurück.",
  caller: "Anrufende Person",
  cannotConfirm: "Damit lässt sich nicht bestätigen, wer angerufen hat.",
  captionSize: "Größe der Untertitel",
  captionSource: "Aus Untertiteln erstellt, die Fehler enthalten können.",
  captions: "Untertitel",
  captionsEmpty: "Hier erscheinen die gesprochenen Worte des Anrufs.",
  captionsNotSaved:
    "Werden angezeigt, bis Sie diese Seite verlassen. Werden nicht gespeichert.",
  checkMessage: "Nachricht prüfen",
  checkingLastPart: "Der letzte Teil des Anrufs wird auf Warnzeichen geprüft…",
  checksUnavailable:
    "Die Prüfung auf Warnzeichen ist gerade nicht verfügbar. Die gesprochenen Worte erscheinen weiterhin unten.",
  clearTitle: "Keine Warnzeichen gehört",
  close: "Schließen",
  codes:
    "Aufforderungen, einen Code, ein Passwort oder persönliche Daten weiterzugeben",
  connectionError:
    "Die Verbindung zum Zuhören wurde unterbrochen. Ihre Untertitel sind noch hier. Wählen Sie erneut „Starten“, um weiter zuzuhören, oder „Beenden“, um eine Zusammenfassung zu speichern.",
  consent:
    "Ich verstehe, dass Ton und Worte des Anrufs an Cloud-KI-Dienste gesendet werden, solange diese Prüfung läuft.",
  credentialsReason:
    "Eine Aufforderung, einen Bestätigungscode oder ein Passwort weiterzugeben.",
  delete: "Zusammenfassung löschen",
  deleteError:
    "Die Zusammenfassung konnte nicht gelöscht werden. Versuchen Sie es erneut.",
  deleteNotice:
    "Wenn Sie diese Zusammenfassung löschen, bleiben vorbereitete oder gesendete Nachrichten erhalten.",
  deleting: "Wird gelöscht…",
  discard: "Zusammenfassung verwerfen",
  earlierAria: "Frühere Anrufprüfungen",
  finish: "Beenden",
  finishSave: "Beenden und Zusammenfassung speichern",
  flagged: "Was LifeLink als auffällig markiert hat",
  flaggedAdvice:
    "Geben Sie keine Codes weiter und senden Sie kein Geld. Legen Sie auf und rufen Sie unter einer Ihnen vertrauten Nummer zurück.",
  flaggedBody:
    "Die anrufende Person hat um Dinge gebeten, nach denen Betrüger häufig fragen.",
  flaggedTitle: (count) => `${count} Warnzeichen gehört`,
  gettingReady: "Wird vorbereitet…",
  guideCaution:
    "Warnzeichen können übersehen werden. Wenn Ihnen ein Anruf seltsam vorkommt, legen Sie auf und rufen Sie unter einer Ihnen vertrauten Nummer zurück.",
  guideTitle: "LifeLink kann Sie hörbar warnen vor:",
  hangUpFirst:
    "Sie dürfen jederzeit sagen „Ich rufe zurück“ und erst einmal auflegen.",
  heard: "Was LifeLink gehört hat",
  heardText: (heardWords) => {
    if (heardWords === undefined) {
      return "Nichts von dem, was LifeLink gehört hat, entsprach einer typischen betrügerischen Aufforderung.";
    }

    const words = heardWords === 1 ? "1 Wort" : `etwa ${heardWords} Wörter`;

    return `LifeLink hat ${words} gehört. Darunter war keine typische betrügerische Aufforderung.`;
  },
  help: "Ich hatte gerade einen Anruf, bei dem ich unsicher bin. Könnten Sie mir helfen zu prüfen, ob er echt war, bevor ich etwas weitergebe oder Geld sende?",
  interrupted:
    "Die Verbindung wurde während dieser Prüfung unterbrochen. Nur die Teile, die LifeLink gehört hat, wurden geprüft.",
  intro:
    "LifeLink zeigt die gesprochenen Worte auf dem Bildschirm, lässt sie von einer KI auf Betrugswarnzeichen prüfen und warnt Sie hörbar, wenn ein Warnzeichen gefunden wird.",
  languageLimit:
    "Live-Anrufe nutzen Cloud-KI. Lokale Textprüfungen beruhen weiterhin auf englischen Mustern; eine übersetzte Oberfläche erweitert nicht die Sprachen, in denen sie Warnzeichen erkennen. Der Übungstext und die gesprochene Warnung sind auf Englisch. Untertitel und zitierte Worte bleiben in ihrer ursprünglichen Sprache.",
  listenTitle: "Bei einem Anruf zuhören",
  listening: "LifeLink hört zu",
  liveCall: "Live-Anruf",
  messageReview: "Nachricht zur Prüfung",
  mixedVoices:
    "Diese Untertitel enthalten beide Stimmen ohne Zuordnung und können Fehler enthalten.",
  money: "Aufforderungen, Geld oder Geschenkkarten zu senden",
  moneyReason:
    "Eine Aufforderung, Geld zu senden oder mit Geschenkkarten zu bezahlen.",
  mute: "Warnton ausschalten",
  noWarnings: "Keine Warnzeichen erkannt",
  noWarningsYet: " · Bisher keine Warnzeichen erkannt",
  notConfigured:
    "Live-Anrufprüfungen sind noch nicht eingerichtet. Sie können einen Übungsanruf ausprobieren oder die Worte der anrufenden Person eingeben.",
  notSafe:
    "Das bedeutet nicht, dass der Anruf sicher war. LifeLink kann Warnzeichen übersehen und nicht überprüfen, wer angerufen hat.",
  openStep: "Lassen Sie diese Seite während des Gesprächs geöffnet.",
  otherDevice:
    "Wenn Ihr Telefon während eines Anrufs das Mikrofon nicht nutzen kann, öffnen Sie LifeLink auf einem anderen Gerät.",
  outcomeLabels: {
    clear: "Keine Warnzeichen erkannt",
    flagged: "Warnzeichen erkannt",
    silent: "Nichts gehört",
    unchecked: "Nicht vollständig geprüft",
  },
  partlyChecked:
    "Ein Teil dieses Anrufs konnte nicht geprüft werden. Daher kann es weitere Warnzeichen geben.",
  paused:
    "Während die Warnung abgespielt wird, pausiert das Zuhören, damit LifeLink nicht seine eigene Warnung hört.",
  permissionDenied:
    "Der Mikrofonzugriff wurde nicht erlaubt. Erlauben Sie das Mikrofon in den Website-Einstellungen Ihres Browsers und versuchen Sie es erneut. Sie können auch einen Übungsanruf ausprobieren.",
  phoneCall: "Telefonanruf",
  potentialScam: "Möglicher Betrug.",
  practice: "Übung",
  practiceCall: "Übungsanruf",
  practiceCaptionSource: "Dies sind die vorgegebenen Worte des Übungsanrufs.",
  practiceCaptions: "Was gerade gesagt wird",
  practiceExplanation:
    "Dies ist ein erfundener Anruf. Weder Mikrofon noch Cloud-KI werden verwendet.",
  practiceFlaggedBody:
    "Die Person im Übungsanruf hat um Dinge gebeten, nach denen Betrüger häufig fragen.",
  practiceHeard: "Im Übungsanruf gesagt",
  practiceHelp:
    "Ich habe LifeLinks Übungsanruf zur Betrugsprüfung ausprobiert. Könnten wir darüber sprechen, was bei so einem Anruf zu tun ist?",
  practiceMode:
    "Der Übungsmodus ist eingeschaltet. Probieren Sie unten den erfundenen Anruf ohne Mikrofon aus.",
  practicePlaying: "Übungsanruf wird abgespielt",
  practicePrivacy:
    "Weder Mikrofon noch Cloud-KI werden verwendet. Eine kurze Zusammenfassung wird unter „Frühere Prüfungen“ gespeichert.",
  practiceSaved:
    "Der Übungsanruf verwendet weder Mikrofon noch Cloud-KI. Seine kurze Zusammenfassung wird unter „Frühere Prüfungen“ gespeichert.",
  practiceSilentBody:
    "Der Übungsanruf endete, bevor Worte abgespielt wurden. Es gab daher nichts zu prüfen.",
  practiceSilentTitle: "Übung vorzeitig beendet",
  practiceSource: "Aus dem vorgegebenen Übungstext erstellt.",
  practiceSummary: "Zusammenfassung des Übungsanrufs",
  practiceTime: "nach",
  practiceVoices:
    "Die Stimmen in der Übung sind gekennzeichnet. Bei echten Anrufen enthalten die Untertitel beide Stimmen ohne Zuordnung.",
  privacy:
    "LifeLink zeichnet Anrufe nicht auf. Der Ton Ihres Mikrofons wird an Google Gemini gesendet, um Untertitel zu erstellen. Die Untertitel gehen an ein KI-Modell, das sie auf Warnzeichen prüft. Wenn Sie beenden, speichert LifeLink eine kurze Zusammenfassung der Warnzeichen, aber keine Untertitel.",
  protect:
    "Geben Sie keine Codes oder Passwörter weiter und senden Sie kein Geld. Fragen Sie eine vertraute Person.",
  quoteNotice:
    "Zitate können Fehler enthalten. Lange Zahlen werden ausgeblendet.",
  readResult: "Ergebnis vorlesen",
  remote:
    "Aufforderungen, die Steuerung Ihres Computers oder Telefons zu erlauben",
  remoteReason: "Eine Aufforderung, Fernzugriff auf ein Gerät zu erlauben.",
  retrySave: "Erneut speichern versuchen",
  retrySteps: [
    "Schalten Sie beim Telefonanruf den Lautsprecher ein.",
    "Halten Sie das Telefon nahe an dieses Gerät.",
    "Starten Sie die Anrufprüfung erneut, bevor Sie antworten.",
  ],
  retryTitle: "So versuchen Sie es erneut",
  review: "Prüfen",
  saveError:
    "Die Zusammenfassung konnte nicht gespeichert werden. Lassen Sie diese Seite geöffnet und versuchen Sie es erneut.",
  saving: "Ihre Zusammenfassung wird gespeichert…",
  scamWarning: "Das klingt nach Betrug.",
  screenAnotherCall: "Weiteren Anruf prüfen",
  secrecyReason:
    "Eine Aufforderung zur Geheimhaltung verbunden mit Druck, dringend zu handeln.",
  silentBody:
    "Bei LifeLink kam keine Sprache an. Deshalb konnte dieser Anruf nicht auf Warnzeichen geprüft werden.",
  silentTitle: "LifeLink hat den Anruf nicht gehört",
  smaller: "Kleinere Schrift",
  soundUnavailable:
    "Der Ton ist nicht verfügbar. Warnzeichen werden weiterhin auf dem Bildschirm angezeigt.",
  speakerStep:
    "Schalten Sie den Lautsprecher für den Anruf ein und halten Sie das Telefon nahe an dieses Gerät.",
  start: "Zuhören starten",
  startAgain: "Erneut starten",
  startError:
    "LifeLink konnte das Zuhören nicht starten. Versuchen Sie es erneut oder probieren Sie einen Übungsanruf aus.",
  startStep:
    "Wählen Sie „Zuhören starten“ und erlauben Sie den Mikrofonzugriff.",
  stop: "Stoppen",
  stopListening: "Zuhören beenden",
  stopPractice: "Übungsanruf stoppen",
  stopped: "Zuhören wurde beendet",
  summary: "Anrufzusammenfassung",
  summaryNoWarnings: "Es wurden keine Warnzeichen erkannt.",
  summarySaved:
    "Als kurze Zusammenfassung unter „Frühere Prüfungen“ gespeichert. Ton und Untertitel werden nicht aufbewahrt.",
  summaryStorage:
    "Nur eine kurze Zusammenfassung wird unter „Frühere Prüfungen“ gespeichert. Ton und Untertitel werden nicht aufbewahrt.",
  summaryWarnings: "Bei diesem Anruf gab es Warnzeichen.",
  tellTrusted: "Eine vertraute Person informieren",
  timeLimit:
    "Die Prüfung wurde nach 30 Minuten beendet. Hier ist die bisherige Zusammenfassung.",
  times:
    "Die Zeiten geben Minuten und Sekunden seit Beginn der Prüfung an. Lange Zahlen werden ausgeblendet.",
  tryPractice: "Übungsanruf ausprobieren",
  uncheckedBody:
    "Ein Teil des Gesagten konnte nicht auf Warnzeichen geprüft werden. Deshalb können sie in dieser Zusammenfassung fehlen.",
  uncheckedTitle: "LifeLink konnte diesen Anruf nicht vollständig prüfen",
  unmute: "Warnton einschalten",
  urgency:
    "Drohungen oder Druck, schnell zu handeln und etwas geheim zu halten",
  warningReasons: {
    codes_or_passwords:
      "Eine Aufforderung, einen Bestätigungscode oder ein Passwort weiterzugeben.",
    gift_cards:
      "Eine Aufforderung, mit Geschenkkarten zu bezahlen oder deren Codes weiterzugeben.",
    money:
      "Eine Aufforderung, Geld zu senden oder Ihre Ersparnisse zu verschieben.",
    personal_details:
      "Eine Aufforderung, persönliche Daten oder Bankdaten weiterzugeben.",
    remote_access: "Eine Aufforderung, Fernzugriff auf ein Gerät zu erlauben.",
    secrecy_or_pressure:
      "Eine Aufforderung zur Geheimhaltung oder Druck, sofort zu handeln.",
    threats: "Eine Drohung mit Verhaftung, Geldstrafen oder Kontoschließung.",
  },
  warningSign: "Warnzeichen",
  warnings: "Warnzeichen erkannt",
  you: "Sie",
};

export { callScreening };
