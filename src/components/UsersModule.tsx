import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Lock,
  UserPlus,
  Edit3,
  Trash2,
  CheckCircle2,
  UserX,
  X,
  Save,
  ShieldAlert,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  Copy
} from 'lucide-react';
import { useLIMS } from '../services/limsStore';
import { User, UserRole, LabType } from '../types/lims';

export const UsersModule: React.FC = () => {
  const { users, currentUser, setCurrentUser, addUser, updateUser, deleteUser } = useLIMS();

  const isAdmin = currentUser.role === 'Administrateur';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Quick Password Change Modal
  const [pwdModalUser, setPwdModalUser] = useState<User | null>(null);
  const [newQuickPassword, setNewQuickPassword] = useState('');
  const [showQuickPwd, setShowQuickPwd] = useState(false);

  // Switch session authentication modal
  const [switchModalUser, setSwitchModalUser] = useState<User | null>(null);
  const [switchPasswordInput, setSwitchPasswordInput] = useState('');
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [showSwitchPwd, setShowSwitchPwd] = useState(false);

  // Visible passwords on cards map: { userId: boolean }
  const [visibleCardPwds, setVisibleCardPwds] = useState<Record<string, boolean>>({});
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  // Form state for Create / Edit User
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    lab: LabType;
    active: boolean;
    password: string;
  }>({
    name: '',
    email: '',
    role: 'Analyste',
    lab: 'Laboratoire de Chimie',
    active: true,
    password: ''
  });

  const [showFormPwd, setShowFormPwd] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const availableRoles: UserRole[] = [
    'Administrateur',
    'Responsable du laboratoire',
    'Analyste',
    'Technicien',
    'Consultation'
  ];

  const availableLabs: LabType[] = [
    'Laboratoire de Chimie',
    'Laboratoire de Biologie',
    'Laboratoire d\'Analyses environnementales',
    'Laboratoire d\'Halieutique'
  ];

  const rolePermissions = [
    {
      role: 'Administrateur',
      desc: 'Accès complet, gestion des utilisateurs, création des mots de passe, édition des rôles et configuration.',
      badge: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      role: 'Responsable du laboratoire',
      desc: 'Validation finale ISO 17025 des résultats, signature des rapports PDF et gestion des méthodes.',
      badge: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      role: 'Analyste',
      desc: 'Saisie des mesures analytiques (pH, salinité, etc.), calculs automatiques et soumission pour contrôle.',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    {
      role: 'Technicien',
      desc: 'Réception et enregistrement des échantillons, étiquetage codes-barres, gestion équipements et réactifs.',
      badge: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      role: 'Consultation',
      desc: 'Lecture seule des échantillons, résultats validés et rapports d\'analyse archivés.',
      badge: 'bg-slate-100 text-slate-800 border-slate-200'
    }
  ];

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'Analyste',
      lab: 'Laboratoire de Chimie',
      active: true,
      password: 'imrop' + Math.floor(1000 + Math.random() * 9000)
    });
    setShowFormPwd(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      lab: u.lab,
      active: u.active,
      password: u.password || 'imrop2026'
    });
    setShowFormPwd(false);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, formData);
      setSuccessMsg(`Utilisateur "${formData.name}" et son mot de passe ont été mis à jour.`);
    } else {
      addUser(formData);
      setSuccessMsg(`Utilisateur "${formData.name}" créé avec succès (Rôle: ${formData.role}).`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleOpenQuickPassword = (u: User) => {
    setPwdModalUser(u);
    setNewQuickPassword(u.password || 'imrop2026');
    setShowQuickPwd(true);
  };

  const handleSaveQuickPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdModalUser || !newQuickPassword.trim()) return;

    updateUser(pwdModalUser.id, { password: newQuickPassword.trim() });
    setSuccessMsg(`Nouveau mot de passe enregistré pour ${pwdModalUser.name}.`);
    setPwdModalUser(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDeleteUser = (u: User) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${u.name}" ?`)) {
      deleteUser(u.id);
      setSuccessMsg(`Utilisateur "${u.name}" supprimé.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleToggleActive = (u: User) => {
    updateUser(u.id, { active: !u.active });
    setSuccessMsg(`Statut de "${u.name}" changé vers : ${!u.active ? 'Actif' : 'Inactif'}`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleCardPwdVisibility = (userId: string) => {
    setVisibleCardPwds((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyPassword = (userId: string, pwd?: string) => {
    if (!pwd) return;
    navigator.clipboard.writeText(pwd);
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  // Switch session with password verification
  const handleInitiateSwitchSession = (u: User) => {
    setSwitchModalUser(u);
    setSwitchPasswordInput('');
    setSwitchError(null);
    setShowSwitchPwd(false);
  };

  const handleConfirmSwitchSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!switchModalUser) return;

    // Check password match or allow admin bypass
    const expectedPwd = switchModalUser.password || 'imrop2026';
    if (switchPasswordInput === expectedPwd || isAdmin) {
      setCurrentUser(switchModalUser);
      setSuccessMsg(`Session basculée sur : ${switchModalUser.name} (${switchModalUser.role})`);
      setSwitchModalUser(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setSwitchError('Mot de passe incorrect. Veuillez réessayer.');
    }
  };

  const adminUser = users.find((u) => u.role === 'Administrateur') || users[0];

  return (
    <div id="lims-users-module" className="space-y-6 font-mono text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
              Gestion des Utilisateurs & Mots de Passe
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Création de comptes, gestion sécurisée des mots de passe et droits d'accès ISO 17025.
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider shrink-0"
          >
            <UserPlus className="w-4 h-4 text-teal-400" />
            <span>Créer Utilisateur & MDP</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentUser(adminUser)}
            className="flex items-center gap-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs px-3.5 py-2 rounded shadow-sm transition-all cursor-pointer uppercase tracking-wider shrink-0"
          >
            <ShieldCheck className="w-4 h-4 text-purple-200" />
            <span>Passer en Mode Administrateur</span>
          </button>
        )}
      </div>

      {/* Admin Privilege Status Alert */}
      {isAdmin ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs text-emerald-800 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Mode Administrateur Actif ({currentUser.name}) :</strong> Vous avez le contrôle total pour créer, éditer les profils et réinitialiser les mots de passe de tous les utilisateurs.
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Session actuelle ({currentUser.name} - {currentUser.role}) :</strong> Connectez-vous avec un compte Administrateur pour modifier les rôles et créer des mots de passe.
            </span>
          </div>
          <button
            onClick={() => setCurrentUser(adminUser)}
            className="underline font-bold hover:text-amber-950 text-[11px] uppercase tracking-wider shrink-0 cursor-pointer"
          >
            Activer Droits Admin
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-teal-50 border border-teal-200 text-teal-900 rounded p-3 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => {
          const isUserCurrent = currentUser.id === u.id;
          const isPwdVisible = !!visibleCardPwds[u.id];
          const pwd = u.password || 'imrop2026';

          return (
            <div
              key={u.id}
              className={`bg-white border rounded p-5 space-y-4 shadow-sm transition-all ${
                isUserCurrent ? 'ring-2 ring-teal-500 border-teal-300' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#0f172a] font-bold text-teal-400 flex items-center justify-center text-sm shadow">
                    {u.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{u.name}</h3>
                      {isUserCurrent && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-100 text-teal-800 border border-teal-300 uppercase">
                          Moi
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                      u.role === 'Administrateur'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : u.role === 'Responsable du laboratoire'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : u.role === 'Analyste'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {u.role}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      u.active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'
                    }`}
                  >
                    {u.active ? '● Actif' : '○ Désactivé'}
                  </span>
                </div>
              </div>

              {/* Lab & Credentials section */}
              <div className="bg-slate-50 p-3 rounded space-y-2 text-xs border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold">Laboratoire Rattaché:</span>
                  <span className="font-bold text-slate-800">{u.lab}</span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-bold flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mot de passe:</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 tracking-wider">
                      {isPwdVisible ? pwd : '••••••••'}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleCardPwdVisibility(u.id)}
                      className="text-slate-500 hover:text-slate-800 cursor-pointer p-0.5"
                      title={isPwdVisible ? 'Masquer' : 'Afficher'}
                    >
                      {isPwdVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyPassword(u.id, pwd)}
                      className="text-slate-500 hover:text-teal-700 cursor-pointer p-0.5"
                      title="Copier le mot de passe"
                    >
                      {copiedUserId === u.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => handleInitiateSwitchSession(u)}
                  className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer uppercase tracking-wider flex items-center gap-1"
                  title="Se connecter sous ce compte avec mot de passe"
                >
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Basculer Session</span>
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenQuickPassword(u)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                      title="Changer le mot de passe de cet utilisateur"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Modifier MDP</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(u)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm"
                      title="Modifier les informations et le rôle"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-200" />
                      <span>Éditer Rôle</span>
                    </button>

                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`p-1.5 rounded border transition-colors cursor-pointer ${
                        u.active
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                      title={u.active ? 'Désactiver ce compte' : 'Activer ce compte'}
                    >
                      {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDeleteUser(u)}
                      disabled={isUserCurrent}
                      className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-40 cursor-pointer"
                      title="Supprimer définitivement l'utilisateur"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Matrix ISO 17025 */}
      <div className="bg-white p-5 rounded border border-slate-200 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-600" />
          <span>Matrice des Rôles & Sécurité des Mots de Passe ISO 17025</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {rolePermissions.map((rp) => (
            <div key={rp.role} className="bg-slate-50 p-3.5 rounded border border-slate-200 space-y-2">
              <span className={`px-2.5 py-0.5 rounded font-bold border inline-block text-[10px] ${rp.badge}`}>
                {rp.role}
              </span>
              <p className="text-slate-600">{rp.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Password Modal */}
      {pwdModalUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Modifier Mot de Passe : {pwdModalUser.name}
                </h3>
              </div>
              <button
                onClick={() => setPwdModalUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nouveau Mot de Passe</label>
                <div className="relative">
                  <input
                    type={showQuickPwd ? 'text' : 'password'}
                    required
                    value={newQuickPassword}
                    onChange={(e) => setNewQuickPassword(e.target.value)}
                    placeholder="Saisissez un mot de passe sécurisé"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 pr-10 text-slate-900 font-bold focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowQuickPwd(!showQuickPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showQuickPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Le mot de passe sera enregistré de manière permanente dans la base locale (localStorage).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPwdModalUser(null)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#0f172a] hover:bg-slate-800 text-white font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4 text-teal-400" />
                  <span>Enregistrer Mot de Passe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Switch Session Authentication Modal */}
      {switchModalUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Connexion : {switchModalUser.name}
                </h3>
              </div>
              <button
                onClick={() => setSwitchModalUser(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSwitchSession} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
                <p className="text-slate-700 font-bold">{switchModalUser.name}</p>
                <p className="text-slate-500 text-[11px]">{switchModalUser.role} — {switchModalUser.lab}</p>
              </div>

              {switchError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded font-bold text-[11px]">
                  {switchError}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Entrez le Mot de Passe</label>
                <div className="relative">
                  <input
                    type={showSwitchPwd ? 'text' : 'password'}
                    required={!isAdmin}
                    value={switchPasswordInput}
                    onChange={(e) => setSwitchPasswordInput(e.target.value)}
                    placeholder="Saisissez votre mot de passe"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 pr-10 text-slate-900 font-bold focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSwitchPwd(!showSwitchPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showSwitchPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Accès sécurisé ISO 17025 — Saisissez votre mot de passe personnel.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSwitchModalUser(null)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#0f172a] hover:bg-slate-800 text-white font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span>Valider & Ouvrir Session</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  {editingUser ? `Modifier Utilisateur: ${editingUser.name}` : 'Nouveau Compte Utilisateur'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nom Complet</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Dr. Mohamed Ould Cheikh"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-900 font-bold focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="m.cheikh@imrop.mr"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-900 font-bold focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Mot de Passe Utilisateur</label>
                <div className="relative">
                  <input
                    type={showFormPwd ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Définissez un mot de passe"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 pr-10 text-slate-900 font-bold focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPwd(!showFormPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showFormPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Ce mot de passe servira à l'authentification et à la validation des signatures d'analyse.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 text-teal-700">Rôle & Droits d'Accès IMROP</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 border-2 border-teal-500 rounded p-2.5 text-slate-900 font-bold focus:ring-1 focus:ring-teal-500"
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Sélectionnez le rôle qui définit les privilèges de signature, validation et accès.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Laboratoire d'Affectation</label>
                <select
                  value={formData.lab}
                  onChange={(e) => setFormData({ ...formData, lab: e.target.value as LabType })}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-slate-900 font-bold focus:ring-1 focus:ring-teal-500"
                >
                  {availableLabs.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-slate-800 font-bold cursor-pointer">
                  Compte Actif
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#0f172a] hover:bg-slate-800 text-white font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4 text-teal-400" />
                  <span>Enregistrer Compte & MDP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
