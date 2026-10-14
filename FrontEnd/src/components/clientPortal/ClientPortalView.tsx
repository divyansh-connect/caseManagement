import React, { useState, useEffect, useRef } from 'react';
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
  Save,
  Key,
  Loader2,
  X,
  PenTool,
  Paperclip,
  Eye,
  Maximize2,
  Play,
  Pause
} from 'lucide-react';
import { CaseItem, CaseDocument, CaseMessage, CaseTask, UserRole } from '../../types';
import { downloadDocumentFile } from '../../utils/downloadHelper';
import { getTaskMatchingDocuments } from '../../utils/documentTaskMatcher';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { DocumentPreviewModal } from '../modals/DocumentPreviewModal';
import { WhatsAppModal } from '../communication/WhatsAppModal';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const compressImageToDataUrl = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target?.result as string);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

interface ParsedPortalAttachment {
  type: 'image' | 'document' | 'audio' | 'none';
  fileName?: string;
  fileSize?: string;
  dataUrl?: string;
  duration?: string;
  cleanText: string;
}

function parsePortalMessageAttachments(rawContent: string, rawAttachments?: string[]): ParsedPortalAttachment {
  let cleanText = (rawContent || '').replace(/^\[WA\]\s*/i, '').replace(/^\[wa\]:\s*/i, '').trim();
  let type: 'image' | 'document' | 'audio' | 'none' = 'none';
  let fileName = '';
  let fileSize = '';
  let dataUrl = '';
  let duration = '';

  const audioMatch = cleanText.match(/\[AUDIO:(.*?)\]/);
  if (audioMatch) {
    type = 'audio';
    dataUrl = audioMatch[1];
    cleanText = cleanText.replace(/\[AUDIO:.*?\]/, '').trim();
    const durMatch = cleanText.match(/🎤\s*\[Voice Note\]\s*\((.*?)\)/i) || cleanText.match(/\((0:[0-9]{2})\)/);
    if (durMatch) duration = durMatch[1];
    cleanText = cleanText.replace(/🎤\s*\[Voice Note\]\s*\(.*?\)/i, '').trim();
    return { type, dataUrl, duration: duration || '0:05', cleanText };
  }

  const photoMatch = cleanText.match(/📷\s*\[Photo:\s*(.*?)\]/i) || cleanText.match(/\[Photo:\s*(.*?)\]/i);
  const dataMatch = cleanText.match(/\[DATA:(.*?)\]/);
  if (dataMatch) {
    dataUrl = dataMatch[1];
    cleanText = cleanText.replace(/\[DATA:.*?\]/, '').trim();
  }

  if (photoMatch || (dataUrl && dataUrl.startsWith('data:image/'))) {
    type = 'image';
    fileName = photoMatch ? photoMatch[1] : 'Photo.jpg';
    cleanText = cleanText.replace(/📷\s*\[Photo:\s*.*?\]/i, '').replace(/\[Photo:\s*.*?\]/i, '').trim();
    return { type, fileName, dataUrl, cleanText };
  }

  const attachWithDataMatch = cleanText.match(/📎\s*\[Attachment:\s*(.*?)\s*\((.*?)\)\]/i) || cleanText.match(/\[Attachment:\s*(.*?)\s*\((.*?)\)\]/i);
  if (attachWithDataMatch) {
    type = 'document';
    fileName = attachWithDataMatch[1];
    fileSize = attachWithDataMatch[2];
    cleanText = cleanText.replace(/📎\s*\[Attachment:\s*.*?\]/i, '').replace(/\[Attachment:\s*.*?\]/i, '').trim();
    return { type, fileName, fileSize, dataUrl, cleanText };
  }

  const legacyAttach = cleanText.match(/\[Attachment:\s*(.*?)\]/i);
  if (legacyAttach) {
    type = 'document';
    fileName = legacyAttach[1];
    fileSize = 'PDF Document';
    cleanText = cleanText.replace(/\[Attachment:\s*.*?\]/i, '').trim();
    return { type, fileName, fileSize, dataUrl: dataUrl || '', cleanText };
  }

  if (rawAttachments && rawAttachments.length > 0) {
    const firstAtt = rawAttachments[0];
    if (firstAtt.startsWith('data:image/') || firstAtt.match(/\.(png|jpe?g|gif|webp)(\?.*)?$/i)) {
      return { type: 'image', fileName: 'Attachment.jpg', dataUrl: firstAtt, cleanText };
    } else {
      return { type: 'document', fileName: 'Attachment.pdf', fileSize: 'Document', dataUrl: firstAtt, cleanText };
    }
  }

  return { type, cleanText };
}

