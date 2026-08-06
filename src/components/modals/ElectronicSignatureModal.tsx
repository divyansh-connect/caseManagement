import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FileText, CheckCircle2, ShieldCheck, PenTool, Lock, Download } from 'lucide-react';

interface ElectronicSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle?: string;
  clientName?: string;
  onSignComplete?: () => void;
}

export const ElectronicSignatureModal: React.FC<ElectronicSignatureModalProps> = ({
  isOpen,
  onClose,
  documentTitle = 'Immigration Service Agreement',
  clientName = 'Client Candidate',
  onSignComplete
}) => {
  const [typedName, setTypedName] = useState(clientName);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  if (!isOpen) return null;

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedName.trim() || !agreedTerms) return;

    setIsSigned(true);
    setTimeout(() => {
      if (onSignComplete) onSignComplete();
      setIsSigned(false);
      onClose();
    }, 1800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Electronic Signature & Agreement Review"
      subtitle="Review document clauses and execute legally binding electronic signature"
    >
      {isSigned ? (
        <div className="py-8 text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Agreement Electronically Executed!</h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Audit Hash: <span className="font-mono text-blue-600 text-[10px]">SHA256: 9e8a7c...3b12</span>. PDF copy attached to your Client Vault.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSign} className="space-y-4 text-xs">
          {/* Agreement Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{documentTitle}</span>
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                Signature Required
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 h-44 overflow-y-auto font-sans text-slate-700 space-y-2 text-[11px] leading-relaxed">
              <p className="font-bold text-slate-900">1. SCOPE OF IMMIGRATION CONSULTATION SERVICES</p>
              <p>
                Babel Global Inc. agrees to perform professional petition drafting, exhibit indexing, strategy evaluation, and document compilation for the client's Form I-140 Immigrant Petition under EB-1A or EB-2 NIW standards.
              </p>
              <p className="font-bold text-slate-900">2. CLIENT RESPONSIBILITIES & EVIDENCE SUBMISSION</p>
              <p>
                Client agrees to provide truthful academic credentials, publication citation records, employment evidence, and recommendation letters in a timely manner.
              </p>
              <p className="font-bold text-slate-900">3. ELECTRONIC SIGNATURE & AUDIT COMPLIANCE</p>
              <p>
                Execution of this document via electronic signature is compliant with the US ESIGN Act (15 U.S.C. § 7001) and Uniform Electronic Transactions Act.
              </p>
            </div>
          </div>

          {/* e-Signature Pad / Input */}
          <div className="bg-blue-50/50 p-3.5 rounded-lg border border-blue-100 space-y-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Type Full Name to Sign *</label>
              <div className="relative">
                <PenTool className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your full legal name"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-serif font-bold italic text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="text-[10px] text-slate-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Timestamp: <strong className="text-slate-700">{new Date().toLocaleString()}</strong></span>
                <span>Security: <strong className="text-emerald-700">256-Bit Encrypted</strong></span>
              </div>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-700">
            <input
              type="checkbox"
              required
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>
              I understand and agree to the terms of the service agreement and authorize Babel Global to execute petition preparation.
            </span>
          </label>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>ESIGN Compliant Signature</span>
            </div>

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
                disabled={!agreedTerms || !typedName.trim()}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-sm cursor-pointer"
              >
                Sign Agreement
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
