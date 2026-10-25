import type { onboarding as english } from "../en/onboarding";

const onboarding: typeof english = {
  aboutYou: "Sobre usted",
  continue: "Continuar",
  family: "Un familiar me invitó",
  familyHint:
    "Solo verá lo que su familiar comparta con usted. En la siguiente pantalla ingresará el código de invitación que le dé.",
  fullName: "Su nombre completo",
  intro:
    "Unos datos para que los mensajes suenen como usted y las horas sean correctas. Puede cambiar todo esto después en Ajustes.",
  lookup: {
    checking: "Buscando su localidad…",
    idle: "Para el tiempo en Hoy. Puede dejarlo en blanco.",
    missing: "No encontramos ese código. Revíselo o déjelo en blanco.",
  },
  owner: "Es para mí",
  ownerHint:
    "Usará LifeLink a diario. Sus familiares solo verán lo que decida compartir.",
  postalCode: "Código postal (opcional)",
  practice: "Empezar en modo de práctica",
  practiceHint:
    "Agrega familiares de ejemplo, un correo de una cita y respuestas de práctica. No se envía nada de verdad. Cada resultado de práctica está marcado como Práctica. Puede desactivarlo en Ajustes.",
  preferredName: "¿Cómo quiere que le llame LifeLink?",
  settingUp: "Configurando…",
  signOff: "Cómo firma sus mensajes (opcional)",
  signOffHint:
    "Por ejemplo, Mamá o Abuela Ruth. Si lo deja en blanco, los mensajes terminarán con el nombre de arriba.",
  timeZone: "Zona horaria",
  title: "Vamos a configurar LifeLink",
  whoFor: "¿Para quién es LifeLink?",
};

export { onboarding };
