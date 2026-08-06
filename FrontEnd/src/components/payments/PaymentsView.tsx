import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Download, 
  Plus, 
  Send,
  FileText,
  RefreshCw,
  X,
  Printer,
  ShieldCheck,
  Check,
  Building2,
  Calendar,
  User
} from 'lucide-react';
import { PaymentMilestone, CaseItem } from '../../types';
import { StatusBadge } from '../common/Badge';
import { api } from '../../services/api';

interface PaymentsViewProps {
  payments: PaymentMilestone[];
  cases: CaseItem[];
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ payments: initialPayments, cases }) => {
  const [paymentsList, setPaymentsList] = useState<PaymentMilestone[]>(initialPayments);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedInvoiceForPdf, setSelectedInvoiceForPdf] = useState<{
    invoiceNo: string;
    clientName: string;
    caseNumber: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
  } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  // Sync Form State
  const [syncCaseId, setSyncCaseId] = useState(cases[0]?.id || 'case-101');
  const [syncDescription, setSyncDescription] = useState('Milestone 3: USCIS Petition Assembly & Filing Fee');
  const [syncAmount, setSyncAmount] = useState('2500');
  const [syncDueDate, setSyncDueDate] = useState('2026-03-25');

  const totalCollected = paymentsList.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = paymentsList.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

  // Sync state when initialPayments prop changes
  React.useEffect(() => {
    setPaymentsList(initialPayments);
  }, [initialPayments]);

  // Handle Sync Zoho Invoice Submit
  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);

    try {
      const selectedCase = cases.find(c => c.id === syncCaseId) || cases[0];
      const data = await api.post('/payments', {
        caseId: syncCaseId,
        description: syncDescription,
        amount: parseFloat(syncAmount) || 2500,
        dueDate: syncDueDate,
        status: 'Pending'
      });

      if (data.success) {
        setPaymentsList([data.data, ...paymentsList]);
        setIsSyncing(false);
        setIsSyncModalOpen(false);

        setSyncSuccessMsg(`Successfully synced Zoho Books Invoice #${`INV-ZB-2026-${Math.floor(100 + Math.random() * 900)}`} for ${selectedCase.clientName}`);
        setTimeout(() => setSyncSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
      setIsSyncing(false);
    }
  };

  // Open PDF Invoice Modal
  const handleViewPdf = (payment: PaymentMilestone, idx: number) => {
    const c = cases.find(item => item.id === payment.caseId);
    const zbInvoiceNo = `INV-ZB-2026-0${891 + idx}`;
    setSelectedInvoiceForPdf({
      invoiceNo: zbInvoiceNo,
      clientName: c?.clientName || 'Dr. Elena Rostova',
      caseNumber: c?.caseNumber || 'NIW-2025-069',
      description: payment.description,
      amount: payment.amount,
      dueDate: payment.dueDate,
      status: payment.status
    });
  };

  // Print Invoice Action
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Toast Notification */}
      {syncSuccessMsg && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{syncSuccessMsg}</span>
          </div>
          <button onClick={() => setSyncSuccessMsg('')} className="text-white hover:text-emerald-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Retainers &amp; Fee Ledger</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Zoho Books Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Track retainer installments, auto-debits, Zoho Books invoices, and USCIS filing fees.
          </p>
        </div>

        <button 
          onClick={() => setIsSyncModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-blue-500"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Sync Zoho Books Invoice</span>
        </button>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Retainer Collected</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">${totalCollected.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Zoho Books Auto-Deposited</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Pending Installments (Auto-Pay)</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">${totalPending.toLocaleString()}</div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">Tied to Milestone 2 &amp; Stage 11</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">USCIS Premium Processing Fee</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">$2,965 / filing</div>
          <div className="text-[11px] text-slate-500 mt-1">Direct Form I-907 checks</div>
        </div>
      </div>

      {/* Ledger Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-sm flex items-center justify-between">
          <span>Transaction &amp; Milestone Ledger (Zoho Books Sync)</span>
          <span className="text-xs font-normal text-slate-400 font-mono hidden sm:inline">Auto-Debit: Active</span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Client &amp; Case</th>
                <th className="px-5 py-3.5">Zoho Invoice #</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paymentsList.map((p, idx) => {
                const c = cases.find(item => item.id === p.caseId);
                const zbInvoiceNo = `INV-ZB-2026-0${891 + idx}`;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {c?.clientName || 'Dr. Elena Rostova'}
                      <div className="text-[10px] text-slate-400 font-normal">{c?.caseNumber}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-bold text-blue-700">
                      {zbInvoiceNo}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">{p.description}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">${p.amount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-slate-500">{p.dueDate}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => handleViewPdf(p, idx)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 flex items-center gap-1.5 ml-auto cursor-pointer transition-all shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>PDF Invoice</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {paymentsList.map((p, idx) => {
            const c = cases.find(item => item.id === p.caseId);
            return (
              <div key={p.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{c?.clientName || 'Dr. Elena Rostova'}</h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c?.caseNumber}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="text-xs text-slate-700 font-medium leading-snug">
                  {p.description}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Amount &amp; Due Date</span>
                    <span className="font-extrabold text-slate-900 text-sm">${p.amount.toLocaleString()}</span>
                    <span className="text-[11px] text-slate-500 ml-1.5">• Due {p.dueDate}</span>
                  </div>

                  <button 
                    onClick={() => handleViewPdf(p, idx)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF Invoice</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 1: SYNC ZOHO BOOKS INVOICE MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-4 sm:p-5 text-white flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600/80 border border-blue-400/40 flex items-center justify-center font-bold shrink-0">
                  <RefreshCw className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm sm:text-base leading-tight">Sync Zoho Books Invoice</h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug truncate">Pull or generate retainer installment in Zoho Books</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSyncModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSyncSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="min-w-0">
                <label className="block text-slate-700 font-bold mb-1">Select Client Case *</label>
                <select
                  value={syncCaseId}
                  onChange={(e) => setSyncCaseId(e.target.value)}
                  className="w-full max-w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 truncate"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.clientName} ({c.caseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Invoice Description / Milestone *</label>
                <input
                  type="text"
                  required
                  value={syncDescription}
                  onChange={(e) => setSyncDescription(e.target.value)}
                  placeholder="e.g. Milestone 2: Recommendation Letters & Drafting"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount ($ USD) *</label>
                  <input
                    type="number"
                    required
                    value={syncAmount}
                    onChange={(e) => setSyncAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={syncDueDate}
                    onChange={(e) => setSyncDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 sm:p-3.5 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-2.5 text-[11px] text-blue-900 leading-snug">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                <span>
                  Automatically posts to Zoho Books organization account and sends email invoice link to client.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSyncModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Syncing API...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-amber-300" />
                      <span>Confirm &amp; Sync Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          MODAL 2: OFFICIAL PDF INVOICE VIEWER MODAL
      ══════════════════════════════════════════════════════════════════════════ */}
      {selectedInvoiceForPdf && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Top Toolbar */}
            <div className="bg-slate-900 px-4 sm:px-6 py-3 sm:py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm truncate">Official Invoice ({selectedInvoiceForPdf.invoiceNo})</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={handlePrintPdf}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button 
                  onClick={() => setSelectedInvoiceForPdf(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Invoice Printable Body */}
            <div className="p-4 sm:p-8 space-y-6 overflow-y-auto bg-white font-sans text-xs">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-blue-600 shrink-0" />
                    <span className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">BABEL GLOBAL LEGAL SERVICES INC.</span>
                  </div>
                  <p className="text-slate-500 mt-1">100 Pennsylvania Ave NW, Suite 800</p>
                  <p className="text-slate-500">Washington, D.C. 20004, United States</p>
                  <p className="text-slate-500 font-mono mt-1">EIN / Tax ID: 84-2938104 | billing@babelglobal.com</p>
                </div>

                <div className="sm:text-right">
                  <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 font-extrabold text-sm rounded-lg">
                    INVOICE
                  </span>
                  <p className="font-mono text-sm font-bold text-slate-800 mt-2">{selectedInvoiceForPdf.invoiceNo}</p>
                  <p className="text-slate-500 mt-1">Date: March 1, 2026</p>
                  <p className="text-slate-500">Due Date: {selectedInvoiceForPdf.dueDate}</p>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Billed To (Client):</span>
                  <h4 className="font-bold text-slate-900 text-sm">{selectedInvoiceForPdf.clientName}</h4>
                  <p className="text-slate-600 font-mono text-[11px]">Case Ref: {selectedInvoiceForPdf.caseNumber}</p>
                  <p className="text-slate-500 mt-0.5">Category: EB-2 NIW / EB-1A Alien of Extraordinary Ability</p>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Payment Status:</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedInvoiceForPdf.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {selectedInvoiceForPdf.status}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-2">Payment Gateway: Zoho Books Stripe &amp; ACH Sync</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden min-w-[400px]">
                  <thead className="bg-slate-100 font-bold text-slate-700 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    <tr>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{selectedInvoiceForPdf.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Professional legal petition drafting, exhibit auditing &amp; USCIS filing preparation</p>
                      </td>
                      <td className="p-3 text-right font-medium">1</td>
                      <td className="p-3 text-right font-medium">${selectedInvoiceForPdf.amount.toLocaleString()}</td>
                      <td className="p-3 text-right font-extrabold text-slate-900">${selectedInvoiceForPdf.amount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-4 pt-2">
                <div className="text-[11px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-700">Payment Terms &amp; Instructions:</p>
                  <p>1. Payments are auto-deposited via Stripe / ACH Direct debit.</p>
                  <p>2. USCIS filing fee checks ($2,965 I-907 &amp; $715 I-140) are remitted directly to US Dept of Homeland Security.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right space-y-1.5 w-full sm:w-64">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${selectedInvoiceForPdf.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (0% Legal Exemption):</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-200 pt-2">
                    <span>Total Due:</span>
                    <span className="text-blue-700">${selectedInvoiceForPdf.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Toolbar */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-[11px] text-slate-500 font-mono truncate">Doc Hash: #ZB-{Math.floor(100000 + Math.random() * 900000)}</span>
              <button
                onClick={() => setSelectedInvoiceForPdf(null)}
                className="px-4 sm:px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
