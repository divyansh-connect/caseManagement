import React from 'react';
import { RiskLevel, StageId } from '../../types';
import { WORKFLOW_STAGES } from '../../data/mockData';

interface StageBadgeProps {
  stageId: StageId;
  showCategory?: boolean;
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stageId, showCategory = false }) => {
  const stage = WORKFLOW_STAGES.find(s => s.id === stageId) || WORKFLOW_STAGES[0];
  
  // Category colors
  let colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  if (stage.category === 'Intake') colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  if (stage.category === 'Evaluation') colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  if (stage.category === 'Endeavor & Evidence') colorClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (stage.category === 'Drafting & Review') colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
  if (stage.category === 'Final Filing') colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      <span>Stage {stage.id}: {stage.name}</span>
      {showCategory && <span className="opacity-60 text-[10px] ml-1">({stage.category})</span>}
    </span>
  );
};

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let label = 'Low RFE Risk';
  if (level === 'medium') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
    label = 'Medium RFE Risk';
  } else if (level === 'high') {
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
    label = 'High RFE Risk';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${badgeStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let style = 'bg-gray-100 text-gray-700 border-gray-200';
  if (['Active', 'Verified', 'Approved', 'Paid', 'Completed'].includes(status)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['Pending', 'Pending Review', 'Drafting Letter', 'Outreach Sent', 'Needs Revision'].includes(status)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['Urgent', 'Overdue', 'High', 'Archived'].includes(status)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
};
