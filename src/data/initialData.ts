import {
  User,
  Sample,
  ParameterConfig,
  AnalysisMethod,
  AnalysisResult,
  Instrument,
  CalibrationRecord,
  Reagent,
  QualityControlRecord,
  Report,
  AuditLog,
  AnalysisRequest
} from '../types/lims';

export const initialUsers: User[] = [
  {
    id: 'u-1',
    name: 'Dr. Sidi Mohamed Ould Ely',
    email: 'sidi.ely@imrop.mr',
    role: 'Administrateur',
    lab: 'Laboratoire de Chimie',
    active: true,
    password: 'admin123'
  },
  {
    id: 'u-2',
    name: 'Brahim Ould Fall',
    email: 'brahim.fall@imrop.mr',
    role: 'Responsable du laboratoire',
    lab: 'Laboratoire de Chimie',
    active: true,
    password: 'lab2026'
  },
  {
    id: 'u-3',
    name: 'Aicha Mint Lemine',
    email: 'aicha.lemine@imrop.mr',
    role: 'Analyste',
    lab: 'Laboratoire de Chimie',
    active: true,
    password: 'analyst2026'
  },
  {
    id: 'u-4',
    name: 'Mohamed Abdallahi',
    email: 'm.abdallahi@imrop.mr',
    role: 'Technicien',
    lab: 'Laboratoire d\'Analyses environnementales',
    active: true,
    password: 'tech2026'
  },
  {
    id: 'u-5',
    name: 'Khadijetou Ba',
    email: 'khadijetou.ba@imrop.mr',
    role: 'Consultation',
    lab: 'Laboratoire de Biologie',
    active: true,
    password: 'consult2026'
  }
];

export const initialParameters: ParameterConfig[] = [
  {
    id: 'p-1',
    code: 'pH',
    name: 'pH',
    lab: 'Laboratoire de Chimie',
    unit: 'unité pH',
    defaultMethodCode: 'CH-PH-001',
    minLimit: 6.5,
    maxLimit: 8.5,
    description: 'Potentiel Hydrogène mesuré à température contrôlée'
  },
  {
    id: 'p-2',
    code: 'SAL',
    name: 'Salinité',
    lab: 'Laboratoire de Chimie',
    unit: 'PSU',
    defaultMethodCode: 'CH-SAL-002',
    minLimit: 30,
    maxLimit: 38,
    description: 'Salinité par réfractométrie / conductimétrie'
  },
  {
    id: 'p-3',
    code: 'COND',
    name: 'Conductivité',
    lab: 'Laboratoire de Chimie',
    unit: 'mS/cm',
    defaultMethodCode: 'CH-COND-003',
    minLimit: 40,
    maxLimit: 60,
    description: 'Conductivité électrique spécifique à 25°C'
  },
  {
    id: 'p-4',
    code: 'O2',
    name: 'Oxygène dissous',
    lab: 'Laboratoire d\'Analyses environnementales',
    unit: 'mg/L',
    defaultMethodCode: 'ENV-O2-001',
    minLimit: 4.0,
    maxLimit: 12.0,
    description: 'Oxygène dissous dans la colonne d\'eau'
  },
  {
    id: 'p-5',
    code: 'NO3',
    name: 'Nitrates (NO3-)',
    lab: 'Laboratoire de Chimie',
    unit: 'mg/L',
    defaultMethodCode: 'CH-NUT-004',
    minLimit: 0,
    maxLimit: 10,
    description: 'Nutriments - Nitrates'
  },
  {
    id: 'p-6',
    code: 'PO4',
    name: 'Phosphates (PO4 3-)',
    lab: 'Laboratoire de Chimie',
    unit: 'mg/L',
    defaultMethodCode: 'CH-NUT-005',
    minLimit: 0,
    maxLimit: 2,
    description: 'Nutriments - Phosphates réactifs'
  },
  {
    id: 'p-7',
    code: 'MES',
    name: 'Matières en suspension',
    lab: 'Laboratoire d\'Analyses environnementales',
    unit: 'mg/L',
    defaultMethodCode: 'ENV-MES-002',
    minLimit: 0,
    maxLimit: 50,
    description: 'Matières en suspension totales après filtration 0.45µm'
  },
  {
    id: 'p-8',
    code: 'MET-PB',
    name: 'Plomb (Pb)',
    lab: 'Laboratoire de Chimie',
    unit: 'mg/kg',
    defaultMethodCode: 'CH-MET-001',
    minLimit: 0,
    maxLimit: 1.5,
    description: 'Métaux lourds dans les chair de poissons/mollusques'
  }
];

