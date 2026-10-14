import React, { useState } from 'react';
import { X, Download, ExternalLink, Sparkles, FileText, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';
import { CaseDocument } from '../../types';
import { downloadDocumentFile, normalizeDocumentUrl } from '../../utils/downloadHelper';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CaseDocument | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc
}) => {
  const [loadError, setLoadError] = useState(false);

  if (!isOpen || !doc) return null;

  // Clean URL for viewing (without forced attachment header)
  const rawUrl = doc.fileUrl || '';
  let viewUrl = rawUrl.trim();
  if (viewUrl.includes('localhost:5005')) {
    viewUrl = viewUrl.replace('http://localhost:5005', 'https://immigration-case-mangemnt-production.up.railway.app');
  } else if (viewUrl.startsWith('/uploads/')) {
    viewUrl = `https://immigration-case-mangemnt-production.up.railway.app${viewUrl}`;
  }
  // Remove fl_attachment if present so the browser can display the file inline
  if (viewUrl.includes('/upload/fl_attachment/')) {
    viewUrl = viewUrl.replace('/upload/fl_attachment/', '/upload/');
  }

  const isImage = /\.(jpe?g|png|webp|gif|svg)$/i.test(doc.name) || 
                  /\.(jpe?g|png|webp|gif|svg)/i.test(viewUrl) ||
                  (viewUrl.includes('/image/upload/') && !viewUrl.includes('.pdf'));

  const isPdf = /\.pdf$/i.test(doc.name) || /\.pdf/i.test(viewUrl);

  const handleDownload = () => {
    downloadDocumentFile(doc);
  };

  const handleOpenExternal = () => {
    if (viewUrl) {
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {doc.exhibitNumber && (
                  <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-600 text-white shadow-xs">
                    {doc.exhibitNumber}
                  </span>
                )}
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate max-w-md sm:max-w-xl" title={doc.name}>
                  {doc.name}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                  {doc.category || 'Evidence Document'}
                </span>
                {doc.fileSize && <span>• {doc.fileSize}</span>}
                {doc.uploadedBy && <span>• Uploaded by {doc.uploadedBy}</span>}
                {doc.uploadedAt && <span>• {doc.uploadedAt}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {viewUrl && (
              <button
                type="button"
                onClick={handleOpenExternal}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Summary Banner (if present) */}
        {doc.aiSummary && (
          <div className="bg-amber-50/70 border-b border-amber-200/60 px-5 py-2.5 flex items-start gap-2.5 text-xs text-amber-950">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-900">AI Legal Exhibit Summary: </span>
              <span>{doc.aiSummary}</span>
            </div>
          </div>
        )}

        {/* Main Document Preview Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50 flex flex-col items-center justify-center min-h-[350px]">
          {loadError || !viewUrl ? (
            <div className="text-center p-8 bg-white rounded-xl border border-slate-200 max-w-md shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{doc.name}</h4>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Direct embedded preview is unavailable for this file format in your browser. You can safely download or open the file directly.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </button>
                {viewUrl && (
                  <button
                    onClick={handleOpenExternal}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </button>
                )}
              </div>
            </div>
          ) : isImage ? (
            <div className="w-full flex items-center justify-center bg-slate-900/5 rounded-xl p-2 overflow-hidden border border-slate-200">
              <img 
                src={viewUrl} 
                alt={doc.name} 
                onError={() => setLoadError(true)}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <iframe
                src={`${viewUrl}#toolbar=1&navpanes=0`}
                title={doc.name}
                className="w-full h-full border-0"
                onError={() => setLoadError(true)}
              />
            </div>
          ) : (
            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <iframe
                src={viewUrl}
                title={doc.name}
                className="w-full h-full border-0"
                onError={() => setLoadError(true)}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              doc.status === 'Verified' || (doc.status as string) === 'Approved' || (doc.status as string) === 'Approved/Completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {doc.status || 'Pending Review'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
