import React from 'react';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Copy, 
  Check, 
  Cpu, 
  Zap, 
  Activity, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { CaseTemplate } from '../../types';

interface TemplatesViewProps {
  templates: CaseTemplate[];
  openAIAssistant: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ templates, openAIAssistant }) => {
  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">EB-2 NIW Industry Case Templates</h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Pre-structured Dhanasar argument frameworks and exhibit checklists tailored by technical domain.
          </p>
        </div>

        <button
          onClick={openAIAssistant}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Generate Custom Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {templates.map(tpl => (
          <div key={tpl.id} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-blue-300 transition-all">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {tpl.industry}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{tpl.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tpl.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Sample Endeavor Statement</span>
                <p className="text-xs text-slate-700 font-mono bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed break-words">
                  "{tpl.sampleEndeavor}"
                </p>
              </div>

              <div className="mt-3 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Recommended Exhibits</span>
                <ul className="text-xs text-slate-700 space-y-1">
                  {tpl.recommendedExhibits.map((ex, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="leading-tight break-words">{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={openAIAssistant}
                className="w-full py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Apply Template to Case</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
