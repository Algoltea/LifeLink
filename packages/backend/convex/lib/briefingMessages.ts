import type { InterfaceLocale } from "@lifelink/contracts/locale";

interface BriefingMessages {
  appointment: (title: string, day: string, time: string) => string;
  noAppointments: string;
  reminder: (title: string, time: string) => string;
  rideConfirmed: string;
  rideNeeded: string;
  waiting: (count: number) => string;
}

const BRIEFING_MESSAGES: Record<InterfaceLocale, BriefingMessages> = {
  de: {
    appointment: (title, day, time) => `„${title}“ ist am ${day} um ${time}.`,
    noAppointments: "Für die nächsten Tage ist nichts geplant.",
    reminder: (title, time) => `Erinnerung um ${time}: ${title}.`,
    rideConfirmed: "Ihre Fahrt ist bestätigt.",
    rideNeeded: "Für diesen Termin haben Sie noch keine Fahrt vereinbart.",
    waiting: (count) =>
      `${count} ${count === 1 ? "Anfrage wartet" : "Anfragen warten"} auf Ihre Genehmigung.`,
  },
  en: {
    appointment: (title, day, time) => `${title} is on ${day} at ${time}.`,
    noAppointments: "Nothing is booked for the next few days.",
    reminder: (title, time) => `Reminder at ${time}: ${title}.`,
    rideConfirmed: "Your ride is confirmed.",
    rideNeeded: "You don't have a ride arranged for it yet.",
    waiting: (count) =>
      `${count} ${count === 1 ? "thing is" : "things are"} waiting for your approval.`,
  },
  es: {
    appointment: (title, day, time) => `${title} es el ${day} a las ${time}.`,
    noAppointments: "No hay nada programado para los próximos días.",
    reminder: (title, time) => `Recordatorio a las ${time}: ${title}.`,
    rideConfirmed: "Su transporte está confirmado.",
    rideNeeded: "Aún no tiene transporte para esa cita.",
    waiting: (count) =>
      `${count} ${count === 1 ? "cosa espera" : "cosas esperan"} su aprobación.`,
  },
  fr: {
    appointment: (title, day, time) =>
      `${title} est prévu le ${day} à ${time}.`,
    noAppointments: "Rien n'est prévu pour les prochains jours.",
    reminder: (title, time) => `Rappel à ${time} : ${title}.`,
    rideConfirmed: "Votre trajet est confirmé.",
    rideNeeded:
      "Vous n'avez pas encore de transport prévu pour ce rendez-vous.",
    waiting: (count) =>
      `${count} ${count === 1 ? "demande attend" : "demandes attendent"} votre approbation.`,
  },
  it: {
    appointment: (title, day, time) =>
      `L'appuntamento «${title}» è il ${day} alle ${time}.`,
    noAppointments: "Non ci sono impegni in programma per i prossimi giorni.",
    reminder: (title, time) => `Promemoria alle ${time}: ${title}.`,
    rideConfirmed: "Il suo passaggio è confermato.",
    rideNeeded:
      "Non ha ancora organizzato un passaggio per questo appuntamento.",
    waiting: (count) =>
      `${count} ${count === 1 ? "richiesta attende" : "richieste attendono"} la sua approvazione.`,
  },
  ko: {
    appointment: (title, day, time) =>
      `“${title}” 예약은 ${day} ${time}입니다.`,
    noAppointments: "앞으로 며칠간 예정된 일정이 없습니다.",
    reminder: (title, time) => `${time} 알림: ${title}.`,
    rideConfirmed: "차량 이동이 확정되었습니다.",
    rideNeeded: "이 예약에 가실 차량이 아직 정해지지 않았습니다.",
    waiting: (count) => `${count}건의 요청이 승인을 기다리고 있습니다.`,
  },
  pt: {
    appointment: (title, day, time) =>
      `O compromisso «${title}» está marcado para ${day} às ${time}.`,
    noAppointments: "Não há nada marcado para os próximos dias.",
    reminder: (title, time) => `Lembrete às ${time}: ${title}.`,
    rideConfirmed: "Seu transporte está confirmado.",
    rideNeeded:
      "Você ainda não tem transporte combinado para esse compromisso.",
    waiting: (count) =>
      `${count} ${count === 1 ? "pedido aguarda" : "pedidos aguardam"} sua aprovação.`,
  },
  tl: {
    appointment: (title, day, time) => `Ang “${title}” ay sa ${day}, ${time}.`,
    noAppointments: "Walang nakatakda sa mga susunod na araw.",
    reminder: (title, time) => `Paalala sa ${time}: ${title}.`,
    rideConfirmed: "Kumpirmado na ang inyong masasakyan.",
    rideNeeded:
      "Wala pa kayong naayos na masasakyan para sa appointment na ito.",
    waiting: (count) =>
      `May ${count} kahilingang naghihintay ng inyong pag-apruba.`,
  },
  vi: {
    appointment: (title, day, time) =>
      `Cuộc hẹn «${title}» vào ${day}, lúc ${time}.`,
    noAppointments: "Chưa có lịch hẹn nào trong vài ngày tới.",
    reminder: (title, time) => `Nhắc lúc ${time}: ${title}.`,
    rideConfirmed: "Việc đưa đón của bạn đã được xác nhận.",
    rideNeeded: "Bạn chưa sắp xếp được người đưa đón cho cuộc hẹn này.",
    waiting: (count) => `Có ${count} yêu cầu đang chờ bạn phê duyệt.`,
  },
  zh: {
    appointment: (title, day, time) =>
      `“${title}”安排在${day}，时间是${time}。`,
    noAppointments: "未来几天没有已安排的事项。",
    reminder: (title, time) => `${time}的提醒：${title}。`,
    rideConfirmed: "您的接送已确认。",
    rideNeeded: "这次预约还没有安排接送。",
    waiting: (count) => `有${count}项请求等待您的批准。`,
  },
};

const briefingMessagesFor = (locale: InterfaceLocale): BriefingMessages =>
  BRIEFING_MESSAGES[locale];

export { briefingMessagesFor };
