import React, { useState } from 'react';
import { BookOpen, Plus, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { AnalysisMethod, LabType } from '../types/lims';

export const MethodsModule: React.FC = () => {
  const { methods, addMethod, globalSearchQuery } = useLIMS();
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    code: 'CH-SAL-003',
    name: 'Dosage de la Salinité par Titrage de Mohr',
    parameterName: 'Salinité',
    description: 'Titrage volumétrique du chlore par le nitrate d\'argent en présence de chromate de potassium',
    normReference: 'ISO 9297:1989 (Adaptation IMROP)',
    version: '1.0',
    creationDate: new Date().toISOString().substring(0, 10),
    revisionDate: new Date().toISOString().substring(0, 10),
    documentRef: 'DOC-LAB-CH-003.pdf',
    lab: 'Laboratoire de Chimie' as LabType,
    status: 'Active' as const
  });

  const handleCreateMethod = (e: React.FormEvent) => {
    e.preventDefault();
    addMethod(formData);
    setShowAddModal(false);
  };

  const filteredMethods = methods.filter(
    (m) =>
      m.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      m.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      m.parameterName.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div id="lims-methods-module" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Référentiel des Méthodes d'Analyse Scientifique</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Base de données normatives configurables par le responsable du laboratoire. (Règle: Ne jamais inventer une norme).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter Une Méthode</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMethods.map((m) => (
          <div key={m.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
                  {m.code}
                </span>
                <h3 className="text-sm font-bold text-white mt-2">{m.name}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                v{m.version} — {m.status}
              </span>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2">{m.description}</p>

            <div className="bg-slate-900/60 p-3 rounded-xl space-y-1.5 text-[11px] text-slate-300 border border-slate-700/50">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Paramètre:</span>
                <span className="font-bold text-slate-200">{m.parameterName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Référence Normative:</span>
                <span className="font-mono text-amber-300">{m.normReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Laboratoire:</span>
                <span className="text-slate-300">{m.lab}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Dernière Révision:</span>
                <span className="text-slate-300">{m.revisionDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Ajouter une Méthode d'Analyse</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMethod} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Code Méthode</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Intitulé de la Méthode</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Paramètre Concerné</label>
                  <input
                    type="text"
                    required
                    value={formData.parameterName}
                    onChange={(e) => setFormData({ ...formData, parameterName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Laboratoire</label>
                  <select
                    value={formData.lab}
                    onChange={(e) => setFormData({ ...formData, lab: e.target.value as LabType })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Laboratoire de Chimie">Laboratoire de Chimie</option>
                    <option value="Laboratoire d'Analyses environnementales">Laboratoire d'Analyses environnementales</option>
                    <option value="Laboratoire de Biologie">Laboratoire de Biologie</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Référence Normative Officielle</label>
                <input
                  type="text"
                  required
                  value={formData.normReference}
                  onChange={(e) => setFormData({ ...formData, normReference: e.target.value })}
                  placeholder="ex: ISO 10523 / Standard Methods 4500-H+"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description Technique</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
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
                  Ajouter la Méthode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
