import React, { useState } from 'react';
import {
  TestTube2,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Calendar,
  MapPin,
  Building,
  UserCheck,
  Thermometer,
  FileText,
  Camera,
  X,
  Download,
  FileCheck2,
  FilePlus
} from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { Sample, SampleStatus, SampleType, LabType, RequestedAnalysisItem } from '../types/lims';
import { ReceptionFormModal } from './ReceptionFormModal';
import { generateReceptionFormPDF } from '../utils/pdfGenerator';

export const SamplesModule: React.FC = () => {
  const { samples, addSample, updateSampleStatus, deleteSample, setActiveTab, globalSearchQuery } = useLIMS();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSampleForModal, setSelectedSampleForModal] = useState<Sample | null>(null);
  const [selectedSampleForLabel, setSelectedSampleForLabel] = useState<Sample | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('TOUS');

  // New Reception Form (ENR-CHI-02-V2.0) State
  const [formData, setFormData] = useState({
    // Section 1: Identification
    receptionDate: new Date().toISOString().substring(0, 10),
    receptionTime: '09:30',
    receivedBy: 'Mohamed Abdallahi',
    verifiedBy: 'Brahim Med Moustapha',
    verifiedDate: new Date().toISOString().substring(0, 10),
    applicant: 'Direction de la Recherche IMROP',
    organization: 'Centre de Nouakchott',

    // Section 2: Description
    sampleType: 'Eau de mer' as SampleType,
    matrix: 'Eau de mer littorale',
    unitsCount: 1,
    volumeMass: '1000 mL',
    containerType: 'Flacon Polyéthylène Haute Densité (PEHD)',

    // Location & Sampling
    origin: 'Zone maritime',
    location: 'Station Littoral St-1',
    samplingDate: new Date().toISOString().substring(0, 10),
    sampler: 'Mohamed Abdallahi',

    // Section 3: État à la réception
    storageCondition: 'Réfrigéré (4°C)',
    temperature: 4.0,
    generalAspect: 'Limpide, incolore, sans particules',
    acceptanceStatus: 'Accepté' as 'Accepté' | 'Rejeté' | 'Sous réserve',

    // Legacy / Extra
    quantity: 1000,
    unit: 'mL',
    description: 'Prélèvement d\'eau de mer pour contrôle physico-chimique routine',
    observations: 'Prélèvement conforme aux exigences de l\'IMROP',
    labAssigned: 'Laboratoire de Chimie' as LabType,

    // Section 4: Analyses demandées (1-9)
    requestedAnalyses: [
      { id: 1, parameterName: 'pH à 25°C', methodNorm: 'ISO 10523:2008 / CH-PH-001', desiredDeadline: '24h' },
      { id: 2, parameterName: 'Salinité Pratique', methodNorm: 'CH-SAL-002', desiredDeadline: '48h' },
      { id: 3, parameterName: 'Conductivité électrique', methodNorm: 'CH-COND-003', desiredDeadline: '24h' },
      { id: 4, parameterName: 'Oxygène dissous', methodNorm: 'ISO 17289:2014', desiredDeadline: '48h' },
      { id: 5, parameterName: 'Nitrates (NO3-)', methodNorm: 'CH-NUT-004', desiredDeadline: '3 jours' },
      { id: 6, parameterName: 'Phosphates (PO4 3-)', methodNorm: 'CH-NUT-005', desiredDeadline: '3 jours' },
      { id: 7, parameterName: '', methodNorm: '', desiredDeadline: '' },
      { id: 8, parameterName: '', methodNorm: '', desiredDeadline: '' },
      { id: 9, parameterName: '', methodNorm: '', desiredDeadline: '' }
    ] as RequestedAnalysisItem[]
  });

  const handleAnalysisRowChange = (index: number, field: keyof RequestedAnalysisItem, value: string) => {
    const updated = [...formData.requestedAnalyses];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setFormData({ ...formData, requestedAnalyses: updated });
  };

  const handleCreateSample = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRequestedAnalyses = formData.requestedAnalyses.filter((r) => r.parameterName.trim() !== '');
    const created = addSample({
      ...formData,
      requestedAnalyses: cleanRequestedAnalyses
    });
    setShowAddModal(false);
    setSelectedSampleForModal(created);
  };

  const handleDownloadDirectPDF = async (s: Sample) => {
    try {
      const { pdfBlob } = await generateReceptionFormPDF(s);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Fiche_Reception_${s.code}_ENR-CHI-02-V2.0.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur télécharment PDF:', err);
    }
  };

  // Filtered samples
  const filteredSamples = samples.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      s.applicant.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      s.origin.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      s.sampleType.toLowerCase().includes(globalSearchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'TOUS' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: SampleStatus) => {
    const styles: Record<SampleStatus, string> = {
      Reçu: 'bg-blue-50 text-blue-700 border-blue-200',
      'En attente': 'bg-amber-50 text-amber-700 border-amber-200',
      'En analyse': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Analyse terminée': 'bg-teal-50 text-teal-700 border-teal-200',
      'En validation': 'bg-purple-50 text-purple-700 border-purple-200',
      Validé: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Rapport généré': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      Archivé: 'bg-slate-100 text-slate-600 border-slate-200',
      Rejeté: 'bg-red-50 text-red-700 border-red-200'
    };

    return (
      <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded border ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {status}
      </span>
    );
  };

  return (
    <div id="lims-samples-module" className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold font-mono text-slate-900">
              Fiche des Réceptions LABO — ENR-CHI-02-V2.0
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Enregistrement officiel de réception, description de la matrice, état à la réception, analyses demandées et fiches PDF.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('analyses')}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-mono font-bold text-xs px-3.5 py-2 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider"
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Demande ENR-QUA-04</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white font-mono font-bold text-xs px-4 py-2 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 text-teal-400" />
            <span>Nouvelle Fiche de Réception</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0 mr-1 uppercase">
          <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtrer:
        </span>
        {['TOUS', 'Reçu', 'En analyse', 'Analyse terminée', 'En validation', 'Validé', 'Rapport généré'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded font-bold transition-colors cursor-pointer shrink-0 uppercase text-[11px] ${
              statusFilter === st
                ? 'bg-[#0f172a] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Reception Sheets Table */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-800">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Identification</th>
                <th className="p-3.5">Nature & Matrice</th>
                <th className="p-3.5">Contenant & Volume</th>
                <th className="p-3.5">Acceptation & État</th>
                <th className="p-3.5">Demandeur & Origine</th>
                <th className="p-3.5">Date & Réceptionné par</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSamples.map((sample) => (
                <tr key={sample.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">
                    <div>
                      <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                        {sample.code}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">ENR-CHI-02-V2.0</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{sample.sampleType}</p>
                    <p className="text-[10px] text-slate-500">{sample.matrix || 'Eau de mer littorale'}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{sample.volumeMass || `${sample.quantity} ${sample.unit}`}</p>
                    <p className="text-[10px] text-slate-500">{sample.containerType || 'Flacon PEHD'}</p>
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      sample.acceptanceStatus === 'Rejeté'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : sample.acceptanceStatus === 'Sous réserve'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}>
                      {sample.acceptanceStatus || 'Accepté'}
                    </span>
                    <p className="text-[10px] text-slate-500 truncate max-w-[140px] mt-1">{sample.generalAspect || 'Conforme'}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{sample.applicant}</p>
                    <p className="text-[10px] text-slate-500">{sample.origin}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="text-slate-800">{sample.receptionDate} ({sample.receptionTime || '09:00'})</p>
                    <p className="text-[10px] text-slate-500">{sample.receivedBy || sample.sampler}</p>
                  </td>
                  <td className="p-3.5">{getStatusBadge(sample.status)}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedSampleForModal(sample)}
                        title="Voir Fiche de Réception Officielle (ENR-CHI-02-V2.0)"
                        className="flex items-center gap-1 p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors cursor-pointer border border-blue-200 font-bold text-[10px]"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>Fiche</span>
                      </button>

                      <button
                        onClick={() => handleDownloadDirectPDF(sample)}
                        title="Télécharger Fiche PDF ENR-CHI-02-V2.0"
                        className="p-1.5 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setSelectedSampleForLabel(sample)}
                        title="Étiquette Flacon / QR Code"
                        className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setActiveTab('results')}
                        title="Saisir Analyse pH"
                        className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer text-[10px] font-bold"
                      >
                        pH
                      </button>

                      <button
                        onClick={() => deleteSample(sample.id)}
                        title="Supprimer"
                        className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSamples.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-mono">
                    Aucune fiche de réception ne correspond à la recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Reception Form (ENR-CHI-02-V2.0) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-6 space-y-5 my-8 shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    Enregistrement de Réception (ENR-CHI-02-V2.0)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Formulaire conforme à la fiche qualité ISO 17025 de l'IMROP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSample} className="space-y-6">
              {/* SECTION 1: IDENTIFICATION */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                <h4 className="font-mono font-bold text-teal-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> 1. IDENTIFICATION
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date de Réception</label>
                    <input
                      type="date"
                      required
                      value={formData.receptionDate}
                      onChange={(e) => setFormData({ ...formData, receptionDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Heure de Réception</label>
                    <input
                      type="time"
                      required
                      value={formData.receptionTime}
                      onChange={(e) => setFormData({ ...formData, receptionTime: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Réceptionné par</label>
                    <input
                      type="text"
                      required
                      value={formData.receivedBy}
                      onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Demandeur</label>
                    <input
                      type="text"
                      required
                      value={formData.applicant}
                      onChange={(e) => setFormData({ ...formData, applicant: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Organisme / Service</label>
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Laboratoire Destinataire</label>
                    <select
                      value={formData.labAssigned}
                      onChange={(e) => setFormData({ ...formData, labAssigned: e.target.value as LabType })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    >
                      <option value="Laboratoire de Chimie">Laboratoire de Chimie</option>
                      <option value="Laboratoire d'Analyses environnementales">Laboratoire d'Analyses environnementales</option>
                      <option value="Laboratoire de Biologie">Laboratoire de Biologie</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DESCRIPTION DE L'ÉCHANTILLON */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                <h4 className="font-mono font-bold text-teal-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> 2. DESCRIPTION DE L'ÉCHANTILLON
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nature (Type)</label>
                    <select
                      value={formData.sampleType}
                      onChange={(e) => setFormData({ ...formData, sampleType: e.target.value as SampleType })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    >
                      <option value="Eau de mer">Eau de mer</option>
                      <option value="Eau douce">Eau douce</option>
                      <option value="Sédiment">Sédiment</option>
                      <option value="Poisson">Poisson</option>
                      <option value="Crustacé">Crustacé</option>
                      <option value="Mollusque">Mollusque</option>
                      <option value="Plancton">Plancton</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Matrice Précise</label>
                    <input
                      type="text"
                      required
                      value={formData.matrix}
                      onChange={(e) => setFormData({ ...formData, matrix: e.target.value })}
                      placeholder="e.g. Eau de mer littorale, Tissu musculaire"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nombre d'unités reçues</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.unitsCount}
                      onChange={(e) => setFormData({ ...formData, unitsCount: parseInt(e.target.value) || 1 })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Volume / Masse Totale</label>
                    <input
                      type="text"
                      required
                      value={formData.volumeMass}
                      onChange={(e) => setFormData({ ...formData, volumeMass: e.target.value })}
                      placeholder="e.g. 1000 mL, 2.5 kg"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">Type de Contenant</label>
                    <input
                      type="text"
                      required
                      value={formData.containerType}
                      onChange={(e) => setFormData({ ...formData, containerType: e.target.value })}
                      placeholder="e.g. Flacon PEHD 1000 mL stérile, Sac sous vide"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: ÉTAT À LA RÉCEPTION */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                <h4 className="font-mono font-bold text-teal-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> 3. ÉTAT À LA RÉCEPTION
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Aspect Général / État</label>
                    <input
                      type="text"
                      required
                      value={formData.generalAspect}
                      onChange={(e) => setFormData({ ...formData, generalAspect: e.target.value })}
                      placeholder="e.g. Limpide, incolore, réfrigéré à 4°C"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Acceptation de l'échantillon</label>
                    <select
                      value={formData.acceptanceStatus}
                      onChange={(e) => setFormData({ ...formData, acceptanceStatus: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold"
                    >
                      <option value="Accepté">Accepté (Conforme)</option>
                      <option value="Sous réserve">Sous réserve</option>
                      <option value="Rejeté">Rejeté (Non conforme)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 4: ANALYSES DEMANDÉES (1 à 9) */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                <h4 className="font-mono font-bold text-teal-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> 4. ANALYSES DEMANDÉES (Tableau 1 à 9)
                </h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] font-mono font-bold text-slate-400 px-1">
                    <span className="col-span-1 text-center">N°</span>
                    <span className="col-span-5">Paramètre / Analyse demandée</span>
                    <span className="col-span-4">Méthode / Norme</span>
                    <span className="col-span-2 text-center">Délai souhaité</span>
                  </div>

                  {formData.requestedAnalyses.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <span className="col-span-1 text-center font-bold font-mono text-teal-300">{idx + 1}</span>
                      <input
                        type="text"
                        value={item.parameterName}
                        onChange={(e) => handleAnalysisRowChange(idx, 'parameterName', e.target.value)}
                        placeholder={`Paramètre ${idx + 1}...`}
                        className="col-span-5 bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                      />
                      <input
                        type="text"
                        value={item.methodNorm || ''}
                        onChange={(e) => handleAnalysisRowChange(idx, 'methodNorm', e.target.value)}
                        placeholder="Norme/Méthode..."
                        className="col-span-4 bg-slate-900 border border-slate-700 rounded p-1.5 text-white"
                      />
                      <input
                        type="text"
                        value={item.desiredDeadline || ''}
                        onChange={(e) => handleAnalysisRowChange(idx, 'desiredDeadline', e.target.value)}
                        placeholder="Délai (24h...)"
                        className="col-span-2 bg-slate-900 border border-slate-700 rounded p-1.5 text-white text-center font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: SIGNATURES */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-3">
                <h4 className="font-mono font-bold text-teal-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" /> 5. SIGNATURES & HIERARCHIE
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Vérifié par (Nom)</label>
                    <input
                      type="text"
                      required
                      value={formData.verifiedBy}
                      onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date de Vérification</label>
                    <input
                      type="date"
                      required
                      value={formData.verifiedDate}
                      onChange={(e) => setFormData({ ...formData, verifiedDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-500 shadow-md cursor-pointer font-mono"
                >
                  Enregistrer & Générer Fiche ENR-CHI-02-V2.0
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Reception Form Viewer (ENR-CHI-02-V2.0) */}
      {selectedSampleForModal && (
        <ReceptionFormModal
          sample={selectedSampleForModal}
          onClose={() => setSelectedSampleForModal(null)}
        />
      )}

      {/* Modal: QR Bottle Label Preview */}
      {selectedSampleForLabel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {selectedSampleForLabel.code}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">Étiquette Flacon & QR Code</h3>
              </div>
              <button
                onClick={() => setSelectedSampleForLabel(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bottle Label Preview */}
            <div className="bg-white text-slate-900 rounded-xl p-4 border-2 border-dashed border-blue-400 flex items-center justify-between">
              <div>
                <div className="font-extrabold text-sm tracking-tight">IMROP — CENTRE DE NOUAKCHOTT</div>
                <div className="font-mono font-bold text-lg text-blue-700">{selectedSampleForLabel.code}</div>
                <div className="text-[10px] text-slate-600">
                  {selectedSampleForLabel.sampleType} | {selectedSampleForLabel.origin} | {selectedSampleForLabel.receptionDate}
                </div>
              </div>
              <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded flex flex-col items-center justify-center p-1">
                <QrCode className="w-10 h-10 text-slate-800" />
                <span className="text-[8px] font-mono font-bold">IMP-LAB</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedSampleForLabel(null);
                  setActiveTab('results');
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 cursor-pointer font-mono"
              >
                Saisir l'Analyse pH pour cet échantillon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

