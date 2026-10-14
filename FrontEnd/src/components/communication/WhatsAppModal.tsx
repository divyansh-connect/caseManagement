import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  Search, 
  MoreVertical, 
  CheckCheck, 
  Smile, 
  Mic, 
  MessageCircle, 
  Lock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Scale,
  Trash2,
  Play,
  Pause,
  Download,
  Image,
  FileText,
  FileUp,
  Volume2
} from 'lucide-react';
import { api } from '../../services/api';
import { UserRole } from '../../types';

export interface WhatsAppModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultClientName?: string;
  isFullPage?: boolean;
  userRole?: UserRole;
  currentUser?: { id: string; name: string; email: string; role: UserRole; avatar?: string } | null;
}

export interface ChatContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  avatarBg: string;
  lastMsg: string;
  lastTime: string;
  unreadCount: number;
  online: boolean;
  clientRealName?: string;
  caseNumber?: string;
}

export interface WhatsAppMessage {
  id: string;
  caseId?: string;
  senderRole: string; // 'superadmin' | 'admin' | 'writer' | 'reviewer' | 'client'
  senderName: string;
  sender: 'client' | 'me';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachment?: string;
  attachmentData?: string;
  attachmentType?: 'image' | 'document';
  fileName?: string;
  fileSize?: string;
  audioUrl?: string;
  audioDuration?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const compressImageToDataUrl = (file: File, maxWidth = 900, maxHeight = 900, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        try {
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
          if (!ctx) {
            resolve((e.target?.result as string) || '');
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string) || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const parseWhatsAppMessage = (m: any, isClient: boolean): WhatsAppMessage | null => {
  const rawContent = m.content || m.text || '';
  const isWhatsAppMessage = 
    m.channel === 'whatsapp' || 
    rawContent.startsWith('[WA] ') || 
    rawContent.startsWith('[wa]: ');

  if (!isWhatsAppMessage) return null;

  let cleanText = rawContent;
  if (cleanText.startsWith('[WA] ')) cleanText = cleanText.substring(5);
  else if (cleanText.startsWith('[wa]: ')) cleanText = cleanText.substring(6);

  let audioUrl: string | undefined = undefined;
  let audioDuration: string | undefined = undefined;
  let attachmentData: string | undefined = undefined;
  let fileName: string | undefined = undefined;
  let fileSize: string | undefined = undefined;
  let attachmentType: 'image' | 'document' | undefined = undefined;

  // Extract embedded audio
  const audioMatch = cleanText.match(/\[AUDIO:(.*?)\]/);
  if (audioMatch) {
    audioUrl = audioMatch[1];
    cleanText = cleanText.replace(/\[AUDIO:.*?\]/, '').trim();
    const durMatch = cleanText.match(/🎤 \[Voice Note\] \((.*?)\)/);
    if (durMatch) audioDuration = durMatch[1];
  }

  // Extract embedded attachment data URL
  const dataMatch = cleanText.match(/\[DATA:(.*?)\]/);
  if (dataMatch) {
    attachmentData = dataMatch[1];
    cleanText = cleanText.replace(/\[DATA:.*?\]/, '').trim();
  }

  // Extract attachment file metadata
  const attachMatch = cleanText.match(/📎 \[Attachment: (.*?) \((.*?)\)\]/);
  if (attachMatch) {
    fileName = attachMatch[1];
    fileSize = attachMatch[2];
    attachmentType = /\.(png|jpe?g|webp|gif|svg|jfif)$/i.test(fileName) ? 'image' : 'document';
  }

  const sRole = m.senderRole || 'admin';
  const sName = m.senderName || 'Legal Team';

  return {
    id: m.id,
    caseId: m.caseId,
    senderRole: sRole,
    senderName: sName,
    sender: isClient ? (sRole === 'client' ? 'client' : 'me') : (sRole === 'client' ? 'client' : 'me'),
    text: cleanText,
    timestamp: m.timestamp ? (m.timestamp.length > 10 ? m.timestamp.substring(11, 16) : m.timestamp) : '12:00',
    status: 'read',
    audioUrl,
    audioDuration,
    attachmentData,
    fileName,
    fileSize,
    attachmentType
  };
};

const getContactPreviewText = (msg: WhatsAppMessage | null): string => {
  if (!msg) return 'Conversation initiated on portal.';
  if (msg.audioUrl || msg.text.includes('[Voice Note]')) {
    return `🎤 Voice Note (${msg.audioDuration || '0:05'})`;
  }
  if (msg.fileName || msg.text.includes('📎 [Attachment:')) {
    return `📎 ${msg.fileName || 'Attachment'}`;
  }
  return msg.text;
};

const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜',
      '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞',
      '😔', '😟', '😕', '🙁', '🥺', '😢', '😭', '😤', '😠', '😡',
      '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'
    ]
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: '👍',
    emojis: [
      '👍', '👎', '👌', '🤌', '✌️', '🤞', '🖖', '🤘', '🤙', '👈',
      '👉', '👆', '👇', '☝️', '🖐️', '✋', '👋', '✍️', '👏', '🙌',
      '👐', '🤲', '🤝', '🙏', '💪', '🤳'
    ]
  },
  {
    id: 'legal',
    name: 'Legal & Cases',
    icon: '📄',
    emojis: [
      '📄', '📑', '📁', '📂', '📝', '💼', '📌', '📍', '📎', '✉️',
      '📩', '📨', '📧', '📬', '📮', '📅', '📆', '⏱️', '⏳', '⌛',
      '⚖️', '🏛️', '🏢', '🎓', '🖊️', '🔍', '💡', '✅', '❌', '⚠️',
      'ℹ️', '🔔', '📢', '🔒', '🔓', '🛡️'
    ]
  },
  {
    id: 'travel',
    name: 'Travel & US',
    icon: '✈️',
    emojis: [
      '🇺🇸', '🇮🇳', '🇨🇦', '🇬🇧', '🇦🇺', '🇪🇺', '✈️', '🛫', '🛬', '🛂',
      '🛃', '🗽', '🌍', '🌎', '🌏', '🚀', '🌐', '🗺️', '🧳', '🏢'
    ]
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '⭐', '🌟',
      '✨', '💫', '🔥', '💯', '🎉', '🎊', '🏆', '🎯', '💬'
    ]
  }
];

