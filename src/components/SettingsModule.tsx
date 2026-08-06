import React, { useRef, useState } from 'react';
import { Settings, Download, Upload, Play, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLIMS } from '../services/limsStore';

export const SettingsModule: React.FC = () => {
  const {
    exportBackupJSON,
    importBackupJSON,
    executeMandatoryTestScenario,
    setActiveTab,
    logAudit
  } = useLIMS();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJSON(content);
      if (success) {
        setImportStatus('Base de données restaurée avec succès !');
      } else {
        setImportStatus('Erreur: Fichier JSON invalide.');
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
  };

  const handleResetFactory = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser la base de données IMROP avec les données d\'origine ?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div id="lims-settings-module" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Paramètres Système & Sauvegardes</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sauvegarde/Restauration JSON, réinitialisation de la base de données et exécution des scénarios de test.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup & Restore Box */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>1. Sauvegarde & Restauration de la Base de Données</span>
          </h3>

          <p className="text-xs text-slate-300">
            Exportez l'intégralité des échantillons, résultats, équipements, réactifs et journaux sous forme de fichier JSON sécurisé.
          </p>

          {importStatus && (
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={exportBackupJSON}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exporter la Sauvegarde JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Restaurer Fichier JSON</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Mandatory Scenario Box */}
        <div className="bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 border-b border-amber-500/30 pb-2">
            <Play className="w-4 h-4 text-amber-400 fill-current" />
            <span>2. Scénario de Test Obligatoire IMROP</span>
          </h3>

          <p className="text-xs text-amber-200/80">
            Exécute automatiquement le scénario du cahier des charges :
            <br />
            <strong>IMP-2026-00001</strong> | Eau de mer | Zone maritime | Mesures pH: 7.21, 7.24, 7.22 | Calcul moyenne: 7.223 | Validation multi-niveaux & Génération Rapport PDF.
          </p>

          <button
            onClick={async () => {
              await executeMandatoryTestScenario();
              setActiveTab('results');
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Exécuter Le Scénario de Test pH</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>Réinitialisation d'Usine (Données par défaut)</span>
        </h3>
        <p className="text-xs text-red-300/80">
          Restaure le système dans son état d'origine pre-chargé avec les laboratoires de l'IMROP.
        </p>
        <button
          onClick={handleResetFactory}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
        >
          Réinitialiser la Base de Données
        </button>
      </div>
    </div>
  );
};
