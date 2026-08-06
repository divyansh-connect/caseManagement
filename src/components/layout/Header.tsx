import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Sparkles, 
  Upload, 
  ShieldCheck, 
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Menu
} from 'lucide-react';
import { UserRole } from '../../types';
import { NavTab } from './Sidebar';

interface HeaderProps {
  userRole: UserRole;
  activeTab: NavTab;
  onNavigateTab?: (tab: NavTab) => void;
  openNewCaseModal: () => void;
  openNewDocModal: () => void;
  openAIAssistant: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  activeTab,
  onNavigateTab,
  openNewCaseModal,
  openNewDocModal,
  openAIAssistant,
  searchQuery,
  setSearchQuery,
  onLogout,
  onToggleMobileMenu
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = [
    { id: 1, title: 'Draft Review Approved', desc: 'Senior Reviewer approved Section 11 Memorandum for Dr. Okafor (NIW-2025-078)', time: '10m ago', icon: CheckCircle2, type: 'success' },
    { id: 2, title: 'New Client Upload', desc: 'Dr. Elena Rostova uploaded Exhibit 103 (Google Scholar Report)', time: '45m ago', icon: FileCheck2, type: 'info' },
    { id: 3, title: 'Stage Advance Alert', desc: 'Case NIW-2025-089 advanced to Stage 9 (Draft Preparation)', time: '2h ago', icon: AlertCircle, type: 'warning' },
  ];

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator / Case Manager';
      case 'writer': return 'Petition Drafter';
      case 'reviewer': return 'Senior Reviewer';
      case 'client': return 'Client Account View';
    }
  };

  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Command Center';
      case 'cases': return 'Cases Engine & Petitions';
      case 'clients': return 'Client Directory';
      case 'tasks': return 'Task Workflow';
      case 'documents': return 'Document Vault & Exhibits';
      case 'reviews': return 'Reviews & Approvals Matrix';
      case 'communication': return 'Client Messaging & Logs';
      case 'payments': return 'Retainers & Fees';
      case 'templates': return 'NIW Case Templates';
      case 'reports': return 'Analytics & USCIS Reports';
      case 'settings': return 'System Settings & Security';
      case 'clientPortal': return 'Client Petition Portal';
      default: return 'Babel Global Workspace';
    }
  };

  const getUserName = () => {
    if (userRole === 'client') return 'Dr. Elena Rostova';
    if (userRole === 'reviewer') return 'Senior Reviewer';
    return 'Petition Drafter 1';
  };

  const getUserEmail = () => {
    if (userRole === 'client') return 'client@babelglobal.com';
    if (userRole === 'reviewer') return 'reviewer@babelglobal.com';
    return 'admin@babelglobal.com';
  };


  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
      {/* Left: Active Dashboard Title & Search */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Mobile Hamburger Menu Toggle Button */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Active Page Header Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></div>
          <h1 className="font-extrabold text-slate-800 text-xs sm:text-base tracking-tight truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
            {getTabTitle(activeTab)}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="hidden xl:flex items-center gap-3 w-72">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases, exhibits..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Right Hand Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Role Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>{getRoleLabel(userRole)}</span>
        </div>

        {/* Action Buttons */}
        {userRole !== 'client' && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={openNewDocModal}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Upload Exhibit"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Upload Exhibit</span>
            </button>

            {(userRole === 'superadmin' || userRole === 'admin') && (
              <button
                onClick={openNewCaseModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
                title="New NIW Case"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Case</span>
              </button>
            )}
          </div>
        )}

        {userRole !== 'client' && (
          <button
            onClick={openAIAssistant}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-300 text-amber-900 hover:bg-amber-500/20 text-xs font-medium transition-colors cursor-pointer"
            title="AI Draft Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>
        )}


        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-semibold text-xs text-slate-800">Notifications</span>
                <span className="text-[10px] text-blue-600 font-medium cursor-pointer">Mark all read</span>
              </div>
              <div className="py-2 space-y-2 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="flex gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <n.icon className={`w-4 h-4 shrink-0 mt-0.5 ${
                      n.type === 'success' ? 'text-emerald-500' : n.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <div className="text-xs font-medium text-slate-800">{n.title}</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{n.desc}</div>
                      <div className="text-[9px] text-slate-400 mt-1">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-blue-100 shadow-sm">
              {userRole === 'client' ? 'ER' : userRole === 'reviewer' ? 'SR' : 'PD'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-none">
                {getUserName()}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight mt-0.5 uppercase tracking-wider font-medium">
                {userRole === 'client' ? 'Client' : 'Immigration Team'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-40 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Profile Card Summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center shadow-md shrink-0">
                    {userRole === 'client' ? 'ER' : userRole === 'reviewer' ? 'SR' : 'PD'}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{getUserName()}</div>
                    <div className="text-[11px] text-slate-500 truncate">{getUserEmail()}</div>
                    <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-1">
                      {getRoleLabel(userRole)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (onNavigateTab) onNavigateTab('settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>System Settings</span>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              {/* Sign Out Action */}
              {onLogout && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out of Workspace</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
