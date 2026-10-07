import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  Layers, 
  List,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Check,
  X,
  Briefcase
} from 'lucide-react';
import { CaseItem, CaseTask, UserRole, StageId } from '../../types';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { NewTaskModal } from '../modals/NewTaskModal';
import { api } from '../../services/api';

interface TasksViewProps {
  tasks: CaseTask[];
  userRole: UserRole;
  cases?: CaseItem[];
  onAddTask?: (task: CaseTask) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ 
  tasks: initialTasks, 
  userRole, 
  cases = [], 
  onAddTask 
}) => {
  const [tasks, setTasks] = useState<CaseTask[]>(initialTasks);
  const [activeView, setActiveView] = useState<'list' | 'kanban'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  
  // Modals
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CaseTask | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state if initialTasks prop changes
  useEffect(() => {
    if (initialTasks && initialTasks.length > 0) {
      setTasks(initialTasks);
    }
  }, [initialTasks]);

  // Fetch fresh tasks from API on mount
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tasks');
      if (res.success && Array.isArray(res.data)) {
        setTasks(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Toggle task completed/pending status
  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = !task.completed;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));

    try {
      const res = await api.patch(`/tasks/${taskId}`, { completed: newStatus });
      if (res.success) {
        showToast(newStatus ? 'Task marked as completed! ✓' : 'Task reopened');
      } else {
        // Revert on failure
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: task.completed } : t));
        alert('Failed to update task status');
      }
    } catch (err: any) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: task.completed } : t));
      console.error('Error toggling task completion:', err);
    }
  };

  // Move task to another stage
  const handleMoveStage = async (taskId: string, newStageId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const clampedStage = Math.max(1, Math.min(7, newStageId)) as StageId;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, stageId: clampedStage } : t));

    try {
      const res = await api.patch(`/tasks/${taskId}`, { stageId: clampedStage });
      if (res.success) {
        const stageName = WORKFLOW_STAGES.find(s => s.id === clampedStage)?.name || `Stage ${clampedStage}`;
        showToast(`Moved task to ${stageName}`);
      }
    } catch (err) {
      console.error('Error updating task stage:', err);
    }
  };

  // Change priority directly
  const handleChangePriority = async (taskId: string, newPriority: CaseTask['priority']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));
    try {
      await api.patch(`/tasks/${taskId}`, { priority: newPriority });
      showToast(`Priority updated to ${newPriority.toUpperCase()}`);
    } catch (err) {
      console.error('Error updating priority:', err);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"?`)) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.success) {
        showToast('Task deleted successfully');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Edit task submit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    setIsSavingEdit(true);
    try {
      const res = await api.patch(`/tasks/${editingTask.id}`, {
        title: editingTask.title,
        assignedToName: editingTask.assignedToName,
        assignedRole: editingTask.assignedRole,
        stageId: editingTask.stageId,
        dueDate: editingTask.dueDate,
        priority: editingTask.priority,
        completed: editingTask.completed
      });

      if (res.success && res.data) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? res.data : t));
        showToast('Task details updated successfully');
        setEditingTask(null);
      }
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleCreateTask = (newTask: CaseTask) => {
    setTasks(prev => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" created successfully!`);
    if (onAddTask) {
      onAddTask(newTask);
    }
  };

  // Seed sample tasks if table is empty
  const handleSeedDefaultTasks = async () => {
    setIsLoading(true);
    try {
      const activeCaseId = cases[0]?.id || 'default-case';
      const defaults = [
        {
          caseId: activeCaseId,
          title: 'Verify academic degrees and peer-reviewed publication records',
          assignedRole: 'writer' as const,
          assignedToName: 'Sarah Jenkins',
          stageId: 1,
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          priority: 'urgent' as const,
        },
        {
          caseId: activeCaseId,
          title: 'Draft 3-5 independent expert recommender solicitation letters',
          assignedRole: 'writer' as const,
          assignedToName: 'Sarah Jenkins',
          stageId: 2,
          dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          priority: 'high' as const,
        },
        {
          caseId: activeCaseId,
          title: 'Complete USCIS Form I-140 and ETA-9089 questionnaire mapping',
          assignedRole: 'admin' as const,
          assignedToName: 'Case Administrator',
          stageId: 3,
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          priority: 'medium' as const,
        },
        {
          caseId: activeCaseId,
          title: 'Draft Dhanasar 3-Prong Legal Memorandum for Senior Reviewer',
          assignedRole: 'writer' as const,
          assignedToName: 'Sarah Jenkins',
          stageId: 4,
          dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
          priority: 'high' as const,
        },
        {
          caseId: activeCaseId,
          title: 'Assemble final exhibit binder and courier package for USCIS filing',
          assignedRole: 'reviewer' as const,
          assignedToName: 'David Miller, Esq.',
          stageId: 5,
          dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
          priority: 'medium' as const,
        }
      ];

      for (const t of defaults) {
        await api.post('/tasks', t);
      }
      await fetchTasks();
      showToast('Generated 5 dynamic workflow tasks!');
    } catch (err: any) {
      alert(`Error creating default tasks: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'completed' ? t.completed : !t.completed);
    const matchesStage = selectedStageFilter === 'all' || String(t.stageId) === selectedStageFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesStage;
  });

  // Calculate stats
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const urgentCount = tasks.filter(t => !t.completed && t.priority === 'urgent').length;
  const highCount = tasks.filter(t => !t.completed && t.priority === 'high').length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Kanban Stage Columns definitions mapped to real stages
  const KANBAN_COLUMNS = [
    {
      id: 'intake',
      title: 'Intake & Onboarding',
      subtitle: 'Consultation & Profile Audit',
      stages: [1],
      color: 'border-slate-300 bg-slate-50/70',
      badgeColor: 'bg-slate-200 text-slate-800'
    },
    {
      id: 'strategy',
      title: 'Strategy & Evidence',
      subtitle: 'Recommenders & Forms Prep',
      stages: [2, 3],
      color: 'border-blue-200 bg-blue-50/40',
      badgeColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'drafting',
      title: 'Drafting & Review',
      subtitle: 'Dhanasar Legal Memo',
      stages: [4],
      color: 'border-purple-200 bg-purple-50/40',
      badgeColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'filing',
      title: 'Final Package & Filing',
      subtitle: 'USCIS Submission & Tracking',
      stages: [5, 6, 7],
      color: 'border-emerald-200 bg-emerald-50/40',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white hover:text-emerald-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Editorial Task &amp; Workflow Engine</h1>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Real-time pipeline tracking for petition drafting, expert recommender letters, and legal review queues.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center justify-center gap-1 border border-slate-200 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveView('list')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeView === 'list' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setActiveView('kanban')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeView === 'kanban' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stage Board</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Dynamic Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Pipeline</span>
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-800">{totalCount}</span>
            <span className="text-[11px] font-semibold text-slate-500">{progressPercentage}% done</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Urgent &amp; High</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-rose-600">{urgentCount + highCount}</span>
            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
              {urgentCount} Urgent
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-600">{pendingCount}</span>
            <span className="text-[11px] text-slate-500">Active queue</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-emerald-600">{completedCount}</span>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search task title, assignee, description..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">⚡ Urgent Only</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="completed">Completed ({completedCount})</option>
          </select>

          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value)}
            className="col-span-2 sm:col-span-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
          >
            <option value="all">All Stages</option>
            {WORKFLOW_STAGES.map(s => (
              <option key={s.id} value={String(s.id)}>Stage {s.id}: {s.name}</option>
            ))}
          </select>

          <button
            onClick={fetchTasks}
            title="Refresh Tasks"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer hidden sm:block shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          VIEW 1: LIST VIEW
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeView === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-sm flex items-center justify-between bg-slate-50/50">
            <span>Workflow Tasks Directory ({filteredTasks.length})</span>
            <span className="text-xs font-semibold text-slate-500">{completedCount} of {totalCount} completed</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTasks.map(task => {
              const stageObj = WORKFLOW_STAGES.find(s => s.id === task.stageId) || WORKFLOW_STAGES[0];
              return (
                <div key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="mt-1 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-semibold leading-snug break-words ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-[11px] text-slate-500">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold border border-slate-200">
                          Stage {task.stageId}: {stageObj?.name}
                        </span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span>Assigned: <strong className="text-slate-800 font-medium">{task.assignedToName}</strong></span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span className="font-medium text-slate-700">Due {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto pl-7 sm:pl-0 shrink-0">
                    {/* Priority Selector */}
                    <select
                      value={task.priority}
                      onChange={(e) => handleChangePriority(task.id, e.target.value as any)}
                      className={`text-[10px] font-bold uppercase rounded px-2 py-1 border cursor-pointer ${
                        task.priority === 'urgent' 
                          ? 'bg-rose-50 text-rose-800 border-rose-300' 
                          : task.priority === 'high'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : task.priority === 'medium'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="urgent">⚡ Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    {/* Edit Button */}
                    <button
                      onClick={() => setEditingTask({ ...task })}
                      title="Edit Task"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTask(task.id, task.title)}
                      title="Delete Task"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-xs space-y-3">
                <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">No tasks found matching your filters.</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => { setSearchTerm(''); setPriorityFilter('all'); setStatusFilter('all'); setSelectedStageFilter('all'); }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs cursor-pointer font-medium"
                  >
                    Reset Filters
                  </button>
                  {tasks.length === 0 && (
                    <button
                      onClick={handleSeedDefaultTasks}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer font-bold"
                    >
                      Generate Default Tasks
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════════
            VIEW 2: STAGE BOARD (KANBAN)
        ══════════════════════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map(col => {
            const colTasks = filteredTasks.filter(t => col.stages.includes(t.stageId));
            const colCompleted = colTasks.filter(t => t.completed).length;

            return (
              <div 
                key={col.id} 
                className={`rounded-xl border ${col.color} flex flex-col min-h-[500px] shadow-2xs overflow-hidden`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-200/80 bg-white/80 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">{col.title}</h3>
                    <p className="text-[10px] text-slate-500">{col.subtitle}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${col.badgeColor}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map(t => {
                    const isUrgent = t.priority === 'urgent';
                    const isHigh = t.priority === 'high';

                    return (
                      <div 
                        key={t.id} 
                        className={`bg-white rounded-xl p-3.5 border shadow-xs transition-all space-y-2.5 ${
                          t.completed 
                            ? 'border-slate-200 opacity-60 bg-slate-50/80' 
                            : isUrgent 
                            ? 'border-rose-300 ring-1 ring-rose-200 shadow-sm' 
                            : isHigh
                            ? 'border-amber-300 shadow-xs'
                            : 'border-slate-200 hover:border-blue-400 hover:shadow-sm'
                        }`}
                      >
                        {/* Top: Priority & Checkbox */}
                        <div className="flex items-start justify-between gap-2">
                          <label className="flex items-start gap-2 cursor-pointer min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => toggleTaskCompletion(t.id)}
                              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer shrink-0"
                            />
                            <span className={`text-xs font-bold leading-snug break-words ${t.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {t.title}
                            </span>
                          </label>

                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : isHigh
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {t.priority}
                          </span>
                        </div>

                        {/* Assignee & Due Date */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                          <span className="font-semibold text-slate-700 flex items-center gap-1 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{t.assignedToName}</span>
                          </span>
                          <span className="font-medium text-slate-500 shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>{t.dueDate}</span>
                          </span>
                        </div>

                        {/* Stage Controls & Action Toolbar */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveStage(t.id, t.stageId - 1)}
                              disabled={t.stageId <= 1}
                              title="Move to Previous Stage"
                              className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-slate-700 px-1.5 font-mono">
                              St. {t.stageId}
                            </span>
                            <button
                              onClick={() => handleMoveStage(t.id, t.stageId + 1)}
                              disabled={t.stageId >= 7}
                              title="Move to Next Stage"
                              className="p-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingTask({ ...t })}
                              title="Edit Task"
                              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(t.id, t.title)}
                              title="Delete Task"
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-300/80 rounded-xl space-y-2">
                      <p className="font-medium text-slate-500">No active tasks in this column</p>
                      <button
                        onClick={() => {
                          setIsNewTaskModalOpen(true);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Task Here</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Column Footer */}
                <div className="p-2.5 bg-white/70 border-t border-slate-200/80 text-center text-[10px] font-semibold text-slate-500">
                  {colCompleted} / {colTasks.length} Completed
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL: EDIT TASK MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Edit Workflow Task</h3>
                  <p className="text-xs text-slate-300">Update task details, assignment, and lifecycle stage</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Task Title / Description *</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lifecycle Stage</label>
                  <select
                    value={editingTask.stageId}
                    onChange={(e) => setEditingTask({ ...editingTask, stageId: Number(e.target.value) as StageId })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    {WORKFLOW_STAGES.map(s => (
                      <option key={s.id} value={s.id}>
                        Stage {s.id}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority Level</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="urgent">⚡ Urgent / Impending</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Assigned Team Specialist</label>
                  <input
                    type="text"
                    required
                    value={editingTask.assignedToName}
                    onChange={(e) => setEditingTask({ ...editingTask, assignedToName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editingTask.completed}
                    onChange={(e) => setEditingTask({ ...editingTask, completed: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Mark as Completed / Approved</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm cursor-pointer"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Task Form Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onAddTask={handleCreateTask}
        cases={cases}
      />
    </div>
  );
};
