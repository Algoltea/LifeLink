import type { Messages } from "../en";

const settings: Messages["settings"] = {
  accountsAndPermissions: "Account e permessi",
  accountsLink: "Account che LifeLink può usare",
  aiEmailChecks: "Controlla le nuove email con l’IA",
  aiEmailChecksDescription:
    "Quando arriva una nuova email, un servizio di IA nel cloud cerca segnali di truffa. Le email precedenti e quelle di prova non vengono mai inviate.",
  captions: "Sottotitoli durante la conversazione",
  captionsDescription: "Mostra le parole mentre parla con LifeLink.",
  characterCount: (count, maximum) => `${count} di ${maximum} caratteri`,
  choicesNotSaved: (error) =>
    `Le Sue scelte non sono state salvate nell’account. ${error} Riprovi qui sotto.`,
  contrast: "Contrasto",
  contrastDescription:
    "Un contrasto maggiore rende il testo più scuro e i bordi più evidenti.",
  contrastMore: "Contrasto maggiore",
  contrastStandard: "Standard",
  defaultVoice: "Voce predefinita di LifeLink",
  demoAllowedHint: "Questo interruttore salva automaticamente la scelta.",
  demoBetweenModes:
    "Qualsiasi attività preparata in una modalità deve essere verificata di nuovo prima di essere eseguita nell’altra.",
  demoDescription:
    "In modalità di prova nulla viene realmente inviato, salvato altrove o acquistato. Ogni risultato è simulato e indicato come “Prova”. Vengono aggiunti persone e messaggi di esempio per permetterLe di provare in sicurezza.",
  demoFailed: (error) =>
    `Non è stato possibile cambiare la modalità di prova. ${error} Riprovi con l’interruttore.`,
  demoOff:
    "La modalità di prova è disattivata. Ciò che approva adesso avviene realmente.",
  demoOn: "La modalità di prova è attiva.",
  demoTitle: "Modalità di prova",
  demoTurnedOff:
    "La modalità di prova è stata disattivata per questa applicazione.",
  demoUse: "Usa modalità di prova",
  detailDetailed: "Dettagliate",
  detailShort: "Brevi",
  explanations: "Spiegazioni",
  explanationsDescription:
    "Brevi mostra i punti principali. Dettagliate offre qualche spiegazione in più.",
  fullName: "Nome completo",
  groceriesLink: "Liste della spesa e limiti di spesa",
  hearSample: "Ascolta un esempio",
  helpDescription:
    "Queste preferenze vengono usate quando LifeLink spiega un messaggio, un controllo truffe, un riepilogo di conversazione o il riepilogo del mattino. Solo Lei vede queste spiegazioni. Le scelte qui sotto si salvano quando le modifica; per le note c’è il pulsante Salva note.",
  helpTitle: "Come preferisco ricevere aiuto",
  language: "Lingua",
  languageDescription:
    "Scelga la lingua delle schermate principali e dell’aiuto nel cloud di LifeLink. Le schermate principali sono tradotte in tutte e dieci le lingue disponibili; alcune pagine più recenti usano ancora l’inglese. I controlli di truffe ed email basati su regole locali coprono solo l’inglese e possono non riconoscere truffe in altre lingue. Citazioni e messaggi mantengono le parole originali.",
  lessMovement: "Meno movimento",
  lessMovementDescription:
    "Disattiva gli effetti di scorrimento e dissolvenza.",
  loading: "Caricamento delle impostazioni",
  newsOnToday: "Notizie su Oggi",
  newsOnTodayDescription:
    "Mostra tre titoli su Oggi. Lì può scegliere tra buone notizie e notizie principali.",
  notes: "Note su come preferisco ricevere aiuto",
  notesHint:
    "Per esempio, “Mi dia un passaggio alla volta”. Queste note vengono usate solo nelle spiegazioni di LifeLink rivolte a Lei. Non vengono mai mostrate ai familiari né inserite nei messaggi. Se autorizza una spiegazione nel cloud, le note vengono inviate al fornitore di IA insieme al messaggio.",
  notesNotSaved: (error) =>
    `Le note non sono state salvate. ${error} Il testo è ancora qui. Scelga Salva note per riprovare.`,
  notesSaveHint:
    "Scelga Salva note per conservare le modifiche a questo testo.",
  notesSaved: "Le note sono salvate.",
  oneStep: "Un passaggio alla volta",
  oneStepDescription:
    "Mostra spiegazioni e passaggi successivi uno alla volta, con un pulsante Avanti.",
  permissionsLink: "Chi può vedere cosa",
  postalCode: "Codice postale",
  preferredName: "Come La chiama LifeLink",
  profileNotSaved: (error) =>
    `Il profilo non è stato salvato. ${error} I dati inseriti sono ancora qui. Scelga Salva profilo per riprovare.`,
  profileSaveHint:
    "Scelga Salva profilo per conservare le modifiche in questa sezione.",
  profileTitle: "Informazioni su di Lei",
  readAloudAuto: "Leggi automaticamente ad alta voce",
  readAloudAutoDescription:
    "LifeLink legge ad alta voce i nuovi riepiloghi e le risposte.",
  readAloudVoice: "Voce per la lettura",
  readAloudVoiceDescription:
    "Scelga la voce che legge per Lei. La voce predefinita di LifeLink usa la voce standard.",
  saveNotes: "Salva note",
  saveProfile: "Salva profilo",
  saved: "Salvato.",
  savesAsYouChange: "Queste preferenze si salvano quando le modifica.",
  seeingAndHearing: "Vista e ascolto",
  signOff: "Come firma i messaggi",
  signOffPlaceholder: "Per esempio, Mamma",
  speakingSpeed: "Velocità della voce",
  speakingSpeedDescription: "La velocità con cui LifeLink legge ad alta voce.",
  speechQuicker: "Più veloce",
  speechSample: "Questa è la voce di LifeLink quando legge per Lei.",
  speechSlower: "Più lenta",
  speechUsual: "Normale",
  subline: "Renda LifeLink comodo da leggere e ascoltare.",
  textSize: "Dimensione del testo",
  textSizeDescription:
    "Si applica a tutte le pagine. La scelta viene ricordata su questo dispositivo.",
  textSizeLarge: "Grande",
  textSizeLarger: "Più grande",
  textSizeLargest: "Molto grande",
  textSizeStandard: "Standard",
  theme: "Chiaro o scuro",
  themeDark: "Scuro",
  themeLight: "Chiaro",
  themeSystem: "Come il dispositivo",
  timeZone: "Fuso orario",
  title: "Impostazioni",
  trySavingAgain: "Riprova a salvare",
};

export { settings };
