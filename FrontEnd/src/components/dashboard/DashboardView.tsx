import React from 'react';
import { 
  Briefcase, 
  FileCheck, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  ArrowRight,
  AlertTriangle,
  Award,
  ChevronRight
} from 'lucide-react';
import { CaseItem, CaseTask, UserRole } from '../../types';
import { StageBadge, RiskBadge } from '../common/Badge';
import { WORKFLOW_STAGES } from '../../data/mockData';

interface DashboardViewProps {
  cases: CaseItem[];
  tasks: CaseTask[];
  onSelectCase: (caseId: string) => void;
  openNewCaseModal: () => void;
  openAIAssistant: () => void;
  userRole: UserRole;
  onNavigateTab?: (tab: any, options?: { stageIds?: number[]; category?: string }) => void;
}

import { api } from '../../services/api';
import { Layers, X, CheckCircle2 } from 'lucide-react';

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  tasks,
  onSelectCase,
  openNewCaseModal,
  openAIAssistant,
  userRole,
  onNavigateTab,
}) => {
  const [dbStats, setDbStats] = React.useState<any>(null);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.success) {
          setDbStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats from backend:', err);
      }
    };
    fetchStats();
  }, [cases, tasks]);

  const activeCasesCount = dbStats ? dbStats.activeCasesCount : cases.length;
  const inReviewCount = dbStats ? dbStats.inReviewCount : cases.filter(c => c.currentStage >= 9 && c.currentStage <= 12).length;
  const highRiskCount = dbStats ? dbStats.rfeCasesCount : cases.filter(c => c.riskLevel === 'high' || c.riskLevel === 'medium').length;
  const pendingTasksCount = dbStats ? dbStats.pendingTasksCount : tasks.filter(t => !t.completed).length;

  // Calculate stage counts for 5 main workflow categories
  const categoryCounts = dbStats && dbStats.funnel ? {
    'Intake': dbStats.funnel.intake,
    'Evaluation': dbStats.funnel.evaluation,
    'Endeavor & Evidence': dbStats.funnel.evidence,
    'Drafting & Review': dbStats.funnel.drafting,
    'Final Filing': dbStats.funnel.filing
  } : WORKFLOW_STAGES.reduce((acc, stage) => {
    const stageCases = cases.filter(c => c.currentStage === stage.id).length;
    acc[stage.category] = (acc[stage.category] || 0) + stageCases;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-600/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {userRole === 'superadmin' && 'Super Admin Command Center'}
                {userRole === 'admin' && 'Administrator & Case Management Hub'}
                {userRole === 'writer' && 'Drafter & Research Workspace'}
                {userRole === 'reviewer' && 'Senior Reviewer Audit Hub'}
                {userRole === 'client' && 'Client Portal Workspace'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {userRole === 'superadmin' && 'Babel Global Governance & Operations'}
              {userRole === 'admin' && 'Babel Global Case Operations'}
              {userRole === 'writer' && 'Petition Drafting & Evidence Workbench'}
              {userRole === 'reviewer' && 'Petition Quality Control & Approvals'}
              {userRole === 'client' && 'Immigration Petition Status'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Unified national interest waiver workflow engine. Real-time petition tracking and case milestone management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={openAIAssistant}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Babel AI Petition Drafter</span>
            </button>

            {(userRole === 'superadmin' || userRole === 'admin') && (
              <button
                onClick={openNewCaseModal}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Intake New Case</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active NIW Cases</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{activeCasesCount}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12% this month
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across 5 academic & engineering domains
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Draft & Review</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{inReviewCount}</span>
            <span className="text-xs font-medium text-purple-600">Stages 9 – 12</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Senior Reviewer audit & client signoff
          </div>

        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">RFE Risk Index</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{highRiskCount} Cases</span>
            <span className="text-xs font-medium text-emerald-600">Low Flag Rate</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Automated Dhanasar prong strength check
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Workflow Progress</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">Active</span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              On Schedule
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Workflow tracking across all active cases
          </div>
        </div>

      </div>

      {/* 6-Stage Category Pipeline Overview */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-bold text-slate-800 text-sm">6-Stage Workflow Funnel Distribution</h2>
            <p className="text-xs text-slate-500">Current case allocation across petition lifecycle stages</p>
          </div>
          <button 
            onClick={() => setIsMatrixModalOpen(true)}
            className="text-xs text-blue-600 font-semibold cursor-pointer hover:text-blue-800 hover:underline flex items-center gap-1 self-start sm:self-auto bg-transparent border-none p-0"
          >
            <span>View full workflow matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {[
            { cat: 'Consultation & Onboarding', stages: 'Stage 1', color: 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400', stageIds: [1] },
            { cat: 'Strategy & Recommenders', stages: 'Stage 2', color: 'border-amber-200 bg-amber-50/50 text-amber-800 hover:border-amber-400', stageIds: [2] },
            { cat: 'Forms Preparation', stages: 'Stage 3', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-800 hover:border-indigo-400', stageIds: [3] },
            { cat: 'Drafting & Review', stages: 'Stage 4', color: 'border-purple-200 bg-purple-50/50 text-purple-800 hover:border-purple-400', stageIds: [4] },
            { cat: 'Package & Filing', stages: 'Stages 5 - 6', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:border-emerald-400', stageIds: [5, 6, 7] }
          ].map(item => {
            const count = cases.filter(c => item.stageIds.includes(Number(c.currentStage))).length;
            return (
              <div 
                key={item.cat} 
                onClick={() => onNavigateTab ? onNavigateTab('cases', { stageIds: item.stageIds, category: item.cat }) : null}
                className={`p-3 rounded-lg border ${item.color} flex flex-col justify-between cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group`}
                title={`Filter and view cases in ${item.cat}`}
              >
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{item.stages}</div>
                  <div className="font-bold text-xs sm:text-sm mt-0.5 leading-snug">{item.cat}</div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-lg sm:text-xl font-extrabold">{count}</span>
                  <span className="text-[10px] opacity-75 group-hover:translate-x-1 transition-transform">cases →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Section: Active Cases & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cases Section (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Priority Cases Engine</h2>
              <p className="text-xs text-slate-500">Active EB-2 NIW filings in progress</p>
            </div>
            <button
              onClick={() => onNavigateTab ? onNavigateTab('cases') : (cases[0]?.id ? onSelectCase(cases[0].id) : null)}
              className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Explore all cases</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Case ID & Candidate</th>
                  <th className="px-4 py-3">Field / Endeavor</th>
                  <th className="px-4 py-3">Current Stage</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => onSelectCase(c.id)}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 text-xs group-hover:text-blue-600 transition-colors">
                        {c.clientName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {c.caseNumber} • {c.uscisServiceCenter}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-slate-700 max-w-xs truncate">
                        {c.fieldCategory}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.premiumProcessing ? '⚡ Premium Processing' : 'Standard Speed'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StageBadge stageId={c.currentStage} />
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={c.riskLevel} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c.id);
                        }}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500 text-xs">
                      No active cases found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden divide-y divide-slate-100">
            {cases.map((c) => (
              <div 
                key={c.id} 
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer space-y-3"
                onClick={() => onSelectCase(c.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{c.clientName}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c.caseNumber} • {c.uscisServiceCenter}</p>
                  </div>
                  <RiskBadge level={c.riskLevel} />
                </div>

                <div className="text-xs text-slate-600 font-medium">
                  {c.fieldCategory}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <StageBadge stageId={c.currentStage} />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCase(c.id);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <span>Open</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {cases.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active cases found.
              </div>
            )}
          </div>
        </div>

        {/* Actionable Tasks (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Urgent Workflow Tasks</h2>
              <p className="text-xs text-slate-500">{pendingTasksCount} pending action items</p>
            </div>

            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-96">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-3 rounded-lg border transition-all ${
                  task.completed 
                    ? 'bg-slate-50 border-slate-200 opacity-60' 
                    : task.priority === 'urgent' 
                    ? 'bg-rose-50/50 border-rose-200' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-tight ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <span className="font-medium text-slate-700">Due {task.dueDate}</span>
                      <span>•</span>
                      <span>{task.assignedToName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No urgent tasks found.
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 rounded-b-xl text-center">
            <button 
              onClick={() => onNavigateTab ? onNavigateTab('tasks') : null}
              className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
            >
              View all workflow tasks →
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: FULL WORKFLOW MATRIX
      ══════════════════════════════════════════════════════════════════════════ */}
      {isMatrixModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-blue-950 p-5 text-white flex items-start justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600/80 border border-blue-400/40 flex items-center justify-center font-bold text-amber-300 shadow-sm shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg">EB-2 NIW &amp; EB-1A Workflow Matrix</h3>
                    <span className="bg-blue-500/30 text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-400/30">
                      7 Stages
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">Comprehensive lifecycle overview of petition stages and case distribution</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMatrixModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stages Grid Container */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {WORKFLOW_STAGES.map((st) => {
                  const stageCases = cases.filter(c => c.currentStage === st.id);
                  return (
                    <div 
                      key={st.id} 
                      className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/40 transition-all flex flex-col justify-between space-y-3 shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                            Stage #{st.id}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {st.category} • ~{st.typicalDays} Days
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{st.name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          {stageCases.length} Active {stageCases.length === 1 ? 'Case' : 'Cases'}
                        </span>
                        
                        <button
                          onClick={() => {
                            setIsMatrixModalOpen(false);
                            if (onNavigateTab) {
                              onNavigateTab('cases', { stageIds: [st.id], category: st.name });
                            }
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Explore Cases</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <span className="text-xs text-slate-500">
                Total Active Filings: <strong className="text-slate-800">{cases.length} cases</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMatrixModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsMatrixModalOpen(false);
                    if (onNavigateTab) {
                      onNavigateTab('cases');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Go to Cases Directory
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
