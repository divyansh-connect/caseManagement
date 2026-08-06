import React from 'react';
import { useCase } from '../../context/CaseContext';
import { CheckSquare, Plus, Calendar, Bell } from 'lucide-react';

export const AdminTasks = () => {
  const { tasks } = useCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Task & Reminder Control</h1>
          <p className="text-xs text-slate-400">Track deadlines, assigned petition writing tasks, and automated client reminders</p>
        </div>
        <button className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Task
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-3">Task Name</th>
              <th className="px-5 py-3">Assigned To</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-slate-800/40">
                <td className="px-5 py-4 font-semibold text-white flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-cyan-400" /> {t.task}
                </td>
                <td className="px-5 py-4 text-slate-300">{t.assignedTo}</td>
                <td className="px-5 py-4 text-slate-400 font-mono">{t.dueDate}</td>
                <td className="px-5 py-4"><span className="text-amber-400 font-bold">{t.priority}</span></td>
                <td className="px-5 py-4"><span className="px-2 py-0.5 text-[10px] bg-blue-950 text-blue-300 rounded font-bold">{t.status}</span></td>
                <td className="px-5 py-4 text-right">
                  <button className="px-3 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 flex items-center gap-1 ml-auto">
                    <Bell className="h-3 w-3" /> Send Reminder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
