interface ServerCatalog {
  exact: Record<string, string>;
  patterns: [RegExp, (...parts: string[]) => string][];
}

const SCAM_SIGNS = [
  ["pressure to act fast", "pression pour agir vite"],
  ["mentions private details", "mention de renseignements privés"],
  ["mentions a payment method", "mention d’un moyen de paiement"],
  ["contains a link", "présence d’un lien"],
  ["threats", "menaces"],
  ["prize or windfall", "prix ou gain inattendu"],
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
    const french = signs.map(([, label]) => label).join(", ");
    translations[
      `This message shows ${signs.length} common warning ${signs.length === 1 ? "sign" : "signs"}: ${english}.`
    ] =
      `Ce message présente ${signs.length} ${signs.length === 1 ? "signal d’alerte courant" : "signaux d’alerte courants"} : ${french}.`;
  }

  return translations;
};

const SPEECH_ERRORS: ServerCatalog["exact"] = {
  "Audio playback stopped responding. Please try again.":
    "La lecture audio ne répond plus. Veuillez réessayer.",
  "Choose between 1 and 600 characters to read.":
    "Choisissez un texte de 1 à 600 caractères à lire.",
  "Please choose a shorter section to read aloud.":
    "Veuillez choisir une section plus courte à lire à voix haute.",
  "Please read a shorter passage at a time.":
    "Veuillez lire un passage plus court à la fois.",
  "Please sign in again to use read-aloud.":
    "Veuillez vous reconnecter pour utiliser la lecture à voix haute.",
  "Read-aloud is not set up yet.":
    "La lecture à voix haute n’est pas encore configurée.",
  "Read-aloud is not set up yet. An OpenRouter key is needed.":
    "La lecture à voix haute n’est pas encore configurée. Une clé OpenRouter est nécessaire.",
  "Read-aloud is unavailable. Please try again.":
    "La lecture à voix haute est indisponible. Veuillez réessayer.",
  "Read-aloud needs a short pause. Please try again in a minute.":
    "La lecture à voix haute a besoin d’une courte pause. Veuillez réessayer dans une minute.",
  "Read-aloud returned an unexpected audio format. Please try again later.":
    "La lecture à voix haute a renvoyé un format audio inattendu. Veuillez réessayer plus tard.",
  "Read-aloud returned no audio. Please try again.":
    "La lecture à voix haute n’a renvoyé aucun son. Veuillez réessayer.",
  "Read-aloud took too long. Please try again.":
    "La lecture à voix haute a pris trop de temps. Veuillez réessayer.",
  "That audio was too large. Please read a shorter section.":
    "Cet audio était trop volumineux. Veuillez lire une section plus courte.",
  "That passage is too long to read at once. Please choose a shorter section.":
    "Ce passage est trop long pour être lu en une seule fois. Veuillez choisir une section plus courte.",
  "The audio could not be loaded. Please try again.":
    "L’audio n’a pas pu être chargé. Veuillez réessayer.",
  "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.":
    "Le modèle de lecture à voix haute configuré n’est pas un modèle ElevenLabs vérifié sur OpenRouter.",
  "The configured read-aloud voice is not supported. Please check the speech settings.":
    "La voix de lecture configurée n’est pas prise en charge. Veuillez vérifier les paramètres de voix.",
  "This audio could not be played. Please try again.":
    "Cet audio n’a pas pu être lu. Veuillez réessayer.",
  "This browser cannot play audio. You can still read the text here.":
    "Ce navigateur ne peut pas lire l’audio. Vous pouvez toujours lire le texte ici.",
  "Today’s read-aloud limit has been reached. Please try again tomorrow.":
    "La limite quotidienne de lecture à voix haute a été atteinte. Veuillez réessayer demain.",
};

