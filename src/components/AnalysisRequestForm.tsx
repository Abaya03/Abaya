import React, { useState } from 'react';
import { FileText, Printer, Save, Plus, ArrowLeft, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { AnalysisRequest, AnalysisRequestItem } from '../types/lims';
import imropLogo from '../assets/images/imrop_new_official_logo_1786017881022.jpg';

export const AnalysisRequestForm: React.FC<{
  selectedRequest?: AnalysisRequest | null;
  onBack?: () => void;
  onNewRequest?: () => void;
  onRequestSaved?: (savedRequest: AnalysisRequest) => void;
}> = ({ selectedRequest, onBack, onNewRequest, onRequestSaved }) => {
  const {
    addAnalysisRequest,
    updateAnalysisRequest,
    convertRequestToSample,
    setSelectedSampleForResults,
    setActiveTab,
    currentUser
  } = useLIMS();

  const [clientId, setClientId] = useState(selectedRequest?.clientId || `CLI-IMROP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [clientName, setClientName] = useState(selectedRequest?.clientName || 'Direction de la Recherche IMROP');
  const [clientAddress, setClientAddress] = useState(
    selectedRequest?.clientAddress || 'BP 22, Cité de la Recherche Marine, Nouadhibou / Nouakchott, Mauritanie'
  );
  const [requestDateTime, setRequestDateTime] = useState(
    selectedRequest?.requestDateTime || new Date().toISOString().replace('T', ' ').substring(0, 16)
  );

  const defaultItems: AnalysisRequestItem[] = Array.from({ length: 10 }, (_, i) => {
    const existing = selectedRequest?.items?.[i];
    return {
      id: i + 1,
      parameterName: existing?.parameterName || (i === 0 ? 'Mesure du pH & Écart-type (ISO 10523)' : i === 1 ? 'Salinité Pratique (PSU)' : i === 2 ? 'Conductivité électrique à 25°C' : ''),
      desiredDeadline: existing?.desiredDeadline || (i < 3 ? '24 heures' : '')
    };
  });

  const [items, setItems] = useState<AnalysisRequestItem[]>(defaultItems);
  const [receivedBy, setReceivedBy] = useState(selectedRequest?.receivedBy || `${currentUser.name} (${currentUser.role})`);
  const [receivedDate, setReceivedDate] = useState(selectedRequest?.receivedDate || new Date().toISOString().substring(0, 10));

  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when selectedRequest changes or when reset for a new request
  React.useEffect(() => {
    if (selectedRequest) {
      setClientId(selectedRequest.clientId || '');
      setClientName(selectedRequest.clientName || '');
      setClientAddress(selectedRequest.clientAddress || '');
      setRequestDateTime(selectedRequest.requestDateTime || new Date().toISOString().replace('T', ' ').substring(0, 16));
      setReceivedBy(selectedRequest.receivedBy || `${currentUser.name} (${currentUser.role})`);
      setReceivedDate(selectedRequest.receivedDate || new Date().toISOString().substring(0, 10));

      const reqItems: AnalysisRequestItem[] = Array.from({ length: 10 }, (_, i) => {
        const existing = selectedRequest.items?.[i];
        return {
          id: i + 1,
          parameterName: existing?.parameterName || '',
          desiredDeadline: existing?.desiredDeadline || ''
        };
      });
      setItems(reqItems);
      setViewMode('edit');
    } else {
      // New request defaults
      setClientId(`CLI-IMROP-${Math.floor(1000 + Math.random() * 9000)}`);
      setClientName('Direction de la Recherche IMROP');
      setClientAddress('BP 22, Cité de la Recherche Marine, Nouadhibou / Nouakchott, Mauritanie');
      setRequestDateTime(new Date().toISOString().replace('T', ' ').substring(0, 16));
      setReceivedBy(`${currentUser.name} (${currentUser.role})`);
      setReceivedDate(new Date().toISOString().substring(0, 10));

      const freshItems: AnalysisRequestItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        parameterName: i === 0 ? 'Mesure du pH & Écart-type (ISO 10523)' : i === 1 ? 'Salinité Pratique (PSU)' : i === 2 ? 'Conductivité électrique à 25°C' : '',
        desiredDeadline: i < 3 ? '24 heures' : ''
      }));
      setItems(freshItems);
      setViewMode('edit');
    }
  }, [selectedRequest, currentUser]);

  const resetFormToNew = () => {
    setClientId(`CLI-IMROP-${Math.floor(1000 + Math.random() * 9000)}`);
    setClientName('Direction de la Recherche IMROP');
    setClientAddress('BP 22, Cité de la Recherche Marine, Nouadhibou / Nouakchott, Mauritanie');
    setRequestDateTime(new Date().toISOString().replace('T', ' ').substring(0, 16));
    setReceivedBy(`${currentUser.name} (${currentUser.role})`);
    setReceivedDate(new Date().toISOString().substring(0, 10));
    const freshItems: AnalysisRequestItem[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      parameterName: i === 0 ? 'Mesure du pH & Écart-type (ISO 10523)' : i === 1 ? 'Salinité Pratique (PSU)' : i === 2 ? 'Conductivité électrique à 25°C' : '',
      desiredDeadline: i < 3 ? '24 heures' : ''
    }));
    setItems(freshItems);
    setViewMode('edit');
    setSavedSuccess(false);

    if (onNewRequest) {
      onNewRequest();
    }
  };

  const handleItemChange = (index: number, field: 'parameterName' | 'desiredDeadline', val: string) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: val };
    setItems(copy);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedRequest) {
      updateAnalysisRequest(selectedRequest.id, {
        clientId,
        clientName,
        clientAddress,
        requestDateTime,
        items,
        receivedBy,
        receivedDate
      });
      if (onRequestSaved) {
        onRequestSaved({
          ...selectedRequest,
          clientId,
          clientName,
          clientAddress,
          requestDateTime,
          items,
          receivedBy,
          receivedDate
        });
      }
    } else {
      const created = addAnalysisRequest({
        clientId,
        clientName,
        clientAddress,
        requestDateTime,
        items,
        receivedBy,
        receivedDate,
        status: 'Soumise'
      });
      if (onRequestSaved) {
        onRequestSaved(created);
      }
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="lims-analysis-request-component" className="space-y-6 font-mono">
      {/* Top Action Bar */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                DOCUMENT QUALITÉ ENR-QUA-04-V1.0
              </span>
              <span className="text-xs text-slate-500 font-bold">IMROP / LABORATOIRE DE CHIMIE</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Demande d'Analyse (Modèle Officiel Quality Management)</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {selectedRequest && !selectedRequest.sampleCode && (
            <button
              onClick={() => {
                const sample = convertRequestToSample(selectedRequest.id);
                if (sample && onRequestSaved) {
                  onRequestSaved({ ...selectedRequest, sampleCode: sample.code, status: 'En cours' });
                }
              }}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>Créer Fiche Échantillon</span>
            </button>
          )}

          {selectedRequest && selectedRequest.sampleCode && (
            <button
              onClick={() => {
                if (selectedRequest.sampleCode) {
                  setSelectedSampleForResults(selectedRequest.sampleCode);
                  setActiveTab('results');
                }
              }}
              className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
            >
              <FileText className="w-3.5 h-3.5 text-purple-200" />
              <span>Saisir Résultats ({selectedRequest.sampleCode})</span>
            </button>
          )}

          <button
            onClick={resetFormToNew}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5 text-blue-200" />
            <span>Nouvelle Demande</span>
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
            className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold cursor-pointer transition-colors uppercase tracking-wider"
          >
            {viewMode === 'edit' ? 'Visualiser Document PDF (ENR-QUA-04-V1.0)' : 'Mode Édition Saisie'}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Save className="w-3.5 h-3.5 text-teal-400" />
            <span>Enregistrer</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-1.5 rounded shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-900 p-3 rounded text-xs font-bold flex items-center gap-2 print:hidden">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>Demande d'analyse enregistrée avec succès sous le modèle ENR-QUA-04-V1.0 !</span>
        </div>
      )}

      {/* EDIT FORM VIEW */}
      {viewMode === 'edit' && (
        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-6 print:hidden">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Saisie des Informations — Demande d'Analyse</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Réf: ENR-QUA-04-V1.0</span>
          </div>

          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* 1. Client Info */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">1. Informations Client</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Identifiant client</label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:ring-1 focus:ring-teal-500"
                    placeholder="ex: CLI-IMROP-0042"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nom du Client</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:ring-1 focus:ring-teal-500"
                    placeholder="ex: Direction de la Recherche IMROP"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Adresse</label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:ring-1 focus:ring-teal-500"
                    placeholder="Adresse complète"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date et Heure de demande</label>
                  <input
                    type="text"
                    value={requestDateTime}
                    onChange={(e) => setRequestDateTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Analyses demandées */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">2. Analyses demandées (10 lignes réglementaires)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-200">
                  <thead className="bg-[#1b62a5] text-white text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2 border border-slate-300 w-12 text-center">N°</th>
                      <th className="p-2 border border-slate-300">Paramètre / analyse demandée</th>
                      <th className="p-2 border border-slate-300 w-48">Délai souhaité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={it.id} className="bg-white">
                        <td className="p-2 border border-slate-200 font-bold text-center text-slate-700">{it.id}</td>
                        <td className="p-1 border border-slate-200">
                          <input
                            type="text"
                            value={it.parameterName}
                            onChange={(e) => handleItemChange(idx, 'parameterName', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono"
                            placeholder={`Paramètre #${it.id}`}
                          />
                        </td>
                        <td className="p-1 border border-slate-200">
                          <input
                            type="text"
                            value={it.desiredDeadline}
                            onChange={(e) => handleItemChange(idx, 'desiredDeadline', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 font-mono"
                            placeholder="ex: 24 heures / 48h"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Reçu par */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">3. Reçu par (Réception IMROP)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Reçu par (Nom & Qualité)</label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date et signature</label>
                  <input
                    type="text"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                className="bg-[#0f172a] hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded text-xs uppercase tracking-wider shadow"
              >
                Enregistrer La Demande ENR-QUA-04-V1.0
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OFFICIAL DOCUMENT REPLICA VIEW (ENR-QUA-04-V1.0) */}
      <div className={`bg-white p-8 rounded border border-slate-300 shadow-md max-w-4xl mx-auto text-slate-900 font-mono ${viewMode === 'edit' ? 'hidden sm:block opacity-90 scale-95 origin-top' : 'block'}`}>
        {/* Document Header exactly matching attached model */}
        <div className="border border-slate-900 grid grid-cols-12 text-center text-xs font-bold divide-x divide-slate-900">
          {/* Logo Column */}
          <div className="col-span-3 p-2 flex flex-col items-center justify-center bg-white">
            <img
              src={imropLogo}
              alt="Logo Officiel IMROP"
              className="w-16 h-16 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Title Column */}
          <div className="col-span-6 bg-[#d9e2ec] flex items-center justify-center p-4">
            <h1 className="text-lg font-black text-[#102a43] uppercase tracking-wider">Demande d’analyse</h1>
          </div>

          {/* Code Ref Column */}
          <div className="col-span-3 flex items-center justify-center p-3 font-black text-slate-900 text-sm bg-white">
            ENR-QUA-04-V1.0
          </div>
        </div>

        <div className="space-y-8 mt-8">
          {/* 1. Informations Client */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">1. Informations Client</h2>
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead>
                <tr className="bg-[#1b62a5] text-white">
                  <th className="border border-slate-900 p-2 text-left w-1/3 uppercase font-bold">Information</th>
                  <th className="border border-slate-900 p-2 text-left uppercase font-bold">Détail</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-2.5 font-bold bg-[#1b62a5] text-white">Identifiant client</td>
                  <td className="border border-slate-900 p-2.5 font-bold text-slate-900">{clientId || '-'}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-2.5 font-bold bg-[#1b62a5] text-white">Nom du Client</td>
                  <td className="border border-slate-900 p-2.5 font-bold text-slate-900">{clientName || '-'}</td>
                </tr>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-2.5 font-bold bg-[#1b62a5] text-white">Adresse</td>
                  <td className="border border-slate-900 p-2.5 text-slate-900">{clientAddress || '-'}</td>
                </tr>
                <tr>
                  <td className="border border-slate-900 p-2.5 font-bold bg-[#1b62a5] text-white">Date et Heure de demande</td>
                  <td className="border border-slate-900 p-2.5 text-slate-900 font-bold">{requestDateTime || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Analyses demandées */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900">2. Analyses demandées</h2>
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead>
                <tr className="bg-[#1b62a5] text-white font-bold">
                  <th className="border border-slate-900 p-2 w-12 text-center">N°</th>
                  <th className="border border-slate-900 p-2 text-left">Paramétre/analyse demandée</th>
                  <th className="border border-slate-900 p-2 text-left w-56">Délai souhaité</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="h-8 border-b border-slate-900">
                    <td className="border border-slate-900 p-1.5 text-center font-bold">{it.id}</td>
                    <td className="border border-slate-900 p-1.5 font-semibold text-slate-900">{it.parameterName || ''}</td>
                    <td className="border border-slate-900 p-1.5 text-slate-800">{it.desiredDeadline || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. Reçu par */}
          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-bold text-slate-900">Reçu par</h2>
            <div className="text-xs space-y-4">
              <p className="font-bold text-slate-900">Date et signature :</p>
              <div className="border border-slate-900 rounded p-4 h-24 flex items-end justify-between bg-slate-50/50">
                <span className="text-slate-600 font-bold">{receivedBy}</span>
                <span className="text-slate-500 text-[10px] italic">Signé le {receivedDate} (Cachet Réception)</span>
              </div>
            </div>
          </div>

          {/* Legal Notice & ISO Quality Grid Footer */}
          <div className="space-y-4 pt-6 border-t border-slate-300 text-[9px] leading-snug text-slate-700">
            <p className="text-justify font-sans">
              <strong>Collecte :</strong> après formalisation du document – <strong>Classement :</strong> alphanumérique – <strong>Stockage :</strong> fichier informatique (seule la version électronique fait foi) – <strong>Accès :</strong> libre – <strong>Durée de conservation :</strong> 2 ans après nouvelle version datée – <strong>Élimination :</strong> suppression fichier électronique.
            </p>

            {/* ISO 17025 Quality Metadata Table */}
            <table className="w-full border-collapse border border-slate-900 text-[10px] text-center font-mono">
              <tbody>
                <tr className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1.5 w-1/3 font-bold">Rédigé par : CQ IMROP</td>
                  <td className="border border-slate-900 p-1.5 w-1/3 font-black text-slate-900">ENR-QUA-04-V1.0</td>
                  <td className="border border-slate-900 p-1.5 w-1/3 font-bold">Page 1 de 1</td>
                </tr>
                <tr>
                  <td className="border border-slate-900 p-1.5 font-bold">Approuvé par : Chef Unité Chimie Marine</td>
                  <td className="border border-slate-900 p-1.5 font-bold">Attribution : LABORATOIRE DE CHIMIE</td>
                  <td className="border border-slate-900 p-1.5 font-bold">Communication : Tous</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
