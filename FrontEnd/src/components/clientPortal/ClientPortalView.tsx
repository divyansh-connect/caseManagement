import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  MessageSquare,
  CreditCard,
  Download,
  Send,
  Sparkles,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  Calendar,
  Video,
  AlertCircle,
  FileCheck2,
  ListTodo,
  FolderOpen,
  HelpCircle,
  PackageCheck,
  Bell,
  Settings,
  Lock,
  ExternalLink,
  Check,
  User,
  Phone,
  Mail,
  Shield,
  Smartphone,
  ArrowRight,
  X
} from 'lucide-react';
import { CaseItem, CaseDocument, CaseMessage, CaseTask, AppointmentItem } from '../../types';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { WhatsAppModal } from '../communication/WhatsAppModal';

interface ClientPortalViewProps {
  caseData: CaseItem;
  documents: CaseDocument[];
  messages: CaseMessage[];
  appointments?: AppointmentItem[];
  openNewDocModal: () => void;
  openAppointmentModal?: () => void;
  openSignModal?: () => void;
  openQuestionnaireModal?: () => void;
  openResumeBuildingModal?: (caseItem: CaseItem) => void;
  activeNavTab?: string;
  onNavigateTab?: (tab: any) => void;
  commViewMode?: 'hub' | 'whatsapp';
  setCommViewMode?: (mode: 'hub' | 'whatsapp') => void;
}

export type ClientPortalTab =
  | 'overview'
  | 'tasks'
  | 'documents'
  | 'forms'
  | 'payments'
  | 'messages'
  | 'appointments'
  | 'postFiling'
  | 'settings';

const NAV_TO_PORTAL_TAB: Record<string, ClientPortalTab> = {
  clientPortal: 'overview',
  tasks: 'tasks',
  documents: 'documents',
  forms: 'forms',
  payments: 'payments',
  communication: 'messages',
  appointments: 'appointments',
  postFiling: 'postFiling',
  settings: 'settings',
};

const PORTAL_TO_NAV_TAB: Record<ClientPortalTab, string> = {
  overview: 'clientPortal',
  tasks: 'tasks',
  documents: 'documents',
  forms: 'forms',
  payments: 'payments',
  messages: 'communication',
  appointments: 'appointments',
  postFiling: 'postFiling',
  settings: 'settings',
};

// ── 6 CLIENT-FRIENDLY CASE STAGES ──────────────────────────────────────────────
export interface ClientStageGroup {
  id: number;
  title: string;
  subtitle: string;
  isOptional?: boolean;
  internalStages: number[];
  tasks: {
    id: string;
    name: string;
    assignedTo: 'Client' | 'Babel Global Team';
    status: 'Not Started' | 'Awaiting Client' | 'Submitted' | 'Under Review' | 'Revision Required' | 'Approved/Completed' | 'Not Applicable';
    flowLabel?: string;
    deadline?: string;
  }[];
}

