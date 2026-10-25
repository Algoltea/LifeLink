import type { Messages } from "../en";

const imessageSetup: Messages["imessageSetup"] = {
  agreeAndLink: "Sumang-ayon at i-link ang kontak na ito",
  assignedNumber: "Itinalagang numero sa iMessage: ",
  checkComplete:
    "Tapos na ang pagsusuri. Nasa itaas ang kasalukuyang kalagayan.",
  checkFailed: "Hindi matingnan ang una nilang mensahe. Pakisubukan po ulit.",
  checkFirstMessage: "Tingnan kung may unang mensahe",
  checking: "Tinitingnan ang una nilang mensahe…",
  confirmDescription:
    "Suriin ang eksaktong address at kung paano ito gagamitin bago magpatuloy.",
  confirmInvitation: (contactName, handle) =>
    `Walang ipapadalang imbitasyon. Makikita ninyo ang itinalagang numero para ibahagi kay ${contactName}. Kailangan muna nilang mag-text doon mula sa ${handle}. Magkaibang pagkakakilanlan ang numero ng telepono at Apple ID email, kahit sa iisang telepono.`,
  confirmLink: "I-link ang kasalukuyang kontak sa Photon sa ",
  confirmLookup:
    "Kapag nagpatuloy, hahanapin ang eksaktong address sa Photon, ang aming tagapagbigay ng iMessage, at gagamitin ang kasalukuyang kontak. Hindi nagrerehistro ang LifeLink ng bagong tao o gumagamit ng dagdag na puwesto.",
  confirmNoAccount: (contactName) =>
    `Hindi kailangan ni ${contactName} ng LifeLink account o imbitasyon sa dashboard. Hindi ito nagbibigay ng access sa anumang nasa account ninyo.`,
  confirmTitle: (contactName) => `I-link ang iMessage para kay ${contactName}?`,
  confirmTo: " kay ",
  copied: (contactName) =>
    `Nakopya na ang mga tagubilin. Kayo mismo ang magpadala kay ${contactName}.`,
  copy: "Kopyahin ang mga tagubilin",
  copyFailed:
    "Hindi makopya ang mga tagubilin. Piliin at kopyahin ang teksto sa itaas, o subukan ulit ang Kopyahin ang mga tagubilin.",
  exactAddress: "Eksaktong address ng kontak: ",
  firstMessageConfirmed:
    "Nakumpirma na ang una nilang mensahe. Maaari nang magpadala ang LifeLink sa rehistradong address na ito.",
  heading: "Pag-set up ng iMessage",
  instructions: (contactName, assignedNumber, handle) =>
    `${contactName}: Para magamit ang iMessage sa LifeLink, magpadala muna ng iMessage (gaya ng “Kumusta”) sa ${assignedNumber} mula sa eksaktong rehistradong address ninyo: ${handle}. Sa Messages, tiyaking nagsisimula ang usapan mula sa ${handle}. Magkaibang pagkakakilanlan ang numero ng telepono at Apple ID email, kahit sa iisang telepono. Hindi ito maa-activate ng mensahe mula sa ibang address. Hindi ninyo kailangan ng LifeLink account o imbitasyon sa dashboard.`,
  link: "I-link ang iMessage",
  linkExplanation:
    "I-link ang taong nakarehistro na sa eksaktong address na ito sa Photon. Kung wala pa, idagdag muna sa dashboard ng Photon, saka subukan ulit. Hindi gumagawa ng bagong tao ang LifeLink.",
  linkFailed:
    "Hindi ma-link ang kontak na ito. Tiyaking nakarehistro ang eksaktong address sa dashboard ng Photon, saka subukan ulit.",
  loading: "Nilo-load ang pag-set up ng iMessage…",
  lookingUp: "Hinahanap ang kasalukuyang kontak na ito sa Photon…",
  mustSendFirst: (contactName) =>
    `Si ${contactName} ang kailangang magpadala ng unang mensahe mula sa kanilang address sa itaas. Hindi maa-activate ng sarili ninyong mensahe ang kanilang pag-set up.`,
  needsAddress:
    "Kailangan ng address sa iMessage. Idagdag ang kanilang numero o Apple ID email sa itaas, saka i-save.",
  notConfigured:
    "Kailangang i-set up ang app. Dapat munang ikonekta ng namamahala sa LifeLink ang Photon bago ninyo ma-set up ang iMessage para sa kontak na ito.",
  ownerOnly:
    "May-ari lang ng account ang maaaring mag-set up o mag-check ng iMessage para sa kanilang mga kontak.",
  practice: (contactName) =>
    `Nananatili sa LifeLink ang mga mensahe sa pagsasanay, kaya walang kailangang i-set up dito. Kapag gumamit ng totoong iMessage, maaari ninyong i-link si ${contactName} rito.`,
  retryLink: "Subukang i-link ulit ang iMessage",
  row: {
    failed: "Kailangang tingnan ang iMessage",
    not_registered: "Hindi pa naka-link ang iMessage",
    registering: "Nili-link ang iMessage",
    waiting: "Hinihintay ang una nilang iMessage",
  },
  status: {
    failed: "Kailangang tingnan ang pag-set up",
    not_registered: "Hindi naka-link",
    ready: "Handa na para sa iMessage",
    registering: "Nili-link",
    waiting: "Hinihintay ang una nilang mensahe",
  },
};

export { imessageSetup };
