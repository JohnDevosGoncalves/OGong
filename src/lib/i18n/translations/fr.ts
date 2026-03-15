export const fr = {
  common: {
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Cr\u00e9er",
    back: "Retour",
    search: "Rechercher",
    confirm: "Confirmer",
    error: "Une erreur est survenue",
    success: "Op\u00e9ration r\u00e9ussie",
    noResults: "Aucun r\u00e9sultat",
  },
  auth: {
    login: "Connexion",
    logout: "D\u00e9connexion",
    register: "Cr\u00e9er un compte",
    email: "Email",
    password: "Mot de passe",
    forgotPassword: "Mot de passe oubli\u00e9 ?",
    resetPassword: "R\u00e9initialiser le mot de passe",
  },
  nav: {
    events: "\u00c9v\u00e9nements",
    statistics: "Statistiques",
    credits: "Cr\u00e9dits",
    account: "Mon compte",
    invitations: "Invitations",
    users: "Utilisateurs",
    createEvent: "Cr\u00e9er un \u00e9v\u00e9nement",
    help: "Aide",
    skipToContent: "Aller au contenu",
    mainMenu: "Menu principal",
  },
  events: {
    title: "Mes \u00e9v\u00e9nements",
    create: "Cr\u00e9er un \u00e9v\u00e9nement",
    noEvents: "Aucun \u00e9v\u00e9nement pour le moment",
    participants: "Participants",
    tours: "Tours",
    format: {
      speed_meeting: "Speed Meeting",
      team: "Team Building",
      job_dating: "Job Dating",
    },
    status: {
      brouillon: "Brouillon",
      ouvert: "Ouvert",
      en_cours: "En cours",
      termine: "Termin\u00e9",
    },
  },
  notifications: {
    label: "Notifications",
    reminder: "Envoyer un rappel",
    start: "Notifier le d\u00e9but",
    results: "Envoyer les r\u00e9sultats",
  },
  credits: {
    balance: "Solde de cr\u00e9dits",
    buy: "Acheter des cr\u00e9dits",
    history: "Historique des transactions",
  },
  header: {
    greeting: "Bonjour",
    eventsLabel: "\u00c9v\u00e9nements",
    logout: "D\u00e9connexion",
  },
  roles: {
    super_admin: "Super Admin",
    admin: "Administrateur",
    animateur: "Animateur",
  },
  collabRoles: {
    createur: "Cr\u00e9ateur",
    co_organisateur: "Co-organisateur",
    animateur: "Animateur",
  },
  collabStatus: {
    en_attente: "En attente",
    accepte: "Accept\u00e9",
  },
  formats: {
    speed_meeting: { label: "Speed meeting", description: "Rencontres 1 \u00e0 1 minut\u00e9es" },
    team: { label: "Team", description: "\u00c9quipes tournantes XS \u00e0 XL" },
    job_dating: { label: "Job dating", description: "Exposants et cr\u00e9neaux de passage" },
  },
  languageSwitcher: {
    label: "Changer de langue",
    fr: "Fran\u00e7ais",
    en: "Anglais",
  },
} as const;

/** Recursively widen string literal types to `string` for cross-locale compatibility. */
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>;
};

export type Translations = DeepStringify<typeof fr>;
