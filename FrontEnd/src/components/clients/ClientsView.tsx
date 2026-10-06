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
  Pencil,
  Save,
  Loader2
} from 'lucide-react';
import { Client, UserRole } from '../../types';
import { StatusBadge } from '../common/Badge';
import { api } from '../../services/api';

interface ClientsViewProps {
  clients: Client[];
  openNewCaseModal: () => void;
  userRole?: UserRole;
  onClientUpdated?: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({ clients, openNewCaseModal, userRole = 'admin', onClientUpdated }) => {
  const [localClients, setLocalClients] = useState<Client[]>(clients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('all');
  const [activeProfileClient, setActiveProfileClient] = useState<Client | null>(null);
  
  React.useEffect(() => {
    setLocalClients(clients);
  }, [clients]);

  // Edit Client State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editForm, setEditForm] = useState({
    citationsCount: 0,
    publicationsCount: 0,
    patentsCount: 0,
    currentField: '',
    highestDegree: "Ph.D." as Client['highestDegree'],
    university: '',
    countryOfBirth: '',
    status: 'Active' as Client['status']
  });

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setEditForm({
      citationsCount: client.citationsCount ?? (client as any).citationCount ?? 0,
      publicationsCount: client.publicationsCount ?? (client as any).paperCount ?? 0,
      patentsCount: client.patentsCount ?? (client as any).patentCount ?? 0,
      currentField: client.currentField || '',
      highestDegree: (client.highestDegree || "Ph.D.") as Client['highestDegree'],
      university: client.university || '',
      countryOfBirth: client.countryOfBirth || '',
      status: client.status || 'Active'
    });
    setEditSuccessMsg('');
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setIsSaving(true);
    setEditSuccessMsg('');
    try {
      const payload = {
        citationsCount: Number(editForm.citationsCount),
        publicationsCount: Number(editForm.publicationsCount),
        patentsCount: Number(editForm.patentsCount),
        currentField: editForm.currentField,
        highestDegree: editForm.highestDegree,
        university: editForm.university,
        countryOfBirth: editForm.countryOfBirth,
        status: editForm.status
      };

      const res = await api.put(`/clients/${editingClient.id}`, payload);

      if (res.success) {
        setEditSuccessMsg('Client profile & metrics updated successfully!');
        
        // Optimistically update local state immediately
        const updatedRecord: Client = {
          ...editingClient,
          ...payload,
          ...(res.data || {})
        };
        
        setLocalClients(prev => prev.map(c => c.id === editingClient.id ? updatedRecord : c));
        
        if (onClientUpdated) {
          onClientUpdated();
        }
        
        setTimeout(() => {
          setEditingClient(null);
          if (activeProfileClient && activeProfileClient.id === editingClient.id) {
            setActiveProfileClient(updatedRecord);
          }
        }, 800);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update client profile');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClients = localClients.filter(c => {
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
                    <p className="text-[11px] text-slate-500 font-medium truncate">{client.countryOfBirth} • Joined {client.createdAt}</p>
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
                  <span className="font-extrabold text-slate-800 text-xs">{client.citationsCount ?? (client as any).citationCount ?? 0}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Papers</span>
                  <span className="font-extrabold text-slate-800 text-xs">{client.publicationsCount ?? (client as any).paperCount ?? 0}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Patents</span>
                  <span className="font-extrabold text-slate-800 text-xs">{client.patentsCount ?? (client as any).patentCount ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1 text-slate-600 min-w-0">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-semibold">{client.highestDegree}</span>
                <span className="text-[10px] text-slate-400 truncate">({client.university})</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button 
                  onClick={() => openEditModal(client)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[11px]"
                  title="Edit client metrics (citations, papers, patents)"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => setActiveProfileClient(client)}
                  className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer text-[11px]"
                >
                  <span>View Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
          <p className="text-slate-500 text-xs">No client profiles found matching your search.</p>
        </div>
      )}

      {/* EDIT CLIENT METRICS MODAL */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-blue-600" />
                  <span>Edit Client Scholarly Metrics &amp; Profile</span>
                </h3>
                <p className="text-xs text-slate-500">Update citations, publications, patents &amp; academic details for {editingClient.name}</p>
              </div>
              <button 
                onClick={() => setEditingClient(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              {/* Scholarly Metrics */}
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-3">
                <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">
                  📈 Scholarly &amp; Impact Metrics (Citations, Papers, Patents)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Citations Count</label>
                    <input 
                      type="number"
                      min="0"
                      value={editForm.citationsCount}
                      onChange={(e) => setEditForm(prev => ({ ...prev, citationsCount: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Papers Published</label>
                    <input 
                      type="number"
                      min="0"
                      value={editForm.publicationsCount}
                      onChange={(e) => setEditForm(prev => ({ ...prev, publicationsCount: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Patents Issued</label>
                    <input 
                      type="number"
                      min="0"
                      value={editForm.patentsCount}
                      onChange={(e) => setEditForm(prev => ({ ...prev, patentsCount: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Academic & Field Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Field of Proposed Endeavor *</label>
                  <input 
                    type="text"
                    required
                    value={editForm.currentField}
                    onChange={(e) => setEditForm(prev => ({ ...prev, currentField: e.target.value }))}
                    placeholder="e.g. Quantum Computing, AI in Medicine"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Highest Academic Qualification</label>
                    <select
                      value={editForm.highestDegree}
                      onChange={(e) => setEditForm(prev => ({ ...prev, highestDegree: e.target.value as any }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Ph.D.">Ph.D.</option>
                      <option value="Master's">Master's</option>
                      <option value="Bachelor's + 5 yrs">Bachelor's + 5 yrs Experience</option>
                      <option value="Exceptional Ability">Exceptional Ability</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Granting University / Institution</label>
                    <input 
                      type="text"
                      value={editForm.university}
                      onChange={(e) => setEditForm(prev => ({ ...prev, university: e.target.value }))}
                      placeholder="e.g. Stanford University, MIT"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Country of Birth</label>
                    <input 
                      type="text"
                      value={editForm.countryOfBirth}
                      onChange={(e) => setEditForm(prev => ({ ...prev, countryOfBirth: e.target.value }))}
                      placeholder="e.g. United States, Germany, India"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Account Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="Active">Active</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Approved">Approved</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Profile Summary Modal */}
      {activeProfileClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                  {activeProfileClient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeProfileClient.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {activeProfileClient.email} • {activeProfileClient.phone}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveProfileClient(null)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Country of Birth</span>
                <p className="font-semibold text-slate-800">{activeProfileClient.countryOfBirth}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Field of Endeavor</span>
                <p className="font-semibold text-blue-700">{activeProfileClient.currentField}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Highest Academic Qualification</span>
                <p className="font-semibold text-slate-800">{activeProfileClient.highestDegree} ({activeProfileClient.university})</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Scholarly Impact</span>
                <p className="font-semibold text-slate-800">
                  {activeProfileClient.citationsCount || 0} Citations • {activeProfileClient.publicationsCount || 0} Papers • {activeProfileClient.patentsCount || 0} Patents
                </p>
              </div>
            </div>

            {/* Team & Workflow Summary */}
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

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  const toEdit = activeProfileClient;
                  setActiveProfileClient(null);
                  openEditModal(toEdit);
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit Metrics</span>
              </button>
              <button
                onClick={() => setActiveProfileClient(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

