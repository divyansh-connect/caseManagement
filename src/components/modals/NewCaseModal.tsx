import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CaseItem, RiskLevel, PetitionCategory } from '../../types';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (newCase: CaseItem) => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({ isOpen, onClose, onAddCase }) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [petitionCategory, setPetitionCategory] = useState<PetitionCategory>('EB-2 NIW');
  const [fieldCategory, setFieldCategory] = useState('');
  const [serviceCenter, setServiceCenter] = useState<'Nebraska (NSC)' | 'Texas (TSC)'>('Nebraska (NSC)');
  const [premium, setPremium] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !fieldCategory) return;

    const prefix = petitionCategory === 'EB-1A' ? 'EB1A' : petitionCategory === 'O-1' ? 'O1' : 'NIW';

    const createdCase: CaseItem = {
      id: `case-${Date.now()}`,
      caseNumber: `${prefix}-2025-${Math.floor(100 + Math.random() * 900)}`,
      clientId: `c-${Date.now()}`,
      clientName,
      clientEmail: clientEmail || `${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      petitionCategory,
      fieldCategory,
      currentStage: 1,
      assignedWriter: 'Petition Drafter 1',
      assignedReviewer: 'Senior Reviewer',
      riskLevel: 'low',
      targetFilingDate: '2025-05-15',
      uscisServiceCenter: serviceCenter,
      premiumProcessing: premium,
      dhanasar: {
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
      eb1aCriteria: petitionCategory === 'EB-1A' ? {
        prizes: true,
        membership: true,
        media: false,
        judging: true,
        originalContributions: true,
        scholarlyArticles: true,
        exhibitions: false,
        leadingRole: true,
        highSalary: false,
        commercialSuccess: false
      } : undefined,
      recommenders: [],
      documentsCount: 2,
      notes: 'Initial client intake created.',
      lastUpdated: 'Just now'
    };

    onAddCase(createdCase);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Intake New Case File" subtitle="Initialize 14-stage workflow pipeline for a new candidate">
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
              <option value="Immigration Editorial Services">Editorial Services</option>
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
            Create Case File
          </button>
        </div>
      </form>
    </Modal>
  );
};
