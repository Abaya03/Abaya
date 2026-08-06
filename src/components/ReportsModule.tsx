import React, { useState } from 'react';
import { FileCheck2, Download, Eye, QrCode, ShieldCheck, CheckCircle2, Search, X, FileText, Printer } from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { generateReportPDF } from '../utils/pdfGenerator';
import { Report } from '../types/lims';
import { ReportDocumentView } from './ReportDocumentView';

export const ReportsModule: React.FC = () => {
  const { reports, samples, results, currentUser, globalSearchQuery } = useLIMS();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'document'>('list');
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleOpenDocument = (rep: Report) => {
    setSelectedReport(rep);
    setViewMode('document');
  };

  const handlePrintReport = (rep: Report) => {
    setSelectedReport(rep);
    setViewMode('document');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleOpenPdf = async (rep: Report) => {
    setSelectedReport(rep);
    const targetSample = samples.find((s) => s.id === rep.sampleId) || samples[0];
    const targetResults = results.filter((r) => r.sampleId === rep.sampleId);

    const { pdfDataUrl } = await generateReportPDF(
      targetSample,
      targetResults.length > 0 ? targetResults : results,
      rep.reportNumber,
      rep.generatedBy
    );

    setPreviewPdfUrl(pdfDataUrl);
  };

  const handleDownloadPdf = async (rep: Report) => {
    const targetSample = samples.find((s) => s.id === rep.sampleId) || samples[0];
    const targetResults = results.filter((r) => r.sampleId === rep.sampleId);

    const { pdfBlob } = await generateReportPDF(
      targetSample,
      targetResults.length > 0 ? targetResults : results,
      rep.reportNumber,
      rep.generatedBy
    );

    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = `IMROP_${rep.reportNumber}_${rep.sampleCode}.pdf`;
    link.click();
  };

  const filteredReports = reports.filter(
    (r) =>
      r.reportNumber.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      r.sampleCode.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      r.generatedBy.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  const activeSample = selectedReport ? (samples.find((s) => s.id === selectedReport.sampleId) || samples[0]) : samples[0];
  const activeResults = selectedReport ? results.filter((r) => r.sampleId === selectedReport.sampleId) : results;

  if (viewMode === 'document' && selectedReport) {
    return (
      <ReportDocumentView
        report={selectedReport}
        sample={activeSample}
        results={activeResults}
        onBack={() => setViewMode('list')}
        onDownloadPdf={() => handleDownloadPdf(selectedReport)}
      />
    );
  }

  return (
    <div id="lims-reports-module" className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900 font-mono">Rapports d'Analyse RAP-CHI-01-V4.0</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
              ISO 17025
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Génération selon le modèle officiel RAP-CHI-01-V4.0, signatures multi-niveaux et QR Code d'authenticité.
          </p>
        </div>

        <button
          onClick={() => setShowVerifyModal(true)}
          className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white font-mono font-bold text-xs px-4 py-2 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider shrink-0"
        >
          <QrCode className="w-4 h-4 text-teal-400" />
          <span>Vérifier Un QR Code</span>
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden font-mono">
        <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wider bg-slate-50 flex items-center justify-between">
          <span>Registre des Rapports D'Analyse Officiels (Modèle RAP-CHI-01-V4.0)</span>
          <span className="text-slate-500 font-mono text-[11px]">IMROP Chimie</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-800">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">N° Rapport</th>
                <th className="p-3.5">Échantillon</th>
                <th className="p-3.5">Date d'Émission</th>
                <th className="p-3.5">Laboratoire</th>
                <th className="p-3.5">Signé Par</th>
                <th className="p-3.5">Authentification</th>
                <th className="p-3.5 text-right">Actions Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-purple-700">
                    <span className="bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {rep.reportNumber}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-blue-700">{rep.sampleCode}</td>
                  <td className="p-3.5 text-slate-700">{rep.generatedDate}</td>
                  <td className="p-3.5 text-slate-700">{rep.lab}</td>
                  <td className="p-3.5 text-slate-700 font-bold">{rep.generatedBy}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      QR Validé
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDocument(rep)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-[#0f172a] hover:bg-slate-800 text-white font-mono font-bold text-xs cursor-pointer shadow-sm uppercase tracking-wider"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-400" />
                        <span>Modèle RAP-CHI-01</span>
                      </button>

                      <button
                        onClick={() => handleOpenPdf(rep)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-mono font-bold text-xs cursor-pointer uppercase tracking-wider"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => handlePrintReport(rep)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-mono font-bold text-xs cursor-pointer uppercase tracking-wider"
                        title="Imprimer le rapport"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-700" />
                        <span>Imprimer</span>
                      </button>

                      <button
                        onClick={() => handleDownloadPdf(rep)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 font-mono font-bold text-xs cursor-pointer uppercase tracking-wider"
                      >
                        <Download className="w-3.5 h-3.5 text-teal-700" />
                        <span>Télécharger</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Modal Viewer */}
      {previewPdfUrl && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedReport.reportNumber} — Rapport de Laboratoire
                  </h3>
                  <p className="text-[10px] text-slate-400">Échantillon: {selectedReport.sampleCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(selectedReport)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger PDF</span>
                </button>
                <button
                  onClick={() => {
                    setPreviewPdfUrl(null);
                    setSelectedReport(null);
                  }}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-2 overflow-hidden">
              <iframe
                src={previewPdfUrl}
                title="Rapport PDF IMROP"
                className="w-full h-full rounded-xl border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* QR Verification Modal Simulator */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-full flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white">Vérification de l'Authenticité du Rapport</h3>
            <p className="text-xs text-slate-300">
              Scannez ou collez le code QR d'un rapport pour vérifier son enregistrement sur la blockchain/serveur IMROP.
            </p>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Rapport Authentique & Validé</span>
              </div>
              <p className="text-[11px] text-emerald-200/90 font-mono">
                Rapport: REP-IMROP-2026-00001
                <br />
                Échantillon: IMP-2026-00001 (pH = 7.22)
                <br />
                Centre: IMROP Nouakchott
                <br />
                Signature: Valide & Inviolable
              </p>
            </div>

            <button
              onClick={() => setShowVerifyModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 cursor-pointer"
            >
              Fermer la Vérification
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
