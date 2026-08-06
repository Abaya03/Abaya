import React, { createContext, useContext, useState, useEffect } from 'react';
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
  SampleStatus,
  UserRole,
  LabType,
  MeasurementRow,
  AnalysisRequest
} from '../types/lims';
import {
  initialUsers,
  initialParameters,
  initialMethods,
  initialInstruments,
  initialReagents,
  initialSamples,
  initialResults,
  initialReports,
  initialCalibrations,
  initialQualityControls,
  initialAuditLogs,
  initialAnalysisRequests
} from '../data/initialData';
import { generateReportPDF } from '../utils/pdfGenerator';

interface LIMSContextType {
  currentUser: User;
  setCurrentUser: (u: User) => void;
  users: User[];
  isAuthenticated: boolean;
  login: (identifier: string, passwordInput: string) => { success: boolean; message?: string };
  logout: () => void;
  samples: Sample[];
  parameters: ParameterConfig[];
  methods: AnalysisMethod[];
  results: AnalysisResult[];
  instruments: Instrument[];
  calibrations: CalibrationRecord[];
  reagents: Reagent[];
  qualityControls: QualityControlRecord[];
  reports: Report[];
  analysisRequests: AnalysisRequest[];
  auditLogs: AuditLog[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedSampleForResults: string;
  setSelectedSampleForResults: (code: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Actions
  addUser: (u: Omit<User, 'id'>) => User;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addAnalysisRequest: (req: Omit<AnalysisRequest, 'id' | 'docRef'>) => AnalysisRequest;
  updateAnalysisRequest: (id: string, reqData: Partial<AnalysisRequest>) => void;
  convertRequestToSample: (requestId: string) => Sample | null;
  addSample: (s: Omit<Sample, 'id' | 'code' | 'status'>) => Sample;
  updateSampleStatus: (id: string, status: SampleStatus, reason?: string) => void;
  deleteSample: (id: string) => void;

  saveAnalysisResult: (res: {
    id?: string;
    sampleId: string;
    sampleCode: string;
    parameterName: string;
    methodCode: string;
    lab: LabType;
    analysisDate: string;
    instrumentId: string;
    instrumentName: string;
    instrumentSerialNum: string;
    measurements: MeasurementRow[];
    unit: string;
    analystComment?: string;
  }) => AnalysisResult;

  submitForVerification: (resultId: string) => void;
  verifyTechnical: (resultId: string) => void;
  approveLabManager: (resultId: string) => Promise<Report | null>;

  addParameter: (param: Omit<ParameterConfig, 'id'>) => void;
  addMethod: (method: Omit<AnalysisMethod, 'id'>) => void;
  addInstrument: (inst: Omit<Instrument, 'id'>) => void;
  updateInstrument: (id: string, instData: Partial<Instrument>) => void;
  addCalibration: (cal: Omit<CalibrationRecord, 'id'>) => void;
  addReagent: (reag: Omit<Reagent, 'id' | 'status'>) => void;
  updateReagent: (id: string, reagData: Partial<Reagent>) => void;
  addQualityControl: (qc: Omit<QualityControlRecord, 'id'>) => void;

  executeMandatoryTestScenario: () => Promise<void>;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonString: string) => boolean;
  logAudit: (action: string, resource: string, oldValue?: string, newValue?: string) => void;
}

const LIMSContext = createContext<LIMSContextType | undefined>(undefined);

export const LIMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage or fallback to seed data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('imrop_lims_users');
    if (!saved) return initialUsers;
    try {
      const parsed: User[] = JSON.parse(saved);
      return parsed.map((u) => {
        const matchingInitial = initialUsers.find((iu) => iu.id === u.id);
        if (matchingInitial && (u.name.includes('Sidi') || u.name.includes('Fall') || u.id === 'u-1' || u.id === 'u-2')) {
          return {
            ...u,
            name: matchingInitial.name,
            email: matchingInitial.email,
            password: u.password || matchingInitial.password || 'imrop2026'
          };
        }
        return {
          ...u,
          password: u.password || matchingInitial?.password || 'imrop2026'
        };
      });
    } catch {
      return initialUsers;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const sessionAuth = sessionStorage.getItem('imrop_lims_auth');
    return sessionAuth === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = sessionStorage.getItem('imrop_lims_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const match = users.find((u) => u.id === parsed.id || u.email === parsed.email);
        if (match) return match;
      } catch {
        // ignore
      }
    }
    return users[0] || initialUsers[0];
  });

  const login = (identifier: string, passwordInput: string): { success: boolean; message?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPwd = passwordInput.trim();

    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.name.toLowerCase() === cleanId ||
        u.id.toLowerCase() === cleanId ||
        u.name.toLowerCase().includes(cleanId)
    );

    if (!foundUser) {
      return { success: false, message: "Nom d'utilisateur ou e-mail introuvable." };
    }

    if (!foundUser.active) {
      return { success: false, message: "Ce compte utilisateur est désactivé. Veuillez contacter l'administrateur." };
    }

    const expectedPwd = foundUser.password || 'imrop2026';
    if (cleanPwd !== expectedPwd) {
      logAudit('Échec d\'Authentification', foundUser.name, undefined, 'Mot de passe erroné');
      return { success: false, message: "Mot de passe incorrect." };
    }

    setCurrentUser(foundUser);
    setIsAuthenticated(true);
    sessionStorage.setItem('imrop_lims_auth', 'true');
    sessionStorage.setItem('imrop_lims_current_user', JSON.stringify(foundUser));
    logAudit('Connexion Réussie', foundUser.name, undefined, `Rôle: ${foundUser.role}`);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('imrop_lims_auth');
    logAudit('Déconnexion', currentUser.name, undefined, 'Session terminée');
  };

  const [samples, setSamples] = useState<Sample[]>(() => {
    const saved = localStorage.getItem('imrop_lims_samples');
    return saved ? JSON.parse(saved) : initialSamples;
  });

  const [parameters, setParameters] = useState<ParameterConfig[]>(() => {
    const saved = localStorage.getItem('imrop_lims_parameters');
    return saved ? JSON.parse(saved) : initialParameters;
  });

  const [methods, setMethods] = useState<AnalysisMethod[]>(() => {
    const saved = localStorage.getItem('imrop_lims_methods');
    return saved ? JSON.parse(saved) : initialMethods;
  });

  const [results, setResults] = useState<AnalysisResult[]>(() => {
    const saved = localStorage.getItem('imrop_lims_results');
    return saved ? JSON.parse(saved) : initialResults;
  });

  const [instruments, setInstruments] = useState<Instrument[]>(() => {
    const saved = localStorage.getItem('imrop_lims_instruments');
    return saved ? JSON.parse(saved) : initialInstruments;
  });

  const [calibrations, setCalibrations] = useState<CalibrationRecord[]>(() => {
    const saved = localStorage.getItem('imrop_lims_calibrations');
    return saved ? JSON.parse(saved) : initialCalibrations;
  });

  const [reagents, setReagents] = useState<Reagent[]>(() => {
    const saved = localStorage.getItem('imrop_lims_reagents');
    return saved ? JSON.parse(saved) : initialReagents;
  });

  const [qualityControls, setQualityControls] = useState<QualityControlRecord[]>(() => {
    const saved = localStorage.getItem('imrop_lims_qc');
    return saved ? JSON.parse(saved) : initialQualityControls;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('imrop_lims_reports');
    return saved ? JSON.parse(saved) : initialReports;
  });

  const [analysisRequests, setAnalysisRequests] = useState<AnalysisRequest[]>(() => {
    const saved = localStorage.getItem('imrop_lims_requests');
    return saved ? JSON.parse(saved) : initialAnalysisRequests;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('imrop_lims_audit');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSampleForResults, setSelectedSampleForResults] = useState<string>('IMP-2026-00001');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('imrop_lims_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('imrop_lims_samples', JSON.stringify(samples));
  }, [samples]);

  useEffect(() => {
    localStorage.setItem('imrop_lims_requests', JSON.stringify(analysisRequests));
  }, [analysisRequests]);

  useEffect(() => {
    localStorage.setItem('imrop_lims_parameters', JSON.stringify(parameters));
  }, [parameters]);

  useEffect(() => {
    localStorage.setItem('imrop_lims_methods', JSON.stringify(methods));
  }, [methods]);

  useEffect(() => {
    localStorage.setItem('imrop_lims_results', JSON.stringify(results));
  }, [results]);

  useEffect(() => {
    localStorage.setItem('imrop_lims_instruments', JSON.stringify(instruments));
  }, [instruments]);

  useEffect(() => {
    localStorage.setItem('imrop_lims_reagents', JSON.stringify(reagents));
  }, [reagents]);

  useEffect(() => {
    localStorage.setItem('imrop_lims_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('imrop_lims_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Utility to log audit entries
  const logAudit = (action: string, resource: string, oldValue?: string, newValue?: string) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
      2, '0'
    )}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formattedDate,
      user: currentUser.name,
      userRole: currentUser.role,
      action,
      resource,
      oldValue,
      newValue,
      ipAddress: '192.168.1.42 (Réseau IMROP)'
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // User Management
  const addUser = (uData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...uData,
      id: `usr-${Date.now()}`
    };
    setUsers((prev) => [...prev, newUser]);
    logAudit('Création Utilisateur', newUser.name, undefined, `Rôle: ${newUser.role}, Labo: ${newUser.lab}`);
    return newUser;
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...userData };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          logAudit('Modification Utilisateur', u.name, `Rôle: ${u.role}`, `Modifications: ${JSON.stringify(userData)}`);
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (target) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      logAudit('Suppression Utilisateur', target.name, `Rôle: ${target.role}`, 'Supprimé');
    }
  };

  // Add Analysis Request (ENR-QUA-04-V1.0)
  const addAnalysisRequest = (reqData: Omit<AnalysisRequest, 'id' | 'docRef'>): AnalysisRequest => {
    const newReq: AnalysisRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      docRef: 'ENR-QUA-04-V1.0'
    };
    setAnalysisRequests((prev) => [newReq, ...prev]);
    logAudit('Création Demande d\'analyse ENR-QUA-04-V1.0', newReq.clientName, undefined, `Client: ${newReq.clientName}, Date: ${newReq.requestDateTime}`);
    return newReq;
  };

  const updateAnalysisRequest = (id: string, reqData: Partial<AnalysisRequest>) => {
    setAnalysisRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          logAudit('Mise à jour Demande d\'analyse', r.docRef, undefined, JSON.stringify(reqData));
          return { ...r, ...reqData };
        }
        return r;
      })
    );
  };

  // Convert Analysis Request (ENR-QUA-04) directly to Sample (ENR-CHI-02)
  const convertRequestToSample = (requestId: string): Sample | null => {
    const req = analysisRequests.find((r) => r.id === requestId);
    if (!req) return null;

    if (req.sampleCode) {
      const existing = samples.find((s) => s.code === req.sampleCode);
      if (existing) return existing;
    }

    const nextNum = samples.length + 1;
    const formattedCode = `IMP-2026-${String(nextNum).padStart(5, '0')}`;

    const requestedAnalyses = req.items
      .filter((i) => i.parameterName && i.parameterName.trim() !== '')
      .map((i) => ({
        id: i.id,
        parameterName: i.parameterName,
        methodNorm: 'ISO 10523:2008 / Standard Methods',
        desiredDeadline: i.desiredDeadline || '24h'
      }));

    const newSample: Sample = {
      id: `samp-${Date.now()}`,
      code: formattedCode,
      receptionDate: req.receivedDate || new Date().toISOString().substring(0, 10),
      receptionTime: '09:30',
      receivedBy: req.receivedBy || currentUser.name,
      applicant: req.clientName,
      organization: req.clientAddress,
      sampleType: 'Eau de mer',
      matrix: 'Eau de mer littorale',
      unitsCount: 1,
      volumeMass: '1000 mL',
      containerType: 'Flacon Polyéthylène Haute Densité (PEHD)',
      origin: 'Littoral Nouadhibou / Nouakchott',
      location: 'Zone Marine IMROP',
      samplingDate: req.requestDateTime ? req.requestDateTime.substring(0, 10) : new Date().toISOString().substring(0, 10),
      sampler: req.clientName,
      storageCondition: 'Réfrigéré (4°C)',
      temperature: 4.0,
      generalAspect: 'Limpide, incolore, conforme',
      acceptanceStatus: 'Accepté',
      requestedAnalyses,
      quantity: 1000,
      unit: 'mL',
      description: `Échantillon rattaché à la demande d'analyse ${req.docRef} (${req.clientId})`,
      status: 'Reçu',
      labAssigned: 'Laboratoire de Chimie'
    };

    setSamples((prev) => [newSample, ...prev]);
    setAnalysisRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, sampleCode: formattedCode, status: 'En cours' } : r))
    );

    logAudit('Conversion Demande en Échantillon', formattedCode, undefined, `Demande: ${req.docRef} pour ${req.clientName}`);
    return newSample;
  };

  // Add new sample
  const addSample = (sData: Omit<Sample, 'id' | 'code' | 'status'>): Sample => {
    const nextNum = samples.length + 1;
    const formattedCode = `IMP-2026-${String(nextNum).padStart(5, '0')}`;

    const newSample: Sample = {
      ...sData,
      id: `samp-${Date.now()}`,
      code: formattedCode,
      status: 'Reçu'
    };

    setSamples((prev) => [newSample, ...prev]);
    logAudit('Enregistrement Échantillon', newSample.code, undefined, `Type: ${newSample.sampleType}, Origine: ${newSample.origin}`);
    return newSample;
  };

  // Update sample status
  const updateSampleStatus = (id: string, status: SampleStatus, reason?: string) => {
    setSamples((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const oldStatus = s.status;
          logAudit('Changement Statut Échantillon', s.code, oldStatus, `${status}${reason ? ` (Raison: ${reason})` : ''}`);
          return { ...s, status, nonConformityReason: reason || s.nonConformityReason };
        }
        return s;
      })
    );
  };

  // Delete sample
  const deleteSample = (id: string) => {
    const target = samples.find((s) => s.id === id);
    if (target) {
      logAudit('Suppression Échantillon', target.code, target.status, 'Supprimé');
      setSamples((prev) => prev.filter((s) => s.id !== id));
      setResults((prev) => prev.filter((r) => r.sampleId !== id));
    }
  };

  // Calculate stats from measurements array
  const calculateMeasurementStats = (ms: MeasurementRow[]) => {
    if (!ms || ms.length === 0) {
      return { avg: 0, min: 0, max: 0, sd: 0 };
    }
    const vals = ms.map((m) => m.value);
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = sum / vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    let sd = 0;
    if (vals.length > 1) {
      const variance = vals.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / (vals.length - 1);
      sd = Math.sqrt(variance);
    }

    return { avg, min, max, sd };
  };

  // Save analysis result (Saisie des mesures)
  const saveAnalysisResult = (resData: {
    id?: string;
    sampleId: string;
    sampleCode: string;
    parameterName: string;
    methodCode: string;
    lab: LabType;
    analysisDate: string;
    instrumentId: string;
    instrumentName: string;
    instrumentSerialNum: string;
    measurements: MeasurementRow[];
    unit: string;
    analystComment?: string;
  }): AnalysisResult => {
    const stats = calculateMeasurementStats(resData.measurements);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const existingIndex = results.findIndex((r) => r.id === resData.id || (r.sampleId === resData.sampleId && r.parameterName === resData.parameterName));

    // Check parameter limits for conformity
    const paramConf = parameters.find((p) => p.name === resData.parameterName);
    let isConform = true;
    if (paramConf) {
      if (paramConf.minLimit !== undefined && stats.avg < paramConf.minLimit) isConform = false;
      if (paramConf.maxLimit !== undefined && stats.avg > paramConf.maxLimit) isConform = false;
    }

    let updatedResult: AnalysisResult;

    if (existingIndex >= 0) {
      const current = results[existingIndex];
      updatedResult = {
        ...current,
        analysisDate: resData.analysisDate,
        analystId: currentUser.id,
        analystName: currentUser.name,
        instrumentId: resData.instrumentId,
        instrumentName: resData.instrumentName,
        instrumentSerialNum: resData.instrumentSerialNum,
        measurements: resData.measurements,
        averageResult: stats.avg,
        minResult: stats.min,
        maxResult: stats.max,
        stdDeviation: stats.sd,
        unit: resData.unit,
        analystComment: resData.analystComment,
        analystSignatureDate: now,
        isConform
      };
      setResults((prev) => {
        const copy = [...prev];
        copy[existingIndex] = updatedResult;
        return copy;
      });
      logAudit('Saisie/Mise à jour Résultats', resData.sampleCode, `Moyenne précédente: ${current.averageResult}`, `Nouvelle moyenne: ${stats.avg.toFixed(3)} ${resData.unit}`);
    } else {
      updatedResult = {
        id: `res-${Date.now()}`,
        sampleId: resData.sampleId,
        sampleCode: resData.sampleCode,
        parameterName: resData.parameterName,
        methodCode: resData.methodCode,
        lab: resData.lab,
        analysisDate: resData.analysisDate,
        analystId: currentUser.id,
        analystName: currentUser.name,
        instrumentId: resData.instrumentId,
        instrumentName: resData.instrumentName,
        instrumentSerialNum: resData.instrumentSerialNum,
        measurements: resData.measurements,
        averageResult: stats.avg,
        minResult: stats.min,
        maxResult: stats.max,
        stdDeviation: stats.sd,
        unit: resData.unit,
        analystComment: resData.analystComment,
        approvalStatus: 'Soumis par Analyste',
        analystSignatureDate: now,
        isLocked: false,
        isConform
      };
      setResults((prev) => [updatedResult, ...prev]);
      logAudit('Nouvelle Saisie Résultats', resData.sampleCode, undefined, `Paramètre: ${resData.parameterName}, Moyenne: ${stats.avg.toFixed(3)} ${resData.unit}`);
    }

    // Update sample status
    updateSampleStatus(resData.sampleId, 'Analyse terminée');
    return updatedResult;
  };

  // Step 1: Submit for technical verification
  const submitForVerification = (resultId: string) => {
    setResults((prev) =>
      prev.map((r) => {
        if (r.id === resultId) {
          logAudit('Soumission pour vérification', r.sampleCode, r.approvalStatus, 'Soumis par Analyste');
          return { ...r, approvalStatus: 'Soumis par Analyste' };
        }
        return r;
      })
    );
  };

  // Step 2: Technical verification (Responsable Technique)
  const verifyTechnical = (resultId: string) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    setResults((prev) =>
      prev.map((r) => {
        if (r.id === resultId) {
          logAudit('Vérification Technique', r.sampleCode, r.approvalStatus, 'Vérifié par Resp. Technique');
          return {
            ...r,
            approvalStatus: 'Vérifié par Resp. Technique',
            technicalCheckerName: currentUser.name,
            technicalCheckerDate: now
          };
        }
        return r;
      })
    );
    // Update sample status to En validation
    const target = results.find((r) => r.id === resultId);
    if (target) {
      updateSampleStatus(target.sampleId, 'En validation');
    }
  };

  // Step 3: Final Approval (Responsable Laboratoire) & Auto PDF Report Generation
  const approveLabManager = async (resultId: string): Promise<Report | null> => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    let targetResult = results.find((r) => r.id === resultId);

    if (!targetResult) return null;

    targetResult = {
      ...targetResult,
      approvalStatus: 'Approuvé par Resp. Labo',
      labManagerName: currentUser.name,
      labManagerApprovalDate: now,
      isLocked: true
    };

    setResults((prev) => prev.map((r) => (r.id === resultId ? targetResult! : r)));
    logAudit('Approbation Finale Labo', targetResult.sampleCode, 'Vérifié par Resp. Technique', 'Approuvé par Resp. Labo (Verrouillé)');

    const targetSample = samples.find((s) => s.id === targetResult!.sampleId);
    if (!targetSample) return null;

    // Update sample status to Validé
    updateSampleStatus(targetSample.id, 'Validé');

    // Generate PDF Report
    const reportNum = `REP-IMROP-${new Date().getFullYear()}-${String(reports.length + 1).padStart(5, '0')}`;
    try {
      await generateReportPDF(targetSample, [targetResult], reportNum, currentUser.name);

      const newReport: Report = {
        id: `rep-${Date.now()}`,
        reportNumber: reportNum,
        sampleId: targetSample.id,
        sampleCode: targetSample.code,
        generatedDate: new Date().toISOString().substring(0, 10),
        generatedBy: currentUser.name,
        lab: targetSample.labAssigned,
        status: 'Généré',
        pdfFilename: `Rapport_${targetSample.code}.pdf`
      };

      setReports((prev) => [newReport, ...prev]);
      updateSampleStatus(targetSample.id, 'Rapport généré');
      setAnalysisRequests((prev) =>
        prev.map((r) => (r.sampleCode === targetSample.code ? { ...r, status: 'Traitée' } : r))
      );
      logAudit('Génération Rapport PDF', reportNum, undefined, `Pour échantillon ${targetSample.code}`);
      return newReport;
    } catch (err) {
      console.error('Error generating PDF:', err);
      return null;
    }
  };

  // Module Adders
  const addParameter = (param: Omit<ParameterConfig, 'id'>) => {
    const newP: ParameterConfig = { ...param, id: `p-${Date.now()}` };
    setParameters((prev) => [...prev, newP]);
    logAudit('Ajout Paramètre Analyse', newP.code, undefined, `${newP.name} (${newP.unit})`);
  };

  const addMethod = (method: Omit<AnalysisMethod, 'id'>) => {
    const newM: AnalysisMethod = { ...method, id: `m-${Date.now()}` };
    setMethods((prev) => [...prev, newM]);
    logAudit('Ajout Méthode d\'analyse', newM.code, undefined, newM.name);
  };

  const addInstrument = (inst: Omit<Instrument, 'id'>) => {
    const newI: Instrument = { ...inst, id: `inst-${Date.now()}` };
    setInstruments((prev) => [...prev, newI]);
    logAudit('Ajout Équipement/Appareil', newI.code, undefined, newI.name);
  };

  const updateInstrument = (id: string, instData: Partial<Instrument>) => {
    setInstruments((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          logAudit('Mise à jour Équipement', i.code, undefined, JSON.stringify(instData));
          return { ...i, ...instData };
        }
        return i;
      })
    );
  };

  const addCalibration = (cal: Omit<CalibrationRecord, 'id'>) => {
    const newC: CalibrationRecord = { ...cal, id: `cal-${Date.now()}` };
    setCalibrations((prev) => [...prev, newC]);
    logAudit('Étalonnage Appareil', cal.instrumentName, undefined, `Tampons: ${cal.bufferSolutionUsed}, Résultat: ${cal.conformity}`);
  };

  const addReagent = (reag: Omit<Reagent, 'id' | 'status'>) => {
    let status: Reagent['status'] = 'En stock';
    if (reag.quantity <= reag.minThreshold) status = 'Stock faible';
    const newR: Reagent = { ...reag, id: `reag-${Date.now()}`, status };
    setReagents((prev) => [...prev, newR]);
    logAudit('Ajout Réactif', newR.code, undefined, `${newR.name} - Lot ${newR.lotNumber}`);
  };

  const updateReagent = (id: string, reagData: Partial<Reagent>) => {
    setReagents((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, ...reagData };
          if (updated.quantity <= updated.minThreshold) updated.status = 'Stock faible';
          logAudit('Mise à jour Réactif', r.code, undefined, `Quantité: ${updated.quantity} ${updated.unit}`);
          return updated;
        }
        return r;
      })
    );
  };

  const addQualityControl = (qc: Omit<QualityControlRecord, 'id'>) => {
    const newQ: QualityControlRecord = { ...qc, id: `qc-${Date.now()}` };
    setQualityControls((prev) => [...prev, newQ]);
    logAudit('Contrôle Qualité Log', newQ.parameterName, undefined, `Type: ${newQ.qcType}, Statut: ${newQ.status}`);
  };

  // 1-Click Mandatory Test Scenario Runner (Section 23 of prompt)
  const executeMandatoryTestScenario = async () => {
    // 1. Reset/Ensure Sample IMP-2026-00001
    const scenarioSample: Sample = {
      id: 'samp-scenario-1',
      code: 'IMP-2026-00001',
      receptionDate: '2026-08-04',
      receptionTime: '09:00',
      receivedBy: 'Mohamed Abdallahi',
      applicant: 'Direction de la Recherche IMROP',
      organization: 'IMROP Centre de Nouakchott',
      sampleType: 'Eau de mer',
      matrix: 'Eau de mer littorale',
      unitsCount: 1,
      volumeMass: '1000 mL',
      containerType: 'Flacon Polyéthylène Haute Densité (PEHD)',
      generalAspect: 'Limpide, incolore, sans particules',
      acceptanceStatus: 'Accepté',
      origin: 'Zone maritime',
      location: 'Station Littoral Nouakchott St-1',
      samplingDate: '2026-08-04',
      sampler: 'Mohamed Abdallahi',
      storageCondition: 'Réfrigéré (4°C)',
      temperature: 4.0,
      quantity: 1000,
      unit: 'mL',
      description: 'Scénario de test obligatoire - Prélèvement Eau de mer pour dosage pH',
      observations: 'Échantillon clair, prélevé selon protocole standard IMROP',
      status: 'Validé',
      labAssigned: 'Laboratoire de Chimie'
    };

    setSamples((prev) => [scenarioSample, ...prev.filter((s) => s.code !== 'IMP-2026-00001')]);

    // 2. Insert pH Measurements: 7.21, 7.24, 7.22
    const scenarioResult: AnalysisResult = {
      id: 'res-scenario-1',
      sampleId: scenarioSample.id,
      sampleCode: 'IMP-2026-00001',
      parameterName: 'pH',
      methodCode: 'CH-PH-001',
      lab: 'Laboratoire de Chimie',
      analysisDate: '2026-08-04',
      analystId: currentUser.id,
      analystName: currentUser.name,
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
      analystComment: 'Scénario Test IMROP - Valeurs stables. Étalonnage 2 points (pH 4.01 et pH 7.00) conforme.',
      approvalStatus: 'Approuvé par Resp. Labo',
      analystSignatureDate: '2026-08-04 09:30',
      technicalCheckerName: 'Dr. Bouya M\'Beingue',
      technicalCheckerDate: '2026-08-04 10:15',
      labManagerName: 'Brahim Med Moustapha',
      labManagerApprovalDate: '2026-08-04 11:00',
      isLocked: true,
      isConform: true
    };

    setResults((prev) => [scenarioResult, ...prev.filter((r) => r.sampleCode !== 'IMP-2026-00001')]);

    // 3. Generate PDF Report
    const reportNum = 'REP-IMROP-2026-00001';
    await generateReportPDF(scenarioSample, [scenarioResult], reportNum, currentUser.name);

    const scenarioReport: Report = {
      id: 'rep-scenario-1',
      reportNumber: reportNum,
      sampleId: scenarioSample.id,
      sampleCode: scenarioSample.code,
      generatedDate: '2026-08-04',
      generatedBy: currentUser.name,
      lab: 'Laboratoire de Chimie',
      status: 'Généré',
      pdfFilename: `Rapport_${scenarioSample.code}.pdf`
    };

    setReports((prev) => [scenarioReport, ...prev.filter((r) => r.reportNumber !== reportNum)]);

    logAudit('Exécution Scénario Test IMROP', 'IMP-2026-00001', undefined, 'Mesures: 7.21, 7.24, 7.22 -> Moyenne: 7.223 pH -> Validé & Rapport PDF Généré');
    setActiveTab('results');
  };

  // Backup & Restoration JSON
  const exportBackupJSON = () => {
    const backupData = {
      samples,
      parameters,
      methods,
      results,
      instruments,
      calibrations,
      reagents,
      qualityControls,
      reports,
      auditLogs,
      exportDate: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMROP_Sauvegarde_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    logAudit('Sauvegarde Base de Données', 'Fichier JSON', undefined, 'Exportation complète réussie');
  };

  const importBackupJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.samples && data.results) {
        setSamples(data.samples);
        if (data.parameters) setParameters(data.parameters);
        if (data.methods) setMethods(data.methods);
        setResults(data.results);
        if (data.instruments) setInstruments(data.instruments);
        if (data.reagents) setReagents(data.reagents);
        if (data.reports) setReports(data.reports);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        logAudit('Restauration Base de Données', 'Fichier JSON', undefined, 'Restauration réussie');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  return (
    <LIMSContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        isAuthenticated,
        login,
        logout,
        samples,
        parameters,
        methods,
        results,
        instruments,
        calibrations,
        reagents,
        qualityControls,
        reports,
        analysisRequests,
        auditLogs,
        activeTab,
        setActiveTab,
        selectedSampleForResults,
        setSelectedSampleForResults,
        globalSearchQuery,
        setGlobalSearchQuery,
        addUser,
        updateUser,
        deleteUser,
        addAnalysisRequest,
        updateAnalysisRequest,
        convertRequestToSample,
        addSample,
        updateSampleStatus,
        deleteSample,
        saveAnalysisResult,
        submitForVerification,
        verifyTechnical,
        approveLabManager,
        addParameter,
        addMethod,
        addInstrument,
        updateInstrument,
        addCalibration,
        addReagent,
        updateReagent,
        addQualityControl,
        executeMandatoryTestScenario,
        exportBackupJSON,
        importBackupJSON,
        logAudit
      }}
    >
      {children}
    </LIMSContext.Provider>
  );
};

export const useLIMS = () => {
  const context = useContext(LIMSContext);
  if (!context) {
    throw new Error('useLIMS must be used within a LIMSProvider');
  }
  return context;
};
