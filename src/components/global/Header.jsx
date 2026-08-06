import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../data/stageConfig';
import { Search, Bell, User, LogOut, ShieldCheck } from 'lucide-react';

export const Header = () => {
  const { user, switchRole, logout } = useAuth();

  return (
    <header className="glass-nav sticky top-0 z-40 h-16 px-6 flex items-center justify-between text-slate-200">
      {/* Brand & Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-bold text-white text-lg">
            N
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">NIW ImmigrateOS</h1>
            <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">EB-2 NIW Case Management</p>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Clients, Case Numbers, Documents, Tasks..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Role Switcher & User Control */}
      <div className="flex items-center space-x-4">
        {/* Quick Role Switcher for Testing/Demonstration */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-1">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span className="text-xs text-slate-400 font-medium">Role View:</span>
          <select
            value={user?.role}
            onChange={(e) => switchRole(e.target.value)}
            className="bg-transparent text-xs text-cyan-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value={USER_ROLES.ADMIN} className="bg-slate-900 text-slate-200">{USER_ROLES.ADMIN}</option>
            <option value={USER_ROLES.WRITER} className="bg-slate-900 text-slate-200">{USER_ROLES.WRITER}</option>
            <option value={USER_ROLES.REVIEWER} className="bg-slate-900 text-slate-200">{USER_ROLES.REVIEWER}</option>
            <option value={USER_ROLES.CLIENT} className="bg-slate-900 text-slate-200">{USER_ROLES.CLIENT}</option>
          </select>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-2 ring-slate-900"></span>
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-sm">
            {user?.name?.substring(0, 2) || "US"}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white">{user?.name}</div>
            <div className="text-[10px] text-slate-400">{user?.role}</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
