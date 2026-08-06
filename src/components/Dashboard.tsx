import React from 'react';
import {
  TestTube2,
  Clock,
  Activity,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Flame,
  Building2,
  FlaskConical,
  Plus,
  Play,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useLIMS } from '../services/limsStore';

export const Dashboard: React.FC = () => {
  const {
    samples,
    results,
    reports,
    instruments,
    reagents,
    setActiveTab,
    executeMandatoryTestScenario
  } = useLIMS();

  // Metrics calculations
  const totalSamples = samples.length;
  const pendingSamples = samples.filter((s) => s.status === 'Reçu' || s.status === 'En attente').length;
  const inProgressAnalyses = samples.filter((s) => s.status === 'En analyse').length;
  const finishedAnalyses = samples.filter((s) => s.status === 'Analyse terminée' || s.status === 'En validation').length;
  const validatedAnalyses = samples.filter((s) => s.status === 'Validé' || s.status === 'Rapport généré').length;
  const generatedReportsCount = reports.length;

  const nonConformCount = results.filter((r) => r.isConform === false).length;
  const urgentEqMaintenance = instruments.filter(
    (i) => new Date(i.nextMaintenanceDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;
  const expiringReagentsCount = reagents.filter(
    (r) => new Date(r.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;

  // Chart 1: Analyses by Laboratory
  const labData = [
    { name: 'Chimie', count: samples.filter((s) => s.labAssigned === 'Laboratoire de Chimie').length, color: '#3b82f6' },
    { name: 'Environnement', count: samples.filter((s) => s.labAssigned === 'Laboratoire d\'Analyses environnementales').length, color: '#10b981' },
    { name: 'Biologie', count: samples.filter((s) => s.labAssigned === 'Laboratoire de Biologie').length, color: '#f59e0b' }
  ];

  // Chart 2: Monthly trend
  const monthlyData = [
    { month: 'Jan', analyses: 28 },
    { month: 'Fév', analyses: 34 },
    { month: 'Mar', analyses: 42 },
    { month: 'Avr', analyses: 38 },
    { month: 'Mai', analyses: 45 },
    { month: 'Juin', analyses: 51 },
    { month: 'Juil', analyses: 49 },
    { month: 'Août', analyses: 62 }
  ];

  // Chart 3: Samples by Origin
  const originsMap: Record<string, number> = {};
  samples.forEach((s) => {
    originsMap[s.origin] = (originsMap[s.origin] || 0) + 1;
  });
  const originData = Object.keys(originsMap).map((key, index) => ({
    name: key,
    value: originsMap[key],
    color: ['#0284c7', '#0d9488', '#d97706', '#6366f1', '#ec4899'][index % 5]
  }));

  // Chart 4: Evolution of pH results
  const phResults = results.filter((r) => r.parameterName === 'pH');
  const phTrendData = phResults.map((r) => ({
    date: r.analysisDate,
    pH: r.averageResult,
    sample: r.sampleCode
  }));

  return (
    <div id="lims-dashboard" className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-[#0f172a] border border-slate-800 rounded p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                IMROP — CENTRE DE NOUAKCHOTT
              </span>
            </div>
            <h1 className="text-xl font-bold font-mono text-white tracking-tight">Tableau de Bord des Laboratoires</h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-mono">
              Suivi en temps réel des échantillons, analyses physico-chimiques, statut des équipements et chaîne de validation ISO 17025.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('samples')}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold text-xs px-3.5 py-2 rounded shadow-sm transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Prélèvement</span>
            </button>

            <button
              onClick={() => setActiveTab('results')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs px-3.5 py-2 rounded border border-slate-700 shadow-sm transition-all cursor-pointer active:scale-95 uppercase tracking-wider"
            >
              <FlaskConical className="w-3.5 h-3.5 text-teal-400" />
              <span>Saisir Analyse pH</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Key Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total Échantillons</span>
            <TestTube2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-mono font-bold text-slate-900">{totalSamples}</p>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Reçus à l'IMROP</span>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-600">En Attente</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-mono font-bold text-amber-600">{pendingSamples}</p>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Attente attribution</span>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">Analyses en Cours</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-mono font-bold text-indigo-600">{inProgressAnalyses}</p>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Sur paillasses</span>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-600">Terminées / Saisies</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-mono font-bold text-teal-600">{finishedAnalyses}</p>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">En contrôle</span>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600">Validées Labo</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-mono font-bold text-emerald-600">{validatedAnalyses}</p>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">Validations finales</span>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-600">Rapports Générés</span>
            <FileCheck2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-mono font-bold text-purple-600">{generatedReportsCount}</p>
          <span className="text-[10px] font-mono text-slate-500 mt-1 block">PDFs avec QR Code</span>
        </div>
      </div>



      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Analyses */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Volume des Analyses par Mois (2026)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Total cumulé IMROP</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="analyses" fill="#0d9488" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Analyses by Lab */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Répartition par Laboratoire IMROP</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Pourcentages du total</span>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={labData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={5}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {labData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Evolution of pH Results */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-600" />
              <span>Évolution des Valeurs de pH Mesurées</span>
            </h3>
            <span className="text-[10px] font-mono text-amber-600">Méthode CH-PH-001</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={phTrendData.length > 0 ? phTrendData : [{ date: '04/08', pH: 7.22, sample: 'IMP-2026-00001' }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis domain={[6.5, 8.5]} stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="pH" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4, fill: '#d97706' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Samples by Origin */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <TestTube2 className="w-4 h-4 text-teal-600" />
              <span>Origine Géographique des Échantillons</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Zones maritimes & côtières</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={originData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} fontFamily="monospace" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="value" fill="#0284c7" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
