import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CaseItem, RiskLevel, PetitionCategory } from '../../types';
import { api } from '../../services/api';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (newCase: CaseItem) => void;
  onOpenResumeBuilding?: (createdCase: CaseItem) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose, onAddCase, onOpenResumeBuilding }) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [petitionCategory, setPetitionCategory] = useState<PetitionCategory>('EB-2 NIW');
  const [fieldCategory, setFieldCategory] = useState('');
  const [serviceCenter, setServiceCenter] = useState<'Nebraska (NSC)' | 'Texas (TSC)'>('Nebraska (NSC)');
  const [premium, setPremium] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !fieldCategory) return;

    try {
      const clientEmailVal = clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      
      // Perform atomic client & case intake transaction
      const caseData = await api.post('/cases/intake', {
        clientName,
        clientEmail: clientEmailVal,
        phone: '+1 (555) 012-3456',
        countryOfBirth: 'United States',
        currentField: fieldCategory,
        highestDegree: 'Ph.D.',
        university: 'Standard University',
        petitionCategory,
        fieldCategory,
        assignedWriter: 'Petition Drafter 1',
        assignedReviewer: 'Senior Reviewer',
        riskLevel: 'low',
        targetFilingDate: '2026-12-31',
        uscisServiceCenter: serviceCenter,
        premiumProcessing: premium
      });

      if (!caseData.success) {
        alert('Failed to initialize case file: ' + (caseData.error || 'Unknown error'));
        return;
      }

      const createdCase: CaseItem = {
        ...caseData.data,
        clientName,
        clientEmail: clientEmailVal,
        dhanasar: caseData.data.dhanasarProngs || {
          prong1: {
            title: 'Substantial Merit & National Importance',
            endeavorSummary: `Advancing ${fieldCategory} with direct national impact across federal initiatives.`,
            usImpactAreas: ['National Strategy Directive', 'Executive Order Modernization'],
            nationalImportanceScore: 90
          },
          prong2: {
            title: 'Well Positioned to Advance the Endeavor',
            educationTrack: 'Advanced degree qualification & publication track record.',
            keyAchievements: ['Authored milestone peer-reviewed literature', 'Verified citation record'],
            citationPercentile: 'Top 5%',
            fundingSecured: '$500,000 Grants'
          },
          prong3: {
            title: 'On Balance Beneficial to Waive Job Offer & PERM',
            urgencyArguments: ['Rapid deployment required to support national competitive standing'],
            uniqueExpertise: 'Specialized technical expertise.'
          }
        },
        recommenders: caseData.data.recommenders || [],
        documentsCount: caseData.data.documents?.length || 0,
        notes: caseData.data.notes || 'Initial client intake created.',
        lastUpdated: 'Just now'
      };

      onAddCase(createdCase);
      onClose();

      if (petitionCategory === 'Resume Building' && onOpenResumeBuilding) {
        onOpenResumeBuilding(createdCase);
      }
    } catch (err: any) {
      alert(`Intake failed: ${err.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Intake New Case File" subtitle="Initialize workflow pipeline for a new candidate">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">Candidate Full Name *</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Dr. Alexander Vance"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">Petition Category *</label>
            <select
              value={petitionCategory}
              onChange={(e) => setPetitionCategory(e.target.value as PetitionCategory)}
              className="w-full max-w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-blue-700 truncate"
            >
              <option value="EB-2 NIW">EB-2 NIW</option>
              <option value="EB-1A">EB-1A</option>
              <option value="O-1">O-1 Visa</option>
              <option value="Profile Building">Profile Building</option>
              <option value="Resume Building">Resume Building</option>
              <option value="Mexico TR Visa">Mexico TR Visa</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Candidate Email *</label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="e.g. alexander.vance@tech-lab.org"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Proposed Endeavor Domain / Field *</label>
          <input
            type="text"
            required
            value={fieldCategory}
            onChange={(e) => setFieldCategory(e.target.value)}
            placeholder="e.g. Autonomous Satellite Navigation & Debris Mitigation"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="block text-slate-700 font-bold mb-1">USCIS Service Center</label>
            <select
              value={serviceCenter}
              onChange={(e) => setServiceCenter(e.target.value as any)}
              className="w-full max-w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 truncate"
            >
              <option value="Nebraska (NSC)">Nebraska Service Center (NSC)</option>
              <option value="Texas (TSC)">Texas Service Center (TSC)</option>
            </select>
          </div>

          <div className="min-w-0 flex items-center">
            <label className="flex items-center gap-2 mt-2 sm:mt-5 cursor-pointer font-semibold text-slate-800 text-xs">
              <input
                type="checkbox"
                checked={premium}
                onChange={(e) => setPremium(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer shrink-0"
              />
              <span>Include Premium Processing ($2,965)</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-sm hover:bg-blue-700 cursor-pointer">
            {petitionCategory === 'Resume Building' ? 'Continue to Resume Building Upload' : 'Create Case File'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
