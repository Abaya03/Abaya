import React, { useState } from 'react';
import { ShieldAlert, Plus, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useLIMS } from '../services/limsStore';

export const QualityControlModule: React.FC = () => {
  const { qualityControls, addQualityControl, globalSearchQuery } = useLIMS();
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    qcType: 'Matériau de Référence' as const,
    parameterName: 'pH',
    methodCode: 'CH-PH-001',
    analystName: 'Aicha Mint Lemine',
    expectedValue: 7.00,
    foundValue: 7.02,
    unit: 'unité pH',
    status: 'Accepté' as const,
    comment: 'Contrôle CRM valide dans la plage de confiance'
  });

  const handleCreateQC = (e: React.FormEvent) => {
    e.preventDefault();
    addQualityControl(formData);
    setShowAddModal(false);
  };

  const filteredQCs = qualityControls.filter(
    (q) =>
      q.parameterName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      q.qcType.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div id="lims-qc-module" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-bold text-white">Contrôle Qualité, Blancs & Répétabilité ISO 17025</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Suivi des échantillons de contrôle, répétabilité des mesures et cartes de contrôle.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Log CQ</span>
        </button>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Type de Contrôle</th>
                <th className="p-3.5">Paramètre & Méthode</th>
                <th className="p-3.5">Valeur Cible (Attendue)</th>
                <th className="p-3.5">Valeur Trouvée</th>
                <th className="p-3.5">Écart (%)</th>
                <th className="p-3.5">Statut CQ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredQCs.map((qc) => {
                const diffPct = Math.abs(((qc.foundValue - qc.expectedValue) / qc.expectedValue) * 100);

                return (
                  <tr key={qc.id} className="hover:bg-slate-700/40">
                    <td className="p-3.5 text-slate-200">{qc.date}</td>
                    <td className="p-3.5 font-bold text-white">{qc.qcType}</td>
                    <td className="p-3.5 font-semibold text-blue-300">{qc.parameterName} ({qc.methodCode})</td>
                    <td className="p-3.5 font-mono">{qc.expectedValue} {qc.unit}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">{qc.foundValue} {qc.unit}</td>
                    <td className="p-3.5 font-mono text-amber-300">{diffPct.toFixed(2)}%</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          qc.status === 'Accepté'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {qc.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Enregistrer un Contrôle Qualité</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQC} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Type de Contrôle</label>
                <select
                  value={formData.qcType}
                  onChange={(e) => setFormData({ ...formData, qcType: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Matériau de Référence">Matériau de Référence (CRM)</option>
                  <option value="Blanc">Blanc de Réactif</option>
                  <option value="Échantillon de contrôle">Échantillon de contrôle</option>
                  <option value="Répétabilité">Essai de Répétabilité</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Valeur Attendue</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.expectedValue}
                    onChange={(e) => setFormData({ ...formData, expectedValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Valeur Mesurée</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.foundValue}
                    onChange={(e) => setFormData({ ...formData, foundValue: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500"
                >
                  Enregistrer Log CQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