const VoiceNotePlayer: React.FC<{ audioUrl?: string; duration?: string; isMe: boolean }> = ({ 
  audioUrl, 
  duration = '0:05', 
  isMe 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('0:00');

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Audio play error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      const p = (cur / dur) * 100;
      setProgress(isNaN(p) ? 0 : p);

      const mins = Math.floor(cur / 60);
      const secs = Math.floor(cur % 60);
      setCurrentTimeStr(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTimeStr('0:00');
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = pct * audioRef.current.duration;
    setProgress(pct * 100);
  };

  return (
    <div className="flex items-center gap-3 py-1.5 min-w-[210px] sm:min-w-[260px] select-none">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={(e) => console.warn('Audio tag playback error:', e)}
        />
      )}
      <button
        type="button"
        onClick={togglePlay}
        disabled={!audioUrl}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-transform active:scale-95 shadow-md ${
          audioUrl
            ? 'bg-[#00a884] hover:bg-[#008f70] text-white'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
        title={audioUrl ? (isPlaying ? 'Pause Voice Note' : 'Play Voice Note') : 'Audio not available'}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 translate-x-0.5 fill-white" />}
      </button>

      {/* Waveform Visualization with Click to Seek */}
      <div className="flex-1 space-y-1">
        <div 
          onClick={handleSeek}
          className="flex items-center gap-0.5 h-6 cursor-pointer py-1"
          title="Click to seek"
        >
          {[35, 65, 25, 80, 55, 95, 45, 85, 50, 90, 65, 40, 75, 45, 85, 60, 40, 70, 30, 60, 45, 80, 55, 35].map((h, i) => {
            const barPct = (i / 24) * 100;
            const isFilled = progress >= barPct;
            return (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full transition-colors ${
                  isFilled 
                    ? (isMe ? 'bg-emerald-300' : 'bg-[#00a884]') 
                    : 'bg-slate-500/40 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>{isPlaying ? currentTimeStr : duration}</span>
          <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium">
            <Mic className="w-3 h-3" /> Voice Note
          </span>
        </div>
      </div>
    </div>
  );
};

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen = true,
  onClose,
  defaultClientName,
  isFullPage = true,
  userRole,
  currentUser
}) => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [messagesMap, setMessagesMap] = useState<Record<string, WhatsAppMessage[]>>({});
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New interactive states for Emoji, Attachment & Voice Note
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('smileys');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: 'document' | 'image';
    previewUrl?: string;
    dataUrl?: string;
    file?: File;
  } | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; name: string } | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  const docInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Determine effective user role and client flag
  const effectiveRole: UserRole = userRole || currentUser?.role || (localStorage.getItem('override_user_role') as UserRole) || (() => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload?.role as UserRole;
      }
    } catch {}
    return 'client' as UserRole;
  })() || 'client';

  const isClient = effectiveRole === 'client';

  const avatarColors = [
    'bg-emerald-700',
    'bg-blue-600',
    'bg-purple-600',
    'bg-amber-600',
    'bg-teal-600',
    'bg-indigo-600',
    'bg-cyan-700'
  ];

  // Fetch real contacts and messages from the backend database
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [casesRes, msgsRes] = await Promise.all([
          api.get('/cases'),
          api.get('/messages')
        ]);

        const casesList = casesRes.success && Array.isArray(casesRes.data) ? casesRes.data : [];
        const allMessages = msgsRes.success && Array.isArray(msgsRes.data) ? msgsRes.data : [];

        // Build messages map grouped by caseId - ONLY WHATSAPP MESSAGES
        const newMessagesMap: Record<string, WhatsAppMessage[]> = {};
        allMessages.forEach((m: any) => {
          const parsedMsg = parseWhatsAppMessage(m, isClient);
          if (!parsedMsg) return;

          const cId = parsedMsg.caseId || m.caseId;
          if (!newMessagesMap[cId]) {
            newMessagesMap[cId] = [];
          }
          newMessagesMap[cId].push(parsedMsg);
        });

        // Filter cases if client is logged in
        let relevantCases = casesList;
        if (isClient) {
          const matchName = (currentUser?.name || defaultClientName || '').toLowerCase().trim();
          const matchEmail = (currentUser?.email || '').toLowerCase().trim();
          const matched = casesList.filter((c: any) => {
            const cName = (c.client?.name || c.clientName || '').toLowerCase().trim();
            const cEmail = (c.client?.email || c.clientEmail || '').toLowerCase().trim();
            return (matchName && cName.includes(matchName)) || (matchEmail && cEmail.includes(matchEmail));
          });
          if (matched.length > 0) {
            relevantCases = matched;
          }
        }

        // Deduplicate contacts so each unique client appears only once
        const uniqueCases: any[] = [];
        const seenClients = new Set<string>();

        relevantCases.forEach((c: any) => {
          const clientIdentifier = (
            c.clientId || 
            c.client?.id || 
            c.client?.email || 
            c.clientEmail || 
            c.client?.name || 
            c.clientName || 
            c.id
          ).toLowerCase().trim();

          if (!seenClients.has(clientIdentifier)) {
            seenClients.add(clientIdentifier);
            uniqueCases.push(c);
          }
        });

        // Build contacts
        const mappedContacts: ChatContact[] = uniqueCases.map((c: any, index: number) => {
          const caseMsgs = newMessagesMap[c.id] || [];
          const lastMsgObj = caseMsgs.length > 0 ? caseMsgs[caseMsgs.length - 1] : null;
          const previewText = getContactPreviewText(lastMsgObj);

          if (isClient) {
            return {
              id: c.id,
              name: 'Babel Global Legal Counsel',
              phone: '+1 (800) 555-0199',
              role: `Case #${c.caseNumber || 'EB2-NIW'} • Assigned Legal Team`,
              avatarBg: 'bg-emerald-800',
              lastMsg: previewText,
              lastTime: lastMsgObj ? lastMsgObj.timestamp : (c.lastUpdated ? c.lastUpdated.substring(11, 16) : 'Active'),
              unreadCount: 0,
              online: true,
              clientRealName: c.client?.name || c.clientName || currentUser?.name || 'Client',
              caseNumber: c.caseNumber
            };
          }

          return {
            id: c.id,
            name: c.client?.name || c.clientName || 'Client',
            phone: c.client?.phone || '+1 (555) 012-3456',
            role: c.fieldCategory || c.petitionCategory || 'EB-2 NIW',
            avatarBg: avatarColors[index % avatarColors.length],
            lastMsg: previewText,
            lastTime: lastMsgObj ? lastMsgObj.timestamp : (c.lastUpdated ? c.lastUpdated.substring(11, 16) : 'Active'),
            unreadCount: 0,
            online: index % 2 === 0,
            clientRealName: c.client?.name || c.clientName,
            caseNumber: c.caseNumber
          };
        });

        setContacts(mappedContacts);
        setMessagesMap(newMessagesMap);

        if (mappedContacts.length > 0) {
          if (defaultClientName) {
            const matched = mappedContacts.find(ct => 
              ct.name.toLowerCase().includes(defaultClientName.toLowerCase()) || 
              (ct.clientRealName && ct.clientRealName.toLowerCase().includes(defaultClientName.toLowerCase()))
            );
            setSelectedContactId(matched ? matched.id : mappedContacts[0].id);
          } else if (!selectedContactId) {
            setSelectedContactId(mappedContacts[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading WhatsApp dynamic data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [defaultClientName, isClient, currentUser]);

  // Real-time automatic polling for new WhatsApp messages without needing page refresh
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const pollLatestWhatsAppMessages = async () => {
      try {
        const msgsRes = await api.get('/messages');
        if (!isMounted || !msgsRes.success || !Array.isArray(msgsRes.data)) return;

        const allMessages = msgsRes.data;

        setMessagesMap(prevMap => {
          let hasChanged = false;
          const updatedMap: Record<string, WhatsAppMessage[]> = { ...prevMap };

          allMessages.forEach((m: any) => {
            const parsedMsg = parseWhatsAppMessage(m, isClient);
            if (!parsedMsg) return;

            const cId = parsedMsg.caseId || m.caseId;
            if (!updatedMap[cId]) {
              updatedMap[cId] = [];
            }

            const exists = updatedMap[cId].some(existing => existing.id === parsedMsg.id);
            if (!exists) {
              hasChanged = true;
              updatedMap[cId].push(parsedMsg);
            }
          });

          if (hasChanged) {
            setContacts(prevContacts => prevContacts.map(c => {
              const cMsgs = updatedMap[c.id] || [];
              const latest = cMsgs.length > 0 ? cMsgs[cMsgs.length - 1] : null;
              if (latest) {
                const preview = getContactPreviewText(latest);
                if (c.lastMsg !== preview || c.lastTime !== latest.timestamp) {
                  return { ...c, lastMsg: preview, lastTime: latest.timestamp };
                }
              }
              return c;
            }));
            return updatedMap;
          }

          return prevMap;
        });
      } catch (err) {
        // Silently ignore background polling errors
      }
    };

    // Fast polling every 2.5 seconds
    const interval = setInterval(pollLatestWhatsAppMessages, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, isClient]);

  const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];
  const activeMessages = activeContact ? (messagesMap[activeContact.id] || []) : [];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeMessages, selectedContactId]);

  if (!isOpen) return null;

  const sendSpecialMessage = async (
    contentToSend: string, 
    extra?: { 
      audioUrl?: string; 
      audioDuration?: string;
      attachmentData?: string;
      attachmentType?: 'image' | 'document';
      fileName?: string;
      fileSize?: string;
    }
  ) => {
    if (!activeContact) return;
    const myRole = isClient ? 'client' : (effectiveRole || 'admin');
    const myName = currentUser?.name || (isClient 
      ? (activeContact.clientRealName || defaultClientName || 'Client') 
      : (effectiveRole === 'superadmin' ? 'Super Administrator' : 'Legal Counsel'));

    try {
      const payloadContent = `[WA] ${contentToSend}`;
      const res = await api.post('/messages', {
        caseId: activeContact.id,
        senderName: myName,
        senderRole: myRole,
        content: payloadContent,
        channel: 'whatsapp'
      });

      // Clean display text without embedded tags
      let cleanText = contentToSend;
      if (cleanText.includes('[AUDIO:')) cleanText = cleanText.replace(/\[AUDIO:.*?\]/, '').trim();
      if (cleanText.includes('[DATA:')) cleanText = cleanText.replace(/\[DATA:.*?\]/, '').trim();

      const newMsg: WhatsAppMessage = {
        id: res.data?.id || `msg-${Date.now()}`,
        caseId: activeContact.id,
        senderRole: myRole,
        senderName: myName,
        sender: isClient ? 'client' : 'me',
        text: cleanText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'read',
        audioUrl: extra?.audioUrl,
        audioDuration: extra?.audioDuration,
        attachmentData: extra?.attachmentData,
        attachmentType: extra?.attachmentType,
        fileName: extra?.fileName,
        fileSize: extra?.fileSize
      };

      setMessagesMap(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
      }));

      const previewText = getContactPreviewText(newMsg);
      setContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, lastMsg: previewText, lastTime: newMsg.timestamp } : c));
    } catch (err: any) {
      console.error('Failed to send message:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || !activeContact) return;

    let contentToSend = inputText.trim();
    let extraData: any = undefined;

    if (attachedFile) {
      extraData = {
        attachmentData: attachedFile.dataUrl,
        attachmentType: attachedFile.type,
        fileName: attachedFile.name,
        fileSize: attachedFile.size
      };

      const fileHeader = `📎 [Attachment: ${attachedFile.name} (${attachedFile.size})] [DATA:${attachedFile.dataUrl || ''}]`;
      if (contentToSend) {
        contentToSend = `${fileHeader}\n${contentToSend}`;
      } else {
        contentToSend = fileHeader;
      }
    }

    setInputText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    await sendSpecialMessage(contentToSend, extraData);
  };

  // Voice Recording Handlers
  const startRecording = async () => {
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Voice recording is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(200); // 200ms timeslice to ensure continuous audio data capture
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      alert('Microphone access is required to record voice notes. Please allow microphone permissions in your browser.');
    }
  };

  const cancelRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {}
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = async () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    const sec = recordingSeconds;
    const mins = Math.floor(sec / 60);
    const remSec = sec % 60;
    const durStr = `${mins}:${remSec < 10 ? '0' : ''}${remSec}`;

    if (mediaRecorderRef.current) {
      const rec = mediaRecorderRef.current;
      rec.onstop = async () => {
        try {
          const mimeType = rec.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          rec.stream?.getTracks().forEach(t => t.stop());

          if (audioBlob.size === 0) {
            console.warn('Recorded audio blob is empty');
            return;
          }

          const base64Audio = await blobToBase64(audioBlob);
          await sendSpecialMessage(`🎤 [Voice Note] (${durStr}) [AUDIO:${base64Audio}]`, { 
            audioUrl: base64Audio, 
            audioDuration: durStr 
          });
        } catch (err) {
          console.error('Failed to process voice note:', err);
        }
      };

      try {
        if (rec.state !== 'inactive') {
          rec.stop();
        }
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Attachment Selection Handlers
  const handleDocFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setShowAttachMenu(false);
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB. For large petition files, please use the Document Vault tab.');
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        setAttachedFile({
          name: file.name,
          size: formatFileSize(file.size),
          type: 'document',
          dataUrl,
          file
        });
      } catch (err) {
        console.error('Error reading document:', err);
      }
      e.target.value = '';
    }
  };

  const handleMediaFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setShowAttachMenu(false);
      try {
        const compressedDataUrl = await compressImageToDataUrl(file);
        setAttachedFile({
          name: file.name,
          size: formatFileSize(file.size),
          type: 'image',
          previewUrl: compressedDataUrl,
          dataUrl: compressedDataUrl,
          file
        });
      } catch (err) {
        console.error('Error compressing image:', err);
        const dataUrl = await readFileAsDataUrl(file);
        setAttachedFile({
          name: file.name,
          size: formatFileSize(file.size),
          type: 'image',
          previewUrl: dataUrl,
          dataUrl,
          file
        });
      }
      e.target.value = '';
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.clientRealName && c.clientRealName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const content = (
    <div className={`bg-[#111b21] w-full ${
      isFullPage 
        ? 'h-[calc(100vh-7.5rem)] sm:h-[calc(100vh-6.5rem)] min-h-[600px] rounded-xl shadow-xl' 
        : 'max-w-5xl h-[92vh] max-h-[780px] rounded-2xl shadow-2xl'
    } overflow-hidden flex flex-col border border-slate-800 text-slate-100 animate-fadeIn`}>
      
      {/* Top WhatsApp Web Bar */}
      <div className="bg-[#202c33] px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#222d34] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-[#00a884]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="font-bold text-xs sm:text-sm text-slate-100 tracking-wide truncate">WhatsApp Business Web</h2>
              <span className="bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-semibold hidden sm:flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-pulse"></span>
                Database Connected
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
              {isClient ? `Logged in as Client: ${currentUser?.name || defaultClientName || 'Applicant'}` : 'Babel Global Live Legal & Case Management Suite'}
            </p>
          </div>
        </div>

        {onClose && (
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={onClose}
              className="px-2.5 sm:px-3 py-1 bg-[#202c33] hover:bg-[#374248] border border-[#374248] rounded-lg text-[11px] sm:text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
              title="Close or switch view"
            >
              <span>{isFullPage ? 'Messaging Hub' : 'Close'}</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Body: Left Sidebar + Right Chat Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel: Contacts & Threads */}
        <div className={`${showMobileChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 bg-[#111b21] border-r border-[#222d34] shrink-0`}>
          
          {/* Search Bar */}
          <div className="p-2.5 bg-[#111b21] border-b border-[#222d34]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isClient ? "Search conversation..." : "Search case contacts..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#202c33] text-xs text-slate-200 placeholder-slate-400 rounded-lg pl-9 pr-3 py-2 border-none focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/40">
            {filteredContacts.map(contact => {
              const isSelected = activeContact && contact.id === activeContact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedContactId(contact.id);
                    setShowMobileChat(true);
                  }}
                  className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-11 h-11 rounded-full ${contact.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                      {isClient ? (
                        <Scale className="w-5 h-5 text-emerald-300" />
                      ) : (
                        contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                      )}
                    </div>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00a884] border-2 border-[#111b21]"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs text-slate-100 truncate">{contact.name}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{contact.lastTime}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{contact.lastMsg}</p>
                    <span className="text-[9px] text-[#00a884] truncate block mt-0.5 font-medium">{contact.role}</span>
                  </div>
                </div>
              );
            })}

            {filteredContacts.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active candidate conversations found.
              </div>
            )}
          </div>

          {/* Encryption notice at bottom of list */}
          <div className="p-3 bg-[#111b21] border-t border-[#222d34] text-center">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-[#00a884]" />
              <span>Real-time database-driven communication</span>
            </p>
          </div>
        </div>

        {/* Right Panel: Active WhatsApp Chat Window */}
        {activeContact ? (
          <div className={`${!showMobileChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#0b141a] relative`}>
            
            {/* WhatsApp Wallpaper Pattern Overlay */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#00a884 1px, transparent 1px)`,
                backgroundSize: '16px 16px'
              }}
            ></div>

            {/* Chat Room Top Header */}
            <div className="bg-[#202c33] px-4 py-2.5 border-b border-[#222d34] flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1 text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={`w-9 h-9 rounded-full ${activeContact.avatarBg} text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0`}>
                  {isClient ? (
                    <Scale className="w-4 h-4 text-emerald-300" />
                  ) : (
                    activeContact.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-100 flex items-center gap-2">
                    {activeContact.name}
                  </h3>
                  <p className="text-[10px] text-[#00a884] font-medium flex items-center gap-1">
                    {activeContact.online ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]"></span>
                        <span>
                          {isClient 
                            ? `online • Dedicated Legal & Petition Counsel • Case: ${activeContact.caseNumber || 'Active'}` 
                            : `online • ${activeContact.phone}`
                          }
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">{activeContact.phone}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <button className="p-1.5 hover:bg-[#374248] rounded-full hover:text-slate-200 transition-colors cursor-pointer" title="Start Voice Call">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-[#374248] rounded-full hover:text-slate-200 transition-colors cursor-pointer" title="Start Video Call">
                  <Video className="w-4 h-4" />
                </button>
                <div className="h-4 w-px bg-slate-700 mx-1"></div>
                <button className="p-1.5 hover:bg-[#374248] rounded-full hover:text-slate-200 transition-colors cursor-pointer" title="Search Chat">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-1.5 hover:bg-[#374248] rounded-full hover:text-slate-200 transition-colors cursor-pointer" title="Options">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 z-10">
              
              {/* Date Stamp Banner */}
              <div className="flex justify-center my-2">
                <span className="bg-[#182229] border border-[#222d34] text-[10px] text-slate-400 font-semibold px-3 py-1 rounded-md uppercase tracking-wider shadow-xs">
                  Case Activity Log
                </span>
              </div>

              {/* Encryption Banner */}
              <div className="bg-[#182229] border border-[#222d34] p-2.5 rounded-lg max-w-md mx-auto text-center shadow-xs">
                <p className="text-[11px] text-amber-300/90 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Case correspondence is synced directly with your verified case database.</span>
                </p>
              </div>

              {/* Conversation Messages */}
              {activeMessages.map((msg) => {
                // If logged in as client:
                //   Client messages => 'isMe' (Right side, Green)
                //   Admin/SuperAdmin/Staff messages => Incoming (Left side, Grey)
                // If logged in as Admin/SuperAdmin/Staff:
                //   Admin/Staff messages => 'isMe' (Right side, Green)
                //   Client messages => Incoming (Left side, Grey)
                const isMe = isClient
                  ? (msg.senderRole === 'client')
                  : (msg.senderRole !== 'client');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`relative max-w-[85%] sm:max-w-md px-3.5 py-2.5 rounded-xl text-xs leading-relaxed shadow-sm transition-all ${
                        isMe
                          ? 'bg-[#005c4b] text-slate-100 rounded-tr-none border border-[#005c4b]/80'
                          : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-[#2d3a43]'
                      }`}
                    >
                      {/* Content: Voice note, Attachment, or Text */}
                      {msg.text.includes('[Voice Note]') ? (
                        <VoiceNotePlayer
                          audioUrl={msg.audioUrl}
                          duration={msg.audioDuration || msg.text.match(/\((.*?)\)/)?.[1] || '0:05'}
                          isMe={isMe}
                        />
                      ) : (msg.text.includes('📎 [Attachment:') || msg.attachmentData) ? (
                        <div className="space-y-1.5">
                          {(() => {
                            const match = msg.text.match(/📎 \[Attachment: (.*?) \((.*?)\)\]/);
                            const fileName = msg.fileName || (match ? match[1] : 'Attached File');
                            const fileSize = msg.fileSize || (match ? match[2] : 'File');
                            const fileData = msg.attachmentData;
                            const isImg = msg.attachmentType === 'image' || 
                              /\.(png|jpe?g|webp|gif|svg|jfif)$/i.test(fileName) || 
                              (fileData && fileData.startsWith('data:image'));
                            const caption = msg.text.replace(/📎 \[Attachment: .*?\]\n?/, '').trim();

                            return (
                              <div className="space-y-1.5">
                                {isImg && fileData ? (
                                  /* Rich Image Preview with Zoom and Download */
                                  <div className="rounded-lg overflow-hidden border border-white/10 group relative max-w-[280px] sm:max-w-sm bg-black/40">
                                    <img
                                      src={fileData}
                                      alt={fileName}
                                      onClick={() => setPreviewImageModal({ url: fileData, name: fileName })}
                                      className="w-full max-h-64 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-all"
                                      title="Click to view full photo"
                                    />
                                    <div className="p-2 flex items-center justify-between gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-white truncate max-w-[160px] sm:max-w-[200px]">{fileName}</p>
                                        <p className="text-[9px] text-slate-300">{fileSize}</p>
                                      </div>
                                      <a
                                        href={fileData}
                                        download={fileName}
                                        className="p-1.5 bg-[#00a884] hover:bg-[#008f70] text-white rounded-full transition-transform active:scale-95 shadow-xs shrink-0 flex items-center justify-center cursor-pointer"
                                        title="Download Image"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </div>
                                ) : (
                                  /* Document Card with working Download link */
                                  <div className={`p-2.5 rounded-lg flex items-center justify-between gap-3 ${
                                    isMe ? 'bg-black/25 border border-emerald-500/30' : 'bg-[#182229] border border-[#2d3a43]'
                                  }`}>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isImg ? 'bg-blue-600/30 text-blue-300' : 'bg-purple-600/30 text-purple-300'
                                      }`}>
                                        {isImg ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-semibold text-slate-100 text-xs truncate max-w-[170px] sm:max-w-xs">{fileName}</div>
                                        <div className="text-[10px] text-slate-400">{fileSize}</div>
                                      </div>
                                    </div>
                                    {fileData ? (
                                      <a
                                        href={fileData}
                                        download={fileName}
                                        className="p-1.5 bg-[#00a884]/20 hover:bg-[#00a884] text-[#00a884] hover:text-white rounded-full transition-colors cursor-pointer shrink-0"
                                        title="Download File"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => alert(`Document: ${fileName} (${fileSize}). Available in Document Vault.`)}
                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
                                        title="File info"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                )}
                                {caption && (
                                  <p className="whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed text-slate-100 font-normal px-0.5 pt-1">
                                    {caption}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed text-slate-100 font-normal">
                          {msg.text}
                        </p>
                      )}
                      
                      {/* Timestamp & Read Receipt */}
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-mono ${isMe ? 'text-[#7fbcae]' : 'text-slate-400'}`}>
                        <span>{msg.timestamp}</span>
                        {isMe && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeMessages.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No messages yet. Send a message below to start the conversation.
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 py-1.5 bg-[#182229] border-t border-[#222d34] flex items-center gap-2 overflow-x-auto no-scrollbar z-10 shrink-0">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00a884]" />
                Quick:
              </span>
              {(isClient ? [
                'Case status update please',
                'Uploaded new evidence to Document Vault',
                'Request 15-min strategy call'
              ] : [
                'Please review your Stage Evidence draft',
                'Reminder: Recommender CV details needed',
                'USCIS Receipt notice has been uploaded'
              ]).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(chip)}
                  className="text-[11px] bg-[#202c33] hover:bg-[#2a3942] border border-[#2d3a43] text-slate-300 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Hidden File Inputs for Document & Media Attachments */}
            <input
              ref={docInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.zip,.xls,.xlsx"
              onChange={handleDocFileSelect}
            />
            <input
              ref={mediaInputRef}
              type="file"
              className="hidden"
              accept="image/*,video/*"
              onChange={handleMediaFileSelect}
            />

            {/* Attached File Preview Bar (Above Input) */}
            {attachedFile && (
              <div className="bg-[#1f2c34] px-4 py-2 border-t border-[#2a3942] flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  {attachedFile.type === 'image' && attachedFile.previewUrl ? (
                    <img src={attachedFile.previewUrl} alt="preview" className="w-10 h-10 object-cover rounded-lg border border-[#00a884]/40 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-200 block truncate max-w-[200px] sm:max-w-md">{attachedFile.name}</span>
                    <span className="text-[10px] text-slate-400">{attachedFile.size} • Ready to send</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="bg-[#202c33] border-t border-[#2a3942] p-3 z-20 shadow-xl max-h-56 overflow-y-auto animate-fadeIn shrink-0">
                <div className="flex items-center justify-between border-b border-[#2a3942] pb-2 mb-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {EMOJI_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveEmojiTab(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          activeEmojiTab === cat.id ? 'bg-[#00a884] text-white' : 'text-slate-400 hover:bg-[#2a3942] hover:text-white'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="hidden sm:inline text-[11px]">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-[#2a3942] ml-2 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-14 gap-1.5 text-lg p-1">
                  {EMOJI_CATEGORIES.find(c => c.id === activeEmojiTab)?.emojis.map((emoji, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-[#2a3942] rounded-lg transition-transform hover:scale-125 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Share / Attachment Popup Menu */}
            {showAttachMenu && (
              <div className="bg-[#202c33] border-t border-[#2a3942] p-3 z-20 shadow-xl animate-fadeIn shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-[#00a884]" /> Share & Attach
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-[#2a3942]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="p-3 bg-[#111b21] hover:bg-[#2a3942] rounded-xl border border-[#2d3a43] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group hover:border-[#00a884]"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 group-hover:scale-110 flex items-center justify-center transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200">Document</span>
                    <span className="text-[9px] text-slate-400">PDF, DOC, ZIP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => mediaInputRef.current?.click()}
                    className="p-3 bg-[#111b21] hover:bg-[#2a3942] rounded-xl border border-[#2d3a43] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group hover:border-[#00a884]"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 group-hover:scale-110 flex items-center justify-center transition-transform">
                      <Image className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200">Photos & Videos</span>
                    <span className="text-[9px] text-slate-400">PNG, JPG, MP4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInputText(`📑 Form I-797C Notice of Action received for Case ${activeContact?.caseNumber || 'EB2-NIW'}. Official filing receipt has been verified.`);
                      setShowAttachMenu(false);
                    }}
                    className="p-3 bg-[#111b21] hover:bg-[#2a3942] rounded-xl border border-[#2d3a43] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer group hover:border-[#00a884]"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 group-hover:scale-110 flex items-center justify-center transition-transform">
                      <Scale className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-200">USCIS Notice</span>
                    <span className="text-[9px] text-slate-400">Insert Receipt</span>
                  </button>
                </div>
              </div>
            )}

            {/* Input Bar or Voice Recording Bar */}
            {isRecording ? (
              <div className="bg-[#202c33] px-3.5 sm:px-5 py-3 border-t border-[#222d34] flex items-center justify-between gap-3 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-rose-500 animate-pulse" />
                    Recording: {Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? '0' : ''}{recordingSeconds % 60}
                  </span>
                  <div className="hidden sm:flex items-center gap-1 h-4">
                    <span className="w-1 h-3 bg-rose-500/80 rounded-full animate-bounce"></span>
                    <span className="w-1 h-5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                    <span className="w-1 h-2 bg-rose-500/80 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.45s' }}></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-[#374248] rounded-full transition-colors cursor-pointer"
                    title="Cancel Recording"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={stopAndSendRecording}
                    className="w-10 h-10 bg-[#00a884] hover:bg-[#008f70] text-white rounded-full transition-all shadow-md flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                    title="Send Voice Note"
                  >
                    <Send className="w-4 h-4 translate-x-0.5" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="bg-[#202c33] px-3.5 sm:px-5 py-3 border-t border-[#222d34] flex items-center gap-2.5 z-10 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(prev => !prev);
                    setShowAttachMenu(false);
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                    showEmojiPicker ? 'text-[#00a884] bg-[#374248]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#374248]'
                  }`}
                  title="Emojis"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(prev => !prev);
                    setShowEmojiPicker(false);
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer shrink-0 ${
                    showAttachMenu ? 'text-[#00a884] bg-[#374248]' : 'text-slate-400 hover:text-slate-200 hover:bg-[#374248]'
                  }`}
                  title="Share Document or Image"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    attachedFile 
                      ? "Add a caption for attached file..." 
                      : (isClient ? "Type a message to your legal team..." : "Type a message to applicant...")
                  }
                  className="flex-1 bg-[#2a3942] text-xs sm:text-sm text-slate-100 placeholder-slate-400 rounded-xl px-4 py-2.5 border border-transparent focus:border-[#00a884]/40 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                />

                <div className="shrink-0 flex items-center pl-1 pr-1 sm:pr-2">
                  {(inputText.trim() || attachedFile) ? (
                    <button
                      type="submit"
                      className="w-10 h-10 bg-[#00a884] hover:bg-[#008f70] text-white rounded-full transition-all shadow-md flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95"
                      title="Send Message"
                    >
                      <Send className="w-4 h-4 translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-10 h-10 text-slate-400 hover:text-[#00a884] hover:bg-[#374248] rounded-full transition-colors flex items-center justify-center cursor-pointer active:scale-95"
                      title="Record Voice Message"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Select a contact to view the conversation.
          </div>
        )}

      </div>
    </div>
  );

  const fullContent = (
    <>
      {content}

      {/* Lightbox / High-Res Image Preview Modal */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#111b21] border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
              <span className="text-xs sm:text-sm font-semibold text-slate-100 truncate max-w-md">{previewImageModal.name}</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImageModal.url}
                  download={previewImageModal.name}
                  className="px-3 py-1.5 bg-[#00a884] hover:bg-[#008f70] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImageModal(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#2a3942] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-3 sm:p-6 overflow-auto flex items-center justify-center bg-[#0b141a]">
              <img
                src={previewImageModal.url}
                alt={previewImageModal.name}
                className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (!isFullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn">
        {fullContent}
      </div>
    );
  }

  return fullContent;
};
