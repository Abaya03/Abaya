import React from 'react';
import { History, ShieldCheck, Lock, UserCheck } from 'lucide-react';
import { useLIMS } from '../services/limsStore';

export const AuditLogModule: React.FC = () => {
  const { auditLogs, globalSearchQuery } = useLIMS();

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.user.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      l.resource.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div id="lims-audit-module" className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 p-5 rounded-2xl border border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Journal d'Activité & Traçabilité Inviolable (Audit Log)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chaque création, modification, validation ou saisie est conservée avec horodatage strict et adresse IP.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-emerald-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Traçabilité Norme ISO 17025 Activée</span>
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Horodatage</th>
                <th className="p-3.5">Utilisateur & Rôle</th>
                <th className="p-3.5">Action Exécutée</th>
                <th className="p-3.5">Ressource Concernée</th>
                <th className="p-3.5">Ancienne Valeur</th>
                <th className="p-3.5">Nouvelle Valeur</th>
                <th className="p-3.5">Adresse IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/40">
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3.5 font-sans font-bold text-white">
                    {log.user}
                    <span className="block text-[10px] text-blue-400 font-mono font-normal">{log.userRole}</span>
                  </td>
                  <td className="p-3.5 font-sans font-semibold text-emerald-300">{log.action}</td>
                  <td className="p-3.5 text-blue-400 font-bold">{log.resource}</td>
                  <td className="p-3.5 text-slate-400 max-w-xs truncate">{log.oldValue || '—'}</td>
                  <td className="p-3.5 text-slate-200 max-w-xs truncate">{log.newValue || '—'}</td>
                  <td className="p-3.5 text-slate-500 text-[10px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
