import React, { useState } from 'react';
import { useCase } from '../../context/CaseContext';
import { X, BriefcasePlus } from 'lucide-react';

export const CreateCaseModal = ({ isOpen, onClose }) => {
  const { clients, createCase } = useCase();
  const [formData, setFormData] = useState({
    clientName: clients[0]?.firstName + ' ' + clients[0]?.lastName || '',
    caseType: 'EB-2 NIW',
    assignedStaff: 'Sarah Jenkins',
    priority: 'High',
    startDate: new Date().toISOString().split('T')[0]
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    createCase(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 space-y-5 border border-slate-700/80 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <BriefcasePlus className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Create New EB-2 NIW Case</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Client</label>
            <select
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {clients.map(c => (
                <option key={c.id} value={`${c.firstName} ${c.lastName}`}>{c.firstName} {c.lastName} ({c.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Case Type</label>
            <input
              type="text"
              readOnly
              value="EB-2 NIW (National Interest Waiver)"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-cyan-400 font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Staff</label>
            <select
              value={formData.assignedStaff}
              onChange={e => setFormData({ ...formData, assignedStaff: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Sarah Jenkins">Sarah Jenkins (Petition Writer)</option>
              <option value="Michael Chang">Michael Chang (Case Manager)</option>
              <option value="David Miller">David Miller (Reviewer)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-blue-500/20">Create Case</button>
          </div>
        </form>
      </div>
    </div>
  );
};
