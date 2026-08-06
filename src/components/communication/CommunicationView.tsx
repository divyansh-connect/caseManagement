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
  Filter
} from 'lucide-react';
import { CaseItem, CaseMessage } from '../../types';
import { WhatsAppModal } from './WhatsAppModal';

interface CommunicationViewProps {
  cases: CaseItem[];
  messages: CaseMessage[];
  viewMode?: 'hub' | 'whatsapp';
}

export const CommunicationView: React.FC<CommunicationViewProps> = ({ 
  cases, 
  messages: initialMessages,
  viewMode = 'whatsapp'
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [messages, setMessages] = useState<CaseMessage[]>(initialMessages);
  const [newMsgText, setNewMsgText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'whatsapp' | 'internal'>('all');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'hub' | 'whatsapp'>(viewMode);

  useEffect(() => {
    if (viewMode) {
      setActiveViewMode(viewMode);
    }
  }, [viewMode]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];
  const caseMessages = messages.filter(m => m.caseId === selectedCase?.id);

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim() && !attachedFileName || !selectedCase) return;

    let contentToSend = newMsgText.trim();
    if (attachedFileName) {
      contentToSend += ` [Attachment: ${attachedFileName}]`;
    }

    const newMsg: CaseMessage = {
      id: `msg-${Date.now()}`,
      caseId: selectedCase.id,
      senderName: 'Sarah Jenkins (Legal Specialist)',
      senderRole: 'writer',
      content: contentToSend,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMsgText('');
    setAttachedFileName(null);
  };

  const applyTemplate = (templateText: string) => {
    setNewMsgText(templateText);
  };

  const handleSimulateFileSelect = () => {
    const mockFiles = ['Exhibit_104_Scholar_Metrics.pdf', 'Recommender_CV_Dr_Smith.pdf', 'Proposed_Endeavor_Draft_v2.docx'];
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    setAttachedFileName(randomFile);
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
                      <span className="truncate">{lastMsg.content}</span>
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
                onClick={() => applyTemplate(tmpl.text)}
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
                const isClient = m.senderRole === 'client';
                return (
                  <div 
                    key={m.id} 
                    className={`flex flex-col ${isClient ? 'items-start' : 'items-end'}`}
                  >
                    <div 
                      className={`p-3 sm:p-3.5 rounded-2xl max-w-[85%] sm:max-w-lg shadow-2xs ${
                        isClient 
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs' 
                          : 'bg-blue-600 text-white rounded-tr-xs'
                      }`}
                    >
                      <div className={`flex items-center justify-between gap-3 mb-1 text-[10px] ${
                        isClient ? 'text-slate-500 font-semibold' : 'text-blue-100 font-semibold'
                      }`}>
                        <span className="truncate">{m.senderName}</span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{m.timestamp}</span>
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attached File Preview Badge */}
          {attachedFileName && (
            <div className="px-4 py-1.5 bg-blue-50 border-t border-blue-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 truncate">
                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Attached: {attachedFileName}</span>
              </span>
              <button 
                onClick={() => setAttachedFileName(null)} 
                className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer shrink-0 ml-2"
              >
                Remove
              </button>
            </div>
          )}

          {/* Message Input & Send Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
            <button
              type="button"
              onClick={handleSimulateFileSelect}
              title="Attach File / Document"
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={newMsgText}
              onChange={(e) => setNewMsgText(e.target.value)}
              placeholder={`Write message to ${selectedCase?.clientName || 'applicant'}...`}
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};
