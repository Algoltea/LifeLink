import type { Messages } from "../en";

const explanation: Messages["explanation"] = {
  close: "Chiudi spiegazione",
  cloud:
    "Spiegato dall’IA nel cloud. Ogni citazione è stata confrontata con il messaggio.",
  dateSpoken: (quote, date) =>
    `Data menzionata: ${quote}${date ? `, ${date}` : ""}.`,
  dates: "Date e orari menzionati",
  droppedNote:
    "Alcuni dettagli forniti dall’assistente non erano presenti parola per parola nel messaggio, quindi vengono mostrati come ipotesi o omessi.",
  facts: "Cosa dice il messaggio",
  guessNote: "Queste sono ipotesi, non affermazioni del messaggio.",
  guessSpoken: (text) => `Un’ipotesi: ${text}`,
  guesses: "Cosa potrebbe significare",
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
  moreDetail: "Più dettagli",
  onlyYou: "Solo Lei può vedere questo contenuto.",
  reading: "Lettura del messaggio…",
  replies: "Possibili risposte",
  repliesHint:
    "Nulla viene inviato. La risposta viene inserita nel riquadro del messaggio, dove può modificarla e verificarla prima che accada qualcosa.",
  replyLabelFor: (label) => `Usa questa risposta: ${label}`,
  requestSpoken: (text, quote) =>
    `La richiesta è: ${text} Le parole originali sono: ${quote}.`,
  requests: "Cosa viene chiesto",
  title: "Aiuto per capire questo messaggio",
};

export { explanation };