const CLIENT_STAGES: ClientStageGroup[] = [
  {
    id: 1,
    title: 'Stage 1: Consultation and Onboarding',
    subtitle: 'Profile assessment, engagement agreement, flexible payment & document collection',
    internalStages: [1, 2, 3, 4, 5],
    tasks: [
      { id: 'st1-1', name: 'Initial consultation/intake', assignedTo: 'Client', status: 'Approved/Completed' },
      { id: 'st1-2', name: 'Upload existing CV: [Preliminary profile assessment]', assignedTo: 'Client', status: 'Approved/Completed' },
      { id: 'st1-3', name: 'Review and sign the engagement agreement', assignedTo: 'Client', status: 'Approved/Completed' },
      { id: 'st1-4a', name: 'Select a payment plan and make payment', flowLabel: 'Standard Flow: Payment before documentation', assignedTo: 'Client', status: 'Approved/Completed' },
      { id: 'st1-5', name: 'Documentation: [Upload supporting documents, Identify missing documents & Resume/CV, preparation or improvement, when required, Documentation and Qualification Review, categorize academic, employment, publication, award, membership, media, citation, judging, contribution, and other records, Approve the evidence checklist for drafting]', assignedTo: 'Client', status: 'Approved/Completed' },
      { id: 'st1-4b', name: 'Select a payment plan and make payment', flowLabel: 'Flexible Flow: Payment after evidence assessment & profile improvement', assignedTo: 'Client', status: 'Not Applicable' }
    ]
  },
  {
    id: 2,
    title: 'Stage 2: Case Strategy & Recommendation Letters',
    subtitle: 'Proposed endeavor development & expert recommender letters',
    internalStages: [6, 7, 8],
    tasks: [
      { id: 'st2-1', name: 'Review or develop the proposed endeavor: [Send the proposed endeavor to the client for review, correction, and approval]', assignedTo: 'Client', status: 'Approved/Completed' },
      { id: 'st2-2', name: 'Identify suitable recommenders: [Provide the client with the recommended categories of people who should write letters, Client provides each recommender’s CV, relationship information, and relevant accomplishments]', assignedTo: 'Client', status: 'Awaiting Client', deadline: 'Mar 10, 2026' },
      { id: 'st2-3', name: 'Draft recommendation letters', assignedTo: 'Babel Global Team', status: 'Under Review' },
      { id: 'st2-4', name: 'Client reviews the letters and sends them to the recommenders', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st2-5', name: 'Client uploads the signed letters on official letterhead', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st2-6', name: 'Staff reviews and approves the completed letters', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  },
  {
    id: 3,
    title: 'Stage 3: Forms Preparation',
    subtitle: 'USCIS questionnaires & official form packages (I-140, ETA-9089, G-1145)',
    internalStages: [9],
    tasks: [
      { id: 'st3-1', name: 'Client completes a simplified questionnaire', assignedTo: 'Client', status: 'Approved/Completed' },
      { id: 'st3-2', name: 'Information is transferred to the applicable forms', assignedTo: 'Babel Global Team', status: 'Approved/Completed' },
      { id: 'st3-3', name: 'Staff reviews the information', assignedTo: 'Babel Global Team', status: 'Under Review' },
      { id: 'st3-4', name: 'Client makes corrections or provides missing details', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st3-5', name: 'Client reviews and signs the completed forms where required with blue ink', assignedTo: 'Client', status: 'Not Started' }
    ]
  },
  {
    id: 4,
    title: 'Stage 4: Petition Drafting & Review',
    subtitle: 'Legal petition memorandum drafting under Dhanasar 3-Prong framework',
    internalStages: [9, 10, 11, 12],
    tasks: [
      { id: 'st4-1', name: 'Assign petition to Senior Drafter', assignedTo: 'Babel Global Team', status: 'Approved/Completed' },
      { id: 'st4-2', name: 'Draft Petition Memorandum (Dhanasar Prongs 1, 2, 3)', assignedTo: 'Babel Global Team', status: 'Under Review', deadline: 'Mar 15, 2026' },
      { id: 'st4-3', name: 'Senior QA Reviewer', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st4-4', name: 'Provide draft to client for factual review & approval', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st4-5', name: 'Final revisions & petition approval for packaging', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  },
  {
    id: 5,
    title: 'Stage 5: Final Package Preparation',
    subtitle: 'Completed forms, petition letter, exhibit index & supporting exhibits',
    internalStages: [13],
    tasks: [
      { id: 'st5-0', name: 'Pay Outstanding Service Balance', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st5-1', name: 'Organize final package: Completed and signed forms, Petition letter, Exhibit index, and Supporting exhibits in PDF', assignedTo: 'Babel Global Team', status: 'Not Started' },
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
    internalStages: [14],
    tasks: [
      { id: 'st6-1', name: 'Track your package: We will provide the courier tracking number so you can confirm when USCIS receives your package. Could take 2–5 days. Timeline depends on the post office and other conditions.', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st6-2', name: 'Wait for USCIS to review the package: USCIS will check whether the package contains the required forms, signatures, and filing fees. Could take 2 weeks or more depending on workload.', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st6-3', name: 'Watch for the payment: If USCIS accepts the package for processing, the filing fees will normally be charged to the payment method you authorized.', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st6-4', name: 'Look out for an email or text: If Form G-1145 was included, USCIS may send you an email and/or text confirming that the package was accepted.', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st6-5', name: 'Wait for your receipt notice: USCIS will mail Form I-797, Notice of Action. It will contain your receipt number and priority date. Please upload the notice to your portal when you receive it. Could take 2 weeks to 2 months or more depending on the post office.', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st6-6', name: 'Track your case: Once you receive your receipt number, you can check your case at USCIS Case Status Online.', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st6-7', name: 'If your package is returned: This generally means USCIS could not accept the filing because something needs to be corrected. Please upload or send us the rejection notice and returned package so we can review the reason and advise you on the next step. Could take 2 weeks to 2 months or more depending on the post office to receive it.', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st6-8', name: 'Continue checking for updates: USCIS may later send an approval notice, Request for Evidence, Notice of Intent to Deny, or another communication. Please upload every USCIS notice to your portal as soon as you receive it.', assignedTo: 'Client', status: 'Not Started' }
    ]
  },
  {
    id: 7,
    title: 'Optional Add-On: Concurrent Form I-485 Filing',
    subtitle: 'Activated only for clients who purchase concurrent filing service',
    isOptional: true,
    internalStages: [],
    tasks: [
      { id: 'opt-1', name: 'Additional-service agreement and payment', assignedTo: 'Client', status: 'Not Started' },
      { id: 'opt-2', name: 'Form I-485 questionnaire and applicable forms', assignedTo: 'Client', status: 'Not Started' },
      { id: 'opt-3', name: 'Supporting-document checklist', assignedTo: 'Client', status: 'Not Started' },
      { id: 'opt-4', name: 'Review and corrections', assignedTo: 'Client', status: 'Not Started' },
      { id: 'opt-5', name: 'Signatures', assignedTo: 'Client', status: 'Not Started' },
      { id: 'opt-6', name: 'Exhibits', assignedTo: 'Client', status: 'Not Started' },
      { id: 'opt-7', name: 'Final package preparation', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  }
];

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  caseData,
  documents,
  messages: initialMessages,
  appointments = [],
  openNewDocModal,
  openAppointmentModal,
  openSignModal,
  openQuestionnaireModal,
  openResumeBuildingModal,
  activeNavTab,
  onNavigateTab,
  commViewMode = 'whatsapp',
  setCommViewMode
}) => {
  const currentTab = activeNavTab ? (NAV_TO_PORTAL_TAB[activeNavTab] || 'overview') : 'overview';
  const [internalTab, setInternalTab] = useState<ClientPortalTab>(currentTab);

  const activeTab = activeNavTab ? currentTab : internalTab;

  const handleTabChange = (tab: ClientPortalTab) => {
    setInternalTab(tab);
    if (onNavigateTab) {
      onNavigateTab(PORTAL_TO_NAV_TAB[tab]);
    }
  };
  const [expandedStage, setExpandedStage] = useState<number>(2); // Default open to current stage 2
  const [stage1FlowMode, setStage1FlowMode] = useState<'standard' | 'evidence_first'>('standard');
  const [activeChannelModal, setActiveChannelModal] = useState<'email' | 'sms' | 'whatsapp' | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>(() => {
    return caseData ? initialMessages.filter(m => m.caseId === caseData.id) : [];
  });
  const [newMsg, setNewMsg] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !caseData) return;

    const msg: CaseMessage = {
      id: `msg-${Date.now()}`,
      caseId: caseData.id,
      senderName: caseData.clientName,
      senderRole: 'client',
      content: newMsg,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setMessages([...messages, msg]);
    setNewMsg('');
  };

  // Dynamic Next Action Calculation
  let nextActionTask: any = null;
  for (const stage of CLIENT_STAGES) {
    if (stage.isOptional) continue;
    const pendingClientTask = stage.tasks.find(
      (t) => t.assignedTo === 'Client' && (t.status === 'Not Started' || t.status === 'Awaiting Client' || t.status === 'Revision Required')
    );
    if (pendingClientTask) {
      nextActionTask = { stageId: stage.id, ...pendingClientTask };
      break;
    }
  }

  if (!nextActionTask) {
    nextActionTask = {
      stageId: 2,
      id: 'fallback',
      name: 'All caught up! No pending actions.',
      assignedTo: 'Client',
      status: 'Approved/Completed',
      deadline: 'N/A'
    };
  }

  let dynamicDescription = `Action required: ${nextActionTask.name}. Please click the button to complete this task.`;
  if (nextActionTask.name.includes('suitable recommenders')) {
    dynamicDescription = 'Please provide the names, institutional details, and CVs of 3 to 5 expert recommenders who can attest to your proposed endeavor.';
  } else if (nextActionTask.name.includes('proposed endeavor')) {
    dynamicDescription = 'Please review, correct, and approve the proposed endeavor statement we have provided.';
  }

  const clientDocs = caseData ? documents.filter(d => d.caseId === caseData.id) : [];

  const [fetchedCase, setFetchedCase] = useState<CaseItem | null>(null);

  React.useEffect(() => {
    if (!caseData && !fetchedCase) {
      api.get('/cases/my-case').then(res => {
        if (res.success && res.data) {
          setFetchedCase({
            ...res.data,
            clientName: res.data.client?.name || 'Client Candidate',
            clientEmail: res.data.client?.email || '',
            dhanasar: res.data.dhanasarProngs || { prong1: {}, prong2: {}, prong3: {} },
            recommenders: res.data.recommenders || [],
            documentsCount: res.data.documents?.length || 0,
            notes: res.data.notes || '',
            lastUpdated: res.data.lastUpdated ? res.data.lastUpdated.substring(0, 16).replace('T', ' ') : ''
          });
        }
      }).catch(err => console.error('Error fetching fallback case in ClientPortalView:', err));
    }
  }, [caseData, fetchedCase]);

  const activeCase = caseData || fetchedCase;

  if (!activeCase) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="space-y-1">
            <p className="text-slate-800 font-bold text-sm">Loading your case profile...</p>
            <p className="text-slate-500 text-xs">Fetching latest petition status & document records</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Refresh Case Profile
          </button>
        </div>
      </div>
    );
  }

  // Status badge styling helper
  const getStatusBadge = (status: ClientStageGroup['tasks'][0]['status']) => {
    switch (status) {
      case 'Approved/Completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1"><Check className="w-3 h-3" /> Approved/Completed</span>;
      case 'Awaiting Client':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1"><Clock className="w-3 h-3 text-amber-600" /> Awaiting Client Action</span>;
      case 'Under Review':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1"><Sparkles className="w-3 h-3 text-blue-600" /> Under Review</span>;
      case 'Submitted':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">Submitted</span>;
      case 'Revision Required':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">Revision Required</span>;
      case 'Not Applicable':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">Not Applicable</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">Not Started</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1: CASE OVERVIEW & HOMEPAGE (One-Action-at-a-Time Design)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* 1. Combined Compact Case Overview Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                  Case Overview
                </span>
                <h1 className="text-xl font-bold text-slate-900 mt-3 tracking-tight">
                  {activeCase.clientName}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Filing: <strong className="text-slate-800">{activeCase.petitionCategory || 'EB-2 NIW'}</strong>
                  <span className="mx-2 text-slate-300">|</span>
                  Field: <strong className="text-blue-700">{activeCase.fieldCategory}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Petition Drafter:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${activeCase.assignedWriter ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <span className={`font-bold ${activeCase.assignedWriter ? 'text-blue-700' : 'text-red-600'}`}>
                      {activeCase.assignedWriter || 'Not Assigned'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Reviewer:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${activeCase.assignedReviewer ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <span className={`font-bold ${activeCase.assignedReviewer ? 'text-blue-700' : 'text-red-600'}`}>
                      {activeCase.assignedReviewer || 'Not Assigned'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Current Case Stage</span>
                <span className="text-sm font-extrabold text-slate-800">
                  Stage 2: Strategy &amp; Recommenders
                </span>
              </div>

              {openAppointmentModal && (
                <button
                  onClick={openAppointmentModal}
                  className="px-5 py-3 h-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              )}
            </div>
          </div>

          {/* Dedicated Resume Building Banner */}
          {activeCase.petitionCategory === 'Resume Building' && (
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-emerald-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-800/80 rounded-xl text-emerald-300 shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-emerald-200">Resume Building Action Required</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Upload your documents for candidate profile creation & resume building.</p>
                </div>
              </div>
              {openResumeBuildingModal && (
                <button
                  onClick={() => openResumeBuildingModal(activeCase)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-md transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Resume Documents</span>
                </button>
              )}
            </div>
          )}

          {/* 2. PROMINENT "YOUR NEXT ACTION" CARD (One-Action-at-a-Time) */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider animate-pulse">
                    ⭐ Your Next Action Required
                  </span>
                  <span className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Due: {nextActionTask.deadline || 'Pending assignment'}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {nextActionTask.name}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  {dynamicDescription}
                </p>
              </div>

              <button
                onClick={() => {
                  if (nextActionTask.name.includes('Upload') || nextActionTask.name.includes('CV')) openNewDocModal();
                  else {
                    handleTabChange('tasks');
                    setExpandedStage(nextActionTask.stageId);
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all"
              >
                <span>{nextActionTask.name.includes('CV') || nextActionTask.name.includes('Upload') ? 'Upload Documents' : 'Complete Task'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>Overall Petition Progress: <strong className="text-slate-800">35% Completed</strong></span>
              <button
                onClick={() => handleTabChange('tasks')}
                className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                View All Pending Tasks <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Overall Case Progress Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">6-Stage Petition Progress Tracker</h3>
                <p className="text-xs text-slate-500">System automatically moves to next stage upon task completion</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                Currently in Stage 2 of 6
              </span>
            </div>

            {/* 6 Stage Horizontal Bar */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {CLIENT_STAGES.filter(st => !st.isOptional).map((st) => {
                const isCompleted = st.id < 2;
                const isCurrent = st.id === 2;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      handleTabChange('tasks');
                      setExpandedStage(st.id);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${isCompleted
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : isCurrent
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-300'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                  >
                    <div className="text-[10px] uppercase font-bold tracking-wider mb-1">
                      {isCompleted ? '✓ Completed' : isCurrent ? 'Active Stage' : 'Locked'}
                    </div>
                    <div className="font-bold text-xs truncate">{st.title.split(':')[1] || st.title}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Recent Notification & Next Appointment Quick Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Important Recent Notification</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">Proposed Endeavor Statement Approved</p>
                <p className="text-xs text-slate-500 mt-1">Your petition writer finalized your national importance endeavor draft on Mar 1, 2026.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Next Scheduled Appointment</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">Recommender Strategy Call</p>
                  <p className="text-xs text-slate-500 mt-1">Scheduled for Mar 8, 2026 at 2:00 PM EST</p>
                </div>
              </div>
              {openAppointmentModal && (
                <button
                  onClick={openAppointmentModal}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Reschedule
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2: MY TASKS (Current & Grouped 6-Stage View)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'tasks' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Action Items &amp; Case Stages</h2>
              <p className="text-xs text-slate-500">Tasks are automatically assigned. Completed stages are collapsed.</p>
            </div>
          </div>

          <div className="space-y-4">
            {CLIENT_STAGES.map((stageGroup) => {
              const isExpanded = expandedStage === stageGroup.id;
              const isCompleted = stageGroup.id < 2;
              const isCurrent = stageGroup.id === 2;
              const isLocked = stageGroup.id > 2;

              return (
                <div
                  key={stageGroup.id}
                  className={`bg-white rounded-2xl border overflow-hidden transition-all ${isCurrent
                      ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm'
                      : 'border-slate-200'
                    }`}
                >
                  {/* Stage Accordion Header */}
                  <div
                    onClick={() => setExpandedStage(isExpanded ? 0 : stageGroup.id)}
                    className="p-5 flex items-center justify-between cursor-pointer bg-slate-50/80 hover:bg-slate-100/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                        {isCompleted ? '✓' : stageGroup.id}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm">{stageGroup.title}</h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                              Active Stage
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              Completed
                            </span>
                          )}
                          {isLocked && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-400 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{stageGroup.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end mr-2">
                        <span className="text-xs font-bold text-slate-800">
                          {Math.round((stageGroup.tasks.filter(t => t.status === 'Approved/Completed').length / stageGroup.tasks.length) * 100)}% Completed
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {stageGroup.tasks.filter(t => t.status === 'Approved/Completed').length} / {stageGroup.tasks.length} Tasks
                        </span>
                      </div>
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Stage Tasks List */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 divide-y divide-slate-100 space-y-3">
                      {stageGroup.id === 1 && (
                        <div className="mb-4 space-y-3">
                          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300/80 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-bold text-amber-950 block">Flexibility &amp; Custom Workflow Policy:</span>
                              <p className="text-[11.5px] leading-relaxed text-amber-800">
                                The order must be flexible. Some clients may need to upload their evidence first so we can prepare or improve their profile before completing the agreement and main payment. <strong className="text-amber-950 font-bold">For standard cases</strong>, payment is made first before uploading the required documents.
                              </p>
                            </div>
                          </div>

                          {/* Interactive Flow Switch Buttons */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                              <span>Switch Case Onboarding Workflow Mode:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStage1FlowMode('standard');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${stage1FlowMode === 'standard'
                                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                  }`}
                              >
                                Standard Flow (Payment First)
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStage1FlowMode('evidence_first');
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${stage1FlowMode === 'evidence_first'
                                    ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-300'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                  }`}
                              >
                                Evidence-First Flow (Upload Evidence First)
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {stageGroup.id === 6 && (
                        <div className="mb-4 space-y-3">
                          {/* Approved Notification Channels Dispatch Bar */}
                          <div className="p-3.5 rounded-xl bg-blue-50/90 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <Send className="w-4 h-4 text-blue-600 shrink-0" />
                              <div>
                                <span className="font-bold block text-blue-950">Post-Filing Notification Active</span>
                                <span className="text-[11px] text-slate-600">Guidance dispatched to client's approved notification channels immediately upon filing:</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveChannelModal('email');
                                }}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200 hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Click to view & dispatch Email notice"
                              >
                                ✉️ Email
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveChannelModal('sms');
                                }}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200 hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Click to view & dispatch SMS alert"
                              >
                                💬 SMS
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveChannelModal('whatsapp');
                                }}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 hover:scale-105 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                                title="Click to open WhatsApp live chat hub"
                              >
                                📱 WhatsApp
                              </button>
                            </div>
                          </div>

                          {/* Variable Timeline Warning Banner */}
                          <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300/80 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <span className="font-bold text-amber-950 block">⚠️ Variable Processing &amp; Mailing Timelines:</span>
                              <p className="text-[11.5px] leading-relaxed text-amber-800">
                                Processing and mailing times vary based on USCIS workload and postal conditions. The system does not promise a fixed response date. Please upload every USCIS notice to your portal as soon as you receive it.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {(
                        stageGroup.id === 1 ? (
                          stage1FlowMode === 'standard' ? stageGroup.tasks : [
                            { id: 'st1-1', name: 'Initial consultation/intake', assignedTo: 'Client', status: 'Approved/Completed' },
                            { id: 'st1-2', name: 'Upload existing CV: [Preliminary profile assessment]', assignedTo: 'Client', status: 'Approved/Completed' },
                            { id: 'st1-3', name: 'Review and sign the engagement agreement', assignedTo: 'Client', status: 'Approved/Completed' },
                            { id: 'st1-4a', name: 'Select a payment plan and make payment', flowLabel: 'Standard Flow: Skipped in Evidence-First mode', assignedTo: 'Client', status: 'Not Applicable' },
                            { id: 'st1-5', name: 'Documentation: [Upload supporting documents & CV to prepare/improve profile first before main payment]', flowLabel: 'Active First Step: Upload Evidence', assignedTo: 'Client', status: 'Awaiting Client' },
                            { id: 'st1-4b', name: 'Select a payment plan and make payment', flowLabel: 'Flexible Flow: Complete payment after profile evaluation', assignedTo: 'Client', status: 'Not Started' }
                          ]
                        ) : stageGroup.tasks
                      ).map((task) => (
                        <div key={task.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-slate-800">{task.name}</span>
                              {task.flowLabel && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300">
                                  {task.flowLabel}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.assignedTo === 'Client'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-slate-100 text-slate-600'
                                }`}>
                                Assigned to: {task.assignedTo}
                              </span>
                            </div>
                            {task.deadline && (
                              <p className="text-[11px] text-amber-700 font-medium">Target Deadline: {task.deadline}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {getStatusBadge(task.status)}
                            {task.status === 'Awaiting Client' && (
                              <button
                                onClick={openNewDocModal}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg cursor-pointer transition-colors"
                              >
                                Action Now
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 3: DOCUMENTS (Uploads & Exhibit Vault)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-slate-800 text-base">Your Exhibits &amp; Uploaded Evidence</h2>
              <p className="text-xs text-slate-500">Track uploaded degree certificates, publications, awards &amp; recommendation letters</p>
            </div>
            <button
              onClick={openNewDocModal}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Upload New Document</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {clientDocs.map(doc => (
              <div key={doc.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-800 truncate">{doc.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{doc.category} • {doc.fileSize} • Uploaded {doc.uploadedAt}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {doc.status}
                  </span>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '#';
                      link.setAttribute('download', `${doc.name.replace(/\s+/g, '_')}`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 4: FORMS (USCIS Questionnaires & Checklists)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'forms' && (
        <div className="space-y-6">
          {/* Intake Questionnaire Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">USCIS Form Information Questionnaire</h3>
                <p className="text-xs text-slate-500">Biographical, work history &amp; immigration background data</p>
              </div>

              {openQuestionnaireModal && (
                <button
                  onClick={openQuestionnaireModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>View / Edit Questionnaire</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Legal Name</span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">{caseData.clientName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">A-Number</span>
                <span className="font-mono font-bold text-slate-800 truncate block mt-0.5">A-098-214-389</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Visa Status</span>
                <span className="font-bold text-blue-700 truncate block mt-0.5">O-1A Nonimmigrant</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Form Progress</span>
                <span className="font-bold text-emerald-600 truncate block mt-0.5">100% Completed</span>
              </div>
            </div>
          </div>

          {/* NIW Form Package Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Required Form Package Checklist for EB-2 NIW</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Form I-140</span>
                  <span className="text-[11px] text-slate-500">Immigrant Petition for Alien Workers</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Prepared</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Form G-1145</span>
                  <span className="text-[11px] text-slate-500">E-Notification of Application/Petition Acceptance</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Prepared</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Form G-1650 / G-1450</span>
                  <span className="text-[11px] text-slate-500">ACH or Credit Card Authorization (Complete applicable)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Prepared</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Form I-907 (Optional)</span>
                  <span className="text-[11px] text-slate-500">Request for Premium Processing Service</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Not Started</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Form ETA 9089</span>
                  <span className="text-[11px] text-slate-500">Application for Permanent Employment Certification</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Prepared</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">ETA Form 9089, Appendix A</span>
                  <span className="text-[11px] text-slate-500">Required for NIW</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Pending Blue Ink Signature</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">ETA Form 9089, Appendix C</span>
                  <span className="text-[11px] text-slate-500">Only when additional space is required</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Not Applicable</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">ETA Form 9089 Final Determination</span>
                  <span className="text-[11px] text-slate-500">Includes required signature in Page 2, Section B</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Pending Blue Ink Signature</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 5: AGREEMENT & PAYMENTS
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Service Agreement Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Service Agreement &amp; E-Signatures</h3>
                <p className="text-xs text-slate-500">Scope of engagement contract &amp; electronic signatures</p>
              </div>

              {openSignModal && (
                <button
                  onClick={openSignModal}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Review &amp; Sign Agreement</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 block text-sm">Babel Global Service Agreement</span>
                <span className="text-slate-500">Executed on Jan 10, 2026 • SHA256 Encryption Signed</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Executed
              </span>
            </div>
          </div>

          {/* Payment Plan & History */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Payment Plan &amp; Milestones</h3>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Initial Retainer Deposit</span>
                  <span className="text-slate-400">Paid Jan 10, 2026</span>
                </div>
                <span className="font-bold text-emerald-600">$4,000.00 (Paid)</span>
              </div>
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Milestone 2: Petition Draft</span>
                  <span className="text-slate-400">Due upon recommendation letter completion</span>
                </div>
                <span className="font-bold text-slate-800">$3,500.00 (Pending)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 6: MESSAGES & WHATSAPP
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Direct Messaging &amp; Live Chat</h3>
              <p className="text-xs text-slate-500">Communicating with your assigned petition drafter &amp; attorney</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCommViewMode?.('whatsapp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${commViewMode === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>WhatsApp Live Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setCommViewMode?.('hub')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${commViewMode === 'hub'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Messaging Hub Logs</span>
              </button>
            </div>
          </div>

          {commViewMode === 'whatsapp' ? (
            <WhatsAppModal
              isOpen={true}
              isFullPage={true}
              onClose={() => setCommViewMode?.('hub')}
              defaultClientName={caseData.clientName}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[500px] overflow-hidden">
              <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-sm flex items-center justify-between bg-slate-50">
                <span>Messaging Hub Conversation History</span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Editorial Team Sync
                </span>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl max-w-md ${m.senderRole === 'client'
                        ? 'bg-blue-600 text-white ml-auto shadow-sm'
                        : 'bg-white text-slate-800 mr-auto border border-slate-200 shadow-xs'
                      }`}
                  >
                    <div className="text-[10px] opacity-75 mb-1 font-bold">{m.senderName} • {m.timestamp}</div>
                    <p className="text-xs leading-relaxed">{m.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center gap-3 bg-white">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Ask your attorney or petition writer a question..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 7: APPOINTMENTS
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-slate-800 text-base">Strategy Calls &amp; Consultations</h2>
              <p className="text-xs text-slate-500">Book 1-on-1 strategy sessions with your petition drafter or senior reviewer</p>
            </div>
            {openAppointmentModal && (
              <button
                onClick={openAppointmentModal}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Book Strategy Call</span>
              </button>
            )}
          </div>

          {appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((app) => (
                <div key={app.id} className="p-5 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {app.status || 'Upcoming Session'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        Specialist: {app.specialist}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{app.type}</h4>
                    <p className="text-slate-600 font-medium">📅 {app.date} at {app.time} ({app.duration || '45 mins'})</p>
                    {app.notes && (
                      <p className="text-[11px] text-slate-500 italic mt-1">Note: {app.notes}</p>
                    )}
                  </div>
                  <a
                    href={app.meetingUrl || 'https://meet.google.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto text-center shrink-0"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Google Meet</span>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">Upcoming Session</span>
                <h4 className="font-bold text-slate-900 text-sm">Recommender Strategy &amp; Endeavor Review Call</h4>
                <p className="text-slate-600">March 8, 2026 at 2:00 PM EST (Google Meet)</p>
              </div>
              <a
                href="https://meet.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white text-blue-700 font-bold border border-blue-200 rounded-xl hover:bg-blue-50 cursor-pointer inline-flex items-center gap-1.5 shrink-0"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Join Call</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 8: POST-FILING UPDATES (Stage 6 Guidance)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'postFiling' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Stage 6: Guidance &amp; Timeline
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-2">
              Your Petition Has Been Filed &mdash; What Happens Next?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your petition package is shipped to USCIS. Here is what to expect during processing:
            </p>
          </div>

          {/* Live Case Info Banner — data from backend */}
          {caseData && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs space-y-2">
              <p className="font-bold text-blue-800 text-sm mb-2">📋 Your Case Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Case Number</p>
                  <p className="font-bold text-slate-800 mt-0.5">{caseData.caseNumber || '—'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Petition Type</p>
                  <p className="font-bold text-slate-800 mt-0.5">{caseData.petitionCategory || '—'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">USCIS Service Center</p>
                  <p className="font-bold text-slate-800 mt-0.5">{caseData.uscisServiceCenter || '—'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Target Filing Date</p>
                  <p className="font-bold text-slate-800 mt-0.5">{caseData.targetFilingDate || '—'}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  (caseData.currentStage || 0) >= 14
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : (caseData.currentStage || 0) >= 10
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {(caseData.currentStage || 0) >= 14
                    ? '✓ Filed — Post-Filing Phase'
                    : `Internal Stage ${caseData.currentStage || 1} of 14`}
                </span>
                {caseData.premiumProcessing && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    ⚡ Premium Processing
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { num: '1', title: 'Track your package', desc: 'We will provide courier tracking number so you can confirm delivery (2–5 days).' },
              { num: '2', title: 'Wait for USCIS review', desc: 'USCIS checks signatures, forms & filing fees (2+ weeks).' },
              { num: '3', title: 'Watch for fee payment', desc: 'Authorized filing fees will normally be charged once accepted.' },
              { num: '4', title: 'Look for email / SMS', desc: 'Form G-1145 confirmation message from USCIS.' },
              { num: '5', title: 'Form I-797 Receipt Notice', desc: 'USCIS mails receipt number & priority date notice. Upload to portal when received.' },
              { num: '6', title: 'Track case online', desc: 'Check status anytime on official USCIS Case Status Online tool.' },
              { num: '7', title: 'If package returned', desc: 'Upload rejection notice immediately so we can correct & re-file.' },
              { num: '8', title: 'Continue checking updates', desc: 'Upload every USCIS notice (Approval, RFE, NOID) to your portal immediately.' }
            ].map((step) => (
              <div key={step.num} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">{step.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* USCIS Online Case Status Link */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-800 text-xs">Check Your USCIS Case Status Online</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Once you receive your I-797 receipt number, track it at the official USCIS portal.
                {caseData?.uscisServiceCenter && (
                  <span className="ml-1 text-blue-600 font-semibold">({caseData.uscisServiceCenter})</span>
                )}
              </p>
            </div>
            <a
              href="https://egov.uscis.gov/casestatus/landing.do"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              USCIS Portal
            </a>
          </div>
        </div>
      )}


      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 9: PROFILE & SETTINGS
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Full Name</label>
                <input type="text" readOnly value={caseData.clientName} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium" />
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
                <input type="email" readOnly value={caseData.clientEmail} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium" />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Notification &amp; Communication Preferences</h3>
            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 cursor-pointer" />
                <div>
                  <span className="font-bold text-slate-800 block">WhatsApp Updates &amp; Reminders</span>
                  <span className="text-slate-500 text-[11px]">Receive direct milestone &amp; task updates on WhatsApp</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 cursor-pointer" />
                <div>
                  <span className="font-bold text-slate-800 block">Email Digest</span>
                  <span className="text-slate-500 text-[11px]">Formal exhibit review requests and draft delivery notifications</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Communication Modals */}
      {activeChannelModal === 'email' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Mail className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-sm">Post-Filing Email Dispatch Notice</h3>
              </div>
              <button onClick={() => setActiveChannelModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700">
              <p><strong>To:</strong> {caseData.clientEmail} ({caseData.clientName})</p>
              <p><strong>Subject:</strong> Stage 6: Your Petition Has Been Filed — What Happens Next?</p>
              <p><strong>Gateway Status:</strong> <span className="text-emerald-700 font-bold">✓ Delivered via Babel Email Gateway</span></p>
              <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <p className="font-bold text-slate-800">Dispatched Guidance Preview:</p>
                <p className="bg-white p-3 rounded-lg border border-slate-200 leading-relaxed text-slate-700">
                  Dear {caseData.clientName}, your petition package has been shipped to USCIS! Check Stage 6 in your client portal for courier tracking numbers, Form I-797 receipt notice instructions, and step-by-step guidance.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  alert(`Post-Filing Stage 6 Email notice re-sent to ${caseData.clientEmail}!`);
                  setActiveChannelModal(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Resend Email Notice
              </button>
              <button
                onClick={() => setActiveChannelModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeChannelModal === 'sms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-700">
                <Smartphone className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-sm">Post-Filing SMS Gateway Dispatch</h3>
              </div>
              <button onClick={() => setActiveChannelModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs bg-purple-50/70 p-4 rounded-xl border border-purple-200 text-purple-950">
              <p><strong>Recipient Phone:</strong> +1 (555) 382-9102</p>
              <p><strong>SMS Status:</strong> <span className="text-emerald-700 font-bold">✓ Sent &amp; Delivered</span></p>
              <div className="mt-3 pt-3 border-t border-purple-200 text-[11.5px] text-purple-900 space-y-1">
                <p className="font-bold">SMS Text Content:</p>
                <p className="bg-white p-3 rounded-lg border border-purple-200 font-mono text-[11px] text-purple-950 leading-relaxed">
                  "Babel Global Alert: Your EB-2 NIW petition has been shipped to USCIS! Check Stage 6 in your client portal to track courier status &amp; receipt notice instructions."
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  alert('SMS Alert successfully re-sent to client phone!');
                  setActiveChannelModal(null);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Resend SMS Alert
              </button>
              <button
                onClick={() => setActiveChannelModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeChannelModal === 'whatsapp' && (
        <WhatsAppModal
          isOpen={true}
          isFullPage={false}
          defaultClientName={caseData.clientName}
          onClose={() => setActiveChannelModal(null)}
        />
      )}

    </div>
  );
};