export const initialMethods: AnalysisMethod[] = [
  {
    id: 'm-1',
    code: 'CH-PH-001',
    name: 'Détermination électrométrique du pH',
    parameterName: 'pH',
    description: 'Mesure directe du pH par électrode de verre combinée compensée en température selon procédure interne IMROP v2',
    normReference: 'ISO 10523:2008 (Adaptée IMROP)',
    version: '2.0',
    creationDate: '2024-01-15',
    revisionDate: '2026-01-10',
    documentRef: 'DOC-LAB-CH-001.pdf',
    lab: 'Laboratoire de Chimie',
    status: 'Active'
  },
  {
    id: 'm-2',
    code: 'CH-SAL-002',
    name: 'Mesure de la salinité par conductimétrie',
    parameterName: 'Salinité',
    description: 'Détermination de la salinité pratique de l\'eau de mer',
    normReference: 'Unesco Tech. Papers No 45',
    version: '1.2',
    creationDate: '2023-06-20',
    revisionDate: '2025-11-05',
    documentRef: 'DOC-LAB-CH-002.pdf',
    lab: 'Laboratoire de Chimie',
    status: 'Active'
  },
  {
    id: 'm-3',
    code: 'ENV-O2-001',
    name: 'Dosage de l\'oxygène dissous par sonde optique',
    parameterName: 'Oxygène dissous',
    description: 'Mesure in-situ ou au laboratoire par luminescence optique',
    normReference: 'ISO 17289:2014',
    version: '1.0',
    creationDate: '2024-03-01',
    revisionDate: '2026-02-12',
    documentRef: 'DOC-LAB-ENV-001.pdf',
    lab: 'Laboratoire d\'Analyses environnementales',
    status: 'Active'
  }
];

export const initialInstruments: Instrument[] = [
  {
    id: 'inst-1',
    code: 'PHM-01',
    name: 'pH-mètre Orion Star A211',
    brand: 'Thermo Scientific',
    model: 'Orion Star A211',
    serialNumber: 'SN-TH-882041',
    lab: 'Laboratoire de Chimie',
    acquisitionDate: '2022-03-15',
    commissioningDate: '2022-04-01',
    location: 'Paillasse A2 - Chimie',
    status: 'Opérationnel',
    lastMaintenanceDate: '2026-02-10',
    nextMaintenanceDate: '2026-08-25', // Coming up soon!
    lastCalibrationDate: '2026-08-01',
    nextCalibrationDate: '2026-08-15',
    calibrationCertRef: 'CERT-CAL-2026-089',
    responsiblePerson: 'Brahim Ould Fall'
  },
  {
    id: 'inst-2',
    code: 'COND-02',
    name: 'Conductimètre Portatif HQ40D',
    brand: 'HACH',
    model: 'HQ40D Dual Input',
    serialNumber: 'SN-HC-301192',
    lab: 'Laboratoire de Chimie',
    acquisitionDate: '2021-08-20',
    commissioningDate: '2021-09-01',
    location: 'Salle d\'analyse B1',
    status: 'Opérationnel',
    lastMaintenanceDate: '2025-12-15',
    nextMaintenanceDate: '2026-08-10', // Urgence maintenance
    lastCalibrationDate: '2026-07-15',
    nextCalibrationDate: '2026-08-15',
    calibrationCertRef: 'CERT-CAL-2026-042',
    responsiblePerson: 'Aicha Mint Lemine'
  },
  {
    id: 'inst-3',
    code: 'SPECT-01',
    name: 'Spectrophotomètre UV-Visible UV-1900i',
    brand: 'Shimadzu',
    model: 'UV-1900i',
    serialNumber: 'SN-SHIM-90221',
    lab: 'Laboratoire de Chimie',
    acquisitionDate: '2023-01-10',
    commissioningDate: '2023-02-01',
    location: 'Laboratoire Central Chimie',
    status: 'Opérationnel',
    lastMaintenanceDate: '2026-01-15',
    nextMaintenanceDate: '2027-01-15',
    lastCalibrationDate: '2026-06-10',
    nextCalibrationDate: '2026-12-10',
    calibrationCertRef: 'CERT-SHIM-2026',
    responsiblePerson: 'Dr. Sidi Mohamed Ould Ely'
  }
];

