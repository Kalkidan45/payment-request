import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getRoleDisplay } from '../utils/format';
import {
  X,
  UserPlus,
  Users,
  Building2,
  Mail,
  Shield,
  Check,
  Key,
  Pencil,
  Trash2,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { Role, BranchLocation, User } from '../types';

export const StaffDirectoryModal: React.FC = () => {
  const {
    isStaffDirectoryOpen,
    setIsStaffDirectoryOpen,
    users,
    createStaffByManager,
    updateStaffByManager,
    deleteStaffByManager,
    currentUser,
    isGeneralManager,
  } = useApp();

  // Mode state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Add form state
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('password123');
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<Role>('staff');
  const [addRoleTitle, setAddRoleTitle] = useState('Sales Associate');
  const [addDepartment, setAddDepartment] = useState('Retail Sales');
  const [addBranch, setAddBranch] = useState<BranchLocation>('Bole Medhanialem Flagship');
  const [addPhone, setAddPhone] = useState('+251 9');

  // Edit form state
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<Role>('staff');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editBranch, setEditBranch] = useState<BranchLocation>('Bole Medhanialem Flagship');
  const [editPhone, setEditPhone] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isStaffDirectoryOpen) return null;

  // Open edit mode pre-populated with user data
  const handleStartEdit = (user: User) => {
    setEditingUser(user);
    setIsAddingUser(false);
    setErrorMsg('');
    setConfirmDeleteId(null);

    setEditUsername(user.username);
    setEditPassword(user.password || 'password123');
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditRoleTitle(user.roleTitle || '');
    setEditDepartment(user.department || 'Retail Operations');
    setEditBranch(user.branch);
    setEditPhone(user.phone || '+251 9');
    setShowEditPassword(false);
  };

  const handleClose = () => {
    setIsStaffDirectoryOpen(false);
    setIsAddingUser(false);
    setEditingUser(null);
    setErrorMsg('');
    setConfirmDeleteId(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!addUsername.trim() || !addName.trim() || !addEmail.trim()) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }

    setSaving(true);
    try {
      await createStaffByManager({
        username: addUsername.trim(),
        password: addPassword.trim(),
        name: addName.trim(),
        email: addEmail.trim(),
        role: addRole,
        roleTitle: addRoleTitle,
        department: addDepartment,
        branch: addBranch,
        phone: addPhone,
      });

      setSuccessMsg(`Account for ${addName} (@${addUsername.toLowerCase()}) successfully registered!`);
      setTimeout(() => setSuccessMsg(''), 4500);
      setIsAddingUser(false);
      setAddUsername('');
      setAddName('');
      setAddEmail('');
      setAddPassword('password123');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating user account');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMsg('');

    if (!editUsername.trim() || !editName.trim() || !editEmail.trim()) {
      setErrorMsg('Username, Name, and Email are required.');
      return;
    }

    setSaving(true);
    try {
      await updateStaffByManager(editingUser.id, {
        username: editUsername.trim().toLowerCase(),
        password: editPassword.trim(),
        name: editName.trim(),
        email: editEmail.trim(),
        role: editRole,
        roleTitle: editRoleTitle.trim() || (editRole === 'general_manager' ? 'General Manager' : editRole === 'finance' ? 'Finance Custodian' : 'Store Requester'),
        department: editDepartment.trim(),
        branch: editBranch,
        phone: editPhone.trim(),
      });

      setSuccessMsg(`User profile & credentials for ${editName} (@${editUsername.trim().toLowerCase()}) updated successfully!`);
      setTimeout(() => setSuccessMsg(''), 4500);
      setEditingUser(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setSaving(true);
    setErrorMsg('');
    try {
      await deleteStaffByManager(userId);
      setSuccessMsg('User account successfully removed from directory.');
      setTimeout(() => setSuccessMsg(''), 4000);
      setEditingUser(null);
      setConfirmDeleteId(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error deleting user');
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
              <h2 className="text-base font-bold">Kurtta Personnel & User Management</h2>
              <p className="text-xs text-stone-400">
                Staff, Finance & General Manager Administration Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isGeneralManager && !isAddingUser && !editingUser && (
              <button
                onClick={() => {
                  setIsAddingUser(true);
                  setErrorMsg('');
                }}
                className="flex items-center gap-1 bg-[#00AEEF] hover:bg-[#0284C7] text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add User</span>
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {/* Notifications */}
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* EDIT USER FORM (General Manager Exclusive)                     */}
          {/* ============================================================== */}
          {editingUser ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setErrorMsg('');
                    }}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <span className="text-stone-300">|</span>
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Pencil className="w-4 h-4 text-[#00AEEF]" />
                    <span>Edit User: {editingUser.name}</span>
                    <span className="text-xs font-mono text-stone-500">(@{editingUser.username})</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Login Credentials Section */}
              <div className="bg-sky-50/80 border border-sky-200 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0284C7] uppercase tracking-wider flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" /> Login Credentials & Security
                  </span>
                  <span className="text-[10px] text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full font-medium">
                    Changes take effect immediately
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Login Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="e.g. aster"
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#00AEEF] text-stone-900 font-mono text-xs"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Username used on the login screen
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Login Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        required
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="New password"
                        className="w-full p-2.5 pr-9 bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:border-[#00AEEF] text-stone-900 font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        title={showEditPassword ? 'Hide password' : 'Show password'}
                      >
                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-1">
                      Type a new password to update/reset credentials
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal & Organizational Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Aster Tadesse"
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="aster@kurttakids.com"
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Account Role *</label>
                  <select
                    value={editRole}
                    onChange={(e) => {
                      const r = e.target.value as Role;
                      setEditRole(r);
                      if (r === 'staff' && !editRoleTitle) setEditRoleTitle('Sales Associate');
                      if (r === 'finance' && !editRoleTitle) setEditRoleTitle('Finance Custodian');
                      if (r === 'general_manager' && !editRoleTitle) setEditRoleTitle('General Manager');
                    }}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-hidden focus:border-[#00AEEF]"
                  >
                    <option value="staff">Store Staff / Requester (Requisition page only)</option>
                    <option value="finance">Finance Custodian (Check, Verify & Payment)</option>
                    <option value="general_manager">General Manager (Approval & User Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={editRoleTitle}
                    onChange={(e) => setEditRoleTitle(e.target.value)}
                    placeholder="e.g. Senior Store Lead"
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Assigned Branch *</label>
                  <select
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value as BranchLocation)}
                    className="w-full p-2.5 border border-stone-200 rounded-xl bg-white focus:outline-hidden focus:border-[#00AEEF]"
                  >
                    <option value="Bole Medhanialem Flagship">Bole Medhanialem Flagship</option>
                    <option value="Piassa Kids Corner">Piassa Kids Corner</option>
                    <option value="Kazanchis Atelier">Kazanchis Atelier</option>
                    <option value="CMC Kids Boutique">CMC Kids Boutique</option>
                    <option value="Head Office / Warehouse">Head Office / Warehouse</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="e.g. Retail Operations"
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+251 91..."
                    className="w-full p-2.5 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#00AEEF]"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Delete / Deactivate option for non-GM users */}
                <div>
                  {editingUser.role !== 'general_manager' && editingUser.id !== currentUser?.id ? (
                    confirmDeleteId === editingUser.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose-600 font-semibold">Confirm delete?</span>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => handleDeleteUser(editingUser.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-stone-500 hover:text-stone-700 text-xs px-2 py-1 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(editingUser.id)}
                        className="flex items-center gap-1 text-rose-600 hover:text-rose-800 text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete User</span>
                      </button>
                    )
                  ) : (
                    <span className="text-[11px] text-stone-400 italic">
                      Protected system account
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setErrorMsg('');
                    }}
                    className="w-1/2 sm:w-auto px-4 py-2.5 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 sm:w-auto flex items-center justify-center gap-1.5 bg-[#00AEEF] hover:bg-[#0284C7] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save User Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : isAddingUser ? (
            /* ============================================================== */
            /* ADD USER FORM                                                  */
            /* ============================================================== */
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
                      value={addUsername}
                      onChange={(e) => setAddUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
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
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
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
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Aster Tarekegn"
                    className="w-full p-2 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Company Email *</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="aster@kurttakids.com"
                    className="w-full p-2 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Role *</label>
                  <select
                    value={addRole}
                    onChange={(e) => {
                      const r = e.target.value as Role;
                      setAddRole(r);
                      if (r === 'staff') setAddRoleTitle('Sales Associate');
                      if (r === 'finance') setAddRoleTitle('Finance Custodian');
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
                    value={addRoleTitle}
                    onChange={(e) => setAddRoleTitle(e.target.value)}
                    placeholder="e.g. Retail Associate"
                    className="w-full p-2 border border-stone-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Branch *</label>
                  <select
                    value={addBranch}
                    onChange={(e) => setAddBranch(e.target.value as BranchLocation)}
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
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
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
            /* ============================================================== */
            /* USER DIRECTORY & MANAGEMENT LIST                               */
            /* ============================================================== */
            <div className="space-y-3">
              <div className="bg-sky-50 border border-sky-200 text-[#0284C7] p-3 rounded-xl text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-[#00AEEF]" />
                <span>
                  {isGeneralManager ? (
                    <>
                      <strong>General Manager Access:</strong> You have full administrative authority to <strong>edit user profiles</strong>, change login usernames & passwords, adjust assigned roles/branches, or register new team members.
                    </>
                  ) : (
                    <>
                      <strong>Multi-Role Workflow Governance:</strong> Staff submit requests, Finance checks and disburses payments, and only the <strong>General Manager</strong> can create and edit user accounts.
                    </>
                  )}
                </span>
              </div>

              {users.map((u) => {
                const roleBadge = getRoleDisplay(u.role);
                const isCurrent = currentUser?.id === u.id;

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-sky-300 bg-sky-50/40'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl}
                        alt={u.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-stone-900">{u.name}</h4>
                          <span className="text-[11px] font-mono text-stone-500 font-medium">
                            (@{u.username})
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-[#00AEEF] text-white px-2 py-0.5 rounded-full font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#0284C7] font-medium">{u.roleTitle}</p>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-stone-400" />
                            {u.branch.split(' ')[0]}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {u.email}
                          </span>
                          {u.phone && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-stone-400" />
                                {u.phone}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-stone-100">
                      <div className="flex items-center gap-2 self-start sm:self-end">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${roleBadge.bg} ${roleBadge.color} ${roleBadge.border}`}
                        >
                          {roleBadge.title}
                        </span>

                        {isGeneralManager && (
                          <button
                            onClick={() => handleStartEdit(u)}
                            className="flex items-center gap-1 bg-stone-100 hover:bg-[#00AEEF] hover:text-white text-stone-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-stone-200 transition-all cursor-pointer shadow-2xs"
                            title="Edit user details and login credentials"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>

                      {isGeneralManager && (
                        <div className="text-[11px] font-mono text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200 flex items-center gap-1.5 self-start sm:self-end">
                          <Key className="w-3 h-3 text-stone-400" />
                          <span>pwd: <strong className="text-stone-800 font-semibold">{u.password || 'password123'}</strong></span>
                        </div>
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
