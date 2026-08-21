import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CheckSquare, 
  FileText, 
  FileCheck, 
  MessageSquare, 
  CreditCard, 
  FileSpreadsheet, 
  BarChart3, 
  Settings, 
  Sparkles,
  LogOut,
  GraduationCap,
  X,
  ChevronDown,
  ChevronRight,
  Smartphone,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavTab = 
  | 'dashboard'
  | 'cases'
  | 'clients'
  | 'adminManagement'
  | 'tasks'
  | 'documents'
  | 'reviews'
  | 'communication'
  | 'payments'
  | 'templates'
  | 'reports'
  | 'settings'
  | 'clientPortal'
  | 'forms'
  | 'appointments'
  | 'postFiling';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  openAIAssistant: () => void;
  openWhatsAppModal?: () => void;
  openHubLogs?: () => void;
  activeCaseCount: number;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  openAIAssistant,
  openWhatsAppModal,
  openHubLogs,
  activeCaseCount,
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [isCommDropdownOpen, setIsCommDropdownOpen] = React.useState<boolean>(false);

  const allNavItems = [
    { id: 'clientPortal', label: 'Case Overview', icon: LayoutDashboard, roles: ['client'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'writer', 'reviewer'] },
    { id: 'clients', label: 'Clients', icon: Users, roles: ['superadmin', 'admin'] },
    { id: 'adminManagement', label: 'Admin Management', icon: UserCheck, roles: ['superadmin'] },
    { id: 'cases', label: userRole === 'writer' ? 'My Assigned Cases' : userRole === 'superadmin' ? 'All Cases' : 'Cases', icon: Briefcase, badge: activeCaseCount, roles: ['superadmin', 'admin', 'writer', 'reviewer'] },
    { id: 'tasks', label: userRole === 'writer' ? 'My Tasks' : 'Tasks', icon: CheckSquare, roles: ['admin', 'writer', 'reviewer', 'client'] },
    { id: 'documents', label: userRole === 'writer' ? 'Research & Evidence' : 'Documents', icon: FileText, roles: ['superadmin', 'admin', 'writer', 'reviewer', 'client'] },
    { id: 'forms', label: userRole === 'reviewer' ? 'Forms Review' : userRole === 'writer' ? 'Forms & Checklists' : 'Forms', icon: FileSpreadsheet, roles: ['superadmin', 'admin', 'writer', 'reviewer', 'client'] },
    { id: 'reviews', label: userRole === 'reviewer' ? 'Assigned Reviews' : 'Reviews & Approvals', icon: FileCheck, roles: ['superadmin', 'admin', 'reviewer'] },
    { id: 'communication', label: userRole === 'writer' ? 'Messages' : userRole === 'reviewer' ? 'Messages' : 'Communication', icon: MessageSquare, roles: ['superadmin', 'admin', 'writer', 'reviewer', 'client'] },
    { id: 'payments', label: userRole === 'client' ? 'Agreement & Payments' : 'Payments', icon: CreditCard, roles: ['superadmin', 'admin', 'client'] },
    { id: 'templates', label: userRole === 'writer' ? 'Petition Drafts' : 'Case Templates', icon: FileSpreadsheet, roles: ['admin', 'writer'] },
    { id: 'appointments', label: 'Appointments', icon: GraduationCap, roles: ['admin', 'client'] },
    { id: 'postFiling', label: 'Post-Filing Updates', icon: FileCheck, roles: ['client'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['superadmin', 'admin', 'reviewer'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['superadmin', 'admin', 'client'] },
  ];

  // Filter items authorized for the currently logged-in role
  const authorizedNavItems = allNavItems.filter(item => item.roles.includes(userRole));

  const getSectionTitle = () => {
    switch (userRole) {
      case 'superadmin': return 'SUPER ADMINISTRATOR CONTROL';
      case 'admin': return 'Administrator Control';
      case 'writer': return 'Drafter Workspace';
      case 'reviewer': return 'Reviewer Hub';
      case 'client': return 'Client Workspace';
    }
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'superadmin': return 'Super Administrator';
      case 'admin': return 'Administrator / Case Manager';
      case 'writer': return 'Drafter / Researcher';
      case 'reviewer': return 'Reviewer';
      case 'client': return 'Client (Petitioner)';
    }
  };

  const handleNavClick = (tabId: NavTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const renderContent = (isMobile: boolean = false) => (
    <>
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/40">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-white text-base tracking-tight">Babel Global</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800/60">OS</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Immigration Petition Platform</p>
          </div>
        </div>

        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Mobile Menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* AI Assistant Quick Launcher (Hidden for Client role) */}
      {userRole !== 'client' && (
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => {
              openAIAssistant();
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md transition-all group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>Babel AI Petition Drafter</span>
          </button>
        </div>
      )}


      {/* Role-Filtered Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-1">
          {getSectionTitle()}
        </div>

        {authorizedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isCommunication = item.id === 'communication';

          if (isCommunication) {
            return (
              <div key={item.id} className="space-y-1">
                {/* Client Messaging Parent Nav Button with Dropdown Toggle */}
                <button
                  onClick={() => {
                    handleNavClick('communication');
                    setIsCommDropdownOpen(prev => !prev);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {isCommDropdownOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Sub-menu Dropdown items under Client Messaging */}
                {isCommDropdownOpen && (
                  <div className="pl-4 space-y-1 pr-1 border-l-2 border-slate-800 ml-4 py-1 animate-fadeIn">
                    <button
                      onClick={() => {
                        handleNavClick('communication');
                        if (openWhatsAppModal) openWhatsAppModal();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 border border-emerald-900/40 transition-all cursor-pointer group"
                      title="Open WhatsApp Web Live Chat"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span>WhatsApp Live Chat</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('communication');
                        if (openHubLogs) openHubLogs();
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                        activeTab === 'communication'
                          ? 'text-blue-300 bg-slate-800/80 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>Messaging Hub Logs</span>
                    </button>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as NavTab)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Clean Footer with Active Role & Logout Button */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Account</span>
            <span className="text-xs font-semibold text-slate-200">{getRoleDisplayName()}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        {onLogout && (
          <button
            onClick={() => {
              if (isMobile && onCloseMobile) onCloseMobile();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-all group cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign Out of Portal</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col h-full border-r border-slate-800 shrink-0 z-30">
        {renderContent(false)}
      </aside>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 md:hidden transition-opacity cursor-pointer"
        />
      )}

      {/* Mobile Sliding Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderContent(true)}
      </aside>
    </>
  );
};
