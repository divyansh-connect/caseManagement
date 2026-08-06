import React from 'react';
import { useCase } from '../../context/CaseContext';
import { UserPlus, Search, Filter, Eye, Edit } from 'lucide-react';

export const AdminClients = () => {
  const { clients, setActiveModal } = useCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Management</h1>
          <p className="text-xs text-slate-400">View, register, and track client profiles & petition stage progress</p>
        </div>
        <button
          onClick={() => setActiveModal('ADD_CLIENT')}
          className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" /> Add Client
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Client Name, Email, or Client ID..."
            className="w-full bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-2">
          <Filter className="h-4 w-4 text-cyan-400" /> Filter Clients
        </button>
      </div>

      {/* Client Table */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-3">Client ID</th>
              <th className="px-5 py-3">Client Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Current Stage</th>
              <th className="px-5 py-3">Assigned Staff</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {clients.map(c => (
              <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-4 font-mono font-bold text-cyan-400">{c.id}</td>
                <td className="px-5 py-4 font-semibold text-white">{c.firstName} {c.lastName}</td>
                <td className="px-5 py-4 text-slate-300">{c.email}</td>
                <td className="px-5 py-4 text-slate-400">{c.phone}</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 rounded-full">
                    Stage {c.stage}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-300">{c.assignedStaff}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    c.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right space-x-2">
                  <button className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"><Eye className="h-4 w-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800"><Edit className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
