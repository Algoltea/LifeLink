import type { InterfaceLocale } from "@lifelink/contracts/locale";

interface RideAppointment {
  day: string;
  title: string;
}

interface ProposalMessages {
  appointmentPrepared: (title: string, when: string) => string;
  groceriesAdded: (items: string, list: string) => string;
  groceryListName: string;
  messagePrepared: (name: string | null) => string;
  missingContact: (name: string) => string;
  missingTrustedContact: (name: string) => string;
  noAppointment: string;
  noContactRoute: string;
  noTrustedRoute: string;
  reminderPrepared: (title: string, when: string) => string;
  ridePrepared: (
    name: string | null,
    appointment: RideAppointment | null
  ) => string;
  scamChecking: string;
  whichAppointment: string;
  whichGroceries: string;
  whichRecipient: string;
  whichReminder: string;
  whichRideTime: string;
}

/** Only LifeLink's new owner-facing words; names and authored details are interpolated unchanged. */
const PROPOSAL_MESSAGES: Record<InterfaceLocale, ProposalMessages> = {
  de: {
    appointmentPrepared: (title, when) =>
      `Ich kann Ihren Termin „${title}“ am ${when} eintragen. Drücken Sie zum Speichern auf Genehmigen.`,
    groceriesAdded: (items, list) =>
      `Ich habe ${items} zu Ihrer Liste „${list}“ hinzugefügt. Es wurde nichts bestellt.`,
    groceryListName: "Einkäufe",
    messagePrepared: (name) =>
      `Ich habe eine Nachricht an ${name ?? "diese Person"} vorbereitet. Lesen Sie sie und ändern Sie, was Sie möchten. Drücken Sie zum Senden auf Genehmigen.`,
    missingContact: (name) =>
      `Ich konnte ${name} nicht in Ihren Kontakten finden.`,
    missingTrustedContact: (name) =>
      `Ich konnte ${name} nicht unter den vertrauten Personen finden, denen Sie schreiben können. Sie können die Person im Vertrauenskreis hinzufügen.`,
    noAppointment:
      "Ich sehe keinen bevorstehenden Termin. Fügen Sie ihn zuerst unter Heute hinzu oder öffnen Sie eine E-Mail dazu. Dann kann ich jemanden um eine Fahrt bitten.",
    noContactRoute:
      "Ich konnte keine Kontaktmöglichkeit für diese Person finden.",
    noTrustedRoute:
      "Sie können noch niemandem in Ihrem Vertrauenskreis schreiben. Fügen Sie dort eine Kontaktmöglichkeit hinzu.",
    reminderPrepared: (title, when) =>
      `Ich kann Sie am ${when} an „${title}“ erinnern. Drücken Sie zum Speichern auf Genehmigen.`,
    ridePrepared: (name, appointment) =>
      `Ich habe eine Nachricht vorbereitet, um ${name ?? "jemanden"} um eine Fahrt zu bitten${appointment === null ? "" : `: „${appointment.title}“ am ${appointment.day}`}. ${name === null || appointment === null ? "Beantworten Sie zuerst die Frage auf dem Bildschirm. " : ""}Lesen Sie die Nachricht und drücken Sie auf Genehmigen, wenn alles stimmt. Erst dann wird sie gesendet.`,
    scamChecking:
      "Ich prüfe diese Nachricht. Das Ergebnis erscheint gleich unter Betrugsprüfung. Bitte klicken Sie in der Zwischenzeit auf keinen Link in der Nachricht.",
    whichAppointment:
      "Wofür ist der Termin, und wann genau? Bitte nennen Sie den Tag und die Uhrzeit.",
    whichGroceries: "Welche Artikel möchten Sie auf Ihre Liste setzen?",
    whichRecipient: "Wem möchten Sie schreiben?",
    whichReminder:
      "Woran und wann genau soll ich Sie erinnern? Bitte nennen Sie den Tag und die Uhrzeit.",
    whichRideTime:
      "Wann müssen Sie dort sein? Bitte nennen Sie den Tag und die Uhrzeit.",
  },
  en: {
    appointmentPrepared: (title, when) =>
      `I can save your appointment "${title}" for ${when}. Press Approve to add it.`,
    groceriesAdded: (items, list) =>
      `I added ${items} to your ${list} list. Nothing has been ordered.`,
    groceryListName: "Groceries",
    messagePrepared: (name) =>
      `I've drafted a message to ${name ?? "them"}. Read it, change anything you like, and press Approve to send it.`,
    missingContact: (name) => `I couldn't find ${name} in your contacts.`,
    missingTrustedContact: (name) =>
      `I couldn't find ${name} among the trusted people you can message. You can add them under Trusted circle.`,
    noAppointment:
      "I don't see an appointment coming up. Add it on Today first, or open an email about it, and I can ask someone for a ride.",
    noContactRoute: "I couldn't find a way to reach them.",
    noTrustedRoute:
      "Nobody in your trusted circle can be messaged yet. Add a way to reach them under Trusted circle.",
    reminderPrepared: (title, when) =>
      `I can remind you "${title}" on ${when}. Press Approve to save it.`,
    ridePrepared: (name, appointment) =>
      `I've written a message asking ${name ?? "someone"} for a ride${appointment === null ? "" : ` for ${appointment.title} on ${appointment.day}`}. ${name === null || appointment === null ? "First, answer the question on screen. Then read the message and" : "Please read it, and"} press Approve when it looks right. Nothing is sent until you do.`,
    scamChecking:
      "I'm checking that message now. The result will appear under Scam check in a moment. Please don't click any links in it while you wait.",
    whichAppointment:
      "What is the appointment for, and exactly when? Please give the day and time.",
    whichGroceries: "Which items would you like on your list?",
    whichRecipient: "Who would you like to write to?",
    whichReminder:
      "What should I remind you about, and exactly when? Please give the day and time.",
    whichRideTime:
      "When do you need to be there? Please give the day and time.",
  },
  es: {
    appointmentPrepared: (title, when) =>
      `Puedo guardar su cita «${title}» para el ${when}. Pulse Aprobar para añadirla.`,
    groceriesAdded: (items, list) =>
      `Añadí ${items} a su lista ${list}. No se ha hecho ningún pedido.`,
    groceryListName: "Compras",
    messagePrepared: (name) =>
      `He preparado un mensaje para ${name ?? "esa persona"}. Léalo, cambie lo que quiera y pulse Aprobar para enviarlo.`,
    missingContact: (name) => `No encontré a ${name} en sus contactos.`,
    missingTrustedContact: (name) =>
      `No encontré a ${name} entre las personas de confianza a quienes puede escribir. Puede añadirla en Círculo de confianza.`,
    noAppointment:
      "No veo una cita próxima. Añádala en Hoy o abra un correo sobre ella, y puedo pedirle a alguien que le lleve.",
    noContactRoute: "No encontré una forma de contactar con esa persona.",
    noTrustedRoute:
      "Aún no puede escribir a nadie de su círculo. Añada una forma de contacto en Círculo de confianza.",
    reminderPrepared: (title, when) =>
      `Puedo recordarle «${title}» el ${when}. Pulse Aprobar para guardarlo.`,
    ridePrepared: (name, appointment) =>
      `He preparado un mensaje para pedirle a ${name ?? "alguien"} que le lleve${appointment === null ? "" : ` para ${appointment.title} el ${appointment.day}`}. ${name === null || appointment === null ? "Primero, responda a la pregunta en pantalla. Después lea el mensaje y" : "Léalo y"} pulse Aprobar cuando esté bien. No se envía nada hasta que lo haga.`,
    scamChecking:
      "Estoy revisando ese mensaje. El resultado aparecerá en Revisar estafas en un momento. No pulse ningún enlace mientras espera.",
    whichAppointment:
      "¿Para qué es la cita y cuándo exactamente? Dígame el día y la hora.",
    whichGroceries: "¿Qué productos quiere añadir a su lista?",
    whichRecipient: "¿A quién le gustaría escribir?",
    whichReminder:
      "¿Qué quiere que le recuerde y cuándo exactamente? Dígame el día y la hora.",
    whichRideTime: "¿Cuándo necesita estar allí? Dígame el día y la hora.",
  },
  fr: {
    appointmentPrepared: (title, when) =>
      `Je peux enregistrer votre rendez-vous « ${title} » le ${when}. Appuyez sur Approuver pour l'ajouter.`,
    groceriesAdded: (items, list) =>
      `J'ai ajouté ${items} à votre liste « ${list} ». Aucune commande n'a été passée.`,
    groceryListName: "Courses",
    messagePrepared: (name) =>
      `J'ai préparé un message pour ${name ?? "cette personne"}. Lisez-le, modifiez ce que vous souhaitez, puis appuyez sur Approuver pour l'envoyer.`,
    missingContact: (name) => `Je n'ai pas trouvé ${name} dans vos contacts.`,
    missingTrustedContact: (name) =>
      `Je n'ai pas trouvé ${name} parmi les personnes de confiance à qui vous pouvez écrire. Vous pouvez ajouter cette personne dans Cercle de confiance.`,
    noAppointment:
      "Je ne vois pas de rendez-vous à venir. Ajoutez-le dans Aujourd'hui ou ouvrez un e-mail à ce sujet, et je pourrai demander à quelqu'un de vous accompagner.",
    noContactRoute: "Je n'ai pas trouvé de moyen de joindre cette personne.",
    noTrustedRoute:
      "Vous ne pouvez pas encore envoyer de message aux personnes de votre cercle. Ajoutez un moyen de les joindre dans Cercle de confiance.",
    reminderPrepared: (title, when) =>
      `Je peux vous rappeler « ${title} » le ${when}. Appuyez sur Approuver pour enregistrer ce rappel.`,
    ridePrepared: (name, appointment) =>
      `J'ai préparé un message pour demander à ${name ?? "quelqu'un"} de vous accompagner${appointment === null ? "" : ` pour « ${appointment.title} » le ${appointment.day}`}. ${name === null || appointment === null ? "Répondez d'abord à la question à l'écran. Ensuite, lisez le message et" : "Lisez-le et"} appuyez sur Approuver s'il vous convient. Rien ne sera envoyé avant votre approbation.`,
    scamChecking:
      "Je vérifie ce message. Le résultat apparaîtra bientôt dans Vérifier une arnaque. En attendant, ne cliquez sur aucun lien du message.",
    whichAppointment:
      "À quoi correspond ce rendez-vous, et à quel moment ? Indiquez le jour et l'heure.",
    whichGroceries: "Quels articles souhaitez-vous ajouter à votre liste ?",
    whichRecipient: "À qui souhaitez-vous écrire ?",
    whichReminder:
      "Que souhaitez-vous que je vous rappelle, et à quel moment ? Indiquez le jour et l'heure.",
    whichRideTime:
      "À quel moment devez-vous y être ? Indiquez le jour et l'heure.",
  },
  it: {
    appointmentPrepared: (title, when) =>
      `Posso salvare il suo appuntamento «${title}» il ${when}. Prema Approva per aggiungerlo.`,
    groceriesAdded: (items, list) =>
      `Ho aggiunto ${items} alla sua lista «${list}». Non è stato ordinato nulla.`,
    groceryListName: "Spesa",
    messagePrepared: (name) =>
      `Ho preparato un messaggio per ${name ?? "questa persona"}. Lo legga, cambi ciò che desidera e prema Approva per inviarlo.`,
    missingContact: (name) => `Non ho trovato ${name} nei suoi contatti.`,
    missingTrustedContact: (name) =>
      `Non ho trovato ${name} tra le persone di fiducia a cui può scrivere. Può aggiungere questa persona nella Cerchia di fiducia.`,
    noAppointment:
      "Non vedo appuntamenti in programma. Ne aggiunga uno in Oggi oppure apra un'e-mail che ne parla, e potrò chiedere un passaggio a qualcuno.",
    noContactRoute: "Non ho trovato un modo per contattare questa persona.",
    noTrustedRoute:
      "Non è ancora possibile scrivere a nessuno nella sua cerchia. Aggiunga un recapito nella Cerchia di fiducia.",
    reminderPrepared: (title, when) =>
      `Posso ricordarle «${title}» il ${when}. Prema Approva per salvare il promemoria.`,
    ridePrepared: (name, appointment) =>
      `Ho preparato un messaggio per chiedere un passaggio a ${name ?? "qualcuno"}${appointment === null ? "" : ` per «${appointment.title}» il ${appointment.day}`}. ${name === null || appointment === null ? "Prima risponda alla domanda sullo schermo. " : ""}Legga il messaggio e prema Approva quando va bene. Non verrà inviato nulla finché non approva.`,
    scamChecking:
      "Sto controllando il messaggio. Il risultato apparirà tra poco in Controllo truffe. Nel frattempo, non apra alcun link nel messaggio.",
    whichAppointment:
      "Per che cosa è l'appuntamento e quando esattamente? Mi indichi il giorno e l'ora.",
    whichGroceries: "Quali prodotti desidera aggiungere alla lista?",
    whichRecipient: "A chi desidera scrivere?",
    whichReminder:
      "Che cosa desidera ricordare e quando esattamente? Mi indichi il giorno e l'ora.",
    whichRideTime: "Quando deve essere lì? Mi indichi il giorno e l'ora.",
  },
  ko: {
    appointmentPrepared: (title, when) =>
      `${when}에 “${title}” 일정을 저장할 수 있습니다. 승인을 눌러 추가하세요.`,
    groceriesAdded: (items, list) =>
      `“${list}” 목록에 ${items} 항목을 추가했습니다. 주문한 것은 없습니다.`,
    groceryListName: "장보기",
    messagePrepared: (name) =>
      `${name === null ? "그분" : `${name} 님`}께 보낼 메시지를 준비했습니다. 읽어 보시고 원하는 내용을 수정한 뒤 승인을 눌러 보내세요.`,
    missingContact: (name) => `연락처에서 ${name} 님을 찾지 못했습니다.`,
    missingTrustedContact: (name) =>
      `메시지를 보낼 수 있는 신뢰하는 사람들 중에서 ${name} 님을 찾지 못했습니다. 신뢰하는 사람들에서 추가하실 수 있습니다.`,
    noAppointment:
      "다가오는 예약이 보이지 않습니다. 오늘에서 먼저 추가하거나 관련 이메일을 열어 주세요. 그러면 차로 데려다 달라고 부탁하는 것을 도와드릴 수 있습니다.",
    noContactRoute: "그분께 연락할 방법을 찾지 못했습니다.",
    noTrustedRoute:
      "아직 신뢰하는 사람들 중 메시지를 보낼 수 있는 분이 없습니다. 신뢰하는 사람들에서 연락 방법을 추가해 주세요.",
    reminderPrepared: (title, when) =>
      `${when}에 “${title}” 알림을 드릴 수 있습니다. 승인을 눌러 저장하세요.`,
    ridePrepared: (name, appointment) =>
      `${name === null ? "누군가" : `${name} 님`}께 차로 데려다 달라고 부탁하는 메시지를 준비했습니다.${appointment === null ? "" : ` 예약은 ${appointment.day}의 “${appointment.title}”입니다.`} ${name === null || appointment === null ? "먼저 화면의 질문에 답해 주세요. " : ""}메시지를 읽고 내용이 맞으면 승인을 눌러 주세요. 승인하기 전에는 아무것도 보내지 않습니다.`,
    scamChecking:
      "메시지를 확인하고 있습니다. 잠시 후 사기 확인에서 결과를 보실 수 있습니다. 기다리는 동안 메시지의 링크를 누르지 마세요.",
    whichAppointment:
      "어떤 약속이고 정확히 언제인가요? 날짜와 시간을 말씀해 주세요.",
    whichGroceries: "목록에 어떤 물품을 추가할까요?",
    whichRecipient: "누구에게 메시지를 보내고 싶으세요?",
    whichReminder: "무엇을 언제 알려드릴까요? 날짜와 시간을 말씀해 주세요.",
    whichRideTime:
      "언제까지 그곳에 도착해야 하나요? 날짜와 시간을 말씀해 주세요.",
  },
  pt: {
    appointmentPrepared: (title, when) =>
      `Posso salvar seu compromisso «${title}» em ${when}. Toque em Aprovar para adicionar.`,
    groceriesAdded: (items, list) =>
      `Adicionei ${items} à sua lista ${list}. Nenhum pedido foi feito.`,
    groceryListName: "Compras",
    messagePrepared: (name) =>
      `Preparei uma mensagem para ${name ?? "essa pessoa"}. Leia, mude o que quiser e toque em Aprovar para enviar.`,
    missingContact: (name) => `Não encontrei ${name} nos seus contatos.`,
    missingTrustedContact: (name) =>
      `Não encontrei ${name} entre as pessoas de confiança para quem você pode escrever. Você pode adicionar essa pessoa no Círculo de confiança.`,
    noAppointment:
      "Não vejo nenhum compromisso próximo. Adicione-o em Hoje ou abra um e-mail sobre ele, e poderei pedir a alguém para levar você.",
    noContactRoute:
      "Não encontrei uma forma de entrar em contato com essa pessoa.",
    noTrustedRoute:
      "Ainda não é possível escrever para ninguém do seu círculo. Adicione uma forma de contato no Círculo de confiança.",
    reminderPrepared: (title, when) =>
      `Posso lembrar você de «${title}» em ${when}. Toque em Aprovar para salvar.`,
    ridePrepared: (name, appointment) =>
      `Preparei uma mensagem para pedir que ${name ?? "alguém"} leve você${appointment === null ? "" : ` ao compromisso «${appointment.title}» no dia ${appointment.day}`}. ${name === null || appointment === null ? "Primeiro, responda à pergunta na tela. " : ""}Leia a mensagem e toque em Aprovar quando estiver tudo certo. Nada será enviado antes da sua aprovação.`,
    scamChecking:
      "Estou verificando essa mensagem. O resultado aparecerá em Verificar golpes em instantes. Não toque em nenhum link da mensagem enquanto espera.",
    whichAppointment:
      "Para que é o compromisso e quando exatamente? Diga o dia e a hora.",
    whichGroceries: "Quais produtos você quer adicionar à sua lista?",
    whichRecipient: "Para quem você gostaria de escrever?",
    whichReminder:
      "O que você quer que eu lembre e quando exatamente? Diga o dia e a hora.",
    whichRideTime: "Quando você precisa estar lá? Diga o dia e a hora.",
  },
  tl: {
    appointmentPrepared: (title, when) =>
      `Maaari kong i-save ang appointment ninyong “${title}” sa ${when}. Pindutin ang Aprubahan para idagdag ito.`,
    groceriesAdded: (items, list) =>
      `Idinagdag ko ang ${items} sa inyong listahang “${list}”. Wala pang inorder.`,
    groceryListName: "Mga bibilhin",
    messagePrepared: (name) =>
      `Naghanda ako ng mensahe para ${name === null ? "sa taong iyon" : `kay ${name}`}. Basahin ito, baguhin ang gusto ninyo, at pindutin ang Aprubahan para ipadala.`,
    missingContact: (name) =>
      `Hindi ko nakita si ${name} sa inyong mga contact.`,
    missingTrustedContact: (name) =>
      `Hindi ko nakita si ${name} sa mga pinagkakatiwalaang taong maaari ninyong padalhan ng mensahe. Maaari ninyo siyang idagdag sa Pinagkakatiwalaang grupo.`,
    noAppointment:
      "Wala akong nakikitang paparating na appointment. Idagdag muna ito sa Ngayon o magbukas ng email tungkol dito, at matutulungan ko kayong humiling ng masasakyan.",
    noContactRoute: "Wala akong nakitang paraan para makontak ang taong iyon.",
    noTrustedRoute:
      "Wala pang maaaring padalhan ng mensahe sa inyong grupo. Magdagdag ng paraan ng pakikipag-ugnayan sa Pinagkakatiwalaang grupo.",
    reminderPrepared: (title, when) =>
      `Maaari ko kayong paalalahanan tungkol sa “${title}” sa ${when}. Pindutin ang Aprubahan para i-save ito.`,
    ridePrepared: (name, appointment) =>
      `Naghanda ako ng mensahe para humiling ${name === null ? "sa isang tao" : `kay ${name}`} na ihatid kayo${appointment === null ? "" : ` sa “${appointment.title}” sa ${appointment.day}`}. ${name === null || appointment === null ? "Sagutin muna ang tanong sa screen. " : ""}Basahin ang mensahe at pindutin ang Aprubahan kapag tama na ito. Walang ipapadala hangga't hindi ninyo inaaprubahan.`,
    scamChecking:
      "Sinusuri ko na ang mensaheng iyon. Lalabas ang resulta sa Suriin ang scam sa ilang sandali. Huwag munang pindutin ang anumang link sa mensahe habang naghihintay.",
    whichAppointment:
      "Para saan ang appointment, at kailan eksakto? Pakibigay ang araw at oras.",
    whichGroceries:
      "Anong mga bagay ang gusto ninyong idagdag sa inyong listahan?",
    whichRecipient: "Sino ang gusto ninyong sulatan?",
    whichReminder:
      "Ano ang gusto ninyong ipaalala ko, at kailan? Pakibigay ang araw at oras.",
    whichRideTime:
      "Kailan mo kailangang makarating doon? Pakibigay ang araw at oras.",
  },
  vi: {
    appointmentPrepared: (title, when) =>
      `Tôi có thể lưu cuộc hẹn «${title}» vào ${when}. Nhấn Phê duyệt để thêm.`,
    groceriesAdded: (items, list) =>
      `Tôi đã thêm ${items} vào danh sách «${list}» của bạn. Chưa đặt mua gì cả.`,
    groceryListName: "Mua sắm",
    messagePrepared: (name) =>
      `Tôi đã soạn tin nhắn cho ${name ?? "người đó"}. Bạn hãy đọc, sửa theo ý mình rồi nhấn Phê duyệt để gửi.`,
    missingContact: (name) =>
      `Tôi không tìm thấy ${name} trong danh bạ của bạn.`,
    missingTrustedContact: (name) =>
      `Tôi không tìm thấy ${name} trong số những người tin cậy mà bạn có thể nhắn tin. Bạn có thể thêm người đó trong Vòng tròn tin cậy.`,
    noAppointment:
      "Tôi chưa thấy cuộc hẹn nào sắp tới. Hãy thêm cuộc hẹn trong Hôm nay hoặc mở email về cuộc hẹn, rồi tôi có thể giúp bạn nhờ người đưa đón.",
    noContactRoute: "Tôi không tìm thấy cách liên lạc với người đó.",
    noTrustedRoute:
      "Bạn chưa thể nhắn tin cho ai trong vòng tròn của mình. Hãy thêm cách liên lạc trong Vòng tròn tin cậy.",
    reminderPrepared: (title, when) =>
      `Tôi có thể nhắc bạn «${title}» vào ${when}. Nhấn Phê duyệt để lưu.`,
    ridePrepared: (name, appointment) =>
      `Tôi đã soạn tin nhắn nhờ ${name ?? "một người"} đưa bạn đi${appointment === null ? "" : ` đến cuộc hẹn «${appointment.title}» vào ${appointment.day}`}. ${name === null || appointment === null ? "Trước hết, hãy trả lời câu hỏi trên màn hình. " : ""}Hãy đọc tin nhắn và nhấn Phê duyệt khi thấy phù hợp. Chưa có gì được gửi cho đến khi bạn phê duyệt.`,
    scamChecking:
      "Tôi đang kiểm tra tin nhắn đó. Kết quả sẽ sớm xuất hiện trong Kiểm tra lừa đảo. Trong lúc chờ, đừng nhấn vào liên kết nào trong tin nhắn.",
    whichAppointment:
      "Cuộc hẹn này là gì và chính xác vào lúc nào? Vui lòng cho biết ngày và giờ.",
    whichGroceries: "Bạn muốn thêm những món nào vào danh sách?",
    whichRecipient: "Bạn muốn viết cho ai?",
    whichReminder:
      "Bạn muốn tôi nhắc việc gì và vào lúc nào? Vui lòng cho biết ngày và giờ.",
    whichRideTime:
      "Bạn cần có mặt ở đó lúc nào? Vui lòng cho biết ngày và giờ.",
  },
  zh: {
    appointmentPrepared: (title, when) =>
      `我可以为您保存${when}的预约“${title}”。请点击“批准”添加。`,
    groceriesAdded: (items, list) =>
      `我已将${items}添加到您的“${list}”清单。没有下单购买任何东西。`,
    groceryListName: "购物清单",
    messagePrepared: (name) =>
      `我已准备好发给${name ?? "这位联系人"}的消息。请阅读并按需修改，然后点击“批准”发送。`,
    missingContact: (name) => `我在您的联系人中没有找到${name}。`,
    missingTrustedContact: (name) =>
      `我在您可以发送消息的信任联系人中没有找到${name}。您可以在“信任圈”中添加这位联系人。`,
    noAppointment:
      "我没有看到近期的预约。请先在“今天”中添加预约，或打开有关预约的邮件，我就可以帮您请人接送。",
    noContactRoute: "我没有找到联系这位联系人的方式。",
    noTrustedRoute:
      "您目前还不能向信任圈中的任何人发送消息。请在“信任圈”中添加联系方式。",
    reminderPrepared: (title, when) =>
      `我可以在${when}提醒您“${title}”。请点击“批准”保存。`,
    ridePrepared: (name, appointment) =>
      `我已准备好一条消息，请${name ?? "他人"}接送您${appointment === null ? "" : `去参加${appointment.day}的“${appointment.title}”预约`}。${name === null || appointment === null ? "请先回答屏幕上的问题。" : ""}请阅读消息，确认无误后点击“批准”。在您批准之前，不会发送任何内容。`,
    scamChecking:
      "我正在检查这条消息。结果稍后会显示在“诈骗检查”中。等待时，请不要点击消息中的任何链接。",
    whichAppointment: "这是什么预约，具体在什么时候？请告诉我日期和时间。",
    whichGroceries: "您想在清单中添加哪些物品？",
    whichRecipient: "您想给谁写消息？",
    whichReminder: "您希望我提醒您什么？请告诉我具体日期和时间。",
    whichRideTime: "您需要什么时候到达那里？请告诉我日期和时间。",
  },
};

const proposalMessagesFor = (locale: InterfaceLocale): ProposalMessages =>
  PROPOSAL_MESSAGES[locale];

export { proposalMessagesFor };
