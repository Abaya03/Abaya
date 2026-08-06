import React, { useState } from 'react';
import {
  FlaskConical,
  Bell,
  Search,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { UserRole } from '../types/lims';
import imropLogo from '../assets/images/imrop_new_official_logo_1786017881022.jpg';

export const Header: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    logout,
    instruments,
    reagents,
    results,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActiveTab
  } = useLIMS();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute urgent alert notifications
  const upcomingMaintenance = instruments.filter(
    (i) => new Date(i.nextMaintenanceDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const expiringReagents = reagents.filter(
    (r) => new Date(r.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const pendingValidations = results.filter((r) => r.approvalStatus !== 'Approuvé par Resp. Labo');

  const totalAlerts = upcomingMaintenance.length + expiringReagents.length + pendingValidations.length;

  return (
    <header id="lims-header" className="bg-white text-slate-900 sticky top-0 z-40 border-b border-slate-200 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <img
            src={imropLogo}
            alt="Logo IMROP"
            className="w-10 h-10 object-contain"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-mono">IMROP</span>
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Centre de Nouakchott
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Institut Mauritanien de Recherches Océanographiques et de Pêches
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Rechercher échantillon (ex: IMP-2026-00001), paramètre..."
              className="w-full bg-slate-50 text-slate-800 font-mono text-xs rounded pl-9 pr-4 py-1.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder:text-slate-400 placeholder:italic"
            />
          </div>
        </div>

        {/* Right: Notifications & User Role Switcher */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
              title="Alertes et notifications"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalAlerts}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded shadow-xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 font-bold text-slate-800">
                  <span className="font-mono">Alertes IMROP</span>
                  <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded text-[10px] font-mono">{totalAlerts} alerte(s)</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {upcomingMaintenance.length > 0 && (
                    <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                      <div className="flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Maintenances d'équipements</span>
                      </div>
                      <ul className="mt-1 list-disc list-inside text-[11px] text-amber-800 font-mono">
                        {upcomingMaintenance.map((i) => (
                          <li key={i.id}>{i.name} ({i.code}) - {i.nextMaintenanceDate}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {expiringReagents.length > 0 && (
                    <div className="p-2 rounded bg-red-50 border border-red-200 text-red-900">
                      <div className="flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>Réactifs proches d'expiration</span>
                      </div>
                      <ul className="mt-1 list-disc list-inside text-[11px] text-red-800 font-mono">
                        {expiringReagents.map((r) => (
                          <li key={r.id}>{r.name} - Expiration: {r.expirationDate}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pendingValidations.length > 0 && (
                    <div className="p-2 rounded bg-teal-50 border border-teal-200 text-teal-900">
                      <div className="flex items-center gap-1 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Analyses en attente</span>
                      </div>
                      <p className="text-[11px] text-teal-800 mt-1 font-mono">
                        {pendingValidations.length} analyse(s) à vérifier.
                      </p>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <p className="text-slate-500 text-center py-4 font-mono">Aucune alerte urgente.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded transition-colors text-left"
            >
              <div className="w-6 h-6 rounded bg-[#0f172a] flex items-center justify-center font-bold font-mono text-[11px] text-white">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold leading-tight text-slate-800 font-mono">{currentUser.name}</p>
                <p className="text-[10px] text-teal-700 leading-tight font-mono">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded shadow-xl p-2 z-50 text-xs">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[10px] uppercase font-mono font-bold text-slate-500">Profil Utilisateur</p>
                  <p className="text-[11px] text-slate-500 italic">Changer de rôle pour tester les droits</p>
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded flex items-center justify-between transition-colors font-mono ${
                        currentUser.id === u.id
                          ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.role} — {u.lab}</p>
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">Mot de passe : ••••••••</p>
                      </div>
                      {currentUser.id === u.id && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1.5 rounded text-xs font-mono font-bold transition-colors"
            title="Verrouiller la session / Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};
