import React from 'react';
import { CreditCard, DollarSign, CheckCircle2 } from 'lucide-react';

export const AdminPayments = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Payments & Milestones</h1>
        <p className="text-xs text-slate-400">Track retainer payments, stage completion billing, and filing fee status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 border-l-4 border-l-emerald-500">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Collected</p>
          <p className="text-2xl font-bold text-white">$18,500</p>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-amber-500">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Pending Milestone Billing</p>
          <p className="text-2xl font-bold text-white">$4,200</p>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-blue-500">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">Filing Fees Held</p>
          <p className="text-2xl font-bold text-white">$2,100</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="px-5 py-3">Client</th>
              <th className="px-5 py-3">Case #</th>
              <th className="px-5 py-3">Milestone Stage</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Payment Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            <tr className="hover:bg-slate-800/40">
              <td className="px-5 py-4 font-semibold text-white">Dr. Alexander Vance</td>
              <td className="px-5 py-4 font-mono text-cyan-400">NIW-2026-001</td>
              <td className="px-5 py-4">Stage 5: Retainer Paid</td>
              <td className="px-5 py-4 font-semibold text-emerald-400">$3,500</td>
              <td className="px-5 py-4"><span className="px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 rounded font-bold">Paid</span></td>
              <td className="px-5 py-4 text-right">
                <button className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg">Update Status</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
