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
  UserCheck
} from 'lucide-react';
import { Client, UserRole } from '../../types';
import { StatusBadge } from '../common/Badge';
import { api } from '../../services/api';

interface ClientsViewProps {
  clients: Client[];
  openNewCaseModal: () => void;
  userRole?: UserRole;
  onUpdateClient?: (updatedClient: Client) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ 
  clients, 
  openNewCaseModal, 
  userRole = 'admin',
  onUpdateClient,
  onDeleteClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('all');
  const [activeProfileClient, setActiveProfileClient] = useState<Client | null>(null);

  // Inline edit state variables
  const [isEditing, setIsEditing] = useState(false);
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
      setEditCitations(activeProfileClient.citationsCount || 0);
      setEditPublications(activeProfileClient.publicationsCount || 0);
      setEditPatents(activeProfileClient.patentsCount || 0);
      setEditStatus(activeProfileClient.status || 'Active');
      setIsEditing(false);
    }
  }, [activeProfileClient]);

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

  const handleClearProfile = async () => {
    if (!activeProfileClient) return;
    if (!window.confirm(`Are you sure you want to clear/delete the profile for ${activeProfileClient.name}? This will permanently delete all associated case records, tasks, payments, and documents from the database.`)) {
      return;
    }

    try {
      const res = await api.delete(`/clients/${activeProfileClient.id}`);
      if (res.success) {
        alert('Client profile cleared successfully.');
        if (onDeleteClient) {
          onDeleteClient(activeProfileClient.id);
        }
        setActiveProfileClient(null);
      } else {
        alert('Failed to delete profile: ' + (res.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
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
            onClick={openNewCaseModal}
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
                  <span className="font-extrabold text-slate-800 text-xs">{client.citationsCount || 0}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Papers</span>
                  <span className="font-extrabold text-slate-800 text-xs">{client.publicationsCount || 0}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Patents</span>
                  <span className="font-extrabold text-slate-800 text-xs">{client.patentsCount || 0}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3 w-full">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md shrink-0">
                  {(editName || activeProfileClient.name).split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                {isEditing ? (
                  <div className="space-y-1.5 w-full pr-4">
                    <input 
                      type="text" 
                      value={editName} 
                      onChange={(e) => setEditName(e.target.value)} 
                      placeholder="Candidate Full Name"
                      className="w-full p-1 bg-slate-50 border border-slate-200 rounded text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        value={editEmail} 
                        onChange={(e) => setEditEmail(e.target.value)} 
                        placeholder="Email Address"
                        className="w-1/2 p-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                      <input 
                        type="text" 
                        value={editPhone} 
                        onChange={(e) => setEditPhone(e.target.value)} 
                        placeholder="Phone Number"
                        className="w-1/2 p-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{activeProfileClient.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
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

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
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

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Highest Academic Qualification</span>
                {isEditing ? (
                  <div className="flex gap-2">
                    <select 
                      value={editDegree} 
                      onChange={(e) => setEditDegree(e.target.value)} 
                      className="w-1/2 p-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      className="w-1/2 p-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                  </div>
                ) : (
                  <p className="font-semibold text-slate-800">{activeProfileClient.highestDegree} ({activeProfileClient.university})</p>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Scholarly Impact</span>
                {isEditing ? (
                  <div className="flex gap-1.5 items-center">
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
                    {activeProfileClient.citationsCount || 0} Citations • {activeProfileClient.publicationsCount || 0} Papers • {activeProfileClient.patentsCount || 0} Patents
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 col-span-1 sm:col-span-2">
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
            </div>

            {/* Team & Workflow Summary */}
            {!isEditing && (
              <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-100 text-xs space-y-2">
                <h4 className="font-bold text-slate-800">Immigration Petition Team Assignment</h4>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Assigned Petition Drafter:</span>
                    <span className="font-semibold text-slate-800">Petition Drafter 1</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Senior Reviewer:</span>
                    <span className="font-semibold text-slate-800">Senior Reviewer</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
              {/* Left Action Buttons (Edit/Delete) */}
              {(userRole === 'superadmin' || userRole === 'admin') && (
                <div className="flex gap-2 justify-start">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleClearProfile}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Clear Profile
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Right Action Button (Close) */}
              {!isEditing && (
                <button
                  onClick={() => setActiveProfileClient(null)}
                  className="px-5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-lg shadow-xs cursor-pointer sm:ml-auto"
                >
                  Close Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


