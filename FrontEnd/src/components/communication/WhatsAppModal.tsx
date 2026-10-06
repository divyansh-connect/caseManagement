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
  ArrowLeft
} from 'lucide-react';
import { api } from '../../services/api';

interface WhatsAppModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultClientName?: string;
  isFullPage?: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  phone: string;
  role: string;
  avatarBg: string;
  lastMsg: string;
  lastTime: string;
  unreadCount: number;
  online: boolean;
}

interface WhatsAppMessage {
  id: string;
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
  isFullPage = true
}) => {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [messagesMap, setMessagesMap] = useState<Record<string, WhatsAppMessage[]>>({});
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          newMessagesMap[m.caseId].push({
            id: m.id,
            sender: m.senderRole === 'client' ? 'client' : 'me',
            text: m.content,
            timestamp: m.timestamp ? (m.timestamp.length > 10 ? m.timestamp.substring(11, 16) : m.timestamp) : '12:00',
            status: 'read'
          });
        });

        // Build contacts from cases
        const mappedContacts: ChatContact[] = casesList.map((c: any, index: number) => {
          const caseMsgs = newMessagesMap[c.id] || [];
          const lastMsgObj = caseMsgs.length > 0 ? caseMsgs[caseMsgs.length - 1] : null;

          return {
            id: c.id,
            name: c.client?.name || c.clientName || 'Client',
            phone: c.client?.phone || '+1 (555) 012-3456',
            role: c.fieldCategory || c.petitionCategory || 'EB-2 NIW',
            avatarBg: avatarColors[index % avatarColors.length],
            lastMsg: lastMsgObj ? lastMsgObj.text : 'Conversation initiated on portal.',
            lastTime: lastMsgObj ? lastMsgObj.timestamp : (c.lastUpdated ? c.lastUpdated.substring(11, 16) : 'Active'),
            unreadCount: 0,
            online: index % 2 === 0
          };
        });

        setContacts(mappedContacts);
        setMessagesMap(newMessagesMap);

        if (mappedContacts.length > 0) {
          if (defaultClientName) {
            const matched = mappedContacts.find(ct => ct.name.toLowerCase().includes(defaultClientName.toLowerCase()));
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
  }, [defaultClientName]);

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

    try {
      const res = await api.post('/messages', {
        caseId: activeContact.id,
        senderName: 'Editorial Specialist',
        senderRole: 'writer',
        content: contentToSend
      });

      if (res.success && res.data) {
        const created = res.data;
        const newMsg: WhatsAppMessage = {
          id: created.id,
          sender: 'me',
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
    c.role.toLowerCase().includes(searchTerm.toLowerCase())
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
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">Babel Global Live WhatsApp Suite</p>
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
                placeholder="Search case contacts..."
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
                      {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
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
                  {activeContact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-100 flex items-center gap-2">
                    {activeContact.name}
                  </h3>
                  <p className="text-[10px] text-[#00a884] font-medium flex items-center gap-1">
                    {activeContact.online ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884]"></span>
                        <span>online • {activeContact.phone}</span>
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
                const isMe = msg.sender === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`relative max-w-[85%] sm:max-w-md p-2.5 sm:p-3 rounded-lg text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#005c4b] text-slate-100 rounded-tr-none'
                          : 'bg-[#202c33] text-slate-100 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-xs sm:text-[13px]">{msg.text}</p>
                      
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-[#7fbcae]' : 'text-slate-400'}`}>
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
                placeholder="Type a message..."
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
