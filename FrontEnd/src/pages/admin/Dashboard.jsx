import React from 'react';
import { useCase } from '../../context/CaseContext';
import { 
  Users, Briefcase, CheckCircle, Clock, FileText, 
  AlertCircle, TrendingUp, Calendar, ActivityPlus, ArrowUpRight 
} from 'lucide-react';

export const AdminDashboard = () => {
  const { clients, cases, documents, tasks, reviews, activity, setActiveModal } = useCase();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Case Management Dashboard</h1>
          <p className="text-xs text-slate-400">EB-2 NIW Petition Operations & Active Lifecycle Metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveModal('ADD_CLIENT')}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors"
          >
            + Add Client
          </button>
          <button
            onClick={() => setActiveModal('CREATE_CASE')}
            className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all"
          >
            + New Case
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid (Matching User Wireframe requirements) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 space-y-2 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Total Clients</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{clients.length}</p>
        </div>

        <div className="glass-panel p-4 space-y-2 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Total Cases</span>
            <Briefcase className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white">{cases.length}</p>
        </div>

        <div className="glass-panel p-4 space-y-2 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Active Cases</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{cases.filter(c => c.status === 'Active').length}</p>
        </div>

        <div className="glass-panel p-4 space-y-2 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Completed</span>
            <CheckCircle className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{cases.filter(c => c.status === 'Completed').length}</p>
        </div>

        <div className="glass-panel p-4 space-y-2 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Pending Reviews</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{reviews.length}</p>
        </div>

        <div className="glass-panel p-4 space-y-2 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Pending Docs</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white">4</p>
        </div>
      </div>

      {/* Main Dashboard Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Cases & Stage Progress */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Active Case Workflows</h3>
              <button className="text-xs text-cyan-400 hover:underline flex items-center gap-1">View All Cases <ArrowUpRight className="h-3 w-3"/></button>
            </div>

            <div className="space-y-3">
              {cases.map((c) => (
                <div key={c.caseNumber} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-cyan-400">{c.caseNumber}</span>
                      <span className="text-xs font-semibold text-white">• {c.clientName}</span>
                    </div>
                    <p className="text-xs text-slate-400">Assigned: {c.assignedStaff}</p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 rounded-full mb-1">
                      Stage {c.stage}: {c.stageName}
                    </span>
                    <p className="text-[10px] text-slate-500">Priority: <span className="text-amber-400">{c.priority}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Deadlines & Recent Activity */}
        <div className="space-y-6">
          {/* Upcoming Tasks */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" /> Upcoming Deadlines
              </h3>
            </div>
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-200">{t.task}</p>
                    <p className="text-[10px] text-slate-500">Due: {t.dueDate} • {t.assignedTo}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] bg-rose-950 text-rose-300 border border-rose-800 rounded">{t.priority}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ActivityPlus className="h-4 w-4 text-emerald-400" /> Recent System Activity
            </h3>
            <div className="space-y-3">
              {activity.map((act, i) => (
                <div key={i} className="text-xs space-y-1 border-l-2 border-slate-800 pl-3">
                  <div className="flex justify-between text-slate-400">
                    <span className="font-medium text-cyan-300">{act.user}</span>
                    <span className="text-[10px] text-slate-500">{act.date}</span>
                  </div>
                  <p className="text-slate-200 font-semibold">{act.action}: {act.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
