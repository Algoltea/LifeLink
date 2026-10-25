interface ServerCatalog {
  exact: Record<string, string>;
  patterns: [RegExp, (...parts: string[]) => string][];
}

const SCAM_SIGNS = [
  ["pressure to act fast", "pamimilit na kumilos agad"],
  ["mentions private details", "may binanggit na pribadong impormasyon"],
  ["mentions a payment method", "may binanggit na paraan ng pagbabayad"],
  ["contains a link", "may link"],
  ["threats", "mga banta"],
  ["prize or windfall", "premyo o di-inaasahang pera"],
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
    const localized = signs.map(([, label]) => label).join(", ");
    translations[
      `This message shows ${signs.length} common warning ${signs.length === 1 ? "sign" : "signs"}: ${english}.`
    ] = `May ${signs.length} karaniwang babala sa mensaheng ito: ${localized}.`;
  }

  return translations;
};

/** Filipino for the backend's fixed English messages, matched exactly. */
const tl: ServerCatalog = {
  exact: {
    ...scamSummaries(),
    "Action not found.": "Hindi natagpuan ang aksyon.",
    "Add the appointment": "Idagdag ang appointment",
    "Added to your calendar.": "Naidagdag na sa inyong kalendaryo.",
    "An action cannot change into a different kind of action.":
      "Hindi maaaring palitan ang isang aksyon ng ibang uri ng aksyon.",
    "An earlier try is still unresolved.":
      "Hindi pa tiyak ang kinalabasan ng isang naunang pagsubok.",
    "Ask for a ride": "Humiling ng masasakyan",
    "Ask someone in your trusted circle to take a look.":
      "Hilingin po sa isang tao sa Mga pinagkakatiwalaan na tingnan ito.",
    "Attempt not found.": "Hindi natagpuan ang tala ng pagsubok.",
    "Audio playback stopped responding. Please try again.":
      "Hindi na tumutugon ang pagpapatugtog ng audio. Pakisubukan po ulit.",
    "Check up to 15 emails at a time.":
      "Suriin po ang hanggang 15 email sa bawat pagkakataon.",
    "Choose between 1 and 600 characters to read.":
      "Pumili po ng tekstong may 1 hanggang 600 karakter na babasahin.",
    "Choose someone from your trusted circle who can be messaged.":
      "Pumili po ng isang tao sa Mga pinagkakatiwalaan na maaaring padalhan ng mensahe.",
    "Cloud AI is not set up. Your local overview is still available.":
      "Hindi pa naka-set up ang AI sa cloud. Maaari pa rin ninyong tingnan ang lokal na buod.",
    "Cloud AI suggestions, with supporting quotes checked against each email. Verify details in the original message.":
      "Mga mungkahi ng AI sa cloud, na may mga siping sumusuporta at itinugma sa bawat email. Tiyakin po ang mga detalye sa orihinal na mensahe.",
    "Confirm the ride": "Kumpirmahin ang masasakyan",
    "Connect Gmail or Outlook on the Connections screen to send email.":
      "Ikonekta po ang Gmail o Outlook sa Mga koneksyon para makapagpadala ng email.",
    "Contains a link": "May link",
    "Discord is not set up for this app yet.":
      "Hindi pa naka-set up ang Discord para sa app na ito.",
    "Discord is not set up for this app.":
      "Hindi naka-set up ang Discord para sa app na ito.",
    "Don't click links or call numbers in the message.":
      "Huwag po buksan ang mga link o tawagan ang mga numero sa mensahe.",
    "Email, calendar, and Drive connections are not set up for this app yet.":
      "Hindi pa naka-set up ang mga koneksyon sa email, kalendaryo, at Drive para sa app na ito.",
    "Enter a nonnegative amount in whole cents, or leave the estimate blank.":
      "Maglagay po ng halagang 0 o higit pa sa buong sentimo, o iwang blangko ang tantiya.",
    "Enter a quantity greater than 0.": "Maglagay po ng dami na higit sa 0.",
    "Found it in your mailbox.": "Natagpuan ito sa inyong mailbox.",
    "Found the event on your calendar.":
      "Natagpuan ang kaganapan sa inyong kalendaryo.",
    "Found the message in the Discord conversation.":
      "Natagpuan ang mensahe sa usapan sa Discord.",
    "Found the notes in your Google Drive.":
      "Natagpuan ang mga tala sa inyong Google Drive.",
    "If it claims to be from a company, call the number on your card, bill, or their official website.":
      "Kung sinasabing mula ito sa isang kumpanya, tawagan po ang numero sa inyong card, bayarin, o opisyal na website ng kumpanya.",
    "It is not in your mailbox, so it did not go through.":
      "Wala ito sa inyong mailbox, kaya hindi ito naipadala.",
    "Let family know": "Ipaalam sa pamilya",
    "Links in unexpected messages can lead to fake sign-in pages. Go to the website yourself instead.":
      "Maaaring humantong sa pekeng pahina ng pag-sign in ang mga link sa di-inaasahang mensahe. Kayo po mismo ang pumunta sa website.",
    "Mentions a payment method": "May binanggit na paraan ng pagbabayad",
    "Mentions private details": "May binanggit na pribadong impormasyon",
    "New conversation": "Bagong usapan",
    "No connected mailbox to send from.":
      "Walang nakakonektang mailbox na magagamit sa pagpapadala.",
    "No recent emails to summarize yet.":
      "Wala pang kamakailang email na maibubuod.",
    "No subject or readable message text, and no action request found. Any images or attachments have not been assessed.":
      "Walang natagpuang paksa, nababasang teksto ng mensahe, o hinihiling na aksyon. Hindi nasuri ang mga larawan o kalakip.",
    "Nobody in your trusted circle can see ride plans, so no update was shared.":
      "Walang sinuman sa Mga pinagkakatiwalaan ang may pahintulot na makita ang plano sa pagsakay, kaya walang ibinahaging balita.",
    "Not needed because the ride was declined.":
      "Hindi na kailangan dahil tinanggihan ang hiling na magpahatid.",
    "Only a short casual note or shared-file context, with no meaningful subject, reply request, or time-sensitive detail found.":
      "Maikling karaniwang mensahe o impormasyon tungkol sa nakabahaging file lamang ang nakita. Walang makabuluhang paksa, hiling na sumagot, o detalyeng kailangang asikasuhin sa takdang oras.",
    "Only something that failed can be tried again.":
      "Maaari lamang subukang muli ang nabigong aksyon.",
    "Only the account owner can do this.":
      "Ang may-ari lang ng account ang maaaring gumawa nito.",
    "Open emails in pages of 15.":
      "Buksan po ang mga email nang tig-15 sa bawat pahina.",
    "Paste the message you would like checked.":
      "Idikit po ang mensaheng nais ninyong ipasuri.",
    "Photon accepted the iMessage for delivery under the same approval.":
      "Tinanggap ng Photon ang iMessage para maihatid, gamit ang parehong pag-apruba.",
    "Photon confirmed it accepted the earlier iMessage for delivery.":
      "Kinumpirma ng Photon na tinanggap nito ang naunang iMessage para maihatid.",
    "Please answer the open question first.":
      "Pakisagot po muna ang tanong na naghihintay ng tugon.",
    "Please check up to 8,000 characters at a time.":
      "Suriin po ang hanggang 8,000 karakter sa bawat pagkakataon.",
    "Please choose a JPG, PNG, or WebP photo under 6 MB.":
      "Pumili po ng larawang JPG, PNG, o WebP na mas maliit sa 6 MB.",
    "Please choose a photo under 6 MB.":
      "Pumili po ng larawang mas maliit sa 6 MB.",
    "Please choose a shorter section to read aloud.":
      "Pumili po ng mas maikling bahagi na babasahin nang malakas.",
    "Please choose a time that has not passed yet.":
      "Pumili po ng oras na hindi pa lumilipas.",
    "Please choose one of the options shown.":
      "Pumili po ng isa sa mga ipinakitang opsyon.",
    "Please read a shorter passage at a time.":
      "Pumili po ng mas maikling talata sa bawat pagbasa.",
    "Please sign in again to continue.": "Mag-sign in po ulit para magpatuloy.",
    "Please sign in again to use read-aloud.":
      "Mag-sign in po ulit para magamit ang pagbabasa nang malakas.",
    "Please sign in again.": "Mag-sign in po ulit.",
    "Please write your reply first.": "Isulat po muna ang inyong tugon.",
    "Practice emails are reviewed in LifeLink and are never sent to cloud AI.":
      "Sinusuri sa LifeLink ang mga email sa pagsasanay at hindi kailanman ipinapadala sa AI sa cloud.",
    "Practice mode is on. Turn it off and review this again to do it for real.":
      "Naka-on ang mode ng pagsasanay. I-off po ito at suriin ulit ang nilalaman para talagang maisagawa.",
    "Practice: done.": "Pagsasanay: tapos na.",
    "Practice: no draft was saved in your real mailbox.":
      "Pagsasanay: walang burador na na-save sa inyong totoong mailbox.",
    "Practice: nothing was added to your real calendar.":
      "Pagsasanay: walang idinagdag sa inyong totoong kalendaryo.",
    "Practice: nothing was saved in your real Google Drive.":
      "Pagsasanay: walang na-save sa inyong totoong Google Drive.",
    "Practice: the reply was not really sent.":
      "Pagsasanay: hindi talaga ipinadala ang tugon.",
    "Pressure can make it harder to stop and check. Verify an urgent request through a contact you already know.":
      "Maaaring mahirap huminto at magsuri kapag minamadali kayo. Tiyakin po ang agarang kahilingan sa pamamagitan ng kontak na kilala na ninyo.",
    "Pressure to act fast": "Pamimilit na kumilos agad",
    "Prize or windfall": "Premyo o di-inaasahang pera",
    "Read-aloud is not set up yet.":
      "Hindi pa naka-set up ang pagbabasa nang malakas.",
    "Read-aloud is not set up yet. An OpenRouter key is needed.":
      "Hindi pa naka-set up ang pagbabasa nang malakas. Kailangan ng susi ng OpenRouter.",
    "Read-aloud is unavailable. Please try again.":
      "Hindi magamit ang pagbabasa nang malakas. Pakisubukan po ulit.",
    "Read-aloud needs a short pause. Please try again in a minute.":
      "Kailangang magpahinga sandali ang pagbabasa nang malakas. Pakisubukan po ulit pagkalipas ng isang minuto.",
    "Read-aloud returned an unexpected audio format. Please try again later.":
      "Hindi inaasahang format ng audio ang ibinalik ng pagbabasa nang malakas. Pakisubukan po ulit mamaya.",
    "Read-aloud returned no audio. Please try again.":
      "Walang ibinalik na audio ang pagbabasa nang malakas. Pakisubukan po ulit.",
    "Read-aloud took too long. Please try again.":
      "Masyadong natagalan ang pagbabasa nang malakas. Pakisubukan po ulit.",
    "Requests for gift cards, transfers, or cryptocurrency deserve a separate check. These payments can be difficult to recover.":
      "Suriin po nang hiwalay ang mga hiling na magbayad gamit ang gift card, paglilipat ng pera, o cryptocurrency. Maaaring mahirap mabawi ang mga bayad na ito.",
    "Save a reminder": "I-save ang paalala",
    "Save the reminder": "I-save ang paalala",
    "Saved the notes in your Google Drive.":
      "Na-save na ang mga tala sa inyong Google Drive.",
    "Sharing changed for someone on this update. Please review who will see it.":
      "Nagbago ang pahintulot sa pagbabahagi para sa isang tatanggap ng balitang ito. Pakisuri po kung sino ang makakakita nito.",
    "Showing the overview made in LifeLink. Nothing was sent to cloud AI.":
      "Ipinapakita ang buod na ginawa sa LifeLink. Walang ipinadala sa AI sa cloud.",
    "Spectrum has not confirmed whether this message was sent. Check again or confirm when it arrives; it cannot safely be marked as not sent.":
      "Hindi pa nakumpirma ng Spectrum kung naipadala ang mensaheng ito. Suriin po ulit o kumpirmahin kapag dumating; hindi ligtas na markahan itong hindi naipadala.",
    "Surprise winnings that need a fee first are almost always scams.":
      "Halos palaging panloloko ang di-inaasahang premyong kailangang bayaran muna bago makuha.",
    "Telegram allows 1024 characters with photos. Shorten the message or send the photos separately.":
      "Hanggang 1024 karakter ang pinapayagan ng Telegram kapag may larawan. Paikliin po ang mensahe o ipadala nang hiwalay ang mga larawan.",
    "Telegram asked LifeLink to slow down. Nothing was sent; try again in a minute.":
      "Hiniling ng Telegram na magdahan-dahan ang LifeLink sa pagpapadala. Wala pong ipinadala; pakisubukan ulit pagkalipas ng isang minuto.",
    "Telegram is not set up for this app yet. Ask whoever set it up to run bun run dev:setup --only=telegram.":
      "Hindi pa naka-set up ang Telegram para sa app na ito. Hilingin po sa nag-set up nito na patakbuhin ang bun run dev:setup --only=telegram.",
    "Telegram is not set up for this app.":
      "Hindi naka-set up ang Telegram para sa app na ito.",
    "Telegram refused: this person has blocked the bot or never tapped Start. Ask them to open the link again.":
      "Tumanggi ang Telegram: hinarangan ng taong ito ang bot o hindi pa niya napindot ang Start. Hilingin po sa kanya na buksan ulit ang link.",
    "That Google Drive is no longer connected.":
      "Hindi na nakakonekta ang Google Drive na iyon.",
    "That account is no longer connected. Reconnect it on the Connections screen.":
      "Hindi na nakakonekta ang account na iyon. Ikonekta po ulit ito sa Mga koneksyon.",
    "That audio was too large. Please read a shorter section.":
      "Masyadong malaki ang audio. Pumili po ng mas maikling bahagi na babasahin.",
    "That calendar is no longer connected.":
      "Hindi na nakakonekta ang kalendaryong iyon.",
    "That could not be found.": "Hindi iyon natagpuan.",
    "That email could not be found.": "Hindi natagpuan ang email na iyon.",
    "That mailbox is no longer connected.":
      "Hindi na nakakonekta ang mailbox na iyon.",
    "That passage is too long to read at once. Please choose a shorter section.":
      "Masyadong mahaba ang talata para basahin nang sabay-sabay. Pumili po ng mas maikling bahagi.",
    "That person has no way to be reached yet.":
      "Wala pang paraan para makontak ang taong iyon.",
    "That step could not be found.": "Hindi natagpuan ang hakbang na iyon.",
    "That task could not be found.": "Hindi natagpuan ang gawaing iyon.",
    "The audio could not be loaded. Please try again.":
      "Hindi ma-load ang audio. Pakisubukan po ulit.",
    "The automatic check has not finished. Review this message before deciding.":
      "Hindi pa tapos ang awtomatikong pagsusuri. Suriin po ang mensaheng ito bago magpasya.",
    "The cloud overview did not finish. The local overview is shown; the provider may have received these emails.":
      "Hindi natapos ang buod sa cloud. Ipinapakita ang lokal na buod; maaaring natanggap na ng tagapagbigay ang mga email na ito.",
    "The cloud-reading limit has been reached. Your local overview is still available.":
      "Naabot na ang limitasyon sa pagbabasa sa cloud. Maaari pa rin ninyong tingnan ang lokal na buod.",
    "The configured read-aloud model is not a verified ElevenLabs model on OpenRouter.":
      "Ang modelong itinakda para sa pagbabasa nang malakas ay hindi isang natiyak na modelo ng ElevenLabs sa OpenRouter.",
    "The configured read-aloud voice is not supported. Please check the speech settings.":
      "Hindi sinusuportahan ang itinakdang boses sa pagbabasa. Pakitingnan po ang mga setting ng boses.",
    "The current subject or message asks for a reply or confirmation. Check the details before responding.":
      "Humihingi ng tugon o kumpirmasyon ang kasalukuyang paksa o mensahe. Pakisuri po ang mga detalye bago sumagot.",
    "The details changed since you looked. Please review them again.":
      "Nagbago ang mga detalye mula noong tingnan ninyo. Pakisuri po ulit.",
    "The event is not on your calendar.":
      "Wala ang kaganapan sa inyong kalendaryo.",
    "The message cannot be empty.": "Hindi maaaring walang laman ang mensahe.",
    "The message contains a concrete event, account action, or timing detail worth reviewing.":
      "May partikular na kaganapan, aksyon sa account, o detalye ng oras sa mensahe na dapat tingnan.",
    "The message is not in the Discord conversation, so it did not go through.":
      "Wala ang mensahe sa usapan sa Discord, kaya hindi ito naipadala.",
    "The notes are not in your Google Drive.":
      "Wala ang mga tala sa inyong Google Drive.",
    "The person you are writing to is no longer in your contacts.":
      "Wala na sa inyong mga kontak ang taong sinusulatan ninyo.",
    "The sender address matches someone in your Trusted circle and the message has context worth reviewing. An address match does not verify who sent it.":
      "Tugma ang address ng nagpadala sa isang tao sa Mga pinagkakatiwalaan at may nilalaman ang mensaheng dapat tingnan. Hindi pinatutunayan ng tugmang address kung sino ang nagpadala.",
    "The sender label or address suggests a health, billing, or account-service message. Review it; the sender's identity has not been verified.":
      "Batay sa pangalan o address ng nagpadala, maaaring tungkol ito sa kalusugan, bayarin, o serbisyo ng account. Pakisuri po; hindi pa natiyak ang pagkakakilanlan ng nagpadala.",
    "The sender or message looks like a promotion or newsletter, without a concrete action or important subject. It can usually wait if you are not interested.":
      "Mukhang promosyon o newsletter ang nagpadala o mensahe, at walang partikular na aksyon o mahalagang paksa. Karaniwan ay maaari itong maghintay kung hindi kayo interesado.",
    "The subject mentions an appointment, transaction, account notice, or other matter worth reviewing.":
      "May binanggit sa paksa na appointment, transaksyon, abiso sa account, o ibang bagay na dapat tingnan.",
    "There is a subject or substantive message, but no clear reply request. Read it to decide whether it matters to you.":
      "May paksa o makabuluhang nilalaman ang mensahe, pero walang malinaw na hiling na sumagot. Basahin po upang mapagpasiyahan kung mahalaga ito sa inyo.",
    "There is nothing to check for this one.":
      "Walang kailangang suriin para rito.",
    "These details could not be verified. Please prepare them again.":
      "Hindi matiyak ang mga detalyeng ito. Pakihanda po ulit.",
    "This action is missing its details.":
      "Kulang ang mga detalye ng aksyong ito.",
    "This audio could not be played. Please try again.":
      "Hindi mapatugtog ang audio na ito. Pakisubukan po ulit.",
    "This browser cannot play audio. You can still read the text here.":
      "Hindi makapagpatugtog ng audio ang browser na ito. Mababasa pa rin ninyo ang teksto rito.",
    "This can no longer be changed because it has already started.":
      "Nagsimula na ito kaya hindi na maaaring baguhin.",
    "This changed while you were offline. Please look it over again before approving.":
      "Nagbago ito habang wala kayong koneksyon. Pakisuri po ulit bago aprubahan.",
    "This check for common warning signs found none in the available text. It cannot verify the sender or prove a message is genuine. Check unexpected requests with someone you trust.":
      "Walang nakitang karaniwang babala sa tekstong mayroon para sa pagsusuring ito. Hindi nito matitiyak ang nagpadala o mapapatunayang tunay ang mensahe. Suriin po ang mga di-inaasahang kahilingan kasama ng taong pinagkakatiwalaan ninyo.",
    "This check for common warning signs found only advice not to share details or pay in unusual ways. That advice does not prove the message is genuine. Check unexpected requests with someone you trust.":
      "Sa pagsusuring ito para sa karaniwang babala, payo lang na huwag magbahagi ng impormasyon o magbayad sa di-karaniwang paraan ang nakita. Hindi pinatutunayan ng payong iyon na tunay ang mensahe. Suriin po ang mga di-inaasahang kahilingan kasama ng taong pinagkakatiwalaan ninyo.",
    "This check has expired.": "Nag-expire na ang pagsusuring ito.",
    "This email is not from a connected mailbox.":
      "Hindi mula sa nakakonektang mailbox ang email na ito.",
    "This has already started, so it can no longer be cancelled.":
      "Nagsimula na ito kaya hindi na maaaring kanselahin.",
    "This is already approved.": "Naaprubahan na ito.",
    "This is not waiting for approval.": "Hindi ito naghihintay ng pag-apruba.",
    "This mentions sensitive details. Do not share passwords, codes, or account details in response to an unexpected message.":
      "May binanggit na sensitibong impormasyon dito. Huwag po magbigay ng password, code, o detalye ng account bilang tugon sa di-inaasahang mensahe.",
    "This message tells you not to do this. Real companies say this, and scammers copy it too, so check any other requests in it.":
      "Sinasabi ng mensaheng ito na huwag ninyo itong gawin. Sinasabi rin ito ng mga tunay na kumpanya at ginagaya ng mga manloloko, kaya suriin po ang iba pang kahilingan sa mensahe.",
    "This was prepared in practice mode. Please prepare it again now that practice mode is off.":
      "Inihanda ito sa mode ng pagsasanay. Naka-off na ang mode ng pagsasanay, kaya pakihanda po ulit.",
    Threats: "Mga banta",
    "Threats of arrest or legal trouble are a common scare tactic.":
      "Karaniwang pananakot ang mga bantang aarestuhin kayo o magkakaroon ng problema sa batas.",
    "Today’s read-aloud limit has been reached. Please try again tomorrow.":
      "Naabot na ang limitasyon sa pagbabasa nang malakas ngayong araw. Pakisubukan po ulit bukas.",
    "Use a whole number for individual items or packages. Choose a weight or volume for a measured amount.":
      "Gumamit po ng buong bilang para sa paisa-isang item o pakete. Pumili ng timbang o bolyum para sa sinusukat na dami.",
    "Wait for an answer": "Maghintay ng tugon",
    "Warning signs were found. Check the message before replying, paying, or sharing details.":
      "May nakitang mga babala. Suriin po ang mensahe bago sumagot, magbayad, o magbahagi ng impormasyon.",
    "Warns against sharing private details":
      "Nagbababala laban sa pagbabahagi ng pribadong impormasyon",
    "Warns against threats": "Nagbababala tungkol sa mga banta",
    "Warns against unusual payments":
      "Nagbababala tungkol sa di-karaniwang pagbabayad",
    "We are not sure the last try failed. Check whether it went through before trying again.":
      "Hindi pa tiyak kung nabigo ang huling pagsubok. Pakitingnan po kung natuloy ito bago subukang muli.",
    "We are still checking this action. Wait for that check to finish.":
      "Sinusuri pa ang aksyong ito. Hintayin po munang matapos ang pagsusuri.",
    "What is the appointment for?": "Para saan ang appointment?",
    "Which appointment is the ride for?":
      "Para po sa aling appointment ang pagsakay?",
    "Who would you like to ask?": "Sino po ang nais ninyong tanungin?",
    "Write a few words or add a photo first.":
      "Sumulat po muna ng ilang salita o magdagdag ng larawan.",
    "Write your reply first.": "Isulat po muna ang inyong tugon.",
    "You are not connected with this person.":
      "Hindi kayo nakakonekta sa taong ito.",
    "You cancelled this.": "Kinansela ninyo ito.",
    "You offered or asked, and the answer was yes.":
      "Nag-alok o humiling kayo, at pumayag ang kausap.",
    "You offered or asked. The answer is not clear yet.":
      "Nag-alok o humiling kayo. Hindi pa malinaw ang tugon.",
    "You offered or asked. There is no answer yet.":
      "Nag-alok o humiling kayo. Wala pang tugon.",
    "iMessage is not set up for this app yet. Ask whoever set it up to run bun run dev:setup.":
      "Hindi pa naka-set up ang iMessage para sa app na ito. Hilingin po sa nag-set up nito na patakbuhin ang bun run dev:setup.",
    "iMessage is not set up for this app.":
      "Hindi naka-set up ang iMessage para sa app na ito.",
  },
  // Match complete templates only; captured names, titles and quotes stay verbatim.
  patterns: [
    [
      /^Read-aloud is unavailable \((?<status>[1-5]\d{2})\)\. Please try again later\.$/u,
      (status) =>
        `Hindi magamit ang pagbabasa nang malakas (${status}). Pakisubukan po ulit mamaya.`,
    ],
    [/^Appointment: (?<title>.+)$/u, (title) => `Appointment: ${title}`],
    [/^Ride to (?<title>.+)$/u, (title) => `Pagsakay papunta sa ${title}`],
    [
      /^Waiting for (?<name>[^“”"\r\n]+) to answer\.$/u,
      (name) => `Hinihintay ang tugon ni ${name}.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) said: “(?<body>[\s\S]*)”$/u,
      (name, body) => `Sinabi ni ${name}: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) can't drive this time\. You could ask someone else\.$/u,
      (name) =>
        `Hindi makapaghahatid si ${name} sa pagkakataong ito. Maaari po kayong magtanong sa iba.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\.$/u,
      (name) => `Wala pang paraan para makontak si ${name}.`,
    ],
    [
      /^Set up iMessage for (?<name>[^“”"\r\n]+) in Trusted circle, then ask them to text their assigned number first\.$/u,
      (name) =>
        `I-set up po ang iMessage para kay ${name} sa Mga pinagkakatiwalaan, at hilinging magpadala muna siya ng mensahe sa nakatalagang numero.`,
    ],
    [
      /^Link (?<name>[^“”"\r\n]+)'s Telegram in Trusted circle first: send them their link and ask them to tap Start\.$/u,
      (name) =>
        `I-link po muna ang Telegram ni ${name} sa Mga pinagkakatiwalaan: ipadala ang link niya at hilinging pindutin niya ang Start.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+?) replied, but it is not clear yet: “(?<body>[\s\S]*)”$/u,
      (name, body) => `Tumugon si ${name}, pero hindi pa malinaw: “${body}”`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) has no way to be reached yet\. Add one under Trusted circle\.$/u,
      (name) =>
        `Wala pang paraan para makontak si ${name}. Magdagdag po ng paraan sa Mga pinagkakatiwalaan.`,
    ],
    [
      /^Practice: the message to (?<name>[^“”"\r\n]+) was not really sent\. A practice reply will arrive shortly\.$/u,
      (name) =>
        `Pagsasanay: hindi talaga ipinadala ang mensahe para kay ${name}. May darating na tugon sa pagsasanay sa ilang sandali.`,
    ],
    [
      /^Photon accepted the iMessage to (?<name>[^“”"\r\n]+) for delivery\.$/u,
      (name) =>
        `Tinanggap ng Photon ang iMessage para kay ${name} para maihatid.`,
    ],
    [
      /^Shared with (?<count>\d+) (?:person|people) in your trusted circle\.$/u,
      (count) => `Ibinahagi sa ${count} tao sa Mga pinagkakatiwalaan.`,
    ],
    [
      /^Reply sent to (?<to>[^“”"\r\n]+)\.$/u,
      (to) => `Naipadala ang tugon kay ${to}.`,
    ],
    [
      /^Draft saved in your (?<provider>Gmail|Outlook) Drafts folder\. It has not been sent\.$/u,
      (provider) =>
        `Na-save ang burador sa folder ng mga burador sa inyong ${provider}. Hindi pa ito naipadala.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked, and the answer was yes\.$/u,
      (name) => `Nag-alok o humiling si ${name}, at pumayag ang kausap.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. There is no answer yet\.$/u,
      (name) => `Nag-alok o humiling si ${name}. Wala pang tugon.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) offered or asked\. The answer is not clear yet\.$/u,
      (name) => `Nag-alok o humiling si ${name}. Hindi pa malinaw ang tugon.`,
    ],
    [
      /^(?<name>[^“”"\r\n]+) asked a question you haven't answered yet\.$/u,
      (name) => `May tanong si ${name} na hindi pa ninyo nasasagot.`,
    ],
    [
      /^Answer (?<name>[^“”"\r\n]+)'s offer, if you'd like to accept it\.$/u,
      (name) =>
        `Sagutin po ang alok ni ${name} kung nais ninyo itong tanggapin.`,
    ],
    [
      /^In your last (?<messages>\d+) messages? with (?<name>[^“”"\r\n]+), LifeLink found (?<agreements>\d+) agreements? and (?<offers>\d+) offers? or requests? without a clear answer\.$/u,
      (messages, name, agreements, offers) =>
        `Sa huling ${messages} mensahe sa usapan ninyo ni ${name}, nakakita ang LifeLink ng ${agreements} kasunduan at ${offers} alok o kahilingan na wala pang malinaw na tugon.`,
    ],
  ],
};

export { tl };

export type { ServerCatalog };
