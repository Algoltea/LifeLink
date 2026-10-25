import type { Messages } from "../en";

const tasks: Messages["tasks"] = {
  alsoWaiting: "Naghihintay din sa inyo",
  answerFirst: "Pakisagot po muna ang tanong sa itaas.",
  approve: {
    calendar_event: "Aprubahan at idagdag",
    confirm_arrangement: "Kumpirmahin ang masasakyan",
    create_reminder: "I-save ang paalala",
    drive_note: "Aprubahan at i-save",
    email_draft: "Aprubahan at i-save ang burador",
    family_update: "Ibahagi ang balita",
    grocery_handoff: "Aprubahan ang kahilingan",
    send_message: "Aprubahan at ipadala",
  },
  approveAgain:
    "May nagbago matapos ninyong aprubahan, kaya pakisuri at aprubahan po ulit.",
  approvedWaiting: "Naaprubahan. Naghihintay magsimula…",
  approving: "Inaaprubahan…",
  askAgainIfChanged:
    "Kung may magbago matapos aprubahan, tulad ng oras o tatanggap, hihingi ulit ng pahintulot ang LifeLink.",
  backToToday: "Bumalik sa Ngayon",
  breadcrumb: "Landas ng pahina",
  cancelEditing: "Kanselahin ang pagbabago",
  cancelRequest: "Kanselahin ang kahilingang ito",
  cancelled: "Kinansela ninyo ito. Walang ipinadala.",
  cancelling: "Kinakansela…",
  changeWords: "Baguhin ang mga salita",
  changesSaved:
    "Na-save ang mga pagbabago. Suriin ang bagong mensahe bago aprubahan.",
  checkNow: "Suriin ngayon",
  checkedForYou: "Sinuri para sa inyo",
  checking: "Sinusuri…",
  checks: {
    appointment: (title, day, time) =>
      `Tugma ang petsa at oras sa ${title} sa ${day}, ${time}.`,
    contact: (name, relationship) =>
      `Nasa inyong mga kontak si ${name} (${relationship}).`,
    hasLink: "May link ang mensaheng ito. Tiyaking sinadya ninyong isama ito.",
    noLinks: "Walang link sa mensahe.",
    nothingUnclear: "Walang hindi malinaw tungkol sa kung sino o kailan.",
    trusted: "pinagkakatiwalaan",
  },
  couldNotTell:
    "Hindi namin matiyak mula rito. Pakitingnan po (halimbawa, tanungin ang tao) at sabihin sa amin:",
  detailsChanged:
    "Nagbago ang detalye habang nag-eedit kayo. Nandito pa ang mga binago ninyo. Ihambing sa pinakabagong teksto bago i-save.",
  detailsGone: "Hindi na available ang mga detalyeng ito.",
  didNotGoThrough: "Hindi ito naisagawa.",
  done: "Tapos na",
  earlierVersionHide: "Itago ang naunang bersyon",
  earlierVersionShow: "Ipakita ang naunang bersyon",
  goToCircle: "Pumunta sa Mga pinagkakatiwalaan",
  heading: {
    approveSubline: "Walang mangyayari hanggang aprubahan ninyo.",
    approveTitle: "Suriin ito, saka aprubahan",
    completedSubline: "Tapos na ang lahat para rito.",
    confirmSubline: (who) =>
      `Tumugon na si ${who}. Suriin ang oras, saka kumpirmahin.`,
    confirmTitle: "Kumpirmahin ang masasakyan",
    sendSubline: (who) =>
      `Walang mapupunta kay ${who} hanggang pindutin ninyo ang Aprubahan. Maaari muna ninyong baguhin ang mga salita.`,
    sendTitle: "Basahin ito bago ipadala",
    standsSubline: "Narito ang kasalukuyang kalagayan nito.",
    waitingSubline: (who) =>
      `Naipadala na ang inyong mensahe. Ipapakita rito ang sagot ni ${who} pagdating nito.`,
    waitingTitle: (who) => `Hinihintay si ${who}`,
  },
  howItWent: "Kung ano ang nangyari",
  inProgress: "Isinasagawa",
  itArrived: "Dumating ito",
  itDidNotArrive: "Hindi ito dumating",
  keepMyEdits: "Panatilihin ang mga binago ko",
  latestWording: "Tingnan ang pinakabagong teksto",
  loadingDetails: "Nilo-load ang detalye ng gawain",
  loadingLatest: "Nilo-load ang pinakabagong detalye",
  loadingRequest: "Nilo-load ang detalye ng kahilingan",
  messageText: "Teksto ng mensahe",
  messages: "Mga mensahe",
  noLongerEditable:
    "Hindi na mababago ang kahilingang ito. Nandito pa ang hindi na-save na mga salita para makopya ninyo.",
  notFound: "Hindi ito makita.",
  notSure: "Hindi pa namin tiyak kung naisagawa ito.",
  notSureDetail:
    "Hindi kinumpirma ng serbisyo kung ano ang nangyari. Pinananatili ito ng LifeLink na hindi tiyak para hindi mapagkamalang ligtas subukan ulit.",
  nothingNeedsYou: "Walang nangangailangan ng inyong pansin ngayon.",
  nothingToApprove: "Walang aaprubahan dito.",
  nothingToApproveRequest: "Walang aaprubahan para sa kahilingang ito.",
  nothingWasSent: "Walang ipinadala, kaya ligtas subukan ulit.",
  offlineApprovalFailed:
    "Hindi ma-save ang pag-apruba habang walang koneksyon. Pakisubukang aprubahan ulit kapag nakakonekta na.",
  offlineApprovalSaved:
    "Na-save para kapag may internet na kayo. Susuriin ulit ng LifeLink ang lahat bago ipadala.",
  openReceipt: "Buksan ang resibo",
  outcomeError: (error) => `${error} Pakisubukan po ulit.`,
  practiceApproval:
    " Mode ng pagsasanay: ipinapakita ng pag-apruba ang mangyayari; walang totoong ipinapadala.",
  progress: "Pag-usad",
  progressAndNext: "Pag-usad at mga susunod na hakbang",
  recordedOutcome: "Naitalang resulta",
  reminderShare: "Ipakita ang paalalang ito sa aking mga pinagkakatiwalaan",
  reminderShareAria: "Ibahagi ang paalalang ito sa aking mga pinagkakatiwalaan",
  reminderShareHint: "Mga taong binabahagian ninyo ng paalala lamang.",
  replied: (who) => `Tumugon si ${who}`,
  reviewStatus: {
    approved: "Naaprubahan",
    awaiting_approval: "Suriin ang mga detalyeng ito",
    cancelled: "Kinansela",
    executing: "Isinasagawa",
    failed: "Hindi naisagawa",
    succeeded: "Natapos",
    unknown: "Hindi pa kumpirmado ang resulta",
  },
  savedApproveAgain:
    "Na-save. Dahil nagbago ang mga salita, pakiaprubahan po ulit.",
  savingOutcome: "Sine-save ang nangyari…",
  seeDetails: "Tingnan ang detalye",
  sentStatus: {
    sent: "naipadala",
  },
  sentWaiting:
    "Naipadala na ang inyong mensahe. Ipapakita ang sagot pagdating nito.",
  shoppingRetired:
    "Hindi na maaaring aprubahan ang mga kahilingan sa pamimili.",
  spectrumUnknown:
    "Hindi pa rin makumpirma ang mensaheng ito. Tanungin ang tao kung dumating ito. Kung hindi pa, maaari pa rin itong dumating mamaya; pananatilihin ng LifeLink na hindi tiyak ang kalagayan nito.",
  status: {
    awaiting_approval: "Kayo naman",
    cancelled: "Kinansela",
    completed: "Natapos",
    in_progress: "Inaayos na",
    needs_attention: "Kailangang tingnan",
    needs_clarification: "May tanong para sa inyo",
    waiting_for_reply: "Naghihintay ng tugon",
  },
  stepByStep: "Bawat hakbang",
  steps: {
    awaiting_approval: "Kailangan kayo",
    failed: "Hindi gumana",
    pending: "Mamaya",
    running: "Inaayos na",
    skipped: "Hindi kailangan",
    succeeded: "Tapos na",
    unknown: "Hindi tiyak kung naisagawa",
    waiting: "Naghihintay",
  },
  them: "kanila",
  they: "Sila",
  unclearReply: (who) =>
    `Hindi namin matiyak ang ibig sabihin ni ${who}. Pumayag ba si ${who}?`,
  useLatestWords: "Gamitin ang pinakabagong teksto",
  version: (version, status) => `Bersyon ${version} · ${status}`,
  wentNotThrough: "Hindi ito naisagawa. Maaari ninyong subukan ulit.",
  wentThrough: "Naisagawa ito.",
  whoCan: (who) => `Oo, maaari si ${who}`,
  whoCannot: (who) => `Hindi, hindi maaari si ${who}`,
  workingNow: "Inaayos na ngayon…",
  youSent: "Ipinadala ninyo",
};

export { tasks };
