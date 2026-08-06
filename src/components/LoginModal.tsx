import React, { useState } from 'react';
import {
  Lock,
  UserCheck,
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  AlertTriangle,
  LogIn,
  CheckCircle2,
  Building2,
  ChevronRight
} from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import imropLogo from '../assets/images/imrop_new_official_logo_1786017881022.jpg';

export const LoginModal: React.FC = () => {
  const { users, login } = useLIMS();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg("Veuillez saisir votre nom d'utilisateur ou adresse e-mail.");
      return;
    }

    if (!password) {
      setErrorMsg("Veuillez saisir votre mot de passe.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.message || 'Authentification échouée.');
      }
    }, 250);
  };

  const handleSelectDemoUser = (userEmail: string, userPwd?: string) => {
    setIdentifier(userEmail);
    setPassword(userPwd || 'imrop2026');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1b62a5] to-[#0f172a] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10 backdrop-brightness-110 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white p-1.5 shadow-lg mb-3 ring-4 ring-white/20">
              <img
                src={imropLogo}
                alt="Logo IMROP"
                className="w-full h-full object-contain rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <h2 className="text-sm font-semibold tracking-wide text-blue-100 font-sans">
              الجمهورية الإسلامية الموريتانية
            </h2>
            <h1 className="text-base font-extrabold tracking-tight text-white font-mono mt-0.5">
              المعهد الموريتاني لبحوث المحيطات والصيد
            </h1>
            <p className="text-[11px] text-blue-200 font-medium mt-0.5">
              Institut Mauritanien de Recherches Océanographiques et des Pêches
            </p>

            <div className="mt-3 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>Contrôle d'Accès Sécurisé — ISO 17025</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 font-mono">
              Autorisation d'Accès Utilisateur
            </h3>
            <p className="text-xs text-slate-500">
              Veuillez saisir votre identifiant et mot de passe pour accéder au système.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono">Erreur d'authentification :</span>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold font-mono text-slate-700 mb-1.5">
                Utilisateur / E-mail IMROP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ex: brahim.moustapha@imrop.mr ou Brahim"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-slate-800 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold font-mono text-slate-700 mb-1.5">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisir votre mot de passe"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-slate-800 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#1b62a5] hover:bg-[#144c82] text-white font-mono font-bold text-xs rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <span>Vérification des accès...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  <span>Se Connecter / Ouvrir Session</span>
                </>
              )}
            </button>
          </form>

          {/* Quick User Selector Card */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-mono font-bold text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Comptes pré-enregistrés (Cliquez pour sélectionner) :</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectDemoUser(u.email, u.password)}
                  className={`p-2.5 rounded-lg border text-left transition-all font-mono flex items-center justify-between ${
                    identifier === u.email
                      ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-500/20 text-teal-900'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="truncate pr-1">
                    <p className="text-[11px] font-bold truncate">{u.name}</p>
                    <p className="text-[9px] text-slate-500 truncate">{u.role}</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                      Mot de passe : <span className="font-mono text-slate-500">••••••••</span>
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
          IMROP v4.0 — Laboratoire de Chimie — Nouakchott, Mauritanie
        </div>
      </div>
    </div>
  );
};
