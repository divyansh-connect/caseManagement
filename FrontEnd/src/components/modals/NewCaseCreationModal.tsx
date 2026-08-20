import React, { useState } from 'react';
import { X, Briefcase, Search } from 'lucide-react';
import { Client } from '../../types';

interface NewCaseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onCreateCase: (formData: any) => Promise<void>;
}

export const NewCaseCreationModal: React.FC<NewCaseCreationModalProps> = ({
  isOpen,
  onClose,
  clients,
  onCreateCase
}) => {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [petitionCategory, setPetitionCategory] = useState('EB-2 NIW');
  const [assignedWriter, setAssignedWriter] = useState('Sarah Jenkins');
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');
  const [targetFilingDate, setTargetFilingDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Draft');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClientName = clients.find(c => c.id === clientId)?.name || 'Select a Client';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Case Title is required');
      return;
    }
    if (!clientId) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onCreateCase({
        clientId,
        title,
        petitionCategory,
        assignedWriter,
        priority,
        notes,
        targetFilingDate,
        status
      });
      // Clear form
      setTitle('');
      setClientId('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-bold text-white">Create New Case</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Case Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              placeholder="e.g. AI-Enabled Grid Security Petition"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Client <span className="text-rose-500">*</span></label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 flex justify-between items-center text-left focus:outline-none focus:border-blue-500"
            >
              <span>{selectedClientName}</span>
              <span className="text-slate-500 text-xs">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  {filteredClients.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-2">No clients found</div>
                  ) : (
                    filteredClients.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setClientId(c.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors block ${
                          clientId === c.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="font-semibold">{c.name}</div>
                        <div className="opacity-75">{c.email}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Case Type</label>
              <select
                value={petitionCategory}
                onChange={e => setPetitionCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="EB-2 NIW">EB-2 NIW (National Interest Waiver)</option>
                <option value="EB-1A">EB-1A (Extraordinary Ability)</option>
                <option value="O-1">O-1 (Individuals with Extraordinary Ability)</option>
                <option value="Resume Building">Resume Building</option>
                <option value="Profile Building">Profile Building</option>
                <option value="Mexico TR Visa">Mexico TR Visa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Lawyer/Writer</label>
              <select
                value={assignedWriter}
                onChange={e => setAssignedWriter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Sarah Jenkins">Sarah Jenkins (Lawyer)</option>
                <option value="Michael Chang">Michael Chang (Writer)</option>
                <option value="David Miller">David Miller (Senior Attorney)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Filing Date</label>
              <input
                type="date"
                required
                value={targetFilingDate}
                onChange={e => setTargetFilingDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Open">Open</option>
                <option value="Pending">Pending Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
            <textarea
              rows={3}
              placeholder="Enter case notes or description..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
