// src/lib/i18n/translations.ts

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt';

export const LANGUAGES: Record<SupportedLanguage, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇵🇹' },
};

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    popular: 'Popular',
    news: 'News',
    categories: 'Categories',
    
    // Auth
    login: 'Log In',
    signup: 'Sign Up',
    logout: 'Log Out',
    welcomeBack: 'Welcome Back',
    joinSpliten: 'Join Spliten',
    username: 'Username',
    password: 'Password',
    
    // Actions
    vote: 'Vote',
    comment: 'Comment',
    share: 'Share',
    save: 'Save',
    report: 'Report',
    post: 'Post',
    reply: 'Reply',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    
    // Question
    askQuestion: 'Ask a Question',
    viewAll: 'View All',
    votes: 'votes',
    views: 'views',
    arguments: 'arguments',
    discussions: 'discussions',
    addArgument: 'Add Argument',
    
    // Arguments
    argumentsFor: 'Arguments FOR',
    argumentsAgainst: 'Arguments AGAINST',
    topArguments: 'Top Arguments',
    addSource: 'Add Source',
    
    // Discussion
    openDiscussion: 'Open Discussion',
    startDiscussion: 'Start a discussion...',
    
    // Badges
    trending: 'Trending',
    new: 'New',
    controversial: 'Controversial',
    top: 'Top',
    
    // Time
    justNow: 'just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    yesterday: 'yesterday',
    
    // Misc
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    seeMore: 'See more',
    seeLess: 'See less',
    copied: 'Copied!',
    linkCopied: 'Link copied',
    
    // Trending sidebar
    trendingNow: 'Trending Now',
    
    // Navbar specific (NOUVEAU)
    search: 'Search',
    searchPlaceholder: 'Search questions, topics, or categories',
    notifications: 'Notifications',
    toggleTheme: 'Toggle theme',
    language: 'Language',
    account: 'Account',
  },
  
  fr: {
    // Navigation
    home: 'Accueil',
    popular: 'Populaire',
    news: 'Actualités',
    categories: 'Catégories',
    
    // Auth
    login: 'Connexion',
    signup: 'Inscription',
    logout: 'Déconnexion',
    welcomeBack: 'Bon retour',
    joinSpliten: 'Rejoindre Spliten',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    
    // Actions
    vote: 'Voter',
    comment: 'Commenter',
    share: 'Partager',
    save: 'Sauvegarder',
    report: 'Signaler',
    post: 'Publier',
    reply: 'Répondre',
    edit: 'Modifier',
    delete: 'Supprimer',
    cancel: 'Annuler',
    
    // Question
    askQuestion: 'Poser une Question',
    viewAll: 'Voir Tout',
    votes: 'votes',
    views: 'vues',
    arguments: 'arguments',
    discussions: 'discussions',
    addArgument: 'Ajouter un Argument',
    
    // Arguments
    argumentsFor: 'Arguments POUR',
    argumentsAgainst: 'Arguments CONTRE',
    topArguments: 'Meilleurs Arguments',
    addSource: 'Ajouter une Source',
    
    // Discussion
    openDiscussion: 'Discussion Ouverte',
    startDiscussion: 'Démarrer une discussion...',
    
    // Badges
    trending: 'Tendance',
    new: 'Nouveau',
    controversial: 'Controversé',
    top: 'Top',
    
    // Time
    justNow: 'à l\'instant',
    minutesAgo: 'min',
    hoursAgo: 'h',
    daysAgo: 'j',
    yesterday: 'hier',
    
    // Misc
    loading: 'Chargement...',
    error: 'Erreur',
    retry: 'Réessayer',
    seeMore: 'Voir plus',
    seeLess: 'Voir moins',
    copied: 'Copié !',
    linkCopied: 'Lien copié',
    
    // Trending sidebar
    trendingNow: 'Tendances Actuelles',
    
    // Navbar specific (NOUVEAU)
    search: 'Rechercher',
    searchPlaceholder: 'Rechercher des questions, sujets ou catégories',
    notifications: 'Notifications',
    toggleTheme: 'Changer de thème',
    language: 'Langue',
    account: 'Compte',
  },
  
  es: {
    // Navigation
    home: 'Inicio',
    popular: 'Popular',
    news: 'Noticias',
    categories: 'Categorías',
    
    // Auth
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    logout: 'Cerrar Sesión',
    welcomeBack: 'Bienvenido de Nuevo',
    joinSpliten: 'Únete a Spliten',
    username: 'Nombre de Usuario',
    password: 'Contraseña',
    
    // Actions
    vote: 'Votar',
    comment: 'Comentar',
    share: 'Compartir',
    save: 'Guardar',
    report: 'Reportar',
    post: 'Publicar',
    reply: 'Responder',
    edit: 'Editar',
    delete: 'Eliminar',
    cancel: 'Cancelar',
    
    // Question
    askQuestion: 'Hacer una Pregunta',
    viewAll: 'Ver Todo',
    votes: 'votos',
    views: 'vistas',
    arguments: 'argumentos',
    discussions: 'discusiones',
    addArgument: 'Añadir Argumento',
    
    // Arguments
    argumentsFor: 'Argumentos A FAVOR',
    argumentsAgainst: 'Argumentos EN CONTRA',
    topArguments: 'Mejores Argumentos',
    addSource: 'Añadir Fuente',
    
    // Discussion
    openDiscussion: 'Discusión Abierta',
    startDiscussion: 'Iniciar una discusión...',
    
    // Badges
    trending: 'Tendencia',
    new: 'Nuevo',
    controversial: 'Controvertido',
    top: 'Top',
    
    // Time
    justNow: 'ahora',
    minutesAgo: 'min',
    hoursAgo: 'h',
    daysAgo: 'd',
    yesterday: 'ayer',
    
    // Misc
    loading: 'Cargando...',
    error: 'Error',
    retry: 'Reintentar',
    seeMore: 'Ver más',
    seeLess: 'Ver menos',
    copied: '¡Copiado!',
    linkCopied: 'Enlace copiado',
    
    // Trending sidebar
    trendingNow: 'Tendencias Actuales',
    
    // Navbar specific (NOUVEAU)
    search: 'Buscar',
    searchPlaceholder: 'Buscar preguntas, temas o categorías',
    notifications: 'Notificaciones',
    toggleTheme: 'Cambiar tema',
    language: 'Idioma',
    account: 'Cuenta',
  },
  
  de: {
    // Navigation
    home: 'Startseite',
    popular: 'Beliebt',
    news: 'Nachrichten',
    categories: 'Kategorien',
    
    // Auth
    login: 'Anmelden',
    signup: 'Registrieren',
    logout: 'Abmelden',
    welcomeBack: 'Willkommen zurück',
    joinSpliten: 'Spliten beitreten',
    username: 'Benutzername',
    password: 'Passwort',
    
    // Actions
    vote: 'Abstimmen',
    comment: 'Kommentieren',
    share: 'Teilen',
    save: 'Speichern',
    report: 'Melden',
    post: 'Veröffentlichen',
    reply: 'Antworten',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    cancel: 'Abbrechen',
    
    // Question
    askQuestion: 'Frage Stellen',
    viewAll: 'Alle Anzeigen',
    votes: 'Stimmen',
    views: 'Ansichten',
    arguments: 'Argumente',
    discussions: 'Diskussionen',
    addArgument: 'Argument Hinzufügen',
    
    // Arguments
    argumentsFor: 'Argumente DAFÜR',
    argumentsAgainst: 'Argumente DAGEGEN',
    topArguments: 'Top Argumente',
    addSource: 'Quelle Hinzufügen',
    
    // Discussion
    openDiscussion: 'Offene Diskussion',
    startDiscussion: 'Diskussion starten...',
    
    // Badges
    trending: 'Im Trend',
    new: 'Neu',
    controversial: 'Umstritten',
    top: 'Top',
    
    // Time
    justNow: 'gerade',
    minutesAgo: 'Min',
    hoursAgo: 'Std',
    daysAgo: 'T',
    yesterday: 'gestern',
    
    // Misc
    loading: 'Laden...',
    error: 'Fehler',
    retry: 'Wiederholen',
    seeMore: 'Mehr sehen',
    seeLess: 'Weniger sehen',
    copied: 'Kopiert!',
    linkCopied: 'Link kopiert',
    
    // Trending sidebar
    trendingNow: 'Aktuelle Trends',
    
    // Navbar specific (NOUVEAU)
    search: 'Suchen',
    searchPlaceholder: 'Fragen, Themen oder Kategorien suchen',
    notifications: 'Benachrichtigungen',
    toggleTheme: 'Thema wechseln',
    language: 'Sprache',
    account: 'Konto',
  },
  
  it: {
    // Navigation
    home: 'Home',
    popular: 'Popolare',
    news: 'Notizie',
    categories: 'Categorie',
    
    // Auth
    login: 'Accedi',
    signup: 'Registrati',
    logout: 'Esci',
    welcomeBack: 'Bentornato',
    joinSpliten: 'Unisciti a Spliten',
    username: 'Nome Utente',
    password: 'Password',
    
    // Actions
    vote: 'Vota',
    comment: 'Commenta',
    share: 'Condividi',
    save: 'Salva',
    report: 'Segnala',
    post: 'Pubblica',
    reply: 'Rispondi',
    edit: 'Modifica',
    delete: 'Elimina',
    cancel: 'Annulla',
    
    // Question
    askQuestion: 'Fai una Domanda',
    viewAll: 'Vedi Tutto',
    votes: 'voti',
    views: 'visualizzazioni',
    arguments: 'argomenti',
    discussions: 'discussioni',
    addArgument: 'Aggiungi Argomento',
    
    // Arguments
    argumentsFor: 'Argomenti A FAVORE',
    argumentsAgainst: 'Argomenti CONTRO',
    topArguments: 'Migliori Argomenti',
    addSource: 'Aggiungi Fonte',
    
    // Discussion
    openDiscussion: 'Discussione Aperta',
    startDiscussion: 'Inizia una discussione...',
    
    // Badges
    trending: 'Tendenza',
    new: 'Nuovo',
    controversial: 'Controverso',
    top: 'Top',
    
    // Time
    justNow: 'ora',
    minutesAgo: 'min',
    hoursAgo: 'h',
    daysAgo: 'g',
    yesterday: 'ieri',
    
    // Misc
    loading: 'Caricamento...',
    error: 'Errore',
    retry: 'Riprova',
    seeMore: 'Vedi altro',
    seeLess: 'Vedi meno',
    copied: 'Copiato!',
    linkCopied: 'Link copiato',
    
    // Trending sidebar
    trendingNow: 'Tendenze Attuali',
    
    // Navbar specific (NOUVEAU)
    search: 'Cerca',
    searchPlaceholder: 'Cerca domande, argomenti o categorie',
    notifications: 'Notifiche',
    toggleTheme: 'Cambia tema',
    language: 'Lingua',
    account: 'Account',
  },
  
  pt: {
    // Navigation
    home: 'Início',
    popular: 'Popular',
    news: 'Notícias',
    categories: 'Categorias',
    
    // Auth
    login: 'Entrar',
    signup: 'Registrar',
    logout: 'Sair',
    welcomeBack: 'Bem-vindo de Volta',
    joinSpliten: 'Juntar-se ao Spliten',
    username: 'Nome de Usuário',
    password: 'Senha',
    
    // Actions
    vote: 'Votar',
    comment: 'Comentar',
    share: 'Compartilhar',
    save: 'Salvar',
    report: 'Denunciar',
    post: 'Publicar',
    reply: 'Responder',
    edit: 'Editar',
    delete: 'Excluir',
    cancel: 'Cancelar',
    
    // Question
    askQuestion: 'Fazer uma Pergunta',
    viewAll: 'Ver Tudo',
    votes: 'votos',
    views: 'visualizações',
    arguments: 'argumentos',
    discussions: 'discussões',
    addArgument: 'Adicionar Argumento',
    
    // Arguments
    argumentsFor: 'Argumentos A FAVOR',
    argumentsAgainst: 'Argumentos CONTRA',
    topArguments: 'Melhores Argumentos',
    addSource: 'Adicionar Fonte',
    
    // Discussion
    openDiscussion: 'Discussão Aberta',
    startDiscussion: 'Iniciar uma discussão...',
    
    // Badges
    trending: 'Tendência',
    new: 'Novo',
    controversial: 'Controverso',
    top: 'Top',
    
    // Time
    justNow: 'agora',
    minutesAgo: 'min',
    hoursAgo: 'h',
    daysAgo: 'd',
    yesterday: 'ontem',
    
    // Misc
    loading: 'Carregando...',
    error: 'Erro',
    retry: 'Tentar Novamente',
    seeMore: 'Ver mais',
    seeLess: 'Ver menos',
    copied: 'Copiado!',
    linkCopied: 'Link copiado',
    
    // Trending sidebar
    trendingNow: 'Tendências Atuais',
    
    // Navbar specific (NOUVEAU)
    search: 'Pesquisar',
    searchPlaceholder: 'Pesquisar perguntas, tópicos ou categorias',
    notifications: 'Notificações',
    toggleTheme: 'Alterar tema',
    language: 'Idioma',
    account: 'Conta',
  },
};

export function getTranslations(lang: SupportedLanguage) {
  return translations[lang] || translations.en;
}

export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const supported: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'it', 'pt'];
  
  if (supported.includes(browserLang as SupportedLanguage)) {
    return browserLang as SupportedLanguage;
  }
  
  return 'en';
}