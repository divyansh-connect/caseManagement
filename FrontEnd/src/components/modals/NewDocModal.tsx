import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CaseDocument } from '../../types';
import { api } from '../../services/api';

interface NewDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDoc: (doc: CaseDocument) => void;
  caseId?: string;
}

export const NewDocModal: React.FC<NewDocModalProps> = ({ isOpen, onClose, onAddDoc, caseId = 'case-101' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [exhibitNum, setExhibitNum] = useState('Exhibit 104');
  const [category, setCategory] = useState<string>('Publication');
  const [customTitle, setCustomTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    if (category === 'Others' && !customTitle.trim()) {
      alert('Please enter a document title');
      return;
    }

    const finalCategory = category === 'Others' ? (customTitle.trim() || 'Others') : category;
    const finalName = category === 'Others' ? (customTitle.trim() || file.name) : file.name;

    const formData = new FormData();
    formData.append('caseId', caseId);
    formData.append('category', finalCategory);
    formData.append('name', finalName);
    formData.append('file', file);

    try {
      const data = await api.post('/documents', formData, true);
      if (data.success) {
        const newDoc: CaseDocument = {
          ...data.data,
          name: finalName,
          category: finalCategory,
          exhibitNumber: exhibitNum
        };
        onAddDoc(newDoc);
        onClose();
        setFile(null);
        setCustomTitle('');
        setCategory('Publication');
      } else {
        alert('Upload failed');
      }
    } catch (err: any) {
      alert(`Connection error: ${err.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload & Classify Exhibit Document" subtitle="Attach academic or technical evidence to Form I-140 petition">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1">Select Evidence File *</label>
          <input
            type="file"
            required
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const selectedFile = e.target.files[0];
                setFile(selectedFile);
                setDocName(selectedFile.name);
              }
            }}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              onChange={(e) => setCategory(e.target.value)}
              className="w-full max-w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="CV">CV / Bio</option>
              <option value="Degree">Academic Degree / Evaluation</option>
              <option value="Publication">Peer-Reviewed Publication</option>
              <option value="Citation Report">Citation Index Report</option>
              <option value="Recommendation Letter">Recommendation Letter</option>
              <option value="Expert Opinion">Expert Opinion Assessment</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {category === 'Others' && (
          <div className="animate-fadeIn">
            <label className="block text-slate-700 font-bold mb-1">Document Title *</label>
            <input
              type="text"
              required
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Enter document title"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        )}

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
