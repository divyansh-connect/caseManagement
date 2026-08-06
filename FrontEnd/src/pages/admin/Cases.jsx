import React, { useState } from 'react';
import { useCase } from '../../context/CaseContext';
import { WorkflowStepper } from '../../components/workflow/WorkflowStepper';
import { BriefcasePlus, Search, Filter, Eye, ChevronRight } from 'lucide-react';

export const AdminCases = () => {
  const { cases, updateStage, setActiveModal } = useCase();
  const [selectedCase, setSelectedCase] = useState(cases[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Case Management & Workflow</h1>
          <p className="text-xs text-slate-400">Manage EB-2 NIW petition lifecycles across all 14 stages</p>
        </div>
        <button
          onClick={() => setActiveModal('CREATE_CASE')}
          className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <BriefcasePlus className="h-4 w-4" /> New Case
        </button>
      </div>

      {/* Selected Case Active Workflow Stepper */}
      {selectedCase && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs font-bold text-cyan-400">ACTIVE WORKFLOW FOCUS:</span>
              <h2 className="text-lg font-bold text-white">{selectedCase.caseNumber} - {selectedCase.clientName}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => updateStage(selectedCase.caseNumber, Math.max(1, selectedCase.stage - 1))}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
              >
                Previous Stage
              </button>
              <button 
                onClick={() => updateStage(selectedCase.caseNumber, Math.min(14, selectedCase.stage + 1))}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center gap-1"
              >
                Next Stage <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <WorkflowStepper
            currentStage={selectedCase.stage}
            onStageSelect={(stageId) => updateStage(selectedCase.caseNumber, stageId)}
          />
        </div>
      )}

      {/* Case Directory Table */}
      <div className="glass-panel overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h3 className="text-base font-bold text-white">Case Directory</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Cases..."
                className="bg-slate-900 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <button className="px-3 py-2 text-xs bg-slate-800 text-slate-300 rounded-xl border border-slate-700 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5 text-cyan-400" /> Filter
            </button>
          </div>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Case Number</th>
              <th className="px-4 py-3">Client Name</th>
              <th className="px-4 py-3">Case Type</th>
              <th className="px-4 py-3">Current Stage</th>
              <th className="px-4 py-3">Assigned Staff</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {cases.map(c => (
              <tr 
                key={c.caseNumber} 
                onClick={() => setSelectedCase(c)}
                className={`cursor-pointer transition-colors ${selectedCase?.caseNumber === c.caseNumber ? 'bg-blue-950/40' : 'hover:bg-slate-800/40'}`}
              >
                <td className="px-4 py-3 font-mono font-bold text-cyan-400">{c.caseNumber}</td>
                <td className="px-4 py-3 font-semibold text-white">{c.clientName}</td>
                <td className="px-4 py-3 text-slate-300">{c.caseType}</td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800 rounded-full">
                    Stage {c.stage}: {c.stageName}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{c.assignedStaff}</td>
                <td className="px-4 py-3"><span className="text-amber-400 font-medium">{c.priority}</span></td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 rounded font-bold">{c.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"><Eye className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
