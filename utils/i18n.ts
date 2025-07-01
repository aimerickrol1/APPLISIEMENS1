export type SupportedLanguage = 'fr' | 'en' | 'es' | 'it';

export interface LanguageStrings {
  // Navigation et onglets
  projects: string;
  quickCalc: string;
  search: string;
  export: string;
  about: string;
  
  // Titres de pages
  projectsTitle: string;
  projectsSubtitle: string;
  quickCalcSubtitle: string;
  searchTitle: string;
  searchSubtitle: string;
  exportTitle: string;
  exportSubtitle: string;
  aboutTitle: string;
  aboutSubtitle: string;
  
  // Header
  headerTitle: string;
  headerSubtitle: string;
  
  // Actions générales
  create: string;
  edit: string;
  delete: string;
  save: string;
  cancel: string;
  ok: string;
  yes: string;
  no: string;
  back: string;
  next: string;
  previous: string;
  close: string;
  loading: string;
  error: string;
  success: string;
  
  // Formulaires
  name: string;
  nameRequired: string;
  description: string;
  optional: string;
  required: string;
  
  // Projets
  newProject: string;
  createProject: string;
  editProject: string;
  deleteProject: string;
  projectName: string;
  city: string;
  startDate: string;
  endDate: string;
  noProjects: string;
  noProjectsDesc: string;
  invalidDate: string;
  endDateAfterStart: string;
  
  // Prédéfinition de structure
  predefineStructure: string;
  predefineStructureDesc: string;
  buildings: string;
  zones: string;
  shutters: string;
  zonesPerBuilding: string;
  shuttersPerZone: string;
  structureOverview: string;
  structureComplete: string;
  
  // Bâtiments
  building: string;
  buildingName: string;
  newBuilding: string;
  createBuilding: string;
  editBuilding: string;
  deleteBuilding: string;
  noBuildings: string;
  noBuildingsDesc: string;
  
  // Zones
  zone: string;
  zoneName: string;
  smokeExtractionZone: string;
  newZone: string;
  createZone: string;
  editZone: string;
  deleteZone: string;
  noZones: string;
  noZonesDesc: string;
  
  // Volets
  shutter: string;
  shutterName: string;
  shutterType: string;
  shutterHigh: string;
  shutterLow: string;
  newShutter: string;
  createShutter: string;
  editShutter: string;
  deleteShutter: string;
  deleteShutterConfirm: string;
  noShutters: string;
  noShuttersDesc: string;
  modifyFlows: string;
  modifyShutterFlows: string;
  
  // Débits et mesures
  referenceFlow: string;
  measuredFlow: string;
  deviation: string;
  calculatedDeviation: string;
  flowMeasurements: string;
  cubicMeterPerHour: string;
  positiveOrZeroRequired: string;
  
  // Conformité
  compliance: string;
  complianceResult: string;
  compliancePreview: string;
  complianceCalculator: string;
  compliant: string;
  acceptable: string;
  nonCompliant: string;
  functionalDesc: string;
  acceptableDesc: string;
  nonCompliantDesc: string;
  invalidReference: string;
  
  // Recherche
  searchPlaceholder: string;
  searchMinChars: string;
  searching: string;
  searchResults: string;
  noResults: string;
  noResultsDesc: string;
  
  // Recherche hiérarchique
  simpleSearch: string;
  hierarchicalSearch: string;
  selectProject: string;
  selectBuilding: string;
  selectZone: string;
  allZones: string;
  allBuildings: string;
  clearFilters: string;
  searchInSelected: string;
  searchScope: string;
  
  // Export
  exportCSV: string;
  exportSuccess: string;
  exportError: string;
  exportInProgress: string;
  noProjectsToExport: string;
  noProjectsToExportDesc: string;
  exportDescription: string;
  availableProjects: string;
  completeCSVReport: string;
  detailedDataForSpreadsheet: string;
  localBackup: string;
  directDownload: string;
  fileSavedInDocuments: string;
  
  // À propos
  appDescription: string;
  developedBy: string;
  copyright: string;
  application: string;
  version: string;
  language: string;
  privacy: string;
  dataProtection: string;
  nfStandard: string;
  nfStandardFull: string;
  consultDocument: string;
  complianceCalculations: string;
  certifiedAlgorithms: string;
  contactDeveloper: string;
  contact: string;
  legalNote: string;
  
  // NOUVEAU : Paramètres
  settings: string;
  settingsTitle: string;
  settingsSubtitle: string;
  languageAndRegion: string;
  interfaceLanguage: string;
  dataManagement: string;
  storageUsed: string;
  exportMyData: string;
  exportMyDataDesc: string;
  clearAllData: string;
  clearAllDataDesc: string;
  clearAllDataConfirm: string;
  clearAllDataWarning: string;
  dataCleared: string;
  dataClearedDesc: string;
  applicationSection: string;
  privacyLocalOnly: string;
  
  // Modales et dialogues
  appUpToDate: string;
  currentVersion: string;
  selectLanguage: string;
  privacyTitle: string;
  unofficialApp: string;
  unofficialAppDesc: string;
  dataProtectionTitle: string;
  dataProtectionDesc: string;
  localStorageTitle: string;
  localStorageDesc: string;
  understood: string;
  
  // Dates et temps
  createdOn: string;
  
  // Informations générales
  generalInfo: string;
  remarks: string;
  
  // Actions sur les éléments
  saveChanges: string;
  clearValues: string;
  
  // États et statuts
  loadingData: string;
  itemNotFound: string;
  dataNotFound: string;
  
  // Mode simplifié
  simplifiedMode: string;
  simplifiedModeDesc: string;
  quickVerificationDesc: string;
  nfStandardDesc: string;
  thisStandardDefines: string;
  deviationLessThan10: string;
  idealForSpotChecks: string;
  forCompleteTracking: string;
  enterFlowValues: string;
  
  // Sélection et favoris
  selected: string;
  favorites: string;
  
  // Aperçu et prévisualisation
  preview: string;
  
  // Types de volets avec traduction complète
  highShutter: string;
  lowShutter: string;
  
  // Boutons d'action spécifiques
  addFirstShutter: string;
  
  // Messages d'état
  enterAtLeast2Chars: string;
  searchInProgress: string;
  noShuttersFound: string;
  
  // Textes spécifiques aux captures d'écran
  copied: string;
  all: string;
  
  // Norme française avec mention
  frenchStandard: string;
  
  // Traductions approximatives
  approximateTranslations: string;
  translationNote: string;
  
  // Messages pour le contact et erreurs
  contactDeveloperMessage: string;
  pdfOpenError: string;
}