export const initialReagents: Reagent[] = [
  {
    id: 'reag-1',
    code: 'REAG-PH4',
    name: 'Solution tampon pH 4.01 ± 0.01 à 25°C',
    manufacturer: 'Merck Millipore',
    reference: '1.09475.1000',
    lotNumber: 'LOT-2025-0811',
    receptionDate: '2025-09-10',
    openingDate: '2025-10-01',
    expirationDate: '2026-08-20', // Expiring soon!
    quantity: 2,
    unit: 'flacons (500mL)',
    minThreshold: 1,
    storageLocation: 'Armoire Réactifs A',
    storageConditions: 'Température ambiante 15-25°C',
    safetyDataSheetRef: 'FDS-MERCK-PH4.pdf',
    status: 'Stock faible'
  },
  {
    id: 'reag-2',
    code: 'REAG-PH7',
    name: 'Solution tampon pH 7.00 ± 0.01 à 25°C',
    manufacturer: 'Merck Millipore',
    reference: '1.09407.1000',
    lotNumber: 'LOT-2025-0943',
    receptionDate: '2025-09-10',
    openingDate: '2025-10-01',
    expirationDate: '2026-08-28', // Expiring soon!
    quantity: 3,
    unit: 'flacons (500mL)',
    minThreshold: 2,
    storageLocation: 'Armoire Réactifs A',
    storageConditions: 'Température ambiante 15-25°C',
    safetyDataSheetRef: 'FDS-MERCK-PH7.pdf',
    status: 'En stock'
  },
  {
    id: 'reag-3',
    code: 'REAG-PH10',
    name: 'Solution tampon pH 10.01 ± 0.01 à 25°C',
    manufacturer: 'Thermo Fisher',
    reference: '910110',
    lotNumber: 'LOT-2024-0012',
    receptionDate: '2024-05-10',
    openingDate: '2024-06-01',
    expirationDate: '2026-07-01', // Expired
    quantity: 1,
    unit: 'flacon (500mL)',
    minThreshold: 2,
    storageLocation: 'Armoire Réactifs A',
    storageConditions: 'Température ambiante 15-25°C',
    safetyDataSheetRef: 'FDS-TF-PH10.pdf',
    status: 'Expiré'
  }
];

