import React, { useState } from 'react';
import { FileText, Download, Printer, X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Sample } from '../types/lims';
import { generateReceptionFormPDF } from '../utils/pdfGenerator';
import imropLogo from '../assets/images/imrop_new_official_logo_1786017881022.jpg';

interface ReceptionFormModalProps {
  sample: Sample;
  onClose: () => void;
}

export const ReceptionFormModal: React.FC<ReceptionFormModalProps> = ({ sample, onClose }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { pdfBlob } = await generateReceptionFormPDF(sample);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Fiche_Reception_${sample.code}_ENR-CHI-02-V2.0.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur génération PDF réception:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Build 9 rows for Section 4
  const requestedItems = sample.requestedAnalyses || [];
  const rows = [];
  for (let i = 1; i <= 9; i++) {
    const item = requestedItems.find((r) => r.id === i) || requestedItems[i - 1];
    rows.push({
      num: i,
      parameter: item ? item.parameterName : '',
      methodNorm: item ? item.methodNorm || '' : '',
      deadline: item ? item.desiredDeadline || '' : ''
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl p-4 sm:p-6 space-y-4 my-6 shadow-2xl text-slate-900 max-h-[92vh] flex flex-col">
        {/* Modal Header bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-base font-bold font-mono">Fiche d'Enregistrement de Réception</h3>
              <p className="text-[11px] text-slate-400 font-mono">Modèle officiel ISO 17025 — ENR-CHI-02-V2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? 'Génération...' : 'Télécharger PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold px-3 py-1.5 rounded border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Document View - Styled exactly like the PDF Model */}
        <div className="flex-1 overflow-y-auto bg-white p-6 rounded-lg border border-slate-300 shadow-inner text-xs font-sans space-y-4 select-text">
          {/* Document Header */}
          <div className="grid grid-cols-12 items-center gap-2 border-b-2 border-slate-200 pb-4">
            <div className="col-span-3 flex justify-start">
              <img src={imropLogo} alt="Logo IMROP" className="h-16 w-16 object-contain" />
            </div>

            <div className="col-span-6 text-center">
              <div className="bg-[#e0ebf5] border border-[#b4c8dc] py-2 px-4 rounded shadow-xs">
                <h1 className="text-lg font-bold text-[#1e56a0] tracking-wide font-serif">
                  Enregistrement de réception
                </h1>
              </div>
            </div>

            <div className="col-span-3 text-right">
              <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2.5 py-1 rounded border border-slate-300 inline-block">
                ENR-CHI-02-V2.0
              </span>
            </div>
          </div>

          {/* Section 1: IDENTIFICATION */}
          <div>
            <div className="bg-[#1e73be] text-white font-bold px-3 py-1 text-xs uppercase tracking-wider mb-1 rounded-xs flex items-center justify-between">
              <span>1. IDENTIFICATION</span>
            </div>
            <div className="border border-[#b4c8dc] grid grid-cols-2 divide-x divide-y divide-[#b4c8dc] bg-slate-50/50">
              <div className="p-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">N° d'identification de l’échantillon</span>
                <span className="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {sample.code}
                </span>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">Date de réception</span>
                <span className="font-medium text-slate-900">{sample.receptionDate}</span>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">Heure de réception</span>
                <span className="font-medium text-slate-900">{sample.receptionTime || '09:00'}</span>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">Réceptionné par</span>
                <span className="font-medium text-slate-900">{sample.receivedBy || sample.sampler || 'Mohamed Abdallahi'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: DESCRIPTION DE L'ÉCHANTILLON */}
          <div>
            <div className="bg-[#1e73be] text-white font-bold px-3 py-1 text-xs uppercase tracking-wider mb-1 rounded-xs">
              2. DESCRIPTION DE L'ÉCHANTILLON
            </div>
            <div className="border border-[#b4c8dc] grid grid-cols-2 divide-x divide-y divide-[#b4c8dc] bg-slate-50/50">
              <div className="p-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">Nature</span>
                <span className="font-semibold text-slate-900">{sample.sampleType}</span>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">Matrice</span>
                <span className="font-medium text-slate-900">{sample.matrix || 'Eau de mer littorale'}</span>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">Nombre d'unités reçues</span>
                <span className="font-medium text-slate-900">{sample.unitsCount || 1} unité(s)</span>
              </div>
              <div className="p-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">Volume / Masse totale</span>
                <span className="font-medium text-slate-900">{sample.volumeMass || `${sample.quantity} ${sample.unit}`}</span>
              </div>
              <div className="p-2 col-span-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">Type de contenant</span>
                <span className="font-medium text-slate-900">{sample.containerType || 'Flacon PEHD 1000 mL stérile'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: ÉTAT À LA RÉCEPTION */}
          <div>
            <div className="bg-[#1e73be] text-white font-bold px-3 py-1 text-xs uppercase tracking-wider mb-1 rounded-xs">
              3. ÉTAT À LA RÉCEPTION
            </div>
            <div className="border border-[#b4c8dc] divide-y divide-[#b4c8dc] bg-slate-50/50">
              <div className="p-2.5 flex items-center justify-between">
                <span className="font-bold text-slate-700">Aspect général / État</span>
                <span className="font-medium text-slate-900">{sample.generalAspect || sample.observations || 'Limpide, incolore, sans particule'}</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <span className="font-bold text-slate-700">Acceptation de l’échantillon</span>
                <span className={`px-2.5 py-0.5 font-bold rounded text-xs border ${
                  sample.acceptanceStatus === 'Rejeté'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : sample.acceptanceStatus === 'Sous réserve'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                }`}>
                  {sample.acceptanceStatus || 'Accepté'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: ANALYSES DEMANDÉES */}
          <div>
            <div className="bg-[#1e73be] text-white font-bold px-3 py-1 text-xs uppercase tracking-wider mb-1 rounded-xs">
              4. ANALYSES DEMANDÉES
            </div>
            <table className="w-full border-collapse border border-[#b4c8dc] text-xs">
              <thead>
                <tr className="bg-[#e0ebf5] text-slate-800 font-bold border-b border-[#b4c8dc]">
                  <th className="p-2 text-center border-r border-[#b4c8dc] w-12">N°</th>
                  <th className="p-2 text-left border-r border-[#b4c8dc]">Paramètre / Analyse demandée</th>
                  <th className="p-2 text-left border-r border-[#b4c8dc]">Méthode / Norme</th>
                  <th className="p-2 text-center w-36">Délai souhaité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#b4c8dc]">
                {rows.map((row) => (
                  <tr key={row.num} className="hover:bg-slate-50">
                    <td className="p-2 text-center font-bold border-r border-[#b4c8dc] bg-slate-50">{row.num}</td>
                    <td className="p-2 border-r border-[#b4c8dc] font-medium text-slate-900">{row.parameter || '—'}</td>
                    <td className="p-2 border-r border-[#b4c8dc] text-slate-700">{row.methodNorm || '—'}</td>
                    <td className="p-2 text-center text-slate-800 font-mono">{row.deadline || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 5: SIGNATURES */}
          <div>
            <div className="bg-[#1e73be] text-white font-bold px-3 py-1 text-xs uppercase tracking-wider mb-1 rounded-xs">
              5. SIGNATURES
            </div>
            <div className="border border-[#b4c8dc] grid grid-cols-2 divide-x divide-[#b4c8dc] min-h-[100px]">
              <div className="p-3 space-y-2">
                <span className="font-bold text-slate-800 block underline">Réceptionné par</span>
                <p className="text-slate-700 font-medium">Nom : {sample.receivedBy || 'Mohamed Abdallahi'}</p>
                <div className="pt-4 text-slate-400 font-mono text-[10px]">Signature : [Signé électroniquement]</div>
              </div>

              <div className="p-3 space-y-2">
                <span className="font-bold text-slate-800 block underline">Vérifié par</span>
                <div className="flex items-center justify-between">
                  <p className="text-slate-700 font-medium">Nom : {sample.verifiedBy || 'Brahim Med Moustapha'}</p>
                  <p className="text-slate-700 font-medium">Date : {sample.verifiedDate || sample.receptionDate}</p>
                </div>
                <div className="pt-4 text-slate-400 font-mono text-[10px]">Signature : [Validé Responsable]</div>
              </div>
            </div>
          </div>

          {/* Document Footer */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-2 leading-relaxed">
            <p>
              Collecte : après formalisation du document – Classement : alphanumérique – Stockage : fichier informatique (seule la version électronique fait foi) – Accès : libre – Durée de conservation : 2 ans après nouvelle version datée– Élimination : suppression fichier électronique.
            </p>

            <table className="w-full border-collapse border border-slate-400 text-[10px] text-center font-semibold">
              <tbody>
                <tr className="border-b border-slate-400 bg-slate-100">
                  <td className="p-1 border-r border-slate-400 w-1/3">Rédigé par : CQ IMROP</td>
                  <td className="p-1 border-r border-slate-400 w-1/3 font-bold text-blue-900">ENR-CHI-02-V2.0</td>
                  <td className="p-1 w-1/3">Page 1 de 1</td>
                </tr>
                <tr>
                  <td className="p-1 border-r border-slate-400">Approuvé par : Chef Unité Chimie Marine</td>
                  <td className="p-1 border-r border-slate-400">Attribution : LABORATOIRE DE CHIMIE</td>
                  <td className="p-1">Communication : Tous</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
