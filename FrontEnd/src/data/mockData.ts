import { WorkflowStage } from '../types';

export const WORKFLOW_STAGES: WorkflowStage[] = [
  { id: 1, name: 'Consultation & Onboarding', description: 'Profile assessment, engagement agreement, flexible payment & document collection', category: 'Intake', typicalDays: 5 },
  { id: 2, name: 'Case Strategy & Recommenders', description: 'Proposed endeavor development & expert recommender letters', category: 'Evaluation', typicalDays: 10 },
  { id: 3, name: 'Forms Preparation', description: 'USCIS questionnaires & official form packages (I-140, ETA-9089, G-1145)', category: 'Evaluation', typicalDays: 5 },
  { id: 4, name: 'Petition Drafting & Review', description: 'Legal petition memorandum drafting under Dhanasar 3-Prong framework', category: 'Drafting & Review', typicalDays: 14 },
  { id: 5, name: 'Final Package Preparation', description: 'Completed forms, petition letter, exhibit index & supporting exhibits', category: 'Final Filing', typicalDays: 4 },
  { id: 6, name: 'Filed with USCIS & Tracking', description: 'Package shipped to USCIS, receipt tracking, and status monitoring', category: 'Final Filing', typicalDays: 30 },
  { id: 7, name: 'Concurrent Form I-485 (Optional)', description: 'Activated for clients purchasing concurrent adjustment of status filing', category: 'Final Filing', typicalDays: 30 }
];
