import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { CaseDocument } from '../../types';
import { StatusBadge } from '../common/Badge';

interface DocumentsViewProps {
  documents: CaseDocument[];
  openNewDocModal: () => void;
  openAIAssistant: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  openNewDocModal,
  openAIAssistant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [downloadToast, setDownloadToast] = useState('');

  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.exhibitNumber && d.exhibitNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.aiSummary && d.aiSummary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Handle Document Download
  const handleDownloadDoc = (doc: CaseDocument) => {
    const fileContent = 
      `BABEL GLOBAL IMMIGRATION EXHIBIT VAULT\n` +
      `=======================================\n` +
      `Exhibit Ref: ${doc.exhibitNumber || 'N/A'}\n` +
      `Document Name: ${doc.name}\n` +
      `Category: ${doc.category}\n` +
      `Uploaded By: ${doc.uploadedBy} on ${doc.uploadedAt}\n` +
      `Status: ${doc.status}\n` +
      `AI Summary: ${doc.aiSummary || 'N/A'}\n` +
      `---------------------------------------\n` +
      `Official Verification Seal: VERIFIED-BG-2026-USCIS\n`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${doc.name.replace(/\s+/g, '_')}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadToast(`Downloaded ${doc.name} successfully!`);
    setTimeout(() => setDownloadToast(''), 4000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{downloadToast}</span>
          </div>
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
            className="w-full sm:w-auto max-w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="all">All Categories</option>
            <option value="CV">CV / Bio</option>
            <option value="Degree">Academic Degrees</option>
            <option value="Publication">Publications</option>
            <option value="Citation Report">Citation Reports</option>
            <option value="Recommendation Letter">Expert Recommendation Letters</option>
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
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">AI Legal Intelligence Summary</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-slate-800">
                    {doc.exhibitNumber || 'Exhibit --'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900 text-xs">{doc.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{doc.fileSize} • Uploaded by {doc.uploadedBy} on {doc.uploadedAt}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
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
                  <td className="px-5 py-4">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => handleDownloadDoc(doc)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 ml-auto border border-blue-200 transition-all cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-600" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
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
                  <h3 className="font-bold text-slate-900 text-xs mt-2 break-all">{doc.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{doc.fileSize} • {doc.uploadedAt}</p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={doc.status} />
                </div>
              </div>

              {doc.aiSummary && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5 text-xs text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{doc.aiSummary}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                  {doc.category}
                </span>

                <button 
                  onClick={() => handleDownloadDoc(doc)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-blue-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
