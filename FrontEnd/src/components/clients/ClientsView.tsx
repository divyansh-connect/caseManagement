import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Award, 
  FileText,
  ChevronRight,
  Sparkles,
  Globe,
  X,
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Client, UserRole } from '../../types';
import { StatusBadge } from '../common/Badge';
import { api } from '../../services/api';

interface ClientsViewProps {
  clients: Client[];
  openNewCaseModal: () => void;
  openNewClientOnboardingModal?: () => void;
  userRole?: UserRole;
  onUpdateClient?: (updatedClient: Client) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ 
  clients, 
  openNewCaseModal,
  openNewClientOnboardingModal,
  userRole = 'admin',
  onUpdateClient,
  onDeleteClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('all');
  const [activeProfileClient, setActiveProfileClient] = useState<Client | null>(null);

  // Inline edit state variables
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Custom confirmation and alert Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Password reset inline states
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editField, setEditField] = useState('');
  const [editDegree, setEditDegree] = useState('Ph.D.');
  const [editUniversity, setEditUniversity] = useState('');
  const [editCitations, setEditCitations] = useState(0);
  const [editPublications, setEditPublications] = useState(0);
  const [editPatents, setEditPatents] = useState(0);
  const [editStatus, setEditStatus] = useState('Active');

  // Team assignment states
  const [assignedWriter, setAssignedWriter] = useState('Petition Drafter 1');
  const [assignedReviewer, setAssignedReviewer] = useState('Senior Reviewer');
  const [teamSaveSuccess, setTeamSaveSuccess] = useState('');
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  // Load client details into editing state on modal open
  React.useEffect(() => {
    if (activeProfileClient) {
      setEditName(activeProfileClient.name);
      setEditEmail(activeProfileClient.email);
      setEditPhone(activeProfileClient.phone || '');
      setEditCountry(activeProfileClient.countryOfBirth || '');
      setEditField(activeProfileClient.currentField || '');
      setEditDegree(activeProfileClient.highestDegree || 'Ph.D.');
      setEditUniversity(activeProfileClient.university || '');
      setEditCitations(activeProfileClient.citationCount !== undefined ? activeProfileClient.citationCount : (activeProfileClient.citationsCount || 0));
      setEditPublications(activeProfileClient.paperCount !== undefined ? activeProfileClient.paperCount : (activeProfileClient.publicationsCount || 0));
      setEditPatents(activeProfileClient.patentCount !== undefined ? activeProfileClient.patentCount : (activeProfileClient.patentsCount || 0));
      setEditStatus(activeProfileClient.status || 'Active');
      setAssignedWriter((activeProfileClient as any).assignedWriter || (activeProfileClient as any).assignedDrafter || 'Petition Drafter 1');
      setAssignedReviewer((activeProfileClient as any).assignedReviewer || 'Senior Reviewer');
      setTeamSaveSuccess('');
      setIsEditing(false);
    }
  }, [activeProfileClient]);

  const handleSaveTeamAssignment = async () => {
    if (!activeProfileClient) return;
    setIsSavingTeam(true);
    try {
      const res = await api.put(`/clients/${activeProfileClient.id}`, {
        assignedWriter,
        assignedReviewer
      });
      if (res.success && res.data) {
        const updatedClient = {
          ...res.data,
          assignedWriter,
          assignedReviewer
        };
        setActiveProfileClient(updatedClient);
        if (onUpdateClient) onUpdateClient(updatedClient);
        setTeamSaveSuccess('Team assignment updated successfully!');
        setTimeout(() => setTeamSaveSuccess(''), 3000);
      }
    } catch (err: any) {
      alert('Failed to update team assignment: ' + (err.message || 'Error'));
    } finally {
      setIsSavingTeam(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!activeProfileClient) return;
    if (!editName.trim() || !editEmail.trim() || !editField.trim()) {
      alert('Name, Email, and Field of Endeavor are required.');
      return;
    }

    try {
      const res = await api.put(`/clients/${activeProfileClient.id}`, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        countryOfBirth: editCountry,
        currentField: editField,
        highestDegree: editDegree,
        university: editUniversity,
        citationsCount: Number(editCitations),
        publicationsCount: Number(editPublications),
        patentsCount: Number(editPatents),
        status: editStatus
      });

      if (res.success && res.data) {
        alert('Client profile updated successfully.');
        if (onUpdateClient) {
          onUpdateClient(res.data);
        }
        setActiveProfileClient(res.data);
        setIsEditing(false);
      } else {
        alert('Failed to update profile: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleClearProfile = () => {
    if (!activeProfileClient || isDeleting) return;
    setDeleteError('');
    setShowConfirmModal(true);
  };

  const confirmDeletion = async () => {
    if (!activeProfileClient) return;
    setDeleteError('');
    setIsDeleting(true);
    try {
      const res = await api.delete(`/clients/${activeProfileClient.id}`);
      if (res.success) {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        if (onDeleteClient) {
          await onDeleteClient(activeProfileClient.id);
        }
      } else {
        setDeleteError('Failed to delete profile: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      setDeleteError(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.currentField.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDegree = selectedDegree === 'all' || c.highestDegree.includes(selectedDegree);

    return matchesSearch && matchesDegree;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Client Profiles Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Profiles, academic degree verifications, publication records, and citation metrics for petition applicants.
          </p>
        </div>

        {(userRole === 'admin' || userRole === 'superadmin') && (
          <button
            onClick={openNewClientOnboardingModal || openNewCaseModal}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search client name, field, university..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium shrink-0">Degree Threshold:</span>
          <select
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
            className="w-full sm:w-auto max-w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="all">All Qualifications</option>
            <option value="Ph.D.">Ph.D. Holders</option>
            <option value="Master's">Master's Degree</option>
            <option value="Exceptional">Exceptional Ability</option>
          </select>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center border border-blue-200 shrink-0">
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{client.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{client.countryOfBirth} • Joined {client.createdAt ? client.createdAt.substring(0,10) : ''}</p>
                  </div>
                </div>
                <StatusBadge status={client.status} />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Field of Proposed Endeavor</span>
                <p className="text-xs font-semibold text-blue-700 leading-snug">{client.currentField}</p>
              </div>

              {/* Metrics Pills */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Citations</span>
                  <span className="font-extrabold text-slate-800 text-xs">
                    {client.citationCount !== undefined ? client.citationCount : (client.citationsCount || 0)}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Papers</span>
                  <span className="font-extrabold text-slate-800 text-xs">
                    {client.paperCount !== undefined ? client.paperCount : (client.publicationsCount || 0)}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Patents</span>
                  <span className="font-extrabold text-slate-800 text-xs">
                    {client.patentCount !== undefined ? client.patentCount : (client.patentsCount || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 text-slate-600 min-w-0">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold">{client.highestDegree}</span>
                <span className="text-[10px] text-slate-400 truncate">({client.university})</span>
              </div>
              <button 
                onClick={() => setActiveProfileClient(client)}
                className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer ml-auto"
              >
                <span>View Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Client Profile Summary Modal */}
      {activeProfileClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl border border-slate-200 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto my-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 sm:pb-4 gap-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-600 text-white font-bold text-sm sm:text-base flex items-center justify-center shadow-md shrink-0">
                  {(editName || activeProfileClient.name).split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                {isEditing ? (
                  <div className="space-y-1.5 w-full pr-2">
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      placeholder="Candidate Full Name"
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                      <input 
                        type="email" 
                        value={editEmail} 
                        onChange={(e) => setEditEmail(e.target.value)} 
                        placeholder="Email Address"
                        className="w-full sm:w-1/2 p-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                      <input 
                        type="text" 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value)} 
                        placeholder="Phone Number"
                        className="w-full sm:w-1/2 p-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">{activeProfileClient.name}</h2>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {activeProfileClient.email} • {activeProfileClient.phone}
                    </p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => setActiveProfileClient(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Country of Birth</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editCountry} 
                    onChange={(e) => setEditCountry(e.target.value)} 
                    className="w-full p-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                ) : (
                  <p className="font-semibold text-slate-800">{activeProfileClient.countryOfBirth}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Field of Endeavor</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editField} 
                    onChange={(e) => setEditField(e.target.value)} 
                    className="w-full p-1 bg-white border border-slate-200 rounded text-xs font-semibold text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                  />
                ) : (
                  <p className="font-semibold text-blue-700">{activeProfileClient.currentField}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Highest Academic Qualification</span>
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select 
                      value={editDegree} 
                      onChange={(e) => setEditDegree(e.target.value)} 
                      className="w-full sm:w-1/2 p-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Ph.D.">Ph.D.</option>
                      <option value="Master's">Master's</option>
                      <option value="Bachelor's + 5 yrs">Bachelor's + 5 yrs</option>
                      <option value="Exceptional Ability">Exceptional Ability</option>
                    </select>
                    <input 
                      type="text" 
                      value={editUniversity} 
                      onChange={(e) => setEditUniversity(e.target.value)} 
                      placeholder="University"
                      className="w-full sm:w-1/2 p-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                ) : (
                  <p className="font-semibold text-slate-800">{activeProfileClient.highestDegree} ({activeProfileClient.university})</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Scholarly Impact</span>
                {isEditing ? (
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Cit:</span>
                      <input 
                        type="number" 
                        value={editCitations} 
                        onChange={(e) => setEditCitations(Math.max(0, parseInt(e.target.value) || 0))} 
                        className="w-12 p-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none text-center" 
                      />
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Pub:</span>
                      <input 
                        type="number" 
                        value={editPublications} 
                        onChange={(e) => setEditPublications(Math.max(0, parseInt(e.target.value) || 0))} 
                        className="w-12 p-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none text-center" 
                      />
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-[10px] text-slate-400 font-medium">Pat:</span>
                      <input 
                        type="number" 
                        value={editPatents} 
                        onChange={(e) => setEditPatents(Math.max(0, parseInt(e.target.value) || 0))} 
                        className="w-12 p-0.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none text-center" 
                      />
                    </div>
                  </div>
                ) : (
                  <p className="font-semibold text-slate-800">
                    {activeProfileClient.citationCount !== undefined ? activeProfileClient.citationCount : (activeProfileClient.citationsCount || 0)} Citations • {activeProfileClient.paperCount !== undefined ? activeProfileClient.paperCount : (activeProfileClient.publicationsCount || 0)} Papers • {activeProfileClient.patentCount !== undefined ? activeProfileClient.patentCount : (activeProfileClient.patentsCount || 0)} Patents
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-1 col-span-1 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status</span>
                  <select 
                    value={editStatus} 
                    onChange={(e) => setEditStatus(e.target.value)} 
                    className="w-full sm:w-auto p-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              )}

              {!isEditing && (userRole === 'admin' || userRole === 'superadmin') && (
                <>
                  <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 flex items-center justify-between col-span-1 sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-semibold">Account status</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const newStatus = activeProfileClient.status === 'Active' ? 'Inactive' : 'Active';
                          const res = await api.put(`/clients/${activeProfileClient.id}`, { status: newStatus });
                          if (res.success && res.data) {
                            if (onUpdateClient) onUpdateClient(res.data);
                            setActiveProfileClient(res.data);
                          }
                        } catch (err: any) {
                          alert('Failed to update status: ' + err.message);
                        }
                      }}
                      className={`px-3 py-1 text-[10px] font-extrabold rounded-full border cursor-pointer transition-colors ${
                        activeProfileClient.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {activeProfileClient.status === 'Active' ? 'Active (Green)' : 'Inactive (Red)'}
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-200 space-y-2 col-span-1 sm:col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-semibold block">Reset Client Password</span>
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        className="w-full sm:flex-1 p-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newPasswordVal || newPasswordVal.length < 6) {
                            alert('Password must be at least 6 characters.');
                            return;
                          }
                          try {
                            const res = await api.put(`/clients/${activeProfileClient.id}`, { password: newPasswordVal });
                            if (res.success) {
                              setResetSuccessMessage('Password reset successfully.');
                              setNewPasswordVal('');
                              setTimeout(() => setResetSuccessMessage(''), 3000);
                            }
                          } catch (err: any) {
                            alert('Failed to reset password: ' + err.message);
                          }
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-[10px] rounded-lg cursor-pointer transition-colors text-center shrink-0"
                      >
                        Reset Password
                      </button>
                    </div>
                    {resetSuccessMessage && (
                      <p className="text-[10px] font-bold text-emerald-600 mt-1">{resetSuccessMessage}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-2.5 sm:gap-3 items-stretch sm:items-center pb-6 sm:pb-0">
              {/* Left Action Buttons (Edit/Delete) */}
              {(userRole === 'superadmin' || userRole === 'admin') && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer text-center"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-lg cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer text-center"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleClearProfile}
                        disabled={isDeleting}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg cursor-pointer disabled:opacity-50 text-center"
                      >
                        {isDeleting ? 'Deleting...' : 'Clear Profile'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Right Action Button (Close) */}
              {!isEditing && (
                <button
                  onClick={() => setActiveProfileClient(null)}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-lg shadow-xs cursor-pointer text-center sm:ml-auto"
                >
                  Close Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Custom React Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Client Profile</h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to clear/delete the profile for <strong className="text-slate-800 font-semibold">{activeProfileClient?.name}</strong>? This will permanently delete all associated case records, tasks, payments, and documents from the database. This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletion}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom React Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Success</h3>
              <p className="text-xs text-slate-500">Client profile deleted successfully.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                setActiveProfileClient(null);
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