const PortalAudioPlayer: React.FC<{ audioUrl: string; duration?: string; isMe: boolean }> = ({ audioUrl, duration, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : (isPlaying ? 50 : 0);

  return (
    <div className={`flex items-center gap-2.5 p-2 rounded-xl min-w-[200px] sm:min-w-[240px] ${
      isMe ? 'bg-blue-700/60 text-white' : 'bg-slate-100 text-slate-800'
    }`}>
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-transform active:scale-95 ${
          isMe ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="h-1.5 w-full bg-black/15 rounded-full overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-100 ${isMe ? 'bg-white' : 'bg-blue-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1 text-[9px] opacity-80 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{duration || (totalDuration > 0 ? formatTime(totalDuration) : '0:05')}</span>
        </div>
      </div>
    </div>
  );
};

interface ClientPortalViewProps {
  caseData: CaseItem;
  documents: CaseDocument[];
  messages: CaseMessage[];
  appointments?: any[];
  payments?: any[];
  openNewDocModal: () => void;
  openAppointmentModal?: () => void;
  openSignModal?: () => void;
  openQuestionnaireModal?: () => void;
  openResumeBuildingModal?: (caseItem: CaseItem) => void;
  activeNavTab?: string;
  onNavigateTab?: (tab: any) => void;
  commViewMode?: 'hub' | 'whatsapp';
  setCommViewMode?: (mode: 'hub' | 'whatsapp') => void;
  currentUser?: { id: string; name: string; email: string; role: UserRole; avatar?: string } | null;
  allCases?: CaseItem[];
  onNewMessage?: (msg: CaseMessage) => void;
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
    requiredDocs?: string[];
  }[];
}

const CLIENT_STAGES: ClientStageGroup[] = [
  {
    id: 1,
    title: 'Stage 1: Consultation and Onboarding',
    subtitle: 'Profile assessment, engagement agreement, flexible payment & document collection',
    internalStages: [1, 2, 3, 4, 5],
    tasks: [
      { id: 'st1-1', name: 'Initial consultation and intake evaluation', assignedTo: 'Client', status: 'Awaiting Client' },
      { id: 'st1-2', name: 'Upload existing CV and academic degree certificates', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['Curriculum Vitae', 'Degree Certificate'] },
      { id: 'st1-3', name: 'Review and sign engagement retainer agreement', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['Signed Engagement Agreement'] },
      { id: 'st1-4', name: 'Select payment plan and confirm retainer deposit', assignedTo: 'Client', status: 'Not Started' },
      { id: 'st1-5', name: 'Profile evaluation & evidence checklist approval', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  },
  {
    id: 2,
    title: 'Stage 2: Case Strategy & Recommendation Letters',
    subtitle: 'Proposed endeavor development & expert recommender letters',
    internalStages: [6, 7, 8],
    tasks: [
      { id: 'st2-1', name: 'Review and approve proposed endeavor statement', assignedTo: 'Client', status: 'Not Started', deadline: 'Mar 01, 2026' },
      { id: 'st2-2', name: 'Identify 3-5 independent expert recommenders', assignedTo: 'Client', status: 'Not Started', deadline: 'Mar 10, 2026', requiredDocs: ['Recommender CVs'] },
      { id: 'st2-3', name: 'Draft recommendation letters', assignedTo: 'Babel Global Team', status: 'Not Started', deadline: 'Mar 12, 2026', requiredDocs: ['Draft Letters 1-3'] },
      { id: 'st2-4', name: 'Send drafted letters to recommenders for review', assignedTo: 'Client', status: 'Not Started', deadline: 'Mar 15, 2026' },
      { id: 'st2-5', name: 'Upload signed recommendation letters on official letterhead', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['Signed Recommendation Letters'] },
      { id: 'st2-6', name: 'Staff reviews and approves completed letters', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  },
  {
    id: 3,
    title: 'Stage 3: Forms Preparation',
    subtitle: 'USCIS questionnaires & official form packages (I-140, ETA-9089, G-1145)',
    internalStages: [9],
    tasks: [
      { id: 'st3-1', name: 'Client completes simplified USCIS questionnaire', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['USCIS Questionnaire'] },
      { id: 'st3-2', name: 'Transfer data to applicable forms (I-140, ETA-9089)', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st3-3', name: 'Editorial staff reviews form data and accuracy', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st3-4', name: 'Client reviews & signs completed forms with blue ink', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['Signed Form I-140', 'Form G-1145'] }
    ]
  },
  {
    id: 4,
    title: 'Stage 4: Petition Drafting & Review',
    subtitle: 'Legal petition memorandum drafting under Dhanasar 3-Prong framework',
    internalStages: [9, 10, 11, 12],
    tasks: [
      { id: 'st4-1', name: 'Assign petition to Senior Drafter', assignedTo: 'Babel Global Team', status: 'Not Started' },
      { id: 'st4-2', name: 'Draft Petition Memorandum (Dhanasar Prongs 1, 2, 3)', assignedTo: 'Babel Global Team', status: 'Not Started', deadline: 'Mar 15, 2026', requiredDocs: ['Petition Memorandum Draft'] },
      { id: 'st4-3', name: 'Senior QA Reviewer audit & legal signoff', assignedTo: 'Babel Global Team', status: 'Not Started' },
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
    internalStages: [14],
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
    isOptional: true,
    internalStages: [],
    tasks: [
      { id: 'opt-1', name: 'Additional-service agreement & fee confirmation', assignedTo: 'Client', status: 'Not Started' },
      { id: 'opt-2', name: 'Form I-485 questionnaire & medical exam (Form I-693)', assignedTo: 'Client', status: 'Not Started', requiredDocs: ['Form I-693 Medical Sealed Envelope'] },
      { id: 'opt-3', name: 'Final concurrent package preparation & filing', assignedTo: 'Babel Global Team', status: 'Not Started' }
    ]
  }
];

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  caseData: incomingCaseData,
  documents,
  messages: initialMessages,
  appointments = [],
  payments = [],
  openNewDocModal,
  openAppointmentModal,
  openSignModal,
  openQuestionnaireModal,
  openResumeBuildingModal,
  activeNavTab,
  onNavigateTab,
  commViewMode = 'whatsapp',
  setCommViewMode,
  currentUser,
  allCases = [],
  onNewMessage
}) => {
  // Resilient fallback case so client portal always renders profile & settings gracefully
  const fallbackCase: CaseItem = React.useMemo(() => ({
    id: currentUser?.id || 'client-case-active',
    caseNumber: 'NIW-2026-ACTIVE',
    clientId: currentUser?.id || 'client-active-id',
    clientName: currentUser?.name || 'Client (Petitioner)',
    clientEmail: currentUser?.email || 'client@babelglobal.com',
    petitionCategory: 'EB-2 NIW',
    fieldCategory: 'Proposed Endeavor & Research',
    assignedWriter: 'Petition Drafter 1',
    assignedReviewer: 'Senior Reviewer',
    currentStage: 1,
    priorityDate: new Date().toISOString().split('T')[0],
    status: 'In Progress' as any,
    documentsCount: documents?.length || 0,
    recommenders: [],
    riskLevel: 'low',
    targetFilingDate: '2026-12-31',
    uscisServiceCenter: 'Nebraska (NSC)',
    premiumProcessing: false,
    dhanasar: {
      prong1: { title: 'Substantial Merit & National Importance', endeavorSummary: '', usImpactAreas: [], nationalImportanceScore: 0 },
      prong2: { title: 'Well Positioned to Advance the Endeavor', educationTrack: '', keyAchievements: [], citationPercentile: '', fundingSecured: '' },
      prong3: { title: 'On Balance Beneficial to Waive Job Offer & PERM', urgencyArguments: [], uniqueExpertise: '' }
    },
    notes: 'Active client petition profile',
    lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
  }), [currentUser, documents?.length]);

  const caseData = incomingCaseData || (allCases && allCases[0]) || fallbackCase;

  const currentTab = activeNavTab ? (NAV_TO_PORTAL_TAB[activeNavTab] || 'overview') : 'overview';
  const [internalTab, setInternalTab] = useState<ClientPortalTab>(currentTab);

  const activeTab = activeNavTab ? currentTab : internalTab;

  const handleTabChange = (tab: ClientPortalTab) => {
    setInternalTab(tab);
    if (onNavigateTab) {
      onNavigateTab(PORTAL_TO_NAV_TAB[tab]);
    }
  };
  const [expandedStage, setExpandedStage] = useState<number>(() => Number(caseData?.currentStage) || 1);
  const [stage1FlowMode, setStage1FlowMode] = useState<'standard' | 'evidence_first'>('standard');
  const [activeChannelModal, setActiveChannelModal] = useState<'email' | 'sms' | 'whatsapp' | null>(null);

  // Set of all case IDs belonging to this client to ensure cross-case thread consistency
  const clientCaseIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (caseData?.id) ids.add(caseData.id);
    const targetClientId = caseData?.clientId || (caseData as any)?.client?.id || currentUser?.id;
    const targetEmail = (caseData?.clientEmail || (caseData as any)?.client?.email || currentUser?.email || '').toLowerCase().trim();
    const targetName = (caseData?.clientName || (caseData as any)?.client?.name || currentUser?.name || '').toLowerCase().trim();

    if (allCases && allCases.length > 0) {
      allCases.forEach(c => {
        const cClientId = c.clientId || (c as any).client?.id;
        const cEmail = (c.clientEmail || (c as any).client?.email || '').toLowerCase().trim();
        const cName = (c.clientName || (c as any).client?.name || '').toLowerCase().trim();
        if (
          (targetClientId && cClientId === targetClientId) ||
          (targetEmail && cEmail === targetEmail) ||
          (targetName && cName === targetName)
        ) {
          ids.add(c.id);
        }
      });
    }
    return ids;
  }, [caseData, allCases, currentUser]);

  const isRelevantPortalMessage = React.useCallback((m: any) => {
    if (!m) return false;
    const text = m.content || m.text || '';
    const isWa = m.channel === 'whatsapp' || text.startsWith('[WA] ') || text.startsWith('[wa]: ');
    if (isWa) return false;

    // Match if belongs to this case or any case of this client
    if (m.caseId && clientCaseIds.has(m.caseId)) return true;
    if (caseData?.id && m.caseId === caseData.id) return true;

    // Match by client/sender name
    const targetName = (caseData?.clientName || currentUser?.name || '').toLowerCase().trim();
    const sName = (m.senderName || '').toLowerCase().trim();
    if (targetName && sName && (sName === targetName || sName.includes(targetName) || targetName.includes(sName))) {
      return true;
    }
    return false;
  }, [clientCaseIds, caseData?.id, caseData?.clientName, currentUser?.name]);

  const clientStorageKey = React.useMemo(() => {
    const idKey = caseData?.clientId || (caseData as any)?.client?.id || currentUser?.id;
    const emailKey = caseData?.clientEmail || (caseData as any)?.client?.email || currentUser?.email;
    const cleanKey = (idKey || emailKey || caseData?.clientName || 'default').replace(/[^a-zA-Z0-9_-]/g, '_');
    return `babel_portal_hub_messages_${cleanKey}`;
  }, [caseData, currentUser]);

  const [messages, setMessages] = useState<CaseMessage[]>(() => {
    // 1. Try persistent storage so conversation is NEVER deleted across logouts
    try {
      const saved = localStorage.getItem(clientStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    // 2. Try initial messages prop
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages.filter(isRelevantPortalMessage);
    }
    return [];
  });

  const [newMsg, setNewMsg] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [attachedPortalFile, setAttachedPortalFile] = useState<{ name: string; size: string; type: 'image' | 'doc'; dataUrl: string } | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; name: string } | null>(null);
  const portalFileInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation thread
  React.useEffect(() => {
    if (activeTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // Persist messages in localStorage whenever they change
  React.useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(clientStorageKey, JSON.stringify(messages));
      } catch {}
    }
  }, [messages, clientStorageKey]);

  // Synchronize when initialMessages prop updates from App.tsx
  React.useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      const relevant = initialMessages.filter(isRelevantPortalMessage);
      if (relevant.length > 0) {
        setMessages(prev => {
          const map = new Map<string, CaseMessage>();
          prev.forEach(m => map.set(m.id, m));
          relevant.forEach(m => map.set(m.id, m));
          return Array.from(map.values()).sort((a, b) => 
            (a.timestamp || '').localeCompare(b.timestamp || '')
          );
        });
      }
    }
  }, [initialMessages, isRelevantPortalMessage]);

  // Real-time automatic polling for new Messaging Hub messages without needing page refresh
  React.useEffect(() => {
    let isMounted = true;

    const pollPortalMessages = async () => {
      try {
        const res = await api.get('/messages');
        if (!isMounted || !res.success || !Array.isArray(res.data)) return;

        const relevant = res.data.filter(isRelevantPortalMessage);

        setMessages(prev => {
          const map = new Map<string, CaseMessage>();
          prev.forEach(m => map.set(m.id, m));
          relevant.forEach(m => map.set(m.id, m));
          const merged = Array.from(map.values()).sort((a, b) => 
            (a.timestamp || '').localeCompare(b.timestamp || '')
          );
          if (merged.length !== prev.length || merged.some((m, idx) => m.id !== prev[idx]?.id)) {
            return merged;
          }
          return prev;
        });
      } catch (err) {
        // Silently ignore background polling errors
      }
    };

    // Trigger immediately on component mount
    pollPortalMessages();

    const interval = setInterval(pollPortalMessages, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isRelevantPortalMessage]);

  const handlePortalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isImage = file.type.startsWith('image/');
      let dataUrl: string;

      if (isImage) {
        dataUrl = await compressImageToDataUrl(file);
      } else {
        dataUrl = await readFileAsDataUrl(file);
      }

      setAttachedPortalFile({
        name: file.name,
        size: formatFileSize(file.size),
        type: isImage ? 'image' : 'doc',
        dataUrl
      });
    } catch (err) {
      console.error('Error reading portal attachment file:', err);
    } finally {
      if (portalFileInputRef.current) portalFileInputRef.current.value = '';
    }
  };

  const renderPortalBubbleContent = (m: CaseMessage, isMe: boolean) => {
    const rawAttachments = Array.isArray(m.attachments) ? m.attachments : [];
    const parsed = parsePortalMessageAttachments(m.content || '', rawAttachments);

    return (
      <div className="space-y-2">
        {/* Audio / Voice Note */}
        {parsed.type === 'audio' && parsed.dataUrl && (
          <div className="pt-0.5">
            <PortalAudioPlayer audioUrl={parsed.dataUrl} duration={parsed.duration} isMe={isMe} />
          </div>
        )}

        {/* Photo / Image Preview */}
        {parsed.type === 'image' && parsed.dataUrl && (
          <div className="rounded-xl overflow-hidden border border-black/10 group relative max-w-[280px]">
            <img
              src={parsed.dataUrl}
              alt={parsed.fileName || 'Attached image'}
              className="w-full max-h-56 object-cover cursor-pointer hover:opacity-95 transition-opacity bg-black/5"
              onClick={() => setPreviewImageModal({ url: parsed.dataUrl!, name: parsed.fileName || 'Image' })}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
              <button
                type="button"
                onClick={() => setPreviewImageModal({ url: parsed.dataUrl!, name: parsed.fileName || 'Image' })}
                className="pointer-events-auto p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-xs"
                title="View full image"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <a
                href={parsed.dataUrl}
                download={parsed.fileName || 'image.jpg'}
                className="pointer-events-auto p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors shadow-xs"
                title="Download image"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Document Card with direct download */}
        {parsed.type === 'document' && (
          <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
            isMe ? 'bg-blue-700/60 border-blue-500/40 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isMe ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate leading-tight">{parsed.fileName || 'Document'}</p>
              <p className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{parsed.fileSize || 'Attachment'}</p>
            </div>
            {parsed.dataUrl && (
              <a
                href={parsed.dataUrl}
                download={parsed.fileName || 'document.pdf'}
                className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                  isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 text-slate-600'
                }`}
                title="Download attachment"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        {/* Text Caption */}
        {parsed.cleanText && (
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{parsed.cleanText}</p>
        )}
      </div>
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMsg.trim() && !attachedPortalFile) || !caseData) return;

    let contentToSend = newMsg.trim();
    if (attachedPortalFile) {
      if (attachedPortalFile.type === 'image') {
        const imgTag = `📷 [Photo: ${attachedPortalFile.name}] [DATA:${attachedPortalFile.dataUrl}]`;
        contentToSend = contentToSend ? `${imgTag} ${contentToSend}` : imgTag;
      } else {
        const docTag = `📎 [Attachment: ${attachedPortalFile.name} (${attachedPortalFile.size})] [DATA:${attachedPortalFile.dataUrl}]`;
        contentToSend = contentToSend ? `${docTag} ${contentToSend}` : docTag;
      }
    }

    const payloadAttachments = attachedPortalFile ? [attachedPortalFile.dataUrl] : [];

    setNewMsg('');
    setAttachedPortalFile(null);
    setIsSendingMsg(true);

    const clientName = caseData.clientName || currentUser?.name || 'demoooooooo';
    const targetCaseId = caseData.id;

    // 1. Optimistic instant message display
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: CaseMessage = {
      id: tempId,
      caseId: targetCaseId,
      senderName: clientName,
      senderRole: 'client',
      content: contentToSend,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      attachments: payloadAttachments
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const res = await api.post('/messages', {
        caseId: targetCaseId,
        senderName: clientName,
        senderRole: 'client',
        content: contentToSend,
        channel: 'portal',
        attachments: payloadAttachments
      });

      if (res && res.success && res.data) {
        setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));
        if (onNewMessage) onNewMessage(res.data);
      }
    } catch (err: any) {
      console.error('Failed to send message to backend:', err.message);
      // Even if network fails, the message remains preserved in local state & localStorage!
    } finally {
      setIsSendingMsg(false);
    }
  };

  const [deletedDocIds, setDeletedDocIds] = useState<Set<string>>(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('deleted_doc_ids') || '[]');
      const names = JSON.parse(localStorage.getItem('deleted_doc_names') || '[]');
      return new Set([...ids, ...names]);
    } catch {
      return new Set();
    }
  });

  const clientDocs = React.useMemo(() => {
    const map = new Map<string, CaseDocument>();
    const isDeleted = (d: CaseDocument) => 
      deletedDocIds.has(d.id) || (d.name && deletedDocIds.has(d.name));

    const caseAttachedDocs = Array.isArray((caseData as any)?.documents) ? (caseData as any).documents : [];
    caseAttachedDocs.forEach((d: CaseDocument) => { 
      if (d?.id && !isDeleted(d)) map.set(d.id, d); 
    });

    if (documents && Array.isArray(documents)) {
      documents.forEach((d: CaseDocument) => {
        if (!d?.id || isDeleted(d)) return;
        const matchesCase = 
          !caseData?.id || 
          d.caseId === caseData.id || 
          (caseData.caseNumber && d.caseId === caseData.caseNumber) ||
          (caseData.clientId && (d as any).clientId === caseData.clientId) ||
          (d.uploadedBy && currentUser?.name && d.uploadedBy.toLowerCase() === currentUser.name.toLowerCase()) ||
          (!allCases || allCases.length <= 1);

        if (matchesCase) {
          map.set(d.id, d);
        }
      });
    }

    try {
      const candidateKeys = [
        'local_case_documents_master',
        caseData?.id ? `local_case_documents_${caseData.id}` : null,
        caseData?.caseNumber ? `local_case_documents_${caseData.caseNumber}` : null,
      ].filter(Boolean) as string[];

      for (const k of candidateKeys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          const list: CaseDocument[] = JSON.parse(raw);
          if (Array.isArray(list)) {
            list.forEach(d => {
              if (d?.id && !isDeleted(d)) map.set(d.id, d);
            });
          }
        }
      }
    } catch {}

    return Array.from(map.values());
  }, [documents, caseData, currentUser, allCases, deletedDocIds]);

  const hasUploadedDocs = clientDocs.length > 0 || Boolean(caseData?.documentsCount && caseData.documentsCount > 0);

  const handleDeleteDocument = async (doc: CaseDocument, taskId?: string) => {
    if (!window.confirm(`Are you sure you want to remove "${doc.name}"? You can re-upload another document.`)) {
      return;
    }

    try {
      // 1. Delete from backend if real document
      if (doc.id && !doc.id.startsWith('mock-') && !doc.id.startsWith('doc-client-')) {
        try {
          await api.delete(`/documents/${doc.id}`);
        } catch (apiErr) {
          console.warn('Backend delete document non-critical error:', apiErr);
        }
      }

      // 2. Add to deleted tracking sets in localStorage
      const deletedIdsRaw = localStorage.getItem('deleted_doc_ids') || '[]';
      const deletedIds: string[] = JSON.parse(deletedIdsRaw);
      if (doc.id && !deletedIds.includes(doc.id)) deletedIds.push(doc.id);
      localStorage.setItem('deleted_doc_ids', JSON.stringify(deletedIds));

      const deletedNamesRaw = localStorage.getItem('deleted_doc_names') || '[]';
      const deletedNames: string[] = JSON.parse(deletedNamesRaw);
      if (doc.name && !deletedNames.includes(doc.name)) deletedNames.push(doc.name);
      localStorage.setItem('deleted_doc_names', JSON.stringify(deletedNames));

      // 3. Remove from all local storage caches
      const candidateDocKeys = [
        'local_case_documents_master',
        caseData?.id ? `local_case_documents_${caseData.id}` : null,
        caseData?.caseNumber ? `local_case_documents_${caseData.caseNumber}` : null,
      ].filter(Boolean) as string[];

      for (const k of candidateDocKeys) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list: CaseDocument[] = JSON.parse(raw);
            const filtered = list.filter(d => d.id !== doc.id && d.name !== doc.name);
            localStorage.setItem(k, JSON.stringify(filtered));
          }
        } catch {}
      }

      // 4. Update task submission if attached to a task
      const targetTaskId = taskId || (doc as any).attachedTaskId || activeActionTask?.id;
      if (targetTaskId) {
        const candidateTaskKeys = [
          'workflow_stage_tasks_master',
          caseData?.id ? `workflow_stage_tasks_${caseData.id}` : null,
          caseData?.caseNumber ? `workflow_stage_tasks_${caseData.caseNumber}` : null,
          caseData?.clientId ? `workflow_stage_tasks_${caseData.clientId}` : null,
          'workflow_stage_tasks_shared',
          'workflow_stage_tasks_latest'
        ].filter(Boolean) as string[];

        for (const k of candidateTaskKeys) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const stages = JSON.parse(raw);
              if (Array.isArray(stages)) {
                const updatedStages = stages.map((st: any) => ({
                  ...st,
                  tasks: st.tasks.map((t: any) => {
                    if (t.id === targetTaskId) {
                      const existingDocs = Array.isArray(t.submission?.documents) ? t.submission.documents : [];
                      const remainingDocs = existingDocs.filter((d: any) => d.id !== doc.id && d.name !== doc.name);
                      
                      if (remainingDocs.length > 0) {
                        return {
                          ...t,
                          submission: {
                            ...t.submission,
                            docName: remainingDocs[0].name,
                            documents: remainingDocs
                          }
                        };
                      } else {
                        // All docs removed from this task: reset task so client can re-upload
                        return {
                          ...t,
                          status: 'Awaiting Client',
                          submission: undefined
                        };
                      }
                    }
                    return t;
                  })
                }));
                localStorage.setItem(k, JSON.stringify(updatedStages));
              }
            }
          } catch {}
        }
      }

      // 5. Update local state
      setDeletedDocIds(prev => new Set([...prev, doc.id, doc.name]));
      setWorkflowSyncTick(t => t + 1);

      // 6. Broadcast deletion to all components (App.tsx, CaseDetailView.tsx)
      window.dispatchEvent(new CustomEvent('document_deleted', {
        detail: { documentId: doc.id, docName: doc.name, taskId: targetTaskId }
      }));
      window.dispatchEvent(new CustomEvent('workflow_task_updated', {
        detail: { taskId: targetTaskId }
      }));

    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  // ── Action-Driven Task Lifecycle & Sync State ──────────────────────────────
  const [activeActionTask, setActiveActionTask] = useState<{ id: string; stageId: number; name: string } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<CaseDocument | null>(null);
  const [isEndeavorModalOpen, setIsEndeavorModalOpen] = useState(false);
  const [isRecommenderActionModalOpen, setIsRecommenderActionModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isInlineDocModalOpen, setIsInlineDocModalOpen] = useState(false);
  const [actionToastMessage, setActionToastMessage] = useState<string | null>(null);
  const [, setWorkflowSyncTick] = useState(0);

  // Direct Inline File Upload State for Action Modal
  const [inlineUploadFile, setInlineUploadFile] = useState<File | null>(null);
  const [isInlineUploading, setIsInlineUploading] = useState(false);
  const [inlineUploadSuccess, setInlineUploadSuccess] = useState(false);

  // Endeavor Review State
  const [endeavorFeedback, setEndeavorFeedback] = useState('');
  
  // Recommender Input State
  const [newRecName, setNewRecName] = useState('');
  const [newRecInstitution, setNewRecInstitution] = useState('');
  const [newRecField, setNewRecField] = useState('');
  const [recList, setRecList] = useState<any[]>(() => (Array.isArray(caseData?.recommenders) && caseData.recommenders.length > 0) ? caseData.recommenders : []);

  // Shipping Address State
  const [shipStreet, setShipStreet] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipState, setShipState] = useState('');
  const [shipZip, setShipZip] = useState('');
  const [shipPhone, setShipPhone] = useState((caseData as any)?.clientPhone || (caseData as any)?.client?.phone || '');

  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const keys = [
        caseData?.id ? `completed_client_tasks_${caseData.id}` : null,
        caseData?.caseNumber ? `completed_client_tasks_${caseData.caseNumber}` : null
      ].filter(Boolean) as string[];
      for (const k of keys) {
        const saved = localStorage.getItem(k);
        if (saved) return JSON.parse(saved);
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Real-time synchronization between Admin & Client Portal
  React.useEffect(() => {
    const reloadWorkflow = () => {
      try {
        const keys = [
          caseData?.id ? `completed_client_tasks_${caseData.id}` : null,
          caseData?.caseNumber ? `completed_client_tasks_${caseData.caseNumber}` : null
        ].filter(Boolean) as string[];
        for (const k of keys) {
          const saved = localStorage.getItem(k);
          if (saved) {
            setCompletedTaskIds(JSON.parse(saved));
            break;
          }
        }
      } catch {}
      setWorkflowSyncTick(t => t + 1);
    };

    reloadWorkflow();

    // Periodic backend polling so changes made in separate incognito sessions or browsers reflect within 2-3s
    const pollBackend = async () => {
      try {
        const res = await api.get('/cases/my-case');
        if (res.success && res.data?.notes) {
          try {
            const parsed = JSON.parse(res.data.notes);
            if (parsed?.workflowTasks && Array.isArray(parsed.workflowTasks)) {
              const serialized = JSON.stringify(parsed.workflowTasks);
              if (res.data.id) localStorage.setItem(`workflow_stage_tasks_${res.data.id}`, serialized);
              if (res.data.caseNumber) localStorage.setItem(`workflow_stage_tasks_${res.data.caseNumber}`, serialized);
              setWorkflowSyncTick(t => t + 1);
            }
          } catch {}
        }
      } catch {}
    };

    const handleWorkflowEvent = () => {
      reloadWorkflow();
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('workflow_stage_tasks_') || e.key.startsWith('completed_client_tasks_'))) {
        reloadWorkflow();
      }
    };

    window.addEventListener('workflow_task_updated', handleWorkflowEvent);
    window.addEventListener('storage', handleStorageEvent);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('jurisflow_workflow_sync');
      bc.onmessage = () => {
        reloadWorkflow();
      };
    } catch {}

    const localInterval = setInterval(reloadWorkflow, 1000);
    const pollInterval = setInterval(pollBackend, 2500);

    return () => {
      window.removeEventListener('workflow_task_updated', handleWorkflowEvent);
      window.removeEventListener('storage', handleStorageEvent);
      if (bc) bc.close();
      clearInterval(localInterval);
      clearInterval(pollInterval);
    };
  }, [caseData?.id, caseData?.caseNumber, caseData?.currentStage]);

  // Resolves task status strictly respecting Admin / Super Admin state
  const getResolvedTaskStatus = (task: any, stageId?: number): ClientStageGroup['tasks'][0]['status'] => {
    try {
      let parsedStages: any[] | null = null;

      // 1. LocalStorage candidate keys FIRST (reflecting instant live edits from Super Admin / Admin for this case)
      const candidateKeys = [
        caseData?.id ? `workflow_stage_tasks_${caseData.id}` : null,
        caseData?.caseNumber ? `workflow_stage_tasks_${caseData.caseNumber}` : null
      ].filter(Boolean) as string[];

      for (const k of candidateKeys) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const data = JSON.parse(raw);
            if (Array.isArray(data) && data.length > 0) {
              parsedStages = data;
              break;
            }
          } catch {}
        }
      }

      // 2. Direct database-persisted workflowTasks on caseData fallback
      if (!parsedStages && (caseData as any)?.workflowTasks && Array.isArray((caseData as any).workflowTasks) && (caseData as any).workflowTasks.length > 0) {
        parsedStages = (caseData as any).workflowTasks;
      }

      if (parsedStages) {
        const adminStage = parsedStages.find((g: any) => g.id === stageId);
        if (adminStage && Array.isArray(adminStage.tasks)) {
          const adminTask = adminStage.tasks.find((t: any) => 
            t.id === task.id || 
            (task.id === 'st1-2' && t.id === 'st1-5') || 
            (task.id === 'st1-5' && t.id === 'st1-2')
          );
          if (adminTask && adminTask.status) {
            return adminTask.status as any;
          }
        }
      }
    } catch (e) {}

    if (completedTaskIds.includes(task.id)) {
      return 'Approved/Completed';
    }

    const currentStageNum = Number(caseData?.currentStage) || 1;
    if (stageId && stageId < currentStageNum) {
      return 'Approved/Completed';
    }

    return task.status || 'Not Started';
  };

  const getStageTasks = (stageGroup: ClientStageGroup) => {
    if (stageGroup.id !== 1) return stageGroup.tasks;
    if (stage1FlowMode === 'standard') return stageGroup.tasks;
    // In Evidence-First mode, re-order to highlight CV & Degree upload first
    const t1 = stageGroup.tasks.find(t => t.id === 'st1-1');
    const t2 = stageGroup.tasks.find(t => t.id === 'st1-2');
    const t3 = stageGroup.tasks.find(t => t.id === 'st1-3');
    const t4 = stageGroup.tasks.find(t => t.id === 'st1-4');
    const t5 = stageGroup.tasks.find(t => t.id === 'st1-5');
    return [
      t1, 
      t2 ? { ...t2, flowLabel: 'Evidence-First: Upload CV & Degrees Before Retainer Deposit' } : null, 
      t3, 
      t4, 
      t5
    ].filter(Boolean) as any[];
  };

  // Submits a task action to staff for review (Status: Under Review)
  const submitTaskAction = (stageId: number, taskId: string, attachedDocName?: string, submissionData?: any) => {
    const candidateKeys = [
      caseData?.id ? `workflow_stage_tasks_${caseData.id}` : null,
      caseData?.caseNumber ? `workflow_stage_tasks_${caseData.caseNumber}` : null
    ].filter(Boolean) as string[];

    let stages: any[] = [];
    for (const key of candidateKeys) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            stages = parsed;
            break;
          }
        }
      } catch {}
    }

    if (!stages || stages.length === 0) {
      stages = CLIENT_STAGES.map(s => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        tasks: s.tasks.map(t => ({ ...t }))
      }));
    }

    // Prepare default submission payload if not explicitly provided
    let preparedSubmission = submissionData;
    if (!preparedSubmission) {
      if (attachedDocName) {
        const matchingDoc = (clientDocs || []).find(d => d.name === attachedDocName || (d as any).attachedTaskId === taskId);
        preparedSubmission = {
          type: 'document',
          docName: attachedDocName,
          documents: matchingDoc ? [matchingDoc] : [{
            id: `doc-${Date.now()}`,
            caseId: caseData?.id || 'default',
            name: attachedDocName,
            category: 'Evidence Document',
            fileSize: '32 KB',
            uploadedBy: currentUser?.name || caseData?.clientName || 'Client',
            uploadedAt: new Date().toISOString(),
            status: 'Pending Review',
            fileUrl: `/uploads/${attachedDocName}`
          }],
          submittedAt: new Date().toISOString(),
          note: `Uploaded evidence document: ${attachedDocName}`
        };
      } else {
        preparedSubmission = {
          type: taskId === 'st2-2' ? 'recommenders' : taskId === 'st2-1' ? 'endeavor' : 'general',
          title: taskId === 'st2-2' ? 'Nominated Expert Recommenders' : 'Client Submission',
          submittedAt: new Date().toISOString(),
          ...(taskId === 'st2-2' ? { recommenders: recList } : {}),
          ...(taskId === 'st2-1' ? { feedback: endeavorFeedback || 'Approved by client without changes' } : {})
        };
      }
    }

    const updated = stages.map((st: any) => {
      if (st.id !== stageId) return st;
      return {
        ...st,
        tasks: st.tasks.map((t: any) => {
          if (t.id === taskId || (taskId === 'st1-2' && t.id === 'st1-5') || (taskId === 'st1-5' && t.id === 'st1-2')) {
            return { 
              ...t, 
              status: 'Under Review',
              submission: preparedSubmission
            };
          }
          return t;
        })
      };
    });

    const serialized = JSON.stringify(updated);
    for (const key of candidateKeys) {
      try {
        localStorage.setItem(key, serialized);
      } catch {}
    }

    // Persist specific submission data types across storage & backend
    if (preparedSubmission?.recommenders && Array.isArray(preparedSubmission.recommenders)) {
      try {
        const serializedRecs = JSON.stringify(preparedSubmission.recommenders);
        localStorage.setItem('case_recommenders_master', serializedRecs);
        if (caseData?.id) localStorage.setItem(`case_recommenders_${caseData.id}`, serializedRecs);
        if (caseData?.caseNumber) localStorage.setItem(`case_recommenders_${caseData.caseNumber}`, serializedRecs);

        // Also post each recommender to backend API
        const caseIdentifier = caseData?.caseNumber || caseData?.id;
        if (caseIdentifier) {
          preparedSubmission.recommenders.forEach((rec: any) => {
            api.post(`/cases/${caseIdentifier}/recommenders`, {
              name: rec.name,
              title: rec.field || 'Independent Expert',
              organization: rec.institution,
              relationship: rec.relationship || 'Independent Expert'
            }).catch(() => {});
          });
        }
      } catch {}
    }

    if (preparedSubmission?.feedback) {
      try {
        localStorage.setItem('endeavor_feedback_master', preparedSubmission.feedback);
        if (caseData?.id) localStorage.setItem(`endeavor_feedback_${caseData.id}`, preparedSubmission.feedback);
      } catch {}
    }

    if (preparedSubmission?.shippingAddress) {
      try {
        const serializedAddr = JSON.stringify(preparedSubmission.shippingAddress);
        localStorage.setItem('shipping_address_master', serializedAddr);
        if (caseData?.id) localStorage.setItem(`shipping_address_${caseData.id}`, serializedAddr);
      } catch {}
    }

    // Dispatch live event to update CaseDetailView immediately
    window.dispatchEvent(new CustomEvent('workflow_task_updated', {
      detail: { 
        caseId: caseData?.id, 
        caseNumber: caseData?.caseNumber, 
        stageId, 
        taskId, 
        newStatus: 'Under Review',
        submission: preparedSubmission
      }
    }));
    try {
      const bc = new BroadcastChannel('jurisflow_workflow_sync');
      bc.postMessage({ 
        caseId: caseData?.id, 
        caseNumber: caseData?.caseNumber, 
        stageId, 
        taskId, 
        newStatus: 'Under Review',
        submission: preparedSubmission
      });
      setTimeout(() => {
        try { bc.close(); } catch {}
      }, 1000);
    } catch {}

    // Persist to backend database as well
    const caseIdentifier = caseData?.caseNumber || caseData?.id;
    if (caseIdentifier) {
      api.patch(`/cases/${caseIdentifier}`, {
        notes: JSON.stringify({
          workflowTasks: updated,
          lastUpdated: new Date().toISOString()
        })
      }).catch(() => {});
    }

    setWorkflowSyncTick(t => t + 1);
    setActiveActionTask(null);

    // Show toast confirmation
    setActionToastMessage(attachedDocName 
      ? `✓ Document "${attachedDocName}" uploaded & submitted for legal staff review!`
      : '✓ Action submitted! Your submission is now under review by the immigration legal team.'
    );
    setTimeout(() => setActionToastMessage(null), 5000);
  };

  // Direct Inline Evidence Upload Handler
  const handleDirectInlineFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeActionTask) return;
    const file = e.target.files[0];
    setIsInlineUploading(true);

    const uploaderName = currentUser?.name || caseData?.clientName || 'Client';
    const finalCaseId = caseData?.id || (allCases && allCases[0]?.id) || 'default';

    // Determine category based on task ID
    let docCategory = 'Identity & Personal Information';
    if (activeActionTask.id === 'st1-3') docCategory = 'Engagement & Retainer Agreement';
    else if (activeActionTask.id === 'st2-2' || activeActionTask.id === 'st2-5') docCategory = 'Letters of Recommendation';
    else if (activeActionTask.id === 'st3-1' || activeActionTask.id === 'st3-4') docCategory = 'Forms & Questionnaires';
    else if (activeActionTask.id === 'st6-4') docCategory = 'USCIS Official Notices';

    const formData = new FormData();
    formData.append('caseId', finalCaseId);
    formData.append('category', docCategory);
    formData.append('uploadedBy', uploaderName);
    formData.append('attachedTaskId', activeActionTask.id);
    formData.append('file', file);

    try {
      const res = await api.post('/documents', formData, true);
      let createdDoc: CaseDocument | null = null;
      if (res && res.success) {
        if (Array.isArray(res.documents) && res.documents.length > 0) createdDoc = res.documents[0];
        else if (Array.isArray(res.data) && res.data.length > 0) createdDoc = res.data[0];
        else if (res.data) createdDoc = res.data;
      }

      // If backend offline or local demo, build optimistic document
      if (!createdDoc) {
        createdDoc = {
          id: `doc-${Date.now()}`,
          caseId: finalCaseId,
          name: file.name,
          category: docCategory,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          uploadedBy: uploaderName,
          uploadedAt: new Date().toISOString(),
          status: 'Pending Review',
          fileUrl: URL.createObjectURL(file),
          aiSummary: `Uploaded for task: ${activeActionTask.name}`
        };
      }

      // Attach taskId metadata
      (createdDoc as any).attachedTaskId = activeActionTask.id;

      // Save document in localStorage cache so all views & roles have immediate access
      try {
        const rawMaster = localStorage.getItem('local_case_documents_master') || '[]';
        const parsedMaster: CaseDocument[] = JSON.parse(rawMaster);
        const filtered = parsedMaster.filter(d => d.id !== createdDoc!.id && d.name !== createdDoc!.name);
        const updated = [createdDoc, ...filtered];
        localStorage.setItem('local_case_documents_master', JSON.stringify(updated));
        if (finalCaseId) localStorage.setItem(`local_case_documents_${finalCaseId}`, JSON.stringify(updated));
        if (caseData?.id) localStorage.setItem(`local_case_documents_${caseData.id}`, JSON.stringify(updated));
        if (caseData?.caseNumber) localStorage.setItem(`local_case_documents_${caseData.caseNumber}`, JSON.stringify(updated));
      } catch {}

      // Dispatch document uploaded event across windows/components
      try {
        window.dispatchEvent(new CustomEvent('document_uploaded', { detail: { document: createdDoc, caseId: finalCaseId } }));
      } catch {}

      const existingTaskDocs = getTaskMatchingDocuments({ id: activeActionTask.id, name: activeActionTask.name }, clientDocs)
        .filter(d => d.id !== createdDoc!.id && d.name !== createdDoc!.name);
      const allSubmittedDocs = [...existingTaskDocs, createdDoc!];

      const subPayload = {
        type: 'document',
        docName: file.name,
        documents: allSubmittedDocs,
        submittedAt: new Date().toISOString(),
        note: `Uploaded evidence document: ${file.name}`
      };

      // Submit the task action and trigger reload
      submitTaskAction(activeActionTask.stageId, activeActionTask.id, file.name, subPayload);
      setIsInlineDocModalOpen(false);
    } catch (err: any) {
      // Optimistic fallback on network error
      const mockDoc: CaseDocument = {
        id: `doc-${Date.now()}`,
        caseId: finalCaseId,
        name: file.name,
        category: docCategory,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedBy: uploaderName,
        uploadedAt: new Date().toISOString(),
        status: 'Pending Review',
        fileUrl: URL.createObjectURL(file),
        aiSummary: `Uploaded for task: ${activeActionTask.name}`
      };
      (mockDoc as any).attachedTaskId = activeActionTask.id;

      try {
        const rawMaster = localStorage.getItem('local_case_documents_master') || '[]';
        const parsedMaster: CaseDocument[] = JSON.parse(rawMaster);
        const filtered = parsedMaster.filter(d => d.id !== mockDoc.id && d.name !== mockDoc.name);
        const updated = [mockDoc, ...filtered];
        localStorage.setItem('local_case_documents_master', JSON.stringify(updated));
        if (finalCaseId) localStorage.setItem(`local_case_documents_${finalCaseId}`, JSON.stringify(updated));
        if (caseData?.id) localStorage.setItem(`local_case_documents_${caseData.id}`, JSON.stringify(updated));
        if (caseData?.caseNumber) localStorage.setItem(`local_case_documents_${caseData.caseNumber}`, JSON.stringify(updated));
      } catch {}

      try {
        window.dispatchEvent(new CustomEvent('document_uploaded', { detail: { document: mockDoc, caseId: finalCaseId } }));
      } catch {}

      const existingTaskDocs = getTaskMatchingDocuments({ id: activeActionTask.id, name: activeActionTask.name }, clientDocs)
        .filter(d => d.id !== mockDoc.id && d.name !== mockDoc.name);
      const allSubmittedDocs = [...existingTaskDocs, mockDoc];

      const mockPayload = {
        type: 'document',
        docName: file.name,
        documents: allSubmittedDocs,
        submittedAt: new Date().toISOString(),
        note: `Uploaded evidence document: ${file.name}`
      };
      submitTaskAction(activeActionTask.stageId, activeActionTask.id, file.name, mockPayload);
      setIsInlineDocModalOpen(false);
    } finally {
      setIsInlineUploading(false);
    }
  };

  const handleTaskAction = (task: any, stageId: number) => {
    setActiveActionTask({ id: task.id, stageId, name: task.name });

    if (task.id === 'st1-4' || task.id === 'st5-0') {
      handleTabChange('payments');
    } else if (task.id === 'st1-3' || task.id === 'st3-4') {
      if (openSignModal) {
        openSignModal();
      } else {
        setIsEndeavorModalOpen(true);
      }
    } else if (task.id === 'st1-1' || task.id === 'st3-1') {
      if (openQuestionnaireModal) {
        openQuestionnaireModal();
      } else {
        handleTabChange('forms');
      }
    } else if (task.id === 'st2-1') {
      setIsEndeavorModalOpen(true);
    } else if (task.id === 'st2-2') {
      setIsRecommenderActionModalOpen(true);
    } else if (task.id === 'st2-4') {
      setIsDispatchModalOpen(true);
    } else if (task.id === 'st5-5') {
      setIsAddressModalOpen(true);
    } else {
      // Document upload tasks: st1-2, st2-5, st6-4, etc.
      setIsInlineDocModalOpen(true);
    }
  };

  // ── Client Settings State & Handlers ───────────────────────────────────────
  const rawClient = (caseData as any)?.client;
  const [clientPhone, setClientPhone] = useState<string>(rawClient?.phone || '+1 (555) 012-3456');
  const [clientCountry, setClientCountry] = useState<string>(rawClient?.countryOfBirth || 'International');
  const [clientField, setClientField] = useState<string>(caseData?.fieldCategory || rawClient?.currentField || 'Proposed Endeavor');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (caseData) {
      const raw = (caseData as any)?.client;
      if (raw?.phone) setClientPhone(raw.phone);
      if (raw?.countryOfBirth) setClientCountry(raw.countryOfBirth);
      if (caseData.fieldCategory || raw?.currentField) {
        setClientField(caseData.fieldCategory || raw?.currentField);
      }
    }
  }, [caseData]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [prefsSavedToast, setPrefsSavedToast] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const targetClientId = caseData?.clientId || (caseData as any)?.client?.id || caseData?.id;
      if (targetClientId) {
        const res = await api.put(`/clients/${targetClientId}`, {
          phone: clientPhone,
          countryOfBirth: clientCountry,
          currentField: clientField
        });
        if (res.success) {
          setProfileMsg({ type: 'success', text: 'Personal details updated and saved to database!' });
        } else {
          setProfileMsg({ type: 'error', text: res.error || 'Failed to update details.' });
        }
      } else {
        setProfileMsg({ type: 'success', text: 'Personal details updated successfully!' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Error updating profile.' });
    } finally {
      setIsSavingProfile(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMsg(null);
    try {
      const targetClientId = caseData?.clientId || (caseData as any)?.client?.id || caseData?.id;
      if (targetClientId) {
        const res = await api.put(`/clients/${targetClientId}`, { password: newPassword });
        if (res.success) {
          setPasswordMsg({ type: 'success', text: 'Account password updated successfully!' });
          setNewPassword('');
          setConfirmPassword('');
        } else {
          setPasswordMsg({ type: 'error', text: res.error || 'Failed to update password.' });
        }
      } else {
        setPasswordMsg({ type: 'success', text: 'Password saved successfully!' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setIsUpdatingPassword(false);
      setTimeout(() => setPasswordMsg(null), 4000);
    }
  };

  const handleSavePreferences = () => {
    setPrefsSavedToast(true);
    setTimeout(() => setPrefsSavedToast(false), 3000);
  };

  // Dynamic Next Action Calculation
  let nextActionTask: any = null;
  const currentStageNum = Number(caseData?.currentStage) || 1;

  for (const stage of CLIENT_STAGES) {
    if (stage.isOptional) continue;
    if (stage.id < currentStageNum) continue;

    const stageTasks = getStageTasks(stage);

    const pendingClientTask = stageTasks.find(
      (t) => {
        const resolved = getResolvedTaskStatus(t, stage.id);
        return t.assignedTo === 'Client' && (resolved === 'Not Started' || resolved === 'Awaiting Client' || resolved === 'Revision Required');
      }
    );
    if (pendingClientTask) {
      nextActionTask = { stageId: stage.id, ...pendingClientTask, status: getResolvedTaskStatus(pendingClientTask, stage.id) };
      break;
    }
  }

  if (!nextActionTask) {
    nextActionTask = {
      stageId: currentStageNum,
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

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Active Petition Profile Found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your client profile or petition case has been removed or not assigned yet. Please contact your case administrator.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Reload & Refresh Workspace
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('jwt_token');
                window.location.href = '/login';
              }}
              className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Sign Out of Workspace
            </button>
          </div>
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
                  {caseData.clientName}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Filing: <strong className="text-slate-800">{caseData.petitionCategory || 'EB-2 NIW'}</strong>
                  <span className="mx-2 text-slate-300">|</span>
                  Field: <strong className="text-blue-700">{caseData.fieldCategory}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Petition Drafter:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${caseData.assignedWriter ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <span className={`font-bold ${caseData.assignedWriter ? 'text-blue-700' : 'text-red-600'}`}>
                      {caseData.assignedWriter || 'Not Assigned'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <span className="text-slate-500 font-medium">Reviewer:</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${caseData.assignedReviewer ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <span className={`font-bold ${caseData.assignedReviewer ? 'text-blue-700' : 'text-red-600'}`}>
                      {caseData.assignedReviewer || 'Not Assigned'}
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
          {caseData.petitionCategory === 'Resume Building' && (
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
                  onClick={() => openResumeBuildingModal(caseData)}
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
                  if (nextActionTask.id !== 'fallback') {
                    handleTaskAction(nextActionTask, nextActionTask.stageId);
                  } else {
                    handleTabChange('tasks');
                  }
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Take Action Now</span>
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
                const isCompleted = st.id < currentStageNum;
                const isCurrent = st.id === currentStageNum;
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
              const isCompleted = stageGroup.id < currentStageNum;
              const isCurrent = stageGroup.id === currentStageNum;
              const isLocked = stageGroup.id > currentStageNum;

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
                      {(() => {
                        const tasksForStage = getStageTasks(stageGroup);
                        const completedCount = tasksForStage.filter(t => getResolvedTaskStatus(t, stageGroup.id) === 'Approved/Completed').length;
                        const pct = Math.round((completedCount / tasksForStage.length) * 100);
                        return (
                          <div className="flex flex-col items-end mr-2">
                            <span className="text-xs font-bold text-slate-800">{pct}% Completed</span>
                            <span className="text-[10px] text-slate-400 font-medium">{completedCount} / {tasksForStage.length} Tasks</span>
                          </div>
                        );
                      })()}
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
                      {getStageTasks(stageGroup).map((task) => {
                        const resolvedStatus = getResolvedTaskStatus(task, stageGroup.id);
                        const isAwaitingAction = resolvedStatus === 'Awaiting Client' || resolvedStatus === 'Revision Required';
                        const isUnderReview = resolvedStatus === 'Under Review' || resolvedStatus === 'Submitted';
                        const isCompleted = resolvedStatus === 'Approved/Completed';

                        return (
                          <div 
                            key={task.id} 
                            className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                              isAwaitingAction
                                ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-1 ring-amber-200'
                                : isUnderReview
                                ? 'bg-indigo-50/50 border-indigo-200 shadow-2xs'
                                : isCompleted
                                ? 'bg-emerald-50/30 border-emerald-200'
                                : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`font-bold ${isCompleted ? 'text-slate-700' : 'text-slate-900'}`}>
                                  {task.name}
                                </span>
                                {task.flowLabel && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    {task.flowLabel}
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  task.assignedTo === 'Client'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {task.assignedTo === 'Client' ? '👤 Client' : '🏢 Babel Global Team'}
                                </span>
                              </div>
                              {task.deadline && (
                                <p className="text-[11px] text-amber-700 font-medium">Target Deadline: {task.deadline}</p>
                              )}
                              {task.requiredDocs && task.requiredDocs.length > 0 && (
                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-slate-400" />
                                  Required Documents: {task.requiredDocs.join(', ')}
                                </p>
                              )}

                              {/* Attached / Uploaded Evidence for this specific sub-task */}
                              {(() => {
                                const taskDocs = getTaskMatchingDocuments(task, clientDocs);
                                if (taskDocs.length === 0) return null;
                                return (
                                  <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                      <Paperclip className="w-3 h-3 text-blue-600" />
                                      Attached Documents ({taskDocs.length}):
                                    </span>
                                    {taskDocs.map(doc => (
                                      <div
                                        key={doc.id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200 text-xs text-blue-900 font-medium transition-colors shadow-2xs"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span className="max-w-[170px] truncate font-semibold" title={doc.name}>{doc.name}</span>
                                        {doc.fileSize && <span className="text-[10px] text-slate-400 font-mono">({doc.fileSize})</span>}
                                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-white text-blue-800 border border-blue-200">
                                          {doc.status || 'Pending Review'}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewDoc(doc);
                                          }}
                                          className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs ml-0.5"
                                          title="View / Preview Document"
                                        >
                                          <Eye className="w-2.5 h-2.5" />
                                          <span>View</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            downloadDocumentFile(doc);
                                          }}
                                          className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-200/60 rounded cursor-pointer transition-colors"
                                          title="Download Document"
                                        >
                                          <Download className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteDocument(doc, task.id);
                                          }}
                                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-100/80 rounded cursor-pointer transition-colors ml-0.5"
                                          title="Remove / Delete wrong document"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {getStatusBadge(resolvedStatus)}
                              
                              {/* Prominent Take Action button when Awaiting Client */}
                              {isAwaitingAction && task.assignedTo === 'Client' && (
                                <button
                                  onClick={() => handleTaskAction(task, stageGroup.id)}
                                  className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer animate-pulse ring-2 ring-amber-300"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{resolvedStatus === 'Revision Required' ? 'Revise Action' : 'Take Action'}</span>
                                </button>
                              )}

                              {/* Secondary Start Task button when Not Started so client is never blocked */}
                              {resolvedStatus === 'Not Started' && task.assignedTo === 'Client' && (
                                <button
                                  onClick={() => handleTaskAction(task, stageGroup.id)}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                                  title="Click to start this task or upload documents"
                                >
                                  <Sparkles className="w-3 h-3 text-slate-400" />
                                  <span>Start Task</span>
                                </button>
                              )}

                              {/* Pending Staff Review indicator when Under Review */}
                              {isUnderReview && (
                                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-indigo-500" />
                                  Waiting for Staff Review
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
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

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {doc.status}
                  </span>
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => downloadDocumentFile(doc)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    title="Remove / Delete Document"
                  >
                    <X className="w-4 h-4" />
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
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Case / USCIS ID</span>
                <span className="font-mono font-bold text-slate-800 truncate block mt-0.5">
                  {caseData.passportNumber ? `PASS-${caseData.passportNumber}` : caseData.caseNumber}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Visa Status</span>
                <span className="font-bold text-blue-700 truncate block mt-0.5">
                  {caseData.petitionCategory ? `${caseData.petitionCategory} Petitioner` : 'EB-2 NIW Petitioner'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Form Progress</span>
                <span className="font-bold text-emerald-600 truncate block mt-0.5">100% Completed</span>
              </div>
            </div>
          </div>

          {/* NIW Form Package Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">
              Required Form Package Checklist for {caseData.petitionCategory || 'EB-2 NIW'}
            </h3>
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
                {caseData.premiumProcessing ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Prepared (Requested)</span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">Not Started</span>
                )}
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

            {(() => {
              const isAgreementExecuted = completedTaskIds.includes('st1-3') || Boolean((caseData as any)?.contractSigned);
              return (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">Babel Global Service Agreement</span>
                    <span className="text-slate-500">
                      {isAgreementExecuted
                        ? 'Executed & Signed • SHA-256 Digitally Encrypted'
                        : 'Awaiting Client Signature • Engagement Retainer Agreement Draft Ready'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isAgreementExecuted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {isAgreementExecuted ? 'Executed' : 'Awaiting Signature'}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Payment Plan & History */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Payment Plan &amp; Milestones</h3>
                <p className="text-xs text-slate-500">Official retainer deposit and installment schedule</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {(() => {
                  const clientPayments = (payments || []).filter((p: any) => 
                    (caseData?.id && p.caseId === caseData.id) || 
                    (p.case?.id && p.case.id === caseData?.id)
                  );
                  return `${clientPayments.length} Active Records`;
                })()}
              </span>
            </div>

            {(() => {
              const clientPayments = (payments || []).filter((p: any) => 
                (caseData?.id && p.caseId === caseData.id) || 
                (p.case?.id && p.case.id === caseData?.id)
              );

              if (clientPayments.length > 0) {
                return (
                  <div className="divide-y divide-slate-100 text-xs">
                    {clientPayments.map((p: any) => (
                      <div key={p.id} className="py-3.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 block text-sm">{p.description}</span>
                          <span className="text-slate-400">
                            {p.status === 'Paid' ? `Paid on ${p.paidAt || p.dueDate}` : `Due: ${p.dueDate}`}
                          </span>
                        </div>
                        <span className={`font-bold text-sm ${
                          p.status === 'Paid' ? 'text-emerald-600' : p.status === 'Overdue' ? 'text-rose-600' : 'text-amber-600'
                        }`}>
                          ${Number(p.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({p.status})
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div className="py-8 px-4 text-center bg-slate-50/60 rounded-xl border border-slate-200/80">
                  <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                  <p className="font-bold text-slate-700 text-sm">No Payments or Invoices Recorded</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                    Abhi tak koi payment invoice ya retainer fee record generate nahi hua hai. Jab administrative team invoice issue karegi, wo yahan payment options ke sath show hogi.
                  </p>
                </div>
              );
            })()}
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
              userRole="client"
              currentUser={{ id: caseData.clientId, name: caseData.clientName, email: caseData.clientEmail, role: 'client' }}
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
                {messages
                  .filter(m => {
                    const text = m.content || '';
                    const isWa = (m as any).channel === 'whatsapp' || text.startsWith('[WA] ') || text.startsWith('[wa]: ');
                    return !isWa;
                  })
                  .length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400">
                    <MessageSquare className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                    <p className="text-xs font-semibold text-slate-600">No messages in Messaging Hub yet</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Send a direct message below to communicate directly with your assigned petition drafter &amp; attorney.</p>
                  </div>
                ) : (
                  messages
                    .filter(m => {
                      const text = m.content || '';
                      const isWa = (m as any).channel === 'whatsapp' || text.startsWith('[WA] ') || text.startsWith('[wa]: ');
                      return !isWa;
                    })
                    .map(m => {
                      const isMe = m.senderRole === 'client';
                      return (
                        <div
                          key={m.id}
                          className={`p-3.5 sm:p-4 rounded-2xl max-w-[85%] sm:max-w-md ${isMe
                              ? 'bg-blue-600 text-white ml-auto shadow-sm rounded-br-xs'
                              : 'bg-white text-slate-800 mr-auto border border-slate-200 shadow-xs rounded-bl-xs'
                            }`}
                        >
                          <div className={`text-[10px] mb-1.5 font-semibold flex items-center justify-between gap-3 ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                            <span>{m.senderName}</span>
                            <span>{m.timestamp}</span>
                          </div>
                          {renderPortalBubbleContent(m, isMe)}
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attached file preview chip */}
              {attachedPortalFile && (
                <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {attachedPortalFile.type === 'image' ? (
                      <img src={attachedPortalFile.dataUrl} alt="Preview" className="w-8 h-8 object-cover rounded-md border border-blue-200" />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-[11px]">{attachedPortalFile.name}</p>
                      <p className="text-[10px] text-slate-500">{attachedPortalFile.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedPortalFile(null)}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-200 flex items-center gap-2 sm:gap-3 bg-white">
                <input
                  ref={portalFileInputRef}
                  type="file"
                  onChange={handlePortalFileSelect}
                  className="hidden"
                />
                {/* <button
                  type="button"
                  onClick={() => portalFileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Attach file or photo"
                >
                  <Paperclip className="w-4 h-4" />
                </button> */}
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder={attachedPortalFile ? "Add a caption (optional)..." : "Ask your attorney or petition writer a question..."}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="shrink-0 pl-1">
                  <button
                    type="submit"
                    disabled={(!newMsg.trim() && !attachedPortalFile) || isSendingMsg}
                    className="px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:shadow-md active:scale-95"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
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

          <div className="space-y-3">
            {appointments && appointments.length > 0 ? (
              appointments.map((apt: any) => {
                const isUpcoming = apt.status === 'Upcoming';
                const isCompleted = apt.status === 'Completed';
                return (
                  <div key={apt.id} className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isUpcoming ? 'bg-blue-50/60 border-blue-100' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isUpcoming ? 'bg-blue-600 text-white' : isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {apt.status} Session
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{apt.type}</h4>
                      <p className="text-slate-600">
                        {apt.date} at {apt.time} ({apt.duration}) • Specialist: <strong>{apt.specialist}</strong>
                      </p>
                      {apt.notes && (
                        <p className="text-slate-500 text-[11px] italic mt-0.5">{apt.notes}</p>
                      )}
                    </div>
                    {apt.meetingUrl && (
                      <a 
                        href={apt.meetingUrl}
                        target="_blank" 
                        rel="noreferrer"
                        className="px-4 py-2 bg-white text-blue-700 font-bold border border-blue-200 rounded-xl hover:bg-blue-50 cursor-pointer text-center shrink-0"
                      >
                        Join Call
                      </a>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                No scheduled strategy calls found. Click "Book Strategy Call" to schedule your consultation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 8: POST-FILING UPDATES (Stage 6 Guidance)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'postFiling' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                (caseData?.currentStage || 1) >= 6 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-purple-100 text-purple-800 border border-purple-200'
              }`}>
                {(caseData?.currentStage || 1) >= 6 ? 'Stage 6: Dispatched to USCIS' : 'Stage 6 Preview: Post-Filing Roadmap'}
              </span>
              {(caseData?.currentStage || 1) < 6 && (
                <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                  Currently in Stage {caseData?.currentStage || 1} of 7 (In Progress)
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-2">
              {(caseData?.currentStage || 1) >= 6 
                ? 'Your Petition Has Been Filed — Live Tracking & Milestones' 
                : 'Post-Filing Roadmap: What Happens After USCIS Submission?'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {(caseData?.currentStage || 1) >= 6 
                ? 'Your petition package has been dispatched to USCIS. Review real-time processing milestones below:' 
                : 'Your petition is currently being prepared. Here is the standard 8-step roadmap and timeline of what happens after your petition is shipped to USCIS:'}
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
                  (caseData.currentStage || 0) >= 6
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : (caseData.currentStage || 0) >= 4
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {(caseData.currentStage || 0) >= 6
                    ? '✓ Filed — Post-Filing Phase'
                    : `Stage ${caseData.currentStage || 1} of 7`}
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
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Personal Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">Your official candidate profile details registered in the database.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Verified Profile
              </span>
            </div>

            {profileMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {profileMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    readOnly
                    value={caseData.clientName}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium cursor-not-allowed opacity-90"
                    title="Name registered with case"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    readOnly
                    value={caseData.clientEmail}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium cursor-not-allowed opacity-90"
                    title="Login email address"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-500 font-semibold">Phone Number</label>
                    <span className="text-[10px] text-slate-400">10 Digits</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={clientPhone}
                    onChange={(e) => {
                      const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setClientPhone(numericOnly);
                    }}
                    placeholder="e.g. 5550123456"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Country of Birth / Origin</label>
                  <input
                    type="text"
                    value={clientCountry}
                    onChange={(e) => setClientCountry(e.target.value)}
                    placeholder="e.g. India, United Kingdom"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Field of Proposed Endeavor</label>
                <input
                  type="text"
                  value={clientField}
                  onChange={(e) => setClientField(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Clean Energy"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Details'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Account Security & Password Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Account Security &amp; Password</h3>
                <p className="text-xs text-slate-500 mt-0.5">Update your workspace password anytime to keep your portal secure.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> End-to-End Encrypted
              </span>
            </div>

            {passwordMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {passwordMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword || !newPassword}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  <span>{isUpdatingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Notification &amp; Communication Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">Control how Babel Global immigration specialists reach out to you.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" /> Real-time Alerts
              </span>
            </div>

            {prefsSavedToast && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Notification preferences saved successfully!
              </div>
            )}

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={whatsappUpdates}
                  onChange={(e) => setWhatsappUpdates(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 block">WhatsApp Updates &amp; Reminders</span>
                  <span className="text-slate-500 text-[11px]">Receive direct milestone &amp; task updates on WhatsApp</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-800 block">Email Digest &amp; Petition Drafts</span>
                  <span className="text-slate-500 text-[11px]">Formal exhibit review requests and draft delivery notifications</span>
                </div>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Notification Preferences</span>
              </button>
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
          userRole="client"
          currentUser={{ id: caseData.clientId, name: caseData.clientName, email: caseData.clientEmail, role: 'client' }}
        />
      )}

      {/* ── Action Lifecycle Modals ────────────────────────────────────────── */}

      {/* 1. Endeavor Statement Review Modal (st2-1) */}
      <Modal
        isOpen={isEndeavorModalOpen}
        onClose={() => setIsEndeavorModalOpen(false)}
        title="Review & Approve Proposed Endeavor Statement"
        subtitle="USCIS EB-2 NIW Dhanasar Prong 1 Assessment: Substantial Merit & National Importance"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-sm">Proposed Endeavor Formulation</span>
            </div>
            <p className="leading-relaxed font-medium text-slate-800 bg-white p-3.5 rounded-lg border border-blue-200">
              "{caseData?.dhanasar?.prong1?.endeavorSummary || (caseData as any)?.fieldOfEndeavor || `Advancing research, software architectures, and engineering innovations in ${caseData?.fieldCategory || 'technology'} to optimize critical systems, drive economic competitiveness, and advance national technological leadership in the United States.`}"
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Dhanasar 3-Prong Statutory Alignment:</h4>
            <ul className="space-y-1.5 text-slate-600 text-[11px] list-disc list-inside">
              <li><strong>Prong 1:</strong> The endeavor possesses substantial intrinsic merit and prospective national importance across the US.</li>
              <li><strong>Prong 2:</strong> Your education, research publications, and career milestones position you well to advance this endeavor.</li>
              <li><strong>Prong 3:</strong> On balance, it is beneficial to the United States to waive the requirement of a job offer and labor certification (PERM).</li>
            </ul>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Feedback or Suggested Minor Revisions <span className="font-normal text-slate-500">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={endeavorFeedback}
              onChange={(e) => setEndeavorFeedback(e.target.value)}
              placeholder="If you have minor factual corrections or specific project titles you'd like highlighted, write them here..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEndeavorModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                submitTaskAction(2, 'st2-1', undefined, {
                  type: 'endeavor',
                  title: 'Proposed Endeavor Statement',
                  feedback: endeavorFeedback || 'Approved by client without changes',
                  endeavorStatement: caseData?.dhanasar?.prong1?.endeavorSummary || `Advancing research, software architectures, and engineering innovations in ${caseData?.fieldCategory || 'technology'} to optimize critical systems, drive economic competitiveness, and advance national technological leadership in the United States.`,
                  submittedAt: new Date().toISOString()
                });
                setIsEndeavorModalOpen(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Approve Proposed Endeavor &amp; Submit</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. Recommender Identification Modal (st2-2) */}
      <Modal
        isOpen={isRecommenderActionModalOpen}
        onClose={() => setIsRecommenderActionModalOpen(false)}
        title="Identify 3 to 5 Expert Recommenders"
        subtitle="USCIS EB-2 NIW Dhanasar Prong 2: Substantial Recognition & Independent Evaluation"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-950 text-[11px] leading-relaxed">
            <span className="font-bold block mb-1">USCIS Adjudication Standard:</span>
            USCIS adjudicators place maximum evidentiary weight on testimonial letters provided by <strong>independent experts</strong> who know of your work through citations, implementations, or prestigious conferences, but have not directly collaborated with you.
          </div>

          {/* Current List */}
          <div>
            <h4 className="font-bold text-slate-900 text-xs mb-2">Identified Recommenders ({recList.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recList.map((rec, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">{rec.name}</span>
                    <span className="text-[11px] text-slate-500">{rec.institution || 'Institutional Affiliation'} • {rec.relationship || 'Independent Expert'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    {rec.relationship || 'Independent'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Recommender */}
          <div className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-800 block">Add New Expert Recommender Candidate</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Full Name (e.g., Prof. Elena Rostova)"
                value={newRecName}
                onChange={(e) => setNewRecName(e.target.value)}
                className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              />
              <input
                type="text"
                placeholder="Institution (e.g., Johns Hopkins University)"
                value={newRecInstitution}
                onChange={(e) => setNewRecInstitution(e.target.value)}
                className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Field / Specialization"
                value={newRecField}
                onChange={(e) => setNewRecField(e.target.value)}
                className="flex-1 p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (newRecName.trim()) {
                    setRecList(prev => [...prev, {
                      name: newRecName.trim(),
                      institution: newRecInstitution.trim() || 'Independent Research Institute',
                      relationship: 'Independent Expert',
                      field: newRecField.trim()
                    }]);
                    setNewRecName('');
                    setNewRecInstitution('');
                    setNewRecField('');
                  }
                }}
                className="px-4 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRecommenderActionModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                submitTaskAction(2, 'st2-2', undefined, {
                  type: 'recommenders',
                  title: 'Nominated Expert Recommenders Roster',
                  recommenders: recList,
                  submittedAt: new Date().toISOString()
                });
                setIsRecommenderActionModalOpen(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Submit Recommender Roster for Review</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Letters Dispatched Confirmation Modal (st2-4) */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Confirm Draft Letters Sent to Recommenders"
        subtitle="Keep your legal drafting team informed of external communications"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
            <p className="leading-relaxed">
              Your petition drafting team has prepared customized recommendation letters tailored to the specific qualifications of each recommender.
            </p>
            <p className="text-[11px] text-slate-600">
              Please confirm that you have reviewed the drafted letters and forwarded them to your recommenders for review and signature on official institutional letterhead.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
            <input
              type="checkbox"
              id="confirmDispatch"
              defaultChecked
              className="mt-0.5 w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <label htmlFor="confirmDispatch" className="text-slate-800 leading-snug cursor-pointer">
              <strong>I confirm that I have dispatched the drafted letters to my recommenders.</strong> Once signed on official letterhead, I will upload the signed copies in Stage 2.
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                submitTaskAction(2, 'st2-4', undefined, {
                  type: 'general',
                  title: 'Confirmation of Letters Dispatched',
                  note: 'Client confirmed all 3-5 draft recommendation letters have been delivered to external experts.',
                  submittedAt: new Date().toISOString()
                });
                setIsDispatchModalOpen(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Dispatched &amp; Submit for Review</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Shipping Address Confirmation Modal (st5-5) */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Confirm Mailing &amp; Shipping Address"
        subtitle="Official address for USCIS Form I-797C receipt notices and physical filing package"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
            Please verify your current United States or international physical mailing address. USCIS will mail your official Form I-797C Notice of Action to this address.
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Street Address</label>
              <input
                type="text"
                value={shipStreet}
                onChange={(e) => setShipStreet(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-800 mb-1">City</label>
                <input
                  type="text"
                  value={shipCity}
                  onChange={(e) => setShipCity(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">State / Province</label>
                <input
                  type="text"
                  value={shipState}
                  onChange={(e) => setShipState(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">ZIP / Postal Code</label>
                <input
                  type="text"
                  value={shipZip}
                  onChange={(e) => setShipZip(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Contact Phone</label>
              <input
                type="text"
                value={shipPhone}
                onChange={(e) => setShipPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                submitTaskAction(5, 'st5-5', undefined, {
                  type: 'shipping',
                  title: 'Confirmed USCIS Physical Filing Address',
                  shippingAddress: {
                    street: shipStreet,
                    city: shipCity,
                    state: shipState,
                    zip: shipZip,
                    phone: shipPhone
                  },
                  submittedAt: new Date().toISOString()
                });
                setIsAddressModalOpen(false);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Shipping Address</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. Inline Document Action Confirmation Modal */}
      <Modal
        isOpen={isInlineDocModalOpen}
        onClose={() => setIsInlineDocModalOpen(false)}
        title={activeActionTask ? `Evidence Submission: ${activeActionTask.name}` : "Upload Case Evidence Documents"}
        subtitle="Attach supporting documents and submit directly to immigration staff for review"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span className="font-bold">Required Evidence Upload</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-700">
              Upload your documents directly below. Once uploaded, the file will be attached to this task, placed in your case vault, and sent for legal review.
            </p>
          </div>

          {/* Already Attached Documents for this task */}
          {activeActionTask && (() => {
            const currentTaskDocs = getTaskMatchingDocuments({ id: activeActionTask.id, name: activeActionTask.name }, clientDocs);
            if (currentTaskDocs.length === 0) return null;
            return (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-700 block text-[11px]">
                  Attached to this task ({currentTaskDocs.length}):
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {currentTaskDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate max-w-[200px]" title={doc.name}>{doc.name}</span>
                        {doc.fileSize && <span className="text-[10px] text-slate-400">({doc.fileSize})</span>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {doc.status || 'Pending Review'}
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadDocumentFile(doc)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc, activeActionTask?.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                          title="Remove / Delete wrong document"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Direct File Upload Area */}
          <div>
            <input
              type="file"
              id="direct-subtask-file-input"
              className="hidden"
              onChange={handleDirectInlineFileUpload}
              disabled={isInlineUploading}
            />
            <label
              htmlFor="direct-subtask-file-input"
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                isInlineUploading 
                  ? 'bg-slate-100 border-slate-300 cursor-not-allowed opacity-75' 
                  : 'bg-slate-50 hover:bg-blue-50/50 border-slate-300 hover:border-blue-400'
              }`}
            >
              {isInlineUploading ? (
                <div className="flex flex-col items-center gap-2 text-blue-600">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span className="font-bold text-xs">Uploading &amp; attaching document...</span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800 text-xs">Click here to select and upload document</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">PDF, DOCX, PNG, JPG (up to 25MB)</span>
                </>
              )}
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsInlineDocModalOpen(false);
                if (openNewDocModal) openNewDocModal();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Or Open Full Vault Uploader</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInlineDocModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentTaskDocs = getTaskMatchingDocuments({ id: activeActionTask?.id || '', name: activeActionTask?.name || '' }, clientDocs);
                  const subPayload = currentTaskDocs.length > 0 ? {
                    type: 'document',
                    docName: currentTaskDocs[0].name,
                    documents: currentTaskDocs,
                    submittedAt: new Date().toISOString(),
                    note: `Submitted ${currentTaskDocs.length} evidence document(s) for legal review.`
                  } : undefined;
                  submitTaskAction(activeActionTask?.stageId || 1, activeActionTask?.id || 'st1-2', currentTaskDocs[0]?.name, subPayload);
                  setIsInlineDocModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <Check className="w-4 h-4" />
                <span>Submit for Legal Review</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Document View / Preview Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />

      {previewImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full pb-2 text-white text-xs">
              <span className="font-semibold truncate max-w-xs">{previewImageModal.name}</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImageModal.url}
                  download={previewImageModal.name}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                  title="Download full size"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImageModal(null)}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img 
              src={previewImageModal.url} 
              alt={previewImageModal.name} 
              className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl bg-black/40"
            />
          </div>
        </div>
      )}

    </div>
  );
};
