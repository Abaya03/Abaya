export type UserRole = 
  | 'Administrateur' 
  | 'Responsable du laboratoire' 
  | 'Analyste' 
  | 'Technicien' 
  | 'Consultation';

export type LabType = 
  | 'Laboratoire de Chimie' 
  | 'Laboratoire de Biologie' 
  | 'Laboratoire d\'Analyses environnementales' 
  | 'Laboratoire d\'Halieutique';

export type SampleStatus = 
  | 'Reçu' 
  | 'En attente' 
  | 'En analyse' 
  | 'Analyse terminée' 
  | 'En validation' 
  | 'Validé' 
  | 'Rapport généré' 
  | 'Archivé' 
  | 'Rejeté';

export type SampleType = 
  | 'Eau de mer' 
  | 'Eau douce' 
  | 'Sédiment' 
  | 'Poisson' 
  | 'Crustacé' 
  | 'Mollusque' 
  | 'Plancton' 
  | 'Huile de poisson' 
  | 'Farine de poisson';

export type ApprovalLevel = 
  | 'Non soumis' 
  | 'Soumis par Analyste' 
  | 'Vérifié par Resp. Technique' 
  | 'Approuvé par Resp. Labo';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lab: LabType;
  avatar?: string;
  active: boolean;
  password?: string;
}

export interface RequestedAnalysisItem {
  id: number;
  parameterName: string; // e.g. pH, Salinité, Oxygène dissous
  methodNorm?: string; // e.g. ISO 10523:2008 / Standard Methods
  desiredDeadline?: string; // e.g. 24h, 48h, 10/08/2026
}

export interface Sample {
  id: string;
  code: string; // e.g., IMP-2026-00001 (N° d'identification de l'échantillon)
  receptionDate: string; // YYYY-MM-DD
  receptionTime: string; // HH:mm
  receivedBy: string; // Réceptionné par (Nom)
  verifiedBy?: string; // Vérifié par (Nom)
  verifiedDate?: string; // Date de vérification

  // Section 1 & Applicant
  applicant: string; // Demandeur
  organization: string; // Organisme / Service demandeur

  // Section 2: Description de l'échantillon
  sampleType: SampleType; // Nature (e.g. Eau de mer, Sédiment, Poisson)
  matrix?: string; // Matrice (e.g. Eau de mer filtrée, Tissu musculaire)
  unitsCount?: number; // Nombre d'unités reçues (e.g. 2 flacons)
  volumeMass?: string; // Volume / Masse totale (e.g. 1000 mL, 2.5 kg)
  containerType?: string; // Type de contenant (e.g. Flacon Polyéthylène, Flacon Verre)

  // Location / Origin
  origin: string; // Zone maritime, Baie de Lévrier, etc.
  location: string;
  samplingDate: string;
  sampler: string; // Responsable prélèvement

  // Section 3: État à la réception
  storageCondition: string; // Ex: Réfrigéré (4°C), Congelé (-20°C)
  temperature: number; // °C
  generalAspect?: string; // Aspect général / État (e.g. Limpide, Homogène)
  acceptanceStatus?: 'Accepté' | 'Rejeté' | 'Sous réserve'; // Acceptation de l'échantillon

  // Section 4: Analyses Demandées (1-9)
  requestedAnalyses?: RequestedAnalysisItem[];

  // Legacy & General fields
  quantity: number;
  unit: string; // mL, g, kg
  description: string;
  observations?: string;
  photoUrl?: string;
  status: SampleStatus;
  labAssigned: LabType;
  nonConformityReason?: string;
}

export interface ParameterConfig {
  id: string;
  code: string;
  name: string; // e.g., pH, Salinité, Nitrate
  lab: LabType;
  unit: string;
  defaultMethodCode: string;
  minLimit?: number;
  maxLimit?: number;
  description?: string;
}

