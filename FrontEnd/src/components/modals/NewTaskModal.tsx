import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CaseTask, StageId, UserRole } from '../../types';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { api } from '../../services/api';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask?: (task: CaseTask) => void;
  onUpdateTask?: (task: CaseTask) => void;
  initialData?: CaseTask | null;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onAddTask, onUpdateTask, initialData }) => {
  const [title, setTitle] = useState('');
  const [stageId, setStageId] = useState<StageId>(1);
  const [assignedToName, setAssignedToName] = useState('');
  const [assignedRole, setAssignedRole] = useState<UserRole>('writer');
  const [dueDate, setDueDate] = useState('2025-03-15');
  const [priority, setPriority] = useState<CaseTask['priority']>('medium');
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setStageId(initialData.stageId);
        setAssignedToName(initialData.assignedToName);
        setAssignedRole(initialData.assignedRole);
        setDueDate(initialData.dueDate);
        setPriority(initialData.priority);
        setSelectedCaseId(initialData.caseId || '');
      } else {
        setTitle('');
        setStageId(1);
        setDueDate('2025-03-15');
        setPriority('medium');
        setAssignedToName('');
        setSelectedCaseId('');
      }

      // Fetch users
      api.get('/users').then(res => {
        if (res.success && Array.isArray(res.data)) {
          const activeMembers = res.data.filter((u: any) => u.status === 'Active');
          setTeamMembers(activeMembers);
          if (activeMembers.length > 0 && !initialData) {
            setAssignedToName(activeMembers[0].name);
            setAssignedRole(activeMembers[0].role as UserRole || 'writer');
          }
        }
      }).catch(err => console.warn('Failed to fetch team members', err));

      // Fetch cases
      api.get('/cases').then(res => {
        if (res.success && Array.isArray(res.data)) {
          setCases(res.data);
          if (res.data.length > 0 && !initialData) {
            setSelectedCaseId(res.data[0].id);
          }
        }
      }).catch(err => console.warn('Failed to fetch cases', err));
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!selectedCaseId) {
      alert('You must have at least one case in the system before you can create a task.');
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        stageId,
        assignedToName,
        assignedRole,
        dueDate,
        priority,
        caseId: selectedCaseId
      };

      if (initialData) {
        const data = await api.patch(`/tasks/${initialData.id}`, payload);
        if (data.success && onUpdateTask) {
          onUpdateTask(data.data);
          onClose();
        } else {
          alert('Failed to update task');
        }
      } else {
        const data = await api.post('/tasks', payload);
        if (data.success && onAddTask) {
          onAddTask(data.data);
          onClose();
        } else {
          alert('Failed to create task');
        }
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? "Edit Editorial Workflow Task" : "Create New Editorial Workflow Task"} 
      subtitle={initialData ? "Modify task details" : "Assign task to petition writers, editorial researchers, or senior reviewers"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1">Target Case *</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {cases.length > 0 ? (
              cases.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.client?.name || c.clientName || 'Unknown Client'}
                </option>
              ))
            ) : (
              <option value="">No cases available (Create a case first)</option>
            )}
          </select>
        </div>

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
                if (name === 'Client') {
                  setAssignedRole('client');
                } else {
                  const selectedMember = teamMembers.find(m => m.name === name);
                  if (selectedMember) {
                    setAssignedRole(selectedMember.role as UserRole || 'writer');
                  }
                }
              }}
              className="w-full max-w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="Client" className="font-bold text-blue-600">👤 Client (Action Item)</option>
              {teamMembers.length > 0 ? (
                teamMembers.map(member => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))
              ) : (
                <option value="">Loading team...</option>
              )}
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
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm text-xs"
          >
            {initialData ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
