import type { Messages } from "../en";

const errors: Messages["errors"] = {
  goToToday: "Aller à Aujourd’hui",
  notFoundBody:
    "Le lien est peut-être ancien ou l’adresse contient une faute de frappe. Rien n’a été modifié.",
  notFoundTitle: "Il n’y a pas de page à cette adresse",
  pageBody:
    "Rien n’a été envoyé ni modifié. Il s’agit souvent d’un bref problème de connexion ; réessayer suffit généralement.",
  pageTitle: "Cette page n’a pas pu être chargée",
};

export { errors };
