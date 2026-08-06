import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronDown,
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Award, 
  Layers, 
  MessageSquare, 
  Download, 
  Plus, 
  AlertCircle,
  FileSpreadsheet,
  Building2,
  Share2,
  Check,
  Send,
  Edit3,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Slash
} from 'lucide-react';
import { CaseItem, StageId, CaseDocument, Recommender, CaseMessage, UserRole } from '../../types';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { StageBadge, RiskBadge, StatusBadge } from '../common/Badge';

export type TaskStatus = 
  | 'Not Started' 
  | 'Awaiting Client' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Revision Required' 
  | 'Approved/Completed' 
  | 'Not Applicable';

export interface StageTaskItem {
  id: string;
  name: string;
  assignedTo: 'Client' | 'Babel Global Team';
  status: TaskStatus;
  deadline?: string;
  requiredDocs?: string[];
  flowLabel?: string;
}

export interface StageGroup {
  id: number;
  title: string;
  subtitle: string;
  tasks: StageTaskItem[];
}

const INITIAL_WORKFLOW_STAGES: StageGroup[] = [
  {
    id: 1,
    title: 'Stage 1: Consultation and Onboarding',
    subtitle: 'Profile assessment, engagement agreement, flexible payment & document collection',
    tasks: [
      { id: 'st1-1', name: 'Initial consultation and intake evaluation', assignedTo: 'Client', status: 'Approved/Completed' },
      { id: 'st1-2', name: 'Upload existing CV and academic degree certificates', assignedTo: 'Client', status: 'Approved/Completed', requiredDocs: ['Curriculum Vitae', 'Degree Certificate'] },
      { id: 'st1-3', name: 'Review and sign engagement retainer agreement', assignedTo: 'Client', status: 'Approved/Completed', requiredDocs: ['Signed Engagement Agreement'] },
      { id: 'st1-4', name: 'Select payment plan and confirm retainer deposit', assignedTo: 'Client', status: 'Approved/Completed' },
      { id: 'st1-5', name: 'Profile evaluation & evidence checklist approval', assignedTo: 'Babel Global Team', status: 'Approved/Completed' }
    ]
  },
  {
    id: 2,
    title: 'Stage 2: Case Strategy & Recommendation Letters',
    subtitle: 'Proposed endeavor development & expert recommender letters',
    tasks: [
      { id: 'st2-1', name: 'Review and approve proposed endeavor statement', assignedTo: 'Client', status: 'Approved/Completed', deadline: 'Mar 01, 2026' },
      { id: 'st2-2', name: 'Identify 3-5 independent expert recommenders', assignedTo: 'Client', status: 'Approved/Completed', deadline: 'Mar 10, 2026', requiredDocs: ['Recommender CVs'] },
      { id: 'st2-3', name: 'Draft recommendation letters', assignedTo: 'Babel Global Team', status: 'Under Review', deadline: 'Mar 12, 2026', requiredDocs: ['Draft Letters 1-3'] },
      { id: 'st2-4', name: 'Send drafted letters to recommenders for review', assignedTo: 'Client', status: 'Awaiting Client', deadline: 'Mar 15, 2026' },
      { id: 'st2-5', name: 'Upload signed recommendation letters on official letterhead', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['Signed Recommendation Letters'] },
      { id: 'st2-6', name: 'Staff reviews and approves completed letters', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  },
  {
    id: 3,
    title: 'Stage 3: Forms Preparation',
    subtitle: 'USCIS questionnaires & official form packages (I-140, ETA-9089, G-1145)',
    tasks: [
      { id: 'st3-1', name: 'Client completes simplified USCIS questionnaire', assignedTo: 'Client', status: 'Approved/Completed', requiredDocs: ['USCIS Questionnaire'] },
      { id: 'st3-2', name: 'Transfer data to applicable forms (I-140, ETA-9089)', assignedTo: 'Babel Global Team', status: 'Approved/Completed' },
      { id: 'st3-3', name: 'Legal staff reviews form data and accuracy', assignedTo: 'Babel Global Team', status: 'Under Review' },
      { id: 'st3-4', name: 'Client reviews & signs completed forms with blue ink', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['Signed Form I-140', 'Form G-1145'] }
    ]
  },
  {
    id: 4,
    title: 'Stage 4: Petition Drafting & Review',
    subtitle: 'Legal petition memorandum drafting under Dhanasar 3-Prong framework',
    tasks: [
      { id: 'st4-1', name: 'Assign petition to Senior Drafter', assignedTo: 'Babel Global Team', status: 'Approved/Completed' },
      { id: 'st4-2', name: 'Draft Petition Memorandum (Dhanasar Prongs 1, 2, 3)', assignedTo: 'Babel Global Team', status: 'Under Review', deadline: 'Mar 15, 2026', requiredDocs: ['Petition Memorandum Draft'] },
      { id: 'st4-3', name: 'Senior QA Reviewer audit & legal signoff', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st4-4', name: 'Provide draft to client for factual review & approval', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st4-5', name: 'Final revisions & petition approval for packaging', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  },
  {
    id: 5,
    title: 'Stage 5: Final Package Preparation',
    subtitle: 'Completed forms, petition letter, exhibit index & supporting exhibits',
    tasks: [
      { id: 'st5-0', name: 'Pay Outstanding Service Balance', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st5-1', name: 'Organize final package & Exhibit PDF Index', assignedTo: 'Babel Global Team', status: 'Not Started', requiredDocs: ['Exhibit Index PDF', 'Compiled Filing Package'] },
      { id: 'st5-2', name: 'Final quality control and signature verification', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st5-3', name: 'Fee verification and document ordering', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st5-4', name: 'Package approval', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st5-5', name: 'Shipping-address confirmation', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st5-6', name: 'Shipment to USCIS', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  },
  {
    id: 6,
    title: 'Stage 6: Your Petition Has Been Filed—What Happens Next?',
    subtitle: 'Your petition package has been shipped to USCIS. Here is what you should expect:',
    tasks: [
      { id: 'st6-1', name: 'Track package delivery to USCIS courier intake', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st6-2', name: 'USCIS mailroom processing & intake review', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st6-3', name: 'Filing fee payment check', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st6-4', name: 'Upload Form I-797C Receipt Notice upon receipt', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['Form I-797C Notice of Action'] },
      { id: 'st6-5', name: 'Track case status on USCIS online portal', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  },
  {
    id: 7,
    title: 'Optional Add-On: Concurrent Form I-485 Filing',
    subtitle: 'Activated only for clients who purchase concurrent filing service',
    tasks: [
      { id: 'opt-1', name: 'Additional-service agreement & fee confirmation', assignedTo: 'Client', status: 'Not Started' },
      { id: 'opt-2', name: 'Form I-485 questionnaire & medical exam (Form I-693)', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['Form I-693 Medical Sealed Envelope'] },
      { id: 'opt-3', name: 'Final concurrent package preparation & filing', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  }
];

interface CaseDetailViewProps {
  caseData: CaseItem;
  documents: CaseDocument[];
  messages: CaseMessage[];
  onBack: () => void;
  onUpdateStage: (caseId: string, newStage: StageId) => void;
  openAIAssistant: () => void;
  openNewDocModal: () => void;
  openNewRecommenderModal: () => void;
  userRole: UserRole;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  caseData,
  documents,
  messages: initialMessages,
  onBack,
  onUpdateStage,
  openAIAssistant,
  openNewDocModal,
  openNewRecommenderModal,
  userRole,
}) => {
  const [activeTab, setActiveTab] = useState<'workflow' | 'overview' | 'dhanasar' | 'documents' | 'recommenders' | 'builder' | 'messages'>('workflow');
  const [expandedStage, setExpandedStage] = useState<number>(caseData.currentStage);
  const [stageGroups, setStageGroups] = useState<StageGroup[]>(INITIAL_WORKFLOW_STAGES);
  const [messages, setMessages] = useState<CaseMessage[]>(initialMessages.filter(m => m.caseId === caseData.id));
  const [newMessageText, setNewMessageText] = useState('');
  
  // Petition builder state
  const [prong1Draft, setProng1Draft] = useState(caseData.dhanasar.prong1.endeavorSummary);
  const [prong2Draft, setProng2Draft] = useState(caseData.dhanasar.prong2.educationTrack);
  const [prong3Draft, setProng3Draft] = useState(caseData.dhanasar.prong3.uniqueExpertise);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const activeCaseDocs = documents.filter(d => d.caseId === caseData.id);

  // Status Badge Helper
  const getTaskStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Approved/Completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Approved/Completed
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-600" />
            Under Review
          </span>
        );
      case 'Awaiting Client':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-purple-600" />
            Awaiting Client
          </span>
        );
      case 'Submitted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <Send className="w-3 h-3 text-amber-600" />
            Submitted
          </span>
        );
      case 'Revision Required':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Revision Required
          </span>
        );
      case 'Not Applicable':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-300 line-through">
            Not Applicable
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
            Not Started
          </span>
        );
    }
  };

  // Super Admin Control & Automatic Stage Advancement Handlers
  const handleUpdateTaskStatus = (stageId: number, taskId: string, newStatus: TaskStatus) => {
    setStageGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => {
        if (group.id !== stageId) return group;
        const updatedTasks = group.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        return { ...group, tasks: updatedTasks };
      });

      // Check for automatic stage advancement
      const currentGroup = updatedGroups.find(g => g.id === caseData.currentStage);
      if (currentGroup) {
        const isAllDone = currentGroup.tasks.every(t => t.status === 'Approved/Completed' || t.status === 'Not Applicable');
        if (isAllDone && caseData.currentStage < 6) {
          const nextStage = (caseData.currentStage + 1) as StageId;
          onUpdateStage(caseData.id, nextStage);
        }
      }

      return updatedGroups;
    });
  };

  const handleMoveTask = (stageId: number, index: number, direction: 'up' | 'down') => {
    if (userRole !== 'superadmin') return;
    setStageGroups(prevGroups => {
      return prevGroups.map(group => {
        if (group.id !== stageId) return group;
        const tasks = [...group.tasks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= tasks.length) return group;
        const temp = tasks[index];
        tasks[index] = tasks[targetIndex];
        tasks[targetIndex] = temp;
        return { ...group, tasks };
      });
    });
  };

  const handleWaiveTask = (stageId: number, taskId: string) => {
    if (userRole !== 'superadmin') return;
    handleUpdateTaskStatus(stageId, taskId, 'Not Applicable');
  };

  const handleUnlockStage = (stageId: number) => {
    if (userRole !== 'superadmin') return;
    onUpdateStage(caseData.id, stageId as StageId);
    setExpandedStage(stageId);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const newMsg: CaseMessage = {
      id: `msg-${Date.now()}`,
      caseId: caseData.id,
      senderName: userRole === 'client' ? caseData.clientName : userRole === 'reviewer' ? 'David Miller, Esq.' : 'Sarah Jenkins',
      senderRole: userRole,
      content: newMessageText,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setMessages([...messages, newMsg]);
    setNewMessageText('');
  };

  const handleAiRefineProng = (prongNum: number) => {
    setIsAiGenerating(true);
    setTimeout(() => {
      if (prongNum === 1) {
        setProng1Draft(prev => `${prev}\n\n[JurisAI Enhancement]: The proposed endeavor directly supports Executive Order 14028 and the Department of Energy Grid Security Framework by deploying fault-tolerant cryptographic algorithms that shield federal utilities from state-sponsored cyber disruptions.`);
      } else if (prongNum === 2) {
        setProng2Draft(prev => `${prev}\n\n[JurisAI Enhancement]: Candidate ranks in the 99th percentile globally for quantum optimization literature, with 418 citations across IEEE and Physical Review Letters, corroborated by 3 independent letters from Sandia Labs and ETH Zurich.`);
      } else if (prongNum === 3) {
        setProng3Draft(prev => `${prev}\n\n[JurisAI Enhancement]: Requiring PERM labor certification would impose an unworkable 18-month delay, severing cross-institutional research access during an active national infrastructure modernization cycle.`);
      }
      setIsAiGenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16">
      {/* Back & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cases Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={openAIAssistant}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-medium text-xs hover:bg-amber-100 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Copilot</span>
          </button>
          
          {userRole === 'superadmin' && (
            <button
              onClick={() => onUpdateStage(caseData.id, Math.min(6, caseData.currentStage + 1) as StageId)}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              title="Super Admin Override: Advance Stage"
            >
              <span>Super Admin Advance Stage {Math.min(6, caseData.currentStage + 1)}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400">{caseData.caseNumber}</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                caseData.petitionCategory === 'EB-1A'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-blue-100 text-blue-800 border-blue-300'
              }`}>
                {caseData.petitionCategory || 'EB-2 NIW'}
              </span>
              <span className="text-xs font-medium text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500">{caseData.uscisServiceCenter}</span>
              {caseData.premiumProcessing && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  ⚡ Premium Processing ($2,965)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{caseData.clientName}</h1>
            <p className="text-xs font-medium text-blue-700 mt-0.5">{caseData.fieldCategory}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StageBadge stageId={caseData.currentStage} showCategory />
            <RiskBadge level={caseData.riskLevel} />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto">
        {[
          { id: 'workflow', label: 'Case Workflow', icon: Layers },
          { id: 'overview', label: 'Team & Notes', icon: FileSpreadsheet },
          { 
            id: 'dhanasar', 
            label: caseData.petitionCategory === 'EB-1A' ? 'EB-1A Criteria Matrix (10 Points)' : 'Dhanasar 3-Prong Matrix', 
            icon: Award 
          },
          { id: 'documents', label: `Document Vault (${activeCaseDocs.length})`, icon: FileText },
          { id: 'recommenders', label: `Recommenders (${caseData.recommenders.length})`, icon: UserCheck },
          { id: 'builder', label: 'Petition Builder', icon: Edit3 },
          { id: 'messages', label: `Messages (${messages.length})`, icon: MessageSquare }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 font-semibold text-xs border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          NEW Tab 0: Stage-Based Workflow Engine (replaces legacy 14-stage)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'workflow' && (
        <div className="space-y-3">
          {/* Legend / Key */}
          {userRole === 'superadmin' && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-900 text-white rounded-xl px-4 py-3 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-amber-300 mr-1">Super Admin Controls Active:</span>
              <span className="text-slate-300">Change task status via dropdown</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Reorder tasks ▲▼</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Waive / mark Not Applicable</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Override Unlock Stage</span>
            </div>
          )}

          {/* Stage Accordion */}
          {stageGroups.map((stage) => {
            const isExpanded = expandedStage === stage.id;
            const totalTasks = stage.tasks.length;
            const doneTasks = stage.tasks.filter(t => t.status === 'Approved/Completed' || t.status === 'Not Applicable').length;
            const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
            const isActive = stage.id === caseData.currentStage;
            const isPast = stage.id < caseData.currentStage;
            const isFuture = stage.id > caseData.currentStage;
            const clientTasks = stage.tasks.filter(t => t.assignedTo === 'Client').length;
            const teamTasks = stage.tasks.filter(t => t.assignedTo === 'Babel Global Team').length;
            const remainingTasks = stage.tasks.filter(t => t.status !== 'Approved/Completed' && t.status !== 'Not Applicable').length;

            return (
              <div
                key={stage.id}
                className={`rounded-xl border transition-all overflow-hidden ${
                  isActive
                    ? 'border-blue-400 shadow-md shadow-blue-100'
                    : isPast
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {/* Stage Header (Collapsible) */}
                <button
                  onClick={() => setExpandedStage(isExpanded ? -1 : stage.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 hover:bg-blue-100/70'
                      : isPast
                      ? 'bg-emerald-50/60 hover:bg-emerald-100/50'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {/* Stage Number Badge */}
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                    isPast
                      ? 'bg-emerald-500 text-white'
                      : isActive
                      ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isPast ? <Check className="w-4 h-4" /> : stage.id}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`font-bold text-sm truncate ${
                        isActive ? 'text-blue-800' : isPast ? 'text-emerald-800' : 'text-slate-700'
                      }`}>
                        {stage.title}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                          ACTIVE
                        </span>
                      )}
                      {isPast && (
                        <span className="text-[10px] font-extrabold bg-emerald-500 text-white px-2 py-0.5 rounded-full shrink-0">
                          ✓ COMPLETE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug truncate">{stage.subtitle}</p>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progressPct === 100 ? 'bg-emerald-500' : isActive ? 'bg-blue-500' : 'bg-slate-400'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold shrink-0">{doneTasks}/{totalTasks} tasks</span>
                    </div>
                  </div>

                  {/* Right side: stats + chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex gap-3 text-[10px] font-semibold">
                      <span className="text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-md">
                        👤 {clientTasks} Client
                      </span>
                      <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-md">
                        🏢 {teamTasks} Team
                      </span>
                      {isActive && remainingTasks > 0 && (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                          ⏳ {remainingTasks} remaining
                        </span>
                      )}
                    </div>
                    {userRole === 'superadmin' && isFuture && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUnlockStage(stage.id); }}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition-colors"
                        title="Super Admin: Unlock this stage"
                      >
                        <Unlock className="w-3 h-3" />
                        Unlock
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Stage Body (Tasks) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {stage.tasks.map((task, taskIdx) => {
                      const isNA = task.status === 'Not Applicable';
                      const isDone = task.status === 'Approved/Completed';
                      return (
                        <div
                          key={task.id}
                          className={`flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 text-xs transition-colors ${
                            isNA ? 'opacity-50 bg-zinc-50' : isDone ? 'bg-emerald-50/40' : 'bg-white hover:bg-slate-50/60'
                          }`}
                        >
                          {/* Super Admin reorder buttons */}
                          {userRole === 'superadmin' && (
                            <div className="flex flex-col gap-0.5 shrink-0">
                              <button
                                onClick={() => handleMoveTask(stage.id, taskIdx, 'up')}
                                disabled={taskIdx === 0}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Move task up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveTask(stage.id, taskIdx, 'down')}
                                disabled={taskIdx === stage.tasks.length - 1}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                title="Move task down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {/* Task name + assignment */}
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-slate-800 leading-snug ${isNA ? 'line-through text-slate-400' : ''}`}>
                              {task.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                task.assignedTo === 'Client'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                {task.assignedTo === 'Client' ? '👤 Client' : '🏢 Babel Global Team'}
                              </span>
                              {task.deadline && (
                                <span className="text-slate-400 text-[10px] flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  Due: {task.deadline}
                                </span>
                              )}
                              {task.requiredDocs && task.requiredDocs.length > 0 && (
                                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <FileText className="w-2.5 h-2.5" />
                                  {task.requiredDocs.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status badge */}
                          <div className="shrink-0">
                            {getTaskStatusBadge(task.status)}
                          </div>

                          {/* Super Admin Controls */}
                          {userRole === 'superadmin' && (
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Status dropdown */}
                              <select
                                value={task.status}
                                onChange={(e) => handleUpdateTaskStatus(stage.id, task.id, e.target.value as TaskStatus)}
                                className="text-[10px] border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {(['Not Started', 'Awaiting Client', 'Submitted', 'Under Review', 'Revision Required', 'Approved/Completed', 'Not Applicable'] as TaskStatus[]).map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              {/* Waive button */}
                              {!isNA && (
                                <button
                                  onClick={() => handleWaiveTask(stage.id, task.id)}
                                  className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200 transition-colors cursor-pointer"
                                  title="Mark as Not Applicable (Waive)"
                                >
                                  <Slash className="w-3 h-3" />
                                  Waive
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          Tab: Team & Notes (old "Stage Checklist & Info" repurposed)
          ───────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Immigration Team & Case Metadata</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Petition Category</span>
                  <span className="font-bold text-blue-700">{caseData.petitionCategory || 'EB-2 NIW'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Assigned Petition Drafter</span>
                  <span className="font-medium text-slate-800">{caseData.assignedWriter}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Senior Reviewer</span>
                  <span className="font-medium text-slate-800">{caseData.assignedReviewer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Target Filing Date</span>
                  <span className="font-medium text-slate-800">{caseData.targetFilingDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Client Contact Email</span>
                  <span className="font-medium text-slate-800 break-all">{caseData.clientEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">USCIS Filing Venue</span>
                  <span className="font-medium text-slate-800">{caseData.uscisServiceCenter}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Internal Case Notes & Strategy</h3>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                {caseData.notes}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Actionable Stage Checklist</h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'CV & Publication Record Verified', done: true },
                  { label: 'Proposed Endeavor Form Drafted', done: true },
                  { label: 'Recommendation Letter #1 Signed', done: true },
                  { label: 'Recommendation Letter #2 In Review', done: false },
                  { label: 'Petition Memorandum Draft', done: false },
                  { label: 'Final Client Signoff & Filing Package', done: false }
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 transition-colors cursor-pointer">
                    <input type="checkbox" defaultChecked={item.done} className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    <span className={item.done ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: EB-1A 10-Criteria Matrix OR Dhanasar 3-Prong Matrix */}
      {activeTab === 'dhanasar' && (
        caseData.petitionCategory === 'EB-1A' ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-sm sm:text-base">EB-1A Extraordinary Ability Criteria Matrix (10 Regulatory Points)</h2>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">8 CFR 204.5(h)(3) evidentiary standards. Requires satisfying at least 3 out of 10 criteria.</p>
              </div>
              <div className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0">
                6 / 10 Criteria Satisfied
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { title: '1. Prizes & Awards', key: 'prizes', desc: 'Nationally or internationally recognized prizes for excellence.' },
                { title: '2. Association Membership', key: 'membership', desc: 'Membership in associations requiring outstanding achievements.' },
                { title: '3. Published Media', key: 'media', desc: 'Published material in professional or major trade publications.' },
                { title: '4. Judging Peer Work', key: 'judging', desc: 'Participation as a judge of the work of others in the same field.' },
                { title: '5. Original Contributions', key: 'originalContributions', desc: 'Original scientific, scholarly, or business-related contributions.' },
                { title: '6. Scholarly Articles', key: 'scholarlyArticles', desc: 'Authorship of scholarly articles in professional journals.' },
                { title: '7. Exhibitions / Showcases', key: 'exhibitions', desc: 'Display of work at artistic exhibitions or showcases.' },
                { title: '8. Leading / Critical Role', key: 'leadingRole', desc: 'Leading or critical role for distinguished organizations.' },
                { title: '9. High Remuneration', key: 'highSalary', desc: 'High salary or significantly high remuneration relative to field.' },
                { title: '10. Commercial Successes', key: 'commercialSuccess', desc: 'Commercial successes in the performing arts or industry.' }
              ].map((item) => {
                const isSatisfied = caseData.eb1aCriteria ? (caseData.eb1aCriteria as any)[item.key] : false;
                return (
                  <div 
                    key={item.key} 
                    className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                      isSatisfied 
                        ? 'bg-purple-50/60 border-purple-300 text-purple-900 shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-xs">{item.title}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSatisfied ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isSatisfied ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <p className="text-[10px] leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm sm:text-base">Matter of Dhanasar (26 I&N Dec. 884) Assessment</h2>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">Three-Prong legal framework evaluation for national interest waiver eligibility.</p>
            </div>
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 self-start sm:self-auto">
              High Probability (94% Match)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Prong 1 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Prong 1
                  </span>
                  <span className="text-xs font-bold text-emerald-600">Score: {caseData.dhanasar.prong1.nationalImportanceScore}/100</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{caseData.dhanasar.prong1.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {caseData.dhanasar.prong1.endeavorSummary}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">US Impact Initiatives</span>
                <div className="flex flex-wrap gap-1">
                  {caseData.dhanasar.prong1.usImpactAreas.map((area, idx) => (
                    <span key={idx} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Prong 2 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Prong 2
                  </span>
                  <span className="text-xs font-bold text-purple-600">{caseData.dhanasar.prong2.citationPercentile}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{caseData.dhanasar.prong2.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {caseData.dhanasar.prong2.educationTrack}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Key Achievements</span>
                <ul className="text-xs text-slate-700 space-y-1">
                  {caseData.dhanasar.prong2.keyAchievements.map((ach, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Prong 3 */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Prong 3
                  </span>
                  <span className="text-xs font-bold text-emerald-600">Urgency Demonstrated</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{caseData.dhanasar.prong3.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {caseData.dhanasar.prong3.uniqueExpertise}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">PERM Waiver Justification</span>
                <ul className="text-xs text-slate-700 space-y-1">
                  {caseData.dhanasar.prong3.urgencyArguments.map((arg, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{arg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    )}







      {/* Tab 3: Document Vault */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Exhibit Vault & Academic Verification</h3>
              <p className="text-xs text-slate-500 mt-0.5">Indexed exhibits attached to Form I-140 Petition</p>
            </div>
            <button
              onClick={openNewDocModal}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Exhibit</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Exhibit #</th>
                    <th className="px-4 py-3">Document Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">AI Intelligence Summary</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeCaseDocs.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                        {doc.exhibitNumber || 'Exhibit --'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {doc.name}
                        <div className="text-[10px] text-slate-400 font-normal">{doc.fileSize} • Uploaded by {doc.uploadedBy}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-sm leading-relaxed">
                        {doc.aiSummary}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards */}
            <div className="block md:hidden divide-y divide-slate-100">
              {activeCaseDocs.map(doc => (
                <div key={doc.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {doc.exhibitNumber || 'Exhibit --'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs mt-2 break-all">{doc.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{doc.fileSize} • {doc.uploadedAt}</p>
                    </div>
                    <StatusBadge status={doc.status} />
                  </div>

                  {doc.aiSummary && (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700 leading-snug">
                      {doc.aiSummary}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                      {doc.category}
                    </span>

                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Expert Recommenders */}
      {activeTab === 'recommenders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Expert Recommendation Letters Tracker</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage academic advisors, government scientists, and independent industry experts</p>
            </div>
            <button
              onClick={openNewRecommenderModal}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expert Recommender</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {caseData.recommenders.map(rec => (
              <div key={rec.id} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{rec.name}</h4>
                    <p className="text-xs text-slate-600 font-medium truncate">{rec.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{rec.organization}</p>
                  </div>
                  <StatusBadge status={rec.status} />
                </div>

                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="font-semibold block text-slate-700 mb-1">Relationship Type:</span>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                    {rec.relationship}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <span className="font-semibold block text-slate-700 text-[11px]">Key Arguments Mentioned:</span>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                    {rec.keyContributionsMentioned.map((item, idx) => (
                      <li key={idx} className="leading-tight">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Petition Builder & JurisAI */}
      {activeTab === 'builder' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Form I-140 Legal Memorandum Builder</h3>
                <p className="text-xs text-slate-500 mt-0.5">Compose and refine Dhanasar legal arguments with AI assistance</p>
              </div>
              <button
                onClick={openAIAssistant}
                className="w-full sm:w-auto px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>JurisAI Full Draft Generator</span>
              </button>
            </div>

            {/* Section 1 */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-800">Prong 1: Substantial Merit & National Importance Argument</label>
                <button 
                  onClick={() => handleAiRefineProng(1)}
                  disabled={isAiGenerating}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isAiGenerating ? 'Enhancing...' : 'Enhance with AI'}</span>
                </button>
              </div>
              <textarea
                value={prong1Draft}
                onChange={(e) => setProng1Draft(e.target.value)}
                rows={4}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-800">Prong 2: Well Positioned Candidate Record & Citations</label>
                <button 
                  onClick={() => handleAiRefineProng(2)}
                  disabled={isAiGenerating}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isAiGenerating ? 'Enhancing...' : 'Enhance with AI'}</span>
                </button>
              </div>
              <textarea
                value={prong2Draft}
                onChange={(e) => setProng2Draft(e.target.value)}
                rows={4}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-800">Prong 3: Balance of Factors & PERM Labor Waiver Justification</label>
                <button 
                  onClick={() => handleAiRefineProng(3)}
                  disabled={isAiGenerating}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{isAiGenerating ? 'Enhancing...' : 'Enhance with AI'}</span>
                </button>
              </div>
              <textarea
                value={prong3Draft}
                onChange={(e) => setProng3Draft(e.target.value)}
                rows={4}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Messages & Communication Log */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Threaded Case Discussion</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct communication between client and legal petition staff</p>
            </div>
          </div>

          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/30">
            {messages.map(m => (
              <div 
                key={m.id} 
                className={`p-3 rounded-lg max-w-[85%] sm:max-w-lg ${
                  m.senderRole === 'client' 
                    ? 'bg-white border border-slate-200 text-slate-800 mr-auto' 
                    : 'bg-blue-600 text-white ml-auto'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-80">
                  <span className="font-bold truncate">{m.senderName} ({m.senderRole})</span>
                  <span className="shrink-0">{m.timestamp}</span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder="Write message to client or legal team..."
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
