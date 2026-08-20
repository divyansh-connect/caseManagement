import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../data/stageConfig';
import { 
  LayoutDashboard, Users, Briefcase, FileText, CheckSquare, 
  CheckCircle, MessageSquare, CreditCard, Layers, BarChart3, Settings, UserCheck, Calendar
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  // Sidebar Links Configuration based on Role
  let navItems = [];

  if (role === USER_ROLES.ADMIN) {
    navItems = [
      { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/clients', name: 'Clients', icon: Users },
      { path: '/admin/cases', name: 'Cases', icon: Briefcase },
      { path: '/admin/documents', name: 'Documents', icon: FileText },
      { path: '/admin/tasks', name: 'Tasks', icon: CheckSquare },
      { path: '/admin/reviews', name: 'Reviews & Approvals', icon: CheckCircle },
      { path: '/admin/communication', name: 'Communication', icon: MessageSquare },
      { path: '/admin/payments', name: 'Payments', icon: CreditCard },
      { path: '/admin/templates', name: 'Case Templates', icon: Layers },
      { path: '/admin/appointments', name: 'Appointments', icon: Calendar },
      { path: '/admin/reports', name: 'Reports', icon: BarChart3 },
      { path: '/admin/settings', name: 'Settings', icon: Settings },
    ];
  } else if (role === USER_ROLES.WRITER) {
    navItems = [
      { path: '/writer/dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { path: '/writer/cases', name: 'Assigned Cases', icon: Briefcase },
      { path: '/writer/tasks', name: 'Assigned Tasks', icon: CheckSquare },
    ];
  } else if (role === USER_ROLES.REVIEWER) {
    navItems = [
      { path: '/reviewer/dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { path: '/reviewer/reviews', name: 'Reviews', icon: CheckCircle },
      { path: '/reviewer/tasks', name: 'Tasks', icon: CheckSquare },
    ];
  } else if (role === USER_ROLES.CLIENT) {
    navItems = [
      { path: '/client/dashboard', name: 'Dashboard', icon: LayoutDashboard },
      { path: '/client/my-case', name: 'My Case', icon: Briefcase },
      { path: '/client/documents', name: 'Documents', icon: FileText },
      { path: '/client/questionnaires', name: 'Questionnaires', icon: CheckSquare },
      { path: '/client/terms', name: 'Terms & Conditions', icon: FileText },
      { path: '/client/payments', name: 'Payments', icon: CreditCard },
      { path: '/client/messages', name: 'Messages', icon: MessageSquare },
      { path: '/client/profile', name: 'Profile', icon: UserCheck },
    ];
  }

  return (
    <aside className="glass-sidebar w-64 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30 shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer info in sidebar */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
        <p className="text-[11px] font-semibold text-cyan-400">EB-2 NIW Workflow Engine</p>
        <p className="text-[10px] text-slate-500">v1.0 MVP Operational</p>
      </div>
    </aside>
  );
};
