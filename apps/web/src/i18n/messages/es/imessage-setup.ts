import type { Messages } from "../en";

const imessageSetup: Messages["imessageSetup"] = {
  agreeAndLink: "Aceptar y vincular este contacto",
  assignedNumber: "Número de iMessage asignado: ",
  checkComplete: "Revisión terminada. El estado actual se muestra arriba.",
  checkFailed:
    "No se pudo revisar si llegó su primer mensaje. Por favor, inténtelo de nuevo.",
  checkFirstMessage: "Revisar si llegó el primer mensaje",
  checking: "Revisando si llegó su primer mensaje…",
  confirmDescription:
    "Revise la dirección exacta y cómo se usará antes de continuar.",
  confirmInvitation: (contactName, handle) =>
    `No se envía ningún mensaje de invitación. Verá el número asignado para compartirlo con ${contactName}. Esta persona debe escribirle primero desde ${handle}. Un número de teléfono y un correo de Apple ID son identidades distintas, aunque estén en el mismo teléfono.`,
  confirmLink: "Vincular el contacto de Photon existente en ",
  confirmLookup:
    "Al continuar, se busca esta dirección exacta en Photon, nuestro proveedor de iMessage, y se reutiliza el contacto existente. LifeLink no registra personas nuevas ni usa capacidad adicional.",
  confirmNoAccount: (contactName) =>
    `${contactName} no necesita una cuenta de LifeLink ni una invitación al panel. Esto no le da acceso a nada de su cuenta.`,
  confirmTitle: (contactName) => `¿Vincular iMessage para ${contactName}?`,
  confirmTo: " con ",
  copied: (contactName) =>
    `Instrucciones copiadas. Envíeselas usted a ${contactName}.`,
  copy: "Copiar instrucciones",
  copyFailed:
    "No se pudieron copiar las instrucciones. Seleccione y copie el texto de arriba, o pulse Copiar instrucciones otra vez.",
  exactAddress: "Dirección exacta del contacto: ",
  firstMessageConfirmed:
    "Se confirmó su primer mensaje. LifeLink ya puede escribir a esta dirección registrada.",
  heading: "Configuración de iMessage",
  instructions: (contactName, assignedNumber, handle) =>
    `${contactName}: Para empezar a usar iMessage con LifeLink, primero debe enviar un iMessage (por ejemplo, «Hola») al ${assignedNumber} desde su dirección registrada exacta: ${handle}. En Mensajes, asegúrese de que la conversación empiece desde ${handle}. Un número de teléfono y un correo de Apple ID son identidades distintas, aunque estén en el mismo teléfono. Un mensaje desde otra dirección no activará esta. No necesita una cuenta de LifeLink ni una invitación al panel.`,
  link: "Vincular iMessage",
  linkExplanation:
    "Vincule a la persona que ya está registrada con esta dirección exacta en Photon. Si no está, agréguela primero en el panel de Photon y vuelva a intentarlo. LifeLink no crea personas nuevas.",
  linkFailed:
    "No se pudo vincular este contacto. Revise que esta dirección exacta esté registrada en el panel de Photon y vuelva a intentarlo.",
  loading: "Cargando la configuración de iMessage…",
  lookingUp: "Buscando este contacto existente en Photon…",
  mustSendFirst: (contactName) =>
    `${contactName} debe enviar el primer mensaje desde su dirección, que se muestra arriba. Un mensaje suyo no activará la configuración.`,
  needsAddress:
    "Se necesita una dirección de iMessage. Agregue arriba su número de teléfono o correo de Apple ID y guarde.",
  notConfigured:
    "Falta configurar la aplicación. Quien administra LifeLink debe conectar Photon antes de que pueda configurar iMessage para este contacto.",
  ownerOnly:
    "Solo el titular de la cuenta puede configurar o revisar iMessage para sus contactos.",
  practice: (contactName) =>
    `Los mensajes de práctica se quedan en LifeLink, así que no hay nada que configurar aquí. Cuando cambie a iMessage de verdad, podrá vincular a ${contactName} aquí.`,
  retryLink: "Intentar vincular iMessage otra vez",
  row: {
    failed: "iMessage necesita atención",
    not_registered: "iMessage aún sin vincular",
    registering: "Vinculando iMessage",
    waiting: "Esperando su primer iMessage",
  },
  status: {
    failed: "La configuración necesita atención",
    not_registered: "Sin vincular",
    ready: "Listo para iMessage",
    registering: "Vinculando",
    waiting: "Esperando su primer mensaje",
  },
};

export { imessageSetup };
