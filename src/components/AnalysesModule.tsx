import React, { useState } from 'react';
import { FileSpreadsheet, Plus, FileText, Eye, CheckCircle2, FlaskConical } from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { AnalysisRequestForm } from './AnalysisRequestForm';
import { AnalysisRequest } from '../types/lims';

export const AnalysesModule: React.FC = () => {
  const {
    samples,
    results,
    analysisRequests,
    convertRequestToSample,
    setSelectedSampleForResults,
    setActiveTab
  } = useLIMS();

  const [activeSubTab, setActiveSubTab] = useState<'form' | 'requests' | 'cycle'>('form');
  const [selectedReq, setSelectedReq] = useState<AnalysisRequest | null>(null);
  const [formKey, setFormKey] = useState<number>(Date.now());

  const handleCreateNew = () => {
    setSelectedReq(null);
    setFormKey(Date.now());
    setActiveSubTab('form');
  };

  const handleSelectRequest = (req: AnalysisRequest) => {
    setSelectedReq(req);
    setActiveSubTab('form');
  };

  return (
    <div id="lims-analyses-module" className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900">Demandes d'Analyse (Modèle ENR-QUA-04-V1.0)</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              ISO 17025
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestion des demandes clients, modèle officiel ENR-QUA-04-V1.0, 10 paramètres réglementaires et suivi du cycle de vie des analyses.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white font-mono font-bold text-xs px-4 py-2 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>Nouvelle Demande ENR-QUA-04-V1.0</span>
        </button>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded border border-slate-200 shadow-sm text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('form')}
          className={`px-4 py-2 rounded font-bold transition-colors cursor-pointer uppercase tracking-wider shrink-0 ${
            activeSubTab === 'form' ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Formulaire & Document ENR-QUA-04-V1.0</span>
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-2 rounded font-bold transition-colors cursor-pointer uppercase tracking-wider shrink-0 ${
            activeSubTab === 'requests' ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Registre des Demandes ({analysisRequests.length})
        </button>

        <button
          onClick={() => setActiveSubTab('cycle')}
          className={`px-4 py-2 rounded font-bold transition-colors cursor-pointer uppercase tracking-wider shrink-0 ${
            activeSubTab === 'cycle' ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Suivi des Analyses pH / Échantillons
        </button>
      </div>

      {/* SUBTAB 1: Form & Printable Document */}
      {activeSubTab === 'form' && (
        <AnalysisRequestForm
          key={selectedReq ? selectedReq.id : `new-request-${formKey}`}
          selectedRequest={selectedReq}
          onBack={() => setActiveSubTab('requests')}
          onNewRequest={handleCreateNew}
          onRequestSaved={(savedReq) => setSelectedReq(savedReq)}
        />
      )}

      {/* SUBTAB 2: Requests Register */}
      {activeSubTab === 'requests' && (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider bg-slate-50 flex items-center justify-between gap-4">
            <span>Registre des Demandes d'Analyse Reçues (Formulaire ENR-QUA-04-V1.0)</span>
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">Norme IMROP CHIMIE</span>
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 text-white font-mono font-bold text-xs px-3 py-1.5 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-teal-400" />
                <span>Nouvelle Demande</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-slate-800">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Document Réf</th>
                  <th className="p-3.5">Identifiant & Client</th>
                  <th className="p-3.5">Date & Heure Demande</th>
                  <th className="p-3.5">Paramètres Inscrits</th>
                  <th className="p-3.5">Reçu Par</th>
                  <th className="p-3.5">Statut</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysisRequests.map((req) => {
                  const paramCount = req.items.filter((i) => i.parameterName.trim() !== '').length;

                  return (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-blue-700">
                        <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {req.docRef}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{req.clientName}</p>
                        <p className="text-[10px] text-slate-500">{req.clientId}</p>
                      </td>
                      <td className="p-3.5 text-slate-700">{req.requestDateTime}</td>
                      <td className="p-3.5 font-bold text-teal-800">
                        {paramCount} analyse(s) renseignée(s)
                      </td>
                      <td className="p-3.5 text-slate-700">{req.receivedBy}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 block w-max">
                          {req.status}
                        </span>
                        {req.sampleCode && (
                          <span className="text-[10px] text-blue-700 font-bold block mt-1">
                            Code: {req.sampleCode}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!req.sampleCode && (
                            <button
                              onClick={() => convertRequestToSample(req.id)}
                              className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-1"
                              title="Créer l'échantillon rattaché à cette demande"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                              <span>Créer Échantillon</span>
                            </button>
                          )}

                          {req.sampleCode && (
                            <button
                              onClick={() => {
                                if (req.sampleCode) {
                                  setSelectedSampleForResults(req.sampleCode);
                                  setActiveTab('results');
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-purple-700 hover:bg-purple-600 text-white font-mono font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-1"
                              title="Saisir ou vérifier les résultats d'analyse"
                            >
                              <FlaskConical className="w-3 h-3 text-purple-200" />
                              <span>Saisir Résultats</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleSelectRequest(req)}
                            className="px-2.5 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-white font-mono font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-sm flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3 text-teal-400" />
                            <span>ENR-QUA-04</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Cycle of Samples & pH Analyses */}
      {activeSubTab === 'cycle' && (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider bg-slate-50">
            Suivi du Cycle de Vie des Analyses de Laboratoire
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-slate-800">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Code Échantillon</th>
                  <th className="p-3.5">Paramètre à Analyser</th>
                  <th className="p-3.5">Laboratoire Assigned</th>
                  <th className="p-3.5">Date Réception</th>
                  <th className="p-3.5">Statut Cycle</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {samples.map((s) => {
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-blue-700">{s.code}</td>
                      <td className="p-3.5 font-bold text-slate-900">pH, Salinité, Conductivité</td>
                      <td className="p-3.5 text-slate-700">{s.labAssigned}</td>
                      <td className="p-3.5 text-slate-700">{s.receptionDate}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedSampleForResults(s.code);
                            setActiveTab('results');
                          }}
                          className="px-3 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-white font-mono font-bold text-xs cursor-pointer shadow-sm uppercase tracking-wider"
                        >
                          Saisir / Vérifier pH
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
