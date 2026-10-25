import type { Messages } from "../en";

const recap: Messages["recap"] = {
  agreed: "Concordato",
  agreedSpoken: (text) => `Concordato: ${text}`,
  changedNote:
    "Alcuni dettagli forniti dall’assistente non erano nei messaggi parola per parola, oppure erano offerte anziché accordi, quindi sono stati modificati o omessi.",
  close: "Chiudi riepilogo",
  cloud:
    "Riepilogo con IA nel cloud, richiesto con il Suo permesso. Ogni citazione è stata confrontata con i messaggi.",
  cloudConsent:
    "Usa l’assistente nel cloud per un riepilogo più completo. I messaggi recenti con questa persona vengono inviati al fornitore di IA. Lasci deselezionato per un breve riepilogo creato in LifeLink.",
  done: "Fatto",
  doneFromRecords:
    "Dai registri di LifeLink, non da ciò che dicono i messaggi.",
  inShort: "In breve",
  intro: (contactName) =>
    `LifeLink può riassumere cosa Lei e ${contactName} avete concordato, cosa è stato solo offerto e cosa è ancora in sospeso.`,
  loading: "Caricamento del riepilogo",
  local: {
    chosen:
      "Breve riepilogo creato in LifeLink: basato sul riconoscimento di schemi, non su una comprensione completa. Nulla è stato inviato a un fornitore di IA.",
    failed:
      "Breve riepilogo creato in LifeLink. Ha richiesto un riepilogo nel cloud, ma non è stato completato. Il fornitore potrebbe aver già ricevuto questi messaggi.",
    limit:
      "Breve riepilogo creato in LifeLink. È stato raggiunto il limite giornaliero dei riepiloghi nel cloud, quindi non è stato inviato altro.",
    practice:
      "Prova: breve riepilogo creato in LifeLink. I messaggi di prova non vengono mai inviati a un fornitore di IA.",
    unavailable:
      "Breve riepilogo creato in LifeLink. L’assistente nel cloud non è configurato, quindi nulla è stato inviato a un fornitore di IA.",
  },
  messageTo: (contactName) => `Messaggio per ${contactName}`,
  nextSteps: "Possibili passaggi successivi",
  nextStepsHint:
    "Non accade nulla finché non prepara un passaggio, lo verifica e lo approva.",
  noFinishedTasks: (contactName) =>
    `LifeLink non ha attività completate con ${contactName} in questo periodo. Ciò che dice un messaggio non viene considerato già fatto.`,
  offerNote:
    "Un’offerta non è un accordo finché l’altra persona non dice di sì.",
  offered: "Offerto, non ancora concordato",
  offeredSpoken: (text) => `Offerto, non ancora concordato: ${text}`,
  onlyYou:
    "Solo Lei può vedere questo contenuto. Non viene mai inviato né condiviso con la famiglia.",
  part: "Parte",
  practiceNote:
    "In modalità di prova, LifeLink crea direttamente il riepilogo. I messaggi di prova non vengono mai inviati a un fornitore di IA.",
  prepare: "Prepara per la verifica",
  prepared: "Pronto. Verifichi",
  readAloud: "Leggi il riepilogo ad alta voce",
  reading: "Lettura della conversazione…",
  recapAgain: "Ripeti riepilogo",
  recapThis: "Riassumi questa conversazione",
  recapWithCloud: "Riassumi con IA nel cloud",
  reminderForYou: "Un promemoria per Lei",
  stillUnclear: "Ancora da chiarire",
  title: (contactName) => `Riepilogo con ${contactName}`,
  unclearSpoken: (text) => `Ancora da chiarire: ${text}`,
  you: "Lei",
};

export { recap };
