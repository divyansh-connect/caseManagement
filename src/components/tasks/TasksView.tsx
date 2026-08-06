import React, { useState } from 'react';
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
  List
} from 'lucide-react';
import { CaseTask, UserRole } from '../../types';
import { WORKFLOW_STAGES } from '../../data/mockData';
import { NewTaskModal } from '../modals/NewTaskModal';

interface TasksViewProps {
  tasks: CaseTask[];
  userRole: UserRole;
  onAddTask?: (task: CaseTask) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks: initialTasks, userRole, onAddTask }) => {
  const [tasks, setTasks] = useState<CaseTask[]>(initialTasks);
  const [activeView, setActiveView] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // Sync state if initialTasks changes
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleCreateTask = (newTask: CaseTask) => {
    setTasks([newTask, ...tasks]);
    if (onAddTask) {
      onAddTask(newTask);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.assignedToName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Legal Task &amp; Workflow Engine</h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Track petition drafting deadlines, recommendation letter follow-ups, and partner review queues.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <div className="bg-slate-100 p-1 rounded-lg flex items-center justify-center gap-1 border border-slate-200 text-xs font-semibold w-full sm:w-auto">
            <button
              onClick={() => setActiveView('list')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${activeView === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List View</span>
            </button>
            <button
              onClick={() => setActiveView('kanban')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${activeView === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stage Board</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewTaskModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search task title, assignee..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* View Rendering */}
      {activeView === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-sm flex items-center justify-between">
            <span>Pending Tasks ({filteredTasks.filter(t => !t.completed).length})</span>
            <span className="text-xs font-normal text-slate-500">Total: {filteredTasks.length}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTasks.map(task => {
              const stageObj = WORKFLOW_STAGES.find(s => s.id === task.stageId);
              return (
                <div key={task.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
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
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium border border-slate-200">
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
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      task.priority === 'urgent' 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No tasks found matching your search.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Intake & Verification', stages: [1, 2, 3, 4, 5] },
            { title: 'Endeavor & Evidence', stages: [6, 7, 8] },
            { title: 'Drafting & Review', stages: [9, 10, 11, 12] },
            { title: 'Final Filing', stages: [13, 14] }
          ].map(col => {
            const colTasks = filteredTasks.filter(t => col.stages.includes(t.stageId));
            return (
              <div key={col.title} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-slate-700 uppercase tracking-wider px-1">
                  <span>{col.title}</span>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold">{colTasks.length}</span>
                </div>
                <div className="space-y-2.5">
                  {colTasks.map(t => (
                    <div key={t.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs text-xs space-y-2 hover:border-slate-300 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 leading-snug">{t.title}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                          t.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                        <span className="font-medium text-slate-600">{t.assignedToName}</span>
                        <span className="font-bold text-slate-700">Due {t.dueDate}</span>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-lg">
                      No tasks in this stage column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Form Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onAddTask={handleCreateTask}
      />
    </div>
  );
};