/** French for the backend's fixed English messages, matched exactly. */
const fr: ServerCatalog = {
  exact: {
    ...scamSummaries(),
    ...SPEECH_ERRORS,
    "Action not found.": "Action introuvable.",
    "Add the appointment": "Ajouter le rendez-vous",
    "Added to your calendar.": "Ajouté à votre calendrier.",
    "An action cannot change into a different kind of action.":
      "Une action ne peut pas devenir un autre type d’action.",
    "An earlier try is still unresolved.":
      "Le résultat d’une tentative précédente est encore incertain.",
    "Ask for a ride": "Demander un trajet",
    "Ask someone in your trusted circle to take a look.":
      "Demandez à une personne de votre cercle de confiance d’y jeter un œil.",
    "Attempt not found.": "Tentative introuvable.",
    "Check up to 15 emails at a time.":
      "Vérifiez jusqu’à 15 courriels à la fois.",
    "Choose someone from your trusted circle who can be messaged.":
      "Choisissez une personne de votre cercle de confiance à qui vous pouvez envoyer un message.",
    "Cloud AI is not set up. Your local overview is still available.":
      "L’IA dans le nuage n’est pas configurée. Votre aperçu local reste disponible.",
    "Cloud AI suggestions, with supporting quotes checked against each email. Verify details in the original message.":
      "Suggestions de l’IA dans le nuage, accompagnées de citations comparées à chaque courriel. Vérifiez les détails dans le message d’origine.",
    "Confirm the ride": "Confirmer le trajet",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "Connectez Gmail ou Outlook sur l’écran Connexions pour envoyer des courriels.",
    "Contains a link": "Contient un lien",
    "Discord is not set up for this app yet.":
      "Discord n’est pas encore configuré pour cette application.",
    "Discord is not set up for this app.":
      "Discord n’est pas configuré pour cette application.",
    "Don't click links or call numbers in the message.":
      "N’ouvrez pas les liens et n’appelez pas les numéros présents dans le message.",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "Les connexions de courriel, de calendrier et de Drive ne sont pas encore configurées pour cette application.",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "Saisissez un montant supérieur ou égal à zéro en centimes entiers, ou laissez l’estimation vide.",
    "Enter a quantity greater than 0.":
      "Saisissez une quantité supérieure à 0.",
    "Found it in your mailbox.": "Trouvé dans votre boîte courriel.",
    "Found the event on your calendar.":
      "L’événement a été trouvé dans votre calendrier.",
    "Found the message in the Discord conversation.":
      "Le message a été trouvé dans la conversation Discord.",
    "Found the notes in your Google Drive.":
      "Les notes ont été trouvées dans votre Google Drive.",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "Si le message prétend venir d’une entreprise, appelez le numéro indiqué sur votre carte, votre facture ou son site officiel.",
    "It is not in your mailbox, so it did not go through.":
      "Il ne figure pas dans votre boîte courriel ; l’envoi n’a donc pas abouti.",
    "Let family know": "Prévenir la famille",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "Les liens dans les messages inattendus peuvent mener à de fausses pages de connexion. Rendez-vous vous-même sur le site.",
    "Mentions a payment method": "Mentionne un moyen de paiement",
    "Mentions private details": "Mentionne des renseignements privés",
    "New conversation": "Nouvelle conversation",
    "No connected mailbox to send from.":
      "Aucune boîte courriel connectée pour effectuer l’envoi.",
    "No recent emails to summarize yet.":
      "Aucun courriel récent à résumer pour le moment.",
    "No subject or readable message text, and no action request found. Any images or attachments have not been assessed.":
      "Aucun objet, texte lisible ou demande d’action trouvé. Les éventuelles images et pièces jointes n’ont pas été évaluées.",
    "Nobody in your trusted circle can see ride plans, so no update was shared.":
      "Personne dans votre cercle de confiance n’a accès aux plans de trajet ; aucune nouvelle n’a donc été partagée.",
    "Not needed because the ride was declined.":
      "Pas nécessaire, car la demande de trajet a été refusée.",
    "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found.":
      "Seule une courte note informelle ou une information sur un fichier partagé a été trouvée, sans objet significatif, demande de réponse ou détail urgent.",
    "Only something that failed can be tried again.":
      "Seule une action qui a échoué peut être retentée.",
    "Only the account owner can do this.":
      "Seul le titulaire du compte peut faire cela.",
    "Open emails in pages of 15.": "Ouvrez les courriels par pages de 15.",
    "Paste the message you would like checked.":
      "Collez le message que vous souhaitez vérifier.",
    "Photon accepted the iMessage for delivery under the same approval.":
      "Photon a accepté l’iMessage pour acheminement sous la même approbation.",
    "Photon confirmed it accepted the earlier iMessage for delivery.":
      "Photon a confirmé avoir accepté l’iMessage précédent pour acheminement.",
    "Please answer the open question first.":
      "Veuillez d’abord répondre à la question en attente.",
    "Please check up to 8,000 characters at a time.":
      "Veuillez vérifier jusqu’à 8 000 caractères à la fois.",
    "Please choose a JPG, PNG, or WebP photo under 6 MB.":
      "Veuillez choisir une photo JPG, PNG ou WebP de moins de 6 Mo.",
    "Please choose a photo under 6 MB.":
      "Veuillez choisir une photo de moins de 6 Mo.",
    "Please choose a time that has not passed yet.":
      "Veuillez choisir une heure qui n’est pas encore passée.",
    "Please choose one of the options shown.":
      "Veuillez choisir l’une des options affichées.",
    "Please sign in again to continue.":
      "Veuillez vous reconnecter pour continuer.",
    "Please sign in again.": "Veuillez vous reconnecter.",
    "Please write your reply first.": "Veuillez d’abord écrire votre réponse.",
    "Practice emails are reviewed in LifeLink and are never sent to cloud AI.":
      "Les courriels d’entraînement sont vérifiés dans LifeLink et ne sont jamais envoyés à l’IA dans le nuage.",
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "Le mode entraînement est activé. Désactivez-le et vérifiez ceci à nouveau pour le faire réellement.",
    "Practice: done.": "Entraînement : terminé.",
    "Practice: no draft was saved in your real mailbox.":
      "Entraînement : aucun brouillon n’a été enregistré dans votre vraie boîte courriel.",
    "Practice: nothing was added to your real calendar.":
      "Entraînement : rien n’a été ajouté à votre vrai calendrier.",
    "Practice: nothing was saved in your real Google Drive.":
      "Entraînement : rien n’a été enregistré dans votre vrai Google Drive.",
    "Practice: the reply was not really sent.":
      "Entraînement : la réponse n’a pas été réellement envoyée.",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "La pression peut rendre difficile le fait de s’arrêter pour vérifier. Confirmez une demande urgente auprès d’un contact que vous connaissez déjà.",
    "Pressure to act fast": "Pression pour agir vite",
    "Prize or windfall": "Prix ou gain inattendu",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "Les demandes de cartes-cadeaux, de virements ou de cryptomonnaies méritent une vérification séparée. Ces paiements peuvent être difficiles à récupérer.",
    "Save a reminder": "Enregistrer un rappel",
    "Save the reminder": "Enregistrer le rappel",
    "Saved the notes in your Google Drive.":
      "Les notes ont été enregistrées dans votre Google Drive.",
    "Sharing changed for someone on this update. Please review who will see it.":
      "Les autorisations de partage ont changé pour une personne concernée par ces nouvelles. Veuillez vérifier qui pourra les voir.",
    "Showing the overview made in LifeLink. Nothing was sent to cloud AI.":
      "L’aperçu réalisé dans LifeLink est affiché. Rien n’a été envoyé à l’IA dans le nuage.",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "Spectrum n’a pas confirmé si ce message a été envoyé. Vérifiez à nouveau ou confirmez son arrivée ; il ne peut pas être marqué comme non envoyé sans risque.",
    "Surprise winnings that need a fee first are almost always scams.":
      "Les gains inattendus qui exigent d’abord des frais sont presque toujours des arnaques.",
    "Telegram allows 1024 characters with photos. Shorten the message or send the photos separately.":
      "Telegram autorise 1024 caractères avec les photos. Raccourcissez le message ou envoyez les photos séparément.",
    "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.":
      "Telegram a demandé à LifeLink de ralentir. Rien n’a été envoyé ; réessayez dans une minute.",
    "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.":
      "Telegram n’est pas encore configuré pour cette application. Demandez à la personne qui l’a configurée d’exécuter bun run dev:setup --only=telegram.",
    "Telegram is not set up for this app.":
      "Telegram n’est pas configuré pour cette application.",
    "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.":
      "Telegram a refusé : cette personne a bloqué le bot ou n’a jamais appuyé sur Démarrer. Demandez-lui d’ouvrir le lien à nouveau.",
    "That Google Drive is no longer connected.":
      "Ce Google Drive n’est plus connecté.",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "Ce compte n’est plus connecté. Reconnectez-le sur l’écran Connexions.",
    "That calendar is no longer connected.":
      "Ce calendrier n’est plus connecté.",
    "That could not be found.": "Cet élément est introuvable.",
    "That email could not be found.": "Ce courriel est introuvable.",
    "That mailbox is no longer connected.":
      "Cette boîte courriel n’est plus connectée.",
    "That person has no way to be reached yet.":
      "Aucun moyen de joindre cette personne pour le moment.",
    "That step could not be found.": "Cette étape est introuvable.",
    "That task could not be found.": "Cette tâche est introuvable.",
    "The automatic check has not finished. Review this message before deciding.":
      "La vérification automatique n’est pas terminée. Vérifiez ce message avant de décider.",
    "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.":
      "L’aperçu dans le nuage n’a pas abouti. L’aperçu local est affiché ; le fournisseur a peut-être reçu ces courriels.",
    "The cloud-reading limit has been reached. Your local overview is still available.":
      "La limite de lectures dans le nuage a été atteinte. Votre aperçu local reste disponible.",
    "The current subject or message asks for a reply or confirmation. Check the details before responding.":
      "L’objet ou le message actuel demande une réponse ou une confirmation. Vérifiez les détails avant de répondre.",
    "The details changed since you looked. Please review them again.":
      "Les détails ont changé depuis votre consultation. Veuillez les vérifier à nouveau.",
    "The event is not on your calendar.":
      "L’événement ne figure pas dans votre calendrier.",
    "The message cannot be empty.": "Le message ne peut pas être vide.",
    "The message contains a concrete event, account action, or timing detail worth reviewing.":
      "Le message contient un événement précis, une action liée à un compte ou une indication de date ou d’heure qui mérite votre attention.",
    "The message is not in the Discord conversation, so it did not go through.":
      "Le message ne figure pas dans la conversation Discord ; l’envoi n’a donc pas abouti.",
    "The notes are not in your Google Drive.":
      "Les notes ne figurent pas dans votre Google Drive.",
    "The person you are writing to is no longer in your contacts.":
      "La personne à qui vous écrivez ne figure plus dans vos contacts.",
    "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it.":
      "L’adresse de l’expéditeur correspond à une personne de votre Cercle de confiance et le message contient des informations à examiner. Une adresse correspondante ne confirme pas qui a envoyé le message.",
    "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified.":
      "Le nom ou l’adresse de l’expéditeur évoque un message de santé, de facturation ou de service lié à un compte. Consultez-le ; l’identité de l’expéditeur n’a pas été vérifiée.",
    "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested.":
      "L’expéditeur ou le message ressemble à une promotion ou à une lettre d’information, sans action précise ni objet important. Cela peut généralement attendre si le sujet ne vous intéresse pas.",
    "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.":
      "L’objet mentionne un rendez-vous, une transaction, un avis relatif à un compte ou un autre sujet qui mérite votre attention.",
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you.":
      "Il y a un objet ou un contenu significatif, mais aucune demande de réponse claire. Lisez-le pour décider s’il est important pour vous.",
    "There is nothing to check for this one.":
      "Il n’y a rien à vérifier pour cet élément.",
    "These details could not be verified. Please prepare them again.":
      "Ces détails n’ont pas pu être vérifiés. Veuillez les préparer à nouveau.",
    "This action is missing its details.":
      "Les détails de cette action sont absents.",
    "This can no longer be changed because it has already started.":
      "Cette action a déjà commencé et ne peut plus être modifiée.",
    "This changed while you were offline. Please look it over again before approving.":
      "Cela a changé pendant que vous étiez hors ligne. Veuillez vérifier à nouveau avant d’approuver.",
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.":
      "Cette vérification n’a trouvé aucun signal d’alerte courant dans le texte disponible. Elle ne peut pas vérifier l’expéditeur ni prouver qu’un message est authentique. Vérifiez les demandes inattendues avec une personne de confiance.",
    "This check for common warning signs found only advice not to share details or pay in unusual ways. That advice does not prove the message is genuine. Check unexpected requests with someone you trust.":
      "Cette vérification n’a trouvé que des conseils de ne pas partager de renseignements ou payer de façon inhabituelle. Ces conseils ne prouvent pas que le message est authentique. Vérifiez les demandes inattendues avec une personne de confiance.",
    "This check has expired.": "Cette vérification a expiré.",
    "This email is not from a connected mailbox.":
      "Ce courriel ne provient pas d’une boîte connectée.",
    "This has already started, so it can no longer be cancelled.":
      "Cette action a déjà commencé et ne peut plus être annulée.",
    "This is already approved.": "C’est déjà approuvé.",
    "This is not waiting for approval.":
      "Cet élément n’est pas en attente d’approbation.",
    "This mentions sensitive details. Do not share passwords, codes, or account details in response to an unexpected message.":
      "Ce texte mentionne des renseignements sensibles. Ne partagez pas de mots de passe, de codes ou de renseignements de compte en réponse à un message inattendu.",
    "This message tells you not to do this. Real companies say this, and scammers copy it too, so check any other requests in it.":
      "Ce message vous dit de ne pas faire cela. Les vraies entreprises le disent, et les escrocs le copient aussi ; vérifiez donc les autres demandes du message.",
    "This was prepared in practice mode. Please prepare it again now that practice mode is off.":
      "Ceci a été préparé en mode entraînement. Veuillez le préparer à nouveau maintenant que ce mode est désactivé.",
    Threats: "Menaces",
    "Threats of arrest or legal trouble are a common scare tactic.":
      "Les menaces d’arrestation ou de problèmes judiciaires sont une tactique courante pour faire peur.",
    "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.":
      "Utilisez un nombre entier pour les articles individuels ou les paquets. Choisissez un poids ou un volume pour une quantité mesurée.",
    "Wait for an answer": "Attendre une réponse",
    "Warning signs were found. Check the message before replying, paying, or sharing details.":
      "Des signaux d’alerte ont été trouvés. Vérifiez le message avant de répondre, de payer ou de partager des renseignements.",
    "Warns against sharing private details":
      "Déconseille de partager des renseignements privés",
    "Warns against threats": "Met en garde contre les menaces",
    "Warns against unusual payments":
      "Met en garde contre les paiements inhabituels",
    "We are not sure the last try failed. Check whether it went through before trying again.":
      "Nous ne savons pas si la dernière tentative a échoué. Vérifiez si elle a abouti avant de réessayer.",
    "We are still checking this action. Wait for that check to finish.":
      "Nous vérifions encore cette action. Attendez la fin de cette vérification.",
    "What is the appointment for?": "À quoi correspond ce rendez-vous ?",
    "Which appointment is the ride for?":
      "Pour quel rendez-vous est ce trajet ?",
    "Who would you like to ask?": "À qui souhaitez-vous demander ?",
    "Write a few words or add a photo first.":
      "Écrivez d’abord quelques mots ou ajoutez une photo.",
    "Write your reply first.": "Écrivez d’abord votre réponse.",
    "You are not connected with this person.":
      "Vous n’êtes pas lié à cette personne.",
    "You cancelled this.": "Vous avez annulé cette action.",
    "You offered or asked, and the answer was yes.":
      "Vous avez fait une proposition ou une demande et la réponse a été oui.",
    "You offered or asked. The answer is not clear yet.":
      "Vous avez fait une proposition ou une demande. La réponse n’est pas encore claire.",
    "You offered or asked. There is no answer yet.":
      "Vous avez fait une proposition ou une demande. Il n’y a pas encore de réponse.",
    "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.":
      "iMessage n’est pas encore configuré pour cette application. Demandez à la personne qui l’a configurée d’exécuter bun run dev:setup.",
    "iMessage is not set up for this app.":
      "iMessage n’est pas configuré pour cette application.",
  },
  // Match complete templates only; captured names, titles and quotes stay verbatim.
  patterns: [
    [
      /^Read-aloud is unavailable \((?<status>[1-5]\d{2})\)\. Please try again later\.$/u,
      (status) =>
        `La lecture à voix haute est indisponible (${status}). Veuillez réessayer plus tard.`,
    ],
    [/^Appointment: (?<title>.+)$/u, (title) => `Rendez-vous : ${title}`],
    [/^Ride to (?<title>.+)$/u, (title) => `Trajet vers ${title}`],
    [
      /^Waiting for (?<name>[^“”"\r\n]+) to answer\.$/u,
      (name) => `En attente de la réponse de ${name}.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) said: “(?<body>[\s\S]*)”$/u,
      (name, body) => `${name} a dit : “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) can't drive this time\. You could ask someone else\.$/u,
      (name) =>
        `${name} ne peut pas vous accompagner cette fois. Vous pouvez demander à quelqu’un d’autre.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\.$/u,
      (name) => `Aucun moyen de joindre ${name} pour le moment.`,
    ],
    [
      /^Set up iMessage for (?<name>[^“”"\r\n]+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `Configurez iMessage pour ${name} dans le Cercle de confiance, puis demandez à cette personne d’envoyer le premier message à son numéro attribué.`,
    ],
    [
      /^Link (?<name>[^“”"\r\n]+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `Liez d’abord le Telegram de ${name} dans le Cercle de confiance : envoyez-lui son lien et demandez-lui d’appuyer sur Démarrer.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) replied, but it is not clear yet: “(?<body>[\s\S]*)”$/u,
      (name, body) =>
        `${name} a répondu, mais le sens n’est pas encore clair : “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\. Add one under Trusted circle\.$/u,
      (name) =>
        `Aucun moyen de joindre ${name} pour le moment. Ajoutez-en un dans le Cercle de confiance.`,
    ],
    [
      /^Practice: the message to (?<name>[^“”"\r\n]+) was not really sent\. A practice reply will arrive shortly\.$/u,
      (name) =>
        `Entraînement : le message à ${name} n’a pas été réellement envoyé. Une réponse d’entraînement arrivera bientôt.`,
    ],
    [
      /^Photon accepted the iMessage to (?<name>[^“”"\r\n]+) for delivery\.$/u,
      (name) =>
        `Photon a accepté l’iMessage destiné à ${name} pour acheminement.`,
    ],
    [
      /^Shared with (?<count>\d+) (?:person|people) in your trusted circle\.$/u,
      (count) =>
        `Partagé avec ${count} ${Number(count) > 1 ? "personnes" : "personne"} de votre cercle de confiance.`,
    ],
    [
      /^Reply sent to (?<to>[^“”"\r\n]+)\.$/u,
      (to) => `La réponse a été envoyée à ${to}.`,
    ],
    [
      /^Draft saved in your (?<provider>Gmail|Outlook) Drafts folder\. It has not been sent\.$/u,
      (provider) =>
        `Brouillon enregistré dans votre dossier Brouillons de ${provider}. Il n’a pas été envoyé.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked, and the answer was yes\.$/u,
      (name) =>
        `${name} a fait une proposition ou une demande et la réponse a été oui.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. There is no answer yet\.$/u,
      (name) =>
        `${name} a fait une proposition ou une demande. Il n’y a pas encore de réponse.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. The answer is not clear yet\.$/u,
      (name) =>
        `${name} a fait une proposition ou une demande. La réponse n’est pas encore claire.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) asked a question you haven't answered yet\.$/u,
      (name) =>
        `${name} a posé une question à laquelle vous n’avez pas encore répondu.`,
    ],
    [
      /^Answer (?<name>[^“”"\r\n]+)'s offer, if you'd like to accept it\.$/u,
      (name) =>
        `Répondez à la proposition de ${name} si vous souhaitez l’accepter.`,
    ],
    [
      /^In your last (?<messages>\d+) messages? with (?<name>[^“”"\r\n]+), LifeLink found (?<agreements>\d+) agreements? and (?<offers>\d+) offers? or requests? without a clear answer\.$/u,
      (messages, name, agreements, offers) =>
        `Dans vos derniers échanges avec ${name} (${messages} ${Number(messages) > 1 ? "messages" : "message"}), LifeLink a trouvé ${agreements} ${Number(agreements) > 1 ? "accords" : "accord"} et ${offers} ${Number(offers) > 1 ? "propositions ou demandes" : "proposition ou demande"} sans réponse claire.`,
    ],
  ],
};

export { fr };

export type { ServerCatalog };
