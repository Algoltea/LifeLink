import type { Messages } from "../en";

const voice: Messages["voice"] = {
  connecting: "Verbindung wird hergestellt…",
  connectionProblem: "Bei der Sprachverbindung gab es ein Problem.",
  dictationStopped:
    "Die Spracheingabe wurde beendet. Bitte versuchen Sie es erneut oder tippen Sie stattdessen.",
  emptyRequest: "Es wurde nichts vorbereitet, weil die Anfrage leer war.",
  inputLabel: "Wobei möchten Sie Hilfe?",
  listening: "Hört zu…",
  microphoneBusy:
    "Eine andere App verwendet das Mikrofon. Schließen Sie sie und versuchen Sie es erneut oder tippen Sie stattdessen.",
  microphoneDenied:
    "LifeLink darf das Mikrofon nicht verwenden. Erlauben Sie es in den Browser-Einstellungen für diese Website oder tippen Sie stattdessen.",
  microphoneFailed:
    "Das Mikrofon wurde nicht gestartet. Bitte versuchen Sie es erneut oder tippen Sie stattdessen.",
  microphoneMissing:
    "Es wurde kein Mikrofon gefunden. Prüfen Sie, ob eines angeschlossen ist, oder tippen Sie stattdessen.",
  offlineFailed:
    "Diese Anfrage konnte offline nicht gespeichert werden. Ihre Worte sind noch hier. Bitte versuchen Sie es erneut, wenn Sie verbunden sind.",
  opening: "Ein Platz für Ihre Nachricht wird geöffnet",
  placeholder: "LifeLink fragen…",
  prepareFailed:
    "Das konnte nicht vorbereitet werden. Bitten Sie die Person, es erneut zu versuchen oder einzugeben.",
  prepared:
    "Vorbereitet. Es steht jetzt auf dem Bildschirm. Es geschieht nichts, bevor es dort genehmigt wird.",
  preparing: "Ihre Anfrage wird vorbereitet…",
  readAloudUnavailable:
    "Vorlesen ist nicht verfügbar. Bitte versuchen Sie es erneut.",
  retry:
    "Ihre Worte stehen noch im Feld. Wählen Sie „Senden“, um es erneut zu versuchen.",
  savedOffline:
    "Gespeichert. LifeLink schaut sich dies an, wenn Sie wieder online sind.",
  screeningConnectionProblem:
    "Bei der Verbindung zur Anrufprüfung gab es ein Problem.",
  screeningDisconnected: "Verbindung zur Anrufprüfung getrennt.",
  screeningLost: "Die Anrufprüfung hat ihre Verbindung verloren.",
  screeningMicrophoneStopped:
    "Das Mikrofon wurde beendet. Starten Sie die Anrufprüfung erneut, um die Verbindung wiederherzustellen.",
  screeningResumeFailed:
    "Die Anrufprüfung konnte nach der Warnung nicht fortgesetzt werden. Starten Sie sie erneut.",
  screeningStopped: "Die Anrufprüfung wurde beendet.",
  send: "Senden",
  sending: "Wird gesendet",
  speak: "Sprechen",
  speakHint:
    "Wählen Sie „Sprechen“, um zu sprechen statt zu tippen. Nichts wird ohne Ihre Zustimmung gesendet.",
  speaking: "LifeLink spricht…",
  startFailed: (error) =>
    `Die Sprachfunktion wurde nicht gestartet: ${error} Sie können stattdessen tippen.`,
  stop: "Stoppen",
  unavailable:
    "Die Sprachfunktion ist gerade nicht verfügbar. Bitte tippen Sie. Nichts wird ohne Ihre Zustimmung gesendet.",
  voiceStopped: "Die Sprachfunktion wurde beendet.",
};

export { voice };
