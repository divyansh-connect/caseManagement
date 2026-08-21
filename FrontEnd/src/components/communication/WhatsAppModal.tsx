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
  Check, 
  Lock,
  ArrowLeft,
  Circle,
  FileText
} from 'lucide-react';

import { CaseItem, CaseMessage } from '../../types';

interface WhatsAppModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultClientName?: string;
  isFullPage?: boolean;
  cases?: CaseItem[];
  messages?: CaseMessage[];
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

const INITIAL_CONTACTS: ChatContact[] = [
  {
    id: 'c1',
    name: 'Dr. Elena Rostova',
    phone: '+1 (555) 234-8901',
    role: 'Quantum Machine Learning & Optimization',
    avatarBg: 'bg-emerald-700',
    lastMsg: 'Hi, I uploaded the updated Google Scholar report.',
    lastTime: '14:30',
    unreadCount: 0,
    online: true,
  },
  {
    id: 'c2',
    name: 'Carlos Mendez, M.S.',
    phone: '+1 (555) 892-4110',
    role: 'Smart Grid Energy Storage Integration',
    avatarBg: 'bg-blue-600',
    lastMsg: 'Thank you for the update on Prong 2 Section B!',
    lastTime: '11:15',
    unreadCount: 2,
    online: true,
  },
  {
    id: 'c3',
    name: 'Dr. Amara Okafor',
    phone: '+1 (555) 671-3329',
    role: 'Computational Oncology & Genomics',
    avatarBg: 'bg-purple-600',
    lastMsg: 'Drafted 3 recommendation letters for Stage 4 review.',
    lastTime: 'Yesterday',
    unreadCount: 0,
    online: false,
  },
  {
    id: 'c4',
    name: 'Dr. Vikram Patel',
    phone: '+1 (555) 430-9988',
    role: 'Autonomous Robotics for Agriculture',
    avatarBg: 'bg-amber-600',
    lastMsg: 'USCIS receipt notice Form I-797C received.',
    lastTime: 'Jul 29',
    unreadCount: 0,
    online: false,
  }
];

const INITIAL_MESSAGES_MAP: Record<string, WhatsAppMessage[]> = {
  c1: [
    {
      id: 'm1',
      sender: 'client',
      text: 'Hi! 👋 I just uploaded the updated Google Scholar report reflecting our latest citation count of 418. Please let me know if you need the revised conference certificate!',
      timestamp: '14:15',
      status: 'read'
    },
    {
      id: 'm2',
      sender: 'me',
      text: 'Thank you Dr. Rostova! That 418 figure is fantastic. I am incorporating it into Prong 2 Section B right now. We are on track for reviewer audit by Friday. 📄✨',
      timestamp: '14:28',
      status: 'read'
    },
    {
      id: 'm3',
      sender: 'client',
      text: 'Perfect, thank you so much! Please let me know once the draft is ready for my final review.',
      timestamp: '14:30',
      status: 'read'
    }
  ],
  c2: [
    {
      id: 'm10',
      sender: 'me',
      text: 'Hello Carlos! We have prepared your initial petition overview for Smart Grid Energy Storage Integration.',
      timestamp: '10:50',
      status: 'read'
    },
    {
      id: 'm11',
      sender: 'client',
      text: 'Thank you for the update on Prong 2 Section B!',
      timestamp: '11:15',
      status: 'read'
    }
  ],
  c3: [
    {
      id: 'm20',
      sender: 'client',
      text: 'Drafted 3 recommendation letters for Stage 4 review.',
      timestamp: 'Yesterday',
      status: 'read'
    }
  ],
  c4: [
    {
      id: 'm30',
      sender: 'client',
      text: 'USCIS receipt notice Form I-797C received.',
      timestamp: 'Jul 29',
      status: 'read'
    }
  ]
};


