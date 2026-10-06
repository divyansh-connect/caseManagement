import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { CaseDocument, CaseItem } from '../../types';
import { api } from '../../services/api';
import { UploadCloud, FileText, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

interface NewDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDoc: (doc: CaseDocument | CaseDocument[]) => void;
  caseId?: string;
  cases?: CaseItem[];
}

export const NewDocModal: React.FC<NewDocModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddDoc, 
  caseId,
  cases = []
}) => {
  const [targetCaseId, setTargetCaseId] = useState(caseId || cases[0]?.id || '');
  const [files, setFiles] = useState<File[]>([]);
  const [exhibitNum, setExhibitNum] = useState('Exhibit 104');
  const [category, setCategory] = useState<CaseDocument['category']>('Publication');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (caseId) {
      setTargetCaseId(caseId);
    } else if (cases.length > 0 && !targetCaseId) {
      setTargetCaseId(cases[0].id);
    }
  }, [caseId, cases, targetCaseId]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selected]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...dropped]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleModalClose = () => {
    if (isUploading) return;
    setFiles([]);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    const finalCaseId = targetCaseId || caseId || (cases[0]?.id || 'default');
    formData.append('caseId', finalCaseId);
    formData.append('category', category);

    // Append all selected files
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const res = await api.post('/documents', formData, true);
      if (res.success) {
        let createdDocs: CaseDocument[] = [];
        if (Array.isArray(res.documents)) {
          createdDocs = res.documents;
        } else if (Array.isArray(res.data)) {
          createdDocs = res.data;
        } else if (res.data) {
          createdDocs = [{
            ...res.data,
            exhibitNumber: exhibitNum
          }];
        }

        onAddDoc(createdDocs.length === 1 ? createdDocs[0] : createdDocs);
        setFiles([]);
        onClose();
      } else {
        alert(res.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(`Connection error: ${err.message || 'Failed to upload'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Upload & Classify Exhibit Documents"
      subtitle="Attach single or multiple academic and technical evidence files to case"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Drag and Drop Zone */}
        <div>
          <label className="block text-slate-700 font-bold mb-1.5">
            Select Evidence Files * <span className="font-normal text-slate-500">(Multiple files allowed)</span>
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'bg-blue-50 border-blue-500 scale-[1.01]'
                : 'bg-slate-50/70 border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt,.xls,.xlsx"
            />
            <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  Click to browse or drag &amp; drop files here
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports PDF, DOCX, PNG, JPG, XLS (You can select multiple files at once)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Files Preview List */}
        {files.length > 0 && (
          <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Selected Files ({files.length})
              </span>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {files.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-slate-400 shrink-0 font-mono text-[10px]">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer shrink-0"
                    title="Remove file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">Exhibit Index / Prefix</label>
            <input
              type="text"
              value={exhibitNum}
              onChange={(e) => setExhibitNum(e.target.value)}
              placeholder="e.g. Exhibit 104"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">Evidence Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full max-w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="CV">CV / Bio</option>
              <option value="Degree">Academic Degree / Evaluation</option>
              <option value="Publication">Peer-Reviewed Publication</option>
              <option value="Citation Report">Citation Index Report</option>
              <option value="Recommendation Letter">Recommendation Letter</option>
              <option value="Expert Opinion">Expert Opinion Assessment</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button
            type="button"
            disabled={isUploading}
            onClick={handleModalClose}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading || files.length === 0}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-sm hover:bg-blue-700 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading {files.length} file{files.length > 1 ? 's' : ''}...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload {files.length > 0 ? `${files.length} ` : ''}File{files.length > 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

