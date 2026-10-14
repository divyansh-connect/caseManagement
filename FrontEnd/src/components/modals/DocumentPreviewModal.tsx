import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Eye, 
  AlertCircle, 
  Upload, 
  Loader2, 
  Check, 
  Info 
} from 'lucide-react';
import { CaseDocument } from '../../types';
import { downloadDocumentFile } from '../../utils/downloadHelper';
import { api } from '../../services/api';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: CaseDocument | null;
  onApprove?: () => void;
  onRequestRevision?: () => void;
  onDocumentUpdated?: (newDoc: CaseDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document: incomingDoc,
  onApprove,
  onRequestRevision,
  onDocumentUpdated
}) => {
  const [loadError, setLoadError] = useState(false);
  const [activeDoc, setActiveDoc] = useState<CaseDocument | null>(incomingDoc);
  const [isUploadingFilled, setIsUploadingFilled] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setActiveDoc(incomingDoc);
    setLoadError(false);
    setUploadSuccessToast(false);
    setUploadErrorMsg(null);
  }, [incomingDoc, isOpen]);

  if (!isOpen || !activeDoc) return null;

  // Clean URL for viewing (without forced attachment header)
  const rawUrl = activeDoc.fileUrl || '';
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

  const isImage = /\.(jpe?g|png|webp|gif|svg)$/i.test(activeDoc.name) || 
                  /\.(jpe?g|png|webp|gif|svg)/i.test(viewUrl) ||
                  (viewUrl.includes('/image/upload/') && !viewUrl.includes('.pdf'));

  const isPdf = /\.pdf$/i.test(activeDoc.name) || /\.pdf/i.test(viewUrl);

  const handleDownload = () => {
    downloadDocumentFile(activeDoc);
  };

  const handleOpenExternal = () => {
    if (viewUrl) {
      window.open(viewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleUploadFilledPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeDoc) return;

    setIsUploadingFilled(true);
    setUploadErrorMsg(null);

    const targetCaseId = activeDoc.caseId || 'default';
    const targetCategory = activeDoc.category || 'Identity & Personal Information';
    const uploader = activeDoc.uploadedBy || 'Client';
    const attachedTaskId = (activeDoc as any).attachedTaskId || '';

    const formData = new FormData();
    formData.append('caseId', targetCaseId);
    formData.append('category', targetCategory);
    formData.append('uploadedBy', uploader);
    if (attachedTaskId) {
      formData.append('attachedTaskId', attachedTaskId);
    }
    formData.append('file', file);

    try {
      const res = await api.post('/documents', formData, true);
      let updatedDoc: CaseDocument | null = null;
      if (res && res.success) {
        if (Array.isArray(res.documents) && res.documents.length > 0) updatedDoc = res.documents[0];
        else if (Array.isArray(res.data) && res.data.length > 0) updatedDoc = res.data[0];
        else if (res.data) updatedDoc = res.data;
      }

      if (!updatedDoc) {
        updatedDoc = {
          ...activeDoc,
          id: `doc-${Date.now()}`,
          name: file.name,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          uploadedAt: new Date().toISOString(),
          fileUrl: URL.createObjectURL(file),
          status: 'Pending Review'
        };
      }

      (updatedDoc as any).attachedTaskId = attachedTaskId;

      // 1. Update localStorage caches
      try {
        const rawMaster = localStorage.getItem('local_case_documents_master') || '[]';
        const parsedMaster: CaseDocument[] = JSON.parse(rawMaster);
        const filtered = parsedMaster.filter(d => d.id !== activeDoc.id && d.name !== activeDoc.name && d.id !== updatedDoc!.id);
        localStorage.setItem('local_case_documents_master', JSON.stringify([updatedDoc, ...filtered]));

        const caseDocKey = `local_case_documents_${targetCaseId}`;
        const rawCaseDocs = localStorage.getItem(caseDocKey) || '[]';
        const parsedCaseDocs: CaseDocument[] = JSON.parse(rawCaseDocs);
        const filteredCase = parsedCaseDocs.filter(d => d.id !== activeDoc.id && d.name !== activeDoc.name && d.id !== updatedDoc!.id);
        localStorage.setItem(caseDocKey, JSON.stringify([updatedDoc, ...filteredCase]));
      } catch {}

      // 2. Update task submissions in localStorage so Super Admin immediately gets the new filled file
      try {
        const taskKeys = [
          'workflow_stage_tasks_master',
          `workflow_stage_tasks_${targetCaseId}`,
          'workflow_stage_tasks_shared',
          'workflow_stage_tasks_latest'
        ];
        for (const k of taskKeys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const stages = JSON.parse(raw);
            if (Array.isArray(stages)) {
              const updatedStages = stages.map((st: any) => ({
                ...st,
                tasks: st.tasks.map((t: any) => {
                  if (t.submission && Array.isArray(t.submission.documents)) {
                    const hasOldDoc = t.submission.documents.some((d: any) => d.id === activeDoc.id || d.name === activeDoc.name);
                    if (hasOldDoc || (attachedTaskId && t.id === attachedTaskId)) {
                      const newDocs = t.submission.documents.map((d: any) => 
                        (d.id === activeDoc.id || d.name === activeDoc.name) ? updatedDoc : d
                      );
                      // If old doc wasn't in array, append
                      const docExists = newDocs.some((d: any) => d.id === updatedDoc!.id);
                      const finalDocs = docExists ? newDocs : [updatedDoc, ...newDocs];
                      return {
                        ...t,
                        submission: {
                          ...t.submission,
                          docName: updatedDoc!.name,
                          documents: finalDocs,
                          submittedAt: new Date().toISOString()
                        }
                      };
                    }
                  } else if (attachedTaskId && t.id === attachedTaskId) {
                    return {
                      ...t,
                      submission: {
                        type: 'document',
                        docName: updatedDoc!.name,
                        documents: [updatedDoc],
                        submittedAt: new Date().toISOString(),
                        note: `Uploaded filled document: ${updatedDoc!.name}`
                      }
                    };
                  }
                  return t;
                })
              }));
              localStorage.setItem(k, JSON.stringify(updatedStages));
            }
          }
        }
      } catch {}

      // 3. Broadcast events to all components & tabs
      window.dispatchEvent(new CustomEvent('document_uploaded', {
        detail: { document: updatedDoc, caseId: targetCaseId }
      }));
      window.dispatchEvent(new CustomEvent('workflow_task_updated', {
        detail: { taskId: attachedTaskId }
      }));
      try {
        const bc = new BroadcastChannel('jurisflow_workflow_sync');
        bc.postMessage({ taskId: attachedTaskId });
        setTimeout(() => {
          try { bc.close(); } catch {}
        }, 1000);
      } catch {}

      // 4. Update preview in-place
      setActiveDoc(updatedDoc);
      if (onDocumentUpdated) onDocumentUpdated(updatedDoc);
      setUploadSuccessToast(true);
      setTimeout(() => setUploadSuccessToast(false), 5000);

    } catch (err: any) {
      console.error('Failed to upload filled PDF:', err);
      setUploadErrorMsg(err.message || 'Failed to upload filled document.');
    } finally {
      setIsUploadingFilled(false);
      // Reset input value so same file name can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
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
                {activeDoc.exhibitNumber && (
                  <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-600 text-white shadow-xs">
                    {activeDoc.exhibitNumber}
                  </span>
                )}
                <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate max-w-md sm:max-w-xl" title={activeDoc.name}>
                  {activeDoc.name}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                  {activeDoc.category || 'Evidence Document'}
                </span>
                {activeDoc.fileSize && <span>• {activeDoc.fileSize}</span>}
                {activeDoc.uploadedBy && <span>• Uploaded by {activeDoc.uploadedBy}</span>}
                {activeDoc.uploadedAt && <span>• {activeDoc.uploadedAt}</span>}
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

        {/* Success Alert Toast when Filled PDF is Uploaded */}
        {uploadSuccessToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">
                Filled PDF uploaded and saved! Super Admin will now see all your checked boxes & responses.
              </span>
            </div>
            <button
              onClick={() => setUploadSuccessToast(false)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert Toast */}
        {uploadErrorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center justify-between text-xs text-rose-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadErrorMsg}</span>
            </div>
            <button
              onClick={() => setUploadErrorMsg(null)}
              className="text-rose-700 hover:text-rose-900 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Fillable PDF Interactive Form Notice Banner */}
        {isPdf && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/80 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-950">
            <div className="flex items-start sm:items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <div className="leading-snug">
                <span className="font-bold text-amber-900">How to save filled checkboxes / form fields: </span>
                <span className="text-slate-700">
                  After ticking checkboxes in this viewer, click the <strong>Download icon (⤓)</strong> in the top PDF toolbar → select <strong>"With your changes"</strong>, then click <strong>"Upload Filled Version"</strong> so your answers are saved to the server and visible to Super Admin.
                </span>
              </div>
            </div>
            <label
              htmlFor="upload-filled-pdf-banner"
              className={`px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shrink-0 transition-colors shadow-2xs flex items-center justify-center gap-1.5 text-xs ${
                isUploadingFilled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Upload the PDF with your checked responses"
            >
              {isUploadingFilled ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Filled Version</span>
                </>
              )}
            </label>
            <input
              id="upload-filled-pdf-banner"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleUploadFilledPdf}
              disabled={isUploadingFilled}
            />
          </div>
        )}

        {/* AI Summary Banner (if present) */}
        {activeDoc.aiSummary && !isPdf && (
          <div className="bg-amber-50/70 border-b border-amber-200/60 px-5 py-2.5 flex items-start gap-2.5 text-xs text-amber-950">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-900">AI Legal Exhibit Summary: </span>
              <span>{activeDoc.aiSummary}</span>
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
              <h4 className="font-bold text-slate-800 text-sm mb-1">{activeDoc.name}</h4>
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
                alt={activeDoc.name} 
                onError={() => setLoadError(true)}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <iframe
                src={`${viewUrl}#toolbar=1&navpanes=0`}
                title={activeDoc.name}
                className="w-full h-full border-0"
                onError={() => setLoadError(true)}
              />
            </div>
          ) : (
            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <iframe
                src={viewUrl}
                title={activeDoc.name}
                className="w-full h-full border-0"
                onError={() => setLoadError(true)}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-white flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              activeDoc.status === 'Verified' || (activeDoc.status as string) === 'Approved' || (activeDoc.status as string) === 'Approved/Completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {activeDoc.status || 'Pending Review'}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct Upload Filled Version Button in Footer */}
            {isPdf && (
              <label
                htmlFor="upload-filled-pdf-footer"
                className={`px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                  isUploadingFilled ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                title="Select and upload the filled PDF saved on your device"
              >
                {isUploadingFilled ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Filled Version</span>
                  </>
                )}
                <input
                  id="upload-filled-pdf-footer"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleUploadFilledPdf}
                  disabled={isUploadingFilled}
                />
              </label>
            )}

            {onRequestRevision && (
              <button
                type="button"
                onClick={onRequestRevision}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-rose-200 transition-colors cursor-pointer"
                title="Send revision request to client"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Request Revision</span>
              </button>
            )}

            {onApprove && (
              <button
                type="button"
                onClick={onApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                title="Approve this submission"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Submission</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download original file to device"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
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