export const initialSamples: Sample[] = [
  // Mandatory Test Scenario Sample IMP-2026-00001
  {
    id: 'samp-1',
    code: 'IMP-2026-00001',
    receptionDate: '2026-08-04',
    receptionTime: '09:00',
    receivedBy: 'Mohamed Abdallahi',
    verifiedBy: 'Dr. Sidi Mohamed Ould Ely',
    verifiedDate: '2026-08-04',
    applicant: 'Direction de la Recherche IMROP',
    organization: 'IMROP Nouakchott',
    sampleType: 'Eau de mer',
    matrix: 'Eau de mer littorale',
    unitsCount: 2,
    volumeMass: '1000 mL',
    containerType: 'Flacon Polyéthylène Haute Densité (PEHD)',
    origin: 'Zone maritime',
    location: 'Station Littoral Nouakchott St-1',
    samplingDate: '2026-08-04',
    sampler: 'Mohamed Abdallahi',
    storageCondition: 'Réfrigéré (4°C)',
    temperature: 4.2,
    generalAspect: 'Limpide, incolore, absence de suspension',
    acceptanceStatus: 'Accepté',
    requestedAnalyses: [
      { id: 1, parameterName: 'pH à 25°C', methodNorm: 'ISO 10523:2008 / CH-PH-001', desiredDeadline: '24 heures' },
      { id: 2, parameterName: 'Salinité Pratique', methodNorm: 'CH-SAL-002 / Unesco Tech', desiredDeadline: '48 heures' },
      { id: 3, parameterName: 'Conductivité électrique', methodNorm: 'CH-COND-003', desiredDeadline: '24 heures' },
      { id: 4, parameterName: 'Oxygène dissous', methodNorm: 'ISO 17289:2014', desiredDeadline: '48 heures' },
      { id: 5, parameterName: 'Nitrates (NO3-)', methodNorm: 'CH-NUT-004 / Spectrophotométrie', desiredDeadline: '3 jours' },
      { id: 6, parameterName: 'Phosphates (PO4 3-)', methodNorm: 'CH-NUT-005 / Spectrophotométrie', desiredDeadline: '3 jours' },
      { id: 7, parameterName: 'Matières en suspension (MES)', methodNorm: 'NF EN 872', desiredDeadline: '48 heures' },
      { id: 8, parameterName: 'Température in situ', methodNorm: 'Mesure directe sonde', desiredDeadline: 'Immédiat' },
      { id: 9, parameterName: 'Turbidité', methodNorm: 'ISO 7027-1', desiredDeadline: '24 heures' }
    ],
    quantity: 1000,
    unit: 'mL',
    description: 'Échantillon d\'eau de mer prélevé en zone côtière pour contrôle physico-chimique routine',
    observations: 'Prélèvement limpide, sans odeur ni matières flottantes',
    status: 'Validé',
    labAssigned: 'Laboratoire de Chimie'
  },
  {
    id: 'samp-2',
    code: 'IMP-2026-00002',
    receptionDate: '2026-08-03',
    receptionTime: '11:30',
    receivedBy: 'Aicha Mint Lemine',
    verifiedBy: 'Brahim Ould Fall',
    verifiedDate: '2026-08-03',
    applicant: 'Délégation à la Surveillance Maritime (DSP)',
    organization: 'Ministère des Pêches',
    sampleType: 'Poisson',
    matrix: 'Tissu musculaire de poisson (Sardinella aurita)',
    unitsCount: 5,
    volumeMass: '2.5 kg',
    containerType: 'Sac stérile congelé sous vide',
    origin: 'Baie de Lévrier',
    location: 'Zone de pêche P-04',
    samplingDate: '2026-08-02',
    sampler: 'Capitaine Ould Ahmed',
    storageCondition: 'Congelé (-20°C)',
    temperature: -18.5,
    generalAspect: 'Spécimens entiers congelés en parfait état',
    acceptanceStatus: 'Accepté',
    requestedAnalyses: [
      { id: 1, parameterName: 'Dosage du Plomb (Pb)', methodNorm: 'CH-MET-001 / SAA', desiredDeadline: '5 jours' },
      { id: 2, parameterName: 'Dosage du Cadmium (Cd)', methodNorm: 'CH-MET-002 / SAA', desiredDeadline: '5 jours' },
      { id: 3, parameterName: 'Dosage du Mercure (Hg)', methodNorm: 'CH-MET-003', desiredDeadline: '5 jours' },
      { id: 4, parameterName: 'Taux d\'humidité', methodNorm: 'Séchage étuve 105°C', desiredDeadline: '48 heures' },
      { id: 5, parameterName: 'Matières grasses totales', methodNorm: 'Méthode Soxhlet', desiredDeadline: '4 jours' }
    ],
    quantity: 2.5,
    unit: 'kg',
    description: 'Échantillons de Sardinella aurita pour dosage métaux lourds',
    observations: 'Emballage sous vide intact',
    status: 'En analyse',
    labAssigned: 'Laboratoire de Chimie'
  },
  {
    id: 'samp-3',
    code: 'IMP-2026-00003',
    receptionDate: '2026-08-04',
    receptionTime: '14:15',
    receivedBy: 'Mohamed Abdallahi',
    verifiedBy: 'Dr. Sidi Mohamed Ould Ely',
    verifiedDate: '2026-08-04',
    applicant: 'Projet Observatoire Environnemental',
    organization: 'PNBA / IMROP',
    sampleType: 'Sédiment',
    matrix: 'Sédiment marin superficiel',
    unitsCount: 1,
    volumeMass: '500 g',
    containerType: 'Flacon Verre Borosilicaté ambré',
    origin: 'Banc d\'Arguin',
    location: 'Iwi Station 3',
    samplingDate: '2026-08-03',
    sampler: 'Aicha Mint Lemine',
    storageCondition: 'Réfrigéré (4°C)',
    temperature: 5.0,
    generalAspect: 'Sédiment sablo-vaseux sombre, emballage hermétique',
    acceptanceStatus: 'Accepté',
    requestedAnalyses: [
      { id: 1, parameterName: 'Granulométrie', methodNorm: 'NF P94-056', desiredDeadline: '4 jours' },
      { id: 2, parameterName: 'Carbone Organique Total (COT)', methodNorm: 'ISO 10694', desiredDeadline: '5 jours' },
      { id: 3, parameterName: 'Matière Organique', methodNorm: 'Perte au feu 550°C', desiredDeadline: '3 jours' }
    ],
    quantity: 500,
    unit: 'g',
    description: 'Carotte de sédiment superficiel pour caractérisation biochimique',
    observations: 'Sédiment sablo-vaseux sombre',
    status: 'En attente',
    labAssigned: 'Laboratoire d\'Analyses environnementales'
  }
];

