import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FileText, CheckCircle2, User, Landmark, GraduationCap, Briefcase, Save } from 'lucide-react';

interface USCISFormQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
  onSave?: () => void;
}

export const USCISFormQuestionnaireModal: React.FC<USCISFormQuestionnaireModalProps> = ({
  isOpen,
  onClose,
  clientName = 'Client Candidate',
  onSave
}) => {
  const [activeSection, setActiveSection] = useState<'bio' | 'edu' | 'work' | 'uscis'>('bio');

  // Form State
  const [fullName, setFullName] = useState(clientName);
  const [dob, setDob] = useState('1988-06-14');
  const [countryBirth, setCountryBirth] = useState('Germany');
  const [countryCitizenship, setCountryCitizenship] = useState('Germany');
  const [alienRegNo, setAlienRegNo] = useState('A-098-214-389');
  const [ssn, setSsn] = useState('XXX-XX-4819');
  
  // Education
  const [degree, setDegree] = useState('Ph.D. in Computational Physics');
  const [institution, setInstitution] = useState('Massachusetts Institute of Technology');
  const [gradYear, setGradYear] = useState('2018');

  // Employment & US Entry
  const [currentEmployer, setCurrentEmployer] = useState('Quantum Labs Inc.');
  const [jobTitle, setJobTitle] = useState('Lead Quantum Algorithm Research Engineer');
  const [usVisaClass, setUsVisaClass] = useState('O-1A Nonimmigrant');
  const [i94Number, setI94Number] = useState('98210481920');

  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => {
      if (onSave) onSave();
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="USCIS Form I-140 Intake Questionnaire"
      subtitle="Complete official biographical, educational, and US immigration history details"
    >
      {isSaved ? (
        <div className="py-8 text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Questionnaire Saved & Verified!</h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Your USCIS biographical dataset has been mapped to Form I-140 Part 1 & Part 3 fields.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-2 pb-2">
            {[
              { id: 'bio', label: '1. Biographical & SSN', icon: User },
              { id: 'edu', label: '2. Highest Degree', icon: GraduationCap },
              { id: 'work', label: '3. Employment', icon: Briefcase },
              { id: 'uscis', label: '4. I-94 & Visa History', icon: Landmark }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 1: Bio */}
          {activeSection === 'bio' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Full Legal Name (as on Passport) *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Country of Birth *</label>
                  <input
                    type="text"
                    required
                    value={countryBirth}
                    onChange={(e) => setCountryBirth(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Country of Citizenship *</label>
                  <input
                    type="text"
                    required
                    value={countryCitizenship}
                    onChange={(e) => setCountryCitizenship(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">USCIS A-Number (if any)</label>
                  <input
                    type="text"
                    value={alienRegNo}
                    onChange={(e) => setAlienRegNo(e.target.value)}
                    placeholder="A-XXX-XXX-XXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">US Social Security Number (if any)</label>
                  <input
                    type="text"
                    value={ssn}
                    onChange={(e) => setSsn(e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Education */}
          {activeSection === 'edu' && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Highest Earned Academic Degree *</label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. Ph.D. in Machine Learning"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Granting Institution / University *</label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Year of Degree Award *</label>
                  <input
                    type="text"
                    required
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Work */}
          {activeSection === 'work' && (
            <div className="space-y-3 animate-fadeIn">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Current Employer / Sponsoring Organization *</label>
                <input
                  type="text"
                  required
                  value={currentEmployer}
                  onChange={(e) => setCurrentEmployer(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Current Official Job Title *</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Section 4: USCIS */}
          {activeSection === 'uscis' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Current US Nonimmigrant Status *</label>
                  <input
                    type="text"
                    required
                    value={usVisaClass}
                    onChange={(e) => setUsVisaClass(e.target.value)}
                    placeholder="e.g. H-1B, O-1, F-1 OPT"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Most Recent I-94 Arrival Record Number *</label>
                  <input
                    type="text"
                    required
                    value={i94Number}
                    onChange={(e) => setI94Number(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              Form I-140 Parts 1, 3 Mapped
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Questionnaire</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
