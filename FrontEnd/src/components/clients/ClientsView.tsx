import React, { useState, useEffect } from 'react';
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
  Loader2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  UserPlus,
  UserX,
  Power,
  KeyRound,
  Eye,
  EyeOff
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

export const ClientsView: React.FC<ClientsViewProps> = ({ 
  clients: initialClients, 
  openNewCaseModal, 
  userRole = 'admin', 
  onClientUpdated 
}) => {
  const [localClients, setLocalClients] = useState<Client[]>(initialClients || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDegree, setSelectedDegree] = useState('all');
  const [activeProfileClient, setActiveProfileClient] = useState<Client | null>(null);

  // Sync with initialClients prop or fetch directly from backend
  const fetchClientsFromDb = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const res = await api.get('/clients');
      if (res.success && Array.isArray(res.data)) {
        setLocalClients(res.data);
      } else {
        setLocalClients([]);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load client directory from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialClients && initialClients.length > 0) {
      setLocalClients(initialClients);
    } else {
      fetchClientsFromDb();
    }
  }, [initialClients]);

  // Add Client State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addErrorMsg, setAddErrorMsg] = useState('');
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    countryOfBirth: '',
    currentField: '',
    highestDegree: "Ph.D." as Client['highestDegree'],
    university: '',
    citationsCount: 0,
    publicationsCount: 0,
    patentsCount: 0,
    password: 'password123'
  });

  const resetAddForm = () => {
    setAddForm({
      name: '',
      email: '',
      phone: '',
      countryOfBirth: '',
      currentField: '',
      highestDegree: "Ph.D.",
      university: '',
      citationsCount: 0,
      publicationsCount: 0,
      patentsCount: 0,
      password: 'password123'
    });
    setAddErrorMsg('');
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.currentField) {
      setAddErrorMsg('Name, Email, and Field of Endeavor are required.');
      return;
    }

    if (addForm.phone && addForm.phone.trim().length > 0) {
      const digits = addForm.phone.replace(/\D/g, '');
      if (digits.length !== 10) {
        setAddErrorMsg('Phone number must contain exactly 10 numeric digits.');
        return;
      }
    }

    setIsCreating(true);
    setAddErrorMsg('');
    try {
      const payload = {
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
        phone: addForm.phone.trim() ? addForm.phone.replace(/\D/g, '').slice(0, 10) : '+1 (555) 012-3456',
        countryOfBirth: addForm.countryOfBirth.trim() || 'United States',
        currentField: addForm.currentField.trim(),
        highestDegree: addForm.highestDegree,
        university: addForm.university.trim() || 'Not Specified',
        citationsCount: Number(addForm.citationsCount) || 0,
        publicationsCount: Number(addForm.publicationsCount) || 0,
        patentsCount: Number(addForm.patentsCount) || 0,
        password: addForm.password || 'password123'
      };

      const res = await api.post('/clients', payload);
      if (res.success && res.data) {
        setIsAddModalOpen(false);
        resetAddForm();
        await fetchClientsFromDb();
        if (onClientUpdated) {
          await onClientUpdated();
        }
      } else {
        setAddErrorMsg(res.error || 'Failed to create client record.');
      }
    } catch (err: any) {
      setAddErrorMsg(err.message || 'Error communicating with database.');
    } finally {
      setIsCreating(false);
    }
  };

  // Edit Client State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    citationsCount: 0,
    publicationsCount: 0,
    patentsCount: 0,
    currentField: '',
    highestDegree: "Ph.D." as Client['highestDegree'],
    university: '',
    countryOfBirth: '',
    status: 'Active' as Client['status'],
    password: ''
  });

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setShowEditPassword(false);
    setEditForm({
      citationsCount: client.citationsCount ?? (client as any).citationCount ?? 0,
      publicationsCount: client.publicationsCount ?? (client as any).paperCount ?? 0,
      patentsCount: client.patentsCount ?? (client as any).patentCount ?? 0,
      currentField: client.currentField || '',
      highestDegree: (client.highestDegree || "Ph.D.") as Client['highestDegree'],
      university: client.university || '',
      countryOfBirth: client.countryOfBirth || '',
      status: client.status || 'Active',
      password: ''
    });
    setEditSuccessMsg('');
    setEditErrorMsg('');
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    if (editForm.password && editForm.password.trim().length > 0) {
      if (editForm.password.trim().length < 6) {
        setEditErrorMsg('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsSaving(true);
    setEditSuccessMsg('');
    setEditErrorMsg('');
    try {
      const payload: any = {
        citationsCount: Number(editForm.citationsCount),
        publicationsCount: Number(editForm.publicationsCount),
        patentsCount: Number(editForm.patentsCount),
        currentField: editForm.currentField,
        highestDegree: editForm.highestDegree,
        university: editForm.university,
        countryOfBirth: editForm.countryOfBirth,
        status: editForm.status
      };

      if (editForm.password && editForm.password.trim().length >= 6) {
        payload.password = editForm.password.trim();
      }

      const res = await api.put(`/clients/${editingClient.id}`, payload);

      if (res.success) {
        if (payload.password) {
          setEditSuccessMsg(`Client profile & new password '${payload.password}' updated successfully! Client can now log in with this password.`);
        } else {
          setEditSuccessMsg('Client profile & metrics updated successfully in database!');
        }
        
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
        }, 1200);
      } else {
        setEditErrorMsg(res.error || 'Failed to update client.');
      }
    } catch (err: any) {
      setEditErrorMsg(err.message || 'Failed to update client profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Client State
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await api.delete(`/clients/${clientToDelete.id}`);
      if (res.success || res.status === 200 || !res.error) {
        setLocalClients(prev => prev.filter(c => c.id !== clientToDelete.id));
        if (activeProfileClient && activeProfileClient.id === clientToDelete.id) {
          setActiveProfileClient(null);
        }
        if (editingClient && editingClient.id === clientToDelete.id) {
          setEditingClient(null);
        }
        setClientToDelete(null);
        if (onClientUpdated) {
          onClientUpdated();
        }
      } else {
        setDeleteError(res.error || 'Failed to delete client from database.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete client from database.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle Client Active / Inactive Status
  const [togglingClientId, setTogglingClientId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const handleToggleClientStatus = async (client: Client) => {
    const isCurrentlyActive = (client.status || 'Active') === 'Active';
    const nextStatus: Client['status'] = isCurrentlyActive ? 'Inactive' : 'Active';
    setTogglingClientId(client.id);
    try {
      const res = await api.put(`/clients/${client.id}`, { status: nextStatus });
      if (res.success) {
        setLocalClients(prev => prev.map(c => c.id === client.id ? { ...c, status: nextStatus } : c));
        if (activeProfileClient && activeProfileClient.id === client.id) {
          setActiveProfileClient(prev => prev ? { ...prev, status: nextStatus } : null);
        }
        setToastMsg(
          nextStatus === 'Active'
            ? `Client ${client.name} has been activated. Portal login is now enabled.`
            : `Client ${client.name} has been deactivated. Portal login is now blocked.`
        );
        setTimeout(() => setToastMsg(''), 4500);
        if (onClientUpdated) {
          onClientUpdated();
        }
      } else {
        alert(res.error || 'Failed to update client status in database.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating client status in database.');
    } finally {
      setTogglingClientId(null);
    }
  };

  const filteredClients = localClients.filter(c => {
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.currentField || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.university || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDegree = selectedDegree === 'all' || (c.highestDegree || '').includes(selectedDegree);

    return matchesSearch && matchesDegree;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Client Profiles Directory</h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {localClients.length} {localClients.length === 1 ? 'Client' : 'Clients'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Live database profiles, academic degree verifications, publication records, and citation metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchClientsFromDb}
            disabled={isLoading}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh clients from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {(userRole === 'admin' || userRole === 'superadmin') && (
            <button
              onClick={() => {
                resetAddForm();
                setIsAddModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="p-3.5 bg-slate-900 text-white rounded-xl shadow-md flex items-center justify-between text-xs font-bold animate-fadeIn border border-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fetch Error Banner */}
      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button 
            onClick={fetchClientsFromDb}
            className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

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

      {/* Loading State */}
      {isLoading && localClients.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading client directory from database...</p>
        </div>
      )}

      {/* Clients Cards Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center border border-blue-200 shrink-0">
                      {(client.name || 'Client').split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{client.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {client.countryOfBirth || 'International'} • {client.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => (userRole === 'admin' || userRole === 'superadmin') && handleToggleClientStatus(client)}
                      disabled={togglingClientId === client.id}
                      className={`cursor-pointer transition-all ${userRole === 'admin' || userRole === 'superadmin' ? 'hover:opacity-80 active:scale-95' : ''}`}
                      title={userRole === 'admin' || userRole === 'superadmin' ? `Click to ${(client.status || 'Active') === 'Active' ? 'Deactivate' : 'Activate'}` : ''}
                    >
                      <StatusBadge status={client.status || 'Active'} />
                    </button>
                    {togglingClientId === client.id && <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Field of Proposed Endeavor</span>
                  <p className="text-xs font-semibold text-blue-700 leading-snug">{client.currentField || 'Not Specified'}</p>
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
                  <span className="font-semibold">{client.highestDegree || "Master's"}</span>
                  <span className="text-[10px] text-slate-400 truncate">({client.university || 'University'})</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
                  {(userRole === 'admin' || userRole === 'superadmin') && (
                    <button 
                      onClick={() => handleToggleClientStatus(client)}
                      disabled={togglingClientId === client.id}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[11px] ${
                        (client.status || 'Active') === 'Active'
                          ? 'text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                          : 'text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                      title={(client.status || 'Active') === 'Active' ? 'Deactivate client portal access' : 'Activate client portal access'}
                    >
                      {(client.status || 'Active') === 'Active' ? (
                        <>
                          <UserX className="w-3.5 h-3.5 text-amber-600" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => openEditModal(client)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[11px] border border-slate-200"
                    title="Edit client metrics"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {(userRole === 'admin' || userRole === 'superadmin') && (
                    <button 
                      onClick={() => setClientToDelete(client)}
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold text-[11px] border border-rose-200"
                      title="Delete client profile permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setActiveProfileClient(client)}
                    className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer text-[11px] ml-0.5"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredClients.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {localClients.length === 0 ? 'No Clients in Database' : 'No Matching Clients Found'}
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              {localClients.length === 0 
                ? 'Your client database is currently empty. Click "Add New Client" above to register a real client profile.'
                : 'Try adjusting your search terms or degree filters to find what you are looking for.'}
            </p>
          </div>
          {localClients.length === 0 && (userRole === 'admin' || userRole === 'superadmin') && (
            <div className="pt-2">
              <button
                onClick={() => {
                  resetAddForm();
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Client</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ADD NEW CLIENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Add New Client Profile</h3>
                  <p className="text-xs text-slate-500">Save client permanently into the database</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{addErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Name *</label>
                  <input 
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Dr. Priya Sharma"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                  <input 
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. priya.sharma@example.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold">Phone Number</label>
                    <span className="text-[10px] text-slate-400 font-medium">10 Digits Only</span>
                  </div>
                  <input 
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={addForm.phone}
                    onChange={(e) => {
                      const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAddForm(prev => ({ ...prev, phone: numericOnly }));
                    }}
                    placeholder="e.g. 5550123456"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  {addForm.phone && addForm.phone.length > 0 && addForm.phone.length < 10 && (
                    <p className="text-[10px] text-amber-600 mt-1 font-medium">Must be 10 digits ({addForm.phone.length}/10)</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Country of Birth</label>
                  <input 
                    type="text"
                    value={addForm.countryOfBirth}
                    onChange={(e) => setAddForm(prev => ({ ...prev, countryOfBirth: e.target.value }))}
                    placeholder="e.g. India, Germany, USA"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Field of Proposed Endeavor *</label>
                <input 
                  type="text"
                  required
                  value={addForm.currentField}
                  onChange={(e) => setAddForm(prev => ({ ...prev, currentField: e.target.value }))}
                  placeholder="e.g. Renewable Energy, Quantum Computing, Oncology"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Highest Degree</label>
                  <select
                    value={addForm.highestDegree}
                    onChange={(e) => setAddForm(prev => ({ ...prev, highestDegree: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Ph.D.">Ph.D.</option>
                    <option value="Master's">Master's</option>
                    <option value="Bachelor's + 5 yrs">Bachelor's + 5 yrs Experience</option>
                    <option value="Exceptional Ability">Exceptional Ability</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Granting University</label>
                  <input 
                    type="text"
                    value={addForm.university}
                    onChange={(e) => setAddForm(prev => ({ ...prev, university: e.target.value }))}
                    placeholder="e.g. Stanford University, IIT Delhi"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                  📈 Scholarly Metrics (Optional)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Citations</label>
                    <input 
                      type="number"
                      min="0"
                      value={addForm.citationsCount}
                      onChange={(e) => setAddForm(prev => ({ ...prev, citationsCount: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Papers</label>
                    <input 
                      type="number"
                      min="0"
                      value={addForm.publicationsCount}
                      onChange={(e) => setAddForm(prev => ({ ...prev, publicationsCount: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Patents</label>
                    <input 
                      type="number"
                      min="0"
                      value={addForm.patentsCount}
                      onChange={(e) => setAddForm(prev => ({ ...prev, patentsCount: parseInt(e.target.value) || 0 }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Initial Portal Password</label>
                <input 
                  type="text"
                  value={addForm.password}
                  onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="password123"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Client</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
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
                  <span>Edit Client Profile &amp; Metrics</span>
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
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            {editErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-3">
                <span className="font-bold text-blue-900 block text-[11px] uppercase tracking-wider">
                  📈 Scholarly Metrics (Citations, Papers, Patents)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Citations</label>
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
                    <label className="block text-slate-700 font-bold mb-1">Highest Qualification</label>
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
                    <label className="block text-slate-700 font-bold mb-1">Granting University</label>
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

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Reset Password</label>
                  <input 
                    type="text"
                    value={editForm.password}
                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter new password (optional)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 font-medium"
                  />
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
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                  {(activeProfileClient.name || 'C').split(' ').map(n => n[0]).join('').substring(0, 2)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Country of Birth</span>
                <p className="font-semibold text-slate-800">{activeProfileClient.countryOfBirth || 'Not Specified'}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Field of Endeavor</span>
                <p className="font-semibold text-blue-700">{activeProfileClient.currentField || 'Not Specified'}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Highest Academic Qualification</span>
                <p className="font-semibold text-slate-800">{activeProfileClient.highestDegree} ({activeProfileClient.university || 'N/A'})</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Scholarly Impact</span>
                <p className="font-semibold text-slate-800">
                  {activeProfileClient.citationsCount || 0} Citations • {activeProfileClient.publicationsCount || 0} Papers • {activeProfileClient.patentsCount || 0} Patents
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              {(userRole === 'admin' || userRole === 'superadmin') ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const toDelete = activeProfileClient;
                      setActiveProfileClient(null);
                      setClientToDelete(toDelete);
                    }}
                    className="px-3.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Client</span>
                  </button>

                  <button
                    onClick={() => handleToggleClientStatus(activeProfileClient)}
                    disabled={togglingClientId === activeProfileClient.id}
                    className={`px-3.5 py-2 border font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors ${
                      (activeProfileClient.status || 'Active') === 'Active'
                        ? 'border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                        : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {(activeProfileClient.status || 'Active') === 'Active' ? (
                      <>
                        <UserX className="w-3.5 h-3.5 text-amber-600" />
                        <span>Deactivate Account</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Activate Account</span>
                      </>
                    )}
                  </button>
                </div>
              ) : <div />}

              <div className="flex items-center gap-2">
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
        </div>
      )}

      {/* DELETE CLIENT CONFIRMATION MODAL */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Client Profile</h3>
                <p className="text-xs text-slate-500">Database Record Permanent Removal</p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              Are you sure you want to permanently delete <strong className="text-slate-900 font-bold">{clientToDelete.name}</strong> ({clientToDelete.email})? This will permanently remove the client and all associated cases, tasks, documents, and credentials from the database.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setClientToDelete(null);
                  setDeleteError('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteClient}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting from DB...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
