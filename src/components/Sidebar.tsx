import React from 'react';
import {
  LayoutDashboard,
  TestTube2,
  FileSpreadsheet,
  Building2,
  BookOpen,
  CheckSquare,
  FileCheck2,
  Wrench,
  Compass,
  Boxes,
  ShieldAlert,
  BarChart3,
  Users,
  History,
  Settings,
  Flame
} from 'lucide-react';
import { useLIMS } from '../services/limsStore';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, samples, results, instruments, reagents } = useLIMS();

  // Counts for badge badges
  const pendingSamplesCount = samples.filter((s) => s.status === 'Reçu' || s.status === 'En attente').length;
  const inAnalysisCount = samples.filter((s) => s.status === 'En analyse' || s.status === 'Analyse terminée').length;
  const pendingValidationCount = results.filter((r) => r.approvalStatus !== 'Approuvé par Resp. Labo').length;
  const urgentEqCount = instruments.filter((i) => i.status === 'En maintenance' || i.status === 'En panne').length;
  const lowReagentCount = reagents.filter((r) => r.status === 'Stock faible' || r.status === 'Expiré').length;

  const navItems = [
    { id: 'dashboard', label: '1. Tableau de bord', icon: LayoutDashboard, badge: null },
    { id: 'samples', label: '2. Fiche des réceptions', icon: TestTube2, badge: pendingSamplesCount > 0 ? pendingSamplesCount : null, color: 'bg-blue-500' },
    { id: 'analyses', label: '3. Demandes d\'analyses', icon: FileSpreadsheet, badge: inAnalysisCount > 0 ? inAnalysisCount : null, color: 'bg-amber-500' },
    { id: 'labs', label: '4. Laboratoires IMROP', icon: Building2, badge: null },
    { id: 'methods', label: '5. Méthodes d\'analyse', icon: BookOpen, badge: null },
    { id: 'results', label: '6. Saisie & Résultats (pH)', icon: CheckSquare, badge: pendingValidationCount > 0 ? pendingValidationCount : null, color: 'bg-emerald-500' },
    { id: 'reports', label: '7. Rapports d\'analyse', icon: FileCheck2, badge: null },
    { id: 'instruments', label: '8. Équipements', icon: Wrench, badge: urgentEqCount > 0 ? urgentEqCount : null, color: 'bg-red-500' },
    { id: 'calibrations', label: '9. Étalonnage', icon: Compass, badge: null },
    { id: 'reagents', label: '10. Réactifs & Stocks', icon: Boxes, badge: lowReagentCount > 0 ? lowReagentCount : null, color: 'bg-orange-500' },
    { id: 'qc', label: '11. Contrôle Qualité', icon: ShieldAlert, badge: null },
    { id: 'statistics', label: '12. Statistiques & Export', icon: BarChart3, badge: null },
    { id: 'users', label: '13. Utilisateurs & Droits', icon: Users, badge: null },
    { id: 'audit', label: '14. Journal d\'Activité', icon: History, badge: null },
    { id: 'settings', label: '15. Paramètres & Backup', icon: Settings, badge: null }
  ];

  return (
    <aside id="lims-sidebar" className="w-64 bg-[#0f172a] text-slate-300 border-r border-slate-800 shrink-0 hidden md:flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none overflow-y-auto print:hidden">
      <div className="p-3 border-b border-slate-800">
        <div className="bg-slate-900/90 rounded p-2 border border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="text-[11px] font-mono font-semibold text-slate-300">Base IMROP Connectée</span>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white font-bold border-r-2 border-teal-500 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold text-white rounded shrink-0 ${
                    item.color || 'bg-teal-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-slate-800 bg-[#0b1324] text-[10px] font-mono text-slate-400">
        <p className="font-bold text-slate-300">IMROP - Centre de Nouakchott</p>
        <p className="text-slate-500">Version 2.4 — ISO 17025</p>
      </div>
    </aside>
  );
};
