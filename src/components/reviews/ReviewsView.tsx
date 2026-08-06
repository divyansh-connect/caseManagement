import React, { useState } from 'react';
import { 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  AlertTriangle, 
  ShieldCheck, 
  Edit3,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { CaseItem } from '../../types';
import { StageBadge, RiskBadge } from '../common/Badge';

interface ReviewsViewProps {
  cases: CaseItem[];
  onSelectCase: (caseId: string) => void;
  openAIAssistant: () => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ cases, onSelectCase, openAIAssistant }) => {
  // Cases pending review (stages 9 - 12)
  const pendingReviewCases = cases.filter(c => c.currentStage >= 9 && c.currentStage <= 12);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(pendingReviewCases[0]?.id || cases[0]?.id);
  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const [reviewNotes, setReviewNotes] = useState('');
  const [isApproved, setIsApproved] = useState(false);

  const handleApproveDraft = () => {
    setIsApproved(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Managing Partner Review Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Senior attorney signoff for Form I-140 Cover Letters, Dhanasar legal arguments, and RFE risk verification.
          </p>
        </div>

        <button
          onClick={openAIAssistant}
          className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-semibold text-xs hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Audit RFE Vulnerabilities</span>
        </button>
      </div>

      {/* Main Review Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>Drafts Awaiting Approval</span>
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {pendingReviewCases.length} Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-64 lg:max-h-[500px]">
            {pendingReviewCases.map(c => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCaseId(c.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  c.id === selectedCaseId ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 text-xs truncate">{c.clientName}</span>
                  <RiskBadge level={c.riskLevel} />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">{c.fieldCategory}</div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  <span>Target: {c.targetFilingDate}</span>
                  <span className="font-semibold text-purple-700">Stage {c.currentStage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Review Workbench */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{selectedCase.clientName} — Legal Memorandum</h3>
                  <p className="text-xs text-slate-500">Form I-140 Cover Letter & Dhanasar 3-Prong Submissions</p>
                </div>
                <button
                  onClick={() => onSelectCase(selectedCase.id)}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>Full Case File</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* RFE Risk Scoring Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm shrink-0">
                    94%
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">Dhanasar Strength Assessment</div>
                    <div className="text-slate-500 text-[11px] leading-snug">Prong 1: Strong • Prong 2: High Citation Count (418) • Prong 3: Clear PERM Waiver Urgency</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-semibold text-xs border border-emerald-200 shrink-0 self-start sm:self-auto">
                  Low RFE Probability
                </span>
              </div>

              {/* Memo Text Preview */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Draft Memorandum Excerpt (Prong 1)</h4>
                <div className="p-3.5 sm:p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl leading-relaxed max-h-48 overflow-y-auto">
                  {selectedCase.dhanasar.prong1.endeavorSummary}
                  <br /><br />
                  [ARGUMENT II.A]: Candidate's endeavor directly advances Executive Order 14028 regarding Cybersecurity Infrastructure Modernization. The substantial merit is substantiated by Exhibit 105 ($1.2M NSF SBIR Phase I Grant) and Exhibit 201 (MIT Advisory Letter).
                </div>
              </div>

              {/* Attorney Notes & Signoff */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800">Managing Partner Review Notes & Redlines</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add partner comments or requested edits before signing..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                  <button className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer">
                    Request Redline Revision
                  </button>

                  <button
                    onClick={handleApproveDraft}
                    className={`w-full sm:w-auto px-5 py-2 rounded-lg font-bold text-xs text-white shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isApproved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isApproved ? 'Approved & Signed' : 'Approve Petition Draft'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
