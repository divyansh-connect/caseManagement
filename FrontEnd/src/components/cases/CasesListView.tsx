import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  Users,
  Briefcase,
  Layers,
  X,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { CaseItem, RiskLevel, UserRole } from '../../types';
import { StageBadge, RiskBadge } from '../common/Badge';

export interface FunnelStageConfig {
  id: string;
  cat: string;
  stages: string;
  stageIds: number[];
}

export const FUNNEL_STAGES: FunnelStageConfig[] = [
  { id: 'stage-1', cat: 'Consultation & Onboarding', stages: 'Stage 1', stageIds: [1] },
  { id: 'stage-2', cat: 'Strategy & Recommenders', stages: 'Stage 2', stageIds: [2] },
  { id: 'stage-3', cat: 'Forms Preparation', stages: 'Stage 3', stageIds: [3] },
  { id: 'stage-4', cat: 'Drafting & Review', stages: 'Stage 4', stageIds: [4] },
  { id: 'stage-5-6', cat: 'Package & Filing', stages: 'Stages 5 - 6', stageIds: [5, 6, 7] },
];

interface CasesListViewProps {
  cases: CaseItem[];
  onSelectCase: (caseId: string) => void;
  openNewCaseModal: () => void;
  openAIAssistant: () => void;
  userRole?: UserRole;
  onDeleteCase?: (caseId: string) => void;
}

