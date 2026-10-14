import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Search, 
  Upload, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCheck2, 
  X,
  Eye,
  ExternalLink,
  ChevronDown,
  Check,
  ShieldCheck,
  Tag,
  Calendar,
  User,
  FileCheck,
  AlertTriangle
} from 'lucide-react';
import { CaseDocument } from '../../types';
import { EVIDENCE_CATEGORIES, EVIDENCE_CATEGORY_GROUPS } from '../../data/evidenceCategories';
import { StatusBadge } from '../common/Badge';
import { downloadDocumentFile, normalizeDocumentUrl } from '../../utils/downloadHelper';
import { api } from '../../services/api';

interface DocumentsViewProps {
  documents: CaseDocument[];
  openNewDocModal: () => void;
  openAIAssistant: () => void;
  onUpdateDocStatus?: (docId: string, newStatus: 'Pending Review' | 'Verified' | 'Needs Revision' | 'Approved') => void;
}

export type DocumentStatus = 'Pending Review' | 'Verified' | 'Needs Revision' | 'Approved';

const STATUS_CONFIGS: {
  value: DocumentStatus;
  label: string;
  desc: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
}[] = [
  {
    value: 'Pending Review',
    label: 'Pending Review',
    desc: 'Awaiting attorney verification & exhibit audit',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500'
  },
  {
    value: 'Approved',
    label: 'Approved',
    desc: 'Accepted for official USCIS filing package',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500'
  },
  {
    value: 'Verified',
    label: 'Verified',
    desc: 'Evidence authenticity confirmed by legal counsel',
    badgeBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500'
  },
  {
    value: 'Needs Revision',
    label: 'Needs Revision',
    desc: 'Missing pages, unclear scan, or client update required',
    badgeBg: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    dotColor: 'bg-rose-500'
  }
];

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  openNewDocModal,
  openAIAssistant,
  onUpdateDocStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [downloadToast, setDownloadToast] = useState('');
  
  // Interactive View Modal & Status Dropdown States
  const [viewingDoc, setViewingDoc] = useState<CaseDocument | null>(null);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);
  const [updatingDocId, setUpdatingDocId] = useState<string | null>(null);

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenStatusDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.exhibitNumber && d.exhibitNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.aiSummary && d.aiSummary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Handle Document Download
  const handleDownloadDoc = async (doc: CaseDocument) => {
    const result = await downloadDocumentFile(doc);
    setDownloadToast(result.message);
    setTimeout(() => setDownloadToast(''), 4000);
  };

  // Handle Document Status Change
  const handleStatusChange = async (doc: CaseDocument, newStatus: DocumentStatus) => {
    setUpdatingDocId(doc.id);
    setOpenStatusDropdownId(null);

    // 1. Persist to localStorage override
    try {
      const overrides = JSON.parse(localStorage.getItem('document_status_overrides') || '{}');
      overrides[doc.id] = newStatus;
      localStorage.setItem('document_status_overrides', JSON.stringify(overrides));
    } catch (e) {}

    // 2. Call parent callback if available
    if (onUpdateDocStatus) {
      onUpdateDocStatus(doc.id, newStatus);
    }

    // 3. Update viewingDoc if currently open in View Modal
    if (viewingDoc && viewingDoc.id === doc.id) {
      setViewingDoc({ ...viewingDoc, status: newStatus });
    }

    // 4. Send API request to backend
    try {
      await api.patch(`/documents/${doc.id}`, { status: newStatus });
    } catch (err) {
      try {
        await api.put(`/documents/${doc.id}`, { status: newStatus });
      } catch (e) {
        console.warn('Backend update failed, kept in local storage:', e);
      }
    } finally {
      setUpdatingDocId(null);
    }

    setDownloadToast(`Status for "${doc.name}" updated to "${newStatus}"`);
    setTimeout(() => setDownloadToast(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{downloadToast}</span>
          <button onClick={() => setDownloadToast('')} className="text-white hover:text-emerald-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Master Document &amp; Exhibit Vault</h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Indexed evidence repository with AI summary extraction and exhibit tab mapping for USCIS Form I-140.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            onClick={openAIAssistant}
            className="px-3.5 py-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-semibold text-xs hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Summarizer</span>
          </button>

          <button
            onClick={openNewDocModal}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Exhibit</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exhibit tab, doc name, summary..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium shrink-0">Exhibit Type:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto max-w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {EVIDENCE_CATEGORY_GROUPS.map(grp => (
              <optgroup key={grp.group} label={grp.group} className="font-semibold text-slate-900 bg-slate-100">
                {grp.categories.map(cat => (
                  <option key={cat} value={cat} className="font-normal text-slate-800 bg-white">
                    {cat}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Exhibit Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Exhibit #</th>
                <th className="px-5 py-3.5">Document File Name</th>
                <th className="px-5 py-3.5 min-w-[175px]">Type</th>
                <th className="px-5 py-3.5">AI Legal Intelligence Summary</th>
                <th className="px-5 py-3.5">Status (Click to Change)</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map(doc => {
                const isDropdownOpen = openStatusDropdownId === doc.id;
                const isUpdating = updatingDocId === doc.id;

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-800">
                      {doc.exhibitNumber || 'Exhibit --'}
                    </td>
                    <td className="px-5 py-4">
                      <div 
                        onClick={() => setViewingDoc(doc)}
                        className="font-bold text-slate-900 text-xs hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1.5 group"
                        title="Click to view document & details"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform shrink-0" />
                        <span>{doc.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {doc.fileSize} • Uploaded by {doc.uploadedBy} on {doc.uploadedAt}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-normal min-w-[175px] max-w-[230px]">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 leading-snug break-words">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700 max-w-md leading-relaxed">
                      {doc.aiSummary ? (
                        <div className="bg-slate-50 p-2 rounded border border-slate-100 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{doc.aiSummary}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No summary generated</span>
                      )}
                    </td>

                    {/* Interactive Status Column */}
                    <td className="px-5 py-4 relative">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setOpenStatusDropdownId(isDropdownOpen ? null : doc.id)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer hover:shadow-xs group focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          title="Click to change document status"
                        >
                          <StatusBadge status={doc.status} />
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
                        </button>

                        {/* Status Dropdown Menu */}
                        {isDropdownOpen && (
                          <div 
                            ref={dropdownRef}
                            className="absolute z-30 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 animate-fadeIn"
                          >
                            <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Status</span>
                              <span className="text-[10px] text-slate-400">Select one</span>
                            </div>
                            <div className="p-1 space-y-0.5">
                              {STATUS_CONFIGS.map(cfg => {
                                const isCurrent = doc.status === cfg.value;
                                return (
                                  <button
                                    key={cfg.value}
                                    type="button"
                                    onClick={() => handleStatusChange(doc, cfg.value)}
                                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer ${
                                      isCurrent ? 'bg-slate-100 font-semibold text-slate-900' : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.dotColor}`} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold">{cfg.label}</span>
                                        {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                                      </div>
                                      <span className="text-[10px] text-slate-400 block leading-tight">{cfg.desc}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions Column: View + Download */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="View Document Details & Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-blue-200 transition-all cursor-pointer shadow-xs"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-600" />
                          <span>Download</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-xs">
                    No documents or exhibits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {doc.exhibitNumber || 'Exhibit --'}
                  </span>
                  <h3 
                    onClick={() => setViewingDoc(doc)}
                    className="font-bold text-slate-900 text-xs mt-2 break-all hover:text-blue-600 cursor-pointer"
                  >
                    {doc.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {doc.fileSize} • Uploaded by {doc.uploadedBy || 'Petition Drafter'} on {doc.uploadedAt}
                  </p>
                </div>

                {/* Mobile Status Picker */}
                <div className="shrink-0">
                  <select
                    value={doc.status}
                    onChange={(e) => handleStatusChange(doc, e.target.value as DocumentStatus)}
                    className="text-xs font-semibold border rounded-lg px-2 py-1 bg-white shadow-xs focus:ring-1 focus:ring-blue-500"
                  >
                    {STATUS_CONFIGS.map(cfg => (
                      <option key={cfg.value} value={cfg.value}>
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {doc.aiSummary && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5 text-xs text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{doc.aiSummary}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 leading-snug break-words">
                  {doc.category}
                </span>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setViewingDoc(doc)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleDownloadDoc(doc)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 border border-blue-200 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              No documents or exhibits found.
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          Document View & Inspection Modal
          ───────────────────────────────────────────────────────────── */}
      {viewingDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 animate-fadeIn"
          onClick={() => setViewingDoc(null)}
        >
          <div 
            className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {viewingDoc.exhibitNumber || 'Exhibit --'}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-xs sm:max-w-md">
                      {viewingDoc.name}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {viewingDoc.fileSize} • Uploaded by {viewingDoc.uploadedBy} on {viewingDoc.uploadedAt}
                  </p>
                </div>
              </div>

              {/* Top Right Modal Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {viewingDoc.fileUrl && (
                  <a
                    href={normalizeDocumentUrl(viewingDoc.fileUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-semibold"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Tab</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => handleDownloadDoc(viewingDoc)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: File Preview & Verification Pane */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50">
              {/* Document Status Bar inside modal */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Verification Status:</span>
                  <StatusBadge status={viewingDoc.status} />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium mr-1">Update Status:</span>
                  {STATUS_CONFIGS.map(cfg => (
                    <button
                      key={cfg.value}
                      type="button"
                      onClick={() => handleStatusChange(viewingDoc, cfg.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        viewingDoc.status === cfg.value
                          ? `${cfg.badgeBg} ${cfg.textColor} ${cfg.borderColor} shadow-2xs ring-1 ring-blue-400/40 font-bold`
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Summary Highlight */}
              {viewingDoc.aiSummary && (
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950 block mb-0.5">AI Evidence Intelligence Summary:</span>
                    <p className="leading-relaxed">{viewingDoc.aiSummary}</p>
                  </div>
                </div>
              )}

              {/* Embedded Document Preview / Viewer Box */}
              {(() => {
                const normUrl = normalizeDocumentUrl(viewingDoc.fileUrl);
                const isPdf = /\.pdf$/i.test(viewingDoc.name) || /\.pdf/i.test(normUrl);
                const isImg = /\.(jpe?g|png|webp|gif|svg)$/i.test(viewingDoc.name) || 
                              /\.(jpe?g|png|webp|gif|svg)/i.test(normUrl) ||
                              normUrl.includes('/image/upload/');

                return (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                        Previewing: {viewingDoc.name}
                      </span>
                      {normUrl && (
                        <a
                          href={normUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <span>Open full size</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="p-3 bg-slate-900/5 flex items-center justify-center min-h-[350px]">
                      {isImg && normUrl ? (
                        <img 
                          src={normUrl} 
                          alt={viewingDoc.name} 
                          className="max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-sm border border-slate-200"
                        />
                      ) : isPdf && normUrl ? (
                        <iframe 
                          src={`${normUrl}#toolbar=1`} 
                          title={viewingDoc.name}
                          className="w-full h-[500px] rounded-lg border border-slate-200 bg-white"
                        />
                      ) : normUrl ? (
                        <iframe 
                          src={normUrl} 
                          title={viewingDoc.name}
                          className="w-full h-[500px] rounded-lg border border-slate-200 bg-white"
                        />
                      ) : (
                        <div className="text-center py-12 px-4">
                          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold text-slate-600 mb-1">{viewingDoc.name}</p>
                          <p className="text-[11px] text-slate-400 mb-3">No direct embedded preview available for this file type.</p>
                          <button
                            type="button"
                            onClick={() => handleDownloadDoc(viewingDoc)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download to View</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Exhibit Audit & USCIS Tag Details */}
              {(() => {
                const normUrl = normalizeDocumentUrl(viewingDoc.fileUrl);
                return (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      <span>Exhibit Metadata &amp; Form I-140 Tagging</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Exhibit Tab</span>
                        <span className="font-mono font-bold text-blue-700">{viewingDoc.exhibitNumber || 'Exhibit --'}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Evidence Category</span>
                        <span className="font-semibold text-slate-800 truncate block">{viewingDoc.category}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">File Size</span>
                        <span className="font-semibold text-slate-800">{viewingDoc.fileSize}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-semibold">Current State</span>
                        <span className="font-semibold text-emerald-700">{viewingDoc.status}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 text-xs text-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Ready for inclusion in USCIS Form I-140 Index of Exhibits.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(viewingDoc)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Original</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Bottom Bar */}
            <div className="bg-slate-100 border-t border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-[#00a884]" />
                <span>Babel Global Certified Document Audit Record</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Close Viewer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
