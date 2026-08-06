import React from 'react';
import { Building2, FlaskConical, TestTube2, Users } from 'lucide-react';
import { useLIMS } from '../services/limsStore';

export const LabsModule: React.FC = () => {
  const { samples, instruments } = useLIMS();

  const labsList = [
    {
      name: 'Laboratoire de Chimie',
      desc: 'Analyses physiques-chimiques (pH, Salinité, Conductivité, Nutriments, Métaux lourds).',
      head: 'Brahim Ould Fall',
    },
    {
      name: 'Laboratoire d\'Analyses environnementales',
      desc: 'Suivi de la qualité des eaux côtières, oxygène dissous, matières en suspension, pollution.',
      head: 'Mohamed Abdallahi',
    },
    {
      name: 'Laboratoire de Biologie',
      desc: 'Analyses microbiologiques, taxonomie, ressources halieutiques et écosystèmes marins.',
      head: 'Khadijetou Ba',
    },
    {
      name: 'Laboratoire d\'Halieutique',
      desc: 'Anatomie, croissance des stocks de poissons, dynamique des populations.',
      head: 'Dr. Sidi Mohamed Ould Ely',
    }
  ];

  return (
    <div id="lims-labs-module" className="space-y-6 font-mono">
      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">Laboratoires Scientifiques de l'IMROP</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Centre de Nouakchott — Structure multi-laboratoires extensible pour ajouter de nouvelles unités.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {labsList.map((lab) => {
          const sampleCount = samples.filter((s) => s.labAssigned === lab.name).length;
          const instCount = instruments.filter((i) => i.lab === lab.name).length;

          return (
            <div key={lab.name} className="bg-white border border-slate-200 rounded p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-teal-400 font-bold border border-slate-800 shadow-sm">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{lab.name}</h3>
                    <p className="text-[10px] text-slate-500">IMROP Centre de Nouakchott</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {sampleCount} Échantillon(s)
                </span>
              </div>

              <p className="text-xs text-slate-700">{lab.desc}</p>

              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Responsable Technique:</span>
                  <span className="font-bold text-slate-900">{lab.head}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Appareils Dédiés:</span>
                  <span className="font-bold text-teal-700">{instCount} équipement(s)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
