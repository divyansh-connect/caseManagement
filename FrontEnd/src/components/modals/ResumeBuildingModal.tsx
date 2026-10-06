import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { 
  FileText, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  File, 
  FileCode, 
  FileSpreadsheet, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { CaseItem, CaseDocument } from '../../types';
import { api } from '../../services/api';

interface ResumeBuildingModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: CaseItem | null;
  onComplete?: () => void;
}

const DOCUMENT_CATEGORIES = [
  'Current CV / Resume Draft',
  'Academic Degrees & Transcripts',
  'Work Experience & Employment Letters',
  'Certifications & Training',
  'Publications & Portfolio',
  'Other Supporting Document'
];

export const ResumeBuildingModal: React.FC<ResumeBuildingModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onComplete
}) => {
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents for the case whenever modal opens or caseItem changes
  useEffect(() => {
    if (isOpen && caseItem?.id) {
      fetchDocuments(caseItem.id);
    }
  }, [isOpen, caseItem?.id]);

  const fetchDocuments = async (caseId: string) => {
    try {
      const res = await api.get('/documents', { caseId });
      if (res.success && Array.isArray(res.data)) {
        setDocuments(res.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
    }
  };

  if (!isOpen || !caseItem) return null;

  // Handle multi-file selection & upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccessMsg(null);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseItem.id);
      formData.append('category', selectedCategory);

      try {
        const res = await api.post('/documents', formData, true);
        if (res.success && res.data) {
          setDocuments(prev => [res.data, ...prev]);
          successCount++;
        } else {
          failCount++;
        }
      } catch (err: any) {
        console.error(`Failed to upload ${file.name}:`, err);
        failCount++;
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0 && failCount === 0) {
      setUploadSuccessMsg(`Successfully uploaded ${successCount} document${successCount > 1 ? 's' : ''}.`);
    } else if (successCount > 0 && failCount > 0) {
      setUploadSuccessMsg(`Uploaded ${successCount} document${successCount > 1 ? 's' : ''}, but ${failCount} failed.`);
    } else if (failCount > 0) {
      setUploadError(`Failed to upload file${failCount > 1 ? 's' : ''}. Please try again.`);
    }
  };

  // Handle document deletion from backend database
  const handleDeleteDocument = async (docId: string) => {
    setDeletingId(docId);
    setUploadError(null);
    setUploadSuccessMsg(null);

    try {
      const res = await api.delete(`/documents/${docId}`);
      if (res.success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        setUploadSuccessMsg('Document removed successfully.');
      } else {
        setUploadError(res.error || 'Failed to remove document.');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to remove document.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleContinueSubmit = () => {
    if (onComplete) {
      onComplete();
    }
    onClose();
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-5 h-5 text-blue-500" />;
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return <File className="w-5 h-5 text-emerald-500" />;
    if (['xls', 'xlsx'].includes(ext || '')) return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resume Building Workspace"
      subtitle="Upload required candidate files for professional resume construction & profile enhancement"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Candidate & Case Overview Bar */}
        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-cyan-300">{caseItem.clientName}</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Resume Building
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Case ID: <span className="font-mono text-slate-200">{caseItem.caseNumber}</span> • Email: <span className="text-slate-300">{caseItem.clientEmail}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Endeavor Field</span>
            <span className="text-xs font-semibold text-slate-200">{caseItem.fieldCategory}</span>
          </div>
        </div>

        {/* Upload Feedback Messages */}
        {uploadError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
        {uploadSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadSuccessMsg}</span>
          </div>
        )}

        {/* Document Category & Multi-File Upload Zone */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload Resume Documents
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isUploading
                ? 'bg-blue-50/50 border-blue-400'
                : 'bg-white border-slate-300 hover:border-blue-500 hover:bg-blue-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
            />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-2 text-blue-600">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="font-semibold text-xs">Uploading document(s) to database...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs">Click to browse or drag & drop files</span>
                  <p className="text-[11px] text-slate-500">Supports PDF, DOCX, PNG, JPG (Multiple files allowed)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Documents List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              Uploaded Documents ({documents.length})
            </h4>
            <span className="text-[11px] text-slate-500">Persisted in database</span>
          </div>

          {documents.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-500">
              <FileText className="w-8 h-8 mx-auto text-slate-300 mb-1" />
              <p className="font-medium text-xs">No documents uploaded yet for this Resume Building case.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use the upload box above to add candidate documents.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-sm max-h-64 overflow-y-auto">
              {documents.map((doc) => (
                <div key={doc.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                      {getFileIcon(doc.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate text-xs">{doc.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                          {doc.category}
                        </span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                        <span>•</span>
                        <span>Uploaded by {doc.uploadedBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {doc.status || 'Uploaded'}
                    </span>

                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      disabled={deletingId === doc.id}
                      title="Remove / Delete Document"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>All uploads automatically saved to database</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleContinueSubmit}
              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Continue & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
