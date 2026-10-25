interface ServerCatalog {
  exact: Record<string, string>;
  patterns: [RegExp, (...parts: string[]) => string][];
}

const SCAM_SIGNS = [
  ["pressure to act fast", "pressione ad agire in fretta"],
  ["mentions private details", "menzione di dati privati"],
  ["mentions a payment method", "menzione di un metodo di pagamento"],
  ["contains a link", "presenza di un collegamento"],
  ["threats", "minacce"],
  ["prize or windfall", "premio o guadagno inatteso"],
] as const;

/** Only the combinations emitted by scam.ts; arbitrary lists are not translated. */
const scamSummaries = (): ServerCatalog["exact"] => {
  const combinations: (typeof SCAM_SIGNS)[number][][] = [[]];

  for (const sign of SCAM_SIGNS) {
    // Snapshot this round because the loop appends the new combinations.
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
    const localized = signs.map(([, label]) => label).join(", ");
    translations[
      `This message shows ${signs.length} common warning ${signs.length === 1 ? "sign" : "signs"}: ${english}.`
    ] =
      `Questo messaggio presenta ${signs.length} ${signs.length === 1 ? "segnale di allarme comune" : "segnali di allarme comuni"}: ${localized}.`;
  }

  return translations;
};

const SPEECH_ERRORS: ServerCatalog["exact"] = {
  "Audio playback stopped responding. Please try again.":
    "La riproduzione audio ha smesso di rispondere. Riprovi.",
  "Choose between 1 and 600 characters to read.":
    "Scelga un testo da 1 a 600 caratteri da leggere.",
  "Please choose a shorter section to read aloud.":
    "Scelga una parte più breve da leggere ad alta voce.",
  "Please read a shorter passage at a time.":
    "Legga un brano più breve alla volta.",
  "Please sign in again to use read-aloud.":
    "Acceda di nuovo per usare la lettura ad alta voce.",
  "Read-aloud is not set up yet.":
    "La lettura ad alta voce non è ancora configurata.",
  "Read-aloud is not set up yet. An OpenRouter key is needed.":
    "La lettura ad alta voce non è ancora configurata. Serve una chiave OpenRouter.",
  "Read-aloud is unavailable. Please try again.":
    "La lettura ad alta voce non è disponibile. Riprovi.",
  "Read-aloud needs a short pause. Please try again in a minute.":
    "La lettura ad alta voce richiede una breve pausa. Riprovi tra un minuto.",
  "Read-aloud returned an unexpected audio format. Please try again later.":
    "La lettura ad alta voce ha restituito un formato audio inatteso. Riprovi più tardi.",
  "Read-aloud returned no audio. Please try again.":
    "La lettura ad alta voce non ha restituito alcun audio. Riprovi.",
  "Read-aloud took too long. Please try again.":
    "La lettura ad alta voce ha impiegato troppo tempo. Riprovi.",
  "That audio was too large. Please read a shorter section.":
    "L’audio era troppo grande. Legga una parte più breve.",
  "That passage is too long to read at once. Please choose a shorter section.":
    "Il brano è troppo lungo da leggere tutto insieme. Scelga una parte più breve.",
  "The audio could not be loaded. Please try again.":
    "Non è stato possibile caricare l’audio. Riprovi.",
  "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.":
    "Il modello configurato per la lettura ad alta voce non è un modello ElevenLabs verificato su OpenRouter.",
  "The configured read-aloud voice is not supported. Please check the speech settings.":
    "La voce configurata per la lettura ad alta voce non è supportata. Controlli le impostazioni della voce.",
  "This audio could not be played. Please try again.":
    "Non è stato possibile riprodurre questo audio. Riprovi.",
  "This browser cannot play audio. You can still read the text here.":
    "Questo browser non può riprodurre audio. Può comunque leggere il testo qui.",
  "Today’s read-aloud limit has been reached. Please try again tomorrow.":
    "È stato raggiunto il limite di lettura ad alta voce di oggi. Riprovi domani.",
};

