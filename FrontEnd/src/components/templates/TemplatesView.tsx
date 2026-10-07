import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Plus,
  Trash2,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  X,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { CaseTemplate, CaseItem } from '../../types';
import { api } from '../../services/api';

interface TemplatesViewProps {
  templates: CaseTemplate[];
  cases?: CaseItem[];
  openAIAssistant?: () => void;
  onRefreshCases?: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ 
  templates: initialTemplates, 
  cases = [], 
  openAIAssistant,
  onRefreshCases
}) => {
  const [templatesList, setTemplatesList] = useState<CaseTemplate[]>(initialTemplates);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Create Template Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    industry: '',
    title: '',
    description: '',
    sampleEndeavor: '',
    suggestedProng1: '',
    suggestedProng2: '',
    suggestedProng3: '',
    recommendedExhibits: ''
  });

  // Apply Template Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CaseTemplate | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(cases[0]?.id || '');
  const [isApplying, setIsApplying] = useState(false);

  // Sync state when prop changes or fetch on mount
  React.useEffect(() => {
    if (initialTemplates && initialTemplates.length > 0) {
      setTemplatesList(initialTemplates);
    } else {
      const fetchTemplates = async () => {
        try {
          const res = await api.get('/templates');
          if (res.success && res.data) {
            setTemplatesList(res.data);
          }
        } catch (e) {
          console.error('Failed to load templates:', e);
        }
      };
      fetchTemplates();
    }
  }, [initialTemplates]);

  React.useEffect(() => {
    if (cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleCopyEndeavor = (tpl: CaseTemplate) => {
    navigator.clipboard.writeText(tpl.sampleEndeavor);
    setCopiedId(tpl.id);
    showToast(`Copied endeavor statement for "${tpl.title}" to clipboard!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenApplyModal = (tpl: CaseTemplate) => {
    setSelectedTemplate(tpl);
    if (cases.length > 0) {
      setSelectedCaseId(cases[0].id);
    }
    setIsApplyModalOpen(true);
  };

  const handleApplyTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedCaseId) {
      alert('Please select a case to apply the template to.');
      return;
    }

    setIsApplying(true);
    try {
      const res = await api.post(`/templates/${selectedTemplate.id}/apply`, {
        caseId: selectedCaseId
      });

      if (res.success) {
        showToast(res.message || `Successfully applied "${selectedTemplate.title}" to selected case!`);
        setIsApplyModalOpen(false);
        if (onRefreshCases) {
          onRefreshCases();
        }
      } else {
        alert(res.error || 'Failed to apply template');
      }
    } catch (err: any) {
      alert(`Error applying template: ${err.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.industry.trim() || !newTemplate.title.trim() || !newTemplate.sampleEndeavor.trim()) {
      alert('Please fill out all required template fields.');
      return;
    }

    setIsCreating(true);
    try {
      const prong1Array = newTemplate.suggestedProng1
        ? newTemplate.suggestedProng1.split('\n').map(s => s.trim()).filter(Boolean)
        : [];
      const prong2Array = newTemplate.suggestedProng2
        ? newTemplate.suggestedProng2.split('\n').map(s => s.trim()).filter(Boolean)
        : [];
      const prong3Array = newTemplate.suggestedProng3
        ? newTemplate.suggestedProng3.split('\n').map(s => s.trim()).filter(Boolean)
        : [];
      const exhibitsArray = newTemplate.recommendedExhibits
        ? newTemplate.recommendedExhibits.split('\n').map(s => s.trim()).filter(Boolean)
        : [];

      const res = await api.post('/templates', {
        industry: newTemplate.industry,
        title: newTemplate.title,
        description: newTemplate.description || `EB-2 NIW argument framework tailored for ${newTemplate.industry}.`,
        sampleEndeavor: newTemplate.sampleEndeavor,
        suggestedProng1Points: prong1Array,
        suggestedProng2Points: prong2Array,
        suggestedProng3Points: prong3Array,
        recommendedExhibits: exhibitsArray.length > 0 ? exhibitsArray : [
          'Exhibit 101: Academic Citations & Google Scholar Metrics',
          'Exhibit 102: Independent Industry Expert Endorsement Letters'
        ]
      });

      if (res.success && res.data) {
        setTemplatesList(prev => [...prev, res.data]);
        showToast(`Template "${newTemplate.title}" saved to database successfully!`);
        setIsCreateModalOpen(false);
        setNewTemplate({
          industry: '',
          title: '',
          description: '',
          sampleEndeavor: '',
          suggestedProng1: '',
          suggestedProng2: '',
          suggestedProng3: '',
          recommendedExhibits: ''
        });
      } else {
        alert(res.error || 'Failed to save template to database.');
      }
    } catch (err: any) {
      alert(`Database error: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete template "${title}" from the database?`)) {
      return;
    }

    try {
      const res = await api.delete(`/templates/${templateId}`);
      if (res.success) {
        setTemplatesList(prev => prev.filter(t => t.id !== templateId));
        showToast(`Template "${title}" deleted from database.`);
      } else {
        alert(res.error || 'Failed to delete template.');
      }
    } catch (err: any) {
      alert(`Error deleting template: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-white hover:text-emerald-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">EB-2 NIW Industry Case Templates</h1>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
              {templatesList.length} Database Templates
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Pre-structured Dhanasar argument frameworks and exhibit checklists tailored by technical domain.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Template</span>
          </button>

          {openAIAssistant && (
            <button
              onClick={openAIAssistant}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>AI Drafter Assistant</span>
            </button>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {templatesList.map(tpl => (
          <div key={tpl.id} className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:border-blue-400 transition-all hover:shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  {tpl.industry}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyEndeavor(tpl)}
                    title="Copy Endeavor to Clipboard"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    {copiedId === tpl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.title)}
                    title="Delete Template"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{tpl.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{tpl.description}</p>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sample Endeavor Statement</span>
                  <span className="text-[10px] text-blue-600 font-medium">Matter of Dhanasar</span>
                </div>
                <p className="text-xs text-slate-700 font-mono bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed break-words">
                  "{tpl.sampleEndeavor}"
                </p>
              </div>

              {tpl.recommendedExhibits && Array.isArray(tpl.recommendedExhibits) && tpl.recommendedExhibits.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Recommended Exhibits Checklist</span>
                  <ul className="text-xs text-slate-700 space-y-1">
                    {tpl.recommendedExhibits.map((ex: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="leading-tight break-words">{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <button 
                onClick={() => handleOpenApplyModal(tpl)}
                className="flex-1 py-2 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Apply Template to Case</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 1: CREATE CUSTOM TEMPLATE
      ══════════════════════════════════════════════════════════════════════════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Create Custom Industry Template</h3>
                  <p className="text-[11px] text-slate-500">Save new Dhanasar endeavor framework to live database</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Industry / Field Category *</label>
                <input
                  type="text"
                  required
                  value={newTemplate.industry}
                  onChange={e => setNewTemplate({ ...newTemplate, industry: e.target.value })}
                  placeholder="e.g. Quantum Computing & Advanced Materials"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Template Title *</label>
                <input
                  type="text"
                  required
                  value={newTemplate.title}
                  onChange={e => setNewTemplate({ ...newTemplate, title: e.target.value })}
                  placeholder="e.g. Topological Qubit Hardware Scaling Endeavor"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newTemplate.description}
                  onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Target applicant background and specialization..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sample Proposed Endeavor Statement *</label>
                <textarea
                  required
                  rows={3}
                  value={newTemplate.sampleEndeavor}
                  onChange={e => setNewTemplate({ ...newTemplate, sampleEndeavor: e.target.value })}
                  placeholder="Engineering scalable fault-tolerant quantum microarchitectures to secure US technological and cryptography supremacy..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recommended Exhibits Checklist (One per line)</label>
                <textarea
                  rows={2}
                  value={newTemplate.recommendedExhibits}
                  onChange={e => setNewTemplate({ ...newTemplate, recommendedExhibits: e.target.value })}
                  placeholder="Exhibit 101: Published Patent Applications&#10;Exhibit 102: National Science Foundation Grants"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCreating ? 'Saving to DB...' : 'Save Template'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 2: APPLY TEMPLATE TO CASE
      ══════════════════════════════════════════════════════════════════════════ */}
      {isApplyModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Apply Template to Case</h3>
                  <p className="text-[11px] text-slate-500">Syncs endeavor statement into candidate case record</p>
                </div>
              </div>
              <button 
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{selectedTemplate.industry}</span>
              <h4 className="font-bold text-slate-900">{selectedTemplate.title}</h4>
              <p className="text-slate-600 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                "{selectedTemplate.sampleEndeavor}"
              </p>
            </div>

            <form onSubmit={handleApplyTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Target Candidate Case *</label>
                {cases.length === 0 ? (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-xs border border-rose-200">
                    No active cases found. Please create a case first.
                  </div>
                ) : (
                  <select
                    value={selectedCaseId}
                    onChange={e => setSelectedCaseId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {cases.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.clientName} ({c.caseNumber}) — {c.fieldCategory}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying || cases.length === 0}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isApplying ? 'Applying to Case...' : 'Confirm & Apply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
