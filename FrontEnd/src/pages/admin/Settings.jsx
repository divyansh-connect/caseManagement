import React from 'react';
import { Settings, Users, Sliders, Link, ShieldCheck } from 'lucide-react';

export const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings & Integrations</h1>
        <p className="text-xs text-slate-400">User RBAC management, workflow configuration, and 3rd-party cloud integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-cyan-400" /> User Management & RBAC Roles
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">Sarah Jenkins</p>
                <p className="text-[10px] text-slate-400">writer@immigrationlaw.com • Petition Writer</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 rounded">Active</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">David Miller</p>
                <p className="text-[10px] text-slate-400">reviewer@immigrationlaw.com • Reviewer</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 rounded">Active</span>
            </div>
          </div>
          <button className="px-4 py-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold border border-slate-700">
            + Add System User
          </button>
        </div>

        {/* Third-Party Integrations */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Link className="h-4 w-4 text-emerald-400" /> Connected System Integrations
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div>
                <p className="font-bold text-white">Google Drive / Zoho Cloud Storage</p>
                <p className="text-[10px] text-slate-400">Automated document backup & exhibit sync</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 font-bold rounded">Connected</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div>
                <p className="font-bold text-white">WhatsApp Business API</p>
                <p className="text-[10px] text-slate-400">Automated client document reminders</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 font-bold rounded">Connected</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <div>
                <p className="font-bold text-white">Electronic Signatures (e-Sign)</p>
                <p className="text-[10px] text-slate-400">Retainer agreements & terms acceptance</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 font-bold rounded">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
