import React, { useState } from 'react';
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
  Briefcase
} from 'lucide-react';
import { CaseItem, RiskLevel, UserRole } from '../../types';
import { StageBadge, RiskBadge } from '../common/Badge';

interface CasesListViewProps {
  cases: CaseItem[];
  onSelectCase: (caseId: string) => void;
  openNewCaseModal: () => void;
  openAIAssistant: () => void;
  userRole?: UserRole;
}

export const CasesListView: React.FC<CasesListViewProps> = ({
  cases,
  onSelectCase,
  openNewCaseModal,
  openAIAssistant,
  userRole = 'admin',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<string>('all');

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fieldCategory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = selectedRisk === 'all' || c.riskLevel === selectedRisk;
    const matchesCenter = selectedCenter === 'all' || c.uscisServiceCenter.includes(selectedCenter);

    return matchesSearch && matchesRisk && matchesCenter;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Cases Directory (EB-1A &amp; EB-2 NIW)</h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Manage active petition pipelines, EB-1A extraordinary criteria, and Dhanasar argument structures.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
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
          </div>
        </div>
      </div>

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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCase(c.id);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <span>Open Case Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-slate-500 text-sm">No NIW cases match the current filter criteria.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedRisk('all'); setSelectedCenter('all'); }} 
              className="mt-2 text-xs text-blue-600 font-medium hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
