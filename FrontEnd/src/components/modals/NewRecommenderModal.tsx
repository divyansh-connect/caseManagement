import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Recommender } from '../../types';
import { api } from '../../services/api';

interface NewRecommenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecommender: (rec: Recommender) => void;
  caseId?: string;
}

export const NewRecommenderModal: React.FC<NewRecommenderModalProps> = ({ isOpen, onClose, onAddRecommender, caseId = 'case-101' }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [relationship, setRelationship] = useState<Recommender['relationship']>('Independent Expert');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title) return;

    try {
      const data = await api.post(`/cases/${caseId}/recommenders`, {
        name,
        title,
        organization: organization || 'US Research Institute',
        relationship
      });

      if (data.success) {
        onAddRecommender(data.data);
        setName('');
        setTitle('');
        setOrganization('');
        onClose();
      } else {
        alert('Failed to save recommender');
      }
    } catch (err: any) {
      alert(`Connection error: ${err.message}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expert Recommender" subtitle="Track expert letter signatories for Dhanasar Prong 2 & 3">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-bold mb-1">Expert Full Name & Credentials *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Arthur Pendelton, Ph.D."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Professional Title & Rank *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chair of Quantum Physics & Senior Fellow"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Institution / Organization</label>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. MIT / Sandia National Laboratories"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-bold mb-1">Relationship to Candidate</label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as any)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
          >
            <option value="Independent Expert">Independent Expert (High USCIS Weight)</option>
            <option value="Academic Advisor">Academic Advisor / Ph.D. Chair</option>
            <option value="Industry Collaborator">Industry Collaborator</option>
            <option value="Government Official">Government / Federal Agency Official</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold">
            Cancel
          </button>
          <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold shadow-sm hover:bg-blue-700">
            Save Recommender
          </button>
        </div>
      </form>
    </Modal>
  );
};
