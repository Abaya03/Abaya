import React from 'react';
import { Sample, AnalysisResult, Report } from '../types/lims';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import imropLogo from '../assets/images/imrop_official_logo_1786011645324.jpg';

export const ReportDocumentView: React.FC<{
  report: Report;
  sample: Sample;
  results: AnalysisResult[];
  onBack?: () => void;
  onDownloadPdf?: () => void;
}> = ({ report, sample, results, onBack, onDownloadPdf }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="space-y-4 font-mono">
      {/* Top Action Bar (hidden on print) */}
      <div className="bg-white p-3.5 rounded border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
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
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1b62a5] text-white uppercase">
                DOCUMENT QUALITÉ RAP-CHI-01-V4.0
              </span>
              <span className="text-xs text-slate-500 font-bold">IMROP / LABORATOIRE DE CHIMIE</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">Rapport d'Analyse (Feuille Unique ISO 17025)</h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-1.5 rounded border border-slate-200 transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>

          {onDownloadPdf && (
            <button
              onClick={onDownloadPdf}
              className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded shadow-sm transition-colors cursor-pointer uppercase tracking-wider"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Télécharger PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* SINGLE-SHEET REPLICA DOCUMENT BODY (RAP-CHI-01-V4.0) */}
      <div className="bg-white p-6 sm:p-8 rounded border border-slate-300 shadow-md max-w-4xl mx-auto text-slate-900 font-mono space-y-3.5 select-text print:p-4 print:shadow-none print:border-none print:m-0 print:max-w-none">
        {/* Header Block with Bilingual Top */}
        <div className="grid grid-cols-12 gap-2 text-center text-[10px] font-bold border-b border-slate-200 pb-2.5 items-center">
          <div className="col-span-5 text-left text-slate-900 leading-tight">
            <p className="font-bold">République Islamique de Mauritanie</p>
            <p className="text-[9px] text-slate-600 font-normal">Honneur – Fraternité – Justice</p>
            <p className="text-[9px] text-slate-700 font-normal">Ministère de la Pêches, des infrastructures Maritimes et Portuaires</p>
            <p className="font-bold text-[#1b62a5] text-[10px] mt-0.5">Institut Mauritanien de Recherches Océanographiques et de Pêches (IMROP)</p>
          </div>

          <div className="col-span-2 flex items-center justify-center">
            <img
              src={imropLogo}
              alt="Logo Officiel IMROP"
              className="w-20 h-20 object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="col-span-5 text-right text-slate-900 leading-tight font-sans" dir="rtl">
            <p className="font-bold text-xs text-slate-900">الجمهورية الإسلامية الموريتانية</p>
            <p className="text-[9px] text-slate-600 font-normal">شرف – إخاء – عدل</p>
            <p className="text-[9px] text-slate-700 font-normal">وزارة الصيد والبنى التحتية البحرية والمينائية</p>
            <p className="font-bold text-[#1b62a5] text-xs mt-0.5">المعهد الموريتاني لبحوث المحيطات والصيد</p>
          </div>
        </div>

        {/* Blue Sub-header Banner */}
        <div className="bg-[#1b62a5] text-white text-center py-1.5 px-3 rounded-xs space-y-0.5">
          <h2 className="text-xs font-black uppercase tracking-wider">Laboratoire de Chimie — IMROP Nouakchott</h2>
          <p className="text-[9px] font-normal opacity-95">
            Adresse : IMROP B.P 22, Nouakchott, Mauritanie | Tél : 0022243090407 | Courriel : mbengue33@hotmail.fr
          </p>
        </div>

        {/* Document Ref & Title */}
        <div className="text-center space-y-1 pt-1">
          <div className="text-[11px] font-bold text-slate-800">
            <span>RAP-CHI-01V.4.0</span>
            <span className="mx-2">|</span>
            <span>N° de rapport : <strong className="text-[#1b62a5]">{report.reportNumber}</strong></span>
            <span className="mx-2">|</span>
            <span>Date d'émission : <strong>{report.generatedDate || currentDate}</strong></span>
          </div>

          <h1 className="text-lg font-black text-[#1b62a5] uppercase tracking-wider pt-1">
            RAPPORT D'ANALYSE
          </h1>
        </div>

        {/* Two-Column Metadata Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
          {/* Left Metadata Box */}
          <table className="w-full border-collapse border border-slate-900 text-[10px]">
            <tbody>
              <tr className="border-b border-slate-900">
                <td className="border border-slate-900 p-1.5 font-bold bg-slate-100 text-slate-900 w-2/5">Client :</td>
                <td className="border border-slate-900 p-1.5 text-slate-900 font-semibold">{sample.organization || sample.applicant || 'DEMC, IMROP'}</td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="border border-slate-900 p-1.5 font-bold bg-slate-100 text-slate-900">Adresse client :</td>
                <td className="border border-slate-900 p-1.5 text-slate-900">{sample.origin || 'Siège IMROP, Nouakchott'}</td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="border border-slate-900 p-1.5 font-bold bg-slate-100 text-slate-900">Identification échantillon :</td>
                <td className="border border-slate-900 p-1.5 font-bold text-blue-800">{sample.code || report.sampleCode}</td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="border border-slate-900 p-1.5 font-bold bg-slate-100 text-slate-900">Nature / matrice :</td>
                <td className="border border-slate-900 p-1.5 text-slate-900 font-semibold">{sample.sampleType || 'Eau de Mer'}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-1.5 font-bold bg-slate-100 text-slate-900">État à réception :</td>
                <td className="border border-slate-900 p-1.5 text-teal-800 font-bold">R.A.S. OK</td>
              </tr>
            </tbody>
          </table>

          {/* Right Metadata Box */}
          <table className="w-full border-collapse border border-slate-900 text-[10px]">
            <tbody>
              <tr className="border-b border-slate-900">
                <td className="border border-slate-900 p-1.5 font-bold bg-slate-100 text-slate-900 w-2/5">Lieu d'analyse :</td>
                <td className="border border-slate-900 p-1.5 text-slate-900">{sample.labAssigned || 'Lab. Chimie IMROP Nouakchott'}</td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="border border-slate-900 p-1.5 font-bold bg-slate-100 text-slate-900">Date de réception :</td>
                <td className="border border-slate-900 p-1.5 text-slate-900">{sample.receptionDate || report.generatedDate}</td>
              </tr>
              <tr className="border-b border-slate-900">
                <td className="border border-slate-900 p-1.5 font-bold bg-slate-100 text-slate-900">Date début d'analyse :</td>
                <td className="border border-slate-900 p-1.5 text-slate-900">{sample.receptionDate || report.generatedDate}</td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-1.5 font-bold bg-slate-100 text-slate-900">Date de fin analyse :</td>
                <td className="border border-slate-900 p-1.5 text-slate-900 font-bold">{report.generatedDate}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Results Section */}
        <div className="space-y-1.5 pt-2">
          <h3 className="text-xs font-bold text-[#1b62a5]">Résultats d'analyse</h3>

          <table className="w-full border-collapse border border-slate-900 text-[10px] text-left">
            <thead>
              <tr className="bg-[#1b62a5] text-white font-bold text-center">
                <th className="border border-slate-900 p-1.5 text-left w-1/3">Paramètre</th>
                <th className="border border-slate-900 p-1.5 text-left w-1/3">Méthode Utilisée</th>
                <th className="border border-slate-900 p-1.5 w-1/6">Résultat</th>
                <th className="border border-slate-900 p-1.5 w-1/6">Unité</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((res, i) => (
                  <tr key={i} className="border-b border-slate-900 text-center">
                    <td className="border border-slate-900 p-1.5 font-bold text-slate-900 text-left">{res.parameterName}</td>
                    <td className="border border-slate-900 p-1.5 text-slate-800 text-left">{res.methodCode || 'ISO 10523 / Méthode Interne'}</td>
                    <td className="border border-slate-900 p-1.5 font-bold text-blue-900">{res.averageResult.toFixed(3)}</td>
                    <td className="border border-slate-900 p-1.5 text-slate-800">{res.unit || '-'}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="border-b border-slate-900 text-center">
                    <td className="border border-slate-900 p-1.5 font-bold text-slate-900 text-left">pH</td>
                    <td className="border border-slate-900 p-1.5 text-slate-800 text-left">ISO 10523 (Sonde Électrométrique)</td>
                    <td className="border border-slate-900 p-1.5 font-bold text-blue-900">7.223</td>
                    <td className="border border-slate-900 p-1.5 text-slate-800">-</td>
                  </tr>
                  <tr className="border-b border-slate-900 text-center">
                    <td className="border border-slate-900 p-1.5 font-bold text-slate-900 text-left">T</td>
                    <td className="border border-slate-900 p-1.5 text-slate-800 text-left">Sonde Physico-chimique</td>
                    <td className="border border-slate-900 p-1.5 font-bold text-blue-900">25.0</td>
                    <td className="border border-slate-900 p-1.5 text-slate-800">°C</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Validation & Signatures */}
        <div className="pt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
            <div>
              <p className="font-bold text-[#1b62a5]">Technicien analyste</p>
              <div className="mt-1 space-y-0.5 text-slate-800 text-[10px]">
                <p><strong>Nom :</strong> {report.generatedBy || 'Aicha Mint Lemine'}</p>
                <p><strong>Date :</strong> {report.generatedDate}</p>
                <p className="mt-2 font-bold text-slate-500">Signature :</p>
                <div className="h-6 border-b border-slate-400 border-dashed flex items-end text-[9px] text-teal-700 italic">
                  [Signé Électroniquement]
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="font-bold text-[#1b62a5]">Autorisation rapport</p>
              <p className="text-[9px] text-slate-500 italic mt-1">Le RT</p>
            </div>

            <div>
              <p className="font-bold text-[#1b62a5]">Chef de Laboratoire Chimie Nouakchott</p>
              <div className="mt-1 space-y-0.5 text-slate-800 text-[10px]">
                <p><strong>Nom :</strong> Dr. Mbengue</p>
                <p><strong>Date :</strong> {report.generatedDate}</p>
                <p className="mt-2 font-bold text-slate-500">Signature :</p>
                <div className="h-6 border-b border-slate-400 border-dashed flex items-end text-[9px] text-teal-700 italic">
                  [Approuvé Système Qualité]
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-2 space-y-1">
            <p className="text-[10px] italic text-slate-600">Ce rapport ne concerne que l'échantillon soumis à l'essai.</p>
            <p className="text-xs font-black text-slate-900 tracking-wider">FIN DU RAPPORT</p>
          </div>
        </div>

        {/* Quality ISO Footer Grid */}
        <div className="pt-3 border-t border-slate-300 text-[8.5px] leading-snug space-y-2">
          <p className="text-justify font-sans text-slate-600">
            <strong>Collecte :</strong> après formalisation du document – <strong>Classement :</strong> alphanumérique – <strong>Stockage :</strong> fichier informatique (seule la version électronique fait foi) – <strong>Accès :</strong> libre – <strong>Durée de conservation :</strong> 2 ans après nouvelle version datée – <strong>Élimination :</strong> suppression fichier électronique.
          </p>

          <table className="w-full border-collapse border border-slate-900 text-[9px] text-center font-mono">
            <tbody>
              <tr className="border-b border-slate-900">
                <td className="border border-slate-900 p-1 w-1/3 font-bold">Rédigé par : CQ IMROP</td>
                <td className="border border-slate-900 p-1 w-1/3 font-black text-slate-900">RAP-CHI-01-V4.0</td>
                <td className="border border-slate-900 p-1 w-1/3 font-bold">Page 1 de 1</td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-1 font-bold">Approuvé par : Chef Laboratoire de Chimie NKTT</td>
                <td className="border border-slate-900 p-1 font-bold">Attribution : LABORATOIRE DE CHIMIE</td>
                <td className="border border-slate-900 p-1 font-bold">Communication : Tous</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

