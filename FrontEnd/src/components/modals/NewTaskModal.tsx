import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CaseTask, StageId, UserRole } from '../../types';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { api } from '../../services/api';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: CaseTask) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [stageId, setStageId] = useState<StageId>(9);
  const [assignedToName, setAssignedToName] = useState('Sarah Jenkins');
  const [assignedRole, setAssignedRole] = useState<UserRole>('writer');
  const [dueDate, setDueDate] = useState('2025-03-15');
  const [priority, setPriority] = useState<CaseTask['priority']>('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const data = await api.post('/tasks', {
        caseId: 'case-101', // Default target case file
        title: title.trim(),
        assignedRole,
        assignedToName,
        stageId,
        dueDate,
        priority
      });

      if (data.success) {
        onAddTask(data.data);
        setTitle('');
        onClose();
      } else {
        alert('Failed to create task');
      }
    } catch (err: any) {
      alert(`Connection error: ${err.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Legal Workflow Task" subtitle="Assign task to petition writers, legal researchers, or senior reviewers">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1">Task Title / Description *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finalize Dhanasar Prong 1 Executive Memorandum"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">Workflow Lifecycle Stage</label>
            <select
              value={stageId}
              onChange={(e) => setStageId(Number(e.target.value) as StageId)}
              className="w-full max-w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              {WORKFLOW_STAGES.map(s => (
                <option key={s.id} value={s.id}>
                  Stage {s.id}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full max-w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">⚡ Urgent / Deadline Impending</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">Assigned Babel Global Team</label>
            <select
              value={assignedToName}
              onChange={(e) => {
                const name = e.target.value;
                setAssignedToName(name);
                if (name.includes('David')) setAssignedRole('reviewer');
                else setAssignedRole('writer');
              }}
              className="w-full max-w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="Sarah Jenkins">Sarah Jenkins (Petition Writer)</option>
              <option value="David Miller, Esq.">David Miller, Esq. (Senior Reviewer)</option>
              <option value="Marcus Vance">Marcus Vance (Legal Researcher)</option>
              <option value="Intake Desk">Intake Desk (Staff)</option>
            </select>
          </div>

          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-sm hover:bg-blue-700 cursor-pointer">
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};