const translations: Record<SupportedLanguage, LanguageStrings> = {
  fr: {
    // Navigation et onglets
    projects: 'Projets',
    quickCalc: 'Calcul Rapide',
    search: 'Recherche',
    export: 'Export',
    about: 'À propos',
    
    // Titres de pages
    projectsTitle: 'Projets',
    projectsSubtitle: 'Gestion de vos projets de désenfumage',
    quickCalcSubtitle: 'Vérification de conformité instantanée',
    searchTitle: 'Recherche',
    searchSubtitle: 'Rechercher dans vos volets',
    exportTitle: 'Export',
    exportSubtitle: 'Exporter vos données',
    aboutTitle: 'À propos',
    aboutSubtitle: 'Informations sur l\'application',
    
    // Header
    headerTitle: 'Gestion et calcul de conformité',
    headerSubtitle: 'de débit de désenfumage',
    
    // Actions générales
    create: 'Créer',
    edit: 'Modifier',
    delete: 'Supprimer',
    save: 'Enregistrer',
    cancel: 'Annuler',
    ok: 'OK',
    yes: 'Oui',
    no: 'Non',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    close: 'Fermer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    
    // Formulaires
    name: 'Nom',
    nameRequired: 'Le nom est requis',
    description: 'Description',
    optional: 'optionnel',
    required: 'requis',
    
    // Projets
    newProject: 'Nouveau projet',
    createProject: 'Créer un projet',
    editProject: 'Modifier le projet',
    deleteProject: 'Supprimer le projet',
    projectName: 'Nom du projet',
    city: 'Ville',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    noProjects: 'Aucun projet',
    noProjectsDesc: 'Créez votre premier projet pour commencer',
    invalidDate: 'Format de date invalide (JJ/MM/AAAA)',
    endDateAfterStart: 'La date de fin doit être après la date de début',
    
    // Prédéfinition de structure
    predefineStructure: 'Prédéfinir la structure',
    predefineStructureDesc: 'Créez automatiquement vos bâtiments, zones et volets',
    buildings: 'Bâtiments',
    zones: 'Zones',
    shutters: 'Volets',
    zonesPerBuilding: 'Zones par bâtiment',
    shuttersPerZone: 'Volets par zone',
    structureOverview: 'Aperçu de la structure',
    structureComplete: 'Structure complète prête à utiliser !',
    
    // Bâtiments
    building: 'Bâtiment',
    buildingName: 'Nom du bâtiment',
    newBuilding: 'Nouveau bâtiment',
    createBuilding: 'Créer un bâtiment',
    editBuilding: 'Modifier le bâtiment',
    deleteBuilding: 'Supprimer le bâtiment',
    noBuildings: 'Aucun bâtiment',
    noBuildingsDesc: 'Créez votre premier bâtiment pour organiser les zones',
    
    // Zones
    zone: 'Zone',
    zoneName: 'Nom de la zone',
    smokeExtractionZone: 'Zone de désenfumage',
    newZone: 'Nouvelle zone',
    createZone: 'Créer une zone',
    editZone: 'Modifier la zone',
    deleteZone: 'Supprimer la zone',
    noZones: 'Aucune zone',
    noZonesDesc: 'Créez votre première zone pour organiser les volets',
    
    // Volets
    shutter: 'Volet',
    shutterName: 'Nom du volet',
    shutterType: 'Type de volet',
    shutterHigh: 'Volet Haut',
    shutterLow: 'Volet Bas',
    newShutter: 'Nouveau volet',
    createShutter: 'Créer un volet',
    editShutter: 'Modifier le volet',
    deleteShutter: 'Supprimer le volet',
    deleteShutterConfirm: 'Êtes-vous sûr de vouloir supprimer le volet',
    noShutters: 'Aucun volet',
    noShuttersDesc: 'Ajoutez des volets pour commencer les mesures',
    modifyFlows: 'Modifier les débits',
    modifyShutterFlows: 'Modifier les débits',
    
    // Débits et mesures
    referenceFlow: 'Débit de référence',
    measuredFlow: 'Débit mesuré',
    deviation: 'Écart',
    calculatedDeviation: 'Écart calculé',
    flowMeasurements: 'Mesures de débit',
    cubicMeterPerHour: 'm³/h',
    positiveOrZeroRequired: 'Valeur positive ou nulle requise',
    
    // Conformité - MODIFIÉ : Textes officiels de la norme NF S61-933 Annexe H
    compliance: 'Conformité',
    complianceResult: 'Résultat de conformité',
    compliancePreview: 'Aperçu de conformité',
    complianceCalculator: 'Calculateur de conformité',
    compliant: 'Fonctionnel',
    acceptable: 'Acceptable',
    nonCompliant: 'Non conforme',
    functionalDesc: 'Un écart inférieur à ±10 % entre les valeurs retenues lors de l\'essai fonctionnel et les valeurs de référence conduit au constat du fonctionnement attendu du système de désenfumage mécanique.',
    acceptableDesc: 'Un écart compris entre ±10 % et ±20 % conduit à signaler cette dérive, par une proposition d\'action corrective à l\'exploitant ou au chef d\'établissement.',
    nonCompliantDesc: 'Un écart supérieur à ±20 % doit conduire à une action corrective obligatoire, la valeur étant jugée non conforme à la mise en service.',
    invalidReference: 'Référence invalide',
    
    // Recherche
    searchPlaceholder: 'Rechercher un volet...',
    searchMinChars: 'Saisissez au moins 2 caractères',
    searching: 'Recherche en cours...',
    searchResults: 'résultats',
    noResults: 'Aucun résultat',
    noResultsDesc: 'Aucun volet ne correspond à votre recherche',
    
    // Recherche hiérarchique
    simpleSearch: 'Recherche simple',
    hierarchicalSearch: 'Recherche hiérarchique',
    selectProject: 'Sélectionner un projet',
    selectBuilding: 'Sélectionner un bâtiment',
    selectZone: 'Sélectionner une zone',
    allZones: 'Toutes les zones',
    allBuildings: 'Tous les bâtiments',
    clearFilters: 'Effacer les filtres',
    searchInSelected: 'Rechercher dans la sélection',
    searchScope: 'Portée de recherche',
    
    // Export - NETTOYÉ : Messages simplifiés et professionnels
    exportCSV: 'Exporter en CSV',
    exportSuccess: 'Export réussi',
    exportError: 'Erreur d\'export',
    exportInProgress: 'Export en cours...',
    noProjectsToExport: 'Aucun projet à exporter',
    noProjectsToExportDesc: 'Créez des projets pour pouvoir les exporter',
    exportDescription: 'Exportez vos données de conformité',
    availableProjects: 'Projets disponibles',
    completeCSVReport: 'Rapport CSV complet',
    detailedDataForSpreadsheet: 'Données détaillées pour tableur',
    localBackup: 'Sauvegarde locale',
    directDownload: 'Téléchargement direct',
    fileSavedInDocuments: 'Fichier sauvegardé',
    
    // À propos - MODIFIÉ : Nouveau titre de l'application
    appDescription: 'Application de gestion des projets de désenfumage avec calcul automatique de conformité des débits',
    developedBy: 'Développé par Aimeric Krol',
    copyright: '© 2025 Siemens. Tous droits réservés.',
    application: 'Application',
    version: 'Version',
    language: 'Langue',
    privacy: 'Confidentialité',
    dataProtection: 'Protection des données',
    nfStandard: 'Norme NF S61-933',
    nfStandardFull: 'NF S61-933 (norme française)',
    consultDocument: 'Consulter le document',
    complianceCalculations: 'Calculs de conformité',
    certifiedAlgorithms: 'Algorithmes certifiés',
    contactDeveloper: 'Contacter le développeur',
    contact: 'Contact',
    legalNote: 'Cette application est un outil d\'aide au calcul. Les résultats doivent être vérifiés par un professionnel qualifié.',
    
    // NOUVEAU : Paramètres
    settings: 'Paramètres',
    settingsTitle: 'Paramètres',
    settingsSubtitle: 'Configuration de l\'application',
    languageAndRegion: 'Langue et région',
    interfaceLanguage: 'Langue de l\'interface',
    dataManagement: 'Gestion des données',
    storageUsed: 'Stockage utilisé',
    exportMyData: 'Exporter mes données',
    exportMyDataDesc: 'Sauvegarder en CSV',
    clearAllData: 'Effacer toutes les données',
    clearAllDataDesc: 'Supprime tous vos projets et volets',
    clearAllDataConfirm: 'Supprimer toutes les données',
    clearAllDataWarning: 'Cette action est irréversible !',
    dataCleared: 'Données supprimées',
    dataClearedDesc: 'Toutes vos données ont été supprimées avec succès.',
    applicationSection: 'Application',
    privacyLocalOnly: 'Données stockées localement uniquement',
    
    // Modales et dialogues
    appUpToDate: 'Application à jour',
    currentVersion: 'Version actuelle',
    selectLanguage: 'Sélectionner la langue',
    privacyTitle: 'Confidentialité',
    unofficialApp: 'Application non officielle',
    unofficialAppDesc: 'Cette application n\'est pas officiellement approuvée par les organismes de certification.',
    dataProtectionTitle: 'Protection des données',
    dataProtectionDesc: 'Toutes vos données restent sur votre appareil.',
    localStorageTitle: 'Stockage local',
    localStorageDesc: 'Aucune donnée n\'est transmise à des serveurs externes.',
    understood: 'Compris',
    
    // Dates et temps
    createdOn: 'Créé le',
    
    // Informations générales
    generalInfo: 'Informations générales',
    remarks: 'Remarques',
    
    // Actions sur les éléments
    saveChanges: 'Enregistrer les modifications',
    clearValues: 'Effacer les valeurs',
    
    // États et statuts
    loadingData: 'Chargement des données...',
    itemNotFound: 'Élément introuvable',
    dataNotFound: 'Données introuvables',
    
    // Mode simplifié
    simplifiedMode: 'Mode simplifié',
    simplifiedModeDesc: 'Ce mode permet une vérification rapide de conformité sans créer de projet. Idéal pour des contrôles ponctuels ou des vérifications sur le terrain.',
    quickVerificationDesc: 'Pour un suivi complet avec historique et rapports, utilisez le mode "Projets".',
    nfStandardDesc: 'Cette norme française définit les critères de conformité pour les systèmes de désenfumage mécanique',
    thisStandardDefines: 'Cette norme définit les critères de conformité',
    deviationLessThan10: 'Écart ≤ ±10%',
    idealForSpotChecks: 'Idéal pour des contrôles ponctuels',
    forCompleteTracking: 'Pour un suivi complet avec historique',
    enterFlowValues: 'Saisissez les valeurs de débit pour voir le résultat',
    
    // Sélection et favoris
    selected: 'sélectionné',
    favorites: 'Favoris',
    
    // Aperçu et prévisualisation
    preview: 'Aperçu',
    
    // Types de volets avec traduction complète
    highShutter: 'Volet Haut',
    lowShutter: 'Volet Bas',
    
    // Boutons d'action spécifiques
    addFirstShutter: 'Ajouter un volet',
    
    // Messages d'état
    enterAtLeast2Chars: 'Saisissez au moins 2 caractères',
    searchInProgress: 'Recherche en cours...',
    noShuttersFound: 'Aucun volet trouvé',
    
    // Textes spécifiques aux captures d'écran
    copied: 'copié',
    all: 'Tous',
    
    // Norme française avec mention
    frenchStandard: 'NF S61-933 (norme française)',
    
    // Traductions approximatives
    approximateTranslations: 'Traductions approximatives',
    translationNote: 'Les traductions sont littérales et peuvent ne pas utiliser les termes techniques exacts de chaque pays.',
    
    // Messages pour le contact et erreurs
    contactDeveloperMessage: 'Pour toute question ou suggestion concernant cette application, veuillez contacter :\n\nAimeric Krol\naimeric.krol@siemens.com',
    pdfOpenError: 'Impossible d\'ouvrir le document PDF. Veuillez réessayer.',
  },
  
  en: {
    // Navigation et onglets
    projects: 'Projects',
    quickCalc: 'Quick Calc',
    search: 'Search',
    export: 'Export',
    about: 'About',
    
    // Titres de pages
    projectsTitle: 'Projects',
    projectsSubtitle: 'Manage your smoke extraction projects',
    quickCalcSubtitle: 'Instant compliance verification',
    searchTitle: 'Search',
    searchSubtitle: 'Search through your shutters',
    exportTitle: 'Export',
    exportSubtitle: 'Export your data',
    aboutTitle: 'About',
    aboutSubtitle: 'Application information',
    
    // Header
    headerTitle: 'Smoke extraction flow',
    headerSubtitle: 'compliance management and calculation',
    
    // Actions générales
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Formulaires
    name: 'Name',
    nameRequired: 'Name is required',
    description: 'Description',
    optional: 'optional',
    required: 'required',
    
    // Projets
    newProject: 'New Project',
    createProject: 'Create Project',
    editProject: 'Edit Project',
    deleteProject: 'Delete Project',
    projectName: 'Project Name',
    city: 'City',
    startDate: 'Start Date',
    endDate: 'End Date',
    noProjects: 'No Projects',
    noProjectsDesc: 'Create your first project to get started',
    invalidDate: 'Invalid date format (DD/MM/YYYY)',
    endDateAfterStart: 'End date must be after start date',
    
    // Prédéfinition de structure
    predefineStructure: 'Predefine Structure',
    predefineStructureDesc: 'Automatically create your buildings, zones and shutters',
    buildings: 'Buildings',
    zones: 'Zones',
    shutters: 'Shutters',
    zonesPerBuilding: 'Zones per building',
    shuttersPerZone: 'Shutters per zone',
    structureOverview: 'Structure Overview',
    structureComplete: 'Complete structure ready to use!',
    
    // Bâtiments
    building: 'Building',
    buildingName: 'Building Name',
    newBuilding: 'New Building',
    createBuilding: 'Create Building',
    editBuilding: 'Edit Building',
    deleteBuilding: 'Delete Building',
    noBuildings: 'No Buildings',
    noBuildingsDesc: 'Create your first building to organize zones',
    
    // Zones
    zone: 'Zone',
    zoneName: 'Zone Name',
    smokeExtractionZone: 'Smoke Extraction Zone',
    newZone: 'New Zone',
    createZone: 'Create Zone',
    editZone: 'Edit Zone',
    deleteZone: 'Delete Zone',
    noZones: 'No Zones',
    noZonesDesc: 'Create your first zone to organize shutters',
    
    // Volets
    shutter: 'Shutter',
    shutterName: 'Shutter Name',
    shutterType: 'Shutter Type',
    shutterHigh: 'High Shutter',
    shutterLow: 'Low Shutter',
    newShutter: 'New Shutter',
    createShutter: 'Create Shutter',
    editShutter: 'Edit Shutter',
    deleteShutter: 'Delete Shutter',
    deleteShutterConfirm: 'Are you sure you want to delete shutter',
    noShutters: 'No Shutters',
    noShuttersDesc: 'Add shutters to start measurements',
    modifyFlows: 'Modify Flows',
    modifyShutterFlows: 'Modify Flows',
    
    // Débits et mesures
    referenceFlow: 'Reference Flow',
    measuredFlow: 'Measured Flow',
    deviation: 'Deviation',
    calculatedDeviation: 'Calculated Deviation',
    flowMeasurements: 'Flow Measurements',
    cubicMeterPerHour: 'm³/h',
    positiveOrZeroRequired: 'Positive or zero value required',
    
    // Conformité - MODIFIÉ : Traductions adaptées des textes officiels
    compliance: 'Compliance',
    complianceResult: 'Compliance Result',
    compliancePreview: 'Compliance Preview',
    complianceCalculator: 'Compliance Calculator',
    compliant: 'Compliant',
    acceptable: 'Acceptable',
    nonCompliant: 'Non-compliant',
    functionalDesc: 'A deviation of less than ±10% between the values retained during the functional test and the reference values leads to confirmation of the expected operation of the mechanical smoke extraction system.',
    acceptableDesc: 'A deviation between ±10% and ±20% leads to reporting this drift, with a proposal for corrective action to the operator or facility manager.',
    nonCompliantDesc: 'A deviation greater than ±20% must lead to mandatory corrective action, the value being deemed non-compliant with commissioning.',
    invalidReference: 'Invalid Reference',
    
    // Recherche
    searchPlaceholder: 'Search for a shutter...',
    searchMinChars: 'Enter at least 2 characters',
    searching: 'Searching...',
    searchResults: 'results',
    noResults: 'No Results',
    noResultsDesc: 'No shutters match your search',
    
    // Recherche hiérarchique
    simpleSearch: 'Simple Search',
    hierarchicalSearch: 'Hierarchical Search',
    selectProject: 'Select a project',
    selectBuilding: 'Select a building',
    selectZone: 'Select a zone',
    allZones: 'All zones',
    allBuildings: 'All buildings',
    clearFilters: 'Clear filters',
    searchInSelected: 'Search in selection',
    searchScope: 'Search scope',
    
    // Export - NETTOYÉ
    exportCSV: 'Export to CSV',
    exportSuccess: 'Export Successful',
    exportError: 'Export Error',
    exportInProgress: 'Exporting...',
    noProjectsToExport: 'No Projects to Export',
    noProjectsToExportDesc: 'Create projects to be able to export them',
    exportDescription: 'Export your compliance data',
    availableProjects: 'Available Projects',
    completeCSVReport: 'Complete CSV Report',
    detailedDataForSpreadsheet: 'Detailed data for spreadsheet',
    localBackup: 'Local Backup',
    directDownload: 'Direct download',
    fileSavedInDocuments: 'File saved',
    
    // À propos - MODIFIÉ : Nouveau titre de l'application
    appDescription: 'Smoke extraction project management application with automatic flow compliance calculation',
    developedBy: 'Developed by Aimeric Krol',
    copyright: '© 2025 Siemens. All rights reserved.',
    application: 'Application',
    version: 'Version',
    language: 'Language',
    privacy: 'Privacy',
    dataProtection: 'Data Protection',
    nfStandard: 'NF S61-933 Standard',
    nfStandardFull: 'NF S61-933 (French standard)',
    consultDocument: 'View Document',
    complianceCalculations: 'Compliance Calculations',
    certifiedAlgorithms: 'Certified Algorithms',
    contactDeveloper: 'Contact Developer',
    contact: 'Contact',
    legalNote: 'This application is a calculation aid tool. Results must be verified by a qualified professional.',
    
    // NOUVEAU : Paramètres
    settings: 'Settings',
    settingsTitle: 'Settings',
    settingsSubtitle: 'Application configuration',
    languageAndRegion: 'Language and region',
    interfaceLanguage: 'Interface language',
    dataManagement: 'Data management',
    storageUsed: 'Storage used',
    exportMyData: 'Export my data',
    exportMyDataDesc: 'Save as CSV',
    clearAllData: 'Clear all data',
    clearAllDataDesc: 'Delete all your projects and shutters',
    clearAllDataConfirm: 'Clear all data',
    clearAllDataWarning: 'This action is irreversible!',
    dataCleared: 'Data cleared',
    dataClearedDesc: 'All your data has been successfully deleted.',
    applicationSection: 'Application',
    privacyLocalOnly: 'Data stored locally only',
    
    // Modales et dialogues
    appUpToDate: 'App Up to Date',
    currentVersion: 'Current Version',
    selectLanguage: 'Select Language',
    privacyTitle: 'Privacy',
    unofficialApp: 'Unofficial Application',
    unofficialAppDesc: 'This application is not officially approved by certification bodies.',
    dataProtectionTitle: 'Data Protection',
    dataProtectionDesc: 'All your data remains on your device.',
    localStorageTitle: 'Local Storage',
    localStorageDesc: 'No data is transmitted to external servers.',
    understood: 'Understood',
    
    // Dates et temps
    createdOn: 'Created on',
    
    // Informations générales
    generalInfo: 'General Information',
    remarks: 'Remarks',
    
    // Actions sur les éléments
    saveChanges: 'Save Changes',
    clearValues: 'Clear Values',
    
    // États et statuts
    loadingData: 'Loading data...',
    itemNotFound: 'Item Not Found',
    dataNotFound: 'Data not found',
    
    // Mode simplifié
    simplifiedMode: 'Simplified Mode',
    simplifiedModeDesc: 'This mode allows quick compliance verification without creating a project. Ideal for spot checks or field verifications.',
    quickVerificationDesc: 'For complete tracking with history and reports, use "Projects" mode.',
    nfStandardDesc: 'This French standard defines compliance criteria for mechanical smoke extraction systems',
    thisStandardDefines: 'This standard defines compliance criteria',
    deviationLessThan10: 'Deviation ≤ ±10%',
    idealForSpotChecks: 'Ideal for spot checks',
    forCompleteTracking: 'For complete tracking with history',
    enterFlowValues: 'Enter flow values to see the result',
    
    // Sélection et favoris
    selected: 'selected',
    favorites: 'Favorites',
    
    // Aperçu et prévisualisation
    preview: 'Preview',
    
    // Types de volets avec traduction complète
    highShutter: 'High Shutter',
    lowShutter: 'Low Shutter',
    
    // Boutons d'action spécifiques
    addFirstShutter: 'Add Shutter',
    
    // Messages d'état
    enterAtLeast2Chars: 'Enter at least 2 characters',
    searchInProgress: 'Searching...',
    noShuttersFound: 'No shutters found',
    
    // Textes spécifiques aux captures d'écran
    copied: 'copied',
    all: 'All',
    
    // Norme française avec mention
    frenchStandard: 'NF S61-933 (French standard)',
    
    // Traductions approximatives
    approximateTranslations: 'Approximate Translations',
    translationNote: 'Translations are literal and may not use the exact technical terms of each country.',
    
    // Messages pour le contact et erreurs
    contactDeveloperMessage: 'For any questions or suggestions regarding this application, please contact:\n\nAimeric Krol\naimeric.krol@siemens.com',
    pdfOpenError: 'Unable to open PDF document. Please try again.',
  },
  
  es: {
    // Navigation et onglets
    projects: 'Proyectos',
    quickCalc: 'Cálculo Rápido',
    search: 'Buscar',
    export: 'Exportar',
    about: 'Acerca de',
    
    // Titres de pages
    projectsTitle: 'Proyectos',
    projectsSubtitle: 'Gestiona tus proyectos de extracción de humos',
    quickCalcSubtitle: 'Verificación instantánea de cumplimiento',
    searchTitle: 'Buscar',
    searchSubtitle: 'Buscar en tus compuertas',
    exportTitle: 'Exportar',
    exportSubtitle: 'Exportar tus datos',
    aboutTitle: 'Acerca de',
    aboutSubtitle: 'Información de la aplicación',
    
    // Header
    headerTitle: 'Gestión y cálculo de cumplimiento',
    headerSubtitle: 'de caudal de extracción de humos',
    
    // Actions générales
    create: 'Crear',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
    ok: 'OK',
    yes: 'Sí',
    no: 'No',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    
    // Formulaires
    name: 'Nombre',
    nameRequired: 'El nombre es requerido',
    description: 'Descripción',
    optional: 'opcional',
    required: 'requerido',
    
    // Projets
    newProject: 'Nuevo Proyecto',
    createProject: 'Crear Proyecto',
    editProject: 'Editar Proyecto',
    deleteProject: 'Eliminar Proyecto',
    projectName: 'Nombre del Proyecto',
    city: 'Ciudad',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    noProjects: 'Sin Proyectos',
    noProjectsDesc: 'Crea tu primer proyecto para comenzar',
    invalidDate: 'Formato de fecha inválido (DD/MM/AAAA)',
    endDateAfterStart: 'La fecha de fin debe ser posterior a la fecha de inicio',
    
    // Prédéfinition de structure
    predefineStructure: 'Predefinir Estructura',
    predefineStructureDesc: 'Crea automáticamente tus edificios, zonas y compuertas',
    buildings: 'Edificios',
    zones: 'Zonas',
    shutters: 'Compuertas',
    zonesPerBuilding: 'Zonas por edificio',
    shuttersPerZone: 'Compuertas por zona',
    structureOverview: 'Vista General de la Estructura',
    structureComplete: '¡Estructura completa lista para usar!',
    
    // Bâtiments
    building: 'Edificio',
    buildingName: 'Nombre del Edificio',
    newBuilding: 'Nuevo Edificio',
    createBuilding: 'Crear Edificio',
    editBuilding: 'Editar Edificio',
    deleteBuilding: 'Eliminar Edificio',
    noBuildings: 'Sin Edificios',
    noBuildingsDesc: 'Crea tu primer edificio para organizar las zonas',
    
    // Zones
    zone: 'Zona',
    zoneName: 'Nombre de la Zona',
    smokeExtractionZone: 'Zona de Extracción de Humos',
    newZone: 'Nueva Zona',
    createZone: 'Crear Zona',
    editZone: 'Editar Zona',
    deleteZone: 'Eliminar Zona',
    noZones: 'Sin Zonas',
    noZonesDesc: 'Crea tu primera zona para organizar las compuertas',
    
    // Volets
    shutter: 'Compuerta',
    shutterName: 'Nombre de la Compuerta',
    shutterType: 'Tipo de Compuerta',
    shutterHigh: 'Compuerta Alta',
    shutterLow: 'Compuerta Baja',
    newShutter: 'Nueva Compuerta',
    createShutter: 'Crear Compuerta',
    editShutter: 'Editar Compuerta',
    deleteShutter: 'Eliminar Compuerta',
    deleteShutterConfirm: '¿Estás seguro de que quieres eliminar la compuerta',
    noShutters: 'Sin Compuertas',
    noShuttersDesc: 'Añade compuertas para comenzar las mediciones',
    modifyFlows: 'Modificar Caudales',
    modifyShutterFlows: 'Modificar Caudales',
    
    // Débits et mesures
    referenceFlow: 'Caudal de Referencia',
    measuredFlow: 'Caudal Medido',
    deviation: 'Desviación',
    calculatedDeviation: 'Desviación Calculada',
    flowMeasurements: 'Mediciones de Caudal',
    cubicMeterPerHour: 'm³/h',
    positiveOrZeroRequired: 'Se requiere valor positivo o cero',
    
    // Conformité - MODIFIÉ : Traductions adaptées des textes officiels
    compliance: 'Cumplimiento',
    complianceResult: 'Resultado de Cumplimiento',
    compliancePreview: 'Vista Previa de Cumplimiento',
    complianceCalculator: 'Calculadora de Cumplimiento',
    compliant: 'Conforme',
    acceptable: 'Aceptable',
    nonCompliant: 'No conforme',
    functionalDesc: 'Una desviación inferior a ±10% entre los valores retenidos durante la prueba funcional y los valores de referencia conduce a la constatación del funcionamiento esperado del sistema de extracción de humos mecánico.',
    acceptableDesc: 'Una desviación entre ±10% y ±20% conduce a señalar esta deriva, mediante una propuesta de acción correctiva al operador o al jefe del establecimiento.',
    nonCompliantDesc: 'Una desviación superior a ±20% debe conducir a una acción correctiva obligatoria, siendo el valor considerado no conforme con la puesta en servicio.',
    invalidReference: 'Referencia Inválida',
    
    // Recherche
    searchPlaceholder: 'Buscar una compuerta...',
    searchMinChars: 'Ingresa al menos 2 caracteres',
    searching: 'Buscando...',
    searchResults: 'resultados',
    noResults: 'Sin Resultados',
    noResultsDesc: 'Ninguna compuerta coincide con tu búsqueda',
    
    // Recherche hiérarchique
    simpleSearch: 'Búsqueda Simple',
    hierarchicalSearch: 'Búsqueda Jerárquica',
    selectProject: 'Seleccionar un proyecto',
    selectBuilding: 'Seleccionar un edificio',
    selectZone: 'Seleccionar una zona',
    allZones: 'Todas las zonas',
    allBuildings: 'Todos los edificios',
    clearFilters: 'Limpiar filtros',
    searchInSelected: 'Buscar en selección',
    searchScope: 'Alcance de búsqueda',
    
    // Export - NETTOYÉ
    exportCSV: 'Exportar a CSV',
    exportSuccess: 'Exportación Exitosa',
    exportError: 'Error de Exportación',
    exportInProgress: 'Exportando...',
    noProjectsToExport: 'Sin Proyectos para Exportar',
    noProjectsToExportDesc: 'Crea proyectos para poder exportarlos',
    exportDescription: 'Exporta tus datos de cumplimiento',
    availableProjects: 'Proyectos Disponibles',
    completeCSVReport: 'Informe CSV Completo',
    detailedDataForSpreadsheet: 'Datos detallados para hoja de cálculo',
    localBackup: 'Respaldo Local',
    directDownload: 'Descarga directa',
    fileSavedInDocuments: 'Archivo guardado',
    
    // À propos - MODIFIÉ : Nouveau titre de l'application
    appDescription: 'Aplicación de gestión de proyectos de extracción de humos con cálculo automático de cumplimiento de caudales',
    developedBy: 'Desarrollado por Aimeric Krol',
    copyright: '© 2025 Siemens. Todos los derechos reservados.',
    application: 'Aplicación',
    version: 'Versión',
    language: 'Idioma',
    privacy: 'Privacidad',
    dataProtection: 'Protección de Datos',
    nfStandard: 'Norma NF S61-933',
    nfStandardFull: 'NF S61-933 (norma francesa)',
    consultDocument: 'Ver Documento',
    complianceCalculations: 'Cálculos de Cumplimiento',
    certifiedAlgorithms: 'Algoritmos Certificados',
    contactDeveloper: 'Contactar Desarrollador',
    contact: 'Contacto',
    legalNote: 'Esta aplicación es una herramienta de ayuda al cálculo. Los resultados deben ser verificados por un profesional calificado.',
    
    // NOUVEAU : Paramètres
    settings: 'Configuración',
    settingsTitle: 'Configuración',
    settingsSubtitle: 'Configuración de la aplicación',
    languageAndRegion: 'Idioma y región',
    interfaceLanguage: 'Idioma de la interfaz',
    dataManagement: 'Gestión de datos',
    storageUsed: 'Almacenamiento usado',
    exportMyData: 'Exportar mis datos',
    exportMyDataDesc: 'Guardar como CSV',
    clearAllData: 'Borrar todos los datos',
    clearAllDataDesc: 'Elimina todos tus proyectos y compuertas',
    clearAllDataConfirm: 'Borrar todos los datos',
    clearAllDataWarning: '¡Esta acción es irreversible!',
    dataCleared: 'Datos eliminados',
    dataClearedDesc: 'Todos tus datos han sido eliminados exitosamente.',
    applicationSection: 'Aplicación',
    privacyLocalOnly: 'Datos almacenados solo localmente',
    
    // Modales et dialogues
    appUpToDate: 'Aplicación Actualizada',
    currentVersion: 'Versión Actual',
    selectLanguage: 'Seleccionar Idioma',
    privacyTitle: 'Privacidad',
    unofficialApp: 'Aplicación No Oficial',
    unofficialAppDesc: 'Esta aplicación no está oficialmente aprobada por organismos de certificación.',
    dataProtectionTitle: 'Protección de Datos',
    dataProtectionDesc: 'Todos tus datos permanecen en tu dispositivo.',
    localStorageTitle: 'Almacenamiento Local',
    localStorageDesc: 'No se transmiten datos a servidores externos.',
    understood: 'Entendido',
    
    // Dates et temps
    createdOn: 'Creado el',
    
    // Informations générales
    generalInfo: 'Información General',
    remarks: 'Observaciones',
    
    // Actions sur les éléments
    saveChanges: 'Guardar Cambios',
    clearValues: 'Limpiar Valores',
    
    // États et statuts
    loadingData: 'Cargando datos...',
    itemNotFound: 'Elemento No Encontrado',
    dataNotFound: 'Datos no encontrados',
    
    // Mode simplifié
    simplifiedMode: 'Modo Simplificado',
    simplifiedModeDesc: 'Este modo permite una verificación rápida de cumplimiento sin crear un proyecto. Ideal para controles puntuales o verificaciones en campo.',
    quickVerificationDesc: 'Para un seguimiento completo con historial e informes, usa el modo "Proyectos".',
    nfStandardDesc: 'Esta norma francesa define los criterios de cumplimiento para sistemas de extracción de humos mecánicos',
    thisStandardDefines: 'Esta norma define los criterios de cumplimiento',
    deviationLessThan10: 'Desviación ≤ ±10%',
    idealForSpotChecks: 'Ideal para controles puntuales',
    forCompleteTracking: 'Para seguimiento completo con historial',
    enterFlowValues: 'Ingresa los valores de caudal para ver el resultado',
    
    // Sélection et favoris
    selected: 'seleccionado',
    favorites: 'Favoritos',
    
    // Aperçu et prévisualisation
    preview: 'Vista Previa',
    
    // Types de volets avec traduction complète
    highShutter: 'Compuerta Alta',
    lowShutter: 'Compuerta Baja',
    
    // Boutons d'action spécifiques
    addFirstShutter: 'Añadir Compuerta',
    
    // Messages d'état
    enterAtLeast2Chars: 'Ingresa al menos 2 caracteres',
    searchInProgress: 'Buscando...',
    noShuttersFound: 'No se encontraron compuertas',
    
    // Textes spécifiques aux captures d'écran
    copied: 'copiado',
    all: 'Todos',
    
    // Norme française avec mention
    frenchStandard: 'NF S61-933 (norma francesa)',
    
    // Traductions approximatives
    approximateTranslations: 'Traducciones Aproximadas',
    translationNote: 'Las traducciones son literales y pueden no usar los términos técnicos exactos de cada país.',
    
    // Messages pour le contact et erreurs
    contactDeveloperMessage: 'Para cualquier pregunta o sugerencia sobre esta aplicación, por favor contacta:\n\nAimeric Krol\naimeric.krol@siemens.com',
    pdfOpenError: 'No se puede abrir el documento PDF. Por favor, inténtalo de nuevo.',
  },
  
  it: {
    // Navigation et onglets
    projects: 'Progetti',
    quickCalc: 'Calcolo Rapido',
    search: 'Cerca',
    export: 'Esporta',
    about: 'Informazioni',
    
    // Titres de pages
    projectsTitle: 'Progetti',
    projectsSubtitle: 'Gestisci i tuoi progetti di estrazione fumi',
    quickCalcSubtitle: 'Verifica istantanea di conformità',
    searchTitle: 'Cerca',
    searchSubtitle: 'Cerca nelle tue serrande',
    exportTitle: 'Esporta',
    exportSubtitle: 'Esporta i tuoi dati',
    aboutTitle: 'Informazioni',
    aboutSubtitle: 'Informazioni sull\'applicazione',
    
    // Header
    headerTitle: 'Gestione e calcolo di conformità',
    headerSubtitle: 'di portata di estrazione fumi',
    
    // Actions générales
    create: 'Crea',
    edit: 'Modifica',
    delete: 'Elimina',
    save: 'Salva',
    cancel: 'Annulla',
    ok: 'OK',
    yes: 'Sì',
    no: 'No',
    back: 'Indietro',
    next: 'Avanti',
    previous: 'Precedente',
    close: 'Chiudi',
    loading: 'Caricamento...',
    error: 'Errore',
    success: 'Successo',
    
    // Formulaires
    name: 'Nome',
    nameRequired: 'Il nome è richiesto',
    description: 'Descrizione',
    optional: 'opzionale',
    required: 'richiesto',
    
    // Projets
    newProject: 'Nuovo Progetto',
    createProject: 'Crea Progetto',
    editProject: 'Modifica Progetto',
    deleteProject: 'Elimina Progetto',
    projectName: 'Nome del Progetto',
    city: 'Città',
    startDate: 'Data di Inizio',
    endDate: 'Data di Fine',
    noProjects: 'Nessun Progetto',
    noProjectsDesc: 'Crea il tuo primo progetto per iniziare',
    invalidDate: 'Formato data non valido (GG/MM/AAAA)',
    endDateAfterStart: 'La data di fine deve essere successiva alla data di inizio',
    
    // Prédéfinition de structure
    predefineStructure: 'Predefinisci Struttura',
    predefineStructureDesc: 'Crea automaticamente i tuoi edifici, zone e serrande',
    buildings: 'Edifici',
    zones: 'Zone',
    shutters: 'Serrande',
    zonesPerBuilding: 'Zone per edificio',
    shuttersPerZone: 'Serrande per zona',
    structureOverview: 'Panoramica della Struttura',
    structureComplete: 'Struttura completa pronta all\'uso!',
    
    // Bâtiments
    building: 'Edificio',
    buildingName: 'Nome dell\'Edificio',
    newBuilding: 'Nuovo Edificio',
    createBuilding: 'Crea Edificio',
    editBuilding: 'Modifica Edificio',
    deleteBuilding: 'Elimina Edificio',
    noBuildings: 'Nessun Edificio',
    noBuildingsDesc: 'Crea il tuo primo edificio per organizzare le zone',
    
    // Zones
    zone: 'Zona',
    zoneName: 'Nome della Zona',
    smokeExtractionZone: 'Zona di Estrazione Fumi',
    newZone: 'Nuova Zona',
    createZone: 'Crea Zona',
    editZone: 'Modifica Zona',
    deleteZone: 'Elimina Zona',
    noZones: 'Nessuna Zona',
    noZonesDesc: 'Crea la tua prima zona per organizzare le serrande',
    
    // Volets
    shutter: 'Serranda',
    shutterName: 'Nome della Serranda',
    shutterType: 'Tipo di Serranda',
    shutterHigh: 'Serranda Alta',
    shutterLow: 'Serranda Bassa',
    newShutter: 'Nuova Serranda',
    createShutter: 'Crea Serranda',
    editShutter: 'Modifica Serranda',
    deleteShutter: 'Elimina Serranda',
    deleteShutterConfirm: 'Sei sicuro di voler eliminare la serranda',
    noShutters: 'Nessuna Serranda',
    noShuttersDesc: 'Aggiungi serrande per iniziare le misurazioni',
    modifyFlows: 'Modifica Portate',
    modifyShutterFlows: 'Modifica Portate',
    
    // Débits et mesures
    referenceFlow: 'Portata di Riferimento',
    measuredFlow: 'Portata Misurata',
    deviation: 'Deviazione',
    calculatedDeviation: 'Deviazione Calcolata',
    flowMeasurements: 'Misurazioni di Portata',
    cubicMeterPerHour: 'm³/h',
    positiveOrZeroRequired: 'Valore positivo o zero richiesto',
    
    // Conformité - MODIFIÉ : Traductions adaptées des textes officiels
    compliance: 'Conformità',
    complianceResult: 'Risultato di Conformità',
    compliancePreview: 'Anteprima di Conformità',
    complianceCalculator: 'Calcolatore di Conformità',
    compliant: 'Conforme',
    acceptable: 'Accettabile',
    nonCompliant: 'Non conforme',
    functionalDesc: 'Una deviazione inferiore a ±10% tra i valori mantenuti durante il test funzionale e i valori di riferimento porta alla constatazione del funzionamento atteso del sistema di estrazione fumi meccanico.',
    acceptableDesc: 'Una deviazione compresa tra ±10% e ±20% porta a segnalare questa deriva, con una proposta di azione correttiva all\'operatore o al responsabile dello stabilimento.',
    nonCompliantDesc: 'Una deviazione superiore a ±20% deve portare a un\'azione correttiva obbligatoria, il valore essendo giudicato non conforme alla messa in servizio.',
    invalidReference: 'Riferimento Non Valido',
    
    // Recherche
    searchPlaceholder: 'Cerca una serranda...',
    searchMinChars: 'Inserisci almeno 2 caratteri',
    searching: 'Ricerca in corso...',
    searchResults: 'risultati',
    noResults: 'Nessun Risultato',
    noResultsDesc: 'Nessuna serranda corrisponde alla tua ricerca',
    
    // Recherche hiérarchique
    simpleSearch: 'Ricerca Semplice',
    hierarchicalSearch: 'Ricerca Gerarchica',
    selectProject: 'Seleziona un progetto',
    selectBuilding: 'Seleziona un edificio',
    selectZone: 'Seleziona una zona',
    allZones: 'Tutte le zone',
    allBuildings: 'Tutti gli edifici',
    clearFilters: 'Cancella filtri',
    searchInSelected: 'Cerca nella selezione',
    searchScope: 'Ambito di ricerca',
    
    // Export - NETTOYÉ
    exportCSV: 'Esporta in CSV',
    exportSuccess: 'Esportazione Riuscita',
    exportError: 'Errore di Esportazione',
    exportInProgress: 'Esportazione in corso...',
    noProjectsToExport: 'Nessun Progetto da Esportare',
    noProjectsToExportDesc: 'Crea progetti per poterli esportare',
    exportDescription: 'Esporta i tuoi dati di conformità',
    availableProjects: 'Progetti Disponibili',
    completeCSVReport: 'Rapporto CSV Completo',
    detailedDataForSpreadsheet: 'Dati dettagliati per foglio di calcolo',
    localBackup: 'Backup Locale',
    directDownload: 'Download diretto',
    fileSavedInDocuments: 'File salvato',
    
    // À propos - MODIFIÉ : Nouveau titre de l'application
    appDescription: 'Applicazione di gestione progetti di estrazione fumi con calcolo automatico di conformità delle portate',
    developedBy: 'Sviluppato da Aimeric Krol',
    copyright: '© 2025 Siemens. Tutti i diritti riservati.',
    application: 'Applicazione',
    version: 'Versione',
    language: 'Lingua',
    privacy: 'Privacy',
    dataProtection: 'Protezione dei Dati',
    nfStandard: 'Norma NF S61-933',
    nfStandardFull: 'NF S61-933 (norma francese)',
    consultDocument: 'Visualizza Documento',
    complianceCalculations: 'Calcoli di Conformità',
    certifiedAlgorithms: 'Algoritmi Certificati',
    contactDeveloper: 'Contatta Sviluppatore',
    contact: 'Contatto',
    legalNote: 'Questa applicazione è uno strumento di aiuto al calcolo. I risultati devono essere verificati da un professionista qualificato.',
    
    // NOUVEAU : Paramètres
    settings: 'Impostazioni',
    settingsTitle: 'Impostazioni',
    settingsSubtitle: 'Configurazione dell\'applicazione',
    languageAndRegion: 'Lingua e regione',
    interfaceLanguage: 'Lingua dell\'interfaccia',
    dataManagement: 'Gestione dati',
    storageUsed: 'Spazio utilizzato',
    exportMyData: 'Esporta i miei dati',
    exportMyDataDesc: 'Salva come CSV',
    clearAllData: 'Cancella tutti i dati',
    clearAllDataDesc: 'Elimina tutti i tuoi progetti e serrande',
    clearAllDataConfirm: 'Cancella tutti i dati',
    clearAllDataWarning: 'Questa azione è irreversibile!',
    dataCleared: 'Dati cancellati',
    dataClearedDesc: 'Tutti i tuoi dati sono stati eliminati con successo.',
    applicationSection: 'Applicazione',
    privacyLocalOnly: 'Dati memorizzati solo localmente',
    
    // Modales et dialogues
    appUpToDate: 'App Aggiornata',
    currentVersion: 'Versione Corrente',
    selectLanguage: 'Seleziona Lingua',
    privacyTitle: 'Privacy',
    unofficialApp: 'Applicazione Non Ufficiale',
    unofficialAppDesc: 'Questa applicazione non è ufficialmente approvata da organismi di certificazione.',
    dataProtectionTitle: 'Protezione dei Dati',
    dataProtectionDesc: 'Tutti i tuoi dati rimangono sul tuo dispositivo.',
    localStorageTitle: 'Archiviazione Locale',
    localStorageDesc: 'Nessun dato viene trasmesso a server esterni.',
    understood: 'Compreso',
    
    // Dates et temps
    createdOn: 'Creato il',
    
    // Informations générales
    generalInfo: 'Informazioni Generali',
    remarks: 'Osservazioni',
    
    // Actions sur les éléments
    saveChanges: 'Salva Modifiche',
    clearValues: 'Cancella Valori',
    
    // États et statuts
    loadingData: 'Caricamento dati...',
    itemNotFound: 'Elemento Non Trovato',
    dataNotFound: 'Dati non trovati',
    
    // Mode simplifié
    simplifiedMode: 'Modalità Semplificata',
    simplifiedModeDesc: 'Questa modalità consente una verifica rapida di conformità senza creare un progetto. Ideale per controlli puntuali o verifiche sul campo.',
    quickVerificationDesc: 'Per un monitoraggio completo con cronologia e report, usa la modalità "Progetti".',
    nfStandardDesc: 'Questa norma francese definisce i criteri di conformità per sistemi di estrazione fumi meccanici',
    thisStandardDefines: 'Questa norma definisce i criteri di conformità',
    deviationLessThan10: 'Deviazione ≤ ±10%',
    idealForSpotChecks: 'Ideale per controlli puntuali',
    forCompleteTracking: 'Per monitoraggio completo con cronologia',
    enterFlowValues: 'Inserisci i valori di portata per vedere il risultato',
    
    // Sélection et favoris
    selected: 'selezionato',
    favorites: 'Preferiti',
    
    // Aperçu et prévisualisation
    preview: 'Anteprima',
    
    // Types de volets avec traduction complète
    highShutter: 'Serranda Alta',
    lowShutter: 'Serranda Bassa',
    
    // Boutons d'action spécifiques
    addFirstShutter: 'Aggiungi Serranda',
    
    // Messages d'état
    enterAtLeast2Chars: 'Inserisci almeno 2 caratteri',
    searchInProgress: 'Ricerca in corso...',
    noShuttersFound: 'Nessuna serranda trovata',
    
    // Textes spécifiques aux captures d'écran
    copied: 'copiato',
    all: 'Tutti',
    
    // Norme française avec mention
    frenchStandard: 'NF S61-933 (norma francese)',
    
    // Traductions approximatives
    approximateTranslations: 'Traduzioni Approssimative',
    translationNote: 'Le traduzioni sono letterali e potrebbero non utilizzare i termini tecnici esatti di ogni paese.',
    
    // Messages pour le contact et erreurs
    contactDeveloperMessage: 'Per qualsiasi domanda o suggerimento riguardo questa applicazione, contatta:\n\nAimeric Krol\naimeric.krol@siemens.com',
    pdfOpenError: 'Impossibile aprire il documento PDF. Riprova.',
  }
};

let currentLanguage: SupportedLanguage = 'fr';

export function setLanguage(lang: SupportedLanguage) {
  currentLanguage = lang;
}

export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function getStrings(): LanguageStrings {
  return translations[currentLanguage];
}

export function initializeLanguage() {
  // Par défaut en français
  currentLanguage = 'fr';
}

export function getLanguageOptions() {
  return [
    { code: 'fr' as SupportedLanguage, name: 'Français', flag: '🇫🇷' },
    { code: 'en' as SupportedLanguage, name: 'English', flag: '🇬🇧' },
    { code: 'es' as SupportedLanguage, name: 'Español', flag: '🇪🇸' },
    { code: 'it' as SupportedLanguage, name: 'Italiano', flag: '🇮🇹' },
  ];
}