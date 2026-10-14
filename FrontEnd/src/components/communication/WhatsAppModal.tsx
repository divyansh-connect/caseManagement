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
  Scale
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
}

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

        // Build messages map grouped by caseId
        const newMessagesMap: Record<string, WhatsAppMessage[]> = {};
        allMessages.forEach((m: any) => {
          if (!newMessagesMap[m.caseId]) {
            newMessagesMap[m.caseId] = [];
          }

          // Heal previously bugged test messages where client sent "Hi" while hardcoded as Editorial Specialist
          let sRole = m.senderRole || 'admin';
          let sName = m.senderName || 'Legal Team';
          if (m.senderName === 'Editorial Specialist' && (m.content === 'Hi' || m.content === 'hi' || m.content === 'Hello')) {
            sRole = 'client';
            sName = defaultClientName || currentUser?.name || 'Applicant';
          }

          newMessagesMap[m.caseId].push({
            id: m.id,
            caseId: m.caseId,
            senderRole: sRole,
            senderName: sName,
            sender: sRole === 'client' ? 'client' : 'me',
            text: m.content || m.text,
            timestamp: m.timestamp ? (m.timestamp.length > 10 ? m.timestamp.substring(11, 16) : m.timestamp) : '12:00',
            status: 'read'
          });
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

        // Build contacts
        const mappedContacts: ChatContact[] = relevantCases.map((c: any, index: number) => {
          const caseMsgs = newMessagesMap[c.id] || [];
          const lastMsgObj = caseMsgs.length > 0 ? caseMsgs[caseMsgs.length - 1] : null;

          if (isClient) {
            return {
              id: c.id,
              name: 'Babel Global Legal Counsel',
              phone: '+1 (800) 555-0199',
              role: `Case #${c.caseNumber || 'EB2-NIW'} • Assigned Legal Team`,
              avatarBg: 'bg-emerald-800',
              lastMsg: lastMsgObj ? lastMsgObj.text : 'Direct encrypted line to your petition attorney & drafter.',
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
            lastMsg: lastMsgObj ? lastMsgObj.text : 'Conversation initiated on portal.',
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

  const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];
  const activeMessages = activeContact ? (messagesMap[activeContact.id] || []) : [];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeMessages, selectedContactId]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact) return;

    const contentToSend = inputText.trim();
    setInputText('');

    const myRole = isClient ? 'client' : (effectiveRole || 'admin');
    const myName = currentUser?.name || (isClient 
      ? (activeContact.clientRealName || defaultClientName || 'Client') 
      : (effectiveRole === 'superadmin' ? 'Super Administrator' : 'Legal Counsel'));

    try {
      const res = await api.post('/messages', {
        caseId: activeContact.id,
        senderName: myName,
        senderRole: myRole,
        content: contentToSend
      });

      if (res.success && res.data) {
        const created = res.data;
        const newMsg: WhatsAppMessage = {
          id: created.id,
          caseId: activeContact.id,
          senderRole: created.senderRole || myRole,
          senderName: created.senderName || myName,
          sender: isClient ? 'client' : 'me',
          text: created.content,
          timestamp: created.timestamp ? (created.timestamp.length > 10 ? created.timestamp.substring(11, 16) : created.timestamp) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: 'read'
        };

        setMessagesMap(prev => ({
          ...prev,
          [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
        }));

        setContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, lastMsg: newMsg.text, lastTime: newMsg.timestamp } : c));
      }
    } catch (err: any) {
      alert(`Message send failed: ${err.message}`);
    }
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
                      className={`relative max-w-[85%] sm:max-w-md p-2.5 sm:p-3 rounded-xl text-xs leading-relaxed shadow-sm transition-all ${
                        isMe
                          ? 'bg-[#005c4b] text-slate-100 rounded-tr-none border border-[#005c4b]/80'
                          : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-[#2d3a43]'
                      }`}
                    >
                      {/* Header inside bubble */}
                      {isMe ? (
                        /* OUTGOING MESSAGE: RIGHT-HAND SIDE (GREEN) */
                        <div className="flex items-center justify-end gap-1 mb-1 text-[10px] text-emerald-200/80 font-semibold">
                          <span>You</span>
                          <span className="text-emerald-300/60 font-normal">
                            {isClient ? '(Client)' : `(${effectiveRole === 'superadmin' ? 'Super Admin' : effectiveRole.toUpperCase()})`}
                          </span>
                        </div>
                      ) : (
                        /* INCOMING MESSAGE: LEFT-HAND SIDE (GREY BOX) WITH ROLE BADGE */
                        <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-[#2d3a43]">
                          {msg.senderRole === 'superadmin' ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-purple-500/25 text-purple-300 border border-purple-500/40">
                              Super Admin
                            </span>
                          ) : msg.senderRole === 'admin' ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/25 text-blue-300 border border-blue-500/40">
                              Case Admin
                            </span>
                          ) : msg.senderRole === 'writer' ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-teal-500/25 text-teal-300 border border-teal-500/40">
                              Petition Drafter
                            </span>
                          ) : msg.senderRole === 'reviewer' ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40">
                              Senior Reviewer
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-500/40">
                              Applicant (Client)
                            </span>
                          )}
                          <span className="text-[11px] font-bold text-slate-200 truncate">
                            {msg.senderName || (msg.senderRole === 'client' ? 'Client' : 'Legal Team')}
                          </span>
                        </div>
                      )}

                      {/* Text Content */}
                      <p className="whitespace-pre-wrap text-xs sm:text-[13px] leading-relaxed text-slate-100 font-normal">
                        {msg.text}
                      </p>
                      
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

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="bg-[#202c33] p-2.5 border-t border-[#222d34] flex items-center gap-2 z-10 shrink-0">
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#374248] rounded-full transition-colors cursor-pointer"
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <button
                type="button"
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#374248] rounded-full transition-colors cursor-pointer"
                title="Attach Document or Image"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isClient ? "Type a message to your legal team..." : "Type a message to applicant..."}
                className="flex-1 bg-[#2a3942] text-xs sm:text-sm text-slate-100 placeholder-slate-400 rounded-lg px-4 py-2 border-none focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              />

              {inputText.trim() ? (
                <button
                  type="submit"
                  className="p-2 bg-[#00a884] hover:bg-[#008f70] text-white rounded-full transition-colors cursor-pointer shadow-sm"
                  title="Send Message"
                >
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-[#374248] rounded-full transition-colors cursor-pointer"
                  title="Voice Message"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Select a contact to view the conversation.
          </div>
        )}

      </div>
    </div>
  );

  if (!isFullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn">
        {content}
      </div>
    );
  }

  return content;
};
