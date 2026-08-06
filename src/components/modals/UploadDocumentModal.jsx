import React, { useState } from 'react';
import { useCase } from '../../context/CaseContext';
import { DOCUMENT_CATEGORIES } from '../../data/stageConfig';
import { X, UploadCloud } from 'lucide-react';

export const UploadDocumentModal = ({ isOpen, onClose }) => {
  const { cases, addDocument } = useCase();
  const [formData, setFormData] = useState({
    caseNumber: cases[0]?.caseNumber || 'NIW-2026-001',
    name: '',
    category: DOCUMENT_CATEGORIES[0],
    uploadedBy: 'Sarah Jenkins'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addDocument(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 space-y-5 border border-slate-700/80 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <UploadCloud className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Upload New Document</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Case</label>
            <select
              value={formData.caseNumber}
              onChange={e => setFormData({ ...formData, caseNumber: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {cases.map(c => (
                <option key={c.caseNumber} value={c.caseNumber}>{c.caseNumber} - {c.clientName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Document File Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Vance_Dhanasar_Prong2_Draft.docx"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-colors">
            <UploadCloud className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">Click to select file or drop here</p>
            <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOCX, PNG up to 50MB</p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-blue-500/20">Upload Document</button>
          </div>
        </form>
      </div>
    </div>
  );
};
