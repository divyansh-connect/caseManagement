import React from 'react';
import { useCase } from '../../context/CaseContext';
import { STAGES } from '../../data/stageConfig';
import { CheckCircle2, Clock, UploadCloud, FileText, CreditCard, MessageSquare } from 'lucide-react';

export const ClientDashboard = () => {
  const { cases, documents, tasks } = useCase();
  const clientCase = cases[0] || { stage: 11, stageName: "Petition Draft (3 Prongs)" };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/20">
        <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, Dr. Vance</h1>
        <p className="text-xs text-cyan-300 mt-1">EB-2 NIW Case #NIW-2026-001 • Current Stage: Stage {clientCase.stage} ({clientCase.stageName})</p>
      </div>

      {/* Progress Bar & Stage Tracker */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Your Petition Progress</h3>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
            {Math.round((clientCase.stage / 14) * 100)}% Complete
          </span>
        </div>

        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500"
            style={{ width: `${(clientCase.stage / 14) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {STAGES.map((s) => {
            const isDone = s.id < clientCase.stage;
            const isCurrent = s.id === clientCase.stage;
            return (
              <div 
                key={s.id}
                className={`p-2 rounded-xl border text-left ${
                  isCurrent ? 'bg-blue-600/30 border-blue-400 text-white' : isDone ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300' : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-bold">#{s.id}</span>
                  {isDone ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Clock className="h-3 w-3 text-slate-500" />}
                </div>
                <p className="text-[11px] font-medium truncate">{s.short}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Quick Actions & Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload & Shared Documents */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-cyan-400" /> Document Checklist
          </h3>
          <div className="space-y-2">
            {documents.slice(0, 3).map(d => (
              <div key={d.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <p className="font-semibold text-slate-200">{d.name}</p>
                  <p className="text-[10px] text-slate-500">{d.category}</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">{d.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
            Upload Requested Document
          </button>
        </div>

        {/* Pending Client Tasks */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-400" /> Pending Action Items
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="font-semibold text-white">Review Matter of Dhanasar Prong 1 Draft</p>
              <p className="text-[10px] text-slate-400">Target Completion: Aug 05, 2026</p>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="font-semibold text-white">Sign Retainer Addendum</p>
              <p className="text-[10px] text-slate-400">Target Completion: Aug 08, 2026</p>
            </div>
          </div>
        </div>

        {/* Payments & Support */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-400" /> Payment & Communication
          </h3>
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Milestone 2 Payment:</span>
              <span className="text-emerald-400 font-bold">Paid ($3,500)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Filing Fee Stage 13:</span>
              <span className="text-amber-400 font-bold">Pending ($700)</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
              Make Payment
            </button>
            <button className="flex-1 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" /> Message Attorney
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
