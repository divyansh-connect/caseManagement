import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CaseDocument } from '../../types';

interface NewDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDoc: (doc: CaseDocument) => void;
  caseId?: string;
}

export const NewDocModal: React.FC<NewDocModalProps> = ({ isOpen, onClose, onAddDoc, caseId = 'case-101' }) => {
  const [docName, setDocName] = useState('');
  const [exhibitNum, setExhibitNum] = useState('Exhibit 104');
  const [category, setCategory] = useState<CaseDocument['category']>('Publication');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;

    const newDoc: CaseDocument = {
      id: `doc-${Date.now()}`,
      caseId,
      name: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
      exhibitNumber: exhibitNum,
      category,
      fileSize: '2.1 MB',
      uploadedBy: 'Legal Team Specialist',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Verified',
      aiSummary: `AI Verified ${category} supporting candidate's national importance arguments for Form I-140.`
    };

    onAddDoc(newDoc);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload & Classify Exhibit Document" subtitle="Attach academic or technical evidence to Form I-140 petition">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1">Document Title / File Name *</label>
          <input
            type="text"
            required
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="e.g. IEEE_Transaction_Paper_2024.pdf"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">Exhibit Index Number</label>
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
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-sm hover:bg-blue-700 cursor-pointer">
            Attach Exhibit File
          </button>
        </div>
      </form>
    </Modal>
  );
};
