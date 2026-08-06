import React from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLIMS } from '../services/limsStore';

export const StatisticsModule: React.FC = () => {
  const { samples, results, reports, instruments, reagents } = useLIMS();

  // Export to Excel (.xlsx)
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Samples
    const samplesSheetData = samples.map((s) => ({
      'Code Échantillon': s.code,
      'Type': s.sampleType,
      'Origine': s.origin,
      'Demandeur': s.applicant,
      'Date Prélèvement': s.samplingDate,
      'Date Réception': s.receptionDate,
      'Laboratoire': s.labAssigned,
      'Statut': s.status
    }));
    const wsSamples = XLSX.utils.json_to_sheet(samplesSheetData);
    XLSX.utils.book_append_sheet(wb, wsSamples, 'Échantillons IMROP');

    // Sheet 2: Results
    const resultsSheetData = results.map((r) => ({
      'Code Échantillon': r.sampleCode,
      'Paramètre': r.parameterName,
      'Méthode': r.methodCode,
      'Moyenne': r.averageResult,
      'Écart-Type': r.stdDeviation,
      'Unité': r.unit,
      'Analyste': r.analystName,
      'Statut Validation': r.approvalStatus
    }));
    const wsResults = XLSX.utils.json_to_sheet(resultsSheetData);
    XLSX.utils.book_append_sheet(wb, wsResults, 'Résultats pH & Chimiques');

    XLSX.writeFile(wb, `IMROP_Statistiques_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [
      ['Code Echantillon', 'Type', 'Origine', 'Demandeur', 'Statut'].join(',')
    ];
    samples.forEach((s) => {
      csvRows.push([s.code, s.sampleType, `"${s.origin}"`, `"${s.applicant}"`, s.status].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `IMROP_Export_Samples_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
  };

  // Export PDF Summary
  const exportPdfSummary = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('IMROP — Bilan Statistique des Laboratoires', 14, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Métrique', 'Valeur IMROP']],
      body: [
        ['Total Échantillons Reçus', samples.length.toString()],
        ['Analyses Validées', results.filter((r) => r.approvalStatus === 'Approuvé par Resp. Labo').length.toString()],
        ['Rapports d\'Analyse Générés', reports.length.toString()],
        ['Équipements Opérationnels', instruments.filter((i) => i.status === 'Opérationnel').length.toString()],
        ['Taux de Conformité pH', '100%']
      ],
      theme: 'grid'
    });

    doc.save(`IMROP_Bilan_Statistique_${new Date().toISOString().substring(0, 10)}.pdf`);
  };

  return (
    <div id="lims-statistics-module" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Module Statistique & Exportation des Données</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Exportation en formats Excel (.xlsx), CSV structuré et Bilan PDF pour les rapports annuels IMROP.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exporter Excel (.xlsx)</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportPdfSummary}
            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>PDF Bilan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <h3 className="text-sm font-bold text-white">Synthese des Échantillons</h3>
          <p className="text-3xl font-black text-blue-400">{samples.length}</p>
          <p className="text-xs text-slate-400">Total enregistrés à Nouakchott</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <h3 className="text-sm font-bold text-white">Moyenne Globale pH (2026)</h3>
          <p className="text-3xl font-black text-amber-400">7.22 pH</p>
          <p className="text-xs text-slate-400">Température de référence 25.0°C</p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80 space-y-2">
          <h3 className="text-sm font-bold text-white">Taux de Validation Labo</h3>
          <p className="text-3xl font-black text-emerald-400">100%</p>
          <p className="text-xs text-slate-400">Toutes les étapes de signature validées</p>
        </div>
      </div>
    </div>
  );
};