/** Italian for the backend's fixed English messages, matched exactly. */
const it: ServerCatalog = {
  exact: {
    ...scamSummaries(),
    ...SPEECH_ERRORS,
    "Action not found.": "Azione non trovata.",
    "Added to your calendar.": "Aggiunto al Suo calendario.",
    "An action cannot change into a different kind of action.":
      "Un’azione non può diventare un tipo di azione diverso.",
    "An earlier try is still unresolved.":
      "L’esito di un tentativo precedente è ancora incerto.",
    "Ask for a ride": "Chiedi un passaggio",
    "Ask someone in your trusted circle to take a look.":
      "Chieda a una persona della Sua cerchia di fiducia di dare un’occhiata.",
    "Attempt not found.": "Tentativo non trovato.",
    "Check up to 15 emails at a time.": "Controlli fino a 15 email alla volta.",
    "Choose someone from your trusted circle who can be messaged.":
      "Scelga una persona della Sua cerchia di fiducia a cui sia possibile inviare un messaggio.",
    "Cloud AI is not set up. Your local overview is still available.":
      "L’IA nel cloud non è configurata. Il riepilogo locale rimane disponibile.",
    "Cloud AI suggestions, with supporting quotes checked against each email. Verify details in the original message.":
      "Suggerimenti dell’IA nel cloud, con citazioni di supporto confrontate con ciascuna email. Verifichi i dettagli nel messaggio originale.",
    "Confirm the ride": "Conferma il passaggio",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "Colleghi Gmail o Outlook nella schermata Collegamenti per inviare email.",
    "Contains a link": "Contiene un collegamento",
    "Discord is not set up for this app yet.":
      "Discord non è ancora configurato per questa applicazione.",
    "Discord is not set up for this app.":
      "Discord non è configurato per questa applicazione.",
    "Don't click links or call numbers in the message.":
      "Non apra i collegamenti e non chiami i numeri presenti nel messaggio.",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "I collegamenti a email, calendario e Drive non sono ancora configurati per questa applicazione.",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "Inserisca un importo pari o superiore a zero, in centesimi interi, oppure lasci vuota la stima.",
    "Enter a quantity greater than 0.": "Inserisca una quantità maggiore di 0.",
    "Found it in your mailbox.": "Trovato nella Sua casella email.",
    "Found the event on your calendar.":
      "L’evento è stato trovato nel Suo calendario.",
    "Found the message in the Discord conversation.":
      "Il messaggio è stato trovato nella conversazione Discord.",
    "Found the notes in your Google Drive.":
      "Le note sono state trovate nel Suo Google Drive.",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "Se il messaggio dice di provenire da un’azienda, chiami il numero sulla Sua carta, sulla fattura o sul sito ufficiale dell’azienda.",
    "It is not in your mailbox, so it did not go through.":
      "Non si trova nella Sua casella email, quindi l’invio non è riuscito.",
    "Let family know": "Avvisa la famiglia",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "I collegamenti nei messaggi inattesi possono portare a pagine di accesso false. Apra il sito direttamente.",
    "Mentions a payment method": "Menziona un metodo di pagamento",
    "Mentions private details": "Menziona dati privati",
    "New conversation": "Nuova conversazione",
    "No connected mailbox to send from.":
      "Non c’è una casella email collegata da cui inviare.",
    "No recent emails to summarize yet.":
      "Non ci sono ancora email recenti da riassumere.",
    "No subject or readable message text, and no action request found. Any images or attachments have not been assessed.":
      "Non sono stati trovati un oggetto, un testo leggibile o una richiesta di azione. Le eventuali immagini e gli allegati non sono stati valutati.",
    "Nobody in your trusted circle can see ride plans, so no update was shared.":
      "Nessuno nella Sua cerchia di fiducia può vedere i piani dei passaggi, quindi non è stato condiviso alcun aggiornamento.",
    "Not needed because the ride was declined.":
      "Non serve perché il passaggio è stato rifiutato.",
    "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found.":
      "È stata trovata solo una breve nota informale o un riferimento a un file condiviso, senza un oggetto significativo, una richiesta di risposta o dettagli con scadenze da rispettare.",
    "Only something that failed can be tried again.":
      "Si può riprovare solo un’operazione non riuscita.",
    "Only the account owner can do this.":
      "Solo il titolare dell’account può farlo.",
    "Open emails in pages of 15.": "Apra le email in pagine da 15.",
    "Paste the message you would like checked.":
      "Incolli il messaggio che desidera controllare.",
    "Photon accepted the iMessage for delivery under the same approval.":
      "Photon ha accettato l’iMessage per la consegna con la stessa approvazione.",
    "Photon confirmed it accepted the earlier iMessage for delivery.":
      "Photon ha confermato di aver accettato l’iMessage precedente per la consegna.",
    "Please answer the open question first.":
      "Risponda prima alla domanda in sospeso.",
    "Please check up to 8,000 characters at a time.":
      "Controlli fino a 8.000 caratteri alla volta.",
    "Please choose a JPG, PNG, or WebP photo under 6 MB.":
      "Scelga una foto JPG, PNG o WebP di dimensioni inferiori a 6 MB.",
    "Please choose a photo under 6 MB.":
      "Scelga una foto di dimensioni inferiori a 6 MB.",
    "Please choose a time that has not passed yet.":
      "Scelga un orario che non sia già passato.",
    "Please choose one of the options shown.":
      "Scelga una delle opzioni mostrate.",
    "Please sign in again to continue.": "Acceda di nuovo per continuare.",
    "Please sign in again.": "Acceda di nuovo.",
    "Please write your reply first.": "Scriva prima la Sua risposta.",
    "Practice emails are reviewed in LifeLink and are never sent to cloud AI.":
      "Le email di prova vengono controllate in LifeLink e non vengono mai inviate all’IA nel cloud.",
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "La modalità di prova è attiva. La disattivi e verifichi di nuovo questa operazione per eseguirla realmente.",
    "Practice: done.": "Prova: completato.",
    "Practice: no draft was saved in your real mailbox.":
      "Prova: nessuna bozza è stata salvata nella Sua casella email reale.",
    "Practice: nothing was added to your real calendar.":
      "Prova: nulla è stato aggiunto al Suo calendario reale.",
    "Practice: nothing was saved in your real Google Drive.":
      "Prova: nulla è stato salvato nel Suo Google Drive reale.",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "La pressione può rendere più difficile fermarsi a controllare. Verifichi una richiesta urgente attraverso un contatto che conosce già.",
    "Pressure to act fast": "Pressione ad agire in fretta",
    "Prize or windfall": "Premio o guadagno inatteso",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "Le richieste di buoni regalo, trasferimenti di denaro o criptovalute meritano un controllo separato. Può essere difficile recuperare questi pagamenti.",
    "Save a reminder": "Salva un promemoria",
    "Save the reminder": "Salva il promemoria",
    "Saved the notes in your Google Drive.":
      "Le note sono state salvate nel Suo Google Drive.",
    "Sharing changed for someone on this update. Please review who will see it.":
      "I permessi di condivisione sono cambiati per una persona inclusa in questo aggiornamento. Verifichi chi potrà vederlo.",
    "Showing the overview made in LifeLink. Nothing was sent to cloud AI.":
      "È mostrato il riepilogo creato in LifeLink. Nulla è stato inviato all’IA nel cloud.",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "Spectrum non ha confermato se questo messaggio è stato inviato. Controlli di nuovo o confermi quando arriva; non è possibile indicarlo come non inviato in sicurezza.",
    "Surprise winnings that need a fee first are almost always scams.":
      "Le vincite inattese che richiedono prima un pagamento sono quasi sempre truffe.",
    "Telegram allows 1024 characters with photos. Shorten the message or send the photos separately.":
      "Telegram consente 1024 caratteri con le foto. Accorci il messaggio o invii le foto separatamente.",
    "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.":
      "Telegram ha chiesto a LifeLink di rallentare. Nulla è stato inviato; riprovi tra un minuto.",
    "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.":
      "Telegram non è ancora configurato per questa applicazione. Chieda a chi l’ha configurata di eseguire bun run dev:setup --only=telegram.",
    "Telegram is not set up for this app.":
      "Telegram non è configurato per questa applicazione.",
    "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.":
      "Telegram ha rifiutato: questa persona ha bloccato il bot o non ha mai premuto Avvia. Le chieda di aprire di nuovo il collegamento.",
    "That Google Drive is no longer connected.":
      "Quel Google Drive non è più collegato.",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "Quell’account non è più collegato. Lo ricolleghi nella schermata Collegamenti.",
    "That calendar is no longer connected.":
      "Quel calendario non è più collegato.",
    "That could not be found.": "Non è stato possibile trovarlo.",
    "That email could not be found.":
      "Non è stato possibile trovare quell’email.",
    "That mailbox is no longer connected.":
      "Quella casella email non è più collegata.",
    "That person has no way to be reached yet.":
      "Non c’è ancora un modo per contattare quella persona.",
    "That step could not be found.":
      "Non è stato possibile trovare quel passaggio.",
    "That task could not be found.":
      "Non è stato possibile trovare quell’attività.",
    "The automatic check has not finished. Review this message before deciding.":
      "Il controllo automatico non è terminato. Verifichi questo messaggio prima di decidere.",
    "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.":
      "Il riepilogo nel cloud non è stato completato. È mostrato il riepilogo locale; il fornitore potrebbe aver ricevuto queste email.",
    "The cloud-reading limit has been reached. Your local overview is still available.":
      "È stato raggiunto il limite delle letture nel cloud. Il riepilogo locale rimane disponibile.",
    "The current subject or message asks for a reply or confirmation. Check the details before responding.":
      "L’oggetto o il messaggio attuale chiede una risposta o una conferma. Controlli i dettagli prima di rispondere.",
    "The details changed since you looked. Please review them again.":
      "I dettagli sono cambiati da quando li ha letti. Li verifichi di nuovo.",
    "The event is not on your calendar.": "L’evento non è nel Suo calendario.",
    "The message cannot be empty.": "Il messaggio non può essere vuoto.",
    "The message contains a concrete event, account action, or timing detail worth reviewing.":
      "Il messaggio contiene un evento preciso, un’azione relativa a un account o un dettaglio di data o orario da verificare.",
    "The message is not in the Discord conversation, so it did not go through.":
      "Il messaggio non è nella conversazione Discord, quindi l’invio non è riuscito.",
    "The notes are not in your Google Drive.":
      "Le note non sono nel Suo Google Drive.",
    "The person you are writing to is no longer in your contacts.":
      "La persona a cui sta scrivendo non è più tra i Suoi contatti.",
    "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it.":
      "L’indirizzo del mittente corrisponde a una persona della Sua Cerchia di fiducia e il messaggio contiene informazioni da verificare. La corrispondenza dell’indirizzo non verifica chi lo ha inviato.",
    "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified.":
      "Il nome o l’indirizzo del mittente fa pensare a un messaggio sulla salute, sulla fatturazione o sui servizi di un account. Lo verifichi; l’identità del mittente non è stata verificata.",
    "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested.":
      "Il mittente o il messaggio sembra una promozione o una newsletter, senza un’azione precisa o un oggetto importante. Di solito può aspettare se non Le interessa.",
    "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.":
      "L’oggetto menziona un appuntamento, una transazione, un avviso relativo a un account o un altro argomento da verificare.",
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you.":
      "C’è un oggetto o un messaggio con contenuto significativo, ma nessuna richiesta chiara di risposta. Lo legga per decidere se è importante per Lei.",
    "There is nothing to check for this one.":
      "Non c’è nulla da controllare in questo caso.",
    "These details could not be verified. Please prepare them again.":
      "Non è stato possibile verificare questi dettagli. Li prepari di nuovo.",
    "This action is missing its details.":
      "Mancano i dettagli di questa azione.",
    "This can no longer be changed because it has already started.":
      "Questa operazione è già iniziata e non può più essere modificata.",
    "This changed while you were offline. Please look it over again before approving.":
      "Questo è cambiato mentre era senza connessione. Lo verifichi di nuovo prima di approvare.",
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.":
      "Questo controllo non ha trovato segnali di allarme comuni nel testo disponibile. Non può verificare il mittente né dimostrare che un messaggio sia autentico. Verifichi le richieste inattese con una persona di fiducia.",
    "This check for common warning signs found only advice not to share details or pay in unusual ways. That advice does not prove the message is genuine. Check unexpected requests with someone you trust.":
      "Questo controllo ha trovato solo consigli di non condividere dati o pagare in modi insoliti. Questi consigli non dimostrano che il messaggio sia autentico. Verifichi le richieste inattese con una persona di fiducia.",
    "This check has expired.": "Questo controllo è scaduto.",
    "This email is not from a connected mailbox.":
      "Questa email non proviene da una casella collegata.",
    "This has already started, so it can no longer be cancelled.":
      "Questa operazione è già iniziata e non può più essere annullata.",
    "This is already approved.": "È già approvato.",
    "This is not waiting for approval.": "Non è in attesa di approvazione.",
    "This mentions sensitive details. Do not share passwords, codes, or account details in response to an unexpected message.":
      "Qui vengono menzionati dati sensibili. Non condivida password, codici o dati dell’account in risposta a un messaggio inatteso.",
    "This message tells you not to do this. Real companies say this, and scammers copy it too, so check any other requests in it.":
      "Questo messaggio dice di non farlo. Le aziende vere lo dicono e anche i truffatori lo copiano, quindi verifichi le altre richieste presenti nel messaggio.",
    "This was prepared in practice mode. Please prepare it again now that practice mode is off.":
      "Questo è stato preparato in modalità di prova. Lo prepari di nuovo ora che la modalità di prova è disattivata.",
    Threats: "Minacce",
    "Threats of arrest or legal trouble are a common scare tactic.":
      "Le minacce di arresto o di problemi legali sono una tattica comune per spaventare.",
    "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.":
      "Usi un numero intero per gli articoli singoli o le confezioni. Scelga un peso o un volume per una quantità misurata.",
    "Wait for an answer": "Attendi una risposta",
    "Warning signs were found. Check the message before replying, paying, or sharing details.":
      "Sono stati trovati segnali di allarme. Controlli il messaggio prima di rispondere, pagare o condividere dati.",
    "Warns against sharing private details":
      "Avverte di non condividere dati privati",
    "Warns against threats": "Mette in guardia dalle minacce",
    "Warns against unusual payments": "Mette in guardia dai pagamenti insoliti",
    "We are not sure the last try failed. Check whether it went through before trying again.":
      "Non sappiamo con certezza se l’ultimo tentativo sia fallito. Verifichi se è andato a buon fine prima di riprovare.",
    "We are still checking this action. Wait for that check to finish.":
      "Stiamo ancora controllando questa azione. Attenda che il controllo finisca.",
    "Which appointment is the ride for?":
      "Per quale appuntamento serve il passaggio?",
    "Who would you like to ask?": "A chi vorrebbe chiedere?",
    "Write a few words or add a photo first.":
      "Scriva prima qualche parola o aggiunga una foto.",
    "Write your reply first.": "Scriva prima la Sua risposta.",
    "You are not connected with this person.":
      "Non c’è un collegamento tra Lei e questa persona.",
    "You cancelled this.": "Ha annullato questa operazione.",
    "You offered or asked, and the answer was yes.":
      "Ha fatto un’offerta o una richiesta e la risposta è stata sì.",
    "You offered or asked. The answer is not clear yet.":
      "Ha fatto un’offerta o una richiesta. La risposta non è ancora chiara.",
    "You offered or asked. There is no answer yet.":
      "Ha fatto un’offerta o una richiesta. Non c’è ancora una risposta.",
    "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.":
      "iMessage non è ancora configurato per questa applicazione. Chieda a chi l’ha configurata di eseguire bun run dev:setup.",
    "iMessage is not set up for this app.":
      "iMessage non è configurato per questa applicazione.",
  },
  // Match complete templates only; captured names, titles and quotes stay verbatim.
  patterns: [
    [
      /^Read-aloud is unavailable \((?<status>[1-5]\d{2})\)\. Please try again later\.$/u,
      (status) =>
        `La lettura ad alta voce non è disponibile (${status}). Riprovi più tardi.`,
    ],
    [/^Ride to (?<title>.+)$/u, (title) => `Passaggio per ${title}`],
    [
      /^Waiting for (?<name>[^“”"\r\n]+) to answer\.$/u,
      (name) => `In attesa della risposta di ${name}.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) said: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name} ha detto: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) can't drive this time\. You could ask someone else\.$/u,
      (name) =>
        `${name} non può accompagnarLa questa volta. Può chiedere a un’altra persona.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\.$/u,
      (name) => `Non c’è ancora un modo per contattare ${name}.`,
    ],
    [
      /^Set up iMessage for (?<name>[^“”"\r\n]+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `Configuri iMessage per ${name} nella Cerchia di fiducia, poi chieda a questa persona di inviare il primo messaggio al numero assegnato.`,
    ],
    [
      /^Link (?<name>[^“”"\r\n]+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `Colleghi prima il Telegram di ${name} nella Cerchia di fiducia: invii a questa persona il suo collegamento e le chieda di premere Avvia.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) replied, but it is not clear yet: “(?<body>[\s\S]*)”$/u,
      (name, body) =>
        `${name} ha risposto, ma il significato non è ancora chiaro: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\. Add one under Trusted circle\.$/u,
      (name) =>
        `Non c’è ancora un modo per contattare ${name}. Ne aggiunga uno nella Cerchia di fiducia.`,
    ],
    [
      /^Practice: the message to (?<name>[^“”"\r\n]+) was not really sent\. A practice reply will arrive shortly\.$/u,
      (name) =>
        `Prova: il messaggio per ${name} non è stato realmente inviato. Una risposta di prova arriverà a breve.`,
    ],
    [
      /^Photon accepted the iMessage to (?<name>[^“”"\r\n]+) for delivery\.$/u,
      (name) =>
        `Photon ha accettato per la consegna l’iMessage destinato a ${name}.`,
    ],
    [
      /^Shared with (?<count>\d+) (?:person|people) in your trusted circle\.$/u,
      (count) =>
        `Condiviso con ${count} ${count === "1" ? "persona" : "persone"} della Sua cerchia di fiducia.`,
    ],
    [
      /^Draft saved in your (?<provider>Gmail|Outlook) Drafts folder\. It has not been sent\.$/u,
      (provider) =>
        `Bozza salvata nella cartella Bozze del Suo account ${provider}. Non è stata inviata.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked, and the answer was yes\.$/u,
      (name) =>
        `${name} ha fatto un’offerta o una richiesta e la risposta è stata sì.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. There is no answer yet\.$/u,
      (name) =>
        `${name} ha fatto un’offerta o una richiesta. Non c’è ancora una risposta.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. The answer is not clear yet\.$/u,
      (name) =>
        `${name} ha fatto un’offerta o una richiesta. La risposta non è ancora chiara.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) asked a question you haven't answered yet\.$/u,
      (name) =>
        `${name} ha posto una domanda a cui Lei non ha ancora risposto.`,
    ],
    [
      /^Answer (?<name>[^“”"\r\n]+)'s offer, if you'd like to accept it\.$/u,
      (name) => `Risponda all’offerta di ${name}, se desidera accettarla.`,
    ],
    [
      /^In your last (?<messages>\d+) messages? with (?<name>[^“”"\r\n]+), LifeLink found (?<agreements>\d+) agreements? and (?<offers>\d+) offers? or requests? without a clear answer\.$/u,
      (messages, name, agreements, offers) =>
        `Nei Suoi scambi più recenti con ${name} (${messages} ${messages === "1" ? "messaggio" : "messaggi"}), LifeLink ha trovato ${agreements} ${agreements === "1" ? "accordo" : "accordi"} e ${offers} ${offers === "1" ? "offerta o richiesta" : "offerte o richieste"} senza una risposta chiara.`,
    ],
  ],
};

export { it };

export type { ServerCatalog };
