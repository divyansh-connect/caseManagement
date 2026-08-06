import React from 'react';
import { 
  Settings, 
  Building, 
  ShieldCheck, 
  Bell, 
  DollarSign, 
  Sliders,
  Check,
  Save,
  Clock,
  UserCheck
} from 'lucide-react';
import { AuditLogEntry } from '../../types';

interface SettingsViewProps {
  activityLogs?: AuditLogEntry[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ activityLogs = [] }) => {
  return (
    <div className="space-y-4 sm:space-y-6 pb-12 w-full">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">System Settings & Governance</h1>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          Configure firm practice settings, Super Admin governance, and view system administrative activity history.
        </p>
      </div>

      {/* Audit History & Administrative Access Log */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm">System Administrative Access & Activity History</h3>
              <p className="text-xs text-slate-500">Record of Super Admin access, role switches, and "View As" activities</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {activityLogs.length} Events Recorded
          </span>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
          {activityLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">No activity history recorded yet.</div>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between text-xs gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {log.userEmail}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{log.details}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-3">Practice Group & Branding Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Company / Business Name</label>
              <input type="text" defaultValue="Babel Global" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Lead Immigration Specialist ID</label>
              <input type="text" defaultValue="BG-CONSULT-391024" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-2">Practice Areas & Editorial Offerings</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-slate-800">
              <span className="font-bold block text-blue-900">EB-2 NIW</span>
              <span className="text-[10px] text-slate-500">Dhanasar 3-Prong Analysis</span>
            </div>
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-slate-800">
              <span className="font-bold block text-blue-900">EB-1A Extraordinary</span>
              <span className="text-[10px] text-slate-500">10-Criteria Matrix</span>
            </div>
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-slate-800">
              <span className="font-bold block text-blue-900">O-1 Visa</span>
              <span className="text-[10px] text-slate-500">Nonimmigrant Petitions</span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-slate-800">
              <span className="font-bold block text-emerald-900">Immigration Editorial</span>
              <span className="text-[10px] text-emerald-700">Translation & Proofreading</span>
            </div>
          </div>
        </div>



        <div className="pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-3">USCIS Fee Calculation Defaults</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-140 Filing Fee</label>
              <input type="text" defaultValue="$715" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Form I-907 Premium Fee</label>
              <input type="text" defaultValue="$2,965" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-amber-700" />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Asylum Program Fee (Non-Profit/Small)</label>
              <input type="text" defaultValue="$300" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Notifications & Messaging Dispatch Preferences */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">System Messaging & Dispatch Preferences</h3>
              <p className="text-xs text-slate-500">Global notification triggers for clients and Babel Global Team</p>
            </div>
            <Bell className="w-4 h-4 text-blue-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">WhatsApp Instant Alerts</span>
                <span className="text-[10px] text-slate-500">Send automatic WhatsApp messages on stage progress</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
            </label>

            <label className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Email Document Requests</span>
                <span className="text-[10px] text-slate-500">Notify clients via email when exhibit review requires action</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
            </label>

            <label className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Appointment Reminders</span>
                <span className="text-[10px] text-slate-500">Automated SMS & Email reminders 24 hrs prior to calls</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
            </label>

            <label className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Quiet Hours Enforcement</span>
                <span className="text-[10px] text-slate-500">Pause automated dispatch between 09:00 PM and 08:00 AM</span>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <Save className="w-3.5 h-3.5" />
            <span>Save System Settings</span>
          </button>
        </div>
      </div>

    </div>
  );
};

