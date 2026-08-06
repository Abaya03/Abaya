import React, { useState } from 'react';
import { Compass, Plus, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { useLIMS } from '../services/limsStore';

export const CalibrationsModule: React.FC = () => {
  const { calibrations, instruments, addCalibration, globalSearchQuery } = useLIMS();
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().substring(0, 10),
    time: '08:30',
    analystName: 'Aicha Mint Lemine',
    instrumentId: 'inst-1',
    instrumentName: 'pH-mètre Orion Star A211',
    bufferSolutionUsed: 'Tampons pH 4.01, pH 7.00 & pH 10.01 (Merck)',
    lotNumber: 'LOT-2025-0811 / LOT-2025-0943',
    result: 'Pente = 98.7%, Offset = -1.8 mV',
    conformity: 'Conforme' as const,
    comment: 'Étalonnage 3 points réalisé avec succès avant les séries de mesures.'
  });

  const handleCreateCalibration = (e: React.FormEvent) => {
    e.preventDefault();
    addCalibration(formData);
    setShowAddModal(false);
  };

  const filteredCalibrations = calibrations.filter(
    (c) =>
      c.instrumentName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      c.bufferSolutionUsed.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      c.lotNumber.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div id="lims-calibrations-module" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Étalonnage des Appareils & Traçabilité des Tampons</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enregistrement des solutions tampons certifiées, vérification des pentes et offsets des pH-mètres.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Étalonnage</span>
        </button>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Date & Heure</th>
                <th className="p-3.5">Appareil</th>
                <th className="p-3.5">Solutions Tampons Utilisées</th>
                <th className="p-3.5">N° de Lot Tampons</th>
                <th className="p-3.5">Analyste</th>
                <th className="p-3.5">Résultats Pente/Offset</th>
                <th className="p-3.5">Conformité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredCalibrations.map((cal) => (
                <tr key={cal.id} className="hover:bg-slate-700/40">
                  <td className="p-3.5 text-slate-200">
                    {cal.date} à {cal.time}
                  </td>
                  <td className="p-3.5 font-bold text-white">{cal.instrumentName}</td>
                  <td className="p-3.5 text-blue-300 font-medium">{cal.bufferSolutionUsed}</td>
                  <td className="p-3.5 font-mono text-amber-300">{cal.lotNumber}</td>
                  <td className="p-3.5 text-slate-300">{cal.analystName}</td>
                  <td className="p-3.5 font-mono text-slate-200">{cal.result}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        cal.conformity === 'Conforme'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {cal.conformity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Enregistrer un Étalonnage</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCalibration} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Appareil Concerné</label>
                <select
                  value={formData.instrumentId}
                  onChange={(e) => {
                    const inst = instruments.find((i) => i.id === e.target.value);
                    setFormData({
                      ...formData,
                      instrumentId: e.target.value,
                      instrumentName: inst ? inst.name : formData.instrumentName
                    });
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {instruments.map((i) => (
                    <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Solutions Tampons Utilisées</label>
                <input
                  type="text"
                  required
                  value={formData.bufferSolutionUsed}
                  onChange={(e) => setFormData({ ...formData, bufferSolutionUsed: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Numéro de Lot des Tampons</label>
                <input
                  type="text"
                  required
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Résultats (Pente % / Offset mV)</label>
                <input
                  type="text"
                  required
                  value={formData.result}
                  onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
