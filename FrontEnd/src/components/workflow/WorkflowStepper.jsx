import React from 'react';
import { STAGES } from '../../data/stageConfig';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export const WorkflowStepper = ({ currentStage = 1, onStageSelect }) => {
  return (
    <div className="glass-panel p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            14-Stage EB-2 NIW Workflow Engine
          </h2>
          <p className="text-xs text-slate-400">Current Progress: Stage {currentStage} of 14</p>
        </div>
        <div className="text-xs text-cyan-400 font-semibold bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
          {Math.round((currentStage / 14) * 100)}% Completed
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full transition-all duration-500"
          style={{ width: `${(currentStage / 14) * 100}%` }}
        />
      </div>

      {/* Grid of 14 Stages */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
        {STAGES.map((s) => {
          const isDone = s.id < currentStage;
          const isCurrent = s.id === currentStage;

          return (
            <button
              key={s.id}
              onClick={() => onStageSelect && onStageSelect(s.id)}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isCurrent
                  ? 'bg-blue-600/30 border-blue-400 text-white ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/30'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isCurrent ? 'bg-blue-500 text-white' : isDone ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  #{s.id}
                </span>
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Circle className={`h-3.5 w-3.5 ${isCurrent ? 'text-blue-400 fill-blue-400/20' : 'text-slate-600'}`} />
                )}
              </div>
              <p className="text-xs font-semibold truncate leading-tight">{s.short}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