export const initialResults: AnalysisResult[] = [
  // Mandatory Test Scenario Result for IMP-2026-00001
  {
    id: 'res-1',
    sampleId: 'samp-1',
    sampleCode: 'IMP-2026-00001',
    parameterName: 'pH',
    methodCode: 'CH-PH-001',
    lab: 'Laboratoire de Chimie',
    analysisDate: '2026-08-04',
    analystId: 'u-3',
    analystName: 'Aicha Mint Lemine',
    instrumentId: 'inst-1',
    instrumentName: 'pH-mètre Orion Star A211',
    instrumentSerialNum: 'SN-TH-882041',
    measurements: [
      { id: 1, value: 7.21, temperature: 25.1, time: '09:15' },
      { id: 2, value: 7.24, temperature: 25.0, time: '09:18' },
      { id: 3, value: 7.22, temperature: 25.1, time: '09:21' }
    ],
    averageResult: 7.223,
    minResult: 7.21,
    maxResult: 7.24,
    stdDeviation: 0.015,
    uncertainty: 0.02,
    unit: 'unité pH',
    analystComment: 'Mesures stables. Étalonnage vérifié avec tampons pH 4.01 et 7.00 avant la série d\'analyses.',
    approvalStatus: 'Approuvé par Resp. Labo',
    analystSignatureDate: '2026-08-04 09:30',
    technicalCheckerName: 'Brahim Ould Fall',
    technicalCheckerDate: '2026-08-04 10:15',
    labManagerName: 'Dr. Sidi Mohamed Ould Ely',
    labManagerApprovalDate: '2026-08-04 11:00',
    isLocked: true,
    isConform: true
  }
];

export const initialReports: Report[] = [
  {
    id: 'rep-1',
    reportNumber: 'REP-IMROP-2026-00001',
    sampleId: 'samp-1',
    sampleCode: 'IMP-2026-00001',
    generatedDate: '2026-08-04',
    generatedBy: 'Dr. Sidi Mohamed Ould Ely',
    lab: 'Laboratoire de Chimie',
    status: 'Généré',
    pdfFilename: 'Rapport_Analyse_IMP-2026-00001.pdf'
  }
];

export const initialCalibrations: CalibrationRecord[] = [
  {
    id: 'cal-1',
    date: '2026-08-04',
    time: '08:45',
    analystName: 'Aicha Mint Lemine',
    instrumentId: 'inst-1',
    instrumentName: 'pH-mètre Orion Star A211',
    bufferSolutionUsed: 'Tampons pH 4.01 & pH 7.00 (Merck)',
    lotNumber: 'LOT-2025-0811 / LOT-2025-0943',
    result: 'Pente = 98.4%, Offset = -2.1 mV',
    conformity: 'Conforme',
    comment: 'Étalonnage 2 points validé avant analyse de l\'échantillon IMP-2026-00001'
  }
];