export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen = true,
  onClose,
  defaultClientName,
  isFullPage = true,
  cases,
  messages
}) => {
  const [contacts, setContacts] = useState<ChatContact[]>(INITIAL_CONTACTS);
  const [selectedContactId, setSelectedContactId] = useState<string>('c1');
  const [messagesMap, setMessagesMap] = useState<Record<string, WhatsAppMessage[]>>(INITIAL_MESSAGES_MAP);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamically load real DB cases into contacts list
  useEffect(() => {
    if (cases && cases.length > 0) {
      const dynamicContacts: ChatContact[] = cases.map((c, index) => ({
        id: c.id,
        name: c.clientName,
        phone: c.clientEmail || '+1 (555) 012-3456',
        role: `${c.petitionCategory || 'EB-2 NIW'} Candidate`,
        avatarBg: index % 2 === 0 ? 'bg-blue-600' : 'bg-purple-600',
        lastMsg: 'Active conversation thread',
        lastTime: c.lastUpdated ? c.lastUpdated.substring(0, 10) : 'Active',
        unreadCount: 0,
        online: true
      }));
      setContacts(dynamicContacts);
      if (!selectedContactId || !cases.find(c => c.id === selectedContactId)) {
        setSelectedContactId(cases[0].id);
      }
    }
  }, [cases]);

  // Dynamically load real DB messages into messagesMap
  useEffect(() => {
    if (messages && messages.length > 0 && cases && cases.length > 0) {
      const map: Record<string, WhatsAppMessage[]> = {};
      messages.forEach((m) => {
        if (!map[m.caseId]) map[m.caseId] = [];
        map[m.caseId].push({
          id: m.id,
          sender: m.senderRole === 'client' ? 'client' : 'me',
          text: m.content,
          timestamp: m.timestamp || 'Just now',
          status: 'read'
        });
      });
      setMessagesMap(prev => ({ ...prev, ...map }));
    }
  }, [messages, cases]);

  // Sync selected contact if defaultClientName changes or matches
  useEffect(() => {
    if (defaultClientName) {
      const matched = contacts.find(c => c.name.toLowerCase().includes(defaultClientName.toLowerCase()));
      if (matched) {
        setSelectedContactId(matched.id);
      }
    }
  }, [defaultClientName, contacts]);

  const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];
  const activeMessages = messagesMap[activeContact.id] || [];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, activeMessages, selectedContactId]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const newMsg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: inputText.trim(),
      timestamp: currentTime,
      status: 'read'
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg]
    }));

    // Update last message in contact list
    setContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, lastMsg: inputText.trim(), lastTime: currentTime } : c));
    setInputText('');

    // Simulate dummy client auto reply after 1.5s
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const autoReply: WhatsAppMessage = {
        id: `msg-reply-${Date.now()}`,
        sender: 'client',
        text: `Thanks! Noted regarding the EB-2 NIW petition update. 👍`,
        timestamp: replyTime,
        status: 'read'
      };
      setMessagesMap(prev => ({
        ...prev,
        [activeContact.id]: [...(prev[activeContact.id] || []), autoReply]
      }));
      setContacts(prev => prev.map(c => c.id === activeContact.id ? { ...c, lastMsg: autoReply.text, lastTime: replyTime } : c));
    }, 1500);
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
                Active &amp; Connected
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
                  placeholder="Search or start new chat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#202c33] text-xs text-slate-200 placeholder-slate-400 rounded-lg pl-9 pr-3 py-2 border-none focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#222d34]/40">
              {filteredContacts.map(contact => {
                const isSelected = contact.id === activeContact.id;
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

                    {contact.unreadCount > 0 && (
                      <span className="bg-[#00a884] text-[#111b21] font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Encryption notice at bottom of list */}
            <div className="p-3 bg-[#111b21] border-t border-[#222d34] text-center">
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 text-[#00a884]" />
                <span>Your personal messages are end-to-end encrypted</span>
              </p>
            </div>
          </div>

          {/* Right Panel: Active WhatsApp Chat Window */}
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
                  Today
                </span>
              </div>

              {/* Encryption Banner */}
              <div className="bg-[#182229] border border-[#222d34] p-2.5 rounded-lg max-w-md mx-auto text-center shadow-xs">
                <p className="text-[11px] text-amber-300/90 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.</span>
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
