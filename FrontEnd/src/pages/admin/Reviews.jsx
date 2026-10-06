import React from 'react';
import { useCase } from '../../context/CaseContext';
import { CheckCircle2, MessageSquare, Check, X, FileText } from 'lucide-react';

export const AdminReviews = () => {
  const { reviews } = useCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reviews & Approvals</h1>
        <p className="text-xs text-slate-400">Audit drafted petition briefs, Dhanasar 3-Prong arguments, and recommendation letters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Document</th>
                <th className="px-5 py-3">Reviewer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submission Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-semibold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" /> {r.document}
                  </td>
                  <td className="px-5 py-4 text-slate-300">{r.reviewer}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${r.status === 'Approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400">{r.date}</td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg">Approve</button>
                    <button className="px-2.5 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg">Request Changes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Review Notes Panel */}
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-cyan-400" /> Reviewer Notes & Feedback
          </h3>
          <textarea
            rows="5"
            placeholder="Add internal feedback for petition writer regarding editorial citations or Dhanasar arguments..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          ></textarea>
          <button className="w-full py-2 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl">
            Save Review Note
          </button>
        </div>
      </div>
    </div>
  );
};