export const initialQualityControls: QualityControlRecord[] = [
  {
    id: 'qc-1',
    date: '2026-08-04',
    qcType: 'Matériau de Référence',
    parameterName: 'pH',
    methodCode: 'CH-PH-001',
    analystName: 'Aicha Mint Lemine',
    expectedValue: 7.00,
    foundValue: 7.01,
    unit: 'unité pH',
    status: 'Accepté',
    comment: 'Contrôle quotidien avec solution certifiée CRM pH 7.00'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-04 09:00:00',
    user: 'Mohamed Abdallahi',
    userRole: 'Technicien',
    action: 'Enregistrement Échantillon',
    resource: 'IMP-2026-00001',
    newValue: 'Création de l\'échantillon Eau de mer - Zone maritime'
  },
  {
    id: 'log-2',
    timestamp: '2026-08-04 09:15:00',
    user: 'Aicha Mint Lemine',
    userRole: 'Analyste',
    action: 'Saisie Mesures pH',
    resource: 'IMP-2026-00001 / CH-PH-001',
    newValue: 'Mesures: 7.21, 7.24, 7.22 -> Moyenne: 7.22'
  },
  {
    id: 'log-3',
    timestamp: '2026-08-04 10:15:00',
    user: 'Brahim Ould Fall',
    userRole: 'Responsable du laboratoire',
    action: 'Vérification Technique',
    resource: 'IMP-2026-00001',
    oldValue: 'Soumis par Analyste',
    newValue: 'Vérifié par Resp. Technique'
  },
  {
    id: 'log-4',
    timestamp: '2026-08-04 11:00:00',
    user: 'Dr. Sidi Mohamed Ould Ely',
    userRole: 'Administrateur',
    action: 'Approbation Finale & Verrouillage',
    resource: 'IMP-2026-00001',
    oldValue: 'Vérifié par Resp. Technique',
    newValue: 'Approuvé par Resp. Labo (Résultats verrouillés)'
  },
  {
    id: 'log-5',
    timestamp: '2026-08-04 11:05:00',
    user: 'Dr. Sidi Mohamed Ould Ely',
    userRole: 'Administrateur',
    action: 'Génération Rapport PDF',
    resource: 'REP-IMROP-2026-00001',
    newValue: 'Création du rapport officiel avec QR Code d\'authenticité'
  }
];

export const initialAnalysisRequests: AnalysisRequest[] = [
  {
    id: 'req-2026-001',
    docRef: 'ENR-QUA-04-V1.0',
    clientId: 'CLI-IMROP-0042',
    clientName: 'Direction de la Recherche IMROP',
    clientAddress: 'BP 22, Cité de la Recherche Marine, Nouadhibou / Nouakchott, Mauritanie',
    requestDateTime: '2026-08-04 08:30',
    items: [
      { id: 1, parameterName: 'Mesure du pH & Écart-type (ISO 10523)', desiredDeadline: '24 heures' },
      { id: 2, parameterName: 'Salinité Pratique (PSU)', desiredDeadline: '48 heures' },
      { id: 3, parameterName: 'Conductivité électrique à 25°C', desiredDeadline: '24 heures' },
      { id: 4, parameterName: 'Oxygène dissous in-situ (mg/L)', desiredDeadline: 'Immediate' },
      { id: 5, parameterName: 'Nitrates (NO3-) & Phosphates (PO4 3-)', desiredDeadline: '3 jours' },
      { id: 6, parameterName: 'Matières en suspension (MES)', desiredDeadline: '48 heures' },
      { id: 7, parameterName: '', desiredDeadline: '' },
      { id: 8, parameterName: '', desiredDeadline: '' },
      { id: 9, parameterName: '', desiredDeadline: '' },
      { id: 10, parameterName: '', desiredDeadline: '' }
    ],
    receivedBy: 'Mohamed Abdallahi (Technicien Réception)',
    receivedDate: '2026-08-04 09:00',
    status: 'En cours',
    sampleCode: 'IMP-2026-00001'
  }
];

