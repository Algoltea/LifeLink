import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Chiudi spiegazione",
  cloud:
    "Lettura con IA nel cloud, richiesta con il Suo permesso. Ogni citazione è stata confrontata con il messaggio.",
  cloudConsent:
    "Usa l’assistente nel cloud per una spiegazione più completa. Il testo del messaggio viene inviato al fornitore di IA. Lasci deselezionato per una lettura locale.",
  cloudConsentWithNotes:
    "Usa l’assistente nel cloud per una spiegazione più completa. Il testo del messaggio e le Sue note su come preferisce ricevere aiuto vengono inviati al fornitore di IA. Lasci deselezionato per una lettura locale.",
  dateSpoken: (quote, date) =>
    `Data menzionata: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Date e orari menzionati",
  droppedNote:
    "Alcuni dettagli forniti dall’assistente non erano presenti parola per parola nel messaggio, quindi vengono mostrati come ipotesi o omessi.",
  explainAgainWithCloud: "Spiega di nuovo con IA nel cloud",
  explainThis: "Spiega questo messaggio",
  explainWithCloud: "Spiega con IA nel cloud",
  facts: "Cosa dice il messaggio",
  guessNote: "Queste sono ipotesi, non affermazioni del messaggio.",
  guessSpoken: (text) => `Un’ipotesi: ${text}`,
  guesses: "Cosa potrebbe significare",
  inPlainWords: "In parole semplici",
  intro:
    "LifeLink può spiegare cosa chiede questo messaggio, quali date menziona e cosa non dice.",
  loading: "Caricamento della spiegazione",
  local: {
    chosen:
      "Lettura locale: basata sul riconoscimento di schemi, non su una comprensione completa. Nulla è stato inviato a un fornitore di IA.",
    failed:
      "Lettura locale. Ha richiesto una lettura nel cloud, ma non è stata completata. Il fornitore potrebbe aver già ricevuto questo messaggio.",
    limit:
      "Lettura locale. È stato raggiunto il limite giornaliero delle letture nel cloud, quindi non è stato inviato altro.",
    practice:
      "Prova: spiegazione creata in LifeLink. I messaggi di prova non vengono mai inviati a un fornitore di IA.",
    unavailable:
      "Lettura locale. L’assistente nel cloud non è configurato, quindi nulla è stato inviato a un fornitore di IA.",
  },
  localLanguageNotice:
    "Le spiegazioni locali basate su regole sono in inglese e non sono ancora state tradotte. Una spiegazione nel cloud può essere scritta nella lingua scelta. Le citazioni del messaggio originale rimangono invariate.",
  missing: "Non ancora detto",
  missingSpoken: (detail) => `Non ancora detto: ${detail}`,
  onlyYou:
    "Solo Lei può vedere questo contenuto. Non viene mai inviato né condiviso con la famiglia.",
  part: "Parte",
  practiceNote:
    "In modalità di prova, LifeLink legge il messaggio localmente. I messaggi di prova non vengono mai inviati a un fornitore di IA.",
  readAloud: "Leggi la spiegazione ad alta voce",
  readReply: "Leggi questa risposta ad alta voce",
  reading: "Lettura del messaggio…",
  replies: "Possibili risposte",
  repliesHint:
    "Nulla viene inviato. La risposta viene inserita nel riquadro del messaggio, dove può modificarla e verificarla prima che accada qualcosa.",
  requestSpoken: (text, quote) =>
    `La richiesta è: ${text} Le parole originali sono: ${quote}.`,
  requests: "Cosa viene chiesto",
  title: "Aiuto per capire questo messaggio",
  useReply: "Usa questa risposta",
  useReplyLabel: (label) => `Usa questa risposta: ${label}`,
};

export { explanation };