export interface AnalysisMethod {
  id: string;
  code: string; // CH-PH-001
  name: string;
  parameterName: string;
  description: string;
  normReference: string; // e.g. ISO 10523:2008 / Standard Methods
  version: string;
  creationDate: string;
  revisionDate: string;
  documentRef: string;
  lab: LabType;
  status: 'Active' | 'En révision' | 'Obsolète';
}

export interface MeasurementRow {
  id: number;
  value: number;
  temperature?: number;
  time: string;
}

export interface AnalysisResult {
  id: string;
  sampleId: string;
  sampleCode: string;
  parameterName: string;
  methodCode: string;
  lab: LabType;
  analysisDate: string;
  analystId: string;
  analystName: string;
  instrumentId: string;
  instrumentName: string;
  instrumentSerialNum: string;
  measurements: MeasurementRow[];
  averageResult: number;
  minResult: number;
  maxResult: number;
  stdDeviation: number;
  uncertainty?: number;
  unit: string;
  analystComment?: string;
  approvalStatus: ApprovalLevel;
  analystSignatureDate?: string;
  technicalCheckerName?: string;
  technicalCheckerDate?: string;
  labManagerName?: string;
  labManagerApprovalDate?: string;
  isLocked: boolean; // Once fully approved, direct editing is locked
  isConform?: boolean;
}

export interface Instrument {
  id: string;
  code: string; // e.g. PHM-01
  name: string; // pH-mètre Orion Star
  brand: string;
  model: string;
  serialNumber: string;
  lab: LabType;
  acquisitionDate: string;
  commissioningDate: string;
  location: string;
  status: 'Opérationnel' | 'En maintenance' | 'En panne' | 'Hors service';
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string;
  calibrationCertRef: string;
  responsiblePerson: string;
}

export interface CalibrationRecord {
  id: string;
  date: string;
  time: string;
  analystName: string;
  instrumentId: string;
  instrumentName: string;
  bufferSolutionUsed: string; // e.g., Solution Tampon pH 4.01, 7.00, 10.01
  lotNumber: string;
  result: string;
  conformity: 'Conforme' | 'Non conforme';
  comment: string;
}

export interface Reagent {
  id: string;
  code: string; // REAG-001
  name: string;
  manufacturer: string;
  reference: string;
  lotNumber: string;
  receptionDate: string;
  openingDate?: string;
  expirationDate: string;
  quantity: number;
  unit: string; // L, mL, g, kg, flacons
  minThreshold: number;
  storageLocation: string;
  storageConditions: string;
  safetyDataSheetRef: string;
  status: 'En stock' | 'Stock faible' | 'Expiré' | 'Épuisé';
}

export interface QualityControlRecord {
  id: string;
  date: string;
  qcType: 'Blanc' | 'Échantillon de contrôle' | 'Répétabilité' | 'Matériau de Référence';
  parameterName: string;
  methodCode: string;
  analystName: string;
  expectedValue: number;
  foundValue: number;
  unit: string;
  status: 'Accepté' | 'Rejeté';
  comment?: string;
}

export interface Report {
  id: string;
  reportNumber: string; // REP-2026-00001
  sampleId: string;
  sampleCode: string;
  generatedDate: string;
  generatedBy: string;
  lab: LabType;
  qrCodeUrl?: string;
  status: 'Généré' | 'Archivé' | 'Annulé';
  pdfFilename: string;
}

export interface AnalysisRequestItem {
  id: number;
  parameterName: string;
  desiredDeadline: string;
}

export interface AnalysisRequest {
  id: string;
  docRef: string; // ENR-QUA-04-V1.0
  clientId: string;
  clientName: string;
  clientAddress: string;
  requestDateTime: string;
  items: AnalysisRequestItem[];
  receivedBy: string;
  receivedDate: string;
  status: 'Soumise' | 'En cours' | 'Traitée';
  sampleCode?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: UserRole;
  action: string;
  resource: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}
