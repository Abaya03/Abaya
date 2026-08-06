import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Calculator,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  FileCheck2,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { MeasurementRow, Sample, Instrument } from '../types/lims';

export const PhAnalysisForm: React.FC<{
  initialSampleCode?: string;
  onSuccess?: () => void;
}> = ({ initialSampleCode, onSuccess }) => {
  const {
    samples,
    instruments,
    methods,
    saveAnalysisResult,
    submitForVerification,
    verifyTechnical,
    approveLabManager,
    results,
    currentUser,
    setActiveTab,
    selectedSampleForResults
  } = useLIMS();

  const chemistrySamples = samples;
  const phInstruments = instruments;

  const [selectedSampleCode, setSelectedSampleCode] = useState<string>(
    initialSampleCode || selectedSampleForResults || samples[0]?.code || 'IMP-2026-00001'
  );
  const [parameterName, setParameterName] = useState<string>('pH');
  const [methodCode, setMethodCode] = useState<string>('CH-PH-001');
  const [selectedInstId, setSelectedInstId] = useState<string>(phInstruments[0]?.id || 'inst-1');
  const [analysisDate, setAnalysisDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [analystComment, setAnalystComment] = useState<string>(
    'Mesures physico-chimiques à 25.0°C. Étalonnage et contrôle qualité validés avant la série d\'analyses.'
  );

  useEffect(() => {
    if (selectedSampleForResults) {
      setSelectedSampleCode(selectedSampleForResults);
    }
  }, [selectedSampleForResults]);

  // Measurements array (Default to Section 23 scenario: 7.21, 7.24, 7.22)
  const [measurements, setMeasurements] = useState<MeasurementRow[]>([
    { id: 1, value: 7.21, temperature: 25.1, time: '09:15' },
    { id: 2, value: 7.24, temperature: 25.0, time: '09:18' },
    { id: 3, value: 7.22, temperature: 25.1, time: '09:21' }
  ]);

  // Selected sample object
  const targetSample = samples.find((s) => s.code === selectedSampleCode) || samples[0];
  const targetInstrument = instruments.find((i) => i.id === selectedInstId) || instruments[0];

  // Existing result for this sample and parameter if present
  const existingResult = results.find(
    (r) => r.sampleCode === selectedSampleCode && (r.parameterName === parameterName || (parameterName === 'pH' && r.parameterName.includes('pH')))
  );

  useEffect(() => {
    if (existingResult) {
      setMeasurements(existingResult.measurements);
      setAnalysisDate(existingResult.analysisDate);
      setAnalystComment(existingResult.analystComment || '');
      setMethodCode(existingResult.methodCode);
    }
  }, [selectedSampleCode, existingResult]);

  // Real-time automatic calculations
  const calculateStats = () => {
    if (measurements.length === 0) return { avg: 0, min: 0, max: 0, sd: 0, count: 0 };
    const vals = measurements.map((m) => m.value);
    const sum = vals.reduce((a, b) => a + b, 0);
    const avg = sum / vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    let sd = 0;
    if (vals.length > 1) {
      const variance = vals.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / (vals.length - 1);
      sd = Math.sqrt(variance);
    }

    return { avg, min, max, sd, count: vals.length };
  };

  const stats = calculateStats();

  const handleAddMeasurement = () => {
    const newId = measurements.length + 1;
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const lastTemp = measurements[measurements.length - 1]?.temperature || 25.0;
    const lastVal = measurements[measurements.length - 1]?.value || 7.22;

    setMeasurements([...measurements, { id: newId, value: lastVal, temperature: lastTemp, time: nowTime }]);
  };

  const handleRemoveMeasurement = (id: number) => {
    if (measurements.length <= 1) return;
    setMeasurements(measurements.filter((m) => m.id !== id));
  };

  const handleMeasurementChange = (id: number, field: keyof MeasurementRow, val: any) => {
    setMeasurements(
      measurements.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSample) return;

    let unit = 'unité pH';
    if (parameterName.includes('Salinité')) unit = 'PSU';
    else if (parameterName.includes('Conductivité')) unit = 'µS/cm';
    else if (parameterName.includes('Oxygène')) unit = 'mg/L';
    else if (parameterName.includes('Nitrate') || parameterName.includes('Phosphate')) unit = 'mg/L';

    saveAnalysisResult({
      id: existingResult?.id,
      sampleId: targetSample.id,
      sampleCode: targetSample.code,
      parameterName,
      methodCode,
      lab: targetSample.labAssigned || 'Laboratoire de Chimie',
      analysisDate,
      instrumentId: targetInstrument.id,
      instrumentName: targetInstrument.name,
      instrumentSerialNum: targetInstrument.serialNumber,
      measurements,
      unit,
      analystComment
    });

    if (onSuccess) onSuccess();
  };

  const handleTechnicalVerify = () => {
    if (existingResult) {
      verifyTechnical(existingResult.id);
    }
  };

  const handleLabManagerApprove = async () => {
    if (existingResult) {
      await approveLabManager(existingResult.id);
      setActiveTab('reports');
    }
  };

  const isLocked = existingResult?.isLocked || false;

  return (
    <div id="ph-analysis-form" className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#0f172a] p-5 rounded border border-slate-800 shadow-sm text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                LABORATOIRE DE CHIMIE — IMROP
              </span>
              <span className="text-xs text-slate-400 font-mono">CH-PH-001</span>
            </div>
            <h2 className="text-lg font-bold font-mono text-white mt-1">Formulaire d'Analyse du pH & Calculs Automatiques</h2>
            <p className="text-xs text-slate-300 font-mono">
              Saisie multi-mesures, calcul en temps réel (Moyenne, Écart-type), contrôle de température et validation ISO 17025.
            </p>
          </div>

          {/* Validation Status Badge */}
          {existingResult && (
            <div className="bg-slate-900 p-3 rounded border border-slate-800 text-right font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Niveau de Validation</span>
              <span className="text-xs font-bold text-teal-400 flex items-center gap-1 justify-end mt-0.5">
                <ShieldCheck className="w-4 h-4" />
                {existingResult.approvalStatus}
              </span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveResult} className="space-y-6">
        {/* Step 1: Meta Information Header */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <FlaskConical className="w-4 h-4 text-teal-600" />
            <span>1. Information de l'Analyse & Échantillon</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Sélectionner Échantillon</label>
              <select
                disabled={isLocked}
                value={selectedSampleCode}
                onChange={(e) => setSelectedSampleCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900 font-mono font-bold focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60"
              >
                {chemistrySamples.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.code} — {s.sampleType} ({s.applicant})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Paramètre à Analyser</label>
              <select
                disabled={isLocked}
                value={parameterName}
                onChange={(e) => setParameterName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900 font-mono font-bold focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60"
              >
                {targetSample?.requestedAnalyses && targetSample.requestedAnalyses.length > 0 ? (
                  targetSample.requestedAnalyses.map((item, idx) => (
                    <option key={idx} value={item.parameterName}>
                      {item.parameterName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="pH">pH à 25°C</option>
                    <option value="Salinité Pratique">Salinité Pratique (PSU)</option>
                    <option value="Conductivité électrique">Conductivité électrique (µS/cm)</option>
                    <option value="Oxygène dissous">Oxygène dissous (mg/L)</option>
                    <option value="Nitrates (NO3-)">Nitrates (NO3-)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Méthode d'Analyse</label>
              <select
                disabled={isLocked}
                value={methodCode}
                onChange={(e) => setMethodCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900 font-mono focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60"
              >
                {methods.map((m) => (
                  <option key={m.id} value={m.code}>
                    {m.code} — {m.name} ({m.normReference})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Appareil & N° Série</label>
              <select
                disabled={isLocked}
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-slate-900 font-mono focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60"
              >
                {phInstruments.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.serialNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sample Meta Context Card */}
          {targetSample && (
            <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-slate-700">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Demandeur:</span>
                <span className="font-bold text-slate-900">{targetSample.applicant}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Type d'échantillon:</span>
                <span className="font-bold text-slate-900">{targetSample.sampleType}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Date Prélèvement:</span>
                <span className="font-bold text-slate-900">{targetSample.samplingDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Date Analyse:</span>
                <input
                  type="date"
                  disabled={isLocked}
                  value={analysisDate}
                  onChange={(e) => setAnalysisDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-800 text-[11px] font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Measurements Table */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>2. Saisie des Mesures du pH</span>
            </h3>

            {!isLocked && (
              <button
                type="button"
                onClick={handleAddMeasurement}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs px-3 py-1 rounded transition-colors cursor-pointer border border-slate-200 font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une mesure</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-slate-800">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3 w-16">Mesure N°</th>
                  <th className="p-3">Valeur pH</th>
                  <th className="p-3">Température (°C)</th>
                  <th className="p-3">Heure</th>
                  {!isLocked && <th className="p-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-amber-600">#{m.id}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        disabled={isLocked}
                        value={m.value}
                        onChange={(e) => handleMeasurementChange(m.id, 'value', parseFloat(e.target.value) || 0)}
                        className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-slate-900 font-mono font-bold text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 w-32 disabled:opacity-60"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.1"
                        disabled={isLocked}
                        value={m.temperature || 25.0}
                        onChange={(e) => handleMeasurementChange(m.id, 'temperature', parseFloat(e.target.value) || 0)}
                        className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-slate-800 w-28 font-mono disabled:opacity-60"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        disabled={isLocked}
                        value={m.time}
                        onChange={(e) => handleMeasurementChange(m.id, 'time', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-slate-700 w-24 text-center font-mono disabled:opacity-60"
                      />
                    </td>
                    {!isLocked && (
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMeasurement(m.id)}
                          disabled={measurements.length <= 1}
                          className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Real-Time Automatic Calculations Display Box */}
          <div className="bg-teal-50 p-4 rounded border border-teal-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono">
            <div>
              <span className="text-[10px] text-teal-800 uppercase font-bold block">Nombre de Mesures</span>
              <span className="text-lg font-bold text-slate-900">{stats.count}</span>
            </div>
            <div>
              <span className="text-[10px] text-teal-800 uppercase font-bold block">Minimum</span>
              <span className="text-lg font-mono font-bold text-slate-800">{stats.min.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-teal-800 uppercase font-bold block">Maximum</span>
              <span className="text-lg font-mono font-bold text-slate-800">{stats.max.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-teal-800 uppercase font-bold block">Écart-Type (σ)</span>
              <span className="text-lg font-mono font-bold text-indigo-700">{stats.sd.toFixed(3)}</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-teal-600 rounded p-1 text-white shadow-sm">
              <span className="text-[10px] uppercase font-extrabold block text-teal-100">Moyenne Finale</span>
              <span className="text-xl font-mono font-black text-white">{stats.avg.toFixed(3)} pH</span>
            </div>
          </div>
        </div>

        {/* Step 3: Analyst Comment & Submit */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4 font-mono">
          <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>3. Observations & Commentaires de l'Analyste</span>
          </h3>

          <textarea
            rows={2}
            disabled={isLocked}
            value={analystComment}
            onChange={(e) => setAnalystComment(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-800 font-mono focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60"
            placeholder="Commentaires sur les conditions environnementales, la dérive de l'électrode..."
          />

          {/* Action Buttons & Multi-Level Signatures */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Analyste connecté: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isLocked && (
                <button
                  type="submit"
                  className="bg-[#0f172a] hover:bg-slate-800 text-white font-mono font-bold text-xs px-5 py-2.5 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider"
                >
                  Saisir & Soumettre les Mesures
                </button>
              )}

              {/* Technical Verification Button */}
              {existingResult && existingResult.approvalStatus === 'Soumis par Analyste' && (
                <button
                  type="button"
                  onClick={handleTechnicalVerify}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs px-4 py-2.5 rounded shadow-sm transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Vérification Technique (Resp. Tech)</span>
                </button>
              )}

              {/* Lab Manager Final Approval Button */}
              {existingResult && existingResult.approvalStatus === 'Vérifié par Resp. Technique' && (
                <button
                  type="button"
                  onClick={handleLabManagerApprove}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold text-xs px-5 py-2.5 rounded shadow-sm transition-all cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Validation Finale Labo & Générer Rapport PDF</span>
                </button>
              )}

              {isLocked && (
                <div className="bg-teal-50 text-teal-800 border border-teal-200 px-4 py-2 rounded font-mono font-bold text-xs flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span>Résultats Validés & Verrouillés</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export const ResultsModule: React.FC = () => {
  const { results, samples, verifyTechnical, approveLabManager, setActiveTab } = useLIMS();
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'list'>('form');

  return (
    <div id="lims-results-module" className="space-y-6 font-mono">
      {/* Subtab navigation */}
      <div className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200 shadow-sm text-xs">
        <button
          onClick={() => setActiveSubTab('form')}
          className={`px-4 py-2 rounded font-bold transition-colors cursor-pointer uppercase tracking-wider ${
            activeSubTab === 'form' ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Saisie / Édition Analyse Physico-Chimique
        </button>

        <button
          onClick={() => setActiveSubTab('list')}
          className={`px-4 py-2 rounded font-bold transition-colors cursor-pointer uppercase tracking-wider ${
            activeSubTab === 'list' ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Registre Tous Les Résultats ({results.length})
        </button>
      </div>

      {activeSubTab === 'form' ? (
        <PhAnalysisForm />
      ) : (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-800 bg-slate-50">
            Registre des Analyses Saisies & Chaîne de Validation ISO 17025
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Échantillon</th>
                  <th className="p-3.5">Paramètre & Méthode</th>
                  <th className="p-3.5">Moyenne Mesurée</th>
                  <th className="p-3.5">Écart-Type (S)</th>
                  <th className="p-3.5">Analyste Saisie</th>
                  <th className="p-3.5">Niveau Validation</th>
                  <th className="p-3.5 text-right">Actions Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-blue-700">{res.sampleCode}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{res.parameterName}</p>
                      <p className="text-[10px] text-slate-500">{res.methodCode}</p>
                    </td>
                    <td className="p-3.5 font-bold text-teal-700 text-sm">
                      {res.averageResult.toFixed(3)} {res.unit}
                    </td>
                    <td className="p-3.5 text-indigo-700">± {res.stdDeviation.toFixed(3)}</td>
                    <td className="p-3.5">{res.analystName}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                        res.approvalStatus === 'Approuvé par Resp. Labo'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : res.approvalStatus === 'Vérifié par Resp. Technique'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {res.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.approvalStatus === 'Soumis par Analyste' && (
                          <button
                            onClick={() => verifyTechnical(res.id)}
                            className="px-2.5 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm"
                          >
                            Vérifier (Resp. Tech)
                          </button>
                        )}

                        {res.approvalStatus === 'Vérifié par Resp. Technique' && (
                          <button
                            onClick={async () => {
                              await approveLabManager(res.id);
                              setActiveTab('reports');
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm"
                          >
                            Approuver Labo & PDF
                          </button>
                        )}

                        <button
                          onClick={() => setActiveTab('reports')}
                          className="px-2.5 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm"
                        >
                          Rapports PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
