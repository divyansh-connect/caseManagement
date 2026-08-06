import React from 'react';
import { useCase } from '../../context/CaseContext';
import { Search, RotateCcw, Activity } from 'lucide-react';

export const AdminReports = () => {
  const { activity } = useCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Case Search</h1>
        <p className="text-xs text-slate-400">Search case archives and retrieve full activity audit logs</p>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Multi-Criteria Case Search</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="text" placeholder="Client Name" className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200" />
          <input type="text" placeholder="Case Number" className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200" />
          <select className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200">
            <option value="">All Stages (1-14)</option>
            <option value="11">Stage 11: Petition Draft</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-1">
            <Search className="h-3.5 w-3.5" /> Search Cases
          </button>
          <button className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold flex items-center gap-1">
            <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" /> Full Audit Activity Log
        </h3>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action Performed</th>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {activity.map((act, i) => (
              <tr key={i} className="hover:bg-slate-800/40">
                <td className="px-4 py-3 text-slate-400 font-mono">{act.date}</td>
                <td className="px-4 py-3 font-semibold text-cyan-300">{act.user}</td>
                <td className="px-4 py-3 text-white">{act.action}</td>
                <td className="px-4 py-3 text-slate-300">{act.document}</td>
                <td className="px-4 py-3 text-slate-400">{act.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