export const CasesListView: React.FC<CasesListViewProps> = ({
  cases,
  onSelectCase,
  openNewCaseModal,
  openAIAssistant,
  userRole = 'admin',
  onDeleteCase,
}) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to parse active stage filter from URL search parameters
  const parseStageFromParams = () => {
    const stageIdsParam = searchParams.get('stageIds');
    const categoryParam = searchParams.get('category');

    if (stageIdsParam) {
      const ids = stageIdsParam.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n));
      const matched = FUNNEL_STAGES.find(g => 
        g.stageIds.length === ids.length && g.stageIds.every(id => ids.includes(id))
      );
      if (matched) return matched.id;
    }

    if (categoryParam) {
      const matched = FUNNEL_STAGES.find(g => 
        g.cat.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matched) return matched.id;
    }

    return 'all';
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>(parseStageFromParams);

  // Sync selectedStage whenever URL searchParams change
  useEffect(() => {
    setSelectedStage(parseStageFromParams());
  }, [searchParams]);

  const currentFunnelGroup = FUNNEL_STAGES.find(g => g.id === selectedStage);
  const isStageFiltered = selectedStage !== 'all' && Boolean(currentFunnelGroup);

  // Handler to clear stage filter and show all cases
  const handleClearStageFilter = () => {
    setSelectedStage('all');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('stageIds');
    nextParams.delete('category');
    nextParams.delete('stage');
    if (Array.from(nextParams.keys()).length === 0) {
      navigate('/cases', { replace: true });
    } else {
      setSearchParams(nextParams, { replace: true });
    }
  };

  // Handler to change stage dropdown
  const handleStageChange = (newStage: string) => {
    setSelectedStage(newStage);
    const nextParams = new URLSearchParams(searchParams);
    if (newStage === 'all') {
      nextParams.delete('stageIds');
      nextParams.delete('category');
      nextParams.delete('stage');
      navigate('/cases', { replace: true });
    } else {
      const group = FUNNEL_STAGES.find(g => g.id === newStage);
      if (group) {
        nextParams.set('stageIds', group.stageIds.join(','));
        nextParams.set('category', group.cat);
        setSearchParams(nextParams, { replace: true });
      }
    }
  };

  const handleResetAllFilters = () => {
    setSearchTerm('');
    setSelectedRisk('all');
    setSelectedCenter('all');
    handleClearStageFilter();
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fieldCategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = selectedRisk === 'all' || c.riskLevel === selectedRisk;
    const matchesCenter = selectedCenter === 'all' || c.uscisServiceCenter.includes(selectedCenter);
    
    const matchesStage = (() => {
      if (selectedStage === 'all' || !currentFunnelGroup) return true;
      return currentFunnelGroup.stageIds.includes(Number(c.currentStage));
    })();

    return matchesSearch && matchesRisk && matchesCenter && matchesStage;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Cases Directory (EB-1A &amp; EB-2 NIW)</h1>
            {isStageFiltered && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                Filtered: {currentFunnelGroup?.stages}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {isStageFiltered ? (
              <span>
                Filtered by <strong>{currentFunnelGroup?.cat}</strong> ({filteredCases.length} of {cases.length} active cases).
              </span>
            ) : (
              'Manage active petition pipelines, EB-1A extraordinary criteria, and Dhanasar argument structures.'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          {isStageFiltered && (
            <button
              onClick={handleClearStageFilter}
              className="px-3.5 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-300 font-semibold text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shadow-2xs"
              title="Show all cases without stage filtering"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>All Cases ({cases.length})</span>
            </button>
          )}

          <button
            onClick={openAIAssistant}
            className="px-3.5 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-semibold text-xs hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Petition Analysis</span>
          </button>
          
          {(userRole === 'superadmin' || userRole === 'admin') && (
            <button
              onClick={openNewCaseModal}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Intake New Case</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate name, case ID, field..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Select Filters */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
            {/* Workflow Stage Filter Dropdown */}
            <select
              value={selectedStage}
              onChange={(e) => handleStageChange(e.target.value)}
              className={`w-full sm:w-auto border text-xs rounded-lg px-3 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate font-medium transition-colors ${
                isStageFiltered 
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' 
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <option value="all">All Stages ({cases.length})</option>
              {FUNNEL_STAGES.map(g => {
                const count = cases.filter(c => g.stageIds.includes(Number(c.currentStage))).length;
                return (
                  <option key={g.id} value={g.id}>
                    {g.stages}: {g.cat} ({count})
                  </option>
                );
              })}
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>

            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
            >
              <option value="all">All USCIS Centers</option>
              <option value="Nebraska">Nebraska (NSC)</option>
              <option value="Texas">Texas (TSC)</option>
            </select>

            {(isStageFiltered || selectedRisk !== 'all' || selectedCenter !== 'all' || searchTerm) && (
              <button
                onClick={handleResetAllFilters}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Stage Funnel Filter Alert / Banner */}
      {isStageFiltered && currentFunnelGroup && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white border border-blue-200 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  {currentFunnelGroup.stages} Funnel Filter
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {currentFunnelGroup.cat}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Displaying <strong>{filteredCases.length}</strong> of {cases.length} cases in this petition workflow stage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 justify-end">
            <button
              onClick={handleClearStageFilter}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Cases</span>
            </button>
            <button
              onClick={handleClearStageFilter}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Remove filter"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Cases Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Candidate &amp; Filing ID</th>
                <th className="px-5 py-3.5">Endeavor Domain</th>
                <th className="px-5 py-3.5">Workflow Stage</th>
                <th className="px-5 py-3.5">Immigration Team</th>
                <th className="px-5 py-3.5">Target Filing</th>
                <th className="px-5 py-3.5">RFE Risk</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => (
                <tr 
                  key={c.id} 
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectCase(c.id)}
                >
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center gap-2">
                      <span>{c.clientName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        c.petitionCategory === 'EB-1A' 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {c.petitionCategory || 'EB-2 NIW'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {c.caseNumber} • {c.uscisServiceCenter}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800 text-xs max-w-xs leading-snug">
                      {c.fieldCategory}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {c.premiumProcessing && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          ⚡ Premium ($2,965)
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400">
                        {c.documentsCount} documents verified
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <StageBadge stageId={c.currentStage} showCategory />
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-xs font-medium text-slate-800">{c.assignedWriter}</div>
                    <div className="text-[10px] text-slate-400">{c.assignedReviewer}</div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-800">{c.targetFilingDate}</div>
                    <div className="text-[10px] text-slate-400">Updated {c.lastUpdated}</div>
                  </td>

                  <td className="px-5 py-4">
                    <RiskBadge level={c.riskLevel} />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-medium text-xs transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Open Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {(userRole === 'superadmin' || userRole === 'admin') && onDeleteCase && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete case ${c.caseNumber} (${c.clientName})? This cannot be undone.`)) {
                              onDeleteCase(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={`Delete case ${c.caseNumber}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer space-y-3"
              onClick={() => onSelectCase(c.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      c.petitionCategory === 'EB-1A'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {c.petitionCategory || 'EB-2 NIW'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">{c.caseNumber}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{c.clientName}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{c.uscisServiceCenter}</p>
                </div>
                <RiskBadge level={c.riskLevel} />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 font-medium">
                {c.fieldCategory}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StageBadge stageId={c.currentStage} showCategory />
                {c.premiumProcessing && (
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    ⚡ Premium
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Assigned Team</span>
                  <span className="font-medium text-slate-800">{c.assignedWriter}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Target Filing</span>
                  <span className="font-medium text-slate-800">{c.targetFilingDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCase(c.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  <span>Open Case Workspace</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                {(userRole === 'superadmin' || userRole === 'admin') && onDeleteCase && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete case ${c.caseNumber} (${c.clientName})? This cannot be undone.`)) {
                        onDeleteCase(c.id);
                      }
                    }}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shrink-0"
                    title={`Delete case ${c.caseNumber}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <p className="text-slate-800 font-semibold text-sm">
              {isStageFiltered 
                ? `No active cases in ${currentFunnelGroup?.cat}`
                : 'No cases match the current filter criteria.'
              }
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {isStageFiltered 
                ? `There are currently 0 cases in ${currentFunnelGroup?.stages}. Click below to see all active petitions.`
                : 'Try clearing your search query or reset the risk and center filters.'
              }
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {isStageFiltered && (
                <button
                  onClick={handleClearStageFilter}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View All Cases ({cases.length})</span>
                </button>
              )}
              <button 
                onClick={handleResetAllFilters} 
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
