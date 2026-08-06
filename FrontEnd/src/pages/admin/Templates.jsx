import React from 'react';
import { Layers, Plus, FileCode, CheckSquare } from 'lucide-react';

export const AdminTemplates = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Case Templates & Presets</h1>
          <p className="text-xs text-slate-400">Configure reusable 14-stage workflows, document checklists, and standard tasks</p>
        </div>
        <button className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl shadow-lg flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 space-y-3 border-t-4 border-t-blue-500">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-white text-sm">Standard EB-2 NIW Master</h3>
            <span className="px-2 py-0.5 text-[10px] bg-blue-950 text-blue-300 rounded font-bold">14 Stages</span>
          </div>
          <p className="text-xs text-slate-400">Default 14-stage petition template with Dhanasar 3-prong checklists and recommendation letter tasks.</p>
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <button className="flex-1 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">Edit Template</button>
            <button className="flex-1 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg">Apply to Case</button>
          </div>
        </div>

        <div className="glass-panel p-5 space-y-3 border-t-4 border-t-cyan-500">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-white text-sm">Academic / STEM Researcher NIW</h3>
            <span className="px-2 py-0.5 text-[10px] bg-cyan-950 text-cyan-300 rounded font-bold">14 Stages</span>
          </div>
          <p className="text-xs text-slate-400">Tailored for PhD holders and academic researchers focusing on Google Scholar citation evidence & grant documentation.</p>
          <div className="pt-3 border-t border-slate-800 flex gap-2">
            <button className="flex-1 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">Edit Template</button>
            <button className="flex-1 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg">Apply to Case</button>
          </div>
        </div>
      </div>
    </div>
  );
};
