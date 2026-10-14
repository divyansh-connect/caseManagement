import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Mail, 
  Phone, 
  User, 
  Search, 
  CheckCheck,
  Clock,
  Paperclip,
  Sparkles,
  Smartphone,
  ShieldCheck,
  FileText,
  Filter,
  Download,
  Play,
  Pause,
  X,
  Maximize2,
  Image as ImageIcon
} from 'lucide-react';
import { CaseItem, CaseMessage, UserRole } from '../../types';
import { WhatsAppModal } from './WhatsAppModal';
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

interface ParsedAttachment {
  type: 'image' | 'document' | 'audio' | 'none';
  fileName?: string;
  fileSize?: string;
  dataUrl?: string;
  duration?: string;
  cleanText: string;
}

function parseMessageAttachments(rawContent: string, rawAttachments?: string[]): ParsedAttachment {
  let cleanText = (rawContent || '').replace(/^\[WA\]\s*/i, '').replace(/^\[wa\]:\s*/i, '').trim();
  let type: 'image' | 'document' | 'audio' | 'none' = 'none';
  let fileName = '';
  let fileSize = '';
  let dataUrl = '';
  let duration = '';

  // 1. Check Voice Note
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

  // 2. Check Photo / Image with embedded data
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

  // 3. Check Document Attachment with embedded data
  const attachWithDataMatch = cleanText.match(/📎\s*\[Attachment:\s*(.*?)\s*\((.*?)\)\]/i) || cleanText.match(/\[Attachment:\s*(.*?)\s*\((.*?)\)\]/i);
  if (attachWithDataMatch) {
    type = 'document';
    fileName = attachWithDataMatch[1];
    fileSize = attachWithDataMatch[2];
    cleanText = cleanText.replace(/📎\s*\[Attachment:\s*.*?\]/i, '').replace(/\[Attachment:\s*.*?\]/i, '').trim();
    return { type, fileName, fileSize, dataUrl, cleanText };
  }

  // 4. Check legacy [Attachment: filename]
  const legacyAttach = cleanText.match(/\[Attachment:\s*(.*?)\]/i);
  if (legacyAttach) {
    type = 'document';
    fileName = legacyAttach[1];
    fileSize = 'PDF Document';
    cleanText = cleanText.replace(/\[Attachment:\s*.*?\]/i, '').trim();
    return { type, fileName, fileSize, dataUrl: dataUrl || '', cleanText };
  }

  // 5. Check if rawAttachments has an image or document
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

const AudioPlayer: React.FC<{ audioUrl: string; duration?: string; isMe: boolean }> = ({ audioUrl, duration, isMe }) => {
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

interface AttachedFileItem {
  name: string;
  size: string;
  type: 'image' | 'doc';
  dataUrl: string;
}



interface CommunicationViewProps {
  cases: CaseItem[];
  messages: CaseMessage[];
  viewMode?: 'hub' | 'whatsapp';
  userRole?: UserRole;
  currentUser?: { id: string; name: string; email: string; role: UserRole; avatar?: string } | null;
  onNewMessage?: (msg: CaseMessage) => void;
}

export const CommunicationView: React.FC<CommunicationViewProps> = ({ 
  cases, 
  messages: initialMessages,
  viewMode = 'whatsapp',
  userRole,
  currentUser,
  onNewMessage
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [messages, setMessages] = useState<CaseMessage[]>(() => {
    try {
      const cached = localStorage.getItem('babel_hub_admin_messages_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialMessages;
  });
  const [newMsgText, setNewMsgText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'whatsapp' | 'internal'>('all');
  const [attachedFile, setAttachedFile] = useState<AttachedFileItem | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeViewMode, setActiveViewMode] = useState<'hub' | 'whatsapp'>(viewMode);

  useEffect(() => {
    if (viewMode) {
      setActiveViewMode(viewMode);
    }
  }, [viewMode]);

  // Sync messages when prop updates
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(prev => {
        const map = new Map<string, CaseMessage>();
        prev.forEach(m => map.set(m.id, m));
        initialMessages.forEach(m => map.set(m.id, m));
        return Array.from(map.values()).sort((a, b) => 
          (a.timestamp || '').localeCompare(b.timestamp || '')
        );
      });
    }
  }, [initialMessages]);

  // Persist messages in localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('babel_hub_admin_messages_cache', JSON.stringify(messages));
      } catch {}
    }
  }, [messages]);

  // Real-time automatic polling for new Messaging Hub messages without needing page refresh
  useEffect(() => {
    let isMounted = true;

    const pollHubMessages = async () => {
      try {
        const res = await api.get('/messages');
        if (!isMounted || !res.success || !Array.isArray(res.data)) return;

        setMessages(prev => {
          const map = new Map<string, CaseMessage>();
          prev.forEach(m => map.set(m.id, m));
          res.data.forEach((m: any) => map.set(m.id, m));
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

    // Trigger immediately on mount
    pollHubMessages();

    const interval = setInterval(pollHubMessages, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Map all case IDs belonging to this client to ensure entire conversation thread is visible
  const clientCaseIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (selectedCase?.id) ids.add(selectedCase.id);
    const targetClientId = selectedCase?.clientId || (selectedCase as any)?.client?.id;
    const targetEmail = (selectedCase?.clientEmail || (selectedCase as any)?.client?.email || '').toLowerCase().trim();
    const targetName = (selectedCase?.clientName || (selectedCase as any)?.client?.name || '').toLowerCase().trim();

    cases.forEach(c => {
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
    return ids;
  }, [selectedCase, cases]);

  const caseMessages = messages.filter(m => {
    const matchCase = (m.caseId && clientCaseIds.has(m.caseId)) || m.caseId === selectedCase?.id;
    const targetName = (selectedCase?.clientName || '').toLowerCase().trim();
    const sName = (m.senderName || '').toLowerCase().trim();
    const matchClientName = targetName && sName && (sName === targetName || sName.includes(targetName) || targetName.includes(sName));
    if (!matchCase && !matchClientName) return false;

    const text = m.content || '';
    const isWa = (m as any).channel === 'whatsapp' || text.startsWith('[WA] ') || text.startsWith('[wa]: ');
    return !isWa;
  });

  // Auto-scroll to bottom of conversation thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [caseMessages, selectedCaseId]);

  // Filter cases by search query
  const filteredCases = cases.filter(c => 
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.fieldCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const QUICK_TEMPLATES = [
    { label: '📋 Stage 8 Evidence Request', text: 'Hi, please upload your updated CV, Google Scholar citation metrics, and list of recommended experts for Stage 8 review.' },
    { label: '✍️ Recommender CV Reminder', text: 'Reminder: Please provide the CVs and current affiliation details for your 3 proposed recommenders.' },
    { label: '📄 Petition Draft Ready', text: 'Good news! Your EB-2 NIW Proposed Endeavor and 3-Prong Dhanasar Memorandum draft is ready for review in your portal.' },
    { label: '📑 USCIS Receipt Notice', text: 'Your petition filing receipt (Form I-797C) has been generated and logged in your Document Vault.' },
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    try {
      if (isImage) {
        let compressed = '';
        try {
          compressed = await compressImageToDataUrl(file);
        } catch {
          compressed = await readFileAsDataUrl(file);
        }
        setAttachedFile({
          name: file.name,
          size: formatFileSize(file.size),
          type: 'image',
          dataUrl: compressed
        });
      } else {
        const dataUrl = await readFileAsDataUrl(file);
        setAttachedFile({
          name: file.name,
          size: formatFileSize(file.size),
          type: 'doc',
          dataUrl
        });
      }
    } catch (err) {
      console.error('Error reading attachment file:', err);
    }
    e.target.value = '';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMsgText.trim() && !attachedFile) || !selectedCase) return;

    let contentToSend = newMsgText.trim();
    const attachmentsPayload: string[] = [];

    if (attachedFile) {
      if (attachedFile.type === 'image') {
        contentToSend = `📷 [Photo: ${attachedFile.name}] [DATA:${attachedFile.dataUrl}] ${contentToSend}`.trim();
      } else {
        contentToSend = `📎 [Attachment: ${attachedFile.name} (${attachedFile.size})] [DATA:${attachedFile.dataUrl}] ${contentToSend}`.trim();
      }
      attachmentsPayload.push(attachedFile.dataUrl);
    }

    setNewMsgText('');
    setAttachedFile(null);
    setIsSending(true);

    const isClientRole = userRole === 'client';
    const myRole = isClientRole ? 'client' : (userRole || 'admin');
    const myName = currentUser?.name || (isClientRole ? (selectedCase.clientName || 'Client') : (userRole === 'superadmin' ? 'Super Administrator' : 'Sarah Jenkins (Editorial Specialist)'));
    const targetCaseId = selectedCase.id;

    // 1. Optimistic send
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: CaseMessage = {
      id: tempId,
      caseId: targetCaseId,
      senderName: myName,
      senderRole: myRole,
      content: contentToSend,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      attachments: attachmentsPayload.length > 0 ? attachmentsPayload : undefined
    };

    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const data = await api.post('/messages', {
        caseId: targetCaseId,
        senderName: myName,
        senderRole: myRole,
        content: contentToSend,
        channel: 'portal',
        attachments: attachmentsPayload
      });

      if (data && data.success && data.data) {
        setMessages(prev => prev.map(m => m.id === tempId ? data.data : m));
        if (onNewMessage) onNewMessage(data.data);
      }
    } catch (err: any) {
      console.error('Failed to send admin message:', err.message);
    } finally {
      setIsSending(false);
    }
  };

  const renderLastMsgPreview = (content: string) => {
    if (!content) return 'No messages';
    if (content.includes('[AUDIO:') || content.includes('[Voice Note]')) {
      const dur = content.match(/\((0:[0-9]{2})\)/)?.[1] || '';
      return `🎤 Voice note ${dur}`.trim();
    }
    if (content.includes('📷 [Photo:') || content.includes('[DATA:data:image')) {
      return '📷 Photo';
    }
    if (content.includes('📎 [Attachment:')) {
      const fName = content.match(/\[Attachment:\s*(.*?)\s*\(/)?.[1] || 'Document';
      return `📎 ${fName}`;
    }
    const clean = content.replace(/^\[WA\]\s*/i, '').replace(/\[DATA:.*?\]/g, '').replace(/\[AUDIO:.*?\]/g, '').trim();
    return clean || 'Attachment';
  };

  const renderMessageBubbleContent = (m: CaseMessage, isMe: boolean) => {
    const parsed = parseMessageAttachments(m.content, m.attachments);

    return (
      <div className="space-y-1.5">
        {parsed.type === 'image' && parsed.dataUrl && (
          <div 
            onClick={() => setPreviewImageModal({ url: parsed.dataUrl!, name: parsed.fileName || 'Photo.jpg' })}
            className="overflow-hidden rounded-xl border border-black/10 relative group cursor-pointer max-w-sm mt-1"
          >
            <img 
              src={parsed.dataUrl} 
              alt={parsed.fileName || 'Image Attachment'} 
              className="max-h-56 w-auto max-w-full rounded-xl object-cover hover:scale-[1.02] transition-transform duration-200" 
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-black/75 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Maximize2 className="w-3 h-3" /> View Photo
              </span>
            </div>
          </div>
        )}

        {parsed.type === 'document' && (
          <div className={`p-2.5 rounded-xl flex items-center justify-between gap-3 border mt-1 ${
            isMe ? 'bg-blue-700/60 border-blue-500/40 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isMe ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs truncate max-w-[170px] sm:max-w-xs">{parsed.fileName}</div>
                <div className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>{parsed.fileSize || 'Document'}</div>
              </div>
            </div>
            {parsed.dataUrl ? (
              <a
                href={parsed.dataUrl}
                download={parsed.fileName || 'Attachment.pdf'}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isMe ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title="Download Attachment"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => alert(`Document: ${parsed.fileName}. Available in Document Vault.`)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isMe ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {parsed.type === 'audio' && parsed.dataUrl && (
          <div className="mt-1">
            <AudioPlayer audioUrl={parsed.dataUrl} duration={parsed.duration} isMe={isMe} />
          </div>
        )}

        {parsed.cleanText && (
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{parsed.cleanText}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">Client Messaging Hub</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            256-bit encrypted WhatsApp, Email & Portal communication logs for EB-2 NIW petition applicants.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveViewMode('whatsapp')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              activeViewMode === 'whatsapp'
                ? 'bg-emerald-600 text-white border border-emerald-500 shadow-sm'
                : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700'
            }`}
            title="Switch to WhatsApp Web Live Chat"
          >
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">WhatsApp Live Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewMode('hub')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
              activeViewMode === 'hub'
                ? 'bg-blue-600 text-white border border-blue-500 shadow-sm'
                : 'bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700'
            }`}
            title="Switch to Messaging Hub Logs"
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Messaging Hub Logs</span>
          </button>
        </div>
      </div>

      {activeViewMode === 'whatsapp' ? (
        <WhatsAppModal 
          isOpen={true}
          isFullPage={true}
          onClose={() => setActiveViewMode('hub')}
          defaultClientName={selectedCase?.clientName}
          userRole={userRole}
          currentUser={currentUser}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Client Threads */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-64 lg:h-[600px]">
          <div className="p-3.5 sm:p-4 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Active Client Threads</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {cases.length} Applicants
              </span>
            </div>

            {/* Thread Search Bar */}
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search applicant name, case ID..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* List of Clients */}
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {filteredCases.map(c => {
              const isSelected = c.id === selectedCase?.id;
              const caseMsgs = messages.filter(m => m.caseId === c.id);
              const lastMsg = caseMsgs[caseMsgs.length - 1];

              return (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-3.5 sm:p-4 cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-xs text-slate-900 truncate">{c.clientName}</div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{c.caseNumber}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">
                    {c.fieldCategory}
                  </div>

                  {lastMsg ? (
                    <div className="text-[11px] text-slate-400 mt-1 truncate flex items-center gap-1">
                      <span className="font-semibold text-slate-600">{lastMsg.senderName.split(' ')[0]}:</span>
                      <span className="truncate">{renderLastMsgPreview(lastMsg.content)}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 mt-1 italic">No recent messages</div>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                      Stage {c.currentStage}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Live</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chat Conversation Thread */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[500px] sm:h-[600px]">
          {/* Thread Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {selectedCase?.clientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 truncate">
                  <span className="truncate">{selectedCase?.clientName}</span>
                  <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-mono font-semibold shrink-0">
                    {selectedCase?.caseNumber}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 truncate">
                  <span className="truncate">{selectedCase?.clientEmail}</span>
                  <span>•</span>
                  <span className="text-slate-600 font-medium truncate">{selectedCase?.fieldCategory}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold border border-emerald-200">
                Stage {selectedCase?.currentStage} Active
              </span>
            </div>
          </div>

          {/* Quick AI Response Templates */}
          <div className="px-3 sm:px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick:
            </span>
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setNewMsgText(tmpl.text)}
                className="text-[11px] bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-700 px-2.5 py-1 rounded-lg shrink-0 transition-colors shadow-2xs font-medium cursor-pointer"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/30">
            {caseMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No message history yet</p>
                <p className="text-xs text-slate-400">Start the conversation with {selectedCase?.clientName} below.</p>
              </div>
            ) : (
              caseMessages.map(m => {
                const isMe = userRole === 'client'
                  ? m.senderRole === 'client'
                  : m.senderRole !== 'client';

                return (
                  <div 
                    key={m.id} 
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div 
                      className={`p-3 sm:p-3.5 rounded-2xl max-w-[85%] sm:max-w-lg shadow-2xs ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-xs' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <div className={`flex items-center justify-between gap-3 mb-1 text-[10px] ${
                        isMe ? 'text-blue-100 font-semibold' : 'text-slate-500 font-semibold'
                      }`}>
                        <span className="truncate">{isMe ? 'You' : m.senderName}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{m.timestamp}</span>
                        </span>
                      </div>
                      {renderMessageBubbleContent(m, isMe)}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached File Preview Badge */}
          {attachedFile && (
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2.5 min-w-0">
                {attachedFile.type === 'image' ? (
                  <img src={attachedFile.dataUrl} alt="preview" className="w-9 h-9 object-cover rounded-lg border border-blue-200 shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px] sm:max-w-md">{attachedFile.name}</span>
                  <span className="text-[10px] text-slate-500">{attachedFile.size} • Ready to send</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setAttachedFile(null)} 
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0 ml-2"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Message Input & Send Form */}
          <form onSubmit={handleSend} className="px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-200 flex items-center gap-2.5 bg-white">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.xls,.xlsx,.csv"
              onChange={handleFileSelect}
            />
            {/* <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach File / Document"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors shrink-0 cursor-pointer shadow-2xs active:scale-95"
            >
              <Paperclip className="w-4 h-4" />
            </button> */}

            <input
              type="text"
              value={newMsgText}
              onChange={(e) => setNewMsgText(e.target.value)}
              placeholder={`Write message to ${selectedCase?.clientName || 'applicant'}...`}
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="shrink-0 pl-1 pr-1">
              <button
                type="submit"
                disabled={(!newMsgText.trim() && !attachedFile) || isSending}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-95"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
      )}

      {/* Lightbox / High-Res Image Preview Modal */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
              <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate max-w-md">{previewImageModal.name}</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImageModal.url}
                  download={previewImageModal.name}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImageModal(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 sm:p-6 overflow-auto flex items-center justify-center bg-black/50">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.name}
                className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
