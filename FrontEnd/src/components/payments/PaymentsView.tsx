import React, { useState, useEffect } from 'react';
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
  User,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { PaymentMilestone, CaseItem } from '../../types';
import { StatusBadge } from '../common/Badge';
import { api } from '../../services/api';

interface PaymentsViewProps {
  payments?: PaymentMilestone[];
  cases?: CaseItem[];
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ payments: initialPayments = [], cases: initialCases = [] }) => {
  const [paymentsList, setPaymentsList] = useState<PaymentMilestone[]>(initialPayments);
  const [casesList, setCasesList] = useState<CaseItem[]>(initialCases);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedInvoiceForPdf, setSelectedInvoiceForPdf] = useState<{
    invoiceNo: string;
    clientName: string;
    caseNumber: string;
    description: string;
    amount: number;
    dueDate: string;
    status: string;
    paidAt?: string | null;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [syncErrorMsg, setSyncErrorMsg] = useState('');

  // Sync Form State
  const [syncCaseId, setSyncCaseId] = useState(initialCases[0]?.id || '');
  const [syncDescription, setSyncDescription] = useState('Milestone 1: Retainer & Dhanasar Strategy Draft');
  const [syncAmount, setSyncAmount] = useState('2500');
  const [syncDueDate, setSyncDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [syncStatus, setSyncStatus] = useState<'Pending' | 'Paid'>('Pending');

  // Delete State
  const [paymentToDelete, setPaymentToDelete] = useState<PaymentMilestone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status updating state
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Fetch live payments and cases from database
  const loadPaymentsAndCasesFromDb = async () => {
    setIsLoading(true);
    setFetchError('');
    try {
      const [paymentsRes, casesRes] = await Promise.all([
        api.get('/payments'),
        api.get('/cases')
      ]);

      if (paymentsRes.success && Array.isArray(paymentsRes.data)) {
        setPaymentsList(paymentsRes.data);
      } else {
        setPaymentsList([]);
      }

      if (casesRes.success && Array.isArray(casesRes.data)) {
        setCasesList(casesRes.data);
        if (casesRes.data.length > 0 && !syncCaseId) {
          setSyncCaseId(casesRes.data[0].id);
        }
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load payments from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentsAndCasesFromDb();
  }, []);

  useEffect(() => {
    if (casesList.length > 0 && !syncCaseId) {
      setSyncCaseId(casesList[0].id);
    }
  }, [casesList, syncCaseId]);

  const totalCollected = paymentsList.filter(p => p.status === 'Paid').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPending = paymentsList.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalInvoiced = totalCollected + totalPending;

  // Create Invoice in Real DB
  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncCaseId) {
      setSyncErrorMsg('Please select a client case.');
      return;
    }

    setIsSubmitting(true);
    setSyncErrorMsg('');
    try {
      const payload = {
        caseId: syncCaseId,
        description: syncDescription.trim(),
        amount: parseFloat(syncAmount) || 2500,
        dueDate: syncDueDate,
        status: syncStatus
      };

      const res = await api.post('/payments', payload);
      if (res.success && res.data) {
        setIsSyncModalOpen(false);
        await loadPaymentsAndCasesFromDb();
        const selectedCase = casesList.find(c => c.id === syncCaseId);
        setSyncSuccessMsg(`Successfully saved Invoice in database for ${selectedCase?.clientName || 'Candidate'}`);
        setTimeout(() => setSyncSuccessMsg(''), 4000);
      } else {
        setSyncErrorMsg(res.error || 'Failed to record payment in database.');
      }
    } catch (err: any) {
      setSyncErrorMsg(err.message || 'Connection error while saving payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle / Update Payment Status
  const handleToggleStatus = async (payment: PaymentMilestone) => {
    const nextStatus = payment.status === 'Paid' ? 'Pending' : 'Paid';
    setUpdatingId(payment.id);
    try {
      const res = await api.put(`/payments/${payment.id}`, { status: nextStatus });
      if (res.success) {
        setPaymentsList(prev => prev.map(p => p.id === payment.id ? { ...p, status: nextStatus } : p));
      } else {
        alert(res.error || 'Failed to update payment status in database.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status in database.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Payment from Real DB
  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/payments/${paymentToDelete.id}`);
      if (res.success || res.status === 200) {
        setPaymentsList(prev => prev.filter(p => p.id !== paymentToDelete.id));
        setPaymentToDelete(null);
      } else {
        alert(res.error || 'Failed to delete payment from database.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting payment from database.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open PDF Invoice Modal
  const handleViewPdf = (payment: PaymentMilestone, idx: number) => {
    const c = casesList.find(item => item.id === payment.caseId);
    const zbInvoiceNo = `INV-ZB-2026-0${891 + idx}`;
    setSelectedInvoiceForPdf({
      invoiceNo: zbInvoiceNo,
      clientName: (payment as any).clientName || c?.clientName || 'Candidate',
      caseNumber: (payment as any).caseNumber || c?.caseNumber || 'NIW-2026-001',
      description: payment.description,
      amount: payment.amount,
      dueDate: payment.dueDate,
      status: payment.status,
      paidAt: (payment as any).paidAt
    });
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

      {/* Fetch Error Banner */}
      {fetchError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button 
            onClick={loadPaymentsAndCasesFromDb}
            className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-lg hover:bg-rose-700 cursor-pointer"
          >
            Retry
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
              Live Database Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Track retainer installments, auto-debits, Zoho Books invoices, and USCIS filing fees synced with MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPaymentsAndCasesFromDb}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            title="Refresh payments from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button 
            onClick={() => {
              setSyncErrorMsg('');
              setIsSyncModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 border border-blue-500"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Create &amp; Sync Invoice</span>
          </button>
        </div>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Retainer Collected</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">${totalCollected.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Auto-Deposited in Live DB</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Pending Installments (Auto-Pay)</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">${totalPending.toLocaleString()}</div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">Tied to Milestone 2 &amp; Filing Stage</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Invoiced (Receivables)</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">${totalInvoiced.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {paymentsList.length === 0 ? 'No invoices generated yet' : `Across ${paymentsList.length} total invoice records`}
          </div>
        </div>
      </div>

      {/* Ledger Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Transaction &amp; Milestone Ledger</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
              {paymentsList.length} {paymentsList.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>
          <span className="text-xs font-normal text-emerald-600 font-mono hidden sm:inline">● Real DB Connected</span>
        </div>

        {/* Loading State */}
        {isLoading && paymentsList.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading ledger records from database...</p>
          </div>
        )}

        {/* Desktop Table View */}
        {!isLoading && (
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
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentsList.map((p, idx) => {
                  const c = casesList.find(item => item.id === p.caseId);
                  const clientDisplayName = (p as any).clientName || c?.clientName || 'Candidate';
                  const caseNum = (p as any).caseNumber || c?.caseNumber || 'NIW-2026';
                  const zbInvoiceNo = `INV-ZB-2026-0${891 + idx}`;
                  const isUpdating = updatingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {clientDisplayName}
                        <div className="text-[10px] text-slate-400 font-normal">{caseNum}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-blue-700">
                        {zbInvoiceNo}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">{p.description}</td>
                      <td className="px-5 py-4 font-bold text-slate-900">${(Number(p.amount) || 0).toLocaleString()}</td>
                      <td className="px-5 py-4 text-slate-500">{p.dueDate}</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          disabled={isUpdating}
                          className="cursor-pointer group flex items-center gap-1.5 focus:outline-none"
                          title="Click to toggle status (Paid / Pending)"
                        >
                          <StatusBadge status={p.status} />
                          {isUpdating && <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleViewPdf(p, idx)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                            title="View / Print PDF invoice"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-600" />
                            <span>PDF Invoice</span>
                          </button>
                          <button
                            onClick={() => setPaymentToDelete(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Delete invoice record from database"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile View Cards */}
        {!isLoading && (
          <div className="block md:hidden divide-y divide-slate-100">
            {paymentsList.map((p, idx) => {
              const c = casesList.find(item => item.id === p.caseId);
              const clientDisplayName = (p as any).clientName || c?.clientName || 'Candidate';
              const caseNum = (p as any).caseNumber || c?.caseNumber || 'NIW-2026';

              return (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">{clientDisplayName}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{caseNum}</p>
                    </div>
                    <button onClick={() => handleToggleStatus(p)} className="cursor-pointer">
                      <StatusBadge status={p.status} />
                    </button>
                  </div>

                  <div className="text-xs text-slate-700 font-medium leading-snug">
                    {p.description}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Amount &amp; Due Date</span>
                      <span className="font-extrabold text-slate-900 text-sm">${(Number(p.amount) || 0).toLocaleString()}</span>
                      <span className="text-[11px] text-slate-500 ml-1.5">• Due {p.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleViewPdf(p, idx)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => setPaymentToDelete(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && paymentsList.length === 0 && (
          <div className="p-10 sm:p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">No Payment Records in Database</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                No invoices or retainer milestones have been created yet. Click "Create &amp; Sync Invoice" to record one in the database.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSyncErrorMsg('');
                  setIsSyncModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Invoice</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE / SYNC ZOHO BOOKS INVOICE MODAL */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base leading-tight">Create &amp; Sync Invoice</h3>
                    <p className="text-xs text-blue-100 mt-0.5 leading-snug truncate">Save retainer installment to database &amp; Zoho Books</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSyncModalOpen(false)}
                  className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {syncErrorMsg && (
              <div className="m-5 mb-0 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{syncErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreatePayment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Client / Case *</label>
                <select 
                  value={syncCaseId} 
                  onChange={(e) => setSyncCaseId(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  {casesList.length === 0 && <option value="">No active cases found in database</option>}
                  {casesList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.clientName || 'Candidate'} - {c.caseNumber} ({c.petitionCategory})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Retainer Milestone Description *</label>
                <input 
                  type="text" 
                  value={syncDescription} 
                  onChange={(e) => setSyncDescription(e.target.value)}
                  required
                  placeholder="e.g. Milestone 1: Initial Retainer & Strategy Brief"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Amount ($ USD) *</label>
                  <input 
                    type="number" 
                    value={syncAmount} 
                    onChange={(e) => setSyncAmount(e.target.value)}
                    required
                    min="1"
                    placeholder="2500"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Due Date *</label>
                  <input 
                    type="date" 
                    value={syncDueDate} 
                    onChange={(e) => setSyncDueDate(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Payment Status</label>
                <select
                  value={syncStatus}
                  onChange={(e) => setSyncStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending (Awaiting Client Payment)</option>
                  <option value="Paid">Paid (Already Collected)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsSyncModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || casesList.length === 0}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to DB...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE CONFIRMATION MODAL */}
      {paymentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Payment Invoice</h3>
                <p className="text-xs text-slate-500">Database Record Permanent Removal</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              Are you sure you want to permanently delete this invoice for <strong className="text-slate-900 font-bold">${paymentToDelete.amount.toLocaleString()}</strong> ({paymentToDelete.description})?
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPaymentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeletePayment}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW & PRINT PDF INVOICE MODAL */}
      {selectedInvoiceForPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 text-xs">Official Retainer Invoice • {selectedInvoiceForPdf.invoiceNo}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button 
                  onClick={() => setSelectedInvoiceForPdf(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-slate-800 text-xs">
              <div className="flex items-start justify-between border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">BABEL GLOBAL</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Immigration Legal Petition Editorial Group</p>
                  <p className="text-[10px] text-slate-400 mt-1">100 Federal Street, Suite 2900, Boston, MA 02110</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Invoice Number</span>
                  <div className="font-mono font-black text-sm text-blue-700">{selectedInvoiceForPdf.invoiceNo}</div>
                  <div className="mt-1">
                    <StatusBadge status={selectedInvoiceForPdf.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Billed To</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedInvoiceForPdf.clientName}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">Case: {selectedInvoiceForPdf.caseNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Invoice Details</span>
                  <div className="text-[11px] text-slate-600">Issued: <strong className="text-slate-800">2026-03-01</strong></div>
                  <div className="text-[11px] text-slate-600">Due Date: <strong className="text-slate-800">{selectedInvoiceForPdf.dueDate}</strong></div>
                </div>
              </div>

              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{selectedInvoiceForPdf.description}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">EB-2 National Interest Waiver Professional Legal Drafting Retainer</div>
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 text-sm">
                      ${selectedInvoiceForPdf.amount.toLocaleString()}.00
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td className="p-3 text-right text-slate-600">Total Invoice Balance:</td>
                    <td className="p-3 text-right text-base font-black text-blue-700">
                      ${selectedInvoiceForPdf.amount.toLocaleString()}.00 USD
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
