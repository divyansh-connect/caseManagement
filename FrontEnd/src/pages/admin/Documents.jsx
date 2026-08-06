import React, { useState } from 'react';
import { useCase } from '../../context/CaseContext';
import { DOCUMENT_CATEGORIES } from '../../data/stageConfig';
import { FileText, UploadCloud, Download, Eye, History, Trash2, Filter } from 'lucide-react';

export const AdminDocuments = () => {
  const { documents, setActiveModal } = useCase();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredDocs = activeCategory === 'All' 
    ? documents 
    : documents.filter(d => d.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Document Management</h1>
          <p className="text-xs text-slate-400">Store, categorize, version, and manage all petition evidence & drafts</p>
        </div>
        <button
          onClick={() => setActiveModal('UPLOAD_DOCUMENT')}
          className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <UploadCloud className="h-4 w-4" /> Upload Document
        </button>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeCategory === 'All' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          All Categories ({documents.length})
        </button>
        {DOCUMENT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-3">Document Name</th>
              <th className="px-5 py-3">Case #</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Upload Date</th>
              <th className="px-5 py-3">Uploaded By</th>
              <th className="px-5 py-3">Version</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredDocs.map(d => (
              <tr key={d.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-4 font-semibold text-white flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  <span className="truncate max-w-xs">{d.name}</span>
                </td>
                <td className="px-5 py-4 font-mono text-cyan-400">{d.caseNumber}</td>
                <td className="px-5 py-4 text-slate-300">{d.category}</td>
                <td className="px-5 py-4 text-slate-400">{d.uploadDate}</td>
                <td className="px-5 py-4 text-slate-300">{d.uploadedBy}</td>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">
                    {d.version}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-950 text-emerald-400 rounded">
                    {d.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right space-x-1">
                  <button title="View" className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800"><Eye className="h-4 w-4" /></button>
                  <button title="Download" className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800"><Download className="h-4 w-4" /></button>
                  <button title="Version History" className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800"><History className="h-4 w-4" /></button>
                  <button title="Delete" className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
