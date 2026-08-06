import React, { useState } from 'react';
import { Wrench, Plus, AlertTriangle, CheckCircle2, Calendar, ShieldCheck, X } from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { Instrument, LabType } from '../types/lims';

export const InstrumentsModule: React.FC = () => {
  const { instruments, addInstrument, updateInstrument, globalSearchQuery } = useLIMS();
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    code: 'OXY-01',
    name: 'Oxymètre de Paillasse HQ30D',
    brand: 'HACH',
    model: 'HQ30D Luminescent',
    serialNumber: 'SN-OXY-88210',
    lab: 'Laboratoire d\'Analyses environnementales' as LabType,
    acquisitionDate: '2023-05-10',
    commissioningDate: '2023-06-01',
    location: 'Laboratoire Environnement - Salle A',
    status: 'Opérationnel' as const,
    lastMaintenanceDate: '2026-01-15',
    nextMaintenanceDate: '2026-09-15',
    lastCalibrationDate: '2026-07-01',
    nextCalibrationDate: '2026-08-15',
    calibrationCertRef: 'CERT-HACH-2026-012',
    responsiblePerson: 'Mohamed Abdallahi'
  });

  const handleCreateInstrument = (e: React.FormEvent) => {
    e.preventDefault();
    addInstrument(formData);
    setShowAddModal(false);
  };

  const filteredInstruments = instruments.filter(
    (i) =>
      i.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      i.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      i.serialNumber.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div id="lims-instruments-module" className="space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-bold text-slate-900 font-mono">Gestion du Parc d'Équipements & Appareils de Mesure</h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Inventaire des pH-mètres, spectrophotomètres, conductimètres avec suivi des maintenances et certificats d'étalonnage.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-white font-mono font-bold text-xs px-4 py-2 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider shrink-0"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>Ajouter Un Équipement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInstruments.map((inst) => {
          const isMaintenanceDueSoon = new Date(inst.nextMaintenanceDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const isCalibrationDueSoon = new Date(inst.nextCalibrationDate) <= new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

          return (
            <div key={inst.id} className="bg-white border border-slate-200 rounded p-5 space-y-4 shadow-sm flex flex-col justify-between font-mono">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {inst.code}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-2 uppercase tracking-wider">{inst.name}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded ${
                      inst.status === 'Opérationnel'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {inst.status}
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <p><strong className="text-slate-500 uppercase text-[10px]">Marque / Modèle:</strong> {inst.brand} {inst.model}</p>
                  <p><strong className="text-slate-500 uppercase text-[10px]">N° de Série:</strong> <span className="font-mono font-bold text-slate-900">{inst.serialNumber}</span></p>
                  <p><strong className="text-slate-500 uppercase text-[10px]">Emplacement:</strong> {inst.location}</p>
                  <p><strong className="text-slate-500 uppercase text-[10px]">Responsable:</strong> {inst.responsiblePerson}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Prochaine Maintenance:</span>
                    <span className={`font-mono font-bold ${isMaintenanceDueSoon ? 'text-amber-700 font-bold' : 'text-slate-800'}`}>
                      {inst.nextMaintenanceDate}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Prochain Étalonnage:</span>
                    <span className={`font-mono font-bold ${isCalibrationDueSoon ? 'text-red-700 font-bold' : 'text-slate-800'}`}>
                      {inst.nextCalibrationDate}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Certificat:</span>
                    <span className="font-mono text-xs text-blue-700 font-bold">{inst.calibrationCertRef}</span>
                  </div>
                </div>

                {(isMaintenanceDueSoon || isCalibrationDueSoon) && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[11px] text-amber-800 flex items-center gap-2 font-mono">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Alerte: Échéance de maintenance ou d'étalonnage à prévoir !</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold">{inst.lab}</span>
                <button
                  onClick={() =>
                    updateInstrument(inst.id, {
                      status: inst.status === 'Opérationnel' ? 'En maintenance' : 'Opérationnel'
                    })
                  }
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[10px] font-mono font-bold cursor-pointer uppercase"
                >
                  Basculer Statut
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Enregistrer un Équipement</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstrument} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Code Équipement</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nom de l'Appareil</label>
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
                  <label className="block text-slate-300 font-semibold mb-1">Marque</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Modèle</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Numéro de Série</label>
                <input
                  type="text"
                  required
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prochaine Maintenance</label>
                  <input
                    type="date"
                    required
                    value={formData.nextMaintenanceDate}
                    onChange={(e) => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prochain Étalonnage</label>
                  <input
                    type="date"
                    required
                    value={formData.nextCalibrationDate}
                    onChange={(e) => setFormData({ ...formData, nextCalibrationDate: e.target.value })}
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
                  Enregistrer Appareil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
