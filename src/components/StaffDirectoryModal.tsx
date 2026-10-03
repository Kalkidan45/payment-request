import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRoleDisplay } from '../utils/format';
import {
  X,
  UserPlus,
  Users,
  Building2,
  Phone,
  Mail,
  Shield,
  Check,
  Lock,
  Key,
  AlertCircle,
} from 'lucide-react';
import { Role, BranchLocation } from '../types';

export const StaffDirectoryModal: React.FC = () => {
  const {
    isStaffDirectoryOpen,
    setIsStaffDirectoryOpen,
    users,
    createStaffByManager,
    currentUser,
    isGeneralManager,
    login,
  } = useApp();

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [roleTitle, setRoleTitle] = useState('Sales Associate');
  const [department, setDepartment] = useState('Retail Sales');
  const [branch, setBranch] = useState<BranchLocation>('Bole Medhanialem Flagship');
  const [phone, setPhone] = useState('+251 9');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isStaffDirectoryOpen) return null;

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim() || !email.trim()) return;

    setSaving(true);
    try {
      await createStaffByManager({
        username: username.trim(),
        password: password.trim(),
        name: name.trim(),
        email: email.trim(),
        role,
        roleTitle,
        department,
        branch,
        phone,
      });

      setSuccessMsg(`Account for ${name} (@${username}) successfully registered!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsAddingUser(false);
      setUsername('');
      setName('');
      setEmail('');
      setPassword('password123');
    } catch (err: any) {
      alert(err.message || 'Error creating staff');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-2xl my-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-[#00AEEF] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Kurtta Personnel & Credential Directory</h2>
              <p className="text-xs text-stone-400">
                Staff, Finance, and General Manager credentials (3-Tier Structure)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGeneralManager && !isAddingUser && (
              <button
                onClick={() => setIsAddingUser(true)}
                className="flex items-center gap-1 bg-[#00AEEF] hover:bg-[#0284C7] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsStaffDirectoryOpen(false);
                setIsAddingUser(false);
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {isAddingUser ? (
            /* Add User Form */
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#00AEEF]" />
                  <span>Register Personnel Account</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="text-xs text-stone-500 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Login Credentials Section */}
              <div className="bg-sky-50/70 border border-sky-200 p-3.5 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" /> User Login Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Login Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="e.g. aster"
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#00AEEF] text-stone-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Initial Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. password123"
                      className="w-full p-2 bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#00AEEF] text-stone-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aster Tarekegn"
                    className="w-full p-2 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aster@kurttakids.com"
                    className="w-full p-2 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const r = e.target.value as Role;
                      setRole(r);
                      if (r === 'staff') setRoleTitle('Sales Associate');
                      if (r === 'finance') setRoleTitle('Finance Custodian');
                    }}
                    className="w-full p-2 border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="staff">Staff / Requester (Request page only)</option>
                    <option value="finance">Finance Custodian (Disbursement & Reports)</option>
                  </select>
                  <p className="text-[10px] text-stone-400 mt-1">
                    * The organization has one General Manager with sole approval authority.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Retail Associate"
                    className="w-full p-2 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Branch *</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as BranchLocation)}
                    className="w-full p-2 border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="Bole Medhanialem Flagship">Bole Medhanialem Flagship</option>
                    <option value="Piassa Kids Corner">Piassa Kids Corner</option>
                    <option value="Kazanchis Atelier">Kazanchis Atelier</option>
                    <option value="CMC Kids Boutique">CMC Kids Boutique</option>
                    <option value="Head Office / Warehouse">Head Office / Warehouse</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#00AEEF] hover:bg-[#0284C7] text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{saving ? 'Creating User Account...' : 'Create Account & Save to Database'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Staff List */
            <div className="space-y-3">
              {!isGeneralManager && (
                <div className="bg-sky-50 border border-sky-200 text-[#0284C7] p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#00AEEF]" />
                  <span>Note: Only the General Manager can register new personnel accounts.</span>
                </div>
              )}

              {users.map((u) => {
                const roleBadge = getRoleDisplay(u.role);
                const isCurrent = currentUser?.id === u.id;

                return (
                  <div
                    key={u.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-sky-300 bg-sky-50/50'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl}
                        alt={u.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-stone-900">{u.name}</h4>
                          <span className="text-[11px] font-mono text-stone-500">
                            (@{u.username})
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-[#00AEEF] text-white px-2 py-0.2 rounded-full font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#0284C7] font-medium">{u.roleTitle}</p>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-stone-400" />
                            {u.branch.split(' ')[0]}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                      <span
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border ${roleBadge.bg} ${roleBadge.color} ${roleBadge.border}`}
                      >
                        {u.role === 'general_manager' ? '👑 Sole General Manager' : roleBadge.title}
                      </span>

                      {!isCurrent && (
                        <button
                          onClick={() => {
                            login(u.id);
                            setIsStaffDirectoryOpen(false);
                          }}
                          className="text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg font-medium cursor-pointer"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
