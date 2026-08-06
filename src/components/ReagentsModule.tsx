import React, { useState } from 'react';
import { Boxes, Plus, AlertTriangle, ShieldCheck, Calendar, X } from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { Reagent } from '../types/lims';

export const ReagentsModule: React.FC = () => {
  const { reagents, addReagent, updateReagent, globalSearchQuery } = useLIMS();
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    code: 'REAG-KCL',
    name: 'Solution d\'Électrolyte KCl 3M pour Électrode pH',
    manufacturer: 'Thermo Scientific',
    reference: '910008',
    lotNumber: 'LOT-2025-1102',
    receptionDate: new Date().toISOString().substring(0, 10),
    expirationDate: '2027-05-15',
    quantity: 5,
    unit: 'flacons (60mL)',
    minThreshold: 2,
    storageLocation: 'Armoire A - Étagère 2',
    storageConditions: 'Température ambiante 15-25°C',
    safetyDataSheetRef: 'FDS-KCL-3M.pdf'
  });

  const handleCreateReagent = (e: React.FormEvent) => {
    e.preventDefault();
    addReagent(formData);
    setShowAddModal(false);
  };

  const filteredReagents = reagents.filter(
    (r) =>
      r.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      r.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      r.lotNumber.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div id="lims-reagents-module" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Gestion de l'Inventaire des Réactifs & Tampons</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Suivi des numéros de lot, dates de péremption, quantités en stock, fiches de sécurité (FDS) et alertes automatiques.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Réactif / Tampon</span>
        </button>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Code & Désignation</th>
                <th className="p-3.5">Fabricant & Réf</th>
                <th className="p-3.5">N° de Lot</th>
                <th className="p-3.5">Péremption</th>
                <th className="p-3.5">Quantité & Seuil</th>
                <th className="p-3.5">Emplacement</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Ajuster Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredReagents.map((r) => {
                const isExpiringSoon = new Date(r.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <tr key={r.id} className="hover:bg-slate-700/40">
                    <td className="p-3.5">
                      <p className="font-mono font-bold text-blue-400">{r.code}</p>
                      <p className="font-semibold text-slate-200 mt-0.5">{r.name}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="text-slate-200">{r.manufacturer}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Ref: {r.reference}</p>
                    </td>
                    <td className="p-3.5 font-mono text-amber-300">{r.lotNumber}</td>
                    <td className="p-3.5 font-mono">
                      <span className={isExpiringSoon ? 'text-red-400 font-bold animate-pulse' : 'text-slate-200'}>
                        {r.expirationDate}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-white">{r.quantity} {r.unit}</p>
                      <p className="text-[10px] text-slate-400">Seuil min: {r.minThreshold}</p>
                    </td>
                    <td className="p-3.5 text-slate-300">{r.storageLocation}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.status === 'En stock'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : r.status === 'Stock faible'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => updateReagent(r.id, { quantity: Math.max(0, r.quantity - 1) })}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 font-mono text-slate-200 cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => updateReagent(r.id, { quantity: r.quantity + 1 })}
                          className="px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 font-mono text-slate-200 cursor-pointer"
                        >
                          +1
                        </button>
                      </div>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Ajouter un Réactif ou Solution Tampon</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReagent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Code Réactif</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Désignation</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fabricant</label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Numéro de Lot</label>
                  <input
                    type="text"
                    required
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({ ...formData, lotNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date d'Expiration</label>
                  <input
                    type="date"
                    required
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantité En Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
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
                  Enregistrer Réactif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
